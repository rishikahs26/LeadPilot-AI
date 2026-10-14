/**
 * PATCH /api/leads/[id]/callsense/[csid]  — approve/reject proposed lead updates
 *                                           and update follow-up message
 */

import { NextRequest, NextResponse } from "next/server";
import { getLeadById, getCallSenseRecord, updateCallSenseRecord, updateLead } from "@/lib/store";
import { ProposedLeadUpdate } from "@/types";

type Params = { params: { id: string; csid: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  // Security: verify both lead and callsense record exist and are linked
  const lead = getLeadById(params.id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const record = getCallSenseRecord(params.id, params.csid);
  if (!record) return NextResponse.json({ error: "CallSense record not found or does not belong to this lead" }, { status: 404 });

  let body: {
    action: "approve-update" | "reject-update" | "update-followup";
    updateIndex?: number;
    editedValue?: string;
    followUp?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "approve-update" || body.action === "reject-update") {
    const idx = body.updateIndex;
    if (typeof idx !== "number" || idx < 0 || idx >= (record.proposedUpdates?.length ?? 0)) {
      return NextResponse.json({ error: "Invalid updateIndex" }, { status: 400 });
    }

    const proposedUpdates: ProposedLeadUpdate[] = [...(record.proposedUpdates || [])];
    const approvedUpdates: ProposedLeadUpdate[] = [...(record.approvedUpdates || [])];

    const update = { ...proposedUpdates[idx] };

    if (body.action === "approve-update") {
      const finalValue = body.editedValue?.trim() || update.proposedValue;
      update.approved = true;
      update.editedValue = finalValue;

      // Apply the approved change to the lead
      updateLead(params.id, { [update.field]: finalValue });
      approvedUpdates.push(update);
    } else {
      update.approved = false;
    }

    proposedUpdates[idx] = update;

    const updated = updateCallSenseRecord(params.id, params.csid, {
      proposedUpdates,
      approvedUpdates,
    });

    return NextResponse.json({ record: updated });
  }

  if (body.action === "update-followup") {
    if (!body.followUp) return NextResponse.json({ error: "followUp text required" }, { status: 400 });
    const updated = updateCallSenseRecord(params.id, params.csid, {
      generatedFollowUp: body.followUp.slice(0, 5000),
    });
    return NextResponse.json({ record: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
