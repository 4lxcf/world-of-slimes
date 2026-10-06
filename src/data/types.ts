export const slimeTypes = [
  { id: "fire", name: "Fire" },
  { id: "water", name: "Water" },
  { id: "grass", name: "Grass" },
  { id: "wind", name: "Wind" },
  { id: "ground", name: "Ground" },
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
  { id: "ice", name: "Ice" },
  { id: "electric", name: "Electric" },
  { id: "poison", name: "Poison" },
  { id: "metal", name: "Metal" },
  { id: "power", name: "Power" },
  { id: "magic", name: "Magic" },
] as const;

export type SlimeTypeId = (typeof slimeTypes)[number]["id"];
export type SlimeType = (typeof slimeTypes)[number];
