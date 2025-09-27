# ababylontest

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

implement the following typescript code but only touch the index.ts file and view dir.

Already finished:
- the world class handles chunk loading and indirect the chunk generation via the given chunk store and its chunk generator

What should be implemented:
- a world view class that renders the chunks and its fields using the blockSkin.ts
- a player view class that handels the players location and the rendering of the background behind the player.
- the player should be a red dot / circle
- the player should be moveable via wasd
- first render the background from top to bottom and then the player
- use babylon 2d and not babylonjs 3d for better perfromance and because its all 2d
- when the players position x or y  is below 0 it should start at the end of the world size like he rounds the world
- when the players position x or y is above the world size it should start at 0 like he around the world
- the background should be the center chunk where the players stands and 2 chunks into each direction: so its a 5x5 chunk grid that should be loaded and renderd at any time.
- should work on the browser and run fine