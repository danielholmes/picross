import { Duration, DurationObject } from "luxon";
import { Matrix } from "./utils/matrix";

export type AttemptCellStatus = boolean | undefined;

export interface ProblemAttempt {
  readonly timeRemaining: Duration;
  readonly incorrectMarks: number;
  readonly marks: Matrix<AttemptCellStatus>;
}

export interface Problem {
  readonly image: Matrix<boolean>;
  readonly xHints: Matrix<number>;
  readonly yHints: Matrix<number>;
}

export function isComplete(
  problem: Problem,
  attemptMarks: ProblemAttempt["marks"]
): boolean {
  return attemptMarks.every((attemptCol, x) =>
    attemptCol.every((cell, y) => problem.image[x][y] === !!cell)
  );
}

function getIncorrectMarkPenaltyDurationObject(
  previousIncorrectMarks: number
): DurationObject {
  if (previousIncorrectMarks === 0) {
    return { minutes: 2 };
  }
  if (previousIncorrectMarks === 1) {
    return { minutes: 4 };
  }
  return { minutes: 8 };
}

export function getIncorrectMarkPenalty(
  previousIncorrectMarks: number
): Duration {
  const { minutes } = getIncorrectMarkPenaltyDurationObject(
    previousIncorrectMarks
  );
  if (minutes === undefined) {
    throw new Error("Unexpected duration format");
  }
  return Duration.fromMillis(minutes * 60 * 1000);
}

export function incorrectMark(attempt: ProblemAttempt): ProblemAttempt {
  const newRemaining = attempt.timeRemaining.minus(
    getIncorrectMarkPenaltyDurationObject(attempt.incorrectMarks)
  );
  return {
    ...attempt,
    timeRemaining:
      newRemaining.as("seconds") < 0 ? Duration.fromMillis(0) : newRemaining,
    incorrectMarks: attempt.incorrectMarks + 1,
  };
}
