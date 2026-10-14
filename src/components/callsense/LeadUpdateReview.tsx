"use client";

import { useState } from "react";
import { ProposedLeadUpdate } from "@/types";

interface Props {
  leadId: string;
  csId: string;
  proposedUpdates: ProposedLeadUpdate[];
  onUpdateDecision: (idx: number, approved: boolean, editedValue?: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  budget: "Budget",
  location: "Location",
  propertyRequirement: "Property Requirement",
  buyingTimeline: "Buying Timeline",
};

export function LeadUpdateReview({ leadId, csId, proposedUpdates, onUpdateDecision }: Props) {
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  const pending = proposedUpdates.filter((u) => u.approved === undefined);

  if (pending.length === 0) {
    const approved = proposedUpdates.filter((u) => u.approved === true);
    const rejected = proposedUpdates.filter((u) => u.approved === false);

    if (proposedUpdates.length === 0) {
      return (
        <p className="text-slate-400 text-sm italic">
          No proposed lead updates from this analysis.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {approved.map((u, i) => (
          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-green-600">✓</span>
            <span className="font-medium text-green-800">{FIELD_LABELS[u.field]}</span>
            <span className="text-green-700">updated to: {u.editedValue || u.proposedValue}</span>
          </div>
        ))}
        {rejected.map((u, i) => (
          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400">✗</span>
            <span className="text-slate-500">{FIELD_LABELS[u.field]} update rejected</span>
          </div>
        ))}
      </div>
    );
  }

  const handleDecision = async (
    globalIdx: number,
    approved: boolean,
    editedValue?: string
  ) => {
    setProcessing((p) => ({ ...p, [globalIdx]: true }));
    setErrors((e) => ({ ...e, [globalIdx]: "" }));

    try {
      const res = await fetch(`/api/leads/${leadId}/callsense/${csId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: approved ? "approve-update" : "reject-update",
          updateIndex: globalIdx,
          editedValue,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrors((e) => ({ ...e, [globalIdx]: d.error || "Action failed" }));
        return;
      }

      onUpdateDecision(globalIdx, approved, editedValue);
    } catch {
      setErrors((e) => ({ ...e, [globalIdx]: "Network error" }));
    } finally {
      setProcessing((p) => ({ ...p, [globalIdx]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <strong>Human review required.</strong> CallSense detected possible changes to this lead&apos;s information based on the transcript. Review each proposed update and approve or reject it. Only approved changes will be saved.
      </div>

      {proposedUpdates.map((update, idx) => {
        if (update.approved !== undefined) {
          return (
            <div key={idx} className={`p-3 rounded-lg border text-sm ${update.approved ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
              <span className={update.approved ? "text-green-700" : "text-slate-500"}>
                {update.approved ? "✓ Approved:" : "✗ Rejected:"} {FIELD_LABELS[update.field]}
                {update.approved && ` → ${update.editedValue || update.proposedValue}`}
              </span>
            </div>
          );
        }

        return (
          <div key={idx} className="border border-amber-300 rounded-lg p-4 bg-white">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Proposed update: <span className="text-blue-700">{FIELD_LABELS[update.field]}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div className="bg-slate-50 rounded p-2">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Current value</p>
                <p className="text-slate-800">{update.existingValue}</p>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <p className="text-xs font-medium text-blue-600 uppercase mb-1">Proposed value</p>
                <p className="text-blue-800">{update.proposedValue}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3 italic">Reason: {update.reason}</p>

            {/* Editable proposed value */}
            <div className="mb-3">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Edit before approving (optional):
              </label>
              <input
                type="text"
                value={editValues[idx] ?? update.proposedValue}
                onChange={(e) => setEditValues((v) => ({ ...v, [idx]: e.target.value }))}
                className="input text-sm"
                disabled={processing[idx]}
                aria-label={`Edit proposed ${FIELD_LABELS[update.field]}`}
              />
            </div>

            {errors[idx] && <p className="text-red-600 text-xs mb-2">{errors[idx]}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => handleDecision(idx, true, editValues[idx])}
                disabled={processing[idx]}
                className="btn-primary text-sm flex-1"
              >
                {processing[idx] ? "Saving…" : "✓ Approve"}
              </button>
              <button
                onClick={() => handleDecision(idx, false)}
                disabled={processing[idx]}
                className="btn-secondary text-sm flex-1"
              >
                ✗ Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
