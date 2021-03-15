import { h, JSX } from "preact";
import { memo } from "preact/compat";
import range from "lodash/range";

interface GridProps {
  readonly width: number;
  readonly height: number;
  readonly renderCell: (x: number, y: number) => JSX.Element;
}

function Grid({ width, height, renderCell }: GridProps): JSX.Element {
  const col = range(0, height);
  return (
    <div className="attempt-grid">
      <div className="attempt-col">
        <div className="attempt-cell" />
        {col.map((y) => (
          <div key={y} className="attempt-cell">
            {y + 1}
          </div>
        ))}
      </div>
      {range(0, width).map((x) => (
        <div key={x} className="attempt-col">
          <div className="attempt-cell">{x + 1}</div>
          {col.map((y) => renderCell(x, y))}
        </div>
      ))}
    </div>
  );
}

export default memo(Grid);
