import { h, JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import { Problem } from "../../model";
import Grid from "../../components/grid";
import solveProblem, { SolveState } from "./solveProblem";
import AiAttemptCell from "./AiAttemptCell";
import { AiProblemAttempt } from "./model";

interface AiAttemptProps {
  readonly problem: Problem;
}

interface AiState {
  readonly state: AiProblemAttempt | SolveState;
  readonly generator: Generator<SolveState, AiProblemAttempt>;
}

export default function AiAttempt({ problem }: AiAttemptProps): JSX.Element {
  // Attempt
  const [{ state }, setAiState] = useState<AiState>(
    (): AiState => {
      const newGenerator = solveProblem(problem);
      const first = newGenerator.next();

      if (first.done) {
        // TODO: Don't need generator if complete
        return { state: first.value, generator: newGenerator };
      }
      return {
        state: first.value,
        generator: newGenerator,
      };
    }
  );
  const marks = "marks" in state ? state.marks : state.attempt.marks;
  const nextLine = "marks" in state ? undefined : state.nextLine;
  // TODO: Can probably cancel generator
  // useEffect(() => {
  //   // Unfortunately this results in running twice (the state initialiser).
  //   // Maybe can skip on first run?
  //   setAttempt(createNewAttempt(problem));
  // }, [problem]);

  // AI management
  const onNextClick = () => {
    setAiState(({ generator }) => {
      const step = generator.next();

      if (step.done) {
        // TODO: Don't need generator if complete
        return { state: step.value, generator };
      }

      return {
        state: step.value,
        generator,
      };
    });
  };

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
      {!nextLine && <div>Complete</div>}
      {nextLine && (
        <button type="button" onClick={onNextClick}>
          Next
        </button>
      )}
    </div>
  );
}
