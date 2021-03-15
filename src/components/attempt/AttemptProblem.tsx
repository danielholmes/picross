import { h, JSX } from "preact";
import {
  AttemptCellStatus,
  incorrectMark,
  isComplete,
  Problem,
} from "../../model";
import AttemptCell from "./AttemptCell";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import createNewAttempt from "./createNewAttempt";
import progressAttempt from "./progressAttempt";
import Grid from "../grid";

interface AttemptProblemProps {
  readonly problem: Problem;
  readonly onSuccess: () => void;
  readonly onFail: () => void;
}

export default function AttemptProblem({
  problem,
  onFail,
  onSuccess,
}: AttemptProblemProps): JSX.Element {
  // Attempt state
  const [attempt, setAttempt] = useState(() => createNewAttempt(problem));

  useEffect(() => {
    // Unfortunately this results in running twice (the state initialiser).
    // Maybe can skip on first run?
    setAttempt(createNewAttempt(problem));
  }, [problem]);
  const { timeRemaining, marks } = attempt;
  const hasTimeRemaining = timeRemaining.as("seconds");
  const isAttemptComplete = useMemo(() => {
    return isComplete(problem, marks);
  }, [problem, marks]);

  // Complete state
  useEffect(() => {
    if (!hasTimeRemaining) {
      onFail();
      return;
    }
    if (isAttemptComplete) {
      onSuccess();
    }
  }, [hasTimeRemaining, isAttemptComplete, onFail, onSuccess]);

  // Counting down timer
  useEffect(() => {
    if (!hasTimeRemaining || isAttemptComplete) {
      return;
    }
    const intervalId = setInterval(() => {
      setAttempt((previous) => ({
        ...previous,
        timeRemaining: previous.timeRemaining.minus({ second: 1 }),
      }));
    }, 1000);
    return (): void => {
      clearTimeout(intervalId);
    };
  }, [hasTimeRemaining, isAttemptComplete]);

  // Tool and modifying attempt
  const [activeTool, setActiveTool] = useState<AttemptCellStatus>(undefined);
  const tryAndApplyMark = useCallback(
    (x: number, y: number, newStatus: AttemptCellStatus) => {
      const cellNeedsMark = problem.image[x][y];
      if (!cellNeedsMark && newStatus) {
        setAttempt((previous) => incorrectMark(previous));
        setActiveTool(undefined);
        return;
      }
      setAttempt((previous) => progressAttempt(previous, x, y, newStatus));
    },
    [problem]
  );
  const onCellMouseDown = useCallback(
    (x: number, y: number, e: MouseEvent): void => {
      const currentStatus = attempt.marks[x][y];
      const newStatus = !e.metaKey;

      setActiveTool(newStatus);
      if (currentStatus !== newStatus) {
        tryAndApplyMark(x, y, newStatus);
      }
    },
    [attempt, tryAndApplyMark]
  );
  const onCellMouseEnter = useCallback(
    (x: number, y: number): void => {
      if (activeTool === undefined) {
        throw new Error("Invalid state");
      }

      const currentStatus = attempt.marks[x][y];
      // No change
      if (currentStatus === activeTool) {
        return;
      }

      tryAndApplyMark(x, y, activeTool);
    },
    [attempt, activeTool, tryAndApplyMark]
  );
  useEffect(() => {
    if (!activeTool) {
      return;
    }

    const onCancelTool = (): void => {
      setActiveTool(undefined);
    };

    window.addEventListener("mouseup", onCancelTool);
    window.addEventListener("blur", onCancelTool);
    return (): void => {
      window.addEventListener("mouseup", onCancelTool);
      window.addEventListener("blur", onCancelTool);
    };
  }, [activeTool]);

  // General UI
  const disabled = !hasTimeRemaining || isAttemptComplete;

  // Render attempt cell
  const renderCell = useCallback(
    (x: number, y: number) => {
      return (
        <AttemptCell
          key={y}
          status={attempt.marks[x][y]}
          onMouseDown={(e: MouseEvent): void => onCellMouseDown(x, y, e)}
          onMouseEnter={
            activeTool !== undefined
              ? (): void => onCellMouseEnter(x, y)
              : undefined
          }
          disabled={disabled}
        />
      );
    },
    [attempt, activeTool, onCellMouseDown, onCellMouseEnter, disabled]
  );

  return (
    <div>
      <div>Time: {attempt.timeRemaining.toFormat("mm:ss")}</div>
      <Grid problem={problem} renderCell={renderCell} />
      <em>Hold alt/command key and click to mark with a cross</em>
    </div>
  );
}
