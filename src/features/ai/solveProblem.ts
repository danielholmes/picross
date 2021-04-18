import { AttemptCellStatus, Problem } from "model";
import {
  findMatrixCellEntry,
  getMatrixRows,
  Matrix,
  MatrixPosition,
  matrixZip,
  reduceMatrixCells,
  transpose,
} from "utils/matrix";
import { ProblemAttempt, ProblemAttemptAction } from "features/attempt";
import { filledArray } from "utils/array";
import { createAllLinePermutations } from "./solveUtils";

export type AttemptProbabilities = Matrix<number | undefined>;

function createLineProbabilities(
  permutations: ReadonlyArray<ReadonlyArray<AttemptCellStatus>>
): ReadonlyArray<number> {
  const counts = permutations.reduce(
    (previous, permutation) =>
      previous.map((indexCount, i) => {
        if (permutation[i]) {
          return indexCount + 1;
        }
        return indexCount;
      }),
    filledArray(permutations[0].length, 0)
  );
  return counts.map((count) => count / permutations.length);
}

function createDimensionProbabilities(
  dimensionHints: Matrix<number>,
  dimensionMarks: Matrix<AttemptCellStatus>
): AttemptProbabilities {
  const permutations = dimensionHints.map((hints, i) =>
    createAllLinePermutations(hints, dimensionMarks[i])
  );
  const probabilities = permutations.map((linePermutations) =>
    createLineProbabilities(linePermutations)
  );
  return matrixZip(probabilities, dimensionMarks, (a, b) => {
    if (b !== undefined) {
      return undefined;
    }
    return a;
  });
}

export function getProbabilities(
  problem: Problem,
  attempt: ProblemAttempt
): AttemptProbabilities {
  const columnProbabilities = createDimensionProbabilities(
    problem.columnHints,
    attempt.marks
  );
  const rowProbabilities = transpose(
    createDimensionProbabilities(problem.rowHints, getMatrixRows(attempt.marks))
  );
  return matrixZip(columnProbabilities, rowProbabilities, (a, b) => {
    if (a === undefined || b === undefined) {
      return undefined;
    }
    if (a === 0 || b === 0) {
      return 0;
    }
    return Math.max(a, b);
  });
}

function getDefiniteAction(
  attempt: ProblemAttempt,
  probabilities: AttemptProbabilities
): ProblemAttemptAction | undefined {
  const entry = findMatrixCellEntry(probabilities, (v, p) => {
    if (attempt.marks[p.x][p.y] !== undefined) {
      return false;
    }
    return v === 1 || v === 0;
  });
  if (entry === undefined) {
    return undefined;
  }

  const [coordinate, probability] = entry;
  if (probability === 1) {
    return {
      type: "mark",
      coordinate,
    };
  }
  return {
    type: "unmark",
    coordinate,
  };
}

function getHighestProbabilityAction(
  attempt: ProblemAttempt,
  probabilities: AttemptProbabilities
): ProblemAttemptAction {
  const entry = reduceMatrixCells(
    probabilities,
    (previous, value, position) => {
      if (value === undefined) {
        return previous;
      }
      if (previous === undefined) {
        return [position, value] as const;
      }
      const [, previousValue] = previous;
      if (previousValue > value) {
        return previous;
      }
      return [position, value] as const;
    },
    undefined as Readonly<[MatrixPosition, number]> | undefined
  );
  if (entry === undefined) {
    throw new Error("No entry");
  }

  return {
    type: "mark",
    coordinate: entry[0],
  };
}

export function getActionForProbabilities(
  attempt: ProblemAttempt,
  probabilities: AttemptProbabilities
): ProblemAttemptAction {
  const action = getDefiniteAction(attempt, probabilities);
  if (action) {
    return action;
  }
  return getHighestProbabilityAction(attempt, probabilities);
}
