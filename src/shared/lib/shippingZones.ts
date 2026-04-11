// Shipping zone mapping and fee calculation

export interface ShippingZoneInfo {
  zoneKey: string;
  label: string;
  baseFee: number;
  freeShippingThreshold: number | null;
  minDays: number;
  maxDays: number;
}

// Lagos Island areas
const LAGOS_ISLAND_AREAS = [
  "victoria island", "vi", "lekki", "ikoyi", "ajah", "eti-osa",
  "banana island", "oniru", "admiralty", "chevron", "ikate",
  "osapa", "agungi", "idado", "lafiaji", "marina", "broad street",
  "lagos island", "obalende",
];

// Lagos Mainland areas  
const LAGOS_MAINLAND_AREAS = [
  "ikeja", "surulere", "yaba", "mushin", "agege", "oshodi", "isolo",
  "maryland", "ojota", "ogba", "berger", "alimosho", "festac",
  "amuwo-odofin", "apapa", "ebute metta", "lagos mainland",
  "anthony", "gbagada", "bariga", "somolu", "ifako", "ijaiye",
  "magodo", "kosofe", "ketu", "mile 12", "ikorodu",
];

// Nigerian state-to-zone mapping
const STATE_ZONE_MAP: Record<string, string> = {
  "Lagos": "lagos_mainland", // default; refined by city
  "Ogun": "southwest",
  "Oyo": "southwest",
  "Osun": "southwest",
  "Ondo": "southwest",
  "Ekiti": "southwest",
  "Enugu": "southeast",
  "Imo": "southeast",
  "Anambra": "southeast",
  "Abia": "southeast",
  "Ebonyi": "southeast",
  "Rivers": "southsouth",
  "Delta": "southsouth",
  "Edo": "southsouth",
  "Bayelsa": "southsouth",
  "Cross River": "southsouth",
  "Akwa Ibom": "southsouth",
  "FCT": "northcentral",
  "Kwara": "northcentral",
  "Plateau": "northcentral",
  "Nasarawa": "northcentral",
  "Benue": "northcentral",
  "Niger": "northcentral",
  "Kogi": "northcentral",
  "Borno": "northeast",
  "Adamawa": "northeast",
  "Yobe": "northeast",
  "Bauchi": "northeast",
  "Gombe": "northeast",
  "Taraba": "northeast",
  "Kano": "northwest",
  "Kaduna": "northwest",
  "Katsina": "northwest",
  "Sokoto": "northwest",
  "Zamfara": "northwest",
  "Kebbi": "northwest",
  "Jigawa": "northwest",
};

// West African countries
const WEST_AFRICAN_COUNTRIES = [
  "Ghana", "Cameroon", "Togo", "Benin Republic", "Senegal",
  "Ivory Coast", "Côte d'Ivoire", "Guinea", "Sierra Leone",
  "Liberia", "Mali", "Burkina Faso", "Niger Republic",
  "Gambia", "Guinea-Bissau", "Cape Verde",
];

// African countries (non-West Africa)
const OTHER_AFRICAN_COUNTRIES = [
  "Kenya", "South Africa", "Tanzania", "Ethiopia", "Egypt",
  "Rwanda", "Uganda", "Morocco", "Tunisia", "Algeria",
  "Mozambique", "Zimbabwe", "Zambia", "Botswana", "Namibia",
  "Angola", "DR Congo", "Republic of Congo",
];

