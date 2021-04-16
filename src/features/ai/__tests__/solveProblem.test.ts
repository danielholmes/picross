import { createProblemFromImage, isComplete } from "model";
import { createMatrix, transpose } from "utils/matrix";
import { applyAttemptActions, createNewAttempt } from "features/attempt";
import { solveNextStep } from "../solveProblem";

describe("solveProblem", () => {
  it.skip("solves correctly for a solid column", () => {
    const problem = createProblemFromImage(createMatrix(3, 3, true));
    const attempt0 = createNewAttempt(problem);
    const nextStep = solveNextStep(problem, attempt0, {
      type: "checkLine",
      dirtyLines: [{ type: "column", index: 0 }],
    });

    expect(nextStep).toEqual({
      actions: [
        { type: "mark", coordinate: { x: 0, y: 0 } },
        { type: "mark", coordinate: { x: 0, y: 1 } },
        { type: "mark", coordinate: { x: 0, y: 2 } },
      ],
      solveState: {
        type: "checkLine",
        dirtyLines: [{ type: "column", index: 1 }],
      },
    });
  });

  it.skip("handles an empty col properly", () => {
    const problem = createProblemFromImage(
      transpose([
        [false, true],
        [false, true],
        [false, true],
      ])
    );
    const attempt0 = createNewAttempt(problem);
    const nextStep = solveNextStep(problem, attempt0, {
      type: "checkLine",
      dirtyLines: [{ type: "column", index: 0 }],
    });

    expect(nextStep).toEqual({
      actions: [
        { type: "unmark", coordinate: { x: 0, y: 0 } },
        { type: "unmark", coordinate: { x: 0, y: 1 } },
        { type: "unmark", coordinate: { x: 0, y: 2 } },
      ],
      solveState: {
        type: "checkLine",
        dirtyLines: [{ type: "column", index: 1 }],
      },
    });
  });

  it.skip("handles already completed correctly", () => {
    const problem = createProblemFromImage(
      transpose([
        [false, true],
        [false, true],
        [false, true],
      ])
    );
    const completedAttempt = applyAttemptActions(
      problem,
      createNewAttempt(problem),
      [
        { type: "mark", coordinate: { x: 1, y: 0 } },
        { type: "mark", coordinate: { x: 1, y: 1 } },
        { type: "mark", coordinate: { x: 1, y: 2 } },
      ]
    );
    expect(isComplete(problem, completedAttempt.marks)).toBe(true);
    expect(() =>
      solveNextStep(problem, completedAttempt, {
        type: "checkLine",
        dirtyLines: [{ type: "column", index: 1 }],
      })
    ).toThrowError("Already completed");
  });

  // Single col only (edge case)
  // Single row only (edge case)
});
