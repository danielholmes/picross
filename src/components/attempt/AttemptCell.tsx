import { h } from "preact";
import { AttemptCellStatus } from "../../model";
import classNames from "classnames";
import { memo } from "preact/compat";

interface AttemptCellProps {
  readonly status: AttemptCellStatus;
  readonly onChange: (status: AttemptCellStatus) => void;
}

function getNewStatus(
  status: AttemptCellStatus,
  e: MouseEvent
): AttemptCellStatus {
  if (e.metaKey) {
    if (status === false) {
      return undefined;
    }
    return false;
  }

  if (status === true) {
    return undefined;
  }

  return true;
}

function AttemptCell({ status, onChange }: AttemptCellProps): h.JSX.Element {
  const onMouseClick = (e: MouseEvent): void => {
    const newStatus = getNewStatus(status, e);
    if (newStatus !== status) {
      onChange(newStatus);
    }
  };

  // TODO: Work on interaction:
  // - interaction type depends on mouse down
  //    - selecting unselected means select tool
  //    - selecting selected means unselect tool
  //    - equivalents for mark cross

  // const onMouseEnter = (e: MouseEvent): void => {
  //   if (e.buttons === 1) {
  //     const newStatus = getNewStatus(status, e);
  //     if (newStatus !== status) {
  //       onChange(newStatus);
  //     }
  //   }
  // }

  return (
    <button
      type="button"
      className={classNames("attempt-cell", { "attempt-selected": status })}
      onClick={onMouseClick}
    >
      {status === false && "✗"}
    </button>
  );
}

export default memo(AttemptCell);
