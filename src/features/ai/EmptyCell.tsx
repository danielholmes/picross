import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";
import { formatPercent } from "utils/number";

type EmptyCellProps = {
  readonly probability?: number;
  // readonly highlighted: boolean;
};

function EmptyCell({ probability }: EmptyCellProps): JSX.Element {
  const backgroundColor = (() => {
    if (probability === undefined) {
      return undefined;
    }
    if (probability === 0) {
      return "#aa3333";
    }
    return `rgba(120, 245, 57, ${probability ** 3})`;
  })();
  return (
    <div
      className={classNames("problem-cell", {
        // "problem-highlighted": highlighted,
      })}
      style={{ backgroundColor }}
    >
      {probability !== undefined && formatPercent(probability)}
    </div>
  );
}

export default memo(EmptyCell);
