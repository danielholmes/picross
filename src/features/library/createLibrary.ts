import { GoFile } from "react-icons/go";
import { ProblemLibrary } from "./model";

const allIcons = [
  {
    name: "File",
    Component: GoFile,
  },
];

export default function createLibrary(): ProblemLibrary {
  return allIcons.map(({ name, Component }) => {
    return {
      id: name,
      name,
      Component,
    };
  });
}
