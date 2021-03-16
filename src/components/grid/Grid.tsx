import { h, JSX } from "preact";
import { memo } from "preact/compat";
import range from "lodash/range";
import { Problem } from "../../model";

interface GridProps {
  readonly problem: Problem;
  readonly renderCell: (x: number, y: number) => JSX.Element;
}

function Grid({ problem, renderCell }: GridProps): JSX.Element {
  const col = range(0, problem.image[0].length);
  /* eslint-disable react/no-array-index-key */
  return (
    <div className="attempt-grid">
      <div className="attempt-x-hints">
        {problem.xHints.map((xHint, x) => (
          <div key={x} className="attempt-x-hint">
            {xHint.map((hint, i) => (
              <div key={i}>{hint}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="attempt-cols">
        <div className="attempt-col">
          {problem.yHints.map((yHint, y) => (
            <div key={y} className="attempt-y-hint">
              {yHint.map((hint, i) => (
                <div key={i}>{hint}</div>
              ))}
            </div>
          ))}
        </div>
        {range(0, problem.image.length).map((x) => (
          <div key={x} className="attempt-col">
            {col.map((y) => renderCell(x, y))}
          </div>
        ))}
      </div>
    </div>
  );
  /* eslint-enable react/no-array-index-key */
}

export default memo(Grid);
