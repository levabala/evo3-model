import { ActionInteraction, ActionMove, Creature } from './Creature';
import { Cell } from './SimMap';

export class Decider {
  net: any;
}

// TODO: write deciders and net
export class DeciderMovement extends Decider {
  merge(decider: DeciderMovement): DeciderMovement {
    return this;
  }

  decide(cells: Cell[]): ActionMove {
    return ActionMove.Nothing;
  }
}

export class DeciderInteraction extends Decider {
  decide(creature: Creature): ActionInteraction {
    return ActionInteraction.Nothing;
  }

  merge(decider: DeciderInteraction): DeciderInteraction {
    return this;
  }
}
