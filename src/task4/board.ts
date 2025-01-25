import { P5Class } from '../p5class';
import P5 from 'p5';
// @ts-ignore
import ml5 from 'ml5';
import { Racquet } from './racquet';
import { Ball } from './ball';

export class Board extends P5Class {
  bottomRacquet: Racquet;
  topRacquet: Racquet;

  ball?: Ball;
  gameNumber: number = 1;
  color: string;

  constructor(
    p5: P5,
    debug: boolean,
    color: string,
    racquetTop?: Racquet,
    racquetBottom?: Racquet,
  ) {
    super(p5, debug);
    this.color = color;

    this.bottomRacquet =
      racquetBottom ||
      new Racquet(p5, debug, p5.width / 2, p5.height - 50, 'BOTTOM', color);

    this.topRacquet =
      racquetTop || new Racquet(p5, debug, p5.width / 2, 50, 'TOP', color);

    this.ball = new Ball(p5, debug, color);
  }

  draw() {
    if (this.ball) {
      this.bottomRacquet.run(this.ball);
      this.topRacquet.run(this.ball);

      this.ball.move();
      this.ball.bounce(this.bottomRacquet, this.topRacquet);
      this.ball.draw();

      if (this.ball.isOut()) {
        this.gameNumber += 1;
        this.ball = undefined;
      }
    }

    this.bottomRacquet.draw(this.ball);
    this.topRacquet.draw(this.ball);
  }
}
