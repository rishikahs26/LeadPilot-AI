/**
 * propertyData.ts — Illustrative demo property dataset
 *
 * IMPORTANT: These records are fictional, illustrative demo data only.
 * They do NOT represent real, current, or official property listings.
 * They exist solely to demonstrate the Promise & Fact Checker feature.
 * Never present them to customers as verified inventory.
 */

import { PropertyRecord } from "@/types";

export const ILLUSTRATIVE_PROPERTIES: PropertyRecord[] = [
  {
    id: "prop-001",
    name: "Whitefield Heights",
    location: "Whitefield, Bangalore",
    configuration: "3BHK",
    startingPriceL: 85,
    possessionDate: null, // not confirmed
    coveredParking: true,
    discountAvailable: null, // policy unknown
    notes: "Premium apartments near Whitefield tech corridor.",
    isIllustrativeData: true,
  },
  {
    id: "prop-002",
    name: "Sarjapur Residency",
    location: "Sarjapur Road, Bangalore",
    configuration: "2BHK",
    startingPriceL: 55,
    possessionDate: "2025-06-30",
    coveredParking: true,
    discountAvailable: false,
    notes: "Ready-to-move units with modular kitchen.",
    isIllustrativeData: true,
  },
  {
    id: "prop-003",
    name: "Koramangala Grand",
    location: "Koramangala, Bangalore",
    configuration: "4BHK",
    startingPriceL: 140,
    possessionDate: "2025-12-31",
    coveredParking: true,
    discountAvailable: null,
    notes: "Luxury units in central Koramangala.",
    isIllustrativeData: true,
  },
  {
    id: "prop-004",
    name: "Electronic City Nest",
    location: "Electronic City, Bangalore",
    configuration: "2BHK",
    startingPriceL: 42,
    possessionDate: "2025-03-31",
    coveredParking: false,
    discountAvailable: true,
    notes: "Affordable units near Electronic City IT hub.",
    isIllustrativeData: true,
  },
  {
    id: "prop-005",
    name: "Indiranagar Terraces",
    location: "Indiranagar, Bangalore",
    configuration: "3BHK",
    startingPriceL: 110,
    possessionDate: null,
    coveredParking: null, // information not available
    discountAvailable: null,
    notes: "Under-construction boutique development.",
    isIllustrativeData: true,
  },
  {
    id: "prop-006",
    name: "Malleshwaram Classic",
    location: "Malleshwaram, Bangalore",
    configuration: "3BHK",
    startingPriceL: 95,
    possessionDate: "2025-09-30",
    coveredParking: true,
    discountAvailable: true,
    notes: "Premium apartments in heritage Malleshwaram neighborhood.",
    isIllustrativeData: true,
  },
  {
    id: "prop-007",
    name: "HSR Layout Heights",
    location: "HSR Layout, Bangalore",
    configuration: "2BHK",
    startingPriceL: 68,
    possessionDate: "2025-07-31",
    coveredParking: true,
    discountAvailable: false,
    notes: "Modern apartments near HSR Layout Sector 1.",
    isIllustrativeData: true,
  },
  {
    id: "prop-008",
    name: "Jayanagar Gardens",
    location: "Jayanagar, Bangalore",
    configuration: "3BHK",
    startingPriceL: 88,
    possessionDate: "2025-10-31",
    coveredParking: true,
    discountAvailable: null,
    notes: "Spacious units with large balconies in Jayanagar 4th Block.",
    isIllustrativeData: true,
  },
  {
    id: "prop-009",
    name: "Bellandur Tech Park Residency",
    location: "Bellandur, Bangalore",
    configuration: "2BHK",
    startingPriceL: 62,
    possessionDate: "2025-05-31",
    coveredParking: true,
    discountAvailable: true,
    notes: "Convenient apartments near tech parks and Outer Ring Road.",
    isIllustrativeData: true,
  },
  {
    id: "prop-010",
    name: "Yeshwanthpur Metro Homes",
    location: "Yeshwanthpur, Bangalore",
    configuration: "1BHK",
    startingPriceL: 35,
    possessionDate: "2025-04-30",
    coveredParking: false,
    discountAvailable: false,
    notes: "Compact affordable units near metro station.",
    isIllustrativeData: true,
  },
  {
    id: "prop-011",
    name: "Hebbal Lake View",
    location: "Hebbal, Bangalore",
    configuration: "3BHK",
    startingPriceL: 92,
    possessionDate: "2025-11-30",
    coveredParking: true,
    discountAvailable: null,
    notes: "Scenic apartments overlooking Hebbal Lake.",
    isIllustrativeData: true,
  },
  {
    id: "prop-012",
    name: "Rajajinagar Residency",
    location: "Rajajinagar, Bangalore",
    configuration: "2BHK",
    startingPriceL: 58,
    possessionDate: "2025-08-31",
    coveredParking: true,
    discountAvailable: true,
    notes: "Well-connected apartments in established Rajajinagar area.",
    isIllustrativeData: true,
  },
  {
    id: "prop-013",
    name: "JP Nagar Elite",
    location: "JP Nagar, Bangalore",
    configuration: "4BHK",
    startingPriceL: 135,
    possessionDate: "2025-12-31",
    coveredParking: true,
    discountAvailable: false,
    notes: "Luxury penthouses in JP Nagar Phase 2.",
    isIllustrativeData: true,
  },
  {
    id: "prop-014",
    name: "Marathahalli Tech Hub",
    location: "Marathahalli, Bangalore",
    configuration: "1BHK",
    startingPriceL: 38,
    possessionDate: "2025-06-30",
    coveredParking: false,
    discountAvailable: true,
    notes: "Budget-friendly units near IT corridor.",
    isIllustrativeData: true,
  },
  {
    id: "prop-015",
    name: "Banashankari Garden Estates",
    location: "Banashankari, Bangalore",
    configuration: "3BHK",
    startingPriceL: 78,
    possessionDate: "2025-09-30",
    coveredParking: true,
    discountAvailable: false,
    notes: "Family-friendly apartments with landscaped gardens.",
    isIllustrativeData: true,
  },
];

/**
 * Find properties that broadly match a location + configuration query.
 * Requires BOTH location and configuration to match (AND logic).
 * Uses simple substring matching — no fuzzy logic.
 */
export function findMatchingProperties(location: string, configuration: string): PropertyRecord[] {
  const loc = location.toLowerCase().trim();
  const cfg = configuration.toLowerCase().trim();
  return ILLUSTRATIVE_PROPERTIES.filter((p) => {
    const pLoc = p.location.toLowerCase();
    const pCfg = p.configuration.toLowerCase();
    const locationMatch = pLoc.includes(loc) || loc.includes(pLoc.split(",")[0].trim());
    const configMatch = pCfg === cfg || pCfg.startsWith(cfg) || cfg.startsWith(pCfg) || pCfg.includes(cfg) || cfg.includes(pCfg);
    // Require location match. Config match is a secondary filter when location matches.
    return locationMatch && configMatch;
  });
}
