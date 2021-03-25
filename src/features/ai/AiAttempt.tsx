import { h, JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import noop from "lodash/noop";
import { isComplete, Problem } from "model";
import Grid from "components/grid";
import {
  applyAttemptActions,
  createNewAttempt,
  ProblemAttempt,
} from "features/attempt";
import {
  NextSolveStep,
  solveNextStep,
  startSolvingProblem,
} from "./solveProblem";
import AiAttemptCell from "./AiAttemptCell";

interface AiAttemptProps {
  readonly problem: Problem;
}

interface AiState {
  readonly attempt: ProblemAttempt;
  readonly solveStep?: NextSolveStep;
}

const minimumSpeed = 0;
const maximumSpeed = 20;

export default function AiAttempt({ problem }: AiAttemptProps): JSX.Element {
  // Attempt
  const [{ attempt, solveStep }, setAiState] = useState<AiState>(
    (): AiState => {
      const initAttempt = createNewAttempt(problem);

      if (isComplete(problem, initAttempt.marks)) {
        return { attempt: initAttempt };
      }

      const firstStep = startSolvingProblem();
      return {
        attempt: initAttempt,
        solveStep: firstStep,
      };
    }
  );
  const { marks } = attempt;
  const isAttemptComplete = isComplete(problem, marks);
  // TODO: Can probably cancel generator
  // useEffect(() => {
  //   // Unfortunately this results in running twice (the state initialiser).
  //   // Maybe can skip on first run?
  //   setAttempt(createNewAttempt(problem));
  // }, [problem]);

  // AI management
  const [speed, setSpeed] = useState(0);
  const onIncreaseSpeed = () => {
    setSpeed((previous) => Math.min(maximumSpeed, previous + 1));
  };
  const onDecreaseSpeed = () => {
    setSpeed((previous) => Math.max(minimumSpeed, previous - 1));
  };
  const onStopAutoProgress = () => {
    setSpeed(0);
  };
  const progressSolution = useCallback(() => {
    setAiState(
      ({ attempt: previousAttempt, solveStep: previousSolveState }) => {
        if (!previousSolveState) {
          throw new Error("Invalid state - no step");
        }

        const nextResult = solveNextStep(
          problem,
          previousAttempt,
          previousSolveState
        );
        if (!nextResult.nextLine) {
          return { attempt: previousAttempt, solveStep: undefined };
        }

        return {
          attempt: applyAttemptActions(
            problem,
            previousAttempt,
            nextResult.actions
          ),
          solveStep: nextResult.nextLine,
        };
      }
    );
  }, [problem]);
  useEffect(() => {
    if (speed === 0 || isAttemptComplete) {
      return noop;
    }
    const intervalId = setInterval(progressSolution, 2000 / speed);
    return (): void => {
      clearInterval(intervalId);
    };
  }, [speed, progressSolution, isAttemptComplete]);

  // Cell
  const renderCell = useCallback(
    (x: number, y: number) => (
      <AiAttemptCell
        status={marks[x][y]}
        highlighted={
          (!isAttemptComplete &&
            solveStep?.type === "column" &&
            x === solveStep.index) ||
          (solveStep?.type === "row" && y === solveStep.index)
        }
      />
    ),
    [marks, solveStep, isAttemptComplete]
  );

  return (
    <div>
      <h4>Attempt</h4>
      <Grid problem={problem} renderCell={renderCell} showHints />
      {isAttemptComplete && <div>Complete</div>}
      {!isAttemptComplete && (
        <div>
          <button
            type="button"
            onClick={onDecreaseSpeed}
            disabled={speed === minimumSpeed}
          >
            -
          </button>
          Speed: {speed}
          <button
            type="button"
            onClick={onIncreaseSpeed}
            disabled={speed === maximumSpeed}
          >
            +
          </button>
          {speed === 0 ? (
            <button type="button" onClick={progressSolution}>
              Next
            </button>
          ) : (
            <button type="button" onClick={onStopAutoProgress}>
              Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
}
