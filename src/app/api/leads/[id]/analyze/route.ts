/**
 * POST /api/leads/[id]/analyze  — re-run AI analysis on an existing lead
 */

import { NextRequest, NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/store";
import { analyzeLeadWithAI } from "@/lib/gemini";

type Params = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  try {
    const analysis = await analyzeLeadWithAI(lead);
    const updated = updateLead(params.id, { analysis, analysisError: undefined });
    return NextResponse.json({ lead: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI analysis failed";
    updateLead(params.id, { analysisError: msg });
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
