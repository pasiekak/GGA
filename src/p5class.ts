import P5 from 'p5';

export class P5Class {
  p5: P5;
  debug: boolean;
  constructor(p5: P5, debug: boolean) {
    this.p5 = p5;
    this.debug = debug;
  }

  setDebug(debug: boolean) {
    this.debug = debug;
  }
}
