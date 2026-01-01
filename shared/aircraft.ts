/**
 * Aircraft manufacturers, models, and brands configuration
 */

export const MANUFACTURERS = ["Airbus", "Boeing"] as const;
export type Manufacturer = typeof MANUFACTURERS[number];

export const AIRBUS_AIRCRAFT = [
  "A318",
  "A319",
  "A320",
  "A320neo",
  "A321",
  "A321neo",
  "A330",
  "A340",
  "A350",
  "A380",
] as const;

export const BOEING_AIRCRAFT = [
  "B717",
  "B737 Classic",
  "B737 NG",
  "B737 MAX",
  "B747-400",
  "B747-8",
  "B757",
  "B767",
  "B777",
  "B787",
] as const;

export type AirbusAircraft = typeof AIRBUS_AIRCRAFT[number];
export type BoeingAircraft = typeof BOEING_AIRCRAFT[number];

export const AIRCRAFT_BY_MANUFACTURER: Record<Manufacturer, readonly string[]> = {
  Airbus: AIRBUS_AIRCRAFT,
  Boeing: BOEING_AIRCRAFT,
};

// Brands/Addons
export const COMMON_BRANDS = [
  "FBW",
  "Fenix",
  "Headwind",
  "LatinVFR",
  "FlyByWire",
  "Bredok3D",
  "PMDG",
  "iFly",
  "Horizon",
  "Captain Sim",
  "iniBuilds",
  "Asobo",
  "기타 (직접 입력)",
] as const;

// A340 and A350 can only use iniBuilds
export const RESTRICTED_AIRCRAFT_BRANDS: Record<string, string[]> = {
  A340: ["iniBuilds"],
  A350: ["iniBuilds"],
};

export const MSFS_VERSIONS = ["2020", "2024", "Both"] as const;
export type MsfsVersion = typeof MSFS_VERSIONS[number];

export const CONTACT_TYPES = [
  { value: "general", label: "일반 문의" },
  { value: "upload_error", label: "업로드 오류" },
  { value: "copyright", label: "저작권/도용 신고" },
  { value: "feature_request", label: "기능 요청" },
] as const;

/**
 * Check if an aircraft has brand restrictions
 */
export function hasRestrictedBrands(aircraft: string): boolean {
  return aircraft in RESTRICTED_AIRCRAFT_BRANDS;
}

/**
 * Get allowed brands for an aircraft
 */
export function getAllowedBrands(aircraft: string): string[] {
  if (hasRestrictedBrands(aircraft)) {
    return RESTRICTED_AIRCRAFT_BRANDS[aircraft] || [];
  }
  return COMMON_BRANDS.filter(b => b !== "기타 (직접 입력)");
}

/**
 * Validate if a brand is allowed for an aircraft
 */
export function isBrandAllowed(aircraft: string, brand: string): boolean {
  if (hasRestrictedBrands(aircraft)) {
    return RESTRICTED_AIRCRAFT_BRANDS[aircraft]?.includes(brand) || false;
  }
  return true;
}
