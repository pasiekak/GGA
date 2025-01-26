import P5 from 'p5';
import { Game } from './game';

export const runTask4 = (p5: P5) => {
  const BCK_COLOR = '#D2FDFF';
  let game: Game;
  let timeSlider: P5.Element;

  p5.setup = () => {
    timeSlider = p5.createSlider(1, 20, 1);
    timeSlider.position(p5.width - 100, p5.height - 20);
    p5.createCanvas(p5.windowHeight, p5.windowHeight);
    p5.background(BCK_COLOR);
    game = new Game(p5, false);
  };

  p5.draw = () => {
    p5.background(BCK_COLOR);
    p5.textSize(20);
    p5.fill(0);
    p5.text(`Generation: ${game.generation}`, p5.width / 2, 20);
    p5.text(`Time: ${game.counter} s`, p5.width / 2, p5.height - 10);
    const highestFittness = game.boards.reduce((acc, board) => {
      let bestTopFitness =
        board.topRacquet.fitness > acc ? board.topRacquet.fitness : acc;
      let bestBottomFitness =
        board.bottomRacquet.fitness > acc ? board.bottomRacquet.fitness : acc;
      return bestTopFitness > bestBottomFitness
        ? bestTopFitness
        : bestBottomFitness;
    }, 0);
    p5.text(`Highest fitness: ${highestFittness}`, p5.width - 200, 20);
    for (let i = 0; i < Number(timeSlider.value()); i++) {
      game.run();
    }
    game.draw();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
};
