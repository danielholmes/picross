import { h, JSX } from "preact";
import { AttemptCellStatus, Problem, ProblemAttempt } from "../../model";
import AttemptCell from "./AttemptCell";
import { useCallback, useEffect, useState } from "preact/hooks";
import createNewAttempt from "./createNewAttempt";
import progressAttempt from "./progressAttempt";
import Grid from "../grid";

interface AttemptProblemProps {
  readonly problem: Problem;
  readonly onSuccess: () => void;
}

export default function AttemptProblem({
  problem,
}: AttemptProblemProps): JSX.Element {
  const [attempt, setAttempt] = useState<ProblemAttempt>(() =>
    createNewAttempt(problem)
  );
  useEffect(() => {
    setAttempt(createNewAttempt(problem));
  }, [problem]);

  const onCellChange = useCallback(
    (x: number, y: number, status: AttemptCellStatus): void => {
      setAttempt(progressAttempt(attempt, x, y, status));
    },
    [attempt]
  );

  const renderCell = useCallback(
    (x: number, y: number) => {
      return (
        <AttemptCell
          key={y}
          status={attempt[x][y]}
          onChange={(status): void => onCellChange(x, y, status)}
        />
      );
    },
    [attempt, onCellChange]
  );

  return (
    <div>
      <Grid
        width={problem.length}
        height={problem[0].length}
        renderCell={renderCell}
      />
      <em>Hold alt/command key and click to mark with a cross</em>
    </div>
  );
}
