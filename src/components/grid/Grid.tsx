import { h, JSX } from "preact";
import { memo } from "preact/compat";
import range from "lodash/range";
import { Problem } from "model";

interface GridProps {
  readonly problem: Problem;
  readonly showHints?: boolean;
  readonly renderCell: (x: number, y: number) => JSX.Element;
}

function Grid({ problem, showHints, renderCell }: GridProps): JSX.Element {
  const col = range(0, problem.image[0].length);
  /* eslint-disable react/no-array-index-key */
  return (
    <div className="problem-grid">
      {showHints && (
        <div className="problem-x-hints">
          {problem.columnHints.map((xHint, x) => (
            <div key={x} className="problem-x-hint">
              {xHint.map((hint, i) => (
                <div key={i}>{hint}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="problem-cols">
        {range(0, problem.image.length).map((x) => (
          <div key={x} className="problem-col problem-numbers-col">
            {col.map((y) => renderCell(x, y))}
          </div>
        ))}
        {showHints && (
          <div className="problem-col">
            {problem.rowHints.map((yHint, y) => (
              <div key={y} className="problem-y-hint">
                {yHint.map((hint, i) => (
                  <div key={i}>{hint}</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  /* eslint-enable react/no-array-index-key */
}

export default memo(Grid);
