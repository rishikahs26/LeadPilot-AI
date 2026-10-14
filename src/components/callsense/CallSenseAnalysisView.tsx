"use client";

import { useState } from "react";
import { CallSenseHistory } from "@/types";
import { QuestionTracker } from "./QuestionTracker";
import { FactCheckerResults } from "./FactCheckerResults";
import { FollowUpMessage } from "./FollowUpMessage";
import { LeadUpdateReview } from "./LeadUpdateReview";

interface Props {
  record: CallSenseHistory;
  leadId: string;
  onRecordChange: (updated: CallSenseHistory) => void;
}

type Tab = "overview" | "questions" | "factcheck" | "followup" | "updates";

export function CallSenseAnalysisView({ record, leadId, onRecordChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [followUp, setFollowUp] = useState(record.generatedFollowUp);

  const { analysisResult, error } = record;

  if (error || !analysisResult) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium text-sm">Analysis failed</p>
        <p className="text-red-600 text-sm mt-1">{error || "Unknown error"}</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "questions", label: "Questions", count: analysisResult.customerQuestions.length },
    { id: "factcheck", label: "Fact Check", count: record.factCheckResults.length },
    { id: "followup", label: "Follow-up" },
    { id: "updates", label: "Lead Updates", count: record.proposedUpdates.filter((u) => u.approved === undefined).length },
  ];

  const handleUpdateDecision = (idx: number, approved: boolean, editedValue?: string) => {
    const updated: CallSenseHistory = {
      ...record,
      proposedUpdates: record.proposedUpdates.map((u, i) =>
        i === idx ? { ...u, approved, editedValue: editedValue || u.proposedValue } : u
      ),
    };
    onRecordChange(updated);
  };

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-slate-200 text-slate-700 rounded-full px-1.5 py-0.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Customer facts */}
            {analysisResult.customerFacts.length > 0 && (
              <div>
                <h4 className="section-heading">📌 Customer Facts</h4>
                <ul className="space-y-1">
                  {analysisResult.customerFacts.map((f, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-green-500 shrink-0">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Objections */}
            {analysisResult.objectionsConcerns.length > 0 && (
              <div>
                <h4 className="section-heading">⚠️ Objections &amp; Concerns</h4>
                <ul className="space-y-1">
                  {analysisResult.objectionsConcerns.map((o, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Salesperson commitments */}
            {analysisResult.salespersonCommitments.length > 0 && (
              <div>
                <h4 className="section-heading">🤝 Salesperson Commitments</h4>
                <ul className="space-y-1.5">
                  {analysisResult.salespersonCommitments.map((c, i) => (
                    <li key={i} className={`text-sm flex gap-2 p-2 rounded ${c.requiresVerification ? "bg-red-50" : "bg-slate-50"}`}>
                      <span>{c.requiresVerification ? "⚠️" : "✓"}</span>
                      <span className="text-slate-700">{c.statement}</span>
                      {c.requiresVerification && (
                        <span className="text-xs text-red-600 ml-auto shrink-0">Needs verification</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing information */}
            {analysisResult.missingInformation.length > 0 && (
              <div>
                <h4 className="section-heading">❓ Missing Information</h4>
                <ul className="space-y-1">
                  {analysisResult.missingInformation.map((m, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-slate-400 shrink-0">•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended next actions */}
            {analysisResult.recommendedNextActions.length > 0 && (
              <div>
                <h4 className="section-heading">✅ Recommended Next Actions</h4>
                <ol className="space-y-1">
                  {analysisResult.recommendedNextActions.map((a, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-blue-500 shrink-0 font-medium">{i + 1}.</span> {a}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Questions tab */}
        {activeTab === "questions" && (
          <QuestionTracker
            questions={analysisResult.customerQuestions}
            unansweredQuestions={analysisResult.unansweredQuestions}
          />
        )}

        {/* Fact check tab */}
        {activeTab === "factcheck" && (
          <FactCheckerResults results={record.factCheckResults} />
        )}

        {/* Follow-up tab */}
        {activeTab === "followup" && (
          <FollowUpMessage
            leadId={leadId}
            csId={record.id}
            initialMessage={followUp}
            onUpdate={(newMsg) => {
              setFollowUp(newMsg);
              onRecordChange({ ...record, generatedFollowUp: newMsg });
            }}
          />
        )}

        {/* Updates tab */}
        {activeTab === "updates" && (
          <LeadUpdateReview
            leadId={leadId}
            csId={record.id}
            proposedUpdates={record.proposedUpdates}
            onUpdateDecision={handleUpdateDecision}
          />
        )}
      </div>

      {/* Timestamp footer */}
      <div className="px-4 pb-3 text-xs text-slate-400">
        Analysis run: {new Date(record.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
