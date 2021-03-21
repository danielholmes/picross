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

export function transpose<T>(matrix: Matrix<T>): Matrix<T> {
  return createMatrixWithFactory(
    matrix[0].length,
    matrix.length,
    (x, y) => matrix[y][x]
  );
}

export function getMatrixColumns<T>(
  matrix: Matrix<T>
): ReadonlyArray<ReadonlyArray<T>> {
  return matrix;
}

export function getMatrixRows<T>(
  matrix: Matrix<T>
): ReadonlyArray<ReadonlyArray<T>> {
  const xIndices = range(0, matrix.length);
  return range(0, matrix[0].length).map((y) =>
    xIndices.map((x) => matrix[x][y])
  );
}

export function getMatrixRow<T>(
  matrix: Matrix<T>,
  index: number
): ReadonlyArray<T> {
  return matrix.map((col) => col[index]);
}

export function getMatrixColumn<T>(
  matrix: Matrix<T>,
  index: number
): ReadonlyArray<T> {
  return matrix[index];
}

export function replaceColumn<T>(
  matrix: Matrix<T>,
  index: number,
  newCol: ReadonlyArray<T>
): Matrix<T> {
  return matrix.map((col, x) => {
    if (x === index) {
      return newCol;
    }
    return col;
  });
}

export function replaceRow<T>(
  matrix: Matrix<T>,
  index: number,
  newRow: ReadonlyArray<T>
): Matrix<T> {
  return matrix.map((col, x) => [
    ...col.slice(0, index),
    newRow[x],
    ...col.slice(index + 1),
  ]);
}
