import { Duration } from "luxon";
import { Matrix } from "../../utils/matrix";
import { AttemptCellStatus, ProblemCoordinate } from "../../model";

interface IncorrectMark {
  readonly position: ProblemCoordinate;
  readonly penalty: Duration;
}

export interface PlayerProblemAttempt {
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

export function incorrectMark(
  attempt: PlayerProblemAttempt,
  position: ProblemCoordinate
): PlayerProblemAttempt {
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
