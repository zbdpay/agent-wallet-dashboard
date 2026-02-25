import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_ZBD_API_BASE_URL = "https://api.zbdpay.com";

export interface WalletConfig {
  apiKey?: string;
  lightningAddress?: string;
}

export interface PaymentHistoryRecord {
  id: string;
  type: "send" | "receive";
  amount_sats: number;
  status: string;
  timestamp: string;
  fee_sats?: number;
  preimage?: string;
}

export interface DailyNetPoint {
  day: string;
  net_sats: number;
}

export interface WalletDashboardData {
  wallet: {
    lightningAddress: string | null;
    hasApiKey: boolean;
    liveBalanceSats: number | null;
    balanceError: string | null;
  };
  payments: PaymentHistoryRecord[];
  summary: {
    totalCount: number;
    totalReceivedSats: number;
    totalSentSats: number;
    totalFeeSats: number;
    netFlowSats: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
  };
  trends: {
    last14DaysNet: DailyNetPoint[];
  };
  paths: {
    configPath: string;
    paymentsPath: string;
  };
  fileErrors: {
    config: string | null;
    payments: string | null;
  };
}

export async function loadWalletDashboardData(): Promise<WalletDashboardData> {
  const configPath = getWalletConfigPath();
  const paymentsPath = getPaymentsPath();

  const [configResult, paymentsResult] = await Promise.all([
    readJsonFile(configPath),
    readJsonFile(paymentsPath),
  ]);

  const config = normalizeConfig(configResult.data);
  const payments = normalizePayments(paymentsResult.data).sort(
    (left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp),
  );

  const summary = summarize(payments);
  const liveBalance = await fetchLiveBalanceSats(config.apiKey);

  return {
    wallet: {
      lightningAddress: normalizeOptionalString(config.lightningAddress) ?? null,
      hasApiKey: Boolean(normalizeOptionalString(config.apiKey)),
      liveBalanceSats: liveBalance.balance,
      balanceError: liveBalance.error,
    },
    payments,
    summary,
    trends: {
      last14DaysNet: buildDailyNetSeries(payments, 14),
    },
    paths: {
      configPath,
      paymentsPath,
    },
    fileErrors: {
      config: configResult.error,
      payments: paymentsResult.error,
    },
  };
}

function getWalletConfigPath(): string {
  return process.env.ZBD_WALLET_CONFIG ?? join(homedir(), ".zbd-wallet", "config.json");
}

function getPaymentsPath(): string {
  return process.env.ZBD_WALLET_PAYMENTS ?? join(homedir(), ".zbd-wallet", "payments.json");
}

async function readJsonFile(path: string): Promise<{ data: unknown; error: string | null }> {
  try {
    const raw = await readFile(path, "utf8");
    return {
      data: JSON.parse(raw) as unknown,
      error: null,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message };
    }
    return { data: null, error: "Unable to read local JSON file" };
  }
}

function normalizeConfig(input: unknown): WalletConfig {
  if (!input || typeof input !== "object") {
    return {};
  }

  const candidate = input as Record<string, unknown>;
  return {
    apiKey: normalizeOptionalString(candidate.apiKey),
    lightningAddress: normalizeOptionalString(candidate.lightningAddress),
  };
}

function normalizePayments(input: unknown): PaymentHistoryRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const records: PaymentHistoryRecord[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const row = item as Record<string, unknown>;
    const id = normalizeOptionalString(row.id);
    const timestamp = normalizeOptionalString(row.timestamp);
    const status = normalizeOptionalString(row.status);
    const amountSats = toNumber(row.amount_sats);
    const typeValue = normalizeOptionalString(row.type);

    if (!id || !timestamp || !status || amountSats === null) {
      continue;
    }

    const record: PaymentHistoryRecord = {
      id,
      type: typeValue === "receive" ? "receive" : "send",
      amount_sats: amountSats,
      status,
      timestamp,
    };

    const feeSats = toNumber(row.fee_sats);
    if (feeSats !== null) {
      record.fee_sats = feeSats;
    }

    const preimage = normalizeOptionalString(row.preimage);
    if (preimage) {
      record.preimage = preimage;
    }

    records.push(record);
  }

  return records;
}

