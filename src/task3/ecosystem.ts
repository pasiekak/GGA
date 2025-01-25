import { P5Class } from '../p5class';
import P5 from 'p5';
import { Food } from './food';
import { Bunny } from './bunny';
import { GenerationHelper } from './generation-helper';
import { Wolf } from './wolf';

export class Ecosystem extends P5Class {
  static INIT_FOOD = 200;
  static INIT_BUNNY = 100;
  static INIT_WOLF = 3;
  static FOOD_GENERATOR_INTERVAL = 500; // ms
  static BUNNY_HUNGER_INTERVAL = 150; // ms
  static BUNNY_MIN_VISION = 25;
  static BUNNY_MAX_VISION = 150;
  static BUNNY_MAX_SPEED = 1.5;
  static BUNNY_MAX_FORCE = 0.3;
  static BUNNY_MIN_SPEED = 0.5;
  static BUNNY_MIN_FORCE = 0.1;
  static GENERATION_TIME = 30;
  static MUTATION_RATE = 0.05;
  static ONLY_AGE_IS_IMPORTANT = true;
  static WOLF_VISION = 100;

  static food: Food[] = [];
  static bunnyPopulation: Bunny[] = [];
  static wolfPopulation: Wolf[] = [];

  static avgBunnyAge: number = 0;
  static avgBunnyMaxSpeed: number = 0;
  static avgBunnyMaxForce: number = 0;
  static avgBunnyVision: number = 0;
  static survivalRate: number = 0;

  countTime: number = 0;
  generation: number = 1;
  generationInterval: number;

  initAvgBunnyAge: number = 0;
  initAvgBunnyMaxSpeed: number = 0;
  initAvgBunnyMaxForce: number = 0;
  initAvgBunnyVision: number = 0;
  initAvgBunnySurvivalRate: number = 0;

  constructor(p5: P5, debug: boolean) {
    super(p5, debug);
    this.initEcosystem();

    // Init generation
    this.generationInterval = setInterval(() => {
      this.countTime += 1;
      if (this.countTime >= Ecosystem.GENERATION_TIME) {
        this.countTime = 0;
        this.initNewGeneration();
      }
    }, 1000);
  }

  initEcosystem() {
    // INIT ALL
    this.initFood();
    this.initBunnyPopulation();
    this.initWolfPopulation();
    this.calculateInitBunnyStats(Ecosystem.bunnyPopulation);

    // Init generator
    setInterval(() => {
      Ecosystem.food.push(new Food(this.p5, this.debug));
    }, Ecosystem.FOOD_GENERATOR_INTERVAL);
  }

  initNewGeneration() {
    if (this.generation === 1) {
      this.initAvgBunnyAge =
        Ecosystem.bunnyPopulation.reduce((acc, bunny) => acc + bunny.age, 0) /
        Ecosystem.bunnyPopulation.length;
    }
    const oldBunnyPopulation = [...Ecosystem.bunnyPopulation];
    this.calculateAverageBunnyStats(oldBunnyPopulation);
    this.clearEcosystem();
    Ecosystem.bunnyPopulation =
      GenerationHelper.newGeneration(oldBunnyPopulation);
    this.initFood();

    this.countTime = 0;
    this.generation += 1;
  }

  clearEcosystem() {
    Ecosystem.food = [];
    Ecosystem.bunnyPopulation = [];
  }

