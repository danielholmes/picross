import { GoSearch, GoLightBulb } from "react-icons/go";
import { CgAnchor, CgKey } from "react-icons/cg";
import {
  WiCloud,
  WiDaySunny,
  WiMoonWaningCrescent4,
  WiRaindrop,
  WiTime3,
} from "react-icons/wi";
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
  {
    name: "Cloud",
    Component: WiCloud,
  },
  {
    name: "Sun",
    Component: WiDaySunny,
  },
  {
    name: "Moon",
    Component: WiMoonWaningCrescent4,
  },
  {
    name: "Raindrop",
    Component: WiRaindrop,
  },
  {
    name: "Clock",
    Component: WiTime3,
  },
  {
    name: "Anchor",
    Component: CgAnchor,
  },
  {
    name: "Key",
    Component: CgKey,
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
