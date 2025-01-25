import { Fish } from './fish';
import { Flock } from './flock';
import { FlockAnimal, FlockAnimalProps } from './flock-animal';
import P5 from 'p5';

export class Shark extends FlockAnimal {
  fishEaten: number;
  initialMaxSpeed: number;
  initialMaxForce: number;
  initialR: number;
  initialColor: P5.Color;
  hasDublicated = false;
  hunger = 0;

  constructor(p5: P5, debug: boolean, props: FlockAnimalProps) {
    super(p5, debug, props);
    this.fishEaten = 0;
    this.initialMaxSpeed = props.maxSpeed;
    this.initialMaxForce = props.maxForce;
    this.initialR = props.r;
    this.initialColor = props.color;

    setInterval(() => {
      this.hunger++;
    }, 1000);
  }

  run(flock: Flock): void {
    const closest = this.findClosest(flock);

    if (closest) {
      const seekForce = this.seek(closest.position);
      this.applyForce(seekForce);
    }

    this.update();
    this.borders();
    this.show();
    this.eat(flock);
  }

  eat(flock: Flock): void {
    for (let i = flock.animals.length - 1; i >= 0; i--) {
      let animal = flock.animals[i];
      if (animal instanceof Fish) {
        let d = P5.Vector.dist(this.position, animal.position);
        if (d < this.r + animal.r) {
          flock.removeAnimal(animal);
          this.fishEaten++;
          if (this.hunger > 0) {
            this.hunger -= 1;
          }
          this.upgrade();
        }
      }
    }
  }

  upgrade(): void {
    this.maxSpeed += 0.1;
    this.r += 0.1;
  }

  handleDuplicate(sharks: Shark[]) {
    if (this.fishEaten > 10 && !this.hasDublicated) {
      this.hasDublicated = true;
      const shark1 = new Shark(this.p5, this.debug, {
        x: this.position.x,
        y: this.position.y,
        maxSpeed: this.initialMaxSpeed,
        maxForce: this.initialMaxForce,
        r: this.initialR,
        color: this.initialColor,
      });
      const shark2 = new Shark(this.p5, this.debug, {
        x: this.position.x,
        y: this.position.y,
        maxSpeed: this.initialMaxSpeed,
        maxForce: this.initialMaxForce,
        r: this.initialR,
        color: this.initialColor,
      });
      const index = sharks.indexOf(this);
      sharks.splice(index, 1);
      sharks.push(shark1);
      sharks.push(shark2);
    }
  }

  handleHunger(sharks: Shark[]) {
    if (this.hunger > 10) {
      console.log('Shark died of hunger');

      const index = sharks.indexOf(this);
      sharks.splice(index, 1);
    }
  }

  findClosest(flock: Flock): FlockAnimal | undefined {
    let closest;
    let closestDistance = Infinity;

    for (const animal of flock.animals) {
      if (animal instanceof Fish) {
        const d = P5.Vector.dist(this.position, animal.position);
        if (d < closestDistance) {
          closest = animal;
          closestDistance = d;
        }
      }
    }
    return closest;
  }

  show(): void {
    let angle = this.velocity.heading();

    this.p5.push();
    this.p5.fill(this.color);
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

    if (this.debug) {
      this.p5.push();
      this.p5.fill(0, 0, 0);
      this.p5.textSize(16);
      this.p5.textAlign(this.p5.CENTER, this.p5.TOP);
      this.p5.text(
        `Fish eaten: ${this.fishEaten}/10`,
        this.position.x,
        this.position.y + this.r + 10,
      );
      if (this.hunger > 6) {
        this.p5.textSize(24);
        this.p5.fill(255, 0, 0);
      }
      this.p5.text(
        `Hunger: ${this.hunger}/10`,
        this.position.x,
        this.position.y + this.r + 30,
      );
      this.p5.pop();
    }
  }
}
