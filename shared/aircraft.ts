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
  "A330-200",
  "A330-300",
  "A340-300",
  "A340-600",
  "A350-900",
  "A350-1000",
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
  "Asobo",
  "Bredok3D",
  "Captain Sim",
  "FBW",
  "Fenix",
  "FlyByWire",
  "Headwind",
  "Horizon",
  "iFly",
  "iniBuilds",
  "LatinVFR",
  "PMDG",
  "RHDSimulations",
  "기타 (직접 입력)",
] as const;

// Aircraft-specific brands mapping
export const AIRCRAFT_BRANDS: Record<string, string[]> = {
  // Airbus
  "A318": ["FBW", "Asobo", "기타 (직접 입력)"],
  "A319": ["FBW", "Asobo", "기타 (직접 입력)"],
  "A320": ["FBW", "Fenix", "Asobo", "기타 (직접 입력)"],
  "A320neo": ["FBW", "Fenix", "Asobo", "기타 (직접 입력)"],
  "A321": ["FBW", "Fenix", "Asobo", "기타 (직접 입력)"],
  "A321neo": ["FBW", "Fenix", "Asobo", "기타 (직접 입력)"],
  "A330-200": ["iniBuilds", "Asobo", "기타 (직접 입력)"],
  "A330-300": ["iniBuilds", "Asobo", "기타 (직접 입력)"],
  "A340-300": ["iniBuilds"],
  "A340-600": ["iniBuilds"],
  "A350-900": ["iniBuilds"],
  "A350-1000": ["iniBuilds"],
  "A380": ["Asobo", "기타 (직접 입력)"],
  // Boeing
  "B717": ["Captain Sim", "Asobo", "기타 (직접 입력)"],
  "B737 Classic": ["Captain Sim", "Asobo", "기타 (직접 입력)"],
  "B737 NG": ["PMDG", "iFly", "Asobo", "기타 (직접 입력)"],
  "B737 MAX": ["PMDG", "Asobo", "기타 (직접 입력)"],
  "B747-400": ["PMDG", "iFly", "Asobo", "기타 (직접 입력)"],
  "B747-8": ["PMDG", "Asobo", "기타 (직접 입력)"],
  "B757": ["PMDG", "iFly", "Asobo", "기타 (직접 입력)"],
  "B767": ["PMDG", "Asobo", "기타 (직접 입력)"],
  "B777": ["PMDG", "iFly", "Asobo", "기타 (직접 입력)"],
  "B787": ["PMDG", "Asobo", "기타 (직접 입력)"],
};

// A340 and A350 can only use iniBuilds
export const RESTRICTED_AIRCRAFT_BRANDS: Record<string, string[]> = {
  "A340-300": ["iniBuilds"],
  "A340-600": ["iniBuilds"],
  "A350-900": ["iniBuilds"],
  "A350-1000": ["iniBuilds"],
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
 * Get brands available for an aircraft
 */
export function getBrandsForAircraft(aircraft: string): string[] {
  return AIRCRAFT_BRANDS[aircraft] || COMMON_BRANDS.filter(b => b !== "기타 (직접 입력)");
}

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
  return getBrandsForAircraft(aircraft);
}

/**
 * Validate if a brand is allowed for an aircraft
 */
export function isBrandAllowed(aircraft: string, brand: string): boolean {
  const allowedBrands = getAllowedBrands(aircraft);
  return allowedBrands.includes(brand) || brand === "기타 (직접 입력)";
}