function summarize(payments: PaymentHistoryRecord[]): WalletDashboardData["summary"] {
  let totalReceivedSats = 0;
  let totalSentSats = 0;
  let totalFeeSats = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const payment of payments) {
    if (payment.type === "receive") {
      totalReceivedSats += payment.amount_sats;
    } else {
      totalSentSats += payment.amount_sats;
      totalFeeSats += payment.fee_sats ?? 0;
    }

    const normalizedStatus = payment.status.toLowerCase();
    if (normalizedStatus.includes("complete") || normalizedStatus.includes("paid") || normalizedStatus.includes("settled")) {
      completedCount += 1;
    } else if (normalizedStatus.includes("fail") || normalizedStatus.includes("error") || normalizedStatus.includes("cancel")) {
      failedCount += 1;
    } else {
      pendingCount += 1;
    }
  }

  return {
    totalCount: payments.length,
    totalReceivedSats,
    totalSentSats,
    totalFeeSats,
    netFlowSats: totalReceivedSats - totalSentSats - totalFeeSats,
    completedCount,
    pendingCount,
    failedCount,
  };
}

function buildDailyNetSeries(payments: PaymentHistoryRecord[], days: number): DailyNetPoint[] {
  const now = new Date();
  const buckets = new Map<string, number>();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    buckets.set(formatDateKey(date), 0);
  }

  for (const payment of payments) {
    const parsed = new Date(payment.timestamp);
    if (Number.isNaN(parsed.valueOf())) {
      continue;
    }

    const key = formatDateKey(parsed);
    if (!buckets.has(key)) {
      continue;
    }

    const delta = payment.type === "receive" ? payment.amount_sats : -(payment.amount_sats + (payment.fee_sats ?? 0));
    buckets.set(key, (buckets.get(key) ?? 0) + delta);
  }

  return Array.from(buckets.entries()).map(([day, net_sats]) => ({ day, net_sats }));
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function fetchLiveBalanceSats(apiKeyRaw: string | undefined): Promise<{ balance: number | null; error: string | null }> {
  const apiKey = normalizeOptionalString(apiKeyRaw);
  if (!apiKey) {
    return { balance: null, error: "No API key found in local config.json" };
  }

  try {
    const response = await fetch(`${getZbdApiBaseUrl()}/v0/wallet`, {
      method: "GET",
      headers: {
        apikey: apiKey,
      },
      cache: "no-store",
    });

    const payload = (await safeJson(response)) as unknown;
    if (!response.ok) {
      return { balance: null, error: `Balance lookup failed (${response.status})` };
    }

    const msatValue = parseMsatValue(payload);
    if (msatValue === null) {
      return { balance: null, error: "Balance response missing expected fields" };
    }

    return { balance: Math.floor(msatValue / 1000), error: null };
  } catch {
    return { balance: null, error: `Unable to reach ${getZbdApiBaseUrl()}` };
  }
}

function parseMsatValue(payload: unknown): number | null {
  const candidates = [
    getAtPath(payload, ["balanceMsat"]),
    getAtPath(payload, ["balance_msat"]),
    getAtPath(payload, ["balance"]),
    getAtPath(payload, ["data", "balanceMsat"]),
    getAtPath(payload, ["data", "balance_msat"]),
    getAtPath(payload, ["data", "balance"]),
  ];

  for (const candidate of candidates) {
    const parsed = toNumber(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  const satsCandidates = [
    getAtPath(payload, ["balanceSats"]),
    getAtPath(payload, ["balance_sats"]),
    getAtPath(payload, ["data", "balanceSats"]),
    getAtPath(payload, ["data", "balance_sats"]),
  ];

  for (const candidate of satsCandidates) {
    const parsed = toNumber(candidate);
    if (parsed !== null) {
      return parsed * 1000;
    }
  }

  return null;
}

function getAtPath(payload: unknown, path: string[]): unknown {
  let current = payload;
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function safeJson(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function getZbdApiBaseUrl(): string {
  return process.env.ZBD_API_BASE_URL ?? DEFAULT_ZBD_API_BASE_URL;
}
