import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { Problem } from "../../model";
import createNewAttempt from "../../components/attempt/createNewAttempt";
import Solution from "../../components/solution";
import Grid from "../../components/grid";
import AttemptCell from "../../components/attempt/AttemptCell";

interface AiAttemptProps {
  readonly problem: Problem;
}

export default function AiAttempt({ problem }: AiAttemptProps) {
  // Attempt
  const [attempt, setAttempt] = useState(() => createNewAttempt(problem));
  const { marks } = attempt;
  useEffect(() => {
    // Unfortunately this results in running twice (the state initialiser).
    // Maybe can skip on first run?
    setAttempt(createNewAttempt(problem));
  }, [problem]);

  // Cell
  const renderCell = useCallback(
    (x: number, y: number) => <AttemptCell status={marks[x][y]} disabled />,
    [marks]
  );

  return (
    <div>
      <h4>Attempt</h4>
      <Grid problem={problem} renderCell={renderCell} />
      <h4>Solution</h4>
      <Solution problem={problem} />
    </div>
  );
}
