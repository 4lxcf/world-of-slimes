import type { ItemId } from "./items";

export type SynthesisRecipe = {
  id: string;
  slimeIds: [number, number];
  requiredLevel: number | null;
  requiredItems: ItemId[] | null;
  resultSlimeId: number;
};

export const syntheses: SynthesisRecipe[] = [
  {
    id: "shell-tweety",
    slimeIds: [16, 26],
    requiredLevel: 10,
    requiredItems: [],
    resultSlimeId: 18,
  },
  {
    id: "icy-wisp",
    slimeIds: [19, 36],
    requiredLevel: 19,
    requiredItems: [],
    resultSlimeId: 20,
  },
  {
    id: "mighty-wisp",
    slimeIds: [19, 36],
    requiredLevel: 19,
    requiredItems: [],
    resultSlimeId: 20,
  },
  {
    id: "firespirit-icy",
    slimeIds: [19, 36],
    requiredLevel: 16,
    requiredItems: [],
    resultSlimeId: 23,
  },
  {
    id: "prince-icy",
    slimeIds: [24, 36],
    requiredLevel: 16,
    requiredItems: ["fire-spirits-mist"],
    resultSlimeId: 23,
  },
  {
    id: "bass-poisonbass",
    slimeIds: [31, 32],
    requiredLevel: 10,
    requiredItems: ["princes-orb"],
    resultSlimeId: 25,
  },
  {
    id: "bass-poisonmandrake",
    slimeIds: [31, 29],
    requiredLevel: 10,
    requiredItems: ["poison-princes-orb"],
    resultSlimeId: 25,
  },
];
