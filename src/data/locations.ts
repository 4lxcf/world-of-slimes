export const locations = [
  { id: "hidden-shore-1", name: "Hidden Shore 1" },
  { id: "hidden-shore-2", name: "Hidden Shore 2" },
  { id: "hidden-shore-3", name: "Hidden Shore 3" },
  { id: "hidden-shore-4", name: "Hidden Shore 4" },
  { id: "hidden-shore-5", name: "Hidden Shore 5" },
  { id: "shadow-forest-entrance", name: "Shadow Forest Entrance" },
  { id: "forest-path", name: "Forest Path" },
  { id: "misty-hill", name: "Misty Hill" },
  { id: "cool-pond", name: "Cool Pond" },
  { id: "tainted-wellspring", name: "Tainted Wellspring" },
  { id: "north-gate", name: "North Gate" },
  { id: "abandoned-farmland", name: "Abandoned Farmland" },
  { id: "cave-entrance", name: "Cave Entrance" },
  { id: "cave-1", name: "Cave 1" },
  { id: "cave-2", name: "Cave 2" },
  { id: "cave-3", name: "Cave 3" },
  { id: "quiet-trail", name: "Quiet Trail" },
  { id: "eerie-crossroads", name: "Eerie Crossroads" },
  { id: "abandoned-camp", name: "Abandoned Camp" },
  { id: "nepenthes-forest", name: "Nepenthes Forest" },
  { id: "beneath-black-cliff", name: "Beneath the Black Cliff" },
  { id: "dark-dawn-valley", name: "Dark Dawn Valley" },
] as const;

export type LocationId = (typeof locations)[number]["id"];
export type Location = (typeof locations)[number];
