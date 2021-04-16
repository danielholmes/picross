import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";
import { ProblemCellStatus } from "model";

type MarkedCellProps = {
  readonly highlighted: boolean;
  readonly marked: ProblemCellStatus;
};

function MarkedCell({ marked, highlighted }: MarkedCellProps): JSX.Element {
  return (
    <div
      className={classNames("problem-cell", {
        "problem-selected": marked,
        "problem-highlighted": highlighted,
      })}
    >
      {!marked && "✗"}
    </div>
  );
}

export default memo(MarkedCell);
