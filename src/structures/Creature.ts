import { DeciderInteraction, DeciderMovement } from './Decider';

export enum ActionInteraction {
  Nothing,
  Attack,
  Pair,
}

export enum ActionMove {
  Nothing,
  MoveLeft,
  MoveRight,
  MoveUp,
  MoveDown,
}

export interface Creature {
  id: string;
  hp: number;
  deciderMovement: DeciderMovement;
  deciderInteraction: DeciderInteraction;
  x: number;
  y: number;
  dead?: boolean;
}
