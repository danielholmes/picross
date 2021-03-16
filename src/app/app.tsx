import { h, JSX } from "preact";
import { AppStateProvider } from "./context";
import { RandomProblem } from "../features/random";

export default function App(): JSX.Element {
  return (
    <AppStateProvider>
      {/* <Landing /> */}
      <RandomProblem />
    </AppStateProvider>
  );
}
