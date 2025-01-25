import { Bunny, BunnyState } from './bunny';
import { Ecosystem } from './ecosystem';

export class GenerationHelper {
  static newGeneration(population: Bunny[]): Bunny[] {
    const newPopulation: Bunny[] = [];

    GenerationHelper.fitness(population);
    GenerationHelper.normalizeFitness(population);
    for (let i = 0; i < population.length; i++) {
      const { parentA, parentB } = GenerationHelper.pickParents(population);
      const child = GenerationHelper.crossover(parentA, parentB);
      GenerationHelper.mutate(child);
      newPopulation.push(child);
    }
    return newPopulation;
  }

  static fitness(generation: Bunny[]) {
    for (const bunny of generation) {
      bunny.calculateFitness();
    }
  }

  static normalizeFitness(population: Bunny[]): void {
    const totalFitness = population.reduce(
      (acc, bunny) => acc + bunny.fitness,
      0,
    );

    population.forEach((bunny) => {
      bunny.fitness /= totalFitness;
    });
  }

  static pickParents(population: Bunny[]): { parentA: Bunny; parentB: Bunny } {
    const parentA = GenerationHelper.spinTheWheel(population);
    const parentB = GenerationHelper.spinTheWheel(population);

    return { parentA, parentB };
  }

  static spinTheWheel(population: Bunny[]): Bunny {
    // Losujemy liczbę z zakresu 0 do 1
    const rand = Math.random();

    // Tworzymy zmienną pomocniczą do śledzenia sumy znormalizowanych fitnessów
    let cumulative = 0;

    // Iterujemy przez populację
    for (const bunny of population) {
      cumulative += bunny.fitness; // Dodajemy znormalizowaną wartość fitness królika

      // Jeśli suma przekracza wylosowaną wartość, zwracamy tego królika
      if (cumulative >= rand) {
        return bunny;
      }
    }
    console.log('RARE CASE');

    // W rzadkim przypadku (np. błędy zaokrągleń), zwracamy ostatniego królika
    return population[population.length - 1];
  }

  static crossover(parentA: Bunny, parentB: Bunny): Bunny {
    const child = new Bunny(parentA.p5, parentA.debug);
    child.maxSpeed = Math.random() > 0.5 ? parentA.maxSpeed : parentB.maxSpeed;
    child.maxForce = Math.random() > 0.5 ? parentA.maxForce : parentB.maxForce;
    child.vision = Math.random() > 0.5 ? parentA.vision : parentB.vision;
    child.age = 0;
    child.fitness = 0;
    child.state = BunnyState.IDLE;
    return child;
  }

  static mutate(child: Bunny): void {
    if (Math.random() < Ecosystem.MUTATION_RATE) {
      child.maxSpeed += Math.random() > 0.5 ? 0.1 : -0.1;
    }

    if (Math.random() < Ecosystem.MUTATION_RATE) {
      child.maxForce += Math.random() > 0.5 ? 0.1 : -0.1;
    }

    if (Math.random() < Ecosystem.MUTATION_RATE) {
      child.vision += Math.random() > 0.5 ? 0.1 : -0.1;
    }
  }
}
