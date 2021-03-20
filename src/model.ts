import { Duration } from "luxon";
import range from "lodash/range";
import { Matrix } from "./utils/matrix";

export type ProblemCellStatus = true | undefined;
export type AttemptCellStatus = ProblemCellStatus | false;

export interface ProblemCoordinate {
  readonly x: number;
  readonly y: number;
}

interface IncorrectMark {
  readonly position: ProblemCoordinate;
  readonly penalty: Duration;
}

export interface ProblemAttempt {
  readonly timeRemaining: Duration;
  readonly incorrectMarks: ReadonlyArray<IncorrectMark>;
  readonly marks: Matrix<AttemptCellStatus>;
}

export interface Problem {
  readonly image: Matrix<ProblemCellStatus>;
  readonly name?: string;
  readonly xHints: Matrix<number>;
  readonly yHints: Matrix<number>;
}

function getHints(
  imageLine: ReadonlyArray<ProblemCellStatus>
): ReadonlyArray<number> {
  const presentHints = imageLine.reduce((accu, pixel, i) => {
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
  if (presentHints.length === 0) {
    return [0];
  }
  return presentHints;
}

export function createProblemFromImage(image: Matrix<boolean>): Problem {
  const xIndices = range(0, image.length);
  const transformedImage = image.map((col) => col.map((c) => c || undefined));
  return {
    image: transformedImage,
    xHints: xIndices.map((x) => getHints(transformedImage[x])),
    yHints: range(0, image[0].length).map((y) =>
      getHints(xIndices.map((x) => transformedImage[x][y]))
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
