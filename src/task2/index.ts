import P5 from 'p5';
import { World } from './world';

export const runTask2 = (p5: P5) => {
  let world: World;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(50);
    const cols = 16;
    const tileSize = Math.floor(p5.height / cols);
    const offsetX = Math.floor((p5.width - cols * tileSize) / 2);
    const offsetY = Math.floor((p5.height - cols * tileSize) / 2);

    world = new World(p5, false, cols, offsetX, offsetY);

    setInterval(() => {
      for (let i = 0; i < world.size; i++) {
        for (let j = 0; j < world.size; j++) {
          world.area[i][j].run();
          world.area[i][j]?.sheep?.run();
        }
      }
    }, 250);
  };

  p5.draw = () => {
    p5.background(50);
    p5.frameRate(60);

    world.show();

    world.showLegend();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
};
