export interface IMapData {
  id: string;
  name: string;
}

export const MAPS_v056_DETAILS: IMapData[] = [
  { id: "level1_whirly", name: "Spin Go Round" },
  { id: "level2_tile", name: "Tile Fall" },
  { id: "level3_ice", name: "Icy Heights" },
  { id: "level4_pushy", name: "Humble Stumble" },
  { id: "level5_pivot", name: "Pivot Push" },
  { id: "level6_hill", name: "Cannon Climb" },
  { id: "level7_moving", name: "Over Under" },
  { id: "level8_honey", name: "Honey Drop" },
  { id: "level9_seesaw", name: "Floor Flip" },
  { id: "level10_soccer", name: "Stumble Soccer" },
  { id: "level11_lava", name: "Lava Rush" },
  { id: "level12_bomb", name: "Bombardment" },
  { id: "level13_gravity", name: "Space Race" },
  { id: "level14_slide", name: "Super Slide" },
  { id: "level15_laser", name: "Laser Tracer" },
  { id: "level16_temple", name: "Lost Temple" },
  { id: "level17_rocket", name: "Rocket Rumble" },
  { id: "level18_jungle", name: "Jungle Roll" },
  { id: "level19_block", name: "Block Dash" },
  { id: "event13legendary_dash", name: "Block Dash Legendary" }
];

// Lista simples de nomes para exibição na UI e Embeds
export const MAPS_v056 = MAPS_v056_DETAILS.map(map => map.name);

// Lista de Emotes habilitados na v0.56
export const EMOTES_v056 = [
  "Hug (Abraço)",
  "Charged Hug",
  "Kick (Chute)",
  "Wet Kick",
  "Punch (Soco)",
  "Fireball",
  "Banana",
  "Invisibility",
  "Shield"
];
