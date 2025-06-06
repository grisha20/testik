
export enum UpgradeType {
  CLICK_BOOST = 'CLICK_BOOST',
  AUTO_CLICK_BOOST = 'AUTO_CLICK_BOOST',
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  baseCost: number;
  level: number;
  type: UpgradeType;
  value: number; // The amount this upgrade level adds
  costIncreaseFactor: number;
}

export interface Boost {
  id: string;
  name: string;
  description: string;
  cost: number;
  durationSeconds: number;
  effectMultiplier: number;
  type: 'click' | 'auto'; // Type of boost: affects manual clicks or auto-clicks
  icon: string; // Font Awesome icon class
}

export type ActiveView = 'clicker' | 'upgrades' | 'boosts';
