import { BASE_URL } from "@/constants/base-url";
import { Platform } from "react-native";

// Types aligned to live_tracker models.py shapes
export type Bar = {
  ticker: string;
  interval: string;
  ts: string; // ISO string from backend
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
};

export type Signal = {
  ticker: string;
  interval: string;
  ts: string;
  action: "BUY" | "SELL" | "HOLD";
  price?: number | null;
  reason: string;
  meta?: Record<string, any>;
};

export type Trade = {
  _id?: string;
  ticker: string;
  action: "BUY" | "SELL";
  shares: number;
  price: number;
  commission?: number;
  notes?: string;
  ts: string;
  inserted_at?: string;
};

export type PortfolioState = {
  _id?: string;
  ticker: string;
  cash: number;
  shares: number;
  avg_cost?: number;
};

export type Event = {
  ticker: string;
  interval: string;
  ts: string;
  type:
    | "BUY_EPISODE_START"
    | "BUY_EPISODE_END"
    | "SELL_EPISODE_START"
    | "SELL_EPISODE_END";
  price?: number | null;
  meta?: Record<string, any>;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function getBars(): Promise<Bar[]> {
  return getJson<Bar[]>("/api/bars");
}

export async function getSignals(): Promise<Signal[]> {
  return getJson<Signal[]>("/api/signals");
}

export async function getEvents(): Promise<Event[]> {
  return getJson<Event[]>("/api/events");
}

export async function getTrades(ticker?: string): Promise<Trade[]> {
  const q = ticker ? `?ticker=${encodeURIComponent(ticker)}` : "";
  return getJson<Trade[]>(`/api/trades${q}`);
}

export async function getPortfolio(ticker?: string): Promise<PortfolioState[]> {
  const q = ticker ? `?ticker=${encodeURIComponent(ticker)}` : "";
  return getJson<PortfolioState[]>(`/api/portfolio${q}`);
}

export async function postTrade(trade: {
  ticker: string;
  action: "BUY" | "SELL";
  shares: number;
  price: number;
  commission?: number;
  notes?: string;
  ts?: string;
}): Promise<{ trade: Trade; portfolio: PortfolioState }> {
  const res = await fetch(`${BASE_URL}/api/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trade),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return (await res.json()) as { trade: Trade; portfolio: PortfolioState };
}

// Small helpers
export function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}
