import { v4 } from 'uuid';

import { beOrNotToBe as beornottobe, log, pickRandom, random } from '../utility';
import { ActionInteraction, ActionMove, Creature } from './Creature';
import { DeciderInteraction, DeciderMovement } from './Decider';
import { Cell, SimMap } from './SimMap';

let verboseCurrent = false;
export const isVerbose = () => verboseCurrent;

export class Simulation {
  readonly map: SimMap;
  creatures: Creature[] = [];

  maxCreatureHp = 10;
  hpDowngradePerTick = 0.1;

  constructor(width: number, height: number, verbose = false) {
    this.map = new SimMap(width, height);

    verboseCurrent = verbose;
  }

  isCellFree(x: number, y: number) {
    return (
      x > 0 &&
      x < this.map.width - 1 &&
      y > 0 &&
      y < this.map.height - 1 &&
      !this.map.getCell(x, y).creature
    );
  }

  killCreature(creature: Creature) {
    creature.dead = true;
  }

  removeCreature(creature: Creature) {
    log("remove creature");
    const cell = this.map.getCellOfCreature(creature);
    cell.creature = undefined;

    creature.dead = true;

    this.creatures.splice(this.creatures.indexOf(creature), 1);
  }

  addCreature(creature: Creature, cellTo: Cell) {
    log("add creature");
    cellTo.creature = creature;
    creature.x = cellTo.x;
    creature.y = cellTo.y;

    this.creatures.push(creature);
  }

  moveCreature(creature: Creature, cellTo: Cell) {
    if (cellTo.creature)
      throw new Error("Cannot spawn creature at a cell with existing creature");

    const cellFrom = this.map.getCellOfCreature(creature);
    cellFrom.creature = undefined;

    cellTo.creature = creature;
    creature.x = cellTo.x;
    creature.y = cellTo.y;
  }

  spawnRandomCreature(): "No free cells" | "Ok" {
    const freeCells = this.map.cells.filter(({ creature }) => !creature);
    if (!freeCells.length) return "No free cells";

    log("spawn creature");

    const cell = pickRandom(freeCells);
    const creature: Creature = {
      deciderInteraction: new DeciderInteraction(),
      deciderMovement: new DeciderMovement(),
      hp: random(this.maxCreatureHp / 2, this.maxCreatureHp),
      id: v4(),
      x: cell.x,
      y: cell.y,
      color: Math.random() * 2 - 1, // -1..1
    };

    this.addCreature(creature, cell);

    return "Ok";
  }

  processMovement(creature: Creature, cellsAround: Cell[]) {
    if (creature.dead) return;

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
    if (!delta.dx && !delta.dy) return;

    const x = creature.x + delta.dx;
    const y = creature.y + delta.dy;
    const cellTarget = this.map.getCell(x, y);

    const couldBeDone = this.isCellFree(x, y);
    log("move", actionMove);
    if (!couldBeDone) return;

    this.moveCreature(creature, cellTarget);
  }

  processInteraction(creature1: Creature, creature2: Creature) {
    if (creature1.dead || creature2.dead) return;

    log("interaction");
    const action1 = creature1.deciderInteraction.decide(creature2);
    const action2 = creature2.deciderInteraction.decide(creature1);

    const fight = () => {
      log("interact: fight");
      if (creature1.hp > creature2.hp) this.removeCreature(creature2);
      else if (creature1.hp < creature2.hp) this.removeCreature(creature1);
    };

    const pair = () => {
      log("interact: pair");

      const newCreatureHp = creature1.hp / 2 + creature2.hp / 2;

      creature1.hp /= 2;
      creature2.hp /= 2;

      if (
        creature1.hp < this.maxCreatureHp / 2 ||
        creature2.hp < this.maxCreatureHp / 2
      )
        return;

      const spawnRadius = 1;
      const cellsAround: Cell[] = this.map
        .getCellsInRadius(creature1.x, creature1.y, spawnRadius)
        .flat();
      const freeCell = cellsAround.find((cell) => !cell.creature);

      if (!freeCell) return;

      const deciderInteraction = beornottobe(
        creature1.deciderInteraction.merge(creature2.deciderInteraction),
        creature2.deciderInteraction.merge(creature1.deciderInteraction)
      );

      const deciderMovement = beornottobe(
        creature1.deciderMovement.merge(creature2.deciderMovement),
        creature2.deciderMovement.merge(creature1.deciderMovement)
      );

      const newCreature: Creature = {
        deciderInteraction,
        deciderMovement,
        hp: newCreatureHp,
        id: v4(),
        x: freeCell.x,
        y: freeCell.y,
        color: (creature1.color + creature2.color) / 2,
      };

      this.addCreature(newCreature, freeCell);
    };

    const nothing = () => {
      log("interact: nothing");
    };

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
    log("tick creatures:", this.creatures.length);

    this.creatures.forEach((creature) => {
      creature.hp -= this.hpDowngradePerTick;

      if (creature.hp <= 0) creature.dead = true;
    });

    const cellsAroundEachCreature = this.creatures.map((creature) => {
      const actionRadius = 1;
      const cellsAround: Cell[] = this.map
        .getCellsInRadius(creature.x, creature.y, actionRadius)
        .flat();

      return cellsAround;
    });

    log({ cellsAroundEachCreature });

    // processing movement
    this.creatures.forEach((creature, i) => {
      const cellsAround = cellsAroundEachCreature[i];
      if (!cellsAround) return;

      this.processMovement(creature, cellsAround);
    });

    // processing interaction
    this.creatures.forEach((creatureWho, i) => {
      const cellsAround = cellsAroundEachCreature[i];
      if (!cellsAround) return;

      const creaturesAround = cellsAround
        .filter(({ creature }) => creature && creature !== creatureWho)
        .map(({ creature }) => creature as Creature);

      creaturesAround.forEach((creatureOther) =>
        this.processInteraction(creatureWho, creatureOther)
      );
    });
  }
}
