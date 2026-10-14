"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Lead } from "@/types";
import { LeadAnalysis } from "@/components/LeadAnalysis";
import { LeadChat } from "@/components/LeadChat";
import { CallSenseSection } from "@/components/callsense/CallSenseSection";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// ----------------------------------------------------------------
// Lead detail page — analysis, chat, and CallSense
// ----------------------------------------------------------------
export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState<"analysis" | "chat" | "callsense">("analysis");

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (!res.ok) {
        if (res.status === 404) { setError("Lead not found"); return; }
        throw new Error("Failed to load lead");
      }
      const data = await res.json();
      setLead(data.lead);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lead");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/leads/${id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setLead(data.lead);
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600 text-lg">{error || "Lead not found"}</p>
        <Link href="/" className="btn-primary mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Dashboard</Link>

      {/* Lead info header */}
      <div className="mt-4 mb-6 card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-2">
              <span>📍 {lead.location}</span>
              <span>🏗 {lead.propertyRequirement}</span>
              <span>💰 {lead.budget}</span>
              <span>⏱ {lead.buyingTimeline}</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 shrink-0">
            Added {new Date(lead.createdAt).toLocaleDateString()}
          </div>
        </div>

        {lead.customerMessage && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Customer Message</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.customerMessage}</p>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg">
        {[
          { id: "analysis" as const, label: "📊 AI Analysis" },
          { id: "chat" as const, label: "💬 Ask AI" },
          { id: "callsense" as const, label: "🔍 CallSense" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === "analysis" && (
        <LeadAnalysis lead={lead} onReanalyze={handleReanalyze} reanalyzing={reanalyzing} />
      )}

      {activeSection === "chat" && (
        <LeadChat leadId={lead.id} leadName={lead.name} />
      )}

      {activeSection === "callsense" && (
        <CallSenseSection leadId={lead.id} leadName={lead.name} />
      )}
    </div>
  );
}
