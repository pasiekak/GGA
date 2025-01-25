import P5 from 'p5';
import { P5Class } from '../p5class';
import { FlockAnimal } from './flock-animal';
import { FlowField } from './flow-field';

export class Flock extends P5Class {
  animals: FlockAnimal[];

  constructor(p5: P5, debug: boolean) {
    super(p5, debug);
    this.animals = [];
  }

  run(flow: FlowField) {
    for (let animal of this.animals) {
      animal.followFlow(flow);
      animal.run(this);
    }
  }

  addAnimal(animal: FlockAnimal) {
    this.animals.push(animal);
  }

  removeAnimal(animal: FlockAnimal) {
    const index = this.animals.indexOf(animal);
    if (index > -1) {
      this.animals.splice(index, 1);
    }
  }
}