// Default zone data (used when DB is unavailable)
const ZONE_DEFAULTS: Record<string, ShippingZoneInfo> = {
  lagos_island: { zoneKey: "lagos_island", label: "Lagos Island", baseFee: 2000, freeShippingThreshold: 50000, minDays: 1, maxDays: 2 },
  lagos_mainland: { zoneKey: "lagos_mainland", label: "Lagos Mainland", baseFee: 2500, freeShippingThreshold: 50000, minDays: 1, maxDays: 2 },
  southwest: { zoneKey: "southwest", label: "South West", baseFee: 4500, freeShippingThreshold: null, minDays: 2, maxDays: 4 },
  southeast: { zoneKey: "southeast", label: "South East", baseFee: 5500, freeShippingThreshold: null, minDays: 3, maxDays: 5 },
  southsouth: { zoneKey: "southsouth", label: "South South", baseFee: 5000, freeShippingThreshold: null, minDays: 3, maxDays: 5 },
  northcentral: { zoneKey: "northcentral", label: "North Central", baseFee: 5500, freeShippingThreshold: null, minDays: 3, maxDays: 5 },
  northeast: { zoneKey: "northeast", label: "North East", baseFee: 6500, freeShippingThreshold: null, minDays: 4, maxDays: 7 },
  northwest: { zoneKey: "northwest", label: "North West", baseFee: 6000, freeShippingThreshold: null, minDays: 4, maxDays: 7 },
  west_africa: { zoneKey: "west_africa", label: "West Africa", baseFee: 15000, freeShippingThreshold: null, minDays: 7, maxDays: 14 },
  africa_other: { zoneKey: "africa_other", label: "Rest of Africa", baseFee: 25000, freeShippingThreshold: null, minDays: 10, maxDays: 21 },
  international: { zoneKey: "international", label: "International / Diaspora", baseFee: 35000, freeShippingThreshold: null, minDays: 14, maxDays: 30 },
};

/**
 * Determine shipping zone from address details
 */
export function detectShippingZone(country: string, state: string, city: string): string {
  if (country !== "Nigeria") {
    const countryLower = country.toLowerCase();
    if (WEST_AFRICAN_COUNTRIES.some(c => c.toLowerCase() === countryLower)) {
      return "west_africa";
    }
    if (OTHER_AFRICAN_COUNTRIES.some(c => c.toLowerCase() === countryLower)) {
      return "africa_other";
    }
    return "international";
  }

  // Nigerian address
  if (state === "Lagos") {
    const cityLower = city.toLowerCase().trim();
    if (LAGOS_ISLAND_AREAS.some(area => cityLower.includes(area))) {
      return "lagos_island";
    }
    // Default Lagos to mainland
    return "lagos_mainland";
  }

  return STATE_ZONE_MAP[state] || "southwest";
}

/**
 * Get zone info (fees, delivery estimate)
 */
export function getZoneInfo(zoneKey: string): ShippingZoneInfo {
  return ZONE_DEFAULTS[zoneKey] || ZONE_DEFAULTS["southwest"];
}

/**
 * Calculate shipping fee considering subtotal and free shipping threshold
 */
export function calculateShippingFee(zoneKey: string, subtotal: number): number {
  const zone = getZoneInfo(zoneKey);
  if (zone.freeShippingThreshold && subtotal >= zone.freeShippingThreshold) {
    return 0;
  }
  return zone.baseFee;
}

/**
 * Get delivery estimate string
 */
export function getDeliveryEstimate(zoneKey: string): string {
  const zone = getZoneInfo(zoneKey);
  if (zone.minDays === zone.maxDays) {
    return `${zone.minDays} day${zone.minDays > 1 ? "s" : ""}`;
  }
  return `${zone.minDays}–${zone.maxDays} days`;
}

// Countries for the dropdown
export const COUNTRY_LIST = [
  "Nigeria",
  // West Africa
  "Ghana", "Cameroon", "Togo", "Benin Republic", "Senegal",
  "Ivory Coast", "Guinea", "Sierra Leone", "Liberia", "Mali",
  "Burkina Faso", "Gambia",
  // Rest of Africa
  "Kenya", "South Africa", "Tanzania", "Ethiopia", "Egypt",
  "Rwanda", "Uganda", "Morocco",
  // Diaspora / International
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "Netherlands", "Italy", "Spain", "Australia", "United Arab Emirates",
  "Saudi Arabia", "Ireland", "Sweden", "Switzerland", "Belgium",
  "Portugal", "Austria", "Norway", "Denmark", "Finland",
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];
