import sample from "lodash/sample";

// eslint-disable-next-line import/prefer-default-export
export function sampleOrThrow<T>(items: ReadonlyArray<T>): T {
  const found = sample(items);
  if (found === undefined) {
    throw new Error("Invalid items");
  }
  return found;
}
