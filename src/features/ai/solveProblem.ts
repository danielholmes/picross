import flatMap from "lodash/flatMap";
import sum from "lodash/sum";
import range from "lodash/range";
import { AttemptCellStatus, isComplete, Problem } from "../../model";
import { AiProblemAttempt } from "./model";
import {
  createMatrix,
  getMatrixRow,
  replaceColumn,
  replaceRow,
} from "../../utils/matrix";
import { filledArray } from "../../utils/array";

type SolveStage = {
  readonly type: "column" | "row";
  readonly index: number;
};

export interface SolveState {
  readonly attempt: AiProblemAttempt;
  readonly nextLine: SolveStage;
}

function getNewNextLine(
  attempt: AiProblemAttempt,
  { type, index }: SolveStage
): SolveStage {
  const numCols = attempt.marks.length;
  if (type === "column") {
    if (index >= numCols - 1) {
      return {
        type: "row",
        index: 0,
      };
    }
    return {
      type: "column",
      index: index + 1,
    };
  }

  const numRows = attempt.marks[0].length;
  if (index >= numRows - 1) {
    return {
      type: "column",
      index: 0,
    };
  }
  return {
    type: "row",
    index: index + 1,
  };
}

function createPermutations(
  hints: ReadonlyArray<number>,
  current: ReadonlyArray<AttemptCellStatus>
): ReadonlyArray<ReadonlyArray<AttemptCellStatus>> {
  // Special case of empty line
  if (hints.length === 1 && hints[0] === 0) {
    return [current.map(() => false)];
  }

  const otherHints = hints.slice(1);
  const otherSpace = sum(otherHints) + otherHints.length; // .length are the spaces between

  const thisHint = hints[0];
  const thisHintSpace = current.length - otherSpace;
  const possibleThisPositions: ReadonlyArray<
    ReadonlyArray<AttemptCellStatus>
  > = range(0, 1 + thisHintSpace).map((i) => [
    ...filledArray(i, false),
    ...filledArray(thisHint, true),
  ]);

  const possibleMatchingCurrent: ReadonlyArray<
    ReadonlyArray<AttemptCellStatus>
  > = possibleThisPositions.filter((possibleLine) =>
    possibleLine.every((pC, i) => current[i] === undefined || current[i] === pC)
  );

  if (otherHints.length === 0) {
    return possibleMatchingCurrent;
  }

  return flatMap(possibleMatchingCurrent, (p) => {
    const otherPermutations: ReadonlyArray<
      ReadonlyArray<AttemptCellStatus>
    > = createPermutations(otherHints, current.slice(p.length + 1));
    return otherPermutations.map((oP) => [...p, false, ...oP]);
  });
}

function solveLine(
  line: ReadonlyArray<AttemptCellStatus>,
  hints: ReadonlyArray<number>
): ReadonlyArray<AttemptCellStatus> {
  // Already solved
  if (line.every((v) => v !== undefined)) {
    return line;
  }

  const allPermutations = createPermutations(hints, line);
  if (allPermutations.length === 0) {
    throw new Error(
      "Invalid state, couldn't find any valid permutations for hints"
    );
  }

  console.log("TODO: Find all common value and use those");
  return allPermutations[0];
}

function stepAttempt(
  problem: Problem,
  attempt: AiProblemAttempt,
  current: SolveStage
): AiProblemAttempt {
  if (current.type === "column") {
    const line = attempt.marks[current.index];
    const newLine = solveLine(line, problem.columnHints[current.index]);
    if (line === newLine) {
      return attempt;
    }
    return {
      marks: replaceColumn(attempt.marks, current.index, newLine),
    };
  }

  const line = getMatrixRow(attempt.marks, current.index);
  const newLine = solveLine(line, problem.rowHints[current.index]);
  if (line === newLine) {
    return attempt;
  }
  return {
    marks: replaceRow(attempt.marks, current.index, newLine),
  };
}

function* solveNextStep(
  problem: Problem,
  { attempt, nextLine }: SolveState
): Generator<SolveState, AiProblemAttempt> {
  const newAttempt = stepAttempt(problem, attempt, nextLine);
  if (isComplete(problem, newAttempt.marks)) {
    return newAttempt;
  }

  const newNextLine = getNewNextLine(attempt, nextLine);
  const nextState = { attempt: newAttempt, nextLine: newNextLine };
  yield nextState;
  return yield* solveNextStep(problem, nextState);
}

export default function* solveProblem(
  problem: Problem
): Generator<SolveState, AiProblemAttempt> {
  const attempt = {
    marks: createMatrix(
      problem.image.length,
      problem.image[0].length,
      undefined
    ),
  };
  const initialState = {
    attempt,
    nextLine: {
      type: "column" as const,
      index: 0,
    },
  };
  yield initialState;
  return yield* solveNextStep(problem, initialState);
}
