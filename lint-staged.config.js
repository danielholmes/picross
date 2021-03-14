// Split up to parallelise
module.exports = {
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.tsx": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{ts,tsx}": [
    // TSC can apparently take either filepath inputs, or a project config.
    // lint-staged is passing in filename inputs, but we want the project config.
    // empty function removes the filepaths
    () => "tsc --noEmit"
  ]
}
