import flatMap from "lodash/flatMap";
import sum from "lodash/sum";
import range from "lodash/range";
import {
  AttemptCellStatus,
  isComplete,
  Problem,
  ProblemCoordinate,
} from "../../model";
import { getMatrixColumn, getMatrixRow } from "../../utils/matrix";
import { filledArray } from "../../utils/array";
import { ProblemAttempt, ProblemAttemptAction } from "../attempt";

export type NextSolveStep = {
  readonly type: "column" | "row";
  readonly index: number;
};

export interface SolveState {
  readonly actions: ReadonlyArray<ProblemAttemptAction>;
  readonly nextLine: NextSolveStep;
}

function getNewNextLine(
  attempt: ProblemAttempt,
  { type, index }: NextSolveStep
): NextSolveStep {
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

function isAttemptLineFilled(line: ReadonlyArray<AttemptCellStatus>): boolean {
  return line.every((v) => v !== undefined);
}

function getNewNonFilledNextLine(
  attempt: ProblemAttempt,
  stage: NextSolveStep
): NextSolveStep {
  const potential = getNewNextLine(attempt, stage);
  const potentialLine =
    potential.type === "column"
      ? getMatrixColumn(attempt.marks, potential.index)
      : getMatrixRow(attempt.marks, potential.index);
  if (!isAttemptLineFilled(potentialLine)) {
    return potential;
  }
  return getNewNonFilledNextLine(attempt, potential);
}

function doesLineMatchCurrent(
  line: ReadonlyArray<AttemptCellStatus>,
  current: ReadonlyArray<AttemptCellStatus>
): boolean {
  return line.every((pC, i) => current[i] === undefined || current[i] === pC);
}

function createPermutations(
  hints: ReadonlyArray<number>,
  current: ReadonlyArray<AttemptCellStatus>
): ReadonlyArray<ReadonlyArray<AttemptCellStatus>> {
  // Special case of empty line
  if (hints.length === 1 && hints[0] === 0) {
    return [filledArray(current.length, false)];
  }

  const otherHints = hints.slice(1);
  // .length is for the spaces between each hint
  const otherSpace = sum(otherHints) + otherHints.length;

  const thisHint = hints[0];
  const thisHintSpace = current.length - otherSpace - thisHint;
  const possibleThisPositions: ReadonlyArray<
    ReadonlyArray<AttemptCellStatus>
  > = range(0, 1 + thisHintSpace).map((i) => [
    ...filledArray(i, false),
    ...filledArray(thisHint, true),
  ]);

  if (otherHints.length === 0) {
    // fill out empty spaces at end of perms
    return possibleThisPositions
      .map((p) => [...p, ...filledArray(current.length - p.length, false)])
      .filter((p) => doesLineMatchCurrent(p, current));
  }

  const possibleMatchingCurrent = possibleThisPositions.filter((possibleLine) =>
    doesLineMatchCurrent(possibleLine, current)
  );
  return flatMap(possibleMatchingCurrent, (p) => {
    const otherPermutations: ReadonlyArray<
      ReadonlyArray<AttemptCellStatus>
    > = createPermutations(otherHints, current.slice(p.length + 1));
    return otherPermutations.map((oP) => [...p, false, ...oP]);
  });
}

function solveLine(
  line: ReadonlyArray<AttemptCellStatus>,
  hints: ReadonlyArray<number>,
  getCoordinate: (i: number) => ProblemCoordinate
): ReadonlyArray<ProblemAttemptAction> {
  // Already solved
  if (isAttemptLineFilled(line)) {
    return [];
  }

  const allPermutations = createPermutations(hints, line);
  if (allPermutations.length === 0) {
    throw new Error(
      "Invalid state, couldn't find any valid permutations for hints"
    );
  }

  // TODO: Probably a more efficient way to perform these 2 reduces
  const newLine = allPermutations.slice(1).reduce(
    (previous, perm) =>
      previous.map((c, i) => {
        if (c === perm[i]) {
          return c;
        }
        return line[i];
      }),
    allPermutations[0]
  );
  return newLine.reduce(
    (previous, status, i): ReadonlyArray<ProblemAttemptAction> => {
      if (status === undefined || status === line[i]) {
        return previous;
      }
      return [
        ...previous,
        {
          type: status ? "mark" : "unmark",
          coordinate: getCoordinate(i),
        },
      ];
    },
    [] as ReadonlyArray<ProblemAttemptAction>
  );
}

function stepAttempt(
  problem: Problem,
  attempt: ProblemAttempt,
  current: NextSolveStep
): ReadonlyArray<ProblemAttemptAction> {
  if (current.type === "column") {
    const line = attempt.marks[current.index];
    return solveLine(line, problem.columnHints[current.index], (i) => ({
      x: current.index,
      y: i,
    }));
  }

  const line = getMatrixRow(attempt.marks, current.index);
  return solveLine(line, problem.rowHints[current.index], (i) => ({
    x: i,
    y: current.index,
  }));
}

export function startSolvingProblem(): NextSolveStep {
  return {
    type: "column" as const,
    index: 0,
  };
}

export function solveNextStep(
  problem: Problem,
  attempt: ProblemAttempt,
  nextLine: NextSolveStep
): SolveState {
  if (isComplete(problem, attempt.marks)) {
    throw new Error("Already completed");
  }

  const actions = stepAttempt(problem, attempt, nextLine);
  const newNextLine = getNewNonFilledNextLine(attempt, nextLine);
  return {
    nextLine: newNextLine,
    actions,
  };
}
