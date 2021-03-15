import { h, JSX } from "preact";
import { Problem } from "../../model";
import Grid from "../grid/Grid";
import { useCallback } from "preact/hooks";
import AttemptCell from "../attempt/AttemptCell";
import noop from "lodash/noop";

interface SolutionProps {
  readonly problem: Problem;
}

export default function Solution({ problem }: SolutionProps): JSX.Element {
  const renderCell = useCallback(
    (x: number, y: number) => {
      return <AttemptCell onChange={noop} status={problem[x][y]} />;
    },
    [problem]
  );

  return (
    <Grid
      width={problem.length}
      height={problem[0].length}
      renderCell={renderCell}
    />
  );
}
