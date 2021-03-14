import { AttemptCellStatus, ProblemAttempt } from "../../model";

export default function progressAttempt(
  attempt: ProblemAttempt,
  updateX: number,
  updateY: number,
  status: AttemptCellStatus
): ProblemAttempt {
  if (
    updateX < 0 ||
    updateX >= attempt.length ||
    updateY < 0 ||
    updateY >= attempt[0].length
  ) {
    throw new Error("Invalid coordinates");
  }
  return attempt.map((col, x) =>
    col.map((s, y) => {
      if (x === updateX && y === updateY) {
        return status;
      }
      return s;
    })
  );
}
