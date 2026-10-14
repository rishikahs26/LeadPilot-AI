/**
 * store.ts — Simple JSON-file persistence layer
 *
 * Why JSON files?  Next.js API routes run as serverless functions on Vercel,
 * which does NOT persist files between invocations.  For the MVP we use this
 * in-memory + file approach for local development.  For production (Vercel)
 * we fall back to an in-memory Map that lasts for the lifetime of the Node
 * process.  A note in the README explains this limitation and how to migrate
 * to Vercel KV / Postgres for true persistence.
 */

import { Lead, ChatMessage, CallSenseHistory } from "@/types";
import path from "path";
import fs from "fs";

// Use Node's built-in crypto for UUID generation (no ESM issues in test environments)
function generateId(): string {
  return crypto.randomUUID();
}

// ----------------------------------------------------------------
// Determine storage strategy
// ----------------------------------------------------------------
const IS_SERVERLESS = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!IS_SERVERLESS && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ----------------------------------------------------------------
// Generic read/write helpers
// ----------------------------------------------------------------
function readJson<T>(file: string, fallback: T): T {
  if (IS_SERVERLESS) return fallback;
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(file: string, data: T): void {
  if (IS_SERVERLESS) return; // in-memory only on serverless
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ----------------------------------------------------------------
// In-memory caches (populated from disk on first access)
// ----------------------------------------------------------------
let _leads: Map<string, Lead> | null = null;
let _chat: Map<string, ChatMessage[]> | null = null;
let _callsense: Map<string, CallSenseHistory[]> | null = null;

function getLeadsMap(): Map<string, Lead> {
  if (_leads) return _leads;
  const arr = readJson<Lead[]>("leads.json", []);
  _leads = new Map(arr.map((l) => [l.id, l]));
  return _leads;
}

function getChatMap(): Map<string, ChatMessage[]> {
  if (_chat) return _chat;
  const arr = readJson<ChatMessage[]>("chat.json", []);
  _chat = new Map<string, ChatMessage[]>();
  for (const msg of arr) {
    const existing = _chat.get(msg.leadId) || [];
    _chat.set(msg.leadId, [...existing, msg]);
  }
  return _chat;
}

function getCallSenseMap(): Map<string, CallSenseHistory[]> {
  if (_callsense) return _callsense;
  const arr = readJson<CallSenseHistory[]>("callsense.json", []);
  _callsense = new Map<string, CallSenseHistory[]>();
  for (const cs of arr) {
    const existing = _callsense.get(cs.leadId) || [];
    _callsense.set(cs.leadId, [...existing, cs]);
  }
  return _callsense;
}

function persistLeads() {
  const arr = Array.from(getLeadsMap().values());
  writeJson("leads.json", arr);
}

function persistChat() {
  const arr: ChatMessage[] = [];
  for (const msgs of getChatMap().values()) arr.push(...msgs);
  writeJson("chat.json", arr);
}

function persistCallSense() {
  const arr: CallSenseHistory[] = [];
  for (const analyses of getCallSenseMap().values()) arr.push(...analyses);
  writeJson("callsense.json", arr);
}

// ----------------------------------------------------------------
// Lead CRUD
// ----------------------------------------------------------------
export function getAllLeads(): Lead[] {
  return Array.from(getLeadsMap().values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLeadById(id: string): Lead | null {
  return getLeadsMap().get(id) ?? null;
}

export function createLead(data: Omit<Lead, "id" | "createdAt" | "updatedAt" | "analysis">): Lead {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: generateId(),
    ...data,
    analysis: null,
    createdAt: now,
    updatedAt: now,
  };
  getLeadsMap().set(lead.id, lead);
  persistLeads();
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | null {
  const existing = getLeadsMap().get(id);
  if (!existing) return null;
  const updated: Lead = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  getLeadsMap().set(id, updated);
  persistLeads();
  return updated;
}

export function deleteLead(id: string): boolean {
  const existed = getLeadsMap().delete(id);
  if (existed) {
    persistLeads();
    // also clean up related data
    getChatMap().delete(id);
    persistChat();
    getCallSenseMap().delete(id);
    persistCallSense();
  }
  return existed;
}

// ----------------------------------------------------------------
// Chat CRUD
// ----------------------------------------------------------------
export function getChatHistory(leadId: string): ChatMessage[] {
  return getChatMap().get(leadId) ?? [];
}

export function appendChatMessage(leadId: string, role: "user" | "assistant", content: string): ChatMessage {
  const msg: ChatMessage = {
    id: generateId(),
    leadId,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
  const existing = getChatMap().get(leadId) ?? [];
  getChatMap().set(leadId, [...existing, msg]);
  persistChat();
  return msg;
}

// ----------------------------------------------------------------
// CallSense CRUD
// ----------------------------------------------------------------
export function getCallSenseHistory(leadId: string): CallSenseHistory[] {
  return getCallSenseMap().get(leadId) ?? [];
}

export function createCallSenseRecord(leadId: string, transcript: string): CallSenseHistory {
  const record: CallSenseHistory = {
    id: generateId(),
    leadId,
    transcript,
    analysisResult: null,
    factCheckResults: [],
    proposedUpdates: [],
    approvedUpdates: [],
    generatedFollowUp: "",
    createdAt: new Date().toISOString(),
  };
  const existing = getCallSenseMap().get(leadId) ?? [];
  getCallSenseMap().set(leadId, [...existing, record]);
  persistCallSense();
  return record;
}

export function updateCallSenseRecord(leadId: string, recordId: string, patch: Partial<CallSenseHistory>): CallSenseHistory | null {
  const existing = getCallSenseMap().get(leadId) ?? [];
  const idx = existing.findIndex((r) => r.id === recordId);
  if (idx === -1) return null;
  // Security: verify this record belongs to the given lead
  if (existing[idx].leadId !== leadId) return null;
  const updated = { ...existing[idx], ...patch };
  existing[idx] = updated;
  getCallSenseMap().set(leadId, existing);
  persistCallSense();
  return updated;
}

export function getCallSenseRecord(leadId: string, recordId: string): CallSenseHistory | null {
  const records = getCallSenseMap().get(leadId) ?? [];
  const record = records.find((r) => r.id === recordId);
  // Security check: ensure record belongs to the requested lead
  if (!record || record.leadId !== leadId) return null;
  return record;
}
