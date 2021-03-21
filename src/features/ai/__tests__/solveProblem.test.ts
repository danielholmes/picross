import { createProblemFromImage } from "../../../model";
import { createMatrix, transpose } from "../../../utils/matrix";
import solveProblem from "../solveProblem";

describe("solveProblem", () => {
  it("solves correctly for a full solid square", () => {
    const problem = createProblemFromImage(createMatrix(3, 3, true));
    const solver = solveProblem(problem);

    // Initial, before start state
    const initState = solver.next().value;
    expect(initState).toEqual({
      attempt: {
        marks: createMatrix(3, 3, undefined),
      },
      nextLine: {
        type: "column",
        index: 0,
      },
    });

    // First step
    const firstStep = solver.next();
    expect(firstStep).toEqual({
      done: false,
      value: {
        attempt: {
          marks: transpose([
            [true, undefined, undefined],
            [true, undefined, undefined],
            [true, undefined, undefined],
          ]),
        },
        nextLine: {
          type: "column",
          index: 1,
        },
      },
    });

    // Second step
    const secondStep = solver.next();
    expect(secondStep).toEqual({
      done: false,
      value: {
        attempt: {
          marks: transpose([
            [true, true, undefined],
            [true, true, undefined],
            [true, true, undefined],
          ]),
        },
        nextLine: {
          type: "column",
          index: 2,
        },
      },
    });

    // Done
    const finalStep = solver.next();
    expect(finalStep).toEqual({
      done: true,
      value: {
        marks: createMatrix(3, 3, true),
      },
    });
  });

  // Single col only (edge case)
  // Single row only (edge case)
});
