import { v4 } from 'uuid';

import { pickRandom } from '../utility';
import { ActionInteraction, ActionMove, Creature } from './Creature';
import { DeciderInteraction, DeciderMovement } from './Decider';
import { Cell, SimMap } from './SimMap';

export class Simulation {
  readonly map: SimMap;
  creatures: Creature[] = [];

  maxCreatureHp = 10;

  constructor(width: number, height: number) {
    this.map = new SimMap(width, height);
  }

  isCellFree(x: number, y: number) {
    return !this.map.getCell(x, y);
  }

  killCreature(creature: Creature) {
    creature.dead = true;
  }

  removeCreature(creature: Creature) {
    const cell = this.map.getCellOfCreature(creature);
    cell.creature = undefined;
  }

  addCreature(creature: Creature, cell = this.map.getCellOfCreature(creature)) {
    if (cell.creature)
      throw new Error("Cannot spawn creature at a cell with existing creature");

    cell.creature = creature;
    creature.x = cell.x;
    creature.y = cell.y;
  }

  spawnRandomCreature(): "No free cells" | "Ok" {
    const freeCells = this.map.cells.filter(({ creature }) => !creature);
    if (!freeCells.length) return "No free cells";

    const cell = pickRandom(freeCells);
    const creature: Creature = {
      deciderInteraction: new DeciderInteraction(),
      deciderMovement: new DeciderMovement(),
      hp: this.maxCreatureHp,
      id: v4(),
      x: cell.x,
      y: cell.y,
    };

    this.addCreature(creature, cell);

    return "Ok";
  }

  processMovement(creature: Creature, cellsAround: Cell[]) {
    // process movements
    const actionMove = creature.deciderMovement.decide(cellsAround);

    const moveMap: Record<ActionMove, { dx: number; dy: number }> = {
      [ActionMove.Nothing]: { dx: 0, dy: 0 },
      [ActionMove.MoveDown]: { dx: 0, dy: 1 },
      [ActionMove.MoveLeft]: { dx: -1, dy: 0 },
      [ActionMove.MoveUp]: { dx: 0, dy: -1 },
      [ActionMove.MoveRight]: { dx: 1, dy: 0 },
    };

    const delta = moveMap[actionMove];
    const x = creature.x + delta.dx;
    const y = creature.y + delta.dy;
    const cellTarget = this.map.getCell(x, y);

    if (cellTarget.creature) return;

    this.removeCreature(creature);
    this.addCreature(creature, cellTarget);
  }

  processInteraction(creature1: Creature, creature2: Creature) {
    const action1 = creature1.deciderInteraction.decide(creature2);
    const action2 = creature2.deciderInteraction.decide(creature1);

    const fight = () => {
      if (creature1.hp > creature2.hp) this.removeCreature(creature2);
      else if (creature1.hp < creature2.hp) this.removeCreature(creature1);
    };

    const pair = () => {
      if (
        creature1.hp < this.maxCreatureHp ||
        creature2.hp < this.maxCreatureHp
      )
        return;

      const spawnRadius = 1;
      const cellsAround: Cell[] = this.map
        .getCellsInRadius(creature1.x, creature1.y, spawnRadius)
        .flat();
      const freeCell = cellsAround.find((cell) => !cell.creature);

      if (!freeCell) return;

      const newCreatureHp = creature1.hp / 2 + creature2.hp / 2;

      creature1.hp /= 2;
      creature2.hp /= 2;

      const newCreature: Creature = {
        deciderInteraction: creature1.deciderInteraction.merge(
          creature2.deciderInteraction
        ),
        deciderMovement: creature1.deciderMovement.merge(
          creature2.deciderMovement
        ),
        hp: newCreatureHp,
        id: v4(),
        x: freeCell.x,
        y: freeCell.y,
      };

      this.addCreature(newCreature);
    };

    const nothing = () => {};

    if (
      action1 === ActionInteraction.Attack ||
      action2 === ActionInteraction.Attack
    )
      fight();
    else if (
      action1 === ActionInteraction.Pair ||
      action2 === ActionInteraction.Pair
    )
      pair();
    else nothing();
  }

  tick() {
    this.creatures.forEach((creature) => {
      const actionRadius = 1;
      const cellsAround: Cell[] = this.map
        .getCellsInRadius(creature.x, creature.y, actionRadius)
        .flat();

      // processing movement
      this.processMovement(creature, cellsAround);

      // processing interaction
      const creaturesAround = cellsAround
        .filter(({ creature }) => creature)
        .map(({ creature }) => creature as Creature);
      creaturesAround.forEach((creatureOther) =>
        this.processInteraction(creature, creatureOther)
      );
    });
  }
}
