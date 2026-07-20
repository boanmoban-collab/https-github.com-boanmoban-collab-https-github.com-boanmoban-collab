export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelUsed?: string;
}

export interface Chatbot {
  id: "sage" | "nova" | "sonic";
  name: string;
  role: string;
  description: string;
  model: string;
  modelDesc: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  hoverBgColor: string;
  bubbleColor: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  size: "1K" | "2K" | "4K";
  aspectRatio: string;
  timestamp: Date;
}
