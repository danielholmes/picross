import { AttemptCellStatus, ProblemAttempt } from "../../model";

export default function progressAttempt(
  attempt: ProblemAttempt,
  updateX: number,
  updateY: number,
  status: AttemptCellStatus
): ProblemAttempt {
  if (
    updateX < 0 ||
    updateX >= attempt.marks.length ||
    updateY < 0 ||
    updateY >= attempt.marks[0].length
  ) {
    throw new Error("Invalid coordinates");
  }
  return {
    ...attempt,
    marks: attempt.marks.map((col, x) =>
      col.map((s, y) => {
        if (x === updateX && y === updateY) {
          return status;
        }
        return s;
      })
    ),
  };
}
