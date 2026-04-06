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
  cultural: {
    bg: "#EEEDFE",
    border: "#AFA9EC",
    text: "#3C3489",
    accent: "#AFA9EC",
    label: "Cultural",
  },
  deportes: {
    bg: "#E1F5EE",
    border: "#5DCAA5",
    text: "#085041",
    accent: "#5DCAA5",
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
    bg: "#FAEEDA",
    border: "#EF9F27",
    text: "#633806",
    accent: "#EF9F27",
    label: "Social",
  },
  religioso: {
    bg: "#EAF3DE",
    border: "#97C459",
    text: "#27500A",
    accent: "#97C459",
    label: "Religioso",
  },
  reinado: {
    bg: "#FBEAF0",
    border: "#ED93B1",
    text: "#72243E",
    accent: "#ED93B1",
    label: "Reinado",
  },
  produccion: {
    bg: "#2C2C2C",
    border: "#555555",
    text: "#F0EEE8",
    accent: "#555555",
    label: "Producción",
    icon: "⚙",
  },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export const PUBLIC_CATEGORIES = CATEGORIES.filter((c) => c !== "produccion");
