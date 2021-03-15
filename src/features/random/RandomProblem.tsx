import { h, JSX } from "preact";
import { useState } from "preact/hooks";
import SetupRandomProblem from "./SetupRandomProblem";
import { SetupSpec } from "./SetupSpec";
import AttemptProblem from "../../components/attempt";
import { useAppState } from "../../app";
import { createProblemFromSource } from "../library";
import { Problem } from "../../model";
import Solution from "../../components/solution";

export default function RandomProblem(): JSX.Element {
  const [problem, setProblem] = useState<undefined | Problem>(undefined);

  const { library } = useAppState();
  const onSetupComplete = async (spec: SetupSpec): Promise<void> => {
    const problem = await createProblemFromSource(library[0], spec.size);
    setProblem(problem);
  };

  const onAttemptSuccess = (): void => {
    console.log("onAttemptSuccess");
  };

  return problem ? (
    <div>
      <AttemptProblem problem={problem} onSuccess={onAttemptSuccess} />
      <Solution problem={problem} />
    </div>
  ) : (
    <SetupRandomProblem onComplete={onSetupComplete} />
  );
}
