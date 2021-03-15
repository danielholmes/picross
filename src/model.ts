export type AttemptCellStatus = boolean | undefined;
export type ProblemAttempt = ReadonlyArray<ReadonlyArray<AttemptCellStatus>>;
export interface Problem {
  readonly image: ReadonlyArray<ReadonlyArray<boolean>>;
  readonly xHints: ReadonlyArray<ReadonlyArray<number>>;
  readonly yHints: ReadonlyArray<ReadonlyArray<number>>;
}
