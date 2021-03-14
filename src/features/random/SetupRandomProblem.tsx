import { h, JSX } from "preact";
import { useForm } from "react-hook-form";
import { SetupSpec } from "./SetupSpec";

interface SetupRandomProblemSpec {
  readonly onComplete: (spec: SetupSpec) => void;
}

export default function SetupRandomProblem({
  onComplete,
}: SetupRandomProblemSpec): JSX.Element {
  const { handleSubmit, register } = useForm<SetupSpec, Record<string, never>>({
    defaultValues: {
      size: 15,
    },
  });
  return (
    <div>
      <h2>Setup Random Problem</h2>
      <form onSubmit={handleSubmit(onComplete)}>
        <input
          name="size"
          ref={register({
            required: true,
            pattern: /^[0-9]+$/,
            valueAsNumber: true,
          })}
        />
        <button type="submit">Start</button>
      </form>
    </div>
  );
}
