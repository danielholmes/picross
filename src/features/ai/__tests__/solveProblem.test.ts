import { createProblemFromImage, isComplete } from "../../../model";
import { createMatrix, transpose } from "../../../utils/matrix";
import { solveNextStep } from "../solveProblem";
import createNewAttempt from "../../player/createNewAttempt";
import { applyAttemptActions } from "../../attempt";

describe("solveProblem", () => {
  it("solves correctly for a solid column", () => {
    const problem = createProblemFromImage(createMatrix(3, 3, true));
    const attempt0 = createNewAttempt(problem);
    const nextStep = solveNextStep(problem, attempt0, {
      type: "column",
      index: 0,
    });

    expect(nextStep).toEqual({
      actions: [
        { type: "mark", coordinate: { x: 0, y: 0 } },
        { type: "mark", coordinate: { x: 0, y: 1 } },
        { type: "mark", coordinate: { x: 0, y: 2 } },
      ],
      nextLine: {
        type: "column",
        index: 1,
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
    const attempt0 = createNewAttempt(problem);
    const nextStep = solveNextStep(problem, attempt0, {
      type: "column",
      index: 0,
    });

    expect(nextStep).toEqual({
      actions: [
        { type: "unmark", coordinate: { x: 0, y: 0 } },
        { type: "unmark", coordinate: { x: 0, y: 1 } },
        { type: "unmark", coordinate: { x: 0, y: 2 } },
      ],
      nextLine: {
        type: "column",
        index: 1,
      },
    });
  });

  it("handles already completed correctly", () => {
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
        type: "column",
        index: 1,
      })
    ).toThrowError("Already completed");
  });

  // Single col only (edge case)
  // Single row only (edge case)
});
