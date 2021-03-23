import { createProblemFromImage } from "../../../model";
import { createMatrix, transpose } from "../../../utils/matrix";
import solveProblem from "../solveProblem";

describe("solveProblem", () => {
  it("solves correctly for a full solid square", () => {
    const problem = createProblemFromImage(createMatrix(3, 3, true));
    const solver = solveProblem(problem);
    const attempt0 = {
      marks: createMatrix(3, 3, undefined),
    };

    // Initial, before start state
    const initState = solver.next(attempt0).value;
    expect(initState).toEqual({
      actions: [],
      nextLine: {
        type: "column",
        index: 0,
      },
    });

    // First step
    const firstStep = solver.next(attempt0);
    expect(firstStep).toEqual({
      done: false,
      value: {
        actions: [
          { type: "mark", coordinate: { x: 0, y: 0 } },
          { type: "mark", coordinate: { x: 0, y: 1 } },
          { type: "mark", coordinate: { x: 0, y: 2 } },
        ],
        nextLine: {
          type: "column",
          index: 1,
        },
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
    const attempt0 = {
      marks: createMatrix(
        problem.image.length,
        problem.image[0].length,
        undefined
      ),
    };
    const solver = solveProblem(problem);

    solver.next(attempt0);
    const firstStep = solver.next(attempt0);
    expect(firstStep).toEqual({
      done: false,
      value: {
        actions: [
          { type: "unmark", coordinate: { x: 0, y: 0 } },
          { type: "unmark", coordinate: { x: 0, y: 1 } },
          { type: "unmark", coordinate: { x: 0, y: 2 } },
        ],
        nextLine: {
          type: "column",
          index: 1,
        },
      },
    });
  });

  it.skip("fully solves more complex example", () => {
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
