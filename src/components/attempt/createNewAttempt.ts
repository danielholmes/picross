import { Problem, ProblemAttempt } from "../../model";

export default function createNewAttempt(problem: Problem): ProblemAttempt {
  return problem.image.map((row) => row.map(() => undefined));
}
