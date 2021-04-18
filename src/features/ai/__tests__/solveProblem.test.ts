import { createProblemFromImage } from "model";
import { transpose } from "utils/matrix";
import { createNewAttempt } from "features/attempt";
import { Duration } from "luxon";
import { getProbabilities } from "../solveProblem";

describe("solveProblem", () => {
  describe("getProbabilities", () => {
    it("gets correct for basic example", () => {
      const problem = createProblemFromImage(
        transpose([
          [true, false, false],
          [true, true, false],
          [false, false, false],
        ])
      );
      const attempt = createNewAttempt(problem);

      const result = getProbabilities(problem, attempt);

      expect(result).toMatchObject(
        transpose([
          [1 / 2, 1 / 3, 0],
          [1, 1, 0],
          [0, 0, 0],
        ])
      );
    });

    it("gets correct for larger example", () => {
      const problem = createProblemFromImage(
        transpose([
          [true, false, false, true],
          [true, true, false, false],
          [false, false, false, false],
          [true, false, false, false],
        ])
      );
      const attempt = createNewAttempt(problem);

      const result = getProbabilities(problem, attempt);

      expect(result).toMatchObject(
        transpose([
          [1, 1 / 3, 0, 2 / 3],
          [1, 2 / 3, 0, 1 / 3],
          [0, 0, 0, 0],
          [1, 1 / 4, 0, 1 / 4],
        ])
      );
    });

    it("gets correct for attempts", () => {
      const problem = createProblemFromImage(
        transpose([
          [true, false, false, true],
          [true, true, false, false],
          [false, false, false, false],
          [true, false, false, false],
        ])
      );
      const attempt = {
        incorrectMarks: [],
        timeRemaining: Duration.fromMillis(30 * 60 * 1000),
        marks: transpose([
          [true, false, false, true],
          [true, true, false, false],
          [undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined],
        ]),
      };

      const result = getProbabilities(problem, attempt);

      expect(result).toMatchObject(
        transpose([
          [undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined],
          [0, 0, 0, 0],
          [1, 0, 0, 0],
        ])
      );
    });
  });
});
