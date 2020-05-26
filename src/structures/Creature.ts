import { DeciderInteraction, DeciderMovement } from './Decider';

export enum ActionInteraction {
  Nothing = "Nothing",
  Attack = "Attack",
  Pair = "Pair",
}

export enum ActionMove {
  Nothing = "Nothing",
  MoveLeft = "MoveLeft",
  MoveRight = "MoveRight",
  MoveUp = "MoveUp",
  MoveDown = "MoveDown",
}

export interface Creature {
  id: string;
  hp: number;
  deciderMovement: DeciderMovement;
  deciderInteraction: DeciderInteraction;
  x: number;
  y: number;
  color: number;
  dead?: boolean;
}
