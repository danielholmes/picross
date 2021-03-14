import { h } from "preact";
import { AttemptCellStatus } from "../../model";
import classNames from "classnames";
import { memo } from "preact/compat";

interface AttemptCellProps {
  readonly status: AttemptCellStatus;
  readonly onChange: (status: AttemptCellStatus) => void;
}

function AttemptCell({ status, onChange }: AttemptCellProps): h.JSX.Element {
  const onClick = (e: MouseEvent): void => {
    if (e.metaKey) {
      if (status === false) {
        onChange(undefined);
        return;
      }
      onChange(false);
      return;
    }

    if (status === true) {
      onChange(undefined);
      return;
    }
    onChange(true);
  };
  return (
    <button
      type="button"
      className={classNames("attempt-cell", { "attempt-selected": status })}
      onClick={onClick}
    >
      {status === false && "✗"}
    </button>
  );
}

export default memo(AttemptCell);
