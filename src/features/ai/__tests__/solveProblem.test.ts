import { createProblemFromImage } from "../../../model";
import { createMatrix } from "../../../utils/matrix";
import solveProblem from "../solveProblem";

describe("solveProblem", () => {
  it("solves correctly for a full solid col", () => {
    const problem = createProblemFromImage(createMatrix(3, 3, true));
    const solver = solveProblem(problem);

    const firstState = solver.next().value;
    expect(firstState).toEqual({
      attempt: {
        marks: [
          // Remember, these are columns
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
        ],
      },
      nextLine: {
        type: "column",
        index: 0,
      },
    });
  });

  // Single col only
  // Single row only
});
