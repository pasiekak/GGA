import { P5Class } from '../p5class';
import P5 from 'p5';
// @ts-ignore
import ml5 from 'ml5';
import { Ball } from './ball';

ml5.tf.setBackend('cpu');

export class Racquet extends P5Class {
  x: number;
  y: number;
  width: number;
  height: number;
  brain: any;
  type: 'TOP' | 'BOTTOM';
  fitness: number = 0;
  color: string;

  constructor(
    p5: P5,
    debug: boolean,
    x: number,
    y: number,
    type: 'TOP' | 'BOTTOM',
    color: string,
    brain?: any,
  ) {
    super(p5, debug);
    this.x = x; // X can change
    this.y = y; // Y is constant
    this.width = 50;
    this.height = 10;
    this.type = type;
    this.color = color;

    this.brain =
      brain ||
      ml5.neuralNetwork({
        inputs: 6,
        outputs: ['LEFT', 'RIGHT'],
        task: 'classification',
        neuroEvolution: true,
      });
  }

  run(ball: Ball) {
    this.think(ball);
  }

  draw(ball?: Ball) {
    this.p5.push();
    if (ball) {
      this.p5.fill(this.color);
      this.p5.rect(this.x, this.y, this.width, this.height);
      this.p5.fill(0);
    } else {
      this.p5.fill(0, 0, 0, 10);
      this.p5.stroke(0, 0, 0, 10);
      this.p5.rect(this.x, this.y, this.width, this.height);
      this.p5.fill(0);
    }
    this.p5.textSize(10);
    this.p5.text(`F: ${this.fitness}`, this.x, this.y - 10);
    this.p5.pop();
  }

  think(ball: Ball) {
    let inputs = [
      ball.x / this.p5.width,
      ball.y / this.p5.height,
      ball.directionX === 'LEFT' ? -1 : 1,
      ball.directionY === 'UP' ? -1 : 1,
      this.x / this.p5.width,
      this.height / this.p5.height,
    ];
    const outputs = this.brain.classifySync(inputs);
    this.move(
      outputs[0].value > outputs[1].value ? outputs[0].label : outputs[1].label,
    );
  }

  move(direction: 'LEFT' | 'RIGHT') {
    if (direction === 'LEFT') {
      this.x -= 2;
    } else {
      this.x += 2;
    }
    this.x = this.p5.constrain(this.x, 0, this.p5.width - this.width);
  }
}
