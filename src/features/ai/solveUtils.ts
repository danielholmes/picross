import { AttemptCellStatus } from "model";
import { filledArray } from "utils/array";
import sum from "lodash/sum";
import range from "lodash/range";
import flatMap from "lodash/flatMap";

function doesLineMatchCurrent(
  line: ReadonlyArray<AttemptCellStatus>,
  current: ReadonlyArray<AttemptCellStatus>
): boolean {
  return line.every((pC, i) => current[i] === undefined || current[i] === pC);
}

// eslint-disable-next-line import/prefer-default-export
export function createAllLinePermutations(
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
    > = createAllLinePermutations(otherHints, current.slice(p.length + 1));
    return otherPermutations.map((oP) => [...p, false, ...oP]);
  });
}
