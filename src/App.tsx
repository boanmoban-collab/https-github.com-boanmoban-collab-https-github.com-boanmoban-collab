import React, { useState, useEffect, useRef } from "react";
import {
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
  ChevronRight,
  Zap,
  Brain,
  Code,
  History,
  Sliders,
  ExternalLink,
  ChevronLeft,
  X,
  AlertCircle,
  HelpCircle,
  Clock,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, Chatbot, GeneratedImage } from "./types";

// Chatbots metadata
const CHATBOTS: Chatbot[] = [
  {
    id: "sage",
    name: "Sage",
    role: "Expert Coder & Logic Thinker",
    description: "Deep step-by-step reasoning, pristine code architecture, and analytical logic.",
    model: "gemini-3.1-pro-preview",
    modelDesc: "Complex reasoning, coding & math",
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
    role: "Creative Companion",
    description: "Polished essay writing, brainstorming, summarization, and friendly discussions.",
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
    role: "Fast Responder",
    description: "Ultra-fast answers, quick concepts, quick-fire summaries, and instant results.",
    model: "gemini-3.1-flash-lite",
    modelDesc: "Maximum speed, quick responses",
    color: "amber",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    hoverBgColor: "hover:bg-amber-500/20",
    bubbleColor: "bg-amber-950/40 text-amber-100 border border-amber-900/40",
  }
];

const PROMPT_PRESETS = [
  {
    title: "Cyber Greenhouse",
    text: "A hyper-detailed isometric greenhouse floating in space, filled with luminous neon alien plants, photorealistic 3D render, octane render, cosmic stardust background",
    category: "Sci-Fi"
  },
  {
    title: "Watercolor Library",
    text: "A warm watercolor painting of an ancient, cozy library with dust motes dancing in sunbeams, towering mahogany bookshelves, and comfy velvet armchairs",
    category: "Artistic"
  },
  {
    title: "Steampunk Wristwatch",
    text: "A high-fidelity macro shot of an intricate steampunk mechanical wristwatch, brass gears and sapphire crystals, glowing copper elements, dark velvet background",
    category: "Technical"
  },
  {
    title: "Origami Ocean",
    text: "A beautiful papercraft scene of a blue origami ocean with stylized paper waves and a small folded sailboat sailing under a massive golden paper sun",
    category: "Minimalist"
  }
];

