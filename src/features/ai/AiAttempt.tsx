import { h, JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import { Problem, ProblemAttempt } from "../../model";
import Solution from "../../components/solution";
import Grid from "../../components/grid";
import solveProblem, { SolveState } from "./solveProblem";
import AiAttemptCell from "./AiAttemptCell";

interface AiAttemptProps {
  readonly problem: Problem;
}

interface AiState {
  readonly state: SolveState;
  readonly generator: Generator<SolveState, ProblemAttempt>;
}

export default function AiAttempt({ problem }: AiAttemptProps): JSX.Element {
  // Attempt
  const [aiState, setAiState] = useState<AiState>(() => {
    const generator = solveProblem(problem);
    const first = generator.next();
    // Note: Can probably change later to show complete state
    if (first.done) {
      throw new Error("Already done");
    }
    return {
      state: first.value,
      generator,
    };
  });
  const {
    state: { attempt, nextLine },
  } = aiState;
  console.log("nextLine", nextLine);
  const { marks } = attempt;
  // TODO: Can probably cancel generator
  // useEffect(() => {
  //   // Unfortunately this results in running twice (the state initialiser).
  //   // Maybe can skip on first run?
  //   setAttempt(createNewAttempt(problem));
  // }, [problem]);

  // AI management
  const onNextClick = () => {
    console.log("onNextClick", aiState);
    setAiState(({ generator }) => {
      const first = generator.next();
      // Note: Can probably change later to show complete state
      if (first.done) {
        throw new Error("Already done");
      }
      return {
        state: first.value,
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
          (nextLine.type === "column" && x === nextLine.index) ||
          (nextLine.type === "row" && y === nextLine.index)
        }
      />
    ),
    [marks, nextLine]
  );

  return (
    <div>
      <h4>Attempt</h4>
      <Grid problem={problem} renderCell={renderCell} showHints />
      <button type="button" onClick={onNextClick}>
        Next
      </button>
      <h4>Solution</h4>
      <Solution problem={problem} />
    </div>
  );
}
