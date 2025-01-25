import P5 from 'p5';
import { runTask1 } from './task1/index';
import { runTask2 } from './task2/index';
import { runTask3 } from './task3/index';
import { runTask4 } from './task4/index';

let currentSketch: P5 | null = null;

const task1Button = document.getElementById('task1');
const task2Button = document.getElementById('task2');
const task3Button = document.getElementById('task3');
const task4Button = document.getElementById('task4');
const tasksButtons = [task1Button, task2Button, task3Button, task4Button];

// Funkcja do uruchamiania zadania
const startTask = (task: (p5: P5) => void, taskId: string) => {
  // Jeśli istnieje poprzedni sketch, usuń go
  if (currentSketch) {
    currentSketch.remove();
  }

  // Uruchom nowe zadanie
  currentSketch = new P5(task);

  for (const button of tasksButtons) {
    if (button) {
      button.className = '';
    }
    if (button?.id === taskId) {
      button.className = 'active';
    }
  }
};

// Obsługa przycisków
document
  .getElementById('task1')
  ?.addEventListener('click', () => startTask(runTask1, 'task1'));
document
  .getElementById('task2')
  ?.addEventListener('click', () => startTask(runTask2, 'task2'));
document
  .getElementById('task3')
  ?.addEventListener('click', () => startTask(runTask3, 'task3'));
document
  .getElementById('task4')
  ?.addEventListener('click', () => startTask(runTask4, 'task4'));

startTask(runTask4, 'task4');
