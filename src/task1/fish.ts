import P5 from 'p5';
import { FlockAnimal, FlockAnimalProps } from './flock-animal';
import { Flock } from './flock';

export class Fish extends FlockAnimal {
  constructor(p5: P5, debug: boolean, props: FlockAnimalProps) {
    super(p5, debug, props);
  }

  run(flock: Flock) {
    this.flock(flock.animals);
    this.update();
    this.borders();
    this.show();
  }

  show() {
    this.p5.push();
    this.p5.fill(this.color);
    this.p5.strokeWeight(2);
    this.p5.stroke(200);
    this.p5.ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
    this.p5.pop();
  }
}
