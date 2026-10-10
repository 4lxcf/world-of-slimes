export const skills = [
  { id: "water-ball", name: "Water Ball", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "leaf-spread", name: "Leaf Spread", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "grass-shot", name: "Grass Shot", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "grass-needle", name: "Grass Needle", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "wind-ball", name: "Wind Ball", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "dark-orb", name: "Dark Orb", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "dark-strike", name: "Dark Strike", type: null, mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "striking-power", name: "Striking Power", type: "physical", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "power-drive", name: "Power Drive", type: "support", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "ice-ball", name: "Ice Ball", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "poison-ball", name: "Poison Ball", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "light-orb", name: "Light Orb", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "magic-orb", name: "Magic Orb", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "power-swing", name: "Power Swing", type: "physical", mpCost: { min: 21, max: 21 }, cooldown: { min: 4.6, max: 4.6 }, damage: { min: 57, max: 57 } },
  { id: "leaf-boomerang", name: "Leaf Boomerang", type: "magic", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
  { id: "aqua-heal", name: "Aqua Heal", type: "heal", mpCost: { min: 48, max: 48 }, cooldown: { min: 11.8, max: 11.8 }, damage: { min: 54, max: 54 } },
  { id: "force-dash", name: "Force Dash", type: "physical", mpCost: { min: 31, max: 31 }, cooldown: { min: 7.9, max: 7.9 }, damage: { min: 57, max: 57 } },
  { id: "power-upper", name: "Power Upper", type: "physical", mpCost: { min: 33, max: 33 }, cooldown: { min: 11.2, max: 11.2 }, damage: { min: 77, max: 77 } },
  { id: "stone-shot", name: "Power Upper", type: "physical", mpCost: { min: null, max: null }, cooldown: { min: null, max: null }, damage: { min: null, max: null } },
] as const;

export type SkillId = (typeof skills)[number]["id"];
export type SkillRange = {
  min: number | null;
  max: number | null;
};
export type Skill = {
  id: SkillId;
  name: string;
  type: "physical" | "magic" | "support" | "heal" | null;
  mpCost: SkillRange;
  cooldown: SkillRange;
  damage: SkillRange;
};
