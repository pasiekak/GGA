import { P5Class } from '../p5class';
import P5 from 'p5';
import { Food } from './food';
import { Ecosystem } from './ecosystem';
import { Wolf } from './wolf';

export enum BunnyState {
  IDLE = 'idle',
  HUNGRY = 'hungry',
  VERY_HUNGRY = 'very_hungry',
  ESCAPE = 'escape',
  DEAD = 'dead',
}

export class Bunny extends P5Class {
  static debug: boolean = false;

  state: BunnyState = BunnyState.IDLE;
  vision: number;
  age: number = 0;
  hunger: number;
  fitness: number = 0;

  position: P5.Vector;
  r: number = 8;
  maxSpeed: number;
  maxForce: number;
  velocity: P5.Vector;
  acceleration: P5.Vector;

  huntedBy: Wolf | null = null;

  hungryInterval: NodeJS.Timeout;
  ageInterval: NodeJS.Timeout;

  constructor(p5: P5, debug: boolean) {
    super(p5, debug);
    this.hunger = 0;
    this.position = p5.createVector(p5.random(p5.width), p5.random(p5.height));
    this.maxSpeed = p5.random(
      Ecosystem.BUNNY_MIN_SPEED,
      Ecosystem.BUNNY_MAX_SPEED,
    );
    this.maxForce = p5.random(
      Ecosystem.BUNNY_MIN_FORCE,
      Ecosystem.BUNNY_MAX_FORCE,
    );
    this.velocity = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.acceleration = p5.createVector(2, 0);
    this.vision = Math.floor(
      p5.random(Ecosystem.BUNNY_MIN_VISION, Ecosystem.BUNNY_MAX_VISION),
    );

    this.hungryInterval = setInterval(() => {
      this.hunger += 1;

      if (this.state !== BunnyState.ESCAPE) {
        if (this.state === BunnyState.IDLE && this.hunger >= 50) {
          this.state = BunnyState.HUNGRY;
        }
        if (
          (this.state === BunnyState.HUNGRY ||
            this.state === BunnyState.IDLE) &&
          this.hunger >= 75
        ) {
          this.state = BunnyState.VERY_HUNGRY;
        }
      }

      if (this.hunger >= 100) {
        this.state = BunnyState.DEAD;
      }
    }, Ecosystem.BUNNY_HUNGER_INTERVAL);

    this.ageInterval = setInterval(() => {
      this.age += 1;
    }, 1000);
  }

  run() {
    this.scanForWolfes();
    this.move();
    this.borders();
    this.draw();
  }

  draw() {
    this.p5.push();

    this.p5.translate(this.position.x, this.position.y);

    if (Bunny.debug || this.debug) {
      this.p5.fill(0);
      this.p5.textSize(12);
      this.p5.text(
        `BUNNY
        H: ${this.hunger}/100
        AGE: ${this.age}
        Vision: ${this.vision}
        MaxSpeed: ${this.maxSpeed.toFixed(2)}
        MaxForce: ${this.maxForce.toFixed(2)}
        State: ${this.state}`,
        this.r + 5,
        0,
      );
    }

    let angle = this.velocity.heading();
    this.p5.rotate(angle);

    this.p5.fill(255, 255, 255);
    if (this.state === BunnyState.DEAD) {
      this.p5.fill(0, 0, 0, 50);
    }
    this.p5.ellipse(0, 0, this.r * 2, this.r);

    this.p5.stroke(0);
    this.p5.line(0, 0, this.r * 2, 0);

    this.p5.pop();
  }

  // Moving behaviours
  move() {
    if (this.state === BunnyState.IDLE) {
      this.idle();
    } else if (
      this.state === BunnyState.HUNGRY ||
      this.state === BunnyState.VERY_HUNGRY
    ) {
      this.hungry();
    } else if (this.state === BunnyState.ESCAPE) {
      this.escape();
    } else if (this.state === BunnyState.DEAD) {
      clearInterval(this.hungryInterval);
      clearInterval(this.ageInterval);
    }
  }

  idle() {
    let currentSpeed = this.useSpeed(this.state);
    let currentDirection = this.velocity.copy();
    currentDirection.normalize();

    let angleVariation = this.p5.random(-Math.PI / 12, Math.PI / 12);
    currentDirection.rotate(angleVariation);
    currentDirection.setMag(currentSpeed);

    this.velocity = currentDirection;
    this.update();
  }

