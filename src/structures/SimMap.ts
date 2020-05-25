import { shell } from '../utility';
import { Creature } from './Creature';

export interface Cell {
  creature?: Creature;
  foodAmount: number;
  foodColor: number; // 0..1
  x: number;
  y: number;
}

export class SimMap {
  cells: Cell[];

  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.cells = shell(width * height).map((_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);

      return {
        foodAmount: 0,
        foodColor: 0,
        x,
        y,
      };
    });
  }

  getCell(x: number, y: number) {
    return this.cells[y * this.width + x];
  }

  getCellOfCreature(creature: Creature) {
    return this.getCell(creature.x, creature.y);
  }

  getRanges(xFrom: number, xTo: number, yFrom: number, yTo: number) {
    const chunksCount = yTo - yFrom;
    const chunks = shell(chunksCount)
      .map((_, y) => {
        const lineStart = y * this.width;
        return { from: lineStart + xFrom, to: lineStart + xTo };
      })
      .map(({ from, to }) => this.cells.slice(from, to));

    return chunks;
  }

  getCellsInRadius(x: number, y: number, radius: number) {
    return this.getRanges(
      x - radius,
      x + radius,
      y - radius,
      y + radius
    ).flat();
  }
}