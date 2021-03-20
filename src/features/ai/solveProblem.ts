import { Problem } from "../../model";
import { AiProblemAttempt } from "./model";
import { createMatrix } from "../../utils/matrix";

type NextSolveLine = {
  readonly type: "column" | "row";
  readonly index: number;
};

export interface SolveState {
  readonly attempt: AiProblemAttempt;
  readonly nextLine: NextSolveLine;
}

function getNewNextLine(
  attempt: AiProblemAttempt,
  { type, index }: NextSolveLine
): NextSolveLine {
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

function* solveNextStep({
  attempt,
  nextLine,
}: SolveState): Generator<SolveState, AiProblemAttempt> {
  // TODO: Select cells and alter attempt
  const newAttempt = attempt;
  const newNextLine = getNewNextLine(attempt, nextLine);
  const nextState = { attempt: newAttempt, nextLine: newNextLine };
  yield nextState;
  return yield* solveNextStep(nextState);
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
  return yield* solveNextStep(initialState);
}
