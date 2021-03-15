import { h, JSX } from "preact";
import {
  AttemptCellStatus,
  incorrectMark,
  isComplete,
  Problem,
  ProblemAttempt,
} from "../../model";
import AttemptCell from "./AttemptCell";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "preact/hooks";
import createNewAttempt from "./createNewAttempt";
import progressAttempt from "./progressAttempt";
import Grid from "../grid";

interface AttemptProblemProps {
  readonly problem: Problem;
  readonly onSuccess: () => void;
  readonly onFail: () => void;
}

interface CreateAttemptAction {
  readonly type: "create";
  readonly problem: Problem;
}

interface SecondPassedAction {
  readonly type: "secondPassed";
}

interface IncorrectMarkAction {
  readonly type: "incorrectMark";
}

interface ProgressAttempt {
  readonly type: "progress";
  readonly x: number;
  readonly y: number;
  readonly newStatus: AttemptCellStatus;
}

type AttemptAction =
  | CreateAttemptAction
  | ProgressAttempt
  | SecondPassedAction
  | IncorrectMarkAction;

export default function AttemptProblem({
  problem,
  onFail,
  onSuccess,
}: AttemptProblemProps): JSX.Element {
  // Attempt state
  const [attempt, dispatchAttempt] = useReducer(
    (previous: ProblemAttempt, action: AttemptAction) => {
      switch (action.type) {
        case "create":
          return createNewAttempt(action.problem);
        case "progress":
          return progressAttempt(
            previous,
            action.x,
            action.y,
            action.newStatus
          );
        case "incorrectMark":
          return incorrectMark(previous);
        case "secondPassed":
          return {
            ...previous,
            timeRemaining: previous.timeRemaining.minus({ second: 1 }),
          };
        default:
          throw new Error("Unknown action");
      }
    },
    createNewAttempt(problem)
  );
  useEffect(() => {
    dispatchAttempt({ type: "create", problem });
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
    const intervalId = setInterval(
      () => dispatchAttempt({ type: "secondPassed" }),
      1000
    );
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
        dispatchAttempt({ type: "incorrectMark" });
        setActiveTool(undefined);
        return;
      }
      dispatchAttempt({
        type: "progress",
        x,
        y,
        newStatus,
      });
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
