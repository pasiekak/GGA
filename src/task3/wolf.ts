import { P5Class } from '../p5class';
import P5 from 'p5';
import { Ecosystem } from './ecosystem';
import { Bunny, BunnyState } from './bunny';

export class Wolf extends P5Class {
  position: P5.Vector;
  velocity: P5.Vector;
  acceleration: P5.Vector;
  vision: number;

  maxSpeed: number;
  maxForce: number;
  r: number;

  constructor(p5: any, debug: boolean) {
    super(p5, debug);
    this.position = p5.createVector(p5.random(p5.width), p5.random(p5.height));
    this.velocity = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.acceleration = p5.createVector(2, 0);
    this.vision = Ecosystem.WOLF_VISION;
    this.maxSpeed = Ecosystem.BUNNY_MAX_SPEED + 0.2;
    this.maxForce = Ecosystem.BUNNY_MAX_FORCE + 0.1;
    this.r = 6;
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

  seek(target: P5.Vector): P5.Vector {
    let desired = P5.Vector.sub(target, this.position);

    desired.normalize();
    desired.mult(this.maxSpeed);

    let steer = P5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }
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

  run(): void {
    const closest = this.findClosest(Ecosystem.bunnyPopulation);

    if (closest) {
      this.hunt(closest);
    } else {
      this.wander();
    }

    this.update();
    this.borders();
    this.show();
  }

  hunt(bunny: Bunny): void {
    const seekForce = this.seek(bunny.position);
    this.applyForce(seekForce);

    if (P5.Vector.dist(this.position, bunny.position) < this.r + 5) {
      bunny.state = BunnyState.DEAD;
    }
  }

  wander(): void {
    let currentSpeed = this.maxSpeed / 4;
    let currentDirection = this.velocity.copy();
    currentDirection.normalize();

    let angleVariation = this.p5.random(-Math.PI / 24, Math.PI / 24);
    currentDirection.rotate(angleVariation);
    currentDirection.setMag(currentSpeed);

    this.velocity = currentDirection;
    this.update();
  }

  findClosest(bunnies: Bunny[]): Bunny | undefined {
    let closest;
    let closestDistance = this.vision;

    for (const bunny of bunnies.filter((b) => b.state !== BunnyState.DEAD)) {
      const d = P5.Vector.dist(this.position, bunny.position);
      if (d < closestDistance) {
        closest = bunny;
        closestDistance = d;
      }
    }
    return closest;
  }

  show(): void {
    let angle = this.velocity.heading();

    this.p5.push();
    this.p5.fill(0, 0, 0);
    this.p5.strokeWeight(3);
    this.p5.stroke(127);
    this.p5.translate(this.position.x, this.position.y);
    this.p5.rotate(angle);
    this.p5.beginShape();
    this.p5.vertex(this.r * 2, 0);
    this.p5.vertex(-this.r * 2, -this.r);
    this.p5.vertex(-this.r * 2, this.r);
    this.p5.endShape(this.p5.CLOSE);
    this.p5.pop();
  }
}
