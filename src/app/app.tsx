import { h, JSX } from "preact";
import { useState } from "preact/hooks";
import { AttemptProblem } from "features/player";
import { Problem } from "model";
import Landing from "features/landing";
import AiAttempt from "features/ai";
import { AppStateProvider } from "./context";

export default function App(): JSX.Element {
  const [setup, setSetup] = useState<
    { problem: Problem; control: "ai" | "player" } | undefined
  >(undefined);
  const onAttemptComplete = () => {
    setSetup(undefined);
  };

  const onStart = (newProblem: Problem, control: "ai" | "player") => {
    setSetup({ problem: newProblem, control });
  };

  return (
    <AppStateProvider>
      {!setup && <Landing onStart={onStart} />}
      {setup?.control === "player" && (
        <AttemptProblem
          problem={setup.problem}
          onSuccess={onAttemptComplete}
          onFail={onAttemptComplete}
          onCancel={onAttemptComplete}
        />
      )}
      {setup?.control === "ai" && <AiAttempt problem={setup.problem} />}
    </AppStateProvider>
  );
}
