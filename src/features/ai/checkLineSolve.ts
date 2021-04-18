import { ProblemAttempt, ProblemAttemptAction } from "features/attempt";
import { AttemptCellStatus, Problem } from "model";
import {
  getMatrixColumnIndices,
  getMatrixRow,
  getMatrixRowIndices,
  MatrixPosition,
} from "utils/matrix";
import uniqBy from "lodash/uniqBy";
import { createAllLinePermutations } from "./solveUtils";

interface CheckLine {
  readonly type: "column" | "row";
  readonly index: number;
}

export interface CheckLineSolveState {
  readonly type: "checkLine";
  readonly dirtyLines: ReadonlyArray<CheckLine>;
}

function isAttemptLineFilled(line: ReadonlyArray<AttemptCellStatus>): boolean {
  return line.every((v) => v !== undefined);
}

function solveLine(
  line: ReadonlyArray<AttemptCellStatus>,
  hints: ReadonlyArray<number>,
  getCoordinate: (i: number) => MatrixPosition
): ReadonlyArray<ProblemAttemptAction> {
  // Already solved
  if (isAttemptLineFilled(line)) {
    return [];
  }

  const allPermutations = createAllLinePermutations(hints, line);
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

function getActionsForCheckLine(
  problem: Problem,
  attempt: ProblemAttempt,
  check: CheckLine
): ReadonlyArray<ProblemAttemptAction> {
  if (check.type === "column") {
    const line = attempt.marks[check.index];
    return solveLine(line, problem.columnHints[check.index], (i) => ({
      x: check.index,
      y: i,
    }));
  }

  const line = getMatrixRow(attempt.marks, check.index);
  return solveLine(line, problem.rowHints[check.index], (i) => ({
    x: i,
    y: check.index,
  }));
}

interface CheckLineSolveResult {
  readonly actions: ReadonlyArray<ProblemAttemptAction>;
  readonly solveState: CheckLineSolveState;
}

export function startCheckLineSolving(problem: Problem): CheckLineSolveState {
  return {
    type: "checkLine",
    dirtyLines: [
      ...getMatrixColumnIndices(problem.image).map((index) => ({
        type: "column" as const,
        index,
      })),
      ...getMatrixRowIndices(problem.image).map((index) => ({
        type: "row" as const,
        index,
      })),
    ],
  };
}

export function solveCheckLineNextStep(
  problem: Problem,
  attempt: ProblemAttempt,
  current: CheckLineSolveState
): CheckLineSolveResult | undefined {
  const [check, ...remainingDirtyLines] = current.dirtyLines;
  const actions = getActionsForCheckLine(problem, attempt, check);

  const possibleDirtyLines = [
    ...remainingDirtyLines,
    ...actions.reduce((previous, action) => {
      const newCheckDirty = [
        { type: "column" as const, index: action.coordinate.x },
        { type: "row" as const, index: action.coordinate.y },
      ];
      return [
        ...previous,
        ...newCheckDirty.filter(
          (n) => n.type !== check.type || n.index !== check.index
        ),
      ];
    }, [] as ReadonlyArray<CheckLine>),
  ];
  const uniqueDirty = uniqBy(possibleDirtyLines, (c) => `${c.type} ${c.index}`);
  // TODO: Remove any dirty that are filled
  // TODO: sort
  // const solveState = getNewNonFilledNextLine(attempt, current);

  if (uniqueDirty.length === 0) {
    return undefined;
  }
  return {
    solveState: {
      type: "checkLine",
      dirtyLines: uniqueDirty,
    },
    actions,
  };
}
