export interface Bottle {
  id: number;
  type: 'plastic' | 'glass' | 'aluminum';
  subType: 'bottle' | 'can';
  color?: 'green' | 'clear' | 'brown';
  depositValue?: number; // For DRS items: 15 or 25 cents
  x: number;
  y: number;
  rotation?: number; // For physics rotation
  velocity?: { x: number; y: number }; // For physics movement
  isSettled?: boolean; // Whether the bottle has stopped moving
}

export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  bottles: Bottle[];
  conveyorSpeed: number;
  nextBottleId: number;
}