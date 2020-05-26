import { isVerbose } from './structures/Simulation';

export function shell(length: number) {
  return new Array(length).fill(undefined);
}

export function random(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function pickRandom<T>(arr: T[]) {
  const index = random(0, arr.length - 1);
  return arr[index];
}

export function beOrNotToBe<T>(be: T, notToBe: T) {
  return Math.random() >= 0.5 ? be : notToBe;
}

export function log(...args: any) {
  if (isVerbose()) console.log(...args);
}
