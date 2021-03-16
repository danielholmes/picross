import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";
import { AttemptCellStatus } from "../../model";

type AttemptCellProps = {
  readonly className?: string;
  readonly status: AttemptCellStatus;
  readonly onMouseDown?: (e: MouseEvent) => void;
  readonly onMouseEnter?: (e: MouseEvent) => void;
  readonly disabled?: boolean;
};

function AttemptCell({
  className,
  status,
  onMouseEnter,
  onMouseDown,
  disabled,
}: AttemptCellProps): JSX.Element {
  return (
    <button
      type="button"
      className={classNames(
        "attempt-cell",
        { "attempt-selected": status },
        className
      )}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
    >
      {status === false && "✗"}
    </button>
  );
}

export default memo(AttemptCell);
