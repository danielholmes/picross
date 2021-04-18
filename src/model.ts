import { getMatrixColumns, getMatrixRows, Matrix } from "./utils/matrix";

export type ProblemCellStatus = boolean;
export type AttemptCellStatus = ProblemCellStatus | undefined;

export interface Problem {
  readonly image: Matrix<ProblemCellStatus>;
  readonly name?: string;
  readonly columnHints: Matrix<number>;
  readonly rowHints: Matrix<number>;
}

function getHints(
  imageLine: ReadonlyArray<ProblemCellStatus>
): ReadonlyArray<number> {
  const presentHints = imageLine.reduce((accu, pixel, i) => {
    if (!pixel) {
      return accu;
    }
    if (i === 0) {
      return [1];
    }
    const previousPixel = imageLine[i - 1];
    if (previousPixel) {
      return [...accu.slice(0, -1), accu[accu.length - 1] + 1];
    }
    return [...accu, 1];
  }, [] as ReadonlyArray<number>);
  if (presentHints.length === 0) {
    return [0];
  }
  return presentHints;
}

export function createProblemFromImage(image: Matrix<boolean>): Problem {
  return {
    image,
    columnHints: getMatrixColumns(image).map((col) => getHints(col)),
    rowHints: getMatrixRows(image).map((row) => getHints(row)),
  };
}

export function isComplete(
  problem: Problem,
  attemptMarks: Matrix<AttemptCellStatus>
): boolean {
  return attemptMarks.every((attemptCol, x) =>
    attemptCol.every((cell, y) => problem.image[x][y] === !!cell)
  );
}