  escape() {
    if (this.huntedBy) {
      // Oblicz kierunek przeciwny do drapieżnika
      const oppositeDirection = P5.Vector.sub(
        this.position,
        this.huntedBy.position,
      );

      // Normalizuj wektor i zwiększ jego długość, aby wskazywał "daleki" punkt ucieczki
      oppositeDirection.normalize();
      oppositeDirection.mult(this.vision * 2); // Możesz zmienić mnożnik na inną odległość

      // Oblicz punkt docelowy
      const escapeTarget = P5.Vector.add(this.position, oppositeDirection);

      // Podążaj w stronę punktu docelowego
      const seekForce = this.seek(escapeTarget);
      this.applyForce(seekForce);
      this.update();
    }
  }

  scanForWolfes(): void {
    if (this.state === BunnyState.DEAD) {
      return;
    }
    const wolfes = Ecosystem.wolfPopulation;
    const wolfInRange = wolfes.filter((wolf) => {
      return this.position.dist(wolf.position) < this.vision;
    });
    if (wolfInRange.length > 0) {
      const closestWolf = wolfInRange.reduce((prev, curr) => {
        return this.position.dist(prev.position) <
          this.position.dist(curr.position)
          ? prev
          : curr;
      });

      this.state = BunnyState.ESCAPE;
      this.huntedBy = closestWolf;
    } else {
      if (this.state === BunnyState.ESCAPE) {
        this.state = BunnyState.IDLE;
        this.huntedBy = null;
      }
    }
  }

  hungry() {
    let closestFood = this.findBestFood();

    if (closestFood) {
      let seekForce = this.seek(closestFood.position);
      this.applyForce(seekForce);
      this.update();

      if (this.position.dist(closestFood.position) < 5) {
        const valueToEat =
          closestFood.value > this.hunger ? this.hunger : closestFood.value;
        this.hunger -= valueToEat;
        closestFood.value -= valueToEat;

        if (this.hunger < 50) {
          this.state = BunnyState.IDLE;
        }
      }
    } else {
      this.velocity.setMag(this.useSpeed(this.state));
      this.idle();
    }
  }

  findBestFood(): Food | null {
    const foodInRange = Ecosystem.food.filter((food) => {
      return this.position.dist(food.position) < this.vision;
    });

    if (foodInRange.length === 0) {
      return null;
    }

    const bestFood = foodInRange.reduce((prev, curr) => {
      return prev.value > curr.value ? prev : curr;
    });

    return bestFood;
  }

  eat(food: Food): void {
    this.hunger = 0;
    food.downsize();
    this.state = BunnyState.IDLE;
  }

  update(): void {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.useSpeed(this.state));
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  useSpeed(state: BunnyState): number {
    switch (state) {
      case BunnyState.IDLE:
        return this.maxSpeed * 0.2;
      case BunnyState.HUNGRY:
        return this.maxSpeed * 0.7;
      case BunnyState.VERY_HUNGRY:
        return this.maxSpeed;
      case BunnyState.ESCAPE:
        return this.maxSpeed;
      default:
        return this.maxSpeed * 0.2;
    }
  }

  applyForce(force: P5.Vector): void {
    this.acceleration.add(force);
  }

  seek(target: P5.Vector): P5.Vector {
    let desired = P5.Vector.sub(target, this.position);

    desired.normalize();
    desired.mult(this.useSpeed(this.state));

    let steer = P5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }

  borders(): void {
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

  calculateFitness(): number {
    if (Ecosystem.ONLY_AGE_IS_IMPORTANT) {
      this.fitness = this.age;
      return this.age;
    }
    // Jeśli królik jest martwy, jego fitness wynosi 0
    if (this.state === BunnyState.DEAD) {
      return 0;
    }

    // Wagi dla poszczególnych parametrów
    const weights = {
      vision: 1.5, // Widoczność - duży wpływ
      age: 1.2, // Wiek - umiarkowany wpływ
      maxSpeed: 1.8, // Prędkość - istotny wpływ
      maxForce: 1.3, // Siła - mniejszy wpływ
    };

    // Obliczenie wartości fitness jako ważonej sumy parametrów
    const fitnessValue =
      weights.vision * this.vision +
      weights.age * this.age +
      weights.maxSpeed * this.maxSpeed +
      weights.maxForce * this.maxForce;

    this.fitness = fitnessValue;

    return fitnessValue;
  }
}
