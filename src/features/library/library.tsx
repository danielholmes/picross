import { h } from "preact";
import { WiMoonWaningCrescent4 } from "react-icons/wi";
import { ProblemLibrary, ProblemSource } from "./model";
import swordImage from "./images/sword.png";
import starImage from "./images/star.png";
import heartImage from "./images/heart.png";
import smileyFaceImage from "./images/smiley-face.png";

function imageToComponent(src: string): ProblemSource["Component"] {
  return ({ size }: { readonly size: number }) => (
    <img src={src} width={size} height={size} alt="" />
  );
}

const allIcons = [
  {
    name: "Smiley face",
    Component: imageToComponent(smileyFaceImage),
  },
  {
    name: "Sword",
    Component: imageToComponent(swordImage),
  },
  {
    name: "Star",
    Component: imageToComponent(starImage),
  },
  {
    name: "Heart",
    Component: imageToComponent(heartImage),
  },
  {
    name: "Moon",
    Component: WiMoonWaningCrescent4,
  },
];

const library: ProblemLibrary = allIcons.map(({ name, Component }) => ({
  id: name,
  name,
  Component,
}));

export default library;
