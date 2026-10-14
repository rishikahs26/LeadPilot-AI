/**
 * GET    /api/leads/[id]  — get a single lead
 * PATCH  /api/leads/[id]  — update lead fields (human-approved changes)
 * DELETE /api/leads/[id]  — delete a lead
 */

import { NextRequest, NextResponse } from "next/server";
import { getLeadById, updateLead, deleteLead } from "@/lib/store";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const existing = getLeadById(params.id);
  if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only allow certain fields to be updated via this route
  const allowed = ["budget", "location", "propertyRequirement", "buyingTimeline"] as const;
  const patch: Partial<typeof existing> = {};
  for (const field of allowed) {
    if (field in body && typeof body[field] === "string") {
      patch[field] = String(body[field]).trim().slice(0, 2000);
    }
  }

  const updated = updateLead(params.id, patch);
  return NextResponse.json({ lead: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const existed = deleteLead(params.id);
  if (!existed) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
