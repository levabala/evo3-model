import { ActionInteraction, ActionMove, Creature } from './Creature';
import { Net } from './Net';
import { Cell } from './SimMap';

export class DeciderMovement {
  net: Net;

  constructor(net?: Net) {
    this.net = net || new Net(10, 4, 4);
  }

  // TODO: create abstract class with "merge" method
  merge(decider: DeciderMovement, mutateRate = 0.01): DeciderMovement {
    const middle = Math.floor(this.net.countHidden / 2);
    const neuronsLeft = this.net.hiddenNeurons.slice(0, middle);
    const neuronsRight = decider.net.hiddenNeurons.slice(
      middle,
      decider.net.countHidden
    );

    return new DeciderMovement(
      new Net(10, 4, 4, mutateRate, neuronsLeft.concat(neuronsRight))
    );
  }

  decide(cells: Cell[], creature: Creature): ActionMove {
    const colorsDiffs = cells.map(({ foodColor }) =>
      Math.abs(foodColor - creature.color)
    );
    // const amounts = cells.map(({ foodAmount }) => foodAmount);
    const noize = Math.random() - 0.5;

    // const inputs = [noize, ...colorsDiffs, ...amounts];
    const inputs = [noize, ...colorsDiffs]; // , ...amounts];

    const outputs = this.net.calc(inputs);
    const maxOutput = Math.max(...outputs);

    const maxIndex = outputs.findIndex((val) => val === maxOutput);
    const indexToAction: ActionMove[] = [
      ActionMove.MoveUp,
      ActionMove.MoveRight,
      ActionMove.MoveLeft,
      ActionMove.MoveDown,
      // ActionMove.Nothing,
    ];

    const action = indexToAction[maxIndex];

    return action;
  }

  mutated(mutateRate = 0.01) {
    return new DeciderMovement(
      new Net(10, 4, 4, mutateRate, this.net.hiddenNeurons)
    );
  }
}

export class DeciderInteraction {
  net: Net;

  constructor(net?: Net) {
    this.net = net || new Net(3, 3, 3);
  }

  mutated(mutateRate = 0.01) {
    return new DeciderInteraction(
      new Net(3, 3, 3, mutateRate, this.net.hiddenNeurons)
    );
  }

  decide(creature: Creature): ActionInteraction {
    return ActionInteraction.Nothing;

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

  merge(decider: DeciderInteraction, mutateRate = 0.01): DeciderInteraction {
    const middle = Math.floor(this.net.countHidden / 2);
    const neuronsLeft = this.net.hiddenNeurons.slice(0, middle);
    const neuronsRight = decider.net.hiddenNeurons.slice(
      middle,
      decider.net.countHidden
    );

    return new DeciderInteraction(
      new Net(3, 3, 3, mutateRate, neuronsLeft.concat(neuronsRight))
    );
  }
}
