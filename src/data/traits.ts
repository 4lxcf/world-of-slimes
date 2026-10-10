export const traits = [
  {
    id: "flight",
    name: "Flight",
    description:
      "Lets the slime fly over low obstacles and reach elevated areas.",
  },
  {
    id: "swimming",
    name: "Swimming",
    description:
      "Lets the slime swim and reach aquatic slimes without a fishing rod.",
  },
  {
    id: "riding",
    name: "Riding",
    description:
      "Lets you ride the slime. Core fragment not yet observed in wild drops.",
  },
  {
    id: "mining",
    name: "Mining",
    description: "Lets the slime dig and pass through earth blockages.",
  },
  {
    id: "luminescence",
    name: "Luminescence",
    description: "Lights up dark areas on the map.",
  },
  {
    id: "bond",
    name: "Bond",
    description:
      "Psychic communication with plants and some vegetation obstacles.",
  },
  {
    id: "shield",
    name: "Shield",
    description: "Grants extra protection in battle.",
  },
] as const;

export type TraitId = (typeof traits)[number]["id"];
export type Trait = {
  id: TraitId;
  name: string;
  description: string;
};
