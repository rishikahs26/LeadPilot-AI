/**
 * GET  /api/leads  — list all leads
 * POST /api/leads  — create a lead + run AI analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { createLead, getAllLeads } from "@/lib/store";
import { analyzeLeadWithAI } from "@/lib/gemini";
import { CreateLeadRequest } from "@/types";

// Maximum character lengths to prevent abuse
const MAX_TEXT = 2000;
const MAX_NAME = 200;
const MAX_BUDGET = 100;

function sanitize(s: string, max: number): string {
  return String(s || "").trim().slice(0, max);
}

export async function GET() {
  try {
    const leads = getAllLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    console.error("GET /api/leads error:", err);
    return NextResponse.json({ error: "Failed to retrieve leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: CreateLeadRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  const { name, location, propertyRequirement, budget, buyingTimeline, customerMessage } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!location?.trim()) return NextResponse.json({ error: "Location is required" }, { status: 400 });
  if (!propertyRequirement?.trim()) return NextResponse.json({ error: "Property requirement is required" }, { status: 400 });
  if (!budget?.trim()) return NextResponse.json({ error: "Budget is required" }, { status: 400 });
  if (!buyingTimeline?.trim()) return NextResponse.json({ error: "Buying timeline is required" }, { status: 400 });
  if (!customerMessage?.trim()) return NextResponse.json({ error: "Customer message is required" }, { status: 400 });

  // Sanitize inputs
  const sanitized = {
    name: sanitize(name, MAX_NAME),
    location: sanitize(location, MAX_TEXT),
    propertyRequirement: sanitize(propertyRequirement, MAX_TEXT),
    budget: sanitize(budget, MAX_BUDGET),
    buyingTimeline: sanitize(buyingTimeline, MAX_TEXT),
    customerMessage: sanitize(customerMessage, MAX_TEXT),
  };

  // Create lead record first (so it's not lost if AI fails)
  const lead = createLead(sanitized);

  // Run AI analysis
  let analysis = null;
  let analysisError: string | undefined;
  try {
    analysis = await analyzeLeadWithAI(lead);
  } catch (err) {
    analysisError = err instanceof Error ? err.message : "AI analysis failed";
    console.error("AI analysis error for lead", lead.id, analysisError);
  }

  // Save analysis (or error) back to the lead
  const { updateLead } = await import("@/lib/store");
  const updated = updateLead(lead.id, {
    analysis,
    analysisError,
  });

  return NextResponse.json({ lead: updated || lead }, { status: 201 });
}
