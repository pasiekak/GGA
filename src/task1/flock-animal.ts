import { P5Class } from '../p5class';
import P5 from 'p5';
import { Flock } from './flock';
import { FlowField } from './flow-field';

export interface FlockAnimalProps {
  x: number;
  y: number;
  maxSpeed: number;
  maxForce: number;
  r: number;
  color: P5.Color;
}

export abstract class FlockAnimal extends P5Class {
  position: P5.Vector;
  velocity: P5.Vector;
  acceleration: P5.Vector;
  maxSpeed: number;
  maxForce: number;
  r: number;
  color: P5.Color;

  constructor(p5: P5, debug: boolean, props: FlockAnimalProps) {
    super(p5, debug);
    this.position = p5.createVector(props.x, props.y);
    this.velocity = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.acceleration = p5.createVector(2, 0);
    this.maxSpeed = props.maxSpeed;
    this.maxForce = props.maxForce;
    this.r = props.r;
    this.color = props.color;
  }

  abstract run(flock: Flock): void;
  abstract show(): void;

  followFlow(flow: FlowField) {
    let desired = flow.lookup(this.position);
    desired.mult(this.maxSpeed);
    let steer = P5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force: P5.Vector) {
    this.acceleration.add(force);
  }

  flock(animals: FlockAnimal[]) {
    let sep = this.separate(animals);
    let ali = this.align(animals);
    let coh = this.cohere(animals);

    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);

    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  seek(target: P5.Vector): P5.Vector {
    let desired = P5.Vector.sub(target, this.position);

    desired.normalize();
    desired.mult(this.maxSpeed);

    let steer = P5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }

  /**
   * Controls whether the animal is on screen or not
   */
  borders() {
    if (this.position.x > this.p5.width + this.r) {
      this.position.x = -this.r;
    } else if (this.position.x < -this.r) {
      this.position.x = this.p5.width + this.r;
    }
    if (this.position.y > this.p5.height + this.r) {
      this.position.y = -this.r;
    } else if (this.position.y < -this.r) {
      this.position.y = this.p5.height + this.r;
    }
  }

  /**
   * Separation
   */
  separate(animals: FlockAnimal[]): P5.Vector {
    let desiredSeparation = 25;
    let steer = this.p5.createVector(0, 0);
    let count = 0;

    for (let other of animals) {
      let d = P5.Vector.dist(this.position, other.position);
      if (d > 0 && d < desiredSeparation) {
        let diff = P5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  /**
   * Alignment
   */
  align(animals: FlockAnimal[]): P5.Vector {
    let neighborDistance = 50;
    let sum = this.p5.createVector(0, 0);
    let count = 0;

    for (let other of animals) {
      let d = P5.Vector.dist(this.position, other.position);
      if (d > 0 && d < neighborDistance) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      let steer = P5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    }

    return this.p5.createVector(0, 0);
  }

  /**
   * Cohesion
   */
  cohere(animals: FlockAnimal[]): P5.Vector {
    let neighborDistance = 50;
    let sum = this.p5.createVector(0, 0);
    let count = 0;
    for (let other of animals) {
      let d = P5.Vector.dist(this.position, other.position);
      if (d > 0 && d < neighborDistance) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }

    return this.p5.createVector(0, 0);
  }
}
