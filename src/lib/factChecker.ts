/**
 * factChecker.ts — Deterministic Promise & Fact Checker
 *
 * This module uses DETERMINISTIC application logic to compare claims
 * extracted from a transcript against the illustrative property dataset.
 *
 * The LLM extracts and identifies claims (what was said).
 * THIS module decides whether those claims are verified (fact-checking).
 *
 * Separation of concerns:
 *   LLM  → "what claims were made?"
 *   THIS → "are those claims consistent with available data?"
 */

import { FactCheckResult } from "@/types";
import { findMatchingProperties } from "./propertyData";

// ----------------------------------------------------------------
// Budget claim checker
// ----------------------------------------------------------------
export function checkBudgetClaim(
  claimedBudgetLakhs: number,
  location: string,
  configuration: string
): FactCheckResult {
  const matches = findMatchingProperties(location, configuration);

  if (matches.length === 0) {
    return {
      claim: `Budget of ₹${claimedBudgetLakhs} lakh for ${configuration} in ${location}`,
      source: "ai-extracted",
      status: "Unsupported by Available Data",
      evidence: "No illustrative properties found for this location/configuration in the demo dataset.",
      recommendation: "Confirm actual pricing with the inventory team before quoting a budget match.",
    };
  }

  const cheapest = Math.min(...matches.map((p) => p.startingPriceL));
  const difference = cheapest - claimedBudgetLakhs;

  if (difference <= 0) {
    return {
      claim: `Budget of ₹${claimedBudgetLakhs} lakh fits available ${configuration} in ${location}`,
      source: "ai-extracted",
      status: "Verified against available data",
      evidence: `Illustrative data shows ${matches[0].name} starting at ₹${cheapest} lakh — within the stated budget.`,
      recommendation: "Confirm exact pricing with the sales team. Illustrative data only.",
    };
  }

  return {
    claim: `Budget of ₹${claimedBudgetLakhs} lakh for ${configuration} in ${location}`,
    source: "ai-extracted",
    status: "Conflict — Human Review Required",
    evidence: `Illustrative data shows cheapest matching property (${matches[0].name}) starting at ₹${cheapest} lakh — ₹${difference} lakh above the stated budget.`,
    recommendation: `Inform the customer that options in this range start at approximately ₹${cheapest} lakh in our illustrative dataset. Confirm actual pricing before responding.`,
  };
}

// ----------------------------------------------------------------
// Possession date claim checker
// ----------------------------------------------------------------
export function checkPossessionClaim(
  claimedMonth: string,    // e.g. "December 2024" or "December"
  location: string,
  configuration: string
): FactCheckResult {
  const matches = findMatchingProperties(location, configuration);

  if (matches.length === 0) {
    return {
      claim: `Possession by ${claimedMonth} for ${configuration} in ${location}`,
      source: "ai-extracted",
      status: "Unsupported by Available Data",
      evidence: "No illustrative properties found for this combination.",
      recommendation: "Confirm possession timeline with the project team before making any commitment.",
    };
  }

  const withDates = matches.filter((p) => p.possessionDate !== null);

  if (withDates.length === 0) {
    return {
      claim: `Possession by ${claimedMonth}`,
      source: "ai-extracted",
      status: "Unverified",
      evidence: `Matching properties (${matches.map((p) => p.name).join(", ")}) have no possession date in the illustrative dataset.`,
      recommendation: "Do NOT commit to a possession date without official confirmation from the project team.",
    };
  }

  return {
    claim: `Possession by ${claimedMonth}`,
    source: "ai-extracted",
    status: "Unverified",
    evidence: `Illustrative data shows possession dates for matching properties but these are demo records and may not reflect actual schedules.`,
    recommendation: "Verify the official possession schedule before responding to the customer.",
  };
}

