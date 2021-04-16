import { createProblemFromImage } from "model";
import { transpose } from "utils/matrix";
import { createNewAttempt } from "features/attempt";
import { startProbabilitySolving } from "../probabilitySolve";

describe("probabilitySolve", () => {
  it("starts with correct probabilities", () => {
    const problem = createProblemFromImage(
      transpose([
        [true, false, false],
        [true, true, false],
        [false, false, false],
      ])
    );
    const attempt = createNewAttempt(problem);

    const result = startProbabilitySolving(problem, attempt);

    expect(result).toMatchObject({
      type: "probability",
      probabilities: transpose([
        [1 / 6, 1 / 6, 0],
        [1, 1, 0],
        [1 / 6, 1 / 6, 0],
      ]),
    });
  });
});
