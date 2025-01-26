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
        inputs: 2,
        outputs: ['LEFT', 'STAY', 'RIGHT'],
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
    let inputs = [ball.x / this.p5.width, this.x / this.p5.width];

    const outputs = this.brain.classifySync(inputs);

    const decisionHighestConfidence = outputs.reduce((acc, cum) =>
      acc.confidence > cum.confidence ? acc : cum,
    );

    this.move(
      decisionHighestConfidence.label as 'LEFT' | 'RIGHT' | 'STAY',
      ball,
    );
  }

  move(direction: 'LEFT' | 'RIGHT' | 'STAY', ball: Ball) {
    if (direction === 'LEFT') {
      this.x -= 1.5;
    } else {
      this.x += 1.5;
    }

    const ballMiddle = ball.x + ball.r / 2;

    const racketLeft = this.x;
    const racketRight = this.x + this.width;

    if (ballMiddle >= racketLeft && ballMiddle <= racketRight) {
      this.fitness += 1;
    }

    this.x = this.p5.constrain(this.x, 0, this.p5.width - this.width);
  }
}
