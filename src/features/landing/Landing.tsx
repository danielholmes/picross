import { h, JSX } from "preact";
import { useState } from "preact/hooks";
import { createProblemFromImage, Problem } from "../../model";
import { createMatrixWithFactory } from "../../utils/matrix";
import { useAppState } from "../../app";
import { createProblemFromSource } from "../library";
import { sampleOrThrow } from "../../utils/array";

type ControlType = "ai" | "player";

type LandingProps = {
  readonly onStart: (problem: Problem, control: ControlType) => void;
};

const controlOptions = [
  { value: "ai" as const, label: "A.I." },
  { value: "player" as const, label: "Player" },
];

export default function Landing({ onStart }: LandingProps): JSX.Element {
  const [control, setControl] = useState<ControlType>("player");

  const onStartRandomPattern = () => {
    onStart(
      createProblemFromImage(
        createMatrixWithFactory(15, 15, () => Math.random() < 0.5)
      ),
      control
    );
  };

  const { library } = useAppState();
  const onStartRandomLibraryImage = async () => {
    const source = sampleOrThrow(library);
    const problem = await createProblemFromSource(source, 15);
    onStart(problem, control);
  };

  return (
    <div>
      <h1>Welcome to Picross</h1>
      {controlOptions.map(({ value, label }) => (
        <label key={value} htmlFor={`control${value}Field`}>
          <input
            id={`control${value}Field`}
            type="radio"
            value={value}
            checked={value === control}
            onClick={() => setControl(value)}
          />
          {label}
        </label>
      ))}
      <button type="button" onClick={onStartRandomPattern}>
        Start random pattern
      </button>
      <button type="button" onClick={onStartRandomLibraryImage}>
        Start random library image
      </button>
    </div>
  );
}
