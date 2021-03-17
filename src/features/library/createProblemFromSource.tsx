import { h, JSX, render } from "preact";
import html2Canvas from "html2canvas";
import { ProblemSource } from "./model";
import { createProblemFromImage, Problem } from "../../model";
import { createMatrixWithFactory } from "../../utils/matrix";

const channelsPerPixel = 4;
const whiteChannelValue = 255;

export default async function createProblemFromSource(
  { Component }: ProblemSource,
  size: number
): Promise<Problem> {
  const Container = (): JSX.Element => <Component size={size} />;
  // TODO: Hide with css
  const el = document.createElement("div");
  document.body.appendChild(el);
  render(<Container />, el);
  const canvas = await html2Canvas(el, { width: size, height: size });
  el.parentNode?.removeChild(el);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Couldn't generate");
  }

  const data = ctx.getImageData(0, 0, size, size);
  const widthChannels = data.width * channelsPerPixel;

  const image = createMatrixWithFactory(data.width, data.height, (x, y) => {
    const pixelI = x * channelsPerPixel + y * widthChannels;
    return (
      data.data[pixelI] !== whiteChannelValue ||
      data.data[pixelI + 1] !== whiteChannelValue ||
      data.data[pixelI + 2] !== whiteChannelValue
    );
  });

  return createProblemFromImage(image);
}
