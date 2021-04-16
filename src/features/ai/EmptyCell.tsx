import { h, JSX } from "preact";
import classNames from "classnames";
import { memo } from "preact/compat";
import { formatPercent } from "utils/number";

type EmptyCellProps = {
  readonly probability?: number;
  readonly highlighted: boolean;
};

function EmptyCell({ probability, highlighted }: EmptyCellProps): JSX.Element {
  return (
    <div
      className={classNames("problem-cell", {
        "problem-highlighted": highlighted,
      })}
      style={{
        backgroundColor: probability
          ? `rgba(255, 0, 0, ${probability ** 2})`
          : undefined,
      }}
    >
      {probability && formatPercent(probability)}
    </div>
  );
}

export default memo(EmptyCell);
