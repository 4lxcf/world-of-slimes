export const skills = [
  { id: "water-ball", name: "Water Ball", mpCost: null, cooldown: null, damage: null },
  { id: "leaf-spread", name: "Leaf Spread", mpCost: null, cooldown: null, damage: null },
  { id: "grass-shot", name: "Grass Shot", mpCost: null, cooldown: null, damage: null },
  { id: "grass-needle", name: "Grass Needle", mpCost: null, cooldown: null, damage: null },
  { id: "wind-ball", name: "Wind Ball", mpCost: null, cooldown: null, damage: null },
  { id: "dark-orb", name: "Dark Orb", mpCost: null, cooldown: null, damage: null },
  { id: "dark-strike", name: "Dark Strike", mpCost: null, cooldown: null, damage: null },
  { id: "striking-power", name: "Striking Power", mpCost: null, cooldown: null, damage: null },
  { id: "power-drive", name: "Power Drive", mpCost: null, cooldown: null, damage: null },
  { id: "ice-ball", name: "Ice Ball", mpCost: null, cooldown: null, damage: null },
  { id: "poison-ball", name: "Poison Ball", mpCost: null, cooldown: null, damage: null },
  { id: "light-orb", name: "Light Orb", mpCost: null, cooldown: null, damage: null },
  { id: "power-swing", name: "Power Swing", mpCost: null, cooldown: null, damage: null },
] as const;

export type SkillId = (typeof skills)[number]["id"];
export type Skill = {
  id: SkillId;
  name: string;
  mpCost: number | null;
  cooldown: number | null;
  damage: number | null;
};
