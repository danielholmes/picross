import { Duration } from "luxon";
import { Problem } from "model";
import { createMatrix } from "utils/matrix";
import { ProblemAttempt } from "./actions";

export default function createNewAttempt(problem: Problem): ProblemAttempt {
  return {
    incorrectMarks: [],
    timeRemaining: Duration.fromMillis(30 * 60 * 1000),
    marks: createMatrix(
      problem.image.length,
      problem.image[0].length,
      undefined
    ),
  };
}