// ----------------------------------------------------------------
// Discount claim checker
// ----------------------------------------------------------------
export function checkDiscountClaim(
  location: string,
  configuration: string
): FactCheckResult {
  const matches = findMatchingProperties(location, configuration);

  if (matches.length === 0) {
    return {
      claim: "Discount available on the property",
      source: "ai-extracted",
      status: "Unsupported by Available Data",
      evidence: "No matching properties in the illustrative dataset.",
      recommendation: "Confirm discount policy with the sales manager before communicating to the customer.",
    };
  }

  const explicitFalse = matches.filter((p) => p.discountAvailable === false);
  const explicitTrue = matches.filter((p) => p.discountAvailable === true);
  const unknown = matches.filter((p) => p.discountAvailable === null);

  if (unknown.length > 0) {
    return {
      claim: "Discount available on the property",
      source: "ai-extracted",
      status: "Unverified",
      evidence: `Discount policy for ${unknown.map((p) => p.name).join(", ")} is not recorded in the illustrative dataset.`,
      recommendation: "Do NOT promise a discount without written confirmation from an authorized source.",
    };
  }

  if (explicitFalse.length > 0 && explicitTrue.length === 0) {
    return {
      claim: "Discount available on the property",
      source: "ai-extracted",
      status: "Conflict — Human Review Required",
      evidence: `Illustrative data indicates no discount is available for ${explicitFalse.map((p) => p.name).join(", ")}.`,
      recommendation: "This claim conflicts with available data. Confirm before proceeding.",
    };
  }

  return {
    claim: "Discount available on the property",
    source: "ai-extracted",
    status: "Unverified",
    evidence: "Discount availability cannot be confirmed from the illustrative dataset alone.",
    recommendation: "Confirm discount eligibility with the sales manager.",
  };
}

// ----------------------------------------------------------------
// Parking claim checker
// ----------------------------------------------------------------
export function checkParkingClaim(
  hasCoveredParking: boolean,
  location: string,
  configuration: string
): FactCheckResult {
  const matches = findMatchingProperties(location, configuration);

  if (matches.length === 0) {
    return {
      claim: `Covered parking ${hasCoveredParking ? "included" : "not included"}`,
      source: "ai-extracted",
      status: "Unsupported by Available Data",
      evidence: "No matching illustrative properties found.",
      recommendation: "Confirm parking details with the property team.",
    };
  }

  const withKnownParking = matches.filter((p) => p.coveredParking !== null);

  if (withKnownParking.length === 0) {
    return {
      claim: `Covered parking ${hasCoveredParking ? "included" : "not included"}`,
      source: "ai-extracted",
      status: "Unverified",
      evidence: `Parking information is not recorded for ${matches.map((p) => p.name).join(", ")} in the illustrative dataset.`,
      recommendation: "Ask the customer to wait for confirmation on covered parking availability.",
    };
  }

  const conflicting = withKnownParking.filter((p) => p.coveredParking !== hasCoveredParking);
  if (conflicting.length > 0) {
    return {
      claim: `Covered parking ${hasCoveredParking ? "included" : "not included"}`,
      source: "ai-extracted",
      status: "Conflict — Human Review Required",
      evidence: `Illustrative data for ${conflicting.map((p) => p.name).join(", ")} shows covered parking as ${conflicting[0].coveredParking ? "available" : "NOT available"}.`,
      recommendation: "Clarify parking details before confirming to the customer.",
    };
  }

  return {
    claim: `Covered parking ${hasCoveredParking ? "included" : "not included"}`,
    source: "ai-extracted",
    status: "Verified against available data",
    evidence: `Illustrative data confirms covered parking status for ${withKnownParking.map((p) => p.name).join(", ")}.`,
    recommendation: "Verify with the official property brochure before confirming.",
  };
}

// ----------------------------------------------------------------
// Main orchestrator — runs all relevant checks
// ----------------------------------------------------------------
export interface ExtractedClaims {
  budgetLakhs?: number;
  possessionMonth?: string;
  discountClaimed?: boolean;
  parkingClaimed?: boolean;
  location: string;
  configuration: string;
}

export function runFactChecks(claims: ExtractedClaims): FactCheckResult[] {
  const results: FactCheckResult[] = [];

  if (claims.budgetLakhs !== undefined) {
    results.push(checkBudgetClaim(claims.budgetLakhs, claims.location, claims.configuration));
  }

  if (claims.possessionMonth) {
    results.push(checkPossessionClaim(claims.possessionMonth, claims.location, claims.configuration));
  }

  if (claims.discountClaimed === true) {
    results.push(checkDiscountClaim(claims.location, claims.configuration));
  }

  if (claims.parkingClaimed !== undefined) {
    results.push(checkParkingClaim(claims.parkingClaimed, claims.location, claims.configuration));
  }

  return results;
}
