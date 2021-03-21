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

 - Solver return intents rather than modified attempt (need to pass attempt to next?). 
   Move towards unified interface for player and ai.
    - probably not a generator any more at that point
 - Find some proper images to use.
    - https://www.123rf.com/photo_4378683_pixel-icon-set-vector.html
    - https://www.123rf.com/photo_15118439_pixel-icons-on-brown.html
    - https://fontmeme.com/fonts/pixel-icons-compilation-font/
 - Add AI test for all library images
 - Need a solution for "stuck" situations
 - Use a UI framework and/or proper graphic treatment.
