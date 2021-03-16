import { h, JSX, render } from "preact";
import html2Canvas from "html2canvas";
import range from "lodash/range";
import { ProblemSource } from "./model";
import { Problem } from "../../model";
import { createMatrixWithFactory } from "../../utils/matrix";

const channelsPerPixel = 4;
const whiteChannelValue = 255;

function getHints(imageLine: ReadonlyArray<boolean>): ReadonlyArray<number> {
  return imageLine.reduce((accu, pixel, i) => {
    if (!pixel) {
      return accu;
    }
    if (i === 0) {
      return [1];
    }
    const previousPixel = imageLine[i - 1];
    if (previousPixel) {
      return [...accu.slice(0, -1), accu[accu.length - 1] + 1];
    }
    return [...accu, 1];
  }, [] as ReadonlyArray<number>);
}

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

  const xIndices = range(0, data.width);
  return {
    image,
    xHints: xIndices.map((x) => getHints(image[x])),
    yHints: range(0, data.height).map((y) =>
      getHints(xIndices.map((x) => image[x][y]))
    ),
  };
}
