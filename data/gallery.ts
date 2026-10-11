/**
 * GALLERY — procedural artwork by default.
 * Drop real photographs into /public/gallery and set `image` to switch over
 * without touching a single component.
 */
export interface GalleryItem {
  id: string;
  title: string;
  image: string | null;
  caption: string;
  category?: string;
  span: "tall" | "wide" | "square";
  accent: "crimson" | "volt" | "violet" | "gold";
}
export const GALLERY: GalleryItem[] = [
  {
    id: "g1",
    title: "Floodlit Final",
    image: null,
    caption: "The 2025 football final, decided in the 88th minute under the arena lights.",
    span: "tall",
    accent: "crimson",
  },
  {
    id: "g2",
    title: "Takeoff",
    image: null,
    caption: "Long jump final — a 6.4m leap that reset the campus record.",
    span: "square",
    accent: "gold",
  },
  {
    id: "g3",
    title: "The Wall",
    image: null,
    caption: "Three thousand voices behind the north stand during the basketball final.",
    span: "wide",
    accent: "volt",
  },
  {
    id: "g4",
    title: "Lifting the Shield",
    image: null,
    caption: "Phoenix Brigade collect the Ashvamedha Shield for the second straight year.",
    span: "tall",
    accent: "gold",
  },
  {
    id: "g5",
    title: "Campus at Dusk",
    image: null,
    caption: "The arena complex moments before the evening session begins.",
    span: "wide",
    accent: "violet",
  },
  {
    id: "g6",
    title: "Server War",
    image: null,
    caption: "Chess bay, map three, both squads one round from elimination.",
    span: "square",
    accent: "violet",
  },
  {
    id: "g7",
    title: "Behind the Lens",
    image: null,
    caption: "The production crew running the arena broadcast across four feeds.",
    span: "square",
    accent: "volt",
  },
  {
    id: "g8",
    title: "Match Point",
    image: null,
    caption: "Badminton singles final — the rally that lasted 41 shots.",
    span: "tall",
    accent: "crimson",
  },
  {
    id: "g9",
    title: "Track Start",
    image: null,
    caption: "100m final set. Electronic timing, photo-finish review on standby.",
    span: "wide",
    accent: "gold",
  },
  {
    id: "g10",
    title: "Podium Protocol",
    image: null,
    caption: "Gold, silver and bronze on the closing night stage.",
    span: "square",
    accent: "gold",
  },
  {
    id: "g11",
    title: "Courtside",
    image: null,
    caption: "Court 01 at capacity during the semi-final double header.",
    span: "tall",
    accent: "volt",
  },
  {
    id: "g12",
    title: "Loading Dock",
    image: null,
    caption: "12:40 AM — staging and rigging for the opening ceremony.",
    span: "square",
    accent: "violet",
  },
];

export const GALLERY_CATEGORIES = [
  "ALL",
] as const;
