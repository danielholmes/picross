import { h, JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import noop from "lodash/noop";
import { isComplete, Problem } from "../../model";
import Grid from "../../components/grid";
import solveProblem, { applySolveActions, SolveState } from "./solveProblem";
import AiAttemptCell from "./AiAttemptCell";
import { AiProblemAttempt } from "./model";
import { createMatrix } from "../../utils/matrix";

interface AiAttemptProps {
  readonly problem: Problem;
}

interface AiState {
  readonly attempt: AiProblemAttempt;
  readonly step?: SolveState;
  readonly generator: Generator<SolveState, void, AiProblemAttempt>;
}

const minimumSpeed = 0;
const maximumSpeed = 20;

export default function AiAttempt({ problem }: AiAttemptProps): JSX.Element {
  // Attempt
  const [{ attempt, step }, setAiState] = useState<AiState>(
    (): AiState => {
      const initAttempt = {
        marks: createMatrix(
          problem.image.length,
          problem.image[0].length,
          undefined
        ),
      };
      const newGenerator = solveProblem(problem);
      const first = newGenerator.next(initAttempt);

      if (first.done) {
        // TODO: Don't need generator if complete
        return { attempt: initAttempt, generator: newGenerator };
      }

      const { actions } = first.value;
      const newAttempt = applySolveActions(initAttempt, actions);
      return {
        attempt: newAttempt,
        step: first.value,
        generator: newGenerator,
      };
    }
  );
  const isAttemptComplete = isComplete(problem, attempt.marks);
  const { marks } = attempt;
  const nextLine = step?.nextLine;
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
    setAiState(({ attempt: previousAttempt, generator }) => {
      const nextResult = generator.next(previousAttempt);
      if (nextResult.done) {
        // TODO: Don't need generator if complete
        return { attempt: previousAttempt, generator };
      }

      return {
        attempt: applySolveActions(previousAttempt, nextResult.value.actions),
        step: nextResult.value,
        generator,
      };
    });
  }, []);
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
          (nextLine?.type === "column" && x === nextLine.index) ||
          (nextLine?.type === "row" && y === nextLine.index)
        }
      />
    ),
    [marks, nextLine]
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
