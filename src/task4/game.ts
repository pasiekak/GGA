import { P5Class } from '../p5class';
import P5 from 'p5';
import { Board } from './board';
import { Racquet } from './racquet';

export class Game extends P5Class {
  boards: Board[] = [];
  generation: number = 1;

  generationInterval: NodeJS.Timeout;
  counter: number = 0;
  generationTime: number = 20;

  constructor(p5: P5, debug: boolean) {
    super(p5, debug);

    for (let i = 0; i < 10; i++) {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
        16,
      )}`;
      this.boards.push(new Board(p5, false, randomColor));
    }

    this.generationInterval = setInterval(() => {
      this.counter += 1;
      if (this.boards.every((board) => !board.ball)) {
        this.nextGeneration();
      }
    }, 1000);
  }

  run() {
    this.boards.forEach((board) => board.run());
  }

  draw() {
    this.boards.forEach((board) => board.draw());
  }

  nextGeneration() {
    const bottomRacquets = [...this.boards.map((board) => board.bottomRacquet)];
    const topRacquets = [...this.boards.map((board) => board.topRacquet)];

    this.normalizeFitness(bottomRacquets);
    this.normalizeFitness(topRacquets);

    const colors = bottomRacquets.map((racquet) => racquet.color);
    const newBoards: Board[] = [];
    for (let i = 0; i < bottomRacquets.length; i++) {
      const { racquetA, racquetB } = this.pickParents(bottomRacquets);
      const newBrain = racquetA.brain.crossover(racquetB.brain);
      const newBottomRacquet = new Racquet(
        racquetA.p5,
        false,
        this.p5.width / 2,
        this.p5.height - 50,
        'BOTTOM',
        colors[i],
        newBrain,
      );

      const { racquetA: topRacquetA, racquetB: topRacquetB } =
        this.pickParents(topRacquets);
      const newTopBrain = topRacquetA.brain.crossover(topRacquetB.brain);
      const newTopRacquet = new Racquet(
        topRacquetA.p5,
        false,
        this.p5.width / 2,
        50,
        'TOP',
        colors[i],
        newTopBrain,
      );

      const color = colors[i];
      newBoards.push(
        new Board(racquetA.p5, false, color, newTopRacquet, newBottomRacquet),
      );
    }

    this.boards = newBoards;

    this.generation += 1;
  }

  normalizeFitness(racquets: Racquet[]) {
    const totalFitness = racquets.reduce(
      (acc, racquet) => acc + racquet.fitness,
      0,
    );

    racquets.forEach((racquet) => {
      racquet.fitness = racquet.fitness / totalFitness;
    });
  }

  pickParents(racquets: Racquet[]): { racquetA: Racquet; racquetB: Racquet } {
    const racquetA = this.spinTheWheel(racquets);
    const racquetB = this.spinTheWheel(racquets);

    return { racquetA, racquetB };
  }

  spinTheWheel(racquets: Racquet[]): Racquet {
    const rand = Math.random();

    let cumulative = 0;

    for (const racquet of racquets) {
      cumulative += racquet.fitness;

      if (cumulative >= rand) {
        return racquet;
      }
    }

    return racquets[racquets.length - 1];
  }
}
