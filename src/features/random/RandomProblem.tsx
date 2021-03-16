import { h, JSX } from "preact";
import { useState } from "preact/hooks";
import sample from "lodash/sample";
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
    const source = sample(library);
    if (!source) {
      throw new Error("Problem generating");
    }
    const newProblem = await createProblemFromSource(source, spec.size);
    setProblem(newProblem);
  };

  const onAttemptSuccess = (): void => {
    // console.log("onAttemptSuccess");
  };
  const onAttemptFail = (): void => {
    // console.log("onAttemptFail");
  };

  return problem ? (
    <div>
      <AttemptProblem
        problem={problem}
        onSuccess={onAttemptSuccess}
        onFail={onAttemptFail}
      />
      <Solution problem={problem} />
    </div>
  ) : (
    <SetupRandomProblem onComplete={onSetupComplete} />
  );
}
