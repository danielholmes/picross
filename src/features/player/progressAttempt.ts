import { PlayerProblemAttempt } from "./model";
import { AttemptCellStatus } from "../../model";

export default function progressAttempt(
  attempt: PlayerProblemAttempt,
  updateX: number,
  updateY: number,
  status: AttemptCellStatus
): PlayerProblemAttempt {
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
