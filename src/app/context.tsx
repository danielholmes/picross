import { JSX, h, ComponentChildren, createContext } from "preact";
import { useCallback, useContext, useState } from "preact/hooks";
import { AppState } from "./state";
import { library } from "../features/library";

type AppDispatch = () => void;

interface AppContext {
  readonly state: AppState;
  readonly dispatch: AppDispatch;
}

const Context = createContext<AppContext | undefined>(undefined);

interface AppStateProviderProps {
  readonly children: ComponentChildren;
}

export function AppStateProvider({
  children,
}: AppStateProviderProps): JSX.Element {
  const [state] = useState<AppState>(() => ({
    library,
    results: [],
  }));
  const dispatch = useCallback(() => {
    // console.log("TODO: Dispatch");
  }, []);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}

export function useAppState(): AppState {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("No state");
  }
  return context.state;
}

export function useAppDispatch(): AppDispatch {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("No state");
  }
  return context.dispatch;
}