export default function App() {
  // Current active mode: 'chat' | 'image'
  const [activeTab, setActiveTab] = useState<"chat" | "image">("chat");

  // Chat States
  const [activeChatbot, setActiveChatbot] = useState<"sage" | "nova" | "sonic">("nova");
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    sage: [
      {
        id: "sage-welcome",
        role: "assistant",
        content: `Greetings. I am Sage, configured with the highly reasoning **gemini-3.1-pro-preview** engine.
I excel at software design, algorithmic complex problem-solving, and thorough mathematical reasoning. 

How can I assist with your software architecture or logic analysis today?`,
        timestamp: new Date(),
        modelUsed: "gemini-3.1-pro-preview"
      }
    ],
    nova: [
      {
        id: "nova-welcome",
        role: "assistant",
        content: `Hi there! I'm Nova, powered by **gemini-3.5-flash**. 
I'm here to help you brainstorm creative ideas, write or refine content, explain complicated topics, or just have a great conversation!

What would you like to explore or co-create today?`,
        timestamp: new Date(),
        modelUsed: "gemini-3.5-flash"
      }
    ],
    sonic: [
      {
        id: "sonic-welcome",
        role: "assistant",
        content: `Hey! I'm Sonic, powered by **gemini-3.1-flash-lite** for extreme speed.
Need a fast concept summary, quick syntax reference, or a high-speed brainstorming list? 

Throw it at me, I'm ready to respond in a flash!`,
        timestamp: new Date(),
        modelUsed: "gemini-3.1-flash-lite"
      }
    ]
  });
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Image States
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageGenerationProgress, setImageGenerationProgress] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, activeChatbot, isChatLoading]);

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

    // Update history locally with user message
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

  // Image Generation progress simulation
  useEffect(() => {
    if (!isGeneratingImage) {
      setImageGenerationProgress("");
      return;
    }

    const progressMessages = [
      "Establishing link with gemini-3-pro-image-preview...",
      "Analyzing prompt semantics & style anchors...",
      `Allocating canvas grid for ${imageSize} resolution...`,
      "Synthesizing visual layers & composition structure...",
      "Executing deep rendering matrices...",
      "Refining high-fidelity lighting & contrast passes...",
      "Finalizing file compilation..."
    ];

    let index = 0;
    setImageGenerationProgress(progressMessages[0]);

    const interval = setInterval(() => {
      if (index < progressMessages.length - 1) {
        index++;
        setImageGenerationProgress(progressMessages[index]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isGeneratingImage, imageSize]);

  // Handle Image Generation
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
        throw new Error(errData.error || "Failed to generate image");
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
      setSelectedImage(newImage); // Auto preview the new image
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "Image generation failed. Try refining your prompt.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Copy Data URL
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download Image
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear active chatbot history
  const clearChatHistory = () => {
    const defaultWelcome = CHATBOTS.find(c => c.id === activeChatbot);
    setChatHistories(prev => ({
      ...prev,
      [activeChatbot]: [
        {
          id: `${activeChatbot}-welcome-reset`,
          role: "assistant",
          content: `History cleared. I'm ready for a fresh start using **${defaultWelcome?.model}**!`,
          timestamp: new Date(),
          modelUsed: defaultWelcome?.model
        }
      ]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold tracking-tight text-white flex items-center gap-2">
              Gemini Creative Studio
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">
                v3.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Dual-engine playground for deep reasoning and generative media</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Arena
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "image"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image Studio
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {activeTab === "chat" ? (
            /* Chat Controls */
            <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5" /> Select Chatbot Agent
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
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? `${bot.bgColor} ${bot.borderColor} shadow-sm shadow-${bot.color}-500/5`
                            : "bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-display font-medium text-sm flex items-center gap-2 ${
                            isActive ? bot.textColor : "text-slate-200"
                          }`}>
                            {bot.id === "sage" && <Code className="w-4 h-4" />}
                            {bot.id === "nova" && <Brain className="w-4 h-4" />}
                            {bot.id === "sonic" && <Zap className="w-4 h-4" />}
                            {bot.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800/80">
                            {bot.id === "sage" ? "Pro" : bot.id === "nova" ? "Flash" : "Lite"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                          {bot.role}
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
                  onClick={clearChatHistory}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1 px-2.5 rounded bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              </div>
            </div>
          ) : (
            /* Image Generation Options */
            <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> Render Resolution
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["1K", "2K", "4K"] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`py-2 px-3 text-center text-xs font-mono font-medium rounded-xl border transition-all ${
                        imageSize === size
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      {size}
                      <span className="block text-[9px] text-slate-500 font-sans mt-0.5">
                        {size === "1K" ? "1024 px" : size === "2K" ? "2048 px" : "4096 px"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2.5 flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Powered by <strong className="text-slate-300">gemini-3-pro-image-preview</strong> for ultra-high-definition details.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  Aspect Ratio
                </h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: "1:1", desc: "Square" },
                    { label: "16:9", desc: "Wide" },
                    { label: "9:16", desc: "Tall" },
                    { label: "4:3", desc: "Standard" },
                    { label: "3:4", desc: "Portrait" }
                  ].map(ratio => (
                    <button
                      key={ratio.label}
                      onClick={() => setAspectRatio(ratio.label)}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg border transition-all ${
                        aspectRatio === ratio.label
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                      title={ratio.desc}
                    >
                      <span className="text-xs font-mono font-medium">{ratio.label}</span>
                      <div className={`mt-1.5 border border-current rounded-sm ${
                        ratio.label === "1:1" ? "w-3 h-3" :
                        ratio.label === "16:9" ? "w-4 h-2.5" :
                        ratio.label === "9:16" ? "w-2.5 h-4" :
                        ratio.label === "4:3" ? "w-3.5 h-2.5" :
                        "w-2.5 h-3.5"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery List (Current Session) */}
              {generatedImages.length > 0 && (
                <div className="border-t border-slate-900 pt-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Render History ({generatedImages.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {generatedImages.map(img => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-square rounded-lg overflow-hidden border group transition-all duration-200 ${
                          selectedImage?.id === img.id
                            ? "border-indigo-500 ring-2 ring-indigo-500/20"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="Render Thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Studio Canvas / Interactive Arena */}
        <div className="flex-1 bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden flex flex-col h-[75vh] lg:h-auto min-h-[500px]">
          {activeTab === "chat" ? (
            /* CHAT INTERFACE */
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Chat Sub-header */}
              <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${CHATBOTS.find(c => c.id === activeChatbot)?.color}-500 animate-pulse`} />
                  <span className="text-sm font-medium text-slate-300">
                    Active Session: <strong className="text-white">{CHATBOTS.find(c => c.id === activeChatbot)?.name}</strong>
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-900">
                  {CHATBOTS.find(c => c.id === activeChatbot)?.model}
                </div>
              </div>

              {/* Chat Message Scroll Thread */}
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
                        {/* Message content */}
                        <div className="whitespace-pre-wrap select-text break-words">
                          {msg.content}
                        </div>

                        {/* Metadata line */}
                        <div className={`mt-2 flex items-center gap-2 text-[10px] ${
                          isUser ? "text-indigo-200" : "text-slate-500"
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isUser && msg.modelUsed && (
                            <>
                              <span>•</span>
                              <span className="font-mono bg-slate-950/80 px-1.5 py-0.5 rounded text-slate-400">
                                {msg.modelUsed}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Chat Loading / Thinking state */}
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

                {/* Error State */}
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

              {/* Chat Input Bar */}
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
                    placeholder={`Message ${CHATBOTS.find(c => c.id === activeChatbot)?.name}... (Press Enter to send)`}
                    rows={1}
                    className="flex-1 max-h-32 min-h-[44px] py-3 px-4 bg-transparent outline-none border-none text-sm text-slate-100 placeholder:text-slate-600 resize-none"
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
                  <span className="text-[10px] text-slate-600">
                    Use Shift + Enter for newlines
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    Model: {CHATBOTS.find(c => c.id === activeChatbot)?.model}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* IMAGE GENERATOR INTERFACE */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Creator Panel (Prompt & Presets) */}
              <div className="flex-1 flex flex-col p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-900 gap-6">
                <div>
                  <h2 className="text-lg font-display font-medium text-white mb-2">Create New Media</h2>
                  <p className="text-xs text-slate-400">Generate high-fidelity, photorealistic or artistic images from a textual prompt.</p>
                </div>

                <form onSubmit={handleGenerateImage} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-slate-400">Prompt description</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g. A photorealistic macro shot of a blue morpho butterfly resting on a dew-covered metallic mechanical leaf..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl p-3 text-sm text-slate-100 outline-none resize-none transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 text-white disabled:text-slate-600 font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                        Generating Render...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-200" />
                        Generate {imageSize} Image
                      </>
                    )}
                  </button>
                </form>

                {imageError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-rose-200">Generation Failed</h4>
                      <p className="text-xs mt-0.5 leading-relaxed">{imageError}</p>
                    </div>
                  </div>
                )}

                {/* Prompt Helpers */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">Creative Presets</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROMPT_PRESETS.map((preset) => (
                      <button
                        key={preset.title}
                        onClick={() => setImagePrompt(preset.text)}
                        className="text-left p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-indigo-400 transition-colors">
                            {preset.title}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase px-1.5 py-0.5 bg-slate-900 border border-slate-850 rounded">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {preset.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Viewport Canvas (Outputs) */}
              <div className="flex-1 bg-slate-950/40 p-6 flex flex-col justify-center items-center relative min-h-[350px]">
                {isGeneratingImage ? (
                  /* Loading Canvas */
                  <div className="w-full max-w-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                      <div className="absolute inset-2 bg-slate-950 border border-slate-900 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="font-display font-medium text-white mb-1.5">Synthesizing Asset</h3>
                    <p className="text-xs font-mono text-indigo-400 animate-pulse mb-4">
                      {imageGenerationProgress}
                    </p>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-slate-850">
                      <motion.div
                        className="bg-indigo-500 h-full rounded-full"
                        animate={{
                          x: ["-100%", "100%"]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "easeInOut"
                        }}
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>
                ) : selectedImage ? (
                  /* Image Output View */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 relative">
                    <div className="relative group max-w-full max-h-[70%] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                      <img
                        src={selectedImage.url}
                        alt="Generated Media"
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-[380px] object-contain mx-auto"
                      />
                      {/* Action Overlays */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/60 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80">
                        <button
                          onClick={() => copyToClipboard(selectedImage.url, selectedImage.id)}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-300 transition-colors"
                          title="Copy Data URI"
                        >
                          {copiedId === selectedImage.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => downloadImage(selectedImage.url, `gemini-render-${selectedImage.id}.png`)}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-300 transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedImage(selectedImage)}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-300 transition-colors"
                          title="View Full Size"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-center max-w-md">
                      <p className="text-xs text-slate-300 line-clamp-2 select-all bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-900/60">
                        "{selectedImage.prompt}"
                      </p>
                      <div className="flex justify-center gap-3 mt-2.5">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2.5 py-0.5 border border-slate-850 rounded">
                          Size: {selectedImage.size}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2.5 py-0.5 border border-slate-850 rounded">
                          Ratio: {selectedImage.aspectRatio}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Canvas State */
                  <div className="text-center py-12 flex flex-col items-center max-w-sm px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center mb-4 text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-semibold text-white mb-1.5 text-sm">Media Viewport Empty</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      No assets have been rendered in this session. Configure size and enter a detailed prompt to generate.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2 shrink-0">
        <p>Built with Google Gemini 3 models on server-side architecture.</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Full-Stack Server Running
          </span>
          <span className="text-slate-600">|</span>
          <a
            href="https://ai.studio/build"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-400 transition-colors flex items-center gap-1"
          >
            Google AI Studio <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

      {/* IMAGE VIEWER MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-950 border border-slate-900 max-w-4xl w-full rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            >
              {/* Left Side: Visual */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[75vh]">
                <img
                  src={selectedImage.url}
                  alt="Full resolution preview"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[75vh] object-contain"
                />
              </div>

              {/* Right Side: Attributes */}
              <div className="w-full md:w-80 shrink-0 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-900 bg-slate-950 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider uppercase">
                      Rendered Asset Details
                    </span>
                    <h4 className="text-white font-display font-medium text-base mt-1">Prompt Parameters</h4>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed p-3 bg-slate-900/60 border border-slate-900 rounded-xl select-all select-text">
                    "{selectedImage.prompt}"
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-mono block">Image Size</span>
                      <strong className="text-xs text-slate-200 mt-1 block">{selectedImage.size}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-mono block">Aspect Ratio</span>
                      <strong className="text-xs text-slate-200 mt-1 block">{selectedImage.aspectRatio}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => downloadImage(selectedImage.url, `gemini-render-${selectedImage.id}.png`)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download PNG Asset
                  </button>
                  <button
                    onClick={() => copyToClipboard(selectedImage.url, "modal-copy")}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {copiedId === "modal-copy" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" /> Copied Base64 URL
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Base64 Data URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
