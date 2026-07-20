import express from "express";
import path from "path";
import dotenv from "dotenv";
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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. Chat Arena Endpoint
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

// 2. Image Studio Endpoint
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
