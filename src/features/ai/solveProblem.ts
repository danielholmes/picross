import flatMap from "lodash/flatMap";
import sum from "lodash/sum";
import range from "lodash/range";
import { AttemptCellStatus, Problem } from "../../model";
import { getMatrixColumn, getMatrixRow } from "../../utils/matrix";
import { filledArray } from "../../utils/array";
import {ProblemAttempt, SolveAction} from "../attempt";

type SolveStage = {
  readonly type: "column" | "row";
  readonly index: number;
};

export interface SolveState {
  readonly actions: ReadonlyArray<SolveAction>;
  readonly nextLine: SolveStage;
}

function getNewNextLine(
  attempt: ProblemAttempt,
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

function isAttemptLineFilled(line: ReadonlyArray<AttemptCellStatus>): boolean {
  return line.every((v) => v !== undefined);
}

function getNewNonFilledNextLine(
  attempt: ProblemAttempt,
  stage: SolveStage
): SolveStage {
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
  hints: ReadonlyArray<number>
): ReadonlyArray<AttemptCellStatus> {
  // Already solved
  if (isAttemptLineFilled(line)) {
    return line;
  }

  const allPermutations = createPermutations(hints, line);
  if (allPermutations.length === 0) {
    throw new Error(
      "Invalid state, couldn't find any valid permutations for hints"
    );
  }

  return allPermutations.slice(1).reduce(
    (previous, perm) =>
      previous.map((c, i) => {
        if (c === perm[i]) {
          return c;
        }
        return line[i];
      }),
    allPermutations[0]
  );
}

function stepAttempt(
  problem: Problem,
  attempt: ProblemAttempt,
  current: SolveStage
): ReadonlyArray<SolveAction> {
  if (current.type === "column") {
    const line = attempt.marks[current.index];
    const newLine = solveLine(line, problem.columnHints[current.index]);
    if (line === newLine) {
      return [];
    }
    // TODO: solveLine should return actions instead
    return newLine.reduce((previous, status, i): ReadonlyArray<SolveAction> => {
      if (status === undefined || status === line[i]) {
        return previous;
      }
      return [
        ...previous,
        {
          type: status ? "mark" : "unmark",
          coordinate: { x: current.index, y: i },
        },
      ];
    }, [] as ReadonlyArray<SolveAction>);
  }

  const line = getMatrixRow(attempt.marks, current.index);
  // TODO: solveLine should return actions instead
  const newLine = solveLine(line, problem.rowHints[current.index]);
  if (line === newLine) {
    return [];
  }
  return newLine.reduce((previous, status, i): ReadonlyArray<SolveAction> => {
    if (status === undefined || status === line[i]) {
      return previous;
    }
    return [
      ...previous,
      {
        type: status ? "mark" : "unmark",
        coordinate: { x: i, y: current.index },
      },
    ];
  }, [] as ReadonlyArray<SolveAction>);
}

function* solveNextStep(
  problem: Problem,
  attempt: ProblemAttempt,
  { nextLine }: SolveState
): Generator<SolveState, void, ProblemAttempt> {
  const actions = stepAttempt(problem, attempt, nextLine);

  const newNextLine = getNewNonFilledNextLine(attempt, nextLine);
  const nextState = {
    nextLine: newNextLine,
    actions,
  };
  const newAttempt = yield nextState;
  return yield* solveNextStep(problem, newAttempt, nextState);
}

export default function* solveProblem(
  problem: Problem
): Generator<SolveState, void, ProblemAttempt> {
  const initialState = {
    actions: [],
    nextLine: {
      type: "column" as const,
      index: 0,
    },
  };
  const attempt = yield initialState;
  yield* solveNextStep(problem, attempt, initialState);
}
