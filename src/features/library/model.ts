import { h } from "preact";

export interface ProblemSource {
  readonly id: string;
  readonly name: string;
  readonly Component: (props: { readonly size: number }) => h.JSX.Element;
}

export type ProblemLibrary = ReadonlyArray<ProblemSource>;
