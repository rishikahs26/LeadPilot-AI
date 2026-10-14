/**
 * GET  /api/leads/[id]/callsense  — list CallSense analyses for a lead
 * POST /api/leads/[id]/callsense  — analyze a transcript
 */

import { NextRequest, NextResponse } from "next/server";
import { getLeadById, getCallSenseHistory, createCallSenseRecord, updateCallSenseRecord } from "@/lib/store";
import { analyzeTranscriptWithAI, extractClaimsForFactCheck } from "@/lib/gemini";
import { runFactChecks } from "@/lib/factChecker";
import { ProposedLeadUpdate } from "@/types";

type Params = { params: { id: string } };

const MAX_TRANSCRIPT = 10000;

export async function GET(_req: NextRequest, { params }: Params) {
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Security: only return analyses that belong to this lead
  const history = getCallSenseHistory(params.id);
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest, { params }: Params) {
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  let body: { transcript: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.transcript?.trim()) {
    return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
  }

  const transcript = body.transcript.trim().slice(0, MAX_TRANSCRIPT);

  // Create a pending record immediately
  const record = createCallSenseRecord(params.id, transcript);

  try {
    // Run AI analysis on the transcript
    const analysisResult = await analyzeTranscriptWithAI(transcript, lead);

    // Extract claims for deterministic fact-checking
    const extractedClaims = await extractClaimsForFactCheck(transcript, lead);

    // Run deterministic fact checks
    const factCheckResults = runFactChecks(extractedClaims);

    // Build proposed lead updates based on updated requirements
    const proposedUpdates: ProposedLeadUpdate[] = [];
    const req = analysisResult.updatedRequirements;

    if (req.budget && req.budget !== lead.budget) {
      proposedUpdates.push({
        field: "budget",
        existingValue: lead.budget,
        proposedValue: req.budget,
        reason: "Customer mentioned a different budget during the conversation",
      });
    }
    if (req.location && req.location !== lead.location) {
      proposedUpdates.push({
        field: "location",
        existingValue: lead.location,
        proposedValue: req.location,
        reason: "Customer mentioned a different location during the conversation",
      });
    }
    if (req.possessionTimeline && req.possessionTimeline !== lead.buyingTimeline) {
      proposedUpdates.push({
        field: "buyingTimeline",
        existingValue: lead.buyingTimeline,
        proposedValue: req.possessionTimeline,
        reason: "Customer mentioned a different timeline during the conversation",
      });
    }
    if (req.propertyType && req.propertyType !== lead.propertyRequirement) {
      proposedUpdates.push({
        field: "propertyRequirement",
        existingValue: lead.propertyRequirement,
        proposedValue: req.propertyType,
        reason: "Customer mentioned a different property type during the conversation",
      });
    }

    // Save complete analysis
    const updated = updateCallSenseRecord(params.id, record.id, {
      analysisResult,
      factCheckResults,
      proposedUpdates,
      generatedFollowUp: analysisResult.suggestedFollowUp,
    });

    return NextResponse.json({ record: updated }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    updateCallSenseRecord(params.id, record.id, { error: msg });
    return NextResponse.json({ error: msg, recordId: record.id }, { status: 502 });
  }
}
