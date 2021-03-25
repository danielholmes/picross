import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";
import { AttemptCellStatus } from "model";

type AiAttemptCellProps = {
  readonly highlighted: boolean;
  readonly status: AttemptCellStatus;
};

function AiAttemptCell({
  status,
  highlighted,
}: AiAttemptCellProps): JSX.Element {
  return (
    <div
      className={classNames("problem-cell", {
        "problem-selected": status,
        "problem-highlighted": highlighted,
      })}
    >
      {status === false && "✗"}
    </div>
  );
}

export default memo(AiAttemptCell);
