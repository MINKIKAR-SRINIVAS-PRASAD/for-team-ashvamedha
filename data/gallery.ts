/**
 * GALLERY â€” procedural artwork by default.
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
    title: "",
    image: "/gallery/DSC_1765.jpg",
    caption: "",
    span: "tall",
    accent: "crimson",
  },
  {
    id: "g2",
    title: "",
    image: "/gallery/DSC_1911.jpg",
    caption: "",
    span: "square",
    accent: "gold",
  },
  {
    id: "g3",
    title: "",
    image: "/gallery/DSC_2846.jpg",
    caption: "",
    span: "wide",
    accent: "volt",
  },
  {
    id: "g4",
    title: "",
    image: "/gallery/DSC_1370.jpg",
    caption: "",
    span: "tall",
    accent: "gold",
  },
  {
    id: "g5",
    title: "",
    image: "/gallery/DSC_1360.jpg",
    caption: "",
    span: "wide",
    accent: "violet",
  },
  {
    id: "g6",
    title: "",
    image: "/gallery/DSC_1343.jpg",
    caption: "",
    span: "square",
    accent: "violet",
  },
  {
    id: "g7",
    title: "",
    image: "/gallery/DSC_0086.jpg",
    caption: "",
    span: "square",
    accent: "volt",
  },
  {
    id: "g8",
    title: "",
    image: "/gallery/DSC_0056.jpg",
    caption: "",
    span: "tall",
    accent: "crimson",
  },
  {
    id: "g9",
    title: "",
    image: "/gallery/DSC_1542.jpg",
    caption: "",
    span: "wide",
    accent: "gold",
  },
  {
    id: "g10",
    title: "",
    image: "/gallery/DSC_0004.jpg",
    caption: "",
    span: "square",
    accent: "gold",
  },
  {
    id: "g11",
    title: "",
    image: "/gallery/DSC_0009.jpg",
    caption: "",
    span: "tall",
    accent: "volt",
  },
  {
    id: "g12",
    title: "",
    image: "/gallery/DSC_0014.jpg",
    caption: "",
    span: "square",
    accent: "violet",
  },
];

export const GALLERY_CATEGORIES = [
  "ALL",
] as const;



