import { h, JSX } from "preact";
import sample from "lodash/sample";
import { createProblemFromImage, Problem } from "../../model";
import { createMatrixWithFactory } from "../../utils/matrix";
import { useAppState } from "../../app";
import { createProblemFromSource } from "../library";

type LandingProps = {
  readonly onStart: (problem: Problem) => void;
};

export default function Landing({ onStart }: LandingProps): JSX.Element {
  const onStartRandomPattern = () => {
    onStart(
      createProblemFromImage(
        createMatrixWithFactory(15, 15, () => Math.random() < 0.5)
      )
    );
  };

  const { library } = useAppState();
  const onStartRandomLibraryImage = async () => {
    const source = sample(library);
    if (!source) {
      throw new Error("Invalid library");
    }
    const problem = await createProblemFromSource(source, 15);
    onStart(problem);
  };

  return (
    <div>
      <h1>Welcome to Picross</h1>
      <button type="button" onClick={onStartRandomPattern}>
        Start random pattern
      </button>
      <button type="button" onClick={onStartRandomLibraryImage}>
        Start random library image
      </button>
    </div>
  );
}
