import { P5Class } from '../p5class';
import P5 from 'p5';
import { Tile, TileType } from './tile';

export interface SheepState {
  hungry: boolean;
}

export class Sheep extends P5Class {
  state: SheepState;
  tile: Tile;
  nextTile: Tile | undefined;
  isDead: boolean = false;

  hungryTimeout: number | undefined;
  starvingTimeout: number | undefined;

  constructor(p5: P5, debug: boolean, tile: Tile) {
    super(p5, debug);
    this.state = {
      hungry: false,
    };

    this.tile = tile;

    this.startHunger();
  }

  run() {
    const nextTile = this.pickNextTile(this.tile.neighbors);
    if (nextTile) {
      this.nextTile = nextTile;
    }

    if (this.tile.type === TileType.Grass && this.state.hungry) {
      this.eat();
    }
  }

  eat() {
    this.tile.handleEat();
    this.state.hungry = false;

    clearTimeout(this.hungryTimeout);
    clearTimeout(this.starvingTimeout);
    this.startHunger();
  }

  startHunger() {
    this.hungryTimeout = setTimeout(() => {
      this.state.hungry = true;
      this.startStarving();
    }, 3000);
  }

  startStarving() {
    this.starvingTimeout = setTimeout(() => {
      this.tile.sheep = null;
    }, 5000);
  }

  pickNextTile(neighbors: Tile[]): Tile | undefined {
    if (this.state.hungry) {
      const grassTile = neighbors.find((n) => n.type === TileType.Grass);
      if (grassTile && !grassTile.sheep) {
        return grassTile;
      }
    }

    const emptyTiles = neighbors.filter((n) => !n.sheep);
    const emptyTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    if (emptyTile) {
      return emptyTile;
    }
    this.nextTile = undefined;
  }
}
