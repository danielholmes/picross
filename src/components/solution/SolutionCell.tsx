import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";

type SolutionCellProps = {
  readonly status?: true;
};

function SolutionCell({ status }: SolutionCellProps): JSX.Element {
  return (
    <div
      className={classNames("problem-cell", { "problem-selected": status })}
    />
  );
}

export default memo(SolutionCell);
