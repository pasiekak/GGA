import P5 from 'p5';
import { P5Class } from '../p5class';

export class FlowField extends P5Class {
  cols: number;
  rows: number;
  resolution: number;
  field: P5.Vector[][];

  constructor(p5: P5, debug: boolean, r: number) {
    super(p5, debug);
    this.resolution = r;

    this.cols = Math.floor(p5.width / this.resolution);
    this.rows = Math.floor(p5.height / this.resolution);

    this.field = new Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      this.field[i] = new Array(this.rows);
    }

    this.init();
  }

  init() {
    this.p5.noiseSeed(this.p5.random(10000));
    let xoff = 0;
    for (let i = 0; i < this.cols; i++) {
      let yoff = 0;
      for (let j = 0; j < this.rows; j++) {
        let angle = this.p5.map(
          this.p5.noise(xoff, yoff),
          0,
          1,
          0,
          this.p5.TWO_PI,
        );
        this.field[i][j] = P5.Vector.fromAngle(angle);
        yoff += 0.1;
      }
      xoff += 0.1;
    }
  }

  lookup(position: P5.Vector) {
    let column = this.p5.constrain(
      this.p5.floor(position.x / this.resolution),
      0,
      this.cols - 1,
    );
    let row = this.p5.constrain(
      this.p5.floor(position.y / this.resolution),
      0,
      this.rows - 1,
    );
    return this.field[column][row].copy();
  }

  show() {
    if (this.debug) {
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          let w = this.p5.width / this.cols;
          let h = this.p5.height / this.rows;
          let v = this.field[i][j].copy();
          v.setMag(w * 0.5);
          let x = i * w + w / 2;
          let y = j * h + h / 2;
          this.p5.strokeWeight(1);
          this.p5.line(x, y, x + v.x, y + v.y);
        }
      }
    }
  }
}
