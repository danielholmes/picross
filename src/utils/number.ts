// eslint-disable-next-line import/prefer-default-export
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100).toString()}%`;
}
