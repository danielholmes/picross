import { AttemptCellStatus, Problem } from "model";
import { getMatrixRows, Matrix, matrixZip } from "utils/matrix";
import { ProblemAttempt, ProblemAttemptAction } from "features/attempt";
import { filledArray } from "utils/array";
import { createAllLinePermutations } from "./solveUtils";

export interface ProbabilitySolveState {
  readonly type: "probability";
  readonly probabilities: Matrix<number | undefined>;
}

interface ProbabilityResult {
  readonly actions: ReadonlyArray<ProblemAttemptAction>;
  readonly solveState: ProbabilitySolveState;
}

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
): Matrix<number> {
  const permutations = dimensionHints.map((hints, i) =>
    createAllLinePermutations(hints, dimensionMarks[i])
  );
  return permutations.map((linePermutations) =>
    createLineProbabilities(linePermutations)
  );
}

export function startProbabilitySolving(
  problem: Problem,
  attempt: ProblemAttempt
): ProbabilitySolveState {
  const columnProbabilities = createDimensionProbabilities(
    problem.columnHints,
    attempt.marks
  );
  const rowProbabilities = createDimensionProbabilities(
    problem.rowHints,
    getMatrixRows(attempt.marks)
  );
  const probabilities = matrixZip(
    columnProbabilities,
    rowProbabilities,
    (a, b) => {
      if (a >= 1 || b >= 1) {
        return 1;
      }
      return a * b;
    }
  );

  return {
    type: "probability",
    probabilities,
  };
}

export function solveProbabilityNextStep(
  problem: Problem,
  attempt: ProblemAttempt,
  current: ProbabilitySolveState
): ProbabilityResult {
  return {
    actions: [],
    solveState: current,
  };
}
