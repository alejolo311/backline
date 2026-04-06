import { Category } from "@prisma/client";

export type CategoryMeta = {
  bg: string;
  border: string;
  text: string;
  accent: string; // left stripe color = border color
  label: string;
  icon?: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  // Blue-indigo (distinct from brand teal)
  cultural: {
    bg: "#EBF0FD",
    border: "#90A9E8",
    text: "#1E3A8A",
    accent: "#90A9E8",
    label: "Cultural",
  },
  deportes: {
    bg: "#E0F5F0",
    border: "#2BADA0",
    text: "#0A4A42",
    accent: "#2BADA0",
    label: "Deportes",
  },
  musica: {
    bg: "#FAECE7",
    border: "#F0997B",
    text: "#712B13",
    accent: "#F0997B",
    label: "Música",
  },
  social: {
    bg: "#FFF0D4",
    border: "#E89A2B",
    text: "#5C3407",
    accent: "#E89A2B",
    label: "Social",
  },
  religioso: {
    bg: "#EAF4DE",
    border: "#85BC4A",
    text: "#24490A",
    accent: "#85BC4A",
    label: "Religioso",
  },
  reinado: {
    bg: "#FBEAF0",
    border: "#E880AD",
    text: "#6B1F3B",
    accent: "#E880AD",
    label: "Reinado",
  },
  produccion: {
    bg: "#0F1C34",
    border: "#1F3558",
    text: "#E8F4F2",
    accent: "#2BADA0",   // teal stripe on dark cards
    label: "Producción",
    icon: "⚙",
  },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export const PUBLIC_CATEGORIES = CATEGORIES.filter((c) => c !== "produccion");
