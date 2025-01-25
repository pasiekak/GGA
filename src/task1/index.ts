import P5 from 'p5';
import { Flock } from './flock';
import { Shark } from './shark';
import { Fish } from './fish';
import { FlowField } from './flow-field';

const NO_SHARKS = 3;
const NO_FISH_PER_FLOCK = 100;

export const runTask1 = (p5: P5) => {
  let debug = false;
  let fishFlock: Flock;
  let sharks: Shark[];
  let fishes: Fish[];
  let flowField: FlowField;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(209, 244, 243);

    fishes = [];
    sharks = [];

    // Create flow field
    flowField = new FlowField(p5, debug, 20);

    // Create flocks
    fishFlock = new Flock(p5, debug);

    // Add fish to flocks
    for (let j = 0; j < NO_FISH_PER_FLOCK; j++) {
      const fish = new Fish(p5, debug, {
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        maxSpeed: 2,
        maxForce: 0.1,
        r: 4,
        color: p5.color(0, 255, 0),
      });
      fishes.push(fish);
      fishFlock.addAnimal(fish);
    }

    // Add sharks
    for (let i = 0; i < NO_SHARKS; i++) {
      const shark = new Shark(p5, debug, {
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        maxSpeed: 1,
        maxForce: 0.05,
        r: 6,
        color: p5.color(0, 0, 0),
      });
      sharks.push(shark);
    }

    setInterval(() => {
      const fish = new Fish(p5, debug, {
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        maxSpeed: 2,
        maxForce: 0.1,
        r: 4,
        color: p5.color(0, 255, 0),
      });
      fishes.push(fish);
      fishFlock.addAnimal(fish);
    }, 100);

    setInterval(() => {
      flowField = new FlowField(p5, debug, 20);
    }, 5000);

    // Add new shark if all of them died
    setInterval(() => {
      if (sharks.length === 0) {
        const shark = new Shark(p5, debug, {
          x: p5.random(p5.width),
          y: p5.random(p5.height),
          maxSpeed: 1,
          maxForce: 0.05,
          r: 6,
          color: p5.color(0, 0, 0),
        });
        sharks.push(shark);
      }
    }, 10000);
  };

  p5.draw = () => {
    p5.background(209, 244, 243);

    // Run flocks
    fishFlock.run(flowField);

    // Run sharks
    for (let shark of sharks) {
      shark.run(fishFlock);
      shark.handleDuplicate(sharks);
      shark.handleHunger(sharks);
    }

    p5.push();
    p5.fill(0);
    p5.noStroke();
    p5.textSize(16);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text(`Turn on/off debug: SPACE`, p5.width - 10, 10);
    p5.text(`Press R to reset`, p5.width - 10, 30);
    p5.text(`Number of sharks: ${sharks.length}`, p5.width - 10, 50);
    p5.text(`Number of fish: ${fishFlock.animals.length}`, p5.width - 10, 70);
    p5.pop();

    // Rysowanie wykresu kołowego w prawym dolnym rogu
    const total = sharks.length + fishFlock.animals.length;
    const sharkAngle = p5.TWO_PI * (sharks.length / total);
    const fishAngle = p5.TWO_PI * (fishFlock.animals.length / total);

    const pieX = p5.width - 100;
    const pieY = p5.height - 100;
    const pieRadius = 50;

    p5.fill(0, 255, 0);
    p5.arc(pieX, pieY, pieRadius * 2, pieRadius * 2, 0, fishAngle, p5.PIE);

    p5.fill(0, 0, 0);
    p5.arc(
      pieX,
      pieY,
      pieRadius * 2,
      pieRadius * 2,
      fishAngle,
      fishAngle + sharkAngle,
      p5.PIE,
    );
    p5.fill(0);
    p5.textSize(12);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text(`Sharks: ${sharks.length}`, pieX, pieY - pieRadius - 10);
    p5.text(`Fish: ${fishFlock.animals.length}`, pieX, pieY + pieRadius + 10);

    flowField.show();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.keyPressed = () => {
    if (p5.key === ' ') {
      debug = !debug;

      flowField.setDebug(debug);

      for (let shark of sharks) {
        shark.setDebug(debug);
      }

      for (let fish of fishes) {
        fish.setDebug(debug);
      }

      fishFlock.setDebug(debug);
    }

    if (p5.key === 'r') {
      p5.setup();
    }
  };
};
