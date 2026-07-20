import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies up to 50MB for any large data transfers
app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// MEXC Live API base configurations
const MEXC_BASE_URL = "https://api.mexc.com";

/**
 * Calculates time offset between MEXC Server and local system
 */
async function getMexcServerTimeOffset(): Promise<number> {
  try {
    const start = Date.now();
    const res = await fetch(`${MEXC_BASE_URL}/api/v3/time`);
    if (!res.ok) throw new Error(`Could not reach MEXC API server: ${res.statusText}`);
    const data: any = await res.json();
    const end = Date.now();
    const rtt = (end - start) / 2;
    const serverTime = data.serverTime;
    // Difference between MEXC's official time and local system time
    return serverTime - (start + rtt);
  } catch (error) {
    console.error("Failed to synchronize with MEXC server time, using offset 0:", error);
    return 0;
  }
}

/**
 * Formats a query string and signs it using HMAC-SHA256 with the secret key
 */
function generateSignature(queryString: string, secretKey: string): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(queryString)
    .digest("hex");
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. MEXC Spot Tickers Endpoint (Public)
app.get("/api/mexc/tickers", async (req, res) => {
  try {
    const symbolsQuery = req.query.symbols as string; // Optional filter, e.g. ["BTCUSDT","ETHUSDT","MXUSDT"]
    let url = `${MEXC_BASE_URL}/api/v3/ticker/price`;
    if (symbolsQuery) {
      url += `?symbols=${encodeURIComponent(symbolsQuery)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MEXC Ticker response failed: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/mexc/tickers:", error);
    res.status(500).json({ error: error.message || "Failed to fetch market ticker prices from MEXC." });
  }
});

// Helper to extract keys from Headers or fallback to process.env
function getMexcCredentials(req: express.Request) {
  const clientKey = req.headers["x-mexc-client-key"] as string;
  const clientSecret = req.headers["x-mexc-client-secret"] as string;

  const finalKey = clientKey || process.env.MEXC_API_KEY;
  const finalSecret = clientSecret || process.env.MEXC_SECRET_KEY;

  return {
    apiKey: finalKey,
    apiSecret: finalSecret,
    isUsingCustom: !!clientKey
  };
}

// 2. MEXC Account Balances Endpoint (Private)
app.get("/api/mexc/account", async (req, res) => {
  try {
    const { apiKey, apiSecret } = getMexcCredentials(req);

    if (!apiKey || !apiSecret) {
      res.status(401).json({
        error: "Missing MEXC API credentials. Please configure your MEXC_API_KEY and MEXC_SECRET_KEY in Environment Settings, or fill in the secure credentials panel on the dashboard.",
        code: "CREDENTIALS_MISSING"
      });
      return;
    }

    // Get time offset to align with MEXC security bounds
    const timeOffset = await getMexcServerTimeOffset();
    const timestamp = Date.now() + timeOffset;

    // Build signed query
    const queryString = `timestamp=${timestamp}&recvWindow=60000`;
    const signature = generateSignature(queryString, apiSecret);
    const finalUrl = `${MEXC_BASE_URL}/api/v3/account?${queryString}&signature=${signature}`;

    console.log(`Fetching MEXC account info with timestamp: ${timestamp} (Offset: ${timeOffset}ms)`);

    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "X-MEXC-APIKEY": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.msg || errorData.message || `MEXC API error (HTTP ${response.status})`;
      res.status(response.status).json({
        error: errMsg,
        raw: errorData
      });
      return;
    }

    const data = await response.json();
    res.json({
      balances: data.balances || [],
      canTrade: data.canTrade,
      accountType: data.accountType,
      timestamp: timestamp
    });
  } catch (error: any) {
    console.error("Error in /api/mexc/account:", error);
    res.status(500).json({ error: error.message || "Failed to fetch account info from MEXC." });
  }
});

// 3. MEXC Order Placement Endpoint (Private)
app.post("/api/mexc/order", async (req, res) => {
  try {
    const { apiKey, apiSecret } = getMexcCredentials(req);
    const { symbol, side, type, quantity, price } = req.body;

    if (!apiKey || !apiSecret) {
      res.status(401).json({
        error: "Missing MEXC API credentials. Configure MEXC_API_KEY and MEXC_SECRET_KEY.",
        code: "CREDENTIALS_MISSING"
      });
      return;
    }

    if (!symbol || !side || !type || !quantity) {
      res.status(400).json({ error: "Missing required order parameters: symbol, side, type, quantity." });
      return;
    }

    // Sanitize values
    const upperSymbol = symbol.toUpperCase().trim();
    const upperSide = side.toUpperCase().trim();
    const upperType = type.toUpperCase().trim();

    // Sync time with MEXC Server
    const timeOffset = await getMexcServerTimeOffset();
    const timestamp = Date.now() + timeOffset;

    // Create parameters
    const params: Record<string, string> = {
      symbol: upperSymbol,
      side: upperSide,
      type: upperType,
      quantity: quantity.toString(),
      timestamp: timestamp.toString(),
      recvWindow: "60000"
    };

    if (upperType === "LIMIT") {
      if (!price) {
        res.status(400).json({ error: "Limit orders require a price parameter." });
        return;
      }
      params.price = price.toString();
      params.timeInForce = "GTC"; // Good Til Cancelled is standard for spot limit orders
    }

    // Build sorted/serialized query string
    const queryParts = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    const queryString = queryParts.join("&");
    const signature = generateSignature(queryString, apiSecret);

    const finalUrl = `${MEXC_BASE_URL}/api/v3/order?${queryString}&signature=${signature}`;

    console.log(`Placing MEXC ${upperType} ${upperSide} order for ${upperSymbol} qty: ${quantity}`);

    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "X-MEXC-APIKEY": apiKey,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data.msg || data.message || `MEXC API error (HTTP ${response.status})`;
      res.status(response.status).json({
        error: errMsg,
        raw: data,
        parametersSent: params
      });
      return;
    }

    res.json({
      success: true,
      order: data,
      timestamp: timestamp
    });
  } catch (error: any) {
    console.error("Error in /api/mexc/order:", error);
    res.status(500).json({ error: error.message || "Failed to execute order on MEXC." });
  }
});

// 4. Chat Arena Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, chatbotId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid messages array" });
      return;
    }

    // Determine model and system instructions based on chatbotId
    let modelName = "gemini-3.5-flash";
    let systemInstruction = "You are a helpful AI assistant.";

    if (chatbotId === "sage") {
      modelName = "gemini-3.1-pro-preview";
      systemInstruction = `You are "Sage", a meticulous senior software engineer, expert coder, and deep logical thinker. 
Your goal is to provide deep, flawless technical breakdowns, write pristine production-ready code with comments, and solve complex logic, math, or reasoning problems step-by-step. 
Adopt an intellectual, professional, and thorough tone. Show your work clearly.`;
    } else if (chatbotId === "nova") {
      modelName = "gemini-3.5-flash";
      systemInstruction = `You are "Nova", a friendly, creative, and highly adaptable general-knowledge companion. 
You excel at creative writing, summarization, brainstorming, and explaining complex concepts in simple, analogies-rich terms. 
Adopt an encouraging, warm, engaging, and conversation-friendly tone. Keep responses helpful and clear.`;
    } else if (chatbotId === "sonic") {
      modelName = "gemini-3.1-flash-lite";
      systemInstruction = `You are "Sonic", an ultra-fast, snappy, and high-efficiency responder. 
Your job is to answer questions at extreme speed. Keep your answers ultra-concise, using punchy bullet points, quick answers, and minimal fluff. 
Adopt a high-energy, direct, and fast-paced tone. Answer briefly but correctly.`;
    }

    // Format history for Google GenAI SDK contents
    // Each message is: { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: chatbotId === "sonic" ? 0.2 : 0.7,
      },
    });

    const replyText = response.text || "No response text generated.";

    res.json({
      content: replyText,
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating a response from Gemini.",
    });
  }
});

// 5. Image Studio Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, imageSize, aspectRatio } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing prompt for image generation" });
      return;
    }

    const size = imageSize || "1K"; // "1K", "2K", "4K"
    const ratio = aspectRatio || "1:1"; // "1:1", "16:9", etc.

    console.log(`Generating image. Model: gemini-3-pro-image-preview. Prompt: "${prompt}", Size: ${size}, Aspect Ratio: ${ratio}`);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: ratio,
          imageSize: size,
        },
      },
    });

    let base64Image = "";
    let caption = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          caption = part.text;
        }
      }
    }

    if (!base64Image) {
      res.status(500).json({ error: "No image data returned from the Gemini model." });
      return;
    }

    res.json({
      imageUrl: `data:image/png;base64,${base64Image}`,
      caption: caption || undefined,
      parameters: {
        model: "gemini-3-pro-image-preview",
        size,
        aspectRatio: ratio,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({
      error: error.message || "An error occurred during image generation with Gemini.",
    });
  }
});

// Mount Vite middleware for asset serving in dev, or serve static dist in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
