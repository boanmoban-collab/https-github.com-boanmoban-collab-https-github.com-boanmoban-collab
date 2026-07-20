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

export interface MexcBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface MexcTicker {
  symbol: string;
  price: string;
  change24h?: string;
  volume24h?: string;
}

export interface MexcOrderPayload {
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  quantity: string;
  price?: string; // Optional for MARKET orders
}

export interface MexcOrderResponse {
  symbol: string;
  orderId: string;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning";
  endpoint: string;
  message: string;
  payload?: string;
  response?: string;
}

