"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ----------------------------------------------------------------
// Lead intake form — all 6 required fields
// ----------------------------------------------------------------
interface FormData {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  propertyRequirement?: string;
  budget?: string;
  buyingTimeline?: string;
  customerMessage?: string;
}

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "",
    location: "",
    propertyRequirement: "",
    budget: "",
    buyingTimeline: "",
    customerMessage: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Customer name is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.propertyRequirement.trim()) errs.propertyRequirement = "Property requirement is required";
    if (!form.budget.trim()) errs.budget = "Budget is required";
    if (!form.buyingTimeline.trim()) errs.buyingTimeline = "Buying timeline is required";
    if (!form.customerMessage.trim()) errs.customerMessage = "Customer message is required";
    else if (form.customerMessage.trim().length < 10) errs.customerMessage = "Please provide more detail (at least 10 characters)";
    if (form.name.length > 200) errs.name = "Name is too long (max 200 characters)";
    if (form.customerMessage.length > 2000) errs.customerMessage = "Message is too long (max 2000 characters)";
    
    // Smart validation: check if customer message mentions a different name
    const messageLower = form.customerMessage.toLowerCase();
    const formNameLower = form.name.toLowerCase().trim();
    if (formNameLower && messageLower.includes("my name is") && !messageLower.includes(formNameLower)) {
      errs.customerMessage = "⚠️ The customer message mentions a different name than the form. Please verify the data is correct.";
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Failed to create lead. Please try again.");
        return;
      }

      router.push(`/leads/${data.lead.id}`);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors mb-6">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50 animate-pulse">
            <span className="text-4xl">📝</span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 tracking-tight">Add New Lead</h1>
          <p className="body-large text-slate-600 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-6 py-3 rounded-2xl border-2 border-purple-200">
            Enter customer details below. Our AI will automatically analyze the lead and provide insights to help you close the deal.
          </p>
        </div>
      </div>

      {/* Enhanced Form */}
      <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6" noValidate>
        {/* Customer Information Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-xl">👤</span>
            </div>
            <h2 className="heading-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Customer Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="label">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="e.g. Rahul Sharma"
                className={`input ${errors.name ? "border-red-400 focus:ring-red-400" : ""}`}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={submitting}
                maxLength={200}
              />
              {errors.name && <p id="name-error" className="text-red-600 text-xs mt-2 font-medium">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="label">
                Location / Area <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={handleChange("location")}
                placeholder="e.g. Whitefield, Bangalore"
                className={`input ${errors.location ? "border-red-400 focus:ring-red-400" : ""}`}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? "location-error" : undefined}
                disabled={submitting}
              />
              {errors.location && <p id="location-error" className="text-red-600 text-xs mt-2 font-medium">{errors.location}</p>}
            </div>
          </div>
        </div>

        {/* Property Requirements Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <span className="text-xl">🏠</span>
            </div>
            <h2 className="heading-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Property Requirements</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property requirement */}
            <div>
              <label htmlFor="propertyRequirement" className="label">
                Property Type <span className="text-red-500">*</span>
              </label>
              <input
                id="propertyRequirement"
                type="text"
                value={form.propertyRequirement}
                onChange={handleChange("propertyRequirement")}
                placeholder="e.g. 3BHK apartment, south-facing"
                className={`input ${errors.propertyRequirement ? "border-red-400 focus:ring-red-400" : ""}`}
                aria-invalid={!!errors.propertyRequirement}
                aria-describedby={errors.propertyRequirement ? "prop-error" : undefined}
                disabled={submitting}
              />
              {errors.propertyRequirement && <p id="prop-error" className="text-red-600 text-xs mt-2 font-medium">{errors.propertyRequirement}</p>}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="label">
                Budget Range <span className="text-red-500">*</span>
              </label>
              <input
                id="budget"
                type="text"
                value={form.budget}
                onChange={handleChange("budget")}
                placeholder="e.g. ₹80 lakh, ₹1.2 crore"
                className={`input ${errors.budget ? "border-red-400 focus:ring-red-400" : ""}`}
                aria-invalid={!!errors.budget}
                aria-describedby={errors.budget ? "budget-error" : undefined}
                disabled={submitting}
                maxLength={100}
              />
              {errors.budget && <p id="budget-error" className="text-red-600 text-xs mt-2 font-medium">{errors.budget}</p>}
            </div>
          </div>
        </div>

        {/* Timeline & Message Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/40">
              <span className="text-xl">⏰</span>
            </div>
            <h2 className="heading-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Timeline & Message</h2>
          </div>
          
          {/* Buying timeline */}
          <div className="mb-6">
            <label htmlFor="buyingTimeline" className="label">
              Buying Timeline <span className="text-red-500">*</span>
            </label>
            <select
              id="buyingTimeline"
              value={form.buyingTimeline}
              onChange={handleChange("buyingTimeline")}
              className={`select ${errors.buyingTimeline ? "border-red-400 focus:ring-red-400" : ""}`}
              aria-invalid={!!errors.buyingTimeline}
              disabled={submitting}
            >
              <option value="">Select timeline...</option>
              <option value="Immediate (within 1 month)">🚀 Immediate (within 1 month)</option>
              <option value="1–3 months">📅 1–3 months</option>
              <option value="3–6 months">📈 3–6 months</option>
              <option value="6–12 months">📊 6–12 months</option>
              <option value="More than 1 year">🔮 More than 1 year</option>
              <option value="Just browsing / research">🔍 Just browsing / research</option>
            </select>
            {errors.buyingTimeline && <p className="text-red-600 text-xs mt-2 font-medium">{errors.buyingTimeline}</p>}
          </div>

          {/* Customer message */}
          <div>
            <label htmlFor="customerMessage" className="label">
              Customer Message / Inquiry <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-600 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 <strong>Pro tip:</strong> Paste the customer&apos;s inquiry, chat message, or call notes. Make sure this message matches the customer name and details above for accurate AI analysis.
            </p>
            <textarea
              id="customerMessage"
              value={form.customerMessage}
              onChange={handleChange("customerMessage")}
              placeholder="e.g. Hi, I'm looking for a 3BHK apartment in Whitefield within ₹80 lakh. I need to move in within 2 months. Please share available options with good connectivity..."
              rows={6}
              className={`textarea ${errors.customerMessage ? "border-red-400 focus:ring-red-400" : ""}`}
              aria-invalid={!!errors.customerMessage}
              aria-describedby={errors.customerMessage ? "msg-error" : undefined}
              disabled={submitting}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.customerMessage ? (
                <p id="msg-error" className="text-red-600 text-xs font-medium">{errors.customerMessage}</p>
              ) : (
                <div className="text-xs text-slate-500">
                  Add as much detail as possible for better AI analysis
                </div>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {form.customerMessage.length}/2000
              </span>
            </div>
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="text-red-800 font-semibold text-sm">Error</p>
                <p className="text-red-700 text-sm mt-1">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Submit Section */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 rounded-2xl p-6 space-y-4 border-2 border-purple-300 shadow-xl shadow-purple-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/40">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-sm mb-2">AI Analysis Included</h3>
              <p className="text-xs text-slate-700 font-semibold">
                Our AI will automatically analyze this lead and provide insights including priority scoring, customer intent, key requirements, and recommended next actions.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn-primary flex-1 flex items-center justify-center gap-3 py-4 shadow-2xl shadow-purple-500/50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-black">Saving & Analyzing...</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <span className="font-black">Save Lead & Run AI Analysis</span>
                </>
              )}
            </button>
            <Link href="/" className="btn-secondary px-8 py-4">
              Cancel
            </Link>
          </div>

          {submitting && (
            <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-4">
              <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-center">
                🔮 Running AI analysis with Gemini 3.5 Flash Lite... this may take a few seconds.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
