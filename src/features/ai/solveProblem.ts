import { isComplete, Problem } from "model";
import { ProblemAttempt, ProblemAttemptAction } from "features/attempt";
import {
  CheckLineSolveState,
  solveCheckLineNextStep,
  startCheckLineSolving,
} from "./checkLineSolve";
import {
  ProbabilitySolveState,
  solveProbabilityNextStep,
  startProbabilitySolving,
} from "./probabilitySolve";

export type SolveState = CheckLineSolveState | ProbabilitySolveState;

interface SolveResult {
  readonly actions: ReadonlyArray<ProblemAttemptAction>;
  readonly solveState: SolveState;
}

export function startSolvingProblem(
  problem: Problem,
  attempt: ProblemAttempt
): SolveState {
  console.log("TODO: switch back to check");
  return startProbabilitySolving(problem, attempt);
  // return startCheckLineSolving(problem);
}

export function solveNextStep(
  problem: Problem,
  attempt: ProblemAttempt,
  current: SolveState
): SolveResult {
  if (isComplete(problem, attempt.marks)) {
    throw new Error("Already completed");
  }

  if (current.type === "checkLine") {
    const nextResult = solveCheckLineNextStep(problem, attempt, current);
    if (nextResult === undefined) {
      return {
        actions: [],
        solveState: startProbabilitySolving(problem, attempt),
      };
    }
    return nextResult;
  }

  const probabilityResult = solveProbabilityNextStep(problem, attempt, current);
  if (probabilityResult === undefined) {
    return {
      actions: [],
      solveState: startCheckLineSolving(problem),
    };
  }
  return probabilityResult;
}
