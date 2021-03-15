import { Problem, ProblemAttempt } from "../../model";
import { Duration } from "luxon";

export default function createNewAttempt(problem: Problem): ProblemAttempt {
  return {
    incorrectMarks: 0,
    timeRemaining: Duration.fromMillis(30 * 60 * 1000),
    marks: problem.image.map((row) => row.map(() => undefined)),
  };
}
