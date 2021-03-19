import { h, JSX } from "preact";
import { useCallback } from "preact/hooks";
import { Problem } from "../../model";
import Grid from "../grid/Grid";
import AttemptCell from "../attempt/AttemptCell";

interface SolutionProps {
  readonly problem: Problem;
}

export default function Solution({ problem }: SolutionProps): JSX.Element {
  const renderCell = useCallback(
    (x: number, y: number) => (
      <AttemptCell status={problem.image[x][y] || undefined} disabled />
    ),
    [problem]
  );

  return <Grid problem={problem} renderCell={renderCell} />;
}
