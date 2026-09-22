/**
 * SPONSORS — kept deliberately quiet, monochrome by default.
 * `wordmark` renders as styled type until real logo files are supplied.
 */
export interface Sponsor {
  name: string;
  /** Set once a real SVG/PNG exists in /public/sponsors. */
  logo: string | null;
  wordmark: string;
  tier: "title" | "powered" | "partner";
  note?: string;
}

export const SPONSORS: Sponsor[] = [
  {
    name: "Odisha Sports Authority",
    logo: null,
    wordmark: "ODISHA SPORTS AUTHORITY",
    tier: "title",
    note: "Title sponsor · Season 2026",
  },
  { name: "Bharat Heavy Alloys", logo: null, wordmark: "BHARAT HEAVY ALLOYS", tier: "powered" },
  { name: "Cuttack Coffee Co.", logo: null, wordmark: "CUTTACK COFFEE CO.", tier: "powered" },
  { name: "Konark Renewables", logo: null, wordmark: "KONARK RENEWABLES", tier: "powered" },
  { name: "Astra Athletic", logo: null, wordmark: "ASTRA ATHLETIC", tier: "partner" },
  { name: "Bhubaneswar Metro Fit", logo: null, wordmark: "BBSR METRO FIT", tier: "partner" },
  { name: "Kalinga Digital", logo: null, wordmark: "KALINGA DIGITAL", tier: "partner" },
  { name: "Utkal Nutrition Labs", logo: null, wordmark: "UTKAL NUTRITION", tier: "partner" },
  { name: "Chilika Hydration", logo: null, wordmark: "CHILIKA HYDRATION", tier: "partner" },
];

export const SPONSOR_TIERS = [
  { tier: "title" as const, label: "Title Sponsor" },
  { tier: "powered" as const, label: "Powered By" },
  { tier: "partner" as const, label: "Partners" },
];
