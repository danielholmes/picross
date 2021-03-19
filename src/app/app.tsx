import { h, JSX } from "preact";
import { useState } from "preact/hooks";
import { AppStateProvider } from "./context";
import AttemptProblem from "../components/attempt";
import { Problem } from "../model";
import Landing from "../features/landing";

export default function App(): JSX.Element {
  const [problem, setProblem] = useState<Problem | undefined>(undefined);
  const onAttemptComplete = () => {
    setProblem(undefined);
  };

  return (
    <AppStateProvider>
      {!problem && <Landing onStart={setProblem} />}
      {problem && (
        <AttemptProblem
          problem={problem}
          onSuccess={onAttemptComplete}
          onFail={onAttemptComplete}
          onCancel={onAttemptComplete}
        />
      )}
    </AppStateProvider>
  );
}
