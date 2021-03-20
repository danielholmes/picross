import { Matrix } from "../../utils/matrix";
import { AttemptCellStatus } from "../../model";

export interface AiProblemAttempt {
  readonly marks: Matrix<AttemptCellStatus>;
}
