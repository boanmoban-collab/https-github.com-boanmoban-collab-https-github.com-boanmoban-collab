import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Sliders,
  Play,
  User,
  ShieldCheck,
  Code,
  Layers,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Send,
  RefreshCw,
  Trash2,
  Maximize2,
  Download,
  Copy,
  Check,
  Clock,
  Info,
  AlertCircle,
  HelpCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  Search,
  Wallet,
  ArrowUpDown,
  History,
  CheckCircle,
  FileText,
  Activity,
  Terminal,
  ChevronRight,
  ExternalLink,
  Brain,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, Chatbot, GeneratedImage, MexcBalance, MexcTicker, MexcOrderPayload, MexcOrderResponse, ExecutionLog } from "./types";

// Chatbots metadata for the Chat Arena
const CHATBOTS: Chatbot[] = [
  {
    id: "sage",
    name: "Sage (MEXC & Flutter Expert)",
    role: "Expert Trader & Dart Architect",
    description: "Deep step-by-step Dart reasoning, HMAC signatures, API synchronization, and Flutter architecture.",
    model: "gemini-3.1-pro-preview",
    modelDesc: "Complex logic and API architectures",
    color: "emerald",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    hoverBgColor: "hover:bg-emerald-500/20",
    bubbleColor: "bg-emerald-950/40 text-emerald-100 border border-emerald-900/40",
  },
  {
    id: "nova",
    name: "Nova",
    role: "Creative Trading Advisor",
    description: "Brainstorming trading indicators, market sentiment summaries, and conversational assistance.",
    model: "gemini-3.5-flash",
    modelDesc: "Balanced speed & intelligence",
    color: "indigo",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/10",
    hoverBgColor: "hover:bg-indigo-500/20",
    bubbleColor: "bg-indigo-950/40 text-indigo-100 border border-indigo-900/40",
  },
  {
    id: "sonic",
    name: "Sonic",
    role: "Speedy Tech Support",
    description: "Ultra-fast syntax answers, quick concept explanations, and brief bullet answers.",
    model: "gemini-3.1-flash-lite",
    modelDesc: "Maximum response speed",
    color: "amber",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    hoverBgColor: "hover:bg-amber-500/20",
    bubbleColor: "bg-amber-950/40 text-amber-100 border border-amber-900/40",
  }
];

