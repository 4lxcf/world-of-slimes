import type { ItemId } from "./items";

export type SynthesisRecipe = {
  id: string;
  /** Slime whose level determines the synthesis range. */
  mainSlimeId: number;
  /** Sub slime consumed by synthesis; its level must be lower than the main slime's. */
  subSlimeId: number;
  requiredLevel: number | null;
  ingredients: [] | [ItemId] | null;
  resultSlimeId: number;
};

export const syntheses: SynthesisRecipe[] = [
  {
    id: "shell-tweety",
    mainSlimeId: 16,
    subSlimeId: 26,
    requiredLevel: 10,
    ingredients: [],
    resultSlimeId: 18,
  },
  {
    id: "icy-wisp",
    mainSlimeId: 19,
    subSlimeId: 36,
    requiredLevel: 19,
    ingredients: [],
    resultSlimeId: 20,
  },
  {
    id: "mighty-wisp",
    mainSlimeId: 19,
    subSlimeId: 36,
    requiredLevel: 19,
    ingredients: [],
    resultSlimeId: 20,
  },
  {
    id: "firespirit-icy",
    mainSlimeId: 19,
    subSlimeId: 36,
    requiredLevel: 16,
    ingredients: [],
    resultSlimeId: 23,
  },
  {
    id: "prince-icy",
    mainSlimeId: 24,
    subSlimeId: 36,
    requiredLevel: 16,
    ingredients: ["fire-spirits-mist"],
    resultSlimeId: 23,
  },
  {
    id: "bass-poisonbass",
    mainSlimeId: 31,
    subSlimeId: 32,
    requiredLevel: 10,
    ingredients: ["princes-orb"],
    resultSlimeId: 25,
  },
  {
    id: "bass-poisonmandrake",
    mainSlimeId: 31,
    subSlimeId: 29,
    requiredLevel: 10,
    ingredients: ["poison-princes-orb"],
    resultSlimeId: 25,
  },
];
