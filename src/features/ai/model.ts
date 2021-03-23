import { Matrix } from "../../utils/matrix";
import { AttemptCellStatus } from "../../model";

/** @deprecated Should use the same attempt model */
export interface AiProblemAttempt {
  readonly marks: Matrix<AttemptCellStatus>;
}
