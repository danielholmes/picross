import flatMap from "lodash/flatMap";
import range from "lodash/range";

export type Matrix<T> = ReadonlyArray<ReadonlyArray<T>>;

export interface MatrixPosition {
  readonly x: number;
  readonly y: number;
}

export function createMatrixWithFactory<T>(
  width: number,
  height: number,
  factory: (x: number, y: number, current: Matrix<T>) => T
): Matrix<T> {
  const col = range(0, height);
  return range(0, width).reduce(
    (previousCols, x) => [
      ...previousCols,
      col.reduce((previousValues, y) => {
        const current: Matrix<T> = [...previousCols, previousValues];
        return [...previousValues, factory(x, y, current)];
      }, [] as ReadonlyArray<T>),
    ],
    [] as Matrix<T>
  );
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

export function getMatrixRowIndices<T>(
  matrix: Matrix<T>
): ReadonlyArray<number> {
  return range(0, matrix[0].length);
}

export function getMatrixColumnIndices<T>(
  matrix: Matrix<T>
): ReadonlyArray<number> {
  return range(0, matrix.length);
}

export function getMatrixPositions<T>(
  matrix: Matrix<T>
): ReadonlyArray<MatrixPosition> {
  const columnIndices = getMatrixColumnIndices(matrix);
  const rowIndices = getMatrixColumnIndices(matrix);
  return flatMap(columnIndices, (x) => rowIndices.map((y) => ({ x, y })));
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

export function matrixSet<T>(
  previous: Matrix<T>,
  updateX: number,
  updateY: number,
  newValue: T
): Matrix<T> {
  return previous.map((col, x) =>
    col.map((s, y) => {
      if (x === updateX && y === updateY) {
        return newValue;
      }
      return s;
    })
  );
}

export function matrixZip<T1, T2, R>(
  matrix1: Matrix<T1>,
  matrix2: Matrix<T2>,
  zipper: (a: T1, b: T2) => R
): Matrix<R> {
  if (
    matrix1.length !== matrix2.length ||
    matrix1[0].length !== matrix2[0].length
  ) {
    throw new Error("Matrices must be same sizes");
  }
  return createMatrixWithFactory(matrix1.length, matrix1[0].length, (x, y) =>
    zipper(matrix1[x][y], matrix2[x][y])
  );
}

export function reduceMatrixCells<T, R>(
  values: Matrix<T>,
  reducer: (previous: R, item: T, position: MatrixPosition) => R,
  init: R
): R {
  const positions = getMatrixPositions(values);
  return positions.reduce(
    (previous, position) =>
      reducer(previous, values[position.x][position.y], position),
    init
  );
}

export function findMatrixCellPosition<T>(
  matrix: Matrix<T>,
  finder: (value: T, position: MatrixPosition) => boolean
): MatrixPosition | undefined {
  return reduceMatrixCells(
    matrix,
    (previous, item, position) => {
      if (previous) {
        return previous;
      }
      if (finder(item, position)) {
        return position;
      }
      return undefined;
    },
    undefined as MatrixPosition | undefined
  );
}

export function findMatrixCellEntry<T>(
  matrix: Matrix<T>,
  finder: (value: T, position: MatrixPosition) => boolean
): Readonly<[MatrixPosition, T]> | undefined {
  return reduceMatrixCells(
    matrix,
    (previous, item, position) => {
      if (previous) {
        return previous;
      }
      if (finder(item, position)) {
        return [position, item];
      }
      return undefined;
    },
    undefined as Readonly<[MatrixPosition, T]> | undefined
  );
}
