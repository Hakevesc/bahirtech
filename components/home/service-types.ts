export type SrvCard = {
  id: string;
  tabId: string;
  h: string;
  p: string;
  href: string;
  urgent?: string;
  note?: string; // placeholder photo caption
  photo?: { src: string; alt: string };
};

/** Icon keys resolved by `SrvIcon` in icons.tsx — data files name a glyph, never draw one. */
export type SrvIconName =
  | "cloud" | "code" | "shield" | "scale" | "coin" | "gauge" | "lock"
  | "eye" | "target" | "bolt" | "chart" | "plug" | "layers" | "wrench"
  | "star" | "check" | "leaf" | "monitor" | "users";

export type SrvFeature = { icon: SrvIconName; title: string; body: string };

export type SrvPanel = {
  panelId: string;
  catId: string;
  label: string;
  /** Sits under the practice title in the counter column. */
  blurb: string;
  /** The four-up row along the bottom of the panel. Exactly four. */
  features: [SrvFeature, SrvFeature, SrvFeature, SrvFeature];
  tabs: { id: string; label: string }[];
  cards: SrvCard[];
};