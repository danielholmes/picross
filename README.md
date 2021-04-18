# picross

[![Deploy](https://github.com/danielholmes/picross/actions/workflows/deploy.yml/badge.svg)](https://github.com/danielholmes/picross/actions/workflows/deploy.yml)

Play a library of picross puzzles and use an "AI" to solve them like a human might.

<https://picross.danielholmes.org/>


## Development Requirements

 - NodeJS (tested with 12.20.2)
 - NPM (tested with 6.14.11)


## Setting up Dev

`npm install`


## Running on Dev

`npm start`

The site will be available on <http://localhost:8080>.


## Tests and Static Analysis

```
npm run lint
npm run ts
npm run test
```

## Deployment

Done via Github Actions which will deploy the site to <https://picross.danielholmes.org/>.
 

## TODO

 - Better ui feedback for which action about to take (2 step process)
 - Respond if % doesn't work out (incorrect)
 - Add AI test for all library images
 - Use a UI framework and/or proper graphic treatment.
 - Stop "flash" when creating image
 - Find a vector graphic library that can be used for different sized boards.
 - Create a library mode which saves progress (has beaten, best time) 
