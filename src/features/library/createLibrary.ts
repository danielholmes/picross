import * as allIcons from "react-icons/hi";
import { ProblemLibrary } from "./model";

export default function createLibrary(): ProblemLibrary {
  return Object.entries(allIcons).map(([name, Component]) => {
    const readableName = name.substr(2);
    return {
      id: name,
      name: readableName,
      Component,
    };
  });
}
