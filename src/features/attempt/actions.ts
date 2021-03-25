import { Duration } from "luxon";
import { Matrix, matrixSet } from "../../utils/matrix";
import { AttemptCellStatus, Problem, ProblemCoordinate } from "../../model";

interface MarkAttemptAction {
  readonly type: "mark";
  readonly coordinate: ProblemCoordinate;
}
interface UnmarkAttemptAction {
  readonly type: "unmark";
  readonly coordinate: ProblemCoordinate;
}

export type ProblemAttemptAction = MarkAttemptAction | UnmarkAttemptAction;

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
  { coordinate: { x, y } }: MarkAttemptAction
): ProblemAttempt {
  const cellNeedsMark = problem.image[x][y];
  if (!cellNeedsMark) {
    return incorrectMark(attempt, { x, y });
  }

  return {
    ...attempt,
    marks: matrixSet(attempt.marks, x, y, true),
  };
}

function applyUnmarkAction(
  attempt: ProblemAttempt,
  action: UnmarkAttemptAction
): ProblemAttempt {
  return {
    ...attempt,
    marks: matrixSet(
      attempt.marks,
      action.coordinate.x,
      action.coordinate.y,
      false
    ),
  };
}

export function applyAttemptAction(
  problem: Problem,
  attempt: ProblemAttempt,
  action: ProblemAttemptAction
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

export function applyAttemptActions(
  problem: Problem,
  previousAttempt: ProblemAttempt,
  actions: ReadonlyArray<ProblemAttemptAction>
): ProblemAttempt {
  return actions.reduce(
    (attempt, action) => applyAttemptAction(problem, attempt, action),
    previousAttempt
  );
}

export function progressTime(
  attempt: ProblemAttempt,
  duration: Duration
): ProblemAttempt {
  return {
    ...attempt,
    timeRemaining: attempt.timeRemaining.minus(duration),
  };
}
