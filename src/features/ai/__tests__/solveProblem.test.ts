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

  it("handles an empty col properly", () => {
    const problem = createProblemFromImage(
      transpose([
        [false, true],
        [false, true],
        [false, true],
      ])
    );
    const solver = solveProblem(problem);

    solver.next();
    const firstStep = solver.next();
    expect(firstStep).toEqual({
      done: false,
      value: {
        attempt: {
          marks: transpose([
            [false, undefined],
            [false, undefined],
            [false, undefined],
          ]),
        },
        nextLine: {
          type: "column",
          index: 1,
        },
      },
    });
  });

  it("fully solves more complex example", () => {
    const problem = createProblemFromImage(
      transpose([
        [false, true, true],
        [false, true, false],
        [false, true, true],
      ])
    );
    const solver = solveProblem(problem);

    solver.next();
    solver.next(); // Col 1
    solver.next(); // Col 2
    const result = solver.next(); // Col 3 - complete
    expect(result).toEqual({
      done: true,
      value: {
        marks: transpose([
          [false, true, true],
          [false, true, false],
          [false, true, true],
        ]),
      },
    });
  });

  // Single col only (edge case)
  // Single row only (edge case)
});
