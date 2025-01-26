import { P5Class } from '../p5class';
import P5 from 'p5';
import { Ecosystem } from './ecosystem';

export class Food extends P5Class {
  static debug: boolean = false;

  position: P5.Vector;
  value: number;
  size: number;

  downsizeInterval: NodeJS.Timeout;

  constructor(p5: P5, debug: boolean) {
    super(p5, debug);
    this.value = Math.floor(p5.random(50, 100));
    this.size = this.value / 10;
    this.position = p5.createVector(p5.random(p5.width), p5.random(p5.height));

    this.downsizeInterval = setInterval(() => {
      this.downsize();
    }, 1000);
  }

  run() {
    this.changeSize();
    this.remove();
    this.draw();
  }

  downsize() {
    this.value -= 1;
  }

  changeSize() {
    this.size = this.value / 10;
  }

  remove() {
    if (this.value <= 0) {
      clearInterval(this.downsizeInterval);
      Ecosystem.removeFood(this);
    }
  }

  draw() {
    this.p5.push();
    this.p5.fill(0, 255, 0);
    this.p5.ellipse(this.position.x, this.position.y, this.size, this.size);
    if (Food.debug) {
      this.p5.fill(0);
      this.p5.textSize(8);
      this.p5.text(
        `F: ${this.value}/100`,
        this.position.x + this.size,
        this.position.y + this.size,
      );
    }
    this.p5.pop();
  }
}
