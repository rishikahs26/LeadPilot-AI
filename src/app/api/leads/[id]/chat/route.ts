/**
 * GET  /api/leads/[id]/chat  — retrieve chat history for a lead
 * POST /api/leads/[id]/chat  — send a message and get an AI response
 */

import { NextRequest, NextResponse } from "next/server";
import { getLeadById, getChatHistory, appendChatMessage } from "@/lib/store";
import { chatAboutLead } from "@/lib/gemini";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const history = getChatHistory(params.id);
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest, { params }: Params) {
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  let body: { message: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const userMessage = body.message.trim().slice(0, 2000);

  // Save the user message
  const userMsg = appendChatMessage(params.id, "user", userMessage);

  // Get conversation history for context
  const history = getChatHistory(params.id);

  try {
    // AI call — grounded in this specific lead's context
    const response = await chatAboutLead(lead, history, userMessage);
    const assistantMsg = appendChatMessage(params.id, "assistant", response);
    return NextResponse.json({ userMessage: userMsg, assistantMessage: assistantMsg });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI response failed";
    return NextResponse.json({ error: msg, userMessage: userMsg }, { status: 502 });
  }
}
