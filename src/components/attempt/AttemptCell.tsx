import { h, JSX } from "preact";
import { AttemptCellStatus } from "../../model";
import classNames from "classnames";
import { memo } from "preact/compat";

type AttemptCellProps = {
  readonly status: AttemptCellStatus;
  readonly onMouseDown?: (e: MouseEvent) => void;
  readonly onMouseEnter?: (e: MouseEvent) => void;
  readonly disabled?: boolean;
};

function AttemptCell({
  status,
  onMouseEnter,
  onMouseDown,
  disabled,
}: AttemptCellProps): JSX.Element {
  return (
    <button
      type="button"
      className={classNames("attempt-cell", { "attempt-selected": status })}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
    >
      {status === false && "✗"}
    </button>
  );
}

export default memo(AttemptCell);
