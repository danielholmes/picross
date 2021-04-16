/* eslint-disable react/no-array-index-key */
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
import { getMatrixRows, reduceMatrixCells } from "utils/matrix";
import { SolveState, solveNextStep, startSolvingProblem } from "./solveProblem";
import MarkedCell from "./MarkedCell";
import EmptyCell from "./EmptyCell";

interface AiAttemptProps {
  readonly problem: Problem;
}

interface AiState {
  readonly attempt: ProblemAttempt;
  readonly solveState?: SolveState;
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

      const firstStep = startSolvingProblem(problem, initAttempt);
      return {
        attempt: initAttempt,
        solveState: firstStep,
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
      ({ attempt: previousAttempt, solveState: previousSolveState }) => {
        if (!previousSolveState) {
          throw new Error("Invalid state - no step");
        }

        const nextResult = solveNextStep(
          problem,
          previousAttempt,
          previousSolveState
        );
        console.log("solveNextStep", nextResult);
        // if (!nextResult.solveState) {
        //   return { attempt: previousAttempt, solveState: undefined };
        // }

        return {
          attempt: applyAttemptActions(
            problem,
            previousAttempt,
            nextResult.actions
          ),
          solveState: nextResult.solveState,
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
      const highlighted = (() => {
        if (isAttemptComplete) {
          return false;
        }
        if (
          solveState?.type === "checkLine" &&
          ((solveState.dirtyLines[0].type === "column" &&
            x === solveState.dirtyLines[0].index) ||
            (solveState.dirtyLines[0].type === "row" &&
              y === solveState.dirtyLines[0].index))
        ) {
          return true;
        }
        return false;
      })();

      const probability = (() => {
        if (solveState?.type === "probability") {
          const amount = solveState.probabilities[x][y];
          if (amount === undefined) {
            return undefined;
          }

          const maxProbability = reduceMatrixCells(
            solveState.probabilities,
            (previous, cell) => {
              if (cell === undefined) {
                return previous;
              }
              if (previous === undefined) {
                return cell;
              }
              return Math.max(previous, cell);
            },
            undefined as number | undefined
          );
          if (maxProbability === undefined) {
            return undefined;
          }
          return {
            amount,
            ratio: amount / maxProbability,
          };
        }
        return undefined;
      })();

      const cellStatus = marks[x][y];
      if (typeof cellStatus === "boolean") {
        return <MarkedCell marked={cellStatus} highlighted={highlighted} />;
      }

      return <EmptyCell probability={probability} highlighted={highlighted} />;
    },
    [marks, solveState, isAttemptComplete]
  );

  return (
    <div>
      <h4>Attempt</h4>
      <div style={{ float: "left" }}>
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
      <div style={{ float: "right" }}>
        <h3>AI State</h3>
        <h5>Stage: {solveState?.type}</h5>
        {solveState?.type === "checkLine" && (
          <div>
            <h6>Dirty lines</h6>
            <ol>
              {solveState.dirtyLines.map((line) => (
                <li key={`${line.type}-${line.index}`}>
                  {line.type} {line.index}
                </li>
              ))}
            </ol>
          </div>
        )}
        {solveState?.type === "probability" && (
          <div>
            <h6>Probabilities</h6>
            <table>
              <tbody>
                {getMatrixRows(solveState.probabilities).map((row, y) => (
                  <tr key={y}>
                    {row.map((cell, x) => (
                      <td key={x} style={{ border: "1px solid black" }}>
                        {cell?.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ clear: "both" }} />
    </div>
  );
}
