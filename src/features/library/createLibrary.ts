import { GoSearch, GoLightBulb } from "react-icons/go";
import { ProblemLibrary } from "./model";

const allIcons = [
  {
    name: "Magnifying Glass",
    Component: GoSearch,
  },
  {
    name: "Light Bulb",
    Component: GoLightBulb,
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
