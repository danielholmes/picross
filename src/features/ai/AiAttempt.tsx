/* eslint-disable react/no-array-index-key */
import { h, JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import noop from "lodash/noop";
import { isComplete, Problem } from "model";
import Grid from "components/grid";
import {
  applyAttemptAction,
  createNewAttempt,
  ProblemAttempt,
} from "features/attempt";
import MarkedCell from "./MarkedCell";
import EmptyCell from "./EmptyCell";
import {
  AttemptProbabilities,
  getActionForProbabilities,
  getProbabilities,
} from "./solveProblem";

interface AiAttemptProps {
  readonly problem: Problem;
}

interface AiState {
  readonly attempt: ProblemAttempt;
  readonly solveState?: AttemptProbabilities;
}

const minimumSpeed = 0;
const maximumSpeed = 20;

export default function AiAttempt({ problem }: AiAttemptProps): JSX.Element {
  // Attempt
  const [{ attempt, solveState }, setAiState] = useState<AiState>(
    (): AiState => {
      const initAttempt = createNewAttempt(problem);

      if (isComplete(problem, initAttempt.marks)) {
        return { attempt: initAttempt };
      }

      const firstStep = getProbabilities(problem, initAttempt);
      return {
        attempt: initAttempt,
        solveState: firstStep,
      };
    }
  );
  const { marks } = attempt;
  const isAttemptComplete = isComplete(problem, marks);
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
      ({ attempt: previousAttempt, solveState: previousSolveState }) => {
        if (!previousSolveState) {
          throw new Error("Invalid state - no step");
        }

        const action = getActionForProbabilities(
          previousAttempt,
          previousSolveState
        );
        const newAttempt = applyAttemptAction(problem, previousAttempt, action);

        const nextSolveState = getProbabilities(problem, newAttempt);

        return {
          attempt: newAttempt,
          solveState: nextSolveState,
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
    (x: number, y: number) => {
      const probability = (() => {
        if (solveState) {
          return solveState[x][y];
        }
        return undefined;
      })();

      const cellStatus = marks[x][y];
      if (typeof cellStatus === "boolean") {
        return <MarkedCell marked={cellStatus} />;
      }

      return <EmptyCell probability={probability} />;
    },
    [marks, solveState]
  );

  return (
    <div>
      <h4>Attempt</h4>
      <div>
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
    </div>
  );
}
