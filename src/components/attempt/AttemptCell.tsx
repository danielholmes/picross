import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";
import { Duration } from "luxon";
import { AttemptCellStatus } from "../../model";

type AttemptCellProps = {
  readonly className?: string;
  readonly status: AttemptCellStatus;
  readonly onMouseDown?: (e: MouseEvent) => void;
  readonly onMouseEnter?: (e: MouseEvent) => void;
  readonly disabled?: boolean;
  readonly penalty?: Duration;
};

function AttemptCell({
  className,
  status,
  onMouseEnter,
  onMouseDown,
  disabled,
  penalty,
}: AttemptCellProps): JSX.Element {
  return (
    <button
      type="button"
      className={classNames(
        "problem-cell",
        { "problem-selected": status },
        className
      )}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
    >
      {!penalty && status === false && "✗"}
      {penalty && `-${penalty.as("minutes")}`}
    </button>
  );
}

export default memo(AttemptCell);