  calculateInitBunnyStats(bunnyPopulation: Bunny[]) {
    this.initAvgBunnyMaxSpeed =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.maxSpeed, 0) /
      bunnyPopulation.length;
    this.initAvgBunnyMaxForce =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.maxForce, 0) /
      bunnyPopulation.length;
    this.initAvgBunnyVision =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.vision, 0) /
      bunnyPopulation.length;
  }
  calculateAverageBunnyStats(bunnyPopulation: Bunny[]) {
    Ecosystem.survivalRate =
      bunnyPopulation.filter((bunny) => bunny.state !== 'dead').length /
      Ecosystem.INIT_BUNNY;
    Ecosystem.avgBunnyAge =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.age, 0) /
      bunnyPopulation.length;
    Ecosystem.avgBunnyMaxSpeed =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.maxSpeed, 0) /
      bunnyPopulation.length;
    Ecosystem.avgBunnyMaxForce =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.maxForce, 0) /
      bunnyPopulation.length;
    Ecosystem.avgBunnyVision =
      bunnyPopulation.reduce((acc, bunny) => acc + bunny.vision, 0) /
      bunnyPopulation.length;
  }

  run() {
    Ecosystem.food.forEach((f) => {
      f.run();
    });
    Ecosystem.bunnyPopulation.forEach((b) => {
      b.run();
    });
    Ecosystem.wolfPopulation.forEach((w) => {
      w.run();
    });

    this.drawTime();
  }

  // Inits
  initFood() {
    for (let i = 0; i < Ecosystem.INIT_FOOD; i++) {
      Ecosystem.food.push(new Food(this.p5, this.debug));
    }
  }

  initBunnyPopulation() {
    for (let i = 0; i < Ecosystem.INIT_BUNNY; i++) {
      Ecosystem.bunnyPopulation.push(new Bunny(this.p5, this.debug));
    }
  }

  initWolfPopulation() {
    for (let i = 0; i < Ecosystem.INIT_WOLF; i++) {
      Ecosystem.wolfPopulation.push(new Wolf(this.p5, this.debug));
    }
  }

  // Removals
  static removeFood(food: Food) {
    Ecosystem.food = Ecosystem.food.filter((f) => f !== food);
  }

  checkMouseOverBunny() {
    const mouseX = this.p5.mouseX;
    const mouseY = this.p5.mouseY;

    for (let bunny of Ecosystem.bunnyPopulation) {
      const d = this.p5.dist(
        mouseX,
        mouseY,
        bunny.position.x,
        bunny.position.y,
      );
      if (d < bunny.r) {
        bunny.debug = true;
      } else {
        bunny.debug = false;
      }
    }
  }

  addWolf() {
    Ecosystem.wolfPopulation.push(new Wolf(this.p5, this.debug));
  }

  removeWolf() {
    Ecosystem.wolfPopulation.pop();
  }

  drawTime() {
    this.p5.push();
    this.p5.fill(0);
    this.p5.textSize(16);
    this.p5.textAlign(this.p5.RIGHT, this.p5.TOP);
    this.p5.text(
      `Time to next generation: ${Ecosystem.GENERATION_TIME - this.countTime}s`,
      this.p5.width - 10,
      70,
    );
    this.p5.text(`Generation: ${this.generation}`, this.p5.width - 10, 90);
    this.p5.text(
      `Survival rate: ${(Ecosystem.survivalRate * 100).toFixed(2)}%`,
      this.p5.width - 10,
      110,
    );

    this.p5.text(
      `Population: ${Ecosystem.bunnyPopulation.length}`,
      this.p5.width - 10,
      130,
    );

    this.p5.text(
      `Current fitness function: ${
        Ecosystem.ONLY_AGE_IS_IMPORTANT ? 'Only age' : 'All stats are important'
      }`,
      this.p5.width - 10,
      150,
    );

    this.p5.textAlign(this.p5.LEFT, this.p5.BOTTOM);
    this.p5.text(
      `Average age: ${Ecosystem.avgBunnyAge.toFixed(2)}`,
      10,
      this.p5.height - 10,
    );
    this.p5.text(
      `Average max speed: ${Ecosystem.avgBunnyMaxSpeed.toFixed(2)}`,
      10,
      this.p5.height - 30,
    );
    this.p5.text(
      `Average max force: ${Ecosystem.avgBunnyMaxForce.toFixed(2)}`,
      10,
      this.p5.height - 50,
    );
    this.p5.text(
      `Average vision: ${Ecosystem.avgBunnyVision.toFixed(2)}`,
      10,
      this.p5.height - 70,
    );

    this.p5.textAlign(this.p5.RIGHT, this.p5.BOTTOM);
    this.p5.text(
      `Init average age: ${this.initAvgBunnyAge.toFixed(2)}`,
      this.p5.width - 10,
      this.p5.height - 10,
    );
    this.p5.text(
      `Init average max speed: ${this.initAvgBunnyMaxSpeed.toFixed(2)}`,
      this.p5.width - 10,
      this.p5.height - 30,
    );
    this.p5.text(
      `Init average max force: ${this.initAvgBunnyMaxForce.toFixed(2)}`,
      this.p5.width - 10,
      this.p5.height - 50,
    );
    this.p5.text(
      `Init average vision: ${this.initAvgBunnyVision.toFixed(2)}`,
      this.p5.width - 10,
      this.p5.height - 70,
    );

    this.p5.pop();
  }
}
