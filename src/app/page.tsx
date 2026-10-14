"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lead } from "@/types";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

type Priority = "hot" | "warm" | "cold";

// Priority order for sorting
const priorityOrder: Record<Priority, number> = { hot: 0, warm: 1, cold: 2 };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("priority");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lead");
    } finally {
      setDeleteConfirm(null);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter and sort
  const filtered = leads
    .filter((lead) => {
      const matchesSearch = search === "" || 
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.location.toLowerCase().includes(search.toLowerCase()) ||
        lead.propertyRequirement.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === "all" || lead.analysis?.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const pa = a.analysis?.priority ?? "cold";
        const pb = b.analysis?.priority ?? "cold";
        const diff = priorityOrder[pa] - priorityOrder[pb];
        if (diff !== 0) return diff;
        return (b.analysis?.priorityScore ?? 0) - (a.analysis?.priorityScore ?? 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const hot = leads.filter((l) => l.analysis?.priority === "hot").length;
  const warm = leads.filter((l) => l.analysis?.priority === "warm").length;
  const cold = leads.filter((l) => l.analysis?.priority === "cold").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="heading-xl text-slate-900 mb-2">Lead Dashboard</h1>
            <p className="body-large text-slate-600">
              Manage and prioritize your real estate opportunities with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/leads/new" className="btn-primary flex items-center gap-2 shadow-2xl shadow-purple-500/40 glow-purple">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">+</span>
              </div>
              <span>Add New Lead</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600">{leads.length}</div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📊</span>
            </div>
          </div>
          <p className="caption text-slate-700">Total Leads</p>
          <div className="mt-3 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            {leads.length > 0 ? `Active opportunities` : 'Get started'}
          </div>
        </div>

        <div className="stats-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-pink-600">{hot}</div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50 group-hover:scale-110 transition-transform duration-300 animate-pulse">
              <span className="text-3xl">🔥</span>
            </div>
          </div>
          <p className="caption text-slate-700">Hot Leads</p>
          <div className="mt-3 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
            {hot > 0 ? 'Requires immediate action' : 'No urgent leads'}
          </div>
        </div>

        <div className="stats-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600">{warm}</div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">☀️</span>
            </div>
          </div>
          <p className="caption text-slate-700">Warm Leads</p>
          <div className="mt-3 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
            {warm > 0 ? 'Follow-up in progress' : 'No warm leads'}
          </div>
        </div>

        <div className="stats-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sky-500 to-cyan-600">{cold}</div>
            <div className="w-14 h-14 bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/50 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">❄️</span>
            </div>
          </div>
          <p className="caption text-slate-700">Cold Leads</p>
          <div className="mt-3 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">
            {cold > 0 ? 'Long-term nurturing' : 'No cold leads'}
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, location, or property type..."
              className="input w-full"
              aria-label="Search leads"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
              className="select min-w-[140px]"
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              <option value="hot">🔥 Hot leads</option>
              <option value="warm">☀️ Warm leads</option>
              <option value="cold">❄️ Cold leads</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "priority")}
              className="select min-w-[140px]"
              aria-label="Sort by"
            >
              <option value="priority">Sort: Priority</option>
              <option value="date">Sort: Date added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-8 text-center border-red-200 bg-red-50">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-700 font-semibold mb-2">Something went wrong</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={fetchLeads} className="btn-secondary text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Empty States */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          {leads.length === 0 ? (
            <div className="bounce-in">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20 border-2 border-purple-200">
                <span className="text-5xl">🏠</span>
              </div>
              <h3 className="heading-md text-slate-900 mb-3">Welcome to LeadPilot</h3>
              <p className="body-large text-slate-600 mb-6 max-w-md mx-auto">
                Start building your real estate pipeline by adding your first lead. Our AI will analyze and prioritize them automatically.
              </p>
              <Link href="/leads/new" className="btn-primary inline-flex items-center gap-2 shadow-2xl shadow-purple-500/40">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">+</span>
                </div>
                <span>Add Your First Lead</span>
              </Link>
            </div>
          ) : (
            <div className="fade-in">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="heading-md text-slate-900 mb-2">No leads match your filters</h3>
              <p className="body-large text-slate-600 mb-4">
                Try adjusting your search criteria or clear the filters.
              </p>
              <button 
                onClick={() => { setSearch(""); setFilterPriority("all"); }} 
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Leads List */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((lead, index) => (
            <div 
              key={lead.id} 
              className="priority-card p-6 fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Lead Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="heading-sm text-slate-900 mb-1">{lead.name}</h3>
                        <div className="flex items-center gap-2">
                          {lead.analysis ? (
                            <PriorityBadge priority={lead.analysis.priority} score={lead.analysis.priorityScore} />
                          ) : lead.analysisError ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200">
                              <span>⚠️</span> Analysis failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 animate-pulse">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                              Analyzing...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📍</span>
                      <span className="text-slate-700 font-medium">{lead.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">🏗️</span>
                      <span className="text-slate-700 font-medium">{lead.propertyRequirement}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">💰</span>
                      <span className="text-slate-700 font-medium">{lead.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">⏰</span>
                      <span className="text-slate-700 font-medium">{lead.buyingTimeline}</span>
                    </div>
                  </div>

                  {/* AI Analysis Summary */}
                  {lead.analysis?.summary && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="body-small text-slate-700 line-clamp-2 mb-2">
                        {lead.analysis.summary}
                      </p>
                      {lead.analysis.priorityReason && (
                        <p className="text-xs text-slate-500 italic">
                          <strong>Priority:</strong> {lead.analysis.priorityReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View Details →
                      </Link>
                      {lead.analysis && (
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold">{lead.analysis.keyRequirements.length}</span> requirements •{" "}
                          <span className="font-semibold">{lead.analysis.objectionsConcerns.length}</span> concerns
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(lead.id)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                      aria-label={`Delete lead for ${lead.name}`}
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="card-elevated p-6 max-w-md w-full scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="heading-md text-slate-900 mb-2">Delete Lead?</h3>
              <p className="body-small text-slate-600 mb-6">
                This will permanently remove the lead and all its analysis, conversation history, and CallSense data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDelete(deleteConfirm)} 
                  className="btn-danger flex-1"
                >
                  Delete Permanently
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}