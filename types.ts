// Fix: Import ReactNode to resolve type errors.
import type { ReactNode } from 'react';

export enum SpaceType {
  GO,
  PROPERTY,
  CHANCE,
  COMMUNITY_CHEST,
  TAX,
  RAILROAD,
  UTILITY,
  FREE_PARKING,
  JAIL,
  GO_TO_JAIL,
}

export enum GamePhase {
  START_TURN,
  ROLLING,
  MOVING,
  ACTION,
  END_TURN,
  GAME_OVER,
}

export interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  color: string;
  icon: string;
  isBankrupt: boolean;
}

export interface Space {
  id: number;
  name: string;
  type: SpaceType;
  price?: number;
  rent?: number;
  colorGroup?: string;
}

export interface PropertyState {
    id: number;
    ownerId: number | null;
}

export interface Card {
    description: string;
    action: {
        type: 'money' | 'move';
        amount?: number;
        position?: number;
    };
}

export interface GameState {
  players: Player[];
  properties: PropertyState[];
  currentPlayerIndex: number;
  dice: [number, number];
  gamePhase: GamePhase;
  eventLog: string[];
  modal: {
    isOpen: boolean;
    title: string;
    // Fix: Use imported ReactNode type.
    content: ReactNode;
  };
  isRolling: boolean;
  movementSteps: number;
}

// Reducer Actions
export type Action =
  | { type: 'ROLL_DICE'; payload: { dice1: number; dice2: number } }
  | { type: 'BUY_PROPERTY'; payload: Space }
  | { type: 'PAY_RENT'; payload: { property: Space; owner: Player } }
  | { type: 'DRAW_CARD'; payload: Card }
  | { type: 'GO_TO_JAIL' }
  | { type: 'PAY_TAX'; payload: { amount: number; name: string } }
  | { type: 'END_TURN' }
  | { type: 'NO_ACTION' }
  | { type: 'SET_IS_ROLLING'; payload: boolean }
  | { type: 'START_MOVEMENT'; payload: number }
  | { type: 'MOVE_ONE_STEP' }
  // Fix: Use imported ReactNode type.
  | { type: 'SHOW_MODAL'; payload: { title: string; content: ReactNode } }
  | { type: 'CLOSE_MODAL' };