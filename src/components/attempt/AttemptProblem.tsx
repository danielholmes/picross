import { h, JSX } from "preact";
import { AttemptCellStatus, Problem, ProblemAttempt } from "../../model";
import AttemptCell from "./AttemptCell";
import { useEffect, useState } from "preact/hooks";
import createNewAttempt from "./createNewAttempt";
import range from "lodash/range";
import progressAttempt from "./progressAttempt";

interface AttemptProblemProps {
  readonly problem: Problem;
  readonly onSuccess: () => void;
}

export default function AttemptProblem({
  problem,
}: AttemptProblemProps): JSX.Element {
  const [attempt, setAttempt] = useState<ProblemAttempt>(() =>
    createNewAttempt(problem)
  );
  useEffect(() => {
    setAttempt(createNewAttempt(problem));
  }, [problem]);

  const onCellChange = (
    x: number,
    y: number,
    status: AttemptCellStatus
  ): void => {
    setAttempt(progressAttempt(attempt, x, y, status));
  };

  return (
    <div>
      <div className="attempt-problem">
        <div className="attempt-col">
          <div className="attempt-cell" />
          {range(0, problem[0].length).map((y) => (
            <div key={y} className="attempt-cell">
              {y + 1}
            </div>
          ))}
        </div>
        {attempt.map((col, x) => (
          <div key={x} className="attempt-col">
            <div className="attempt-cell">{x + 1}</div>
            {col.map((cell, y) => (
              <AttemptCell
                key={y}
                status={cell}
                onChange={(status): void => onCellChange(x, y, status)}
              />
            ))}
          </div>
        ))}
      </div>
      <em>Hold alt/command key and click to mark with a cross</em>
    </div>
  );
}
