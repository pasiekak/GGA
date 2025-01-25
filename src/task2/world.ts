import { P5Class } from '../p5class';
import P5 from 'p5';
import { Tile } from './tile';

export class World extends P5Class {
  area: Tile[][] = [];
  size: number;
  tileSize: number;
  x: number;
  y: number;

  constructor(p5: P5, debug: boolean, size: number, x: number, y: number) {
    super(p5, debug);
    this.size = size;
    this.tileSize = Math.floor(this.p5.height / this.size);
    this.x = x;
    this.y = y;
    this.initArea();
  }

  initArea() {
    this.area = new Array(this.size);

    // Init board and Tiles with sheeps
    for (let i = 0; i < this.size; i++) {
      this.area[i] = new Array(this.size);
      for (let j = 0; j < this.size; j++) {
        // Tile X and Y positions from offset
        const tileX = this.x + i * this.tileSize;
        const tileY = this.y + j * this.tileSize;

        this.area[i][j] = new Tile(
          this.p5,
          this.debug,
          tileX,
          tileY,
          this.tileSize,
        );
      }
    }

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const neighbors: Tile[] = [];
        // Get 8 neigbors
        neighbors.push(this.area[i - 1]?.[j - 1]);
        neighbors.push(this.area[i]?.[j - 1]);
        neighbors.push(this.area[i + 1]?.[j - 1]);

        neighbors.push(this.area[i - 1]?.[j]);
        neighbors.push(this.area[i + 1]?.[j]);

        neighbors.push(this.area[i - 1]?.[j + 1]);
        neighbors.push(this.area[i]?.[j + 1]);
        neighbors.push(this.area[i + 1]?.[j + 1]);

        this.area[i][j].neighbors = neighbors.filter((n) => n);
      }
    }
  }

  show() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.area[i][j].show();
      }
    }
  }

  showLegend() {
    const legendX = this.x + this.size * this.tileSize + 10;
    const legendY = 10;
    const legendWidth = 20;
    const legendHeight = 20;
    const spacing = 20;

    const colors = [
      { color: this.p5.color(0, 255, 0), label: 'Grass' },
      { color: this.p5.color(139, 69, 19), label: 'Ziemia' },
      { color: this.p5.color(34, 200, 34, 0.9), label: 'Overgrown' },
    ];

    this.p5.push();
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.textSize(20);

    for (let i = 0; i < colors.length; i++) {
      const y = legendY + i * spacing;
      this.p5.fill(colors[i].color);
      this.p5.rect(legendX, y, legendWidth, legendHeight);
      this.p5.fill(0);
      this.p5.text(
        colors[i].label,
        legendX + legendWidth + 10,
        y + legendHeight / 2,
      );
    }

    this.p5.pop();
  }
}
