export const items = [
  { id: "glowing-core-fragment", name: "Glowing Core Fragment", type: "Byproduct", description: "When the sun sets, a soft glow seeps out even from inside your pocket. Its edges look like they were made to interlock, a piece of something greater." },
  { id: "weightless-core-fragment", name: "Weightless Core Fragment", type: "Byproduct", description: "A fragment so weightless it hovers quietly in the air when you open your hand. Its edges look like they were made to interlock, a piece of something greater." },
  { id: "parched-core-fragment", name: "Parched Core Fragment", type: "Byproduct", description: "Parched and dusty, it burrows deep into the ground in search of moisture the moment you set it down. Its edges look like they were made to interlock, a piece of something greater." },
  { id: "dewy-core-fragment", name: "Dewy Core Fragment", type: "Byproduct", description: "Always dewy, as if freshly pulled from the water, yet strangely, it never wets your hand. Its edges look like they were made to interlock, a piece of something greater." },
  { id: "verdant-core-fragment", name: "Verdant Core Fragment", type: "Byproduct", description: "A fresh, grassy-scented fragment; keep it close and even wilted plants lift their leaves. Its edges look like they were made to interlock, a piece of something greater." },
  { id: "adamant-core-fragment", name: "Adamant Core Fragment", type: "Byproduct", description: "Utterly adamant. They say not even lava can leave a scratch on it. Its edges look like they were made to interlock, a piece of something greater." },
  { id: "tweety-hide", name: "Tweety's Hide", type: "Byproduct", description: "A thin hide that wrapped Tweety's body. Tweety's signature blue hue stands out." },
  { id: "tricky-hide", name: "Tricky's Hide", type: "Byproduct", description: "A thin hide that wrapped Tricky's body. It's very dark color." },
  { id: "small-slime-fragment", name: "Small Slime Fragment", type: "Byproduct", description: "A small fragment you can get by defeating slimes. Commonly seen." },
  { id: "fire-spirits-mist", name: "Fire Spirit's Mist", type: "Byproduct", description: "Mist that leaked out from Fire Spirit. It carries an intense heat." },
  { id: "princes-orb", name: "Prince's Orb", type: "Byproduct", description: null },
  { id: "poison-princes-orb", name: "Prince's Orb", type: "Byproduct", description: null },
  { id: "shells-solid-fragment", name: "Shell's Solid Fragment", type: "Byproduct", description: null },
  { id: "mandrakes-leaf", name: "Mandrake's Leaf", type: "Byproduct", description: "A faded leaf that grew on Mandrake's body. Its soft green color is distinctive." },
  { id: "poison-mandrakes-leaf", name: "Poison Mandrake's Leaf", type: "Byproduct", description: "A leaf that grew on Poison Mandrake's body. Steeped in poison, its stained purple." },
  { id: "bass-scale", name: "Bass's Scale", type: "Byproduct", description: null },
  { id: "poison-bass-scale", name: "Poison Bass's Scale", type: "Byproduct", description: null },
  { id: "lizard-scale", name: "Lizard's Scale", type: "Byproduct", description: null },
  { id: "poison-lizard-scale", name: "Poison Lizard's Scale", type: "Byproduct", description: null },
  { id: "electric-lizard-scale", name: "Electric Lizard's Scale", type: "Byproduct", description: null },
  { id: "wicked-membrane", name: "Wicked's Thin Membrane", type: "Byproduct", description: "A thin membrane attached to the Wicked's body. Purple with blue patterns. Thin and soft to the touch." },
  { id: "kobolds-crystal", name: "Kobold's Crystal", type: "Byproduct", description: null },
  { id: "wisp-sigil", name: "Wisp's Sigil", type: "Byproduct", description: null },
  { id: "rusty-sharp-blade", name: "Rusty's Sharp Blade", type: "Byproduct", description: null },
  { id: "melon-tentacle", name: "Melon's Tentacle", type: "Byproduct", description: null },
  { id: "aqua-melon-tentacle", name: "Aqua Melon's Tentacle", type: "Byproduct", description: null },
  { id: "rotten-melon-tentacle", name: "Rotten Melon's Tentacle", type: "Byproduct", description: null },
  { id: "slick-vent", name: "Slick's Vent", type: "Byproduct", description: null },
  { id: "cube", name: "Cube", type: "Consumable", description: "A basic Cube made for taming slimes. Anyone can obtain it easily." },
  { id: "legendary-cube", name: "Legendary Cube", type: "Consumable", description: "A legendary Cube made for taming slimes. It can easily tame most slimes." },
  { id: "30-hp-potion", name: "30 HP Potion", type: "Consumable", description: "A potion that restores a small amount of a slime's health. Restores 30 HP to the equipped slime." },
  { id: "stamina-recovery-potion", name: "Stamina Recovery Potion", type: "Consumable", description: "A potion that restores a slime's Stamina. Restores 500 Stamina to the equipped slime." },
  { id: "larus-scroll", name: "Larus Warp Scroll", type: "Consumable", description: "A scroll that lets you instantly travel to Larus Village by mysterious power when torn. The Larus Village mark is inscribed on blue paper. It can only be used near the village." },
  { id: "xp-boost", name: "Experience Boost Potion", type: "Consumable", description: "When used, a slime's experience gain increases by 100% for 15 minutes." },
  { id: "fishing-rod", name: "Fishing Rod", type: "Consumable", description: "A Fishing Rod. Cast it into the sea or a lake and you can reel slimes in." },
  { id: "slime-feed", name: "Slime Feed", type: "Consumable", description: "Ordinary slime feed, easily found anywhere. It can be given to a hungry slime." },
] as const;

export type ItemId = (typeof items)[number]["id"];
export type Item = {
  id: ItemId;
  name: string;
  type: string | null;
  description: string | null;
};
