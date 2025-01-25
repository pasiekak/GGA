import { P5Class } from '../p5class';
import P5 from 'p5';
import { Racquet } from './racquet';
import { Board } from './board';

export class Ball extends P5Class {
  x: number;
  y: number;
  xOffset: number;
  yOffset: number;
  r: number = 10;
  directionY: 'UP' | 'DOWN';
  directionX: 'LEFT' | 'RIGHT';
  color: string;

  constructor(p5: P5, debug: boolean, color: string) {
    super(p5, debug);
    this.x = this.p5.width / 2;
    this.y = this.p5.height / 2;
    this.directionY = p5.random(['UP', 'DOWN']);
    this.directionX = p5.random(['LEFT', 'RIGHT']);
    this.xOffset = p5.random(0, 0.5);
    this.yOffset = p5.random(0, 0.5);
    this.color = color;
  }

  move() {
    if (this.directionY === 'UP') {
      this.y -= 0.5 + this.yOffset;
    } else {
      this.y += 0.5 + this.yOffset;
    }
    if (this.directionX === 'LEFT') {
      this.x -= 0.5 + this.xOffset;
    } else {
      this.x += 0.5 + this.xOffset;
    }
  }

  bounce(bottomRacquet: Racquet, topRacquet: Racquet) {
    // bounce when hit left or right wall
    if (this.directionX === 'LEFT' && this.x - this.r / 2 <= 0) {
      this.directionX = 'RIGHT';
      this.xOffset = this.p5.random(0, 0.5);
      this.yOffset = this.p5.random(0, 0.5);
    }
    if (this.directionX === 'RIGHT' && this.x + this.r / 2 >= this.p5.width) {
      this.directionX = 'LEFT';
      this.xOffset = this.p5.random(0, 0.5);
      this.yOffset = this.p5.random(0, 0.5);
    }

    const topBounds = this.getRectBounds(topRacquet);
    const bottomBounds = this.getRectBounds(bottomRacquet);
    const ballBounds = {
      left: this.x - this.r / 2,
      right: this.x + this.r / 2,
      top: this.y - this.r / 2,
      bottom: this.y + this.r / 2,
    };

    if (
      ballBounds.bottom >= topBounds.top && // Ball is overlapping racquet vertically
      ballBounds.top <= topBounds.bottom &&
      ballBounds.right >= topBounds.left && // Ball is overlapping racquet horizontally
      ballBounds.left <= topBounds.right &&
      this.directionY === 'UP'
    ) {
      this.xOffset = this.p5.random(0, 0.5);
      this.yOffset = this.p5.random(0, 0.5);
      console.log('Hit top racquet');
      topRacquet.fitness += 1;
      this.directionY = 'DOWN';
      this.directionX = this.p5.random(['LEFT', 'RIGHT']);
    }

    // Handle bottom racquet
    if (
      ballBounds.bottom >= bottomBounds.top && // Ball is overlapping racquet vertically
      ballBounds.top <= bottomBounds.bottom &&
      ballBounds.right >= bottomBounds.left && // Ball is overlapping racquet horizontally
      ballBounds.left <= bottomBounds.right &&
      this.directionY === 'DOWN'
    ) {
      this.xOffset = this.p5.random(0, 0.5);
      this.yOffset = this.p5.random(0, 0.5);
      console.log('Hit bottom racquet');
      bottomRacquet.fitness += 1;
      this.directionY = 'UP';
      this.directionX = this.p5.random(['LEFT', 'RIGHT']);
    }
  }

  getRectBounds(racquet: Racquet) {
    return {
      left: racquet.x,
      right: racquet.x + racquet.width,
      top: racquet.y,
      bottom: racquet.y + racquet.height,
    };
  }

  isOut(): boolean {
    return this.y - this.r / 2 <= 0 || this.y + this.r / 2 >= this.p5.height;
  }

  draw() {
    this.p5.fill(this.color);
    this.p5.ellipse(this.x, this.y, this.r, this.r);
  }
}
