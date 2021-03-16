import range from "lodash/range";

export type Matrix<T> = ReadonlyArray<ReadonlyArray<T>>;

export function createMatrixWithFactory<T>(
  width: number,
  height: number,
  factory: (x: number, y: number) => T
): Matrix<T> {
  const col = range(0, height);
  return range(0, width).map((x) => col.map((y) => factory(x, y)));
}

export function createMatrix<T>(
  width: number,
  height: number,
  value: T
): Matrix<T> {
  return createMatrixWithFactory(width, height, () => value);
}
