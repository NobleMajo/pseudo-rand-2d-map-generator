# pseudo-rand-2d-map-generator

Seeded 2D world generation and rendering in TypeScript. Uses
simplex noise and a deterministic PRNG to create seamless tile
maps, with a browser renderer built on `pixi.js` and CLI demos
for quick experimentation.

-   GitHub:
    [NobleMajo/pseudo-rand-2d-map-generator](https://github.com/NobleMajo/pseudo-rand-2d-map-generator)

## Requirements

 -   Linux/Unix-like system (Linux, macOS, or Windows via WSL2)
 -   Bun runtime installed (v1.2+ recommended)

## What is this?

A tiny sandbox for procedural map generation:

-   Deterministic maps from a seed (custom PRNG)
-   Seamless simplex-noise world generation
-   Chunked wrap-around world (toroidal) rendered in the browser
-   Always loads a 5×5 chunk window around the player
    (configurable)
-   Controls: W/A/S/D to move, Shift to run, 0 to toggle the
    debug overlay.
-   Multiple biomes to explore
-   Generated, loaded, and rendered in a second

## Getting started

To install dependencies:

```bash
bun install
```

To run the browser app:

```bash
bun dev
```

This starts a Bun dev server that automatically compiles
TypeScript with hot reload. The console logs the port.

## Demos (CLI)

Run demo1 using:

```bash
bun demo1

```

Descriptions:

-   `demo1`: Enter seed → prints 10 deterministic numbers.
-   `demo2`: Single 40×40 simplex noise map (ASCII).
-   `demo3`: Two stitched maps with a seamless edge.
-   `demo4`: Interactive chained maps; press Enter to advance,
    `q` to quit.
-   `demo5`: Timed scrolling ASCII animation.
-   `demo6`: Animated ASCII with sliding window and speed pulse.

## License

MIT
