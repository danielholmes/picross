import { Duration } from "luxon";
import { Problem, ProblemAttempt } from "../../model";
import { createMatrix } from "../../utils/matrix";

export default function createNewAttempt(problem: Problem): ProblemAttempt {
  return {
    incorrectMarks: 0,
    timeRemaining: Duration.fromMillis(30 * 60 * 1000),
    marks: createMatrix(
      problem.image.length,
      problem.image[0].length,
      undefined
    ),
  };
}
