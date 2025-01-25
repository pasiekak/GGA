import { P5Class } from '../p5class';
import P5 from 'p5';
import { Sheep } from './sheep';

export enum TileType {
  Grass = 'Grass',
  Dirt = 'Dirt',
  Overgrown = 'Overgrown',
}

const randomTileType = (): TileType => {
  const randomIndex = Math.floor(Math.random() * Object.keys(TileType).length);
  if (randomIndex === 0) {
    return TileType.Grass;
  } else {
    return TileType.Dirt;
  }
};

export class Tile extends P5Class {
  type: TileType;
  sheep: Sheep | null = null;
  neighbors: Tile[] = [];
  x: number;
  y: number;
  size: number;

  ploughingTimeout: number | undefined;
  overgrowingTimeout: number | undefined;
  growingGrassTimeout: number | undefined;

  constructor(p5: P5, debug: boolean, x: number, y: number, size: number) {
    super(p5, debug);
    this.type = randomTileType();
    this.x = x;
    this.y = y;
    this.size = size;

    // 1/64 chance to spawn a sheep
    this.sheep = p5.random() > 0.9 ? new Sheep(p5, debug, this) : null;

    if (this.type === TileType.Dirt) {
      this.startGrowingGrass();
    } else if (this.type === TileType.Grass) {
      this.startOvergrowing();
    }
  }

  run() {
    if (this.sheep) {
      if (this.sheep.isDead) {
        this.sheep = null;
      } else {
        if (this.sheep.nextTile) {
          if (!this.sheep.nextTile.sheep) {
            const nextTile = this.sheep.nextTile;
            const sheep = this.sheep;

            nextTile.sheep = sheep;
            this.sheep = null;

            sheep.tile = nextTile;
            sheep.nextTile = undefined;
          }
        }
      }
    }
  }

  handleEat() {
    this.type = TileType.Dirt;
    clearTimeout(this.ploughingTimeout);
    this.startGrowingGrass();
  }

  startPloughing() {
    this.ploughingTimeout = setTimeout(() => {
      if (this.type === TileType.Overgrown) {
        this.type = TileType.Dirt;
        this.startGrowingGrass();
      }
    }, this.p5.random(5000, 10000));
  }

  startOvergrowing() {
    this.overgrowingTimeout = setTimeout(() => {
      if (this.type === TileType.Grass) {
        this.type = TileType.Overgrown;
        this.startPloughing();
      }
    }, this.p5.random(20000, 60000));
  }

  startGrowingGrass() {
    this.growingGrassTimeout = setTimeout(() => {
      if (this.type === TileType.Dirt) {
        const neighborWithGrass = this.neighbors.find(
          (n) => n.type === TileType.Grass,
        );
        if (neighborWithGrass) {
          this.type = TileType.Grass;
        }
        this.startOvergrowing();
      }
    }, this.p5.random(10000, 20000));
  }

  show() {
    this.p5.push();
    this.p5.stroke(1);
    this.p5.strokeWeight(4);
    if (this.type === TileType.Grass) {
      this.p5.fill(0, 255, 0);
    } else if (this.type === TileType.Dirt) {
      this.p5.fill(139, 69, 19);
    } else if (this.type === TileType.Overgrown) {
      this.p5.fill(34, 200, 34, 0.9);
    }
    this.p5.rect(this.x, this.y, this.size, this.size);
    this.p5.pop();
    if (this.sheep) {
      this.p5.push();
      this.p5.stroke(1);
      this.p5.strokeWeight(2);

      this.p5.fill(255, 255, 255);

      if (this.sheep.state.hungry) {
        this.p5.fill(255, 0, 0);
      }
      const sheepX = this.x + this.size / 2;
      const sheepY = this.y + this.size / 2;
      this.p5.ellipse(sheepX, sheepY, this.size / 2, this.size / 2);

      if (this.sheep.nextTile) {
        // Draw a little line to the next tile, more detailed
        this.p5.stroke(1);
        this.p5.strokeWeight(1);
        this.p5.line(
          sheepX,
          sheepY,
          this.sheep.nextTile.x + this.size / 2,
          this.sheep.nextTile.y + this.size / 2,
        );
      }
      this.p5.pop();
    }
  }
}
