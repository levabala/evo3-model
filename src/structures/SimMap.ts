import SimplexNoise from 'simplex-noise';

import { shell } from '../utility';
import { Creature } from './Creature';

export interface Cell {
  creature?: Creature;
  foodAmount: number;
  foodColor: number; // 0..1
  x: number;
  y: number;
}

export const emptyCell: Cell = {
  foodAmount: 0,
  foodColor: 0,
  x: -1,
  y: -1,
};

export class SimMap {
  cells: Cell[];

  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    const simplex = new SimplexNoise();
    const smooth = 30;

    this.cells = shell(width * height).map((_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);

      return {
        foodAmount: Infinity,
        foodColor: (simplex.noise2D(x / smooth, y / smooth) + 1) / 2,
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
    const chunksCount = yTo - yFrom + 1;
    const chunks = shell(chunksCount)
      .map((_, y) => {
        const lineStart = y * this.width;
        return { from: lineStart + xFrom, to: lineStart + xTo };
      })
      .map(({ from, to }) => this.cells.slice(from, to + 1));

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
