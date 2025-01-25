import P5 from 'p5';
import { Ecosystem } from './ecosystem';
import { Bunny } from './bunny';
import { Food } from './food';

const BCK_COLOR = '#F4D793';

export const runTask3 = (p5: P5) => {
  let debug = false;
  let ecosystem: Ecosystem;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(BCK_COLOR);
    ecosystem = new Ecosystem(p5, debug);
  };

  p5.draw = () => {
    p5.background(BCK_COLOR);
    ecosystem.run();
    ecosystem.checkMouseOverBunny();
    drawInfo();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.keyPressed = () => {
    if (p5.key === 'f') {
      Food.debug = !Food.debug;
    }

    if (p5.key === 'b') {
      Bunny.debug = !Bunny.debug;
    }

    if (p5.key === 'm') {
      Ecosystem.ONLY_AGE_IS_IMPORTANT = !Ecosystem.ONLY_AGE_IS_IMPORTANT;
    }

    if (p5.key === '+') {
      ecosystem.addWolf();
    }

    if (p5.key === '-') {
      ecosystem.removeWolf();
    }
  };

  const drawInfo = () => {
    p5.push();
    p5.fill(0);
    p5.textSize(12);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text('Press B : Bunny debug mode', p5.width - 10, 10);
    p5.text('Press F : Food debug mode', p5.width - 10, 30);
    p5.text(
      'Press M : Change new generation fitness function',
      p5.width - 10,
      50,
    );
    p5.pop();
  };
};
