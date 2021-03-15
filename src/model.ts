import { Duration, DurationObject } from "luxon";

export type AttemptCellStatus = boolean | undefined;

export interface ProblemAttempt {
  readonly timeRemaining: Duration;
  readonly incorrectMarks: number;
  readonly marks: ReadonlyArray<ReadonlyArray<AttemptCellStatus>>;
}

export interface Problem {
  readonly image: ReadonlyArray<ReadonlyArray<boolean>>;
  readonly xHints: ReadonlyArray<ReadonlyArray<number>>;
  readonly yHints: ReadonlyArray<ReadonlyArray<number>>;
}

export function isComplete(
  problem: Problem,
  attemptMarks: ProblemAttempt["marks"]
): boolean {
  return attemptMarks.every((attemptCol, x) =>
    attemptCol.every((cell, y) => problem.image[x][y] === !!cell)
  );
}

function getIncorrectMarkPenalty(
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

export function incorrectMark(attempt: ProblemAttempt): ProblemAttempt {
  const newRemaining = attempt.timeRemaining.minus(
    getIncorrectMarkPenalty(attempt.incorrectMarks)
  );
  return {
    ...attempt,
    timeRemaining:
      newRemaining.as("seconds") < 0 ? Duration.fromMillis(0) : newRemaining,
    incorrectMarks: attempt.incorrectMarks + 1,
  };
}
