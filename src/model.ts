import { Duration, DurationObject } from "luxon";
import range from "lodash/range";
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

function getHints(imageLine: ReadonlyArray<boolean>): ReadonlyArray<number> {
  return imageLine.reduce((accu, pixel, i) => {
    if (!pixel) {
      return accu;
    }
    if (i === 0) {
      return [1];
    }
    const previousPixel = imageLine[i - 1];
    if (previousPixel) {
      return [...accu.slice(0, -1), accu[accu.length - 1] + 1];
    }
    return [...accu, 1];
  }, [] as ReadonlyArray<number>);
}

export function createProblemFromImage(image: Matrix<boolean>): Problem {
  const xIndices = range(0, image.length);
  return {
    image,
    xHints: xIndices.map((x) => getHints(image[x])),
    yHints: range(0, image[0].length).map((y) =>
      getHints(xIndices.map((x) => image[x][y]))
    ),
  };
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