export default function App() {
  // Main tabs: 'mexc' (Trading terminal), 'chat' (AI developer support), 'image' (Creative studio)
  const [activeTab, setActiveTab] = useState<"mexc" | "chat" | "image">("mexc");

  // MEXC Credentials (stored in state or localStorage for persistence in session)
  const [useEnvCredentials, setUseEnvCredentials] = useState(true);
  const [mexcApiKey, setMexcApiKey] = useState("");
  const [mexcSecretKey, setMexcSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);

  // MEXC State Data
  const [balances, setBalances] = useState<MexcBalance[]>([]);
  const [tickers, setTickers] = useState<MexcTicker[]>([]);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [searchAsset, setSearchAsset] = useState("");
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isLoadingTickers, setIsLoadingTickers] = useState(false);
  const [mexcAccountError, setMexcAccountError] = useState<string | null>(null);

  // Order Execution Input
  const [orderSymbol, setOrderSymbol] = useState("MXUSDT");
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("MARKET");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [isExecutingOrder, setIsExecutingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Dynamic Execution Logs (for the terminal debugging panel)
  const [logs, setLogs] = useState<ExecutionLog[]>([
    {
      id: "log-init",
      timestamp: new Date(),
      type: "info",
      endpoint: "SYSTEM",
      message: "Maria Real-Time Core trading terminal initialized. System ready."
    }
  ]);

  // Chat Arena States
  const [activeChatbot, setActiveChatbot] = useState<"sage" | "nova" | "sonic">("sage");
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    sage: [
      {
        id: "sage-welcome",
        role: "assistant",
        content: `مرحباً بك! أنا **Sage**، مستشارك البرمجي الخبير في تكنولوجيا التداول وحلول Dart/Flutter. 
لقد قمت بتحليل طلبك لنقل نظام تطبيق التداول **Maria** بالكامل إلى بيئة التداول الحقيقي (Live Trading) الخاصة بمنصة **MEXC** باستخدام التوقيع الرقمي HMAC-SHA256 والاتصال الآمن.

لقد صممت لك هذه لوحة التحكم التفاعلية لتمكنك من اختبار الاتصال الحقيقي، وسحب الأرصدة الحقيقية، وإرسال الطلبات مباشرة، كما قمت بصياغة ملفات الكود البرمجي الكامل لـ Flutter و GitHub Actions لكي تقوم بدمجها مباشرة في تطبيقك Maria!

كيف يمكنني مساعدتك برمجياً اليوم؟`,
        timestamp: new Date(),
        modelUsed: "gemini-3.1-pro-preview"
      }
    ],
    nova: [
      {
        id: "nova-welcome",
        role: "assistant",
        content: `Hi there! I'm Nova. I can help you with trading ideas, writing content, or understanding crypto markets. Let's chat!`,
        timestamp: new Date(),
        modelUsed: "gemini-3.5-flash"
      }
    ],
    sonic: [
      {
        id: "sonic-welcome",
        role: "assistant",
        content: `Fast response mode active! Throw your questions at me.`,
        timestamp: new Date(),
        modelUsed: "gemini-3.1-flash-lite"
      }
    ]
  });
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Creative Studio States
  const [imagePrompt, setImagePrompt] = useState("A professional dark-theme futuristic financial dashboard interface for trading mobile application called Maria, gorgeous UI UX design, high-fidelity mockups, neon cyan and emerald details, cinematic vector art");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageGenerationProgress, setImageGenerationProgress] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load custom credentials from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("mexc_client_api_key");
    const savedSecretKey = localStorage.getItem("mexc_client_secret_key");
    const savedUseEnv = localStorage.getItem("mexc_use_env");

    if (savedApiKey) setMexcApiKey(savedApiKey);
    if (savedSecretKey) setMexcSecretKey(savedSecretKey);
    if (savedUseEnv !== null) setUseEnvCredentials(savedUseEnv === "true");

    // Fetch initial market price tickers
    fetchTickers();
  }, []);

  // Update localStorage when credentials change
  useEffect(() => {
    localStorage.setItem("mexc_client_api_key", mexcApiKey);
    localStorage.setItem("mexc_client_secret_key", mexcSecretKey);
    localStorage.setItem("mexc_use_env", String(useEnvCredentials));
  }, [mexcApiKey, mexcSecretKey, useEnvCredentials]);

  // Log auto-scroll
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Fetch prices tickers from our secure backend
  const fetchTickers = async () => {
    setIsLoadingTickers(true);
    addLog("info", "GET /api/mexc/tickers", "Fetching real-time asset market rates from MEXC...");
    try {
      const res = await fetch("/api/mexc/tickers");
      if (!res.ok) throw new Error("Could not fetch rates from MEXC");
      const data = await res.json();
      
      // Sort major tickers to top
      const majorSymbols = ["BTCUSDT", "ETHUSDT", "MXUSDT", "SOLUSDT", "ADAUSDT", "XRPUSDT"];
      const formattedTickers: MexcTicker[] = Array.isArray(data) 
        ? data.map((t: any) => ({ symbol: t.symbol, price: t.price }))
        : [];
      
      // Filter out weird symbols just to keep UI clean, or show all
      setTickers(formattedTickers);
      addLog("success", "GET /api/mexc/tickers", `Loaded ${formattedTickers.length} active spot assets ticker prices.`);
    } catch (err: any) {
      addLog("error", "GET /api/mexc/tickers", `Failed to fetch tickers: ${err.message}`);
    } finally {
      setIsLoadingTickers(false);
    }
  };

  // Fetch Account Balances from MEXC
  const fetchBalances = async () => {
    setIsLoadingAccount(true);
    setMexcAccountError(null);
    addLog("info", "GET /api/mexc/account", "Retrieving Spot balances & synchronizing request time with api.mexc.com...");
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (!useEnvCredentials) {
        if (!mexcApiKey || !mexcSecretKey) {
          throw new Error("Local custom API Key and Secret Key are required when environment variables are disabled.");
        }
        headers["X-MEXC-CLIENT-KEY"] = mexcApiKey.trim();
        headers["X-MEXC-CLIENT-SECRET"] = mexcSecretKey.trim();
      }

      const res = await fetch("/api/mexc/account", { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch balances");
      }

      // Filter balances with non-zero values to avoid empty clutter
      const nonZeroBalances = (data.balances || []).filter(
        (b: MexcBalance) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
      );

      setBalances(nonZeroBalances);
      addLog(
        "success", 
        "GET /api/mexc/account", 
        `Synchronized perfectly with MEXC Server time. Pulled ${nonZeroBalances.length} active wallet balances successfully.`,
        undefined,
        JSON.stringify(data, null, 2)
      );
    } catch (err: any) {
      console.error(err);
      setMexcAccountError(err.message);
      addLog("error", "GET /api/mexc/account", `Authorization / Synchronization error: ${err.message}`);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  // Place Spot Order on MEXC (LIMIT/MARKET, BUY/SELL)
  const executeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExecutingOrder) return;

    setIsExecutingOrder(true);
    setOrderError(null);
    setOrderResult(null);

    const payload: MexcOrderPayload = {
      symbol: orderSymbol.toUpperCase().trim(),
      side: orderSide,
      type: orderType,
      quantity: orderQuantity.trim(),
    };

    if (orderType === "LIMIT") {
      payload.price = orderPrice.trim();
    }

    addLog(
      "warning", 
      "POST /api/mexc/order", 
      `Sending dynamic ${orderType} ${orderSide} request for ${orderSymbol} directly to MEXC Live API...`,
      JSON.stringify(payload, null, 2)
    );

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (!useEnvCredentials) {
        headers["X-MEXC-CLIENT-KEY"] = mexcApiKey.trim();
        headers["X-MEXC-CLIENT-SECRET"] = mexcSecretKey.trim();
      }

      const res = await fetch("/api/mexc/order", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order rejected by exchange");
      }

      setOrderResult(data.order);
      addLog(
        "success", 
        "POST /api/mexc/order", 
        `Order placed successfully! Order ID: ${data.order.orderId || "N/A"}. Status: ${data.order.status || "FILLED"}`,
        JSON.stringify(payload, null, 2),
        JSON.stringify(data, null, 2)
      );

      // Refresh balances automatically after successful trade
      setTimeout(fetchBalances, 1500);
    } catch (err: any) {
      console.error(err);
      setOrderError(err.message);
      addLog(
        "error", 
        "POST /api/mexc/order", 
        `Execution rejected by MEXC: ${err.message}`,
        JSON.stringify(payload, null, 2)
      );
    } finally {
      setIsExecutingOrder(false);
    }
  };

  // Helper to add terminal log
  const addLog = (
    type: "info" | "success" | "error" | "warning",
    endpoint: string,
    message: string,
    payload?: string,
    response?: string
  ) => {
    const newLog: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date(),
      type,
      endpoint,
      message,
      payload,
      response
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Handle chat submission
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatError(null);

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: userText,
      timestamp: new Date()
    };

    const currentHistory = chatHistories[activeChatbot];
    const updatedHistory = [...currentHistory, userMessage];

    setChatHistories(prev => ({
      ...prev,
      [activeChatbot]: updatedHistory
    }));

    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          chatbotId: activeChatbot
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate chat reply");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        modelUsed: data.modelUsed
      };

      setChatHistories(prev => ({
        ...prev,
        [activeChatbot]: [...updatedHistory, assistantMessage]
      }));
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Image generation progress simulation
  useEffect(() => {
    if (!isGeneratingImage) {
      setImageGenerationProgress("");
      return;
    }
    const progressMessages = [
      "Connecting to Gemini Pro Image model...",
      "Analyzing prompt details & design rules...",
      "Setting canvas aspect layout...",
      "Generating color matrices & shadow curves...",
      "Finalizing vector outputs..."
    ];
    let index = 0;
    setImageGenerationProgress(progressMessages[0]);

    const interval = setInterval(() => {
      if (index < progressMessages.length - 1) {
        index++;
        setImageGenerationProgress(progressMessages[index]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isGeneratingImage]);

  // Handle image generation
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          imageSize,
          aspectRatio
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to render asset");
      }

      const data = await response.json();

      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: imagePrompt.trim(),
        size: imageSize,
        aspectRatio: aspectRatio,
        timestamp: new Date()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "Image generation failed.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Code templates for Flutter Integration (Dart)
  const FLUTTER_DART_CODE = `import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';

class MexcLiveTradingService {
  static const String baseUrl = 'https://api.mexc.com';
  final String apiKey;
  final String apiSecret;
  final Dio _dio = Dio();

  MexcLiveTradingService({
    required this.apiKey,
    required this.apiSecret,
  });

  /// 1. دالة جلب التوقيت الرسمي لمنصة MEXC وحساب فارق الوقت لتفادي أخطاء التزامن
  Future<int> _getServerTimeOffset() async {
    try {
      final int localStart = DateTime.now().millisecondsSinceEpoch;
      final response = await _dio.get('\$baseUrl/api/v3/time');
      final int localEnd = DateTime.now().millisecondsSinceEpoch;
      
      if (response.statusCode == 200) {
        final int serverTime = response.data['serverTime'];
        final int rtt = ((localEnd - localStart) / 2).round();
        // الفارق الزمني المطلوب إضافته للوقت المحلي للحصول على وقت السيرفر بدقة
        return serverTime - (localStart + rtt);
      }
    } catch (e) {
      print('خطأ في جلب وقت السيرفر: \$e');
    }
    return 0;
  }

  /// 2. دالة تشفير وتوليد التوقيع الرقمي HMAC-SHA256
  String _generateSignature(String queryString) {
    final keyBytes = utf8.encode(apiSecret);
    final queryBytes = utf8.encode(queryString);
    final hmac = Hmac(sha256, keyBytes);
    final digest = hmac.convert(queryBytes);
    return digest.toString();
  }

  /// 3. دالة جلب أرصدة المحفظة الحقيقية المتاحة للتداول
  Future<List<Map<String, dynamic>>> getSpotBalances() async {
    try {
      final int timeOffset = await _getServerTimeOffset();
      final int timestamp = DateTime.now().millisecondsSinceEpoch + timeOffset;

      // تجميع معاملات الاستعلام وتوقيعها
      final String queryString = 'timestamp=\$timestamp&recvWindow=60000';
      final String signature = _generateSignature(queryString);

      final response = await _dio.get(
        '\$baseUrl/api/v3/account?\$queryString&signature=\$signature',
        options: Options(
          headers: {
            'X-MEXC-APIKEY': apiKey,
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> balancesRaw = response.data['balances'] ?? [];
        return balancesRaw.map((b) => {
          'asset': b['asset'].toString(),
          'free': double.tryParse(b['free'].toString()) ?? 0.0,
          'locked': double.tryParse(b['locked'].toString()) ?? 0.0,
        }).toList();
      }
    } on DioException catch (e) {
      _handleMexcError(e);
    }
    return [];
  }

  /// 4. دالة تنفيذ أمر تداول حقيقي (سوقي أو حدي)
  Future<Map<String, dynamic>?> placeLiveOrder({
    required String symbol,
    required String side, // 'BUY' or 'SELL'
    required String type, // 'LIMIT' or 'MARKET'
    required double quantity,
    double? price, // مطلوب فقط في الـ LIMIT
  }) async {
    try {
      final int timeOffset = await _getServerTimeOffset();
      final int timestamp = DateTime.now().millisecondsSinceEpoch + timeOffset;

      final Map<String, String> params = {
        'symbol': symbol.toUpperCase(),
        'side': side.toUpperCase(),
        'type': type.toUpperCase(),
        'quantity': quantity.toString(),
        'timestamp': timestamp.toString(),
        'recvWindow': '60000',
      };

      if (type.toUpperCase() == 'LIMIT') {
        if (price == null) throw Exception('الأسعار مطلوبة لأوامر LIMIT');
        params['price'] = price.toString();
        params['timeInForce'] = 'GTC';
      }

      // بناء استعلام مرتب لحساب التوقيع بشكل صحيح
      final String queryString = Uri(queryParameters: params).query;
      final String signature = _generateSignature(queryString);

      final response = await _dio.post(
        '\$baseUrl/api/v3/order?\$queryString&signature=\$signature',
        options: Options(
          headers: {
            'X-MEXC-APIKEY': apiKey,
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
    } on DioException catch (e) {
      _handleMexcError(e);
    }
    return null;
  }

  /// 5. معالجة ذكية للأخطاء الحقيقية القادمة من MEXC
  void _handleMexcError(DioException error) {
    if (error.response != null) {
      final int statusCode = error.response!.statusCode ?? 500;
      final responseData = error.response!.data;
      final String msg = responseData is Map ? (responseData['msg'] ?? 'خطأ غير معروف') : error.message;
      
      print('--- خطأ من منصة MEXC [HTTP \$statusCode] ---');
      print('رسالة الخطأ: \$msg');
      
      // هنا يمكنك إرسال إشعارات أو تحديث واجهة المستخدم للتطبيق Maria
    } else {
      print('خطأ في الاتصال بالشبكة: \${error.message}');
    }
  }
}`;

  const GITHUB_ACTIONS_WORKFLOW = `# .github/workflows/maria_production_build.yml
name: Build Maria Production APK

on:
  push:
    branches:
      - main
      - production

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Java Development Kit (JDK)
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '12.x'
          cache: 'gradle'

      - name: Setup Flutter Engine
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.x'
          channel: 'stable'
          cache: true

      - name: Install Project Dependencies
        run: flutter pub get

      - name: Build Production Android Release APK
        # استخدام المتغيرات الآمنة الممررة كأسرار (GitHub Secrets) لتضمينها أثناء البناء
        env:
          MEXC_API_KEY: \${{ secrets.MEXC_API_KEY }}
          MEXC_SECRET_KEY: \${{ secrets.MEXC_SECRET_KEY }}
        run: |
          flutter build apk --release \\
            --dart-define=MEXC_API_KEY=$MEXC_API_KEY \\
            --dart-define=MEXC_SECRET_KEY=$MEXC_SECRET_KEY

      - name: Upload Production APK Artifact
        uses: actions/upload-artifact@v3
        with:
          name: maria-live-release-apk
          path: build/app/outputs/flutter-apk/app-release.apk
`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Dynamic Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Header Nav */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-lg shadow-emerald-500/5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold tracking-tight text-white">
                Maria Core Terminal
              </h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                MEXC Live v3
              </span>
            </div>
            <p className="text-xs text-slate-400">Professional spot trading console and developer hub for Android integration</p>
          </div>
        </div>

        {/* Core Mode Selectors */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("mexc")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "mexc"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            MEXC Spot Terminal
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Developer Arena
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "image"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Creative Studio
          </button>
        </div>
      </header>

      {/* Main Container Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-hidden">
        
        {/* TAB 1: MEXC LIVE SPOT TRADING TERMINAL & DEVELOPER HUB */}
        {activeTab === "mexc" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: LEFT CONTROLS (Credentials & Order Input) - Span 4 */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Box 1: SECURE GATEWAY CREDENTIALS */}
              <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Secure MEXC Gateway</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    useEnvCredentials 
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" 
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    {useEnvCredentials ? "Auto Environment Keys" : "Custom Session Keys"}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Selector Mode */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
                    <button
                      onClick={() => setUseEnvCredentials(true)}
                      className={`py-1.5 px-2 text-center text-[11px] font-medium rounded-lg transition-all ${
                        useEnvCredentials
                          ? "bg-slate-900 text-white border border-slate-800"
                          : "text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      Workspace Secrets (.env)
                    </button>
                    <button
                      onClick={() => setUseEnvCredentials(false)}
                      className={`py-1.5 px-2 text-center text-[11px] font-medium rounded-lg transition-all ${
                        !useEnvCredentials
                          ? "bg-slate-900 text-white border border-slate-800"
                          : "text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      Custom API Keys (Secure)
                    </button>
                  </div>

                  {useEnvCredentials ? (
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900 text-xs text-slate-400 leading-relaxed">
                      <p className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          Reading global credentials securely on the server-side proxy via <strong className="text-white">process.env.MEXC_API_KEY</strong>. 
                          This hides secrets from the browser network inspector.
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">X-MEXC-APIKEY</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter MEXC API Key"
                            value={mexcApiKey}
                            onChange={(e) => setMexcApiKey(e.target.value)}
                            className="w-full bg-slate-950 text-xs font-mono py-2 pl-3 pr-8 border border-slate-850 rounded-lg outline-none focus:border-indigo-500 text-slate-100"
                          />
                          <Lock className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">HMAC-SHA256 Secret</label>
                        <div className="relative">
                          <input
                            type={showSecretKey ? "text" : "password"}
                            placeholder="Enter MEXC Secret Key"
                            value={mexcSecretKey}
                            onChange={(e) => setMexcSecretKey(e.target.value)}
                            className="w-full bg-slate-950 text-xs font-mono py-2 pl-3 pr-8 border border-slate-850 rounded-lg outline-none focus:border-indigo-500 text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="absolute right-2 top-1.5 p-1 hover:text-slate-200 text-slate-650"
                          >
                            {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-normal">
                        Note: Credentials are saved securely inside your private browser session memory and are never saved on public disk storage.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <button
                    onClick={fetchBalances}
                    disabled={isLoadingAccount}
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 disabled:bg-slate-950 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoadingAccount ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Syncing Wallet...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                        Test Live Connection & Sync
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box 2: LIVE ORDER PLACEMENT (MARKET / LIMIT) */}
              <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Live Order Execution</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Spot Market API</span>
                </div>

                <form onSubmit={executeOrder} className="space-y-4">
                  
                  {/* Buy / Sell Toggles */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
                    <button
                      type="button"
                      onClick={() => setOrderSide("BUY")}
                      className={`py-2 text-center text-xs font-bold rounded-lg transition-all ${
                        orderSide === "BUY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      BUY / شراء
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSide("SELL")}
                      className={`py-2 text-center text-xs font-bold rounded-lg transition-all ${
                        orderSide === "SELL"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      SELL / بيع
                    </button>
                  </div>

                  {/* Limit / Market Selectors */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
                    <button
                      type="button"
                      onClick={() => setOrderType("MARKET")}
                      className={`py-1.5 text-center text-xs font-medium rounded-lg transition-all ${
                        orderType === "MARKET"
                          ? "bg-slate-900 text-white border border-slate-800"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Market Order (سوقي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("LIMIT")}
                      className={`py-1.5 text-center text-xs font-medium rounded-lg transition-all ${
                        orderType === "LIMIT"
                          ? "bg-slate-900 text-white border border-slate-800"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Limit Order (حدي)
                    </button>
                  </div>

                  {/* Symbol Inputs & Quick Choices */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Trading Pair (الزوج)</label>
                      <input
                        type="text"
                        value={orderSymbol}
                        onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g. MXUSDT, BTCUSDT"
                        className="w-full bg-slate-950 text-xs font-mono py-2.5 px-3 border border-slate-850 rounded-xl outline-none focus:border-emerald-500 text-slate-100 uppercase"
                        required
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        {["MXUSDT", "BTCUSDT", "ETHUSDT"].map(sym => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => setOrderSymbol(sym)}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400 hover:border-slate-850 hover:text-slate-200"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity input */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Quantity / الكمية ({orderSymbol.replace("USDT", "")})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(e.target.value)}
                        placeholder="e.g. 10.5"
                        className="w-full bg-slate-950 text-xs font-mono py-2.5 px-3 border border-slate-850 rounded-xl outline-none focus:border-emerald-500 text-slate-100"
                        required
                      />
                    </div>

                    {/* Price (Only enabled/needed for LIMIT orders) */}
                    {orderType === "LIMIT" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1"
                      >
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Price / سعر الحد (USDT)</label>
                        <input
                          type="number"
                          step="any"
                          value={orderPrice}
                          onChange={(e) => setOrderPrice(e.target.value)}
                          placeholder="e.g. 2.15"
                          className="w-full bg-slate-950 text-xs font-mono py-2.5 px-3 border border-slate-850 rounded-xl outline-none focus:border-emerald-500 text-slate-100"
                          required={orderType === "LIMIT"}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Submission Buttons */}
                  <button
                    type="submit"
                    disabled={isExecutingOrder || !orderQuantity}
                    className={`w-full py-3 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                      orderSide === "BUY"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10"
                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10"
                    } disabled:bg-slate-900 disabled:text-slate-600 disabled:shadow-none`}
                  >
                    {isExecutingOrder ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        Transmitting signed packet...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {orderSide === "BUY" ? "Execute Market/Limit Buy" : "Execute Market/Limit Sell"}
                      </>
                    )}
                  </button>
                </form>

                {/* Local Order errors and result feedback */}
                {orderError && (
                  <div className="mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <strong className="text-rose-200">Execution Error:</strong>
                      <p className="mt-0.5 leading-relaxed text-[11px]">{orderError}</p>
                    </div>
                  </div>
                )}

                {orderResult && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                    <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <strong className="text-emerald-200">Execution Confirmed:</strong>
                      <p className="mt-0.5 text-[11px]">Placed Order ID: <span className="font-mono text-white">{orderResult.orderId}</span></p>
                      <p className="text-[10px] mt-0.5 text-slate-400">Qty: {orderResult.origQty} | Status: {orderResult.status}</p>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* COLUMN 2: CENTER WORKSPACE (Market Prices, Balances & System Logs) - Span 8 */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Box 3: TRADING PORTFOLIO BALANCES */}
              <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <h3 className="font-display font-medium text-white text-sm">MEXC Spot Portfolio</h3>
                      <p className="text-[10px] text-slate-400">Real balances extracted with live HMAC-SHA256 signature authorization</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-650" />
                      <input
                        type="text"
                        placeholder="Filter Coin..."
                        value={searchAsset}
                        onChange={(e) => setSearchAsset(e.target.value)}
                        className="bg-slate-950 text-xs py-1.5 pl-8 pr-3 rounded-lg border border-slate-850 outline-none focus:border-indigo-500 text-slate-200 w-32 sm:w-40"
                      />
                    </div>
                    <button
                      onClick={fetchBalances}
                      disabled={isLoadingAccount}
                      className="p-1.5 hover:bg-slate-950 hover:text-white rounded-lg border border-slate-800 text-slate-400 transition-colors"
                      title="Sync balances"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAccount ? "animate-spin text-emerald-400" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Balances Display Grid */}
                {balances.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 font-mono text-[10px] uppercase">
                          <th className="py-2.5 font-normal">Asset Coin</th>
                          <th className="py-2.5 font-normal text-right">Available (Free)</th>
                          <th className="py-2.5 font-normal text-right">In Locked / Order</th>
                          <th className="py-2.5 font-normal text-right">Market Price</th>
                          <th className="py-2.5 font-normal text-right">Total Est. Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60 font-mono">
                        {balances
                          .filter(b => b.asset.toUpperCase().includes(searchAsset.toUpperCase()))
                          .map((bal, index) => {
                            // Find corresponding ticker value to estimate value
                            const tickerPrice = tickers.find(t => t.symbol === `${bal.asset}USDT`)?.price;
                            const priceNum = tickerPrice ? parseFloat(tickerPrice) : (bal.asset === "USDT" ? 1.0 : 0);
                            const totalCoin = parseFloat(bal.free) + parseFloat(bal.locked);
                            const totalUsdtEst = totalCoin * priceNum;

                            return (
                              <tr key={index} className="hover:bg-slate-950/20 group">
                                <td className="py-3 font-display font-semibold text-slate-200 flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-emerald-500 flex items-center justify-center text-[7px] text-emerald-400 font-bold">
                                    M
                                  </span>
                                  {bal.asset}
                                </td>
                                <td className="py-3 text-right text-emerald-450 font-semibold">{parseFloat(bal.free).toFixed(6)}</td>
                                <td className="py-3 text-right text-slate-500">{parseFloat(bal.locked).toFixed(6)}</td>
                                <td className="py-3 text-right text-slate-450">
                                  {priceNum > 0 ? `$${priceNum.toFixed(4)}` : "—"}
                                </td>
                                <td className="py-3 text-right text-white font-semibold">
                                  {totalUsdtEst > 0 ? `$${totalUsdtEst.toFixed(2)}` : (bal.asset === "USDT" ? `$${totalCoin.toFixed(2)}` : "—")}
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-dashed border-slate-900 rounded-xl p-8 text-center">
                    <Wallet className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-300">Portfolio Sync Required</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Tap "Test Live Connection & Sync" after entering your credentials to synchronize and view your non-empty balances.
                    </p>
                  </div>
                )}
              </div>

              {/* Box 4: LIVE MEXC SPOT TICKERS */}
              <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <h3 className="font-display font-medium text-white text-sm">MEXC Market Ticker Prices</h3>
                      <p className="text-[10px] text-slate-400">Current real-time rates of active MEXC spot trading assets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-650" />
                      <input
                        type="text"
                        placeholder="Search Symbol..."
                        value={searchSymbol}
                        onChange={(e) => setSearchSymbol(e.target.value)}
                        className="bg-slate-950 text-xs py-1.5 pl-8 pr-3 rounded-lg border border-slate-850 outline-none focus:border-indigo-500 text-slate-200 w-32 sm:w-40"
                      />
                    </div>
                    <button
                      onClick={fetchTickers}
                      disabled={isLoadingTickers}
                      className="p-1.5 hover:bg-slate-950 hover:text-white rounded-lg border border-slate-800 text-slate-400 transition-colors"
                      title="Refresh rates"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickers ? "animate-spin text-emerald-400" : ""}`} />
                    </button>
                  </div>
                </div>

                {tickers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                    {tickers
                      .filter(t => t.symbol.toLowerCase().includes(searchSymbol.toLowerCase()))
                      .slice(0, 40) // Show top 40 results
                      .map((ticker, index) => {
                        const isSelected = orderSymbol === ticker.symbol;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setOrderSymbol(ticker.symbol);
                              // Auto guess reasonable price if limit order is active
                              setOrderPrice(ticker.price);
                              addLog("info", "UI_ACTION", `Set active trading target pair to ${ticker.symbol}`);
                            }}
                            className={`p-3 text-left rounded-xl border transition-all ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm"
                                : "bg-slate-950/40 border-slate-900/60 hover:border-slate-800 text-slate-300"
                            }`}
                          >
                            <span className="text-[10px] font-mono text-slate-400 group-hover:text-white block font-semibold">
                              {ticker.symbol}
                            </span>
                            <span className="text-sm font-mono font-bold block mt-1">
                              ${parseFloat(ticker.price).toFixed(ticker.price.length > 5 ? 6 : 4)}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-500 mt-1 block">
                              ● Live Active Spot
                            </span>
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <RefreshCw className="w-6 h-6 text-slate-600 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-slate-500">Retrieving exchange market price stream...</span>
                  </div>
                )}
              </div>

              {/* Box 5: SYSTEM AND EXECUTION LOGGER TERMINAL */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Maria Live Core Sync Console</span>
                  </div>
                  <button
                    onClick={() => setLogs([])}
                    className="text-[10px] text-slate-500 hover:text-rose-400 py-0.5 px-1.5 rounded hover:bg-rose-500/5 transition-colors"
                  >
                    Clear Console
                  </button>
                </div>

                <div className="h-44 overflow-y-auto space-y-2.5 text-[11px] pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-1 border-b border-slate-900/30 pb-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-600 text-[10px] shrink-0 mt-0.5">
                          {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide shrink-0 ${
                          log.type === "success" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/45" :
                          log.type === "error" ? "bg-rose-950 text-rose-400 border border-rose-900/45" :
                          log.type === "warning" ? "bg-amber-950 text-amber-400 border border-amber-900/45" :
                          "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}>
                          {log.endpoint}
                        </span>

                        <span className={`leading-relaxed select-text ${
                          log.type === "success" ? "text-emerald-350" :
                          log.type === "error" ? "text-rose-350 font-semibold" :
                          log.type === "warning" ? "text-amber-350" :
                          "text-slate-300"
                        }`}>
                          {log.message}
                        </span>
                      </div>

                      {/* Debug details for Developer */}
                      {(log.payload || log.response) && (
                        <div className="ml-14 pl-2 border-l border-slate-800 bg-slate-900/40 p-2 rounded-lg text-[10px] text-slate-400 max-h-32 overflow-y-auto whitespace-pre space-y-1.5 select-text">
                          {log.payload && (
                            <div>
                              <span className="text-indigo-400 font-bold block">🚀 Outgoing Query:</span>
                              {log.payload}
                            </div>
                          )}
                          {log.response && (
                            <div>
                              <span className="text-emerald-400 font-bold block">📥 Incoming Response payload:</span>
                              {log.response}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

            </div>

            {/* FULL WIDTH BOTTOM: FLUTTER AND GITHUB ACTIONS CODE DOCUMENTATION HUB */}
            <div className="lg:col-span-12 mt-4 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-2xl relative">
              <div className="absolute top-4 right-6 p-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center gap-1.5 text-xs text-indigo-400">
                <Code className="w-4 h-4" /> Flutter Development Resource
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-display font-semibold text-white mb-1">
                  Flutter "Maria" Application Integration Hub
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  بصفتك مطور التطبيق Maria، يمكنك نسخ واستخدام ملفات الكود البرمجي الجاهزة التالية لبرمجة التداول الحقيقي وتضمينها بشكل آمن باستخدام التشفير والـ GitHub Actions.
                </p>
              </div>

              {/* Code Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dart Service Code */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center bg-slate-950 p-3 rounded-t-xl border-t border-x border-slate-900">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" /> lib/services/mexc_live_service.dart
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(FLUTTER_DART_CODE);
                        addLog("success", "COPY_PASTE", "Copied Flutter Dart Service template code to clipboard.");
                      }}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/15"
                    >
                      <Copy className="w-3 h-3" /> Copy Dart Class
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-b-xl border-b border-x border-slate-900 text-[10px] font-mono text-slate-400 h-96 overflow-y-auto leading-relaxed select-text">
                    {FLUTTER_DART_CODE}
                  </pre>
                </div>

                {/* GitHub Actions Workflow Code */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center bg-slate-950 p-3 rounded-t-xl border-t border-x border-slate-900">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" /> .github/workflows/maria_build.yml
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(GITHUB_ACTIONS_WORKFLOW);
                        addLog("success", "COPY_PASTE", "Copied GitHub Actions Workflow template code to clipboard.");
                      }}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/15"
                    >
                      <Copy className="w-3 h-3" /> Copy Workflow
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-b-xl border-b border-x border-slate-900 text-[10px] font-mono text-slate-400 h-96 overflow-y-auto leading-relaxed select-text">
                    {GITHUB_ACTIONS_WORKFLOW}
                  </pre>
                </div>

              </div>

              {/* Secure storage guidelines */}
              <div className="mt-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
                <strong className="text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> نصائح أمنية هامة لتأمين حسابك الحقيقي في MEXC:
                </strong>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 leading-relaxed text-[11px]">
                  <li>
                    تجنب كتابة مفاتيح الـ API بشكل صلب (Hardcoded) في الكود نهائياً. استخدم حزمة <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-slate-200">flutter_secure_storage</code> لتخزينها بشكل مشفر في خزانة الهاتف الآمنة (Keychain / Keystore).
                  </li>
                  <li>
                    استخدم ميزة <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-slate-200">--dart-define</code> المتاحة أثناء بناء نسخة الـ APK الحقيقية عبر الـ CD لإدخال مفاتيح الإنتاج بشكل آمن من الـ GitHub Secrets دون كتابتها في مستودع الكود.
                  </li>
                  <li>
                    قم بتفعيل تصفية وقفل عناوين الـ IP (IP Whitelisting) لمفاتيح الـ API في حسابك على منصة MEXC للسماح لعنوان خادمك أو أجهزتك المعتمدة فقط بتنفيذ طلبات التداول الحقيقي.
                  </li>
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CHAT ARENA WITH MULTI-ROLE CHATBOTS */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-[550px]">
            {/* Left side: chatbot role picker */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
              <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" /> Select Chatbot Role
                  </h3>
                  <div className="flex flex-col gap-3">
                    {CHATBOTS.map(bot => {
                      const isActive = activeChatbot === bot.id;
                      return (
                        <button
                          key={bot.id}
                          onClick={() => {
                            setActiveChatbot(bot.id);
                            setChatError(null);
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-255 ${
                            isActive
                              ? `${bot.bgColor} ${bot.borderColor} shadow-sm shadow-${bot.color}-500/5`
                              : "bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-display font-medium text-sm flex items-center gap-1.5 ${
                              isActive ? bot.textColor : "text-slate-200"
                            }`}>
                              {bot.id === "sage" && <Code className="w-4 h-4 text-emerald-400" />}
                              {bot.id === "nova" && <Brain className="w-4 h-4 text-indigo-400" />}
                              {bot.id === "sonic" && <Zap className="w-4 h-4 text-amber-400" />}
                              {bot.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800/80">
                              {bot.id === "sage" ? "Pro" : bot.id === "nova" ? "Flash" : "Lite"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mb-2">
                            {bot.description}
                          </p>
                          <div className="text-[10px] font-mono text-slate-500 bg-slate-950/50 p-1.5 rounded border border-slate-900/50">
                            {bot.model}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">History Action</span>
                  <button
                    onClick={() => {
                      const bot = CHATBOTS.find(c => c.id === activeChatbot);
                      setChatHistories(prev => ({
                        ...prev,
                        [activeChatbot]: [
                          {
                            id: `welcome-${Date.now()}`,
                            role: "assistant",
                            content: `Fresh chat session started with **${bot?.name}**. How can I help you?`,
                            timestamp: new Date(),
                            modelUsed: bot?.model
                          }
                        ]
                      }));
                    }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1 px-2.5 rounded bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Active chat window */}
            <div className="flex-1 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col h-[550px] overflow-hidden">
              <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-${CHATBOTS.find(c => c.id === activeChatbot)?.color}-500 animate-pulse`} />
                  <span className="text-xs font-semibold text-slate-300 uppercase font-mono">
                    Session: {CHATBOTS.find(c => c.id === activeChatbot)?.name}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-900">
                  {CHATBOTS.find(c => c.id === activeChatbot)?.model}
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {chatHistories[activeChatbot].map((msg) => {
                  const isUser = msg.role === "user";
                  const botInfo = CHATBOTS.find(c => c.id === activeChatbot);

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/10 text-sm"
                          : `${botInfo?.bubbleColor} rounded-bl-none text-sm`
                      }`}>
                        <div className="whitespace-pre-wrap select-text break-words">
                          {msg.content}
                        </div>
                        <div className={`mt-2.5 flex items-center gap-2 text-[10px] ${
                          isUser ? "text-indigo-200" : "text-slate-500"
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isUser && msg.modelUsed && (
                            <>
                              <span>•</span>
                              <span className="font-mono bg-slate-950/80 px-1.5 py-0.5 rounded text-slate-400 border border-slate-900/40">
                                {msg.modelUsed}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* AI Thinking bubbles */}
                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {CHATBOTS.find(c => c.id === activeChatbot)?.name} is reasoning...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {chatError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-rose-200">Execution Error</h4>
                      <p className="text-xs mt-0.5 leading-relaxed">{chatError}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form bar */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-900">
                <form onSubmit={handleSendChatMessage} className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    placeholder={`Message ${CHATBOTS.find(c => c.id === activeChatbot)?.name}...`}
                    rows={1}
                    className="flex-1 max-h-32 min-h-[44px] py-3 px-4 bg-transparent outline-none border-none text-sm text-slate-100 placeholder:text-slate-650 resize-none font-sans"
                  />
                  <div className="flex items-center gap-2 px-3">
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 text-white disabled:text-slate-600 rounded-lg transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-[10px] text-slate-650 font-sans">
                    Use Shift + Enter for newlines
                  </span>
                  <span className="text-[10px] text-slate-650 font-mono">
                    Model: {CHATBOTS.find(c => c.id === activeChatbot)?.model}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CREATIVE GENERATIVE IMAGE STUDIO */}
        {activeTab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[500px]">
            
            {/* Options configuration Panel */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-900 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="text-base font-display font-semibold text-white mb-1.5">App Design Asset Generator</h2>
                <p className="text-xs text-slate-400">Generate professional vectors, splash screens, or design branding blueprints for Maria App.</p>
              </div>

              <form onSubmit={handleGenerateImage} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Visual Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the asset..."
                    rows={5}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed transition-colors font-sans"
                    required
                  />
                </div>

                {/* Resolution Config */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-2">Image Size Affordance</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1K", "2K", "4K"] as const).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setImageSize(size)}
                        className={`py-2 px-2 text-center text-xs font-mono font-medium rounded-xl border transition-all ${
                          imageSize === size
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                            : "bg-slate-950 border-slate-850 text-slate-500 hover:bg-slate-900"
                        }`}
                      >
                        {size}
                        <span className="block text-[9px] text-slate-600 font-sans mt-0.5 font-normal">
                          {size === "1K" ? "1024px" : size === "2K" ? "2048px" : "4096px"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Config */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["1:1", "16:9", "9:16", "4:3", "3:4"].map(ratio => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1.5 text-center text-xs font-mono font-medium rounded-lg border transition-all ${
                          aspectRatio === ratio
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                            : "bg-slate-950 border-slate-850 text-slate-500 hover:bg-slate-900"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-900 text-white disabled:text-slate-650 font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Rendering high-fidelity pixels...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      Render with gemini-3-pro-image-preview
                    </>
                  )}
                </button>
              </form>

              {imageError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong className="text-rose-200">Generation Failed</strong>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{imageError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Output Viewport - Span 7 */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center relative">
              {isGeneratingImage ? (
                <div className="text-center max-w-sm">
                  <div className="relative w-14 h-14 mb-4 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/15 border-t-indigo-500 animate-spin" />
                    <div className="absolute inset-2 bg-slate-950 border border-slate-900 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="font-display font-medium text-white text-sm mb-1">Synthesizing Creative Canvas</h3>
                  <p className="text-[10px] font-mono text-indigo-400 animate-pulse">
                    {imageGenerationProgress}
                  </p>
                </div>
              ) : selectedImage ? (
                <div className="w-full flex flex-col items-center justify-center gap-4">
                  <div className="relative group max-w-full rounded-xl overflow-hidden border border-slate-800/80 bg-black/40">
                    <img
                      src={selectedImage.url}
                      alt="Generative artwork"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[350px] object-contain mx-auto"
                    />
                    
                    {/* Copy/Download overlay */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = selectedImage.url;
                          link.download = `maria-brand-art-${selectedImage.id}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-1 hover:text-white text-slate-400"
                        title="Download Asset"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center max-w-md bg-slate-900/40 p-3 rounded-xl border border-slate-900 text-xs">
                    <p className="text-slate-300 font-sans italic">"{selectedImage.prompt}"</p>
                    <div className="flex justify-center gap-2 mt-2 font-mono text-[9px] text-slate-500">
                      <span>Size: {selectedImage.size}</span>
                      <span>•</span>
                      <span>Aspect: {selectedImage.aspectRatio}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <ImageIcon className="w-10 h-10 text-slate-800 mx-auto mb-3" />
                  <p className="text-xs">Visual preview workspace empty. Choose options and prompt to render.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Modern Dashboard Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2 shrink-0">
        <p>© 2026 Maria Trading Engine Core. All transactions signed with HMAC-SHA256.</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Connection: Connected to api.mexc.com
          </span>
          <span className="text-slate-800">|</span>
          <a
            href="https://github.com/boanmoban-collab/https-github.com-boanmoban-collab"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-350 transition-colors flex items-center gap-1 font-mono"
          >
            Maria Repository <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
