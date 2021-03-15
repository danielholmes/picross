import { h, JSX } from "preact";
import { Problem } from "../../model";
import Grid from "../grid/Grid";
import { useCallback } from "preact/hooks";
import AttemptCell from "../attempt/AttemptCell";

interface SolutionProps {
  readonly problem: Problem;
}

export default function Solution({ problem }: SolutionProps): JSX.Element {
  const renderCell = useCallback(
    (x: number, y: number) => {
      return <AttemptCell status={problem.image[x][y]} />;
    },
    [problem]
  );

  return <Grid problem={problem} renderCell={renderCell} />;
}
