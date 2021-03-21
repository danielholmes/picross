import fill from "lodash/fill";
import sample from "lodash/sample";

export function sampleOrThrow<T>(items: ReadonlyArray<T>): T {
  const found = sample(items);
  if (found === undefined) {
    throw new Error("Invalid items");
  }
  return found;
}

export function filledArray<T>(length: number, value: T): ReadonlyArray<T> {
  return fill(Array(length), value);
}
