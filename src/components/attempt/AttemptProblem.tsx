import { h, JSX } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import noop from "lodash/noop";
import classNames from "classnames";
import {
  AttemptCellStatus,
  incorrectMark,
  isComplete,
  Problem,
} from "../../model";
import AttemptCell from "./AttemptCell";
import createNewAttempt from "./createNewAttempt";
import progressAttempt from "./progressAttempt";
import Grid from "../grid";

interface AttemptProblemProps {
  readonly problem: Problem;
  readonly onSuccess: () => void;
  readonly onFail: () => void;
}

interface NotDraggingState {
  readonly type: "not-dragging";
}

interface ActiveDraggingState {
  readonly type: "dragging";
  readonly tool: AttemptCellStatus;
}

type DraggingState = NotDraggingState | ActiveDraggingState;

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
  const isAttemptComplete = useMemo(() => isComplete(problem, marks), [
    problem,
    marks,
  ]);

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
      return noop;
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

  // Modifier for unmark
  const [isUnmarkActive, setUnmarkActive] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        setUnmarkActive(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        setUnmarkActive(false);
      }
    };
    const onCancelUnmark = () => {
      setUnmarkActive(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("focus", onCancelUnmark);
    return (): void => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("focus", onCancelUnmark);
    };
  }, []);

  // Tool and modifying attempt
  const [dragging, setDragging] = useState<DraggingState>({
    type: "not-dragging",
  });
  const tryAndApplyMark = useCallback(
    (x: number, y: number, newStatus: AttemptCellStatus) => {
      const cellNeedsMark = problem.image[x][y];
      if (!cellNeedsMark && newStatus) {
        setAttempt((previous) => incorrectMark(previous));
        setDragging({ type: "not-dragging" });
        return;
      }
      setAttempt((previous) => progressAttempt(previous, x, y, newStatus));
    },
    [problem]
  );

  // Start using tool
  const onCellMouseDown = useCallback(
    (x: number, y: number): void => {
      const currentStatus = attempt.marks[x][y];
      const desiredTool = !isUnmarkActive;

      if (currentStatus === desiredTool) {
        setDragging({
          type: "dragging",
          tool: undefined,
        });
        tryAndApplyMark(x, y, undefined);
        return;
      }

      setDragging({
        type: "dragging",
        tool: desiredTool,
      });
      tryAndApplyMark(x, y, desiredTool);
    },
    [attempt, tryAndApplyMark, isUnmarkActive]
  );
  const onCellMouseEnter = useCallback(
    (x: number, y: number): void => {
      if (dragging.type !== "dragging") {
        throw new Error("Invalid state");
      }

      const currentStatus = attempt.marks[x][y];
      // No change
      if (currentStatus === dragging.tool) {
        return;
      }

      tryAndApplyMark(x, y, dragging.tool);
    },
    [attempt, dragging, tryAndApplyMark]
  );

  // Finish using tool
  useEffect(() => {
    if (dragging.type !== "dragging") {
      return noop;
    }

    const onCancelTool = (): void => {
      setDragging({
        type: "not-dragging",
      });
    };

    window.addEventListener("mouseup", onCancelTool);
    window.addEventListener("blur", onCancelTool);
    return (): void => {
      window.addEventListener("mouseup", onCancelTool);
      window.addEventListener("blur", onCancelTool);
    };
  }, [dragging]);

  // General UI
  const disabled = !hasTimeRemaining || isAttemptComplete;

  // Render attempt cell
  const cellClassName = classNames({
    "clear-tool": dragging.type === "dragging" && dragging.tool === undefined,
    "unmark-tool":
      (dragging.type === "dragging" && dragging.tool === false) ||
      (dragging.type === "not-dragging" && isUnmarkActive),
    "mark-tool":
      (dragging.type === "dragging" && dragging.tool === true) ||
      (dragging.type === "not-dragging" && !isUnmarkActive),
  });
  const renderCell = useCallback(
    (x: number, y: number) => (
      <AttemptCell
        key={y}
        status={attempt.marks[x][y]}
        onMouseDown={(): void => onCellMouseDown(x, y)}
        onMouseEnter={
          dragging.type === "dragging"
            ? (): void => onCellMouseEnter(x, y)
            : undefined
        }
        disabled={disabled}
        className={cellClassName}
      />
    ),
    [
      attempt,
      cellClassName,
      dragging,
      onCellMouseDown,
      onCellMouseEnter,
      disabled,
    ]
  );

  return (
    <div>
      <div>Time: {attempt.timeRemaining.toFormat("mm:ss")}</div>
      <Grid problem={problem} renderCell={renderCell} />
      <em>Hold alt/command key and click to mark with a cross</em>
    </div>
  );
}
