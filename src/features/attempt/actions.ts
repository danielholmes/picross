import { Duration } from "luxon";
import { Matrix, matrixSet } from "../../utils/matrix";
import {AttemptCellStatus, Problem, ProblemCoordinate} from "../../model";

interface MarkSolveAction {
  readonly type: "mark";
  readonly coordinate: ProblemCoordinate;
}
interface UnmarkSolveAction {
  readonly type: "unmark";
  readonly coordinate: ProblemCoordinate;
}

export type SolveAction = MarkSolveAction | UnmarkSolveAction;

interface IncorrectMark {
  readonly position: ProblemCoordinate;
  readonly penalty: Duration;
}

export interface ProblemAttempt {
  readonly timeRemaining: Duration;
  readonly incorrectMarks: ReadonlyArray<IncorrectMark>;
  readonly marks: Matrix<AttemptCellStatus>;
}

function getIncorrectMarkPenalty(previousIncorrectMarks: number): Duration {
  if (previousIncorrectMarks === 0) {
    return Duration.fromObject({ minutes: 2 });
  }
  if (previousIncorrectMarks === 1) {
    return Duration.fromObject({ minutes: 4 });
  }
  return Duration.fromObject({ minutes: 8 });
}

function incorrectMark(
  attempt: ProblemAttempt,
  position: ProblemCoordinate
): ProblemAttempt {
  const penalty = getIncorrectMarkPenalty(attempt.incorrectMarks.length);
  const newRemaining = attempt.timeRemaining.minus(penalty);
  const mark = { penalty, position };
  return {
    ...attempt,
    timeRemaining:
      newRemaining.as("seconds") < 0 ? Duration.fromMillis(0) : newRemaining,
    incorrectMarks: [...attempt.incorrectMarks, mark],
  };
}

function applyMarkAction(
  problem: Problem,
  attempt: ProblemAttempt,
  { coordinate: { x, y } }: MarkSolveAction
): ProblemAttempt {
  const cellNeedsMark = problem.image[x][y];
  if (!cellNeedsMark) {
    return incorrectMark(attempt, { x, y });
  }

  return {
    ...attempt,
    marks: matrixSet(
      attempt.marks,
      x,
      y,
      true
    ),
  }
}

function applyUnmarkAction(attempt: ProblemAttempt, action: UnmarkSolveAction): ProblemAttempt {
  return {
    ...attempt,
    marks: matrixSet(
      attempt.marks,
      action.coordinate.x,
      action.coordinate.y,
      false
    ),
  }
}

export function applySolveAction(
  problem: Problem,
  attempt: ProblemAttempt,
  action: SolveAction
): ProblemAttempt {
  switch (action.type) {
    case "mark":
      return applyMarkAction(problem, attempt, action);
    case "unmark":
      return applyUnmarkAction(attempt, action);
    default:
      throw new Error("Unexpected action type");
  }
}

export function applySolveActions(
  problem: Problem,
  previousAttempt: ProblemAttempt,
  actions: ReadonlyArray<SolveAction>
): ProblemAttempt {
  return actions.reduce((attempt, action) => applySolveAction(problem, attempt, action), previousAttempt);
}

export function progressTime(attempt: ProblemAttempt, duration: Duration): ProblemAttempt {
  return {
    ...attempt,
    timeRemaining: attempt.timeRemaining.minus(duration),
  }
}
