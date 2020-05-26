import { ActionInteraction, ActionMove, Creature } from './Creature';
import { Net } from './Net';
import { Cell } from './SimMap';

export class DeciderMovement {
  net: Net;

  constructor(net?: Net) {
    this.net = net || new Net(37, 18, 5);
  }

  // TODO: create abstract class with "merge" method
  merge(decider: DeciderMovement): DeciderMovement {
    const middle = Math.floor(this.net.countHidden / 2);
    const neuronsLeft = this.net.hiddenNeurons.slice(0, middle);
    const neuronsRight = decider.net.hiddenNeurons.slice(
      middle,
      decider.net.countHidden
    );

    return new DeciderMovement(
      new Net(37, 18, 5, neuronsLeft.concat(neuronsRight))
    );
  }

  decide(cells: Cell[]): ActionMove {
    const colors = cells.map(({ foodColor }) => foodColor);
    const amounts = cells.map(({ foodAmount }) => foodAmount);
    const noize = Math.random() - 0.5;

    const inputs = [noize, ...colors, ...amounts];

    const outputs = this.net.calc(inputs);
    const maxOutput = Math.max(...outputs);

    const maxIndex = outputs.findIndex((val) => val === maxOutput);
    const indexToAction: ActionMove[] = [
      ActionMove.Nothing,
      ActionMove.MoveUp,
      ActionMove.MoveRight,
      ActionMove.MoveLeft,
      ActionMove.MoveUp,
    ];

    const action = indexToAction[maxIndex];

    return action;
  }
}

export class DeciderInteraction {
  net: Net;

  constructor(net?: Net) {
    this.net = net || new Net(3, 3, 3);
  }

  decide(creature: Creature): ActionInteraction {
    const noize = Math.random() - 0.5;

    const inputs = [noize, creature.hp, creature.color];
    const outputs = this.net.calc(inputs);

    const maxOutput = Math.max(...outputs);

    const maxIndex = outputs.findIndex((val) => val === maxOutput);
    const indexToAction: ActionInteraction[] = [
      ActionInteraction.Nothing,
      ActionInteraction.Pair,
      ActionInteraction.Attack,
    ];

    const action = indexToAction[maxIndex];

    return action;
  }

  merge(decider: DeciderInteraction): DeciderInteraction {
    const middle = Math.floor(this.net.countHidden / 2);
    const neuronsLeft = this.net.hiddenNeurons.slice(0, middle);
    const neuronsRight = decider.net.hiddenNeurons.slice(
      middle,
      decider.net.countHidden
    );

    return new DeciderInteraction(
      new Net(3, 3, 3, neuronsLeft.concat(neuronsRight))
    );
  }
}
