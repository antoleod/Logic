export type ExerciseType =
  | 'sum'
  | 'subtract'
  | 'comparison'
  | 'decomposition'
  | 'series'
  | 'intruder'
  | 'wordProblem'
  | 'logicMatch'
  | 'pattern'
  | 'thinkNumber';

export type Exercise = {
  id: number;
  type: ExerciseType;
  prompt: string;
  answer: string | string[];
  placeholder?: string;
};

export type Level = {
  id: number;
  title: string;
  exercises: Exercise[];
};

export const levels: Level[] = [
  {
    id: 1,
    title: 'Nivel 1',
    exercises: [
      { id: 1, type: 'sum', prompt: '8 + 7 =', answer: '15', placeholder: 'Respuesta' },
      { id: 2, type: 'subtract', prompt: '14 - 5 =', answer: '9', placeholder: 'Respuesta' },
      { id: 3, type: 'comparison', prompt: '20 ___ 18', answer: '>' },
      { id: 4, type: 'decomposition', prompt: '26 + 6 = 26 + 4 + 2 =', answer: '32', placeholder: 'Respuesta' },
      { id: 5, type: 'series', prompt: '2, 4, 6, __, __', answer: ['8', '10'] },
      { id: 6, type: 'intruder', prompt: 'Intruso: 5, 10, 15, 18, 20', answer: '18', placeholder: 'Número intruso' },
      { id: 7, type: 'sum', prompt: '30 + 10 =', answer: '40', placeholder: 'Respuesta' },
      { id: 8, type: 'wordProblem', prompt: 'Ana tiene 9 canicas y gana 3.', answer: '12', placeholder: '¿Cuántas tiene?' },
      { id: 9, type: 'logicMatch', prompt: '3+3?6 ; 5+5?', answer: '10', placeholder: 'Respuesta' },
      { id: 10, type: 'comparison', prompt: '11 ___ 11', answer: '=' },
    ],
  },
  {
    id: 2,
    title: 'Nivel 2',
    exercises: [
      { id: 1, type: 'sum', prompt: '17 + 9 =', answer: '26', placeholder: 'Respuesta' },
      { id: 2, type: 'subtract', prompt: '32 - 14 =', answer: '18', placeholder: 'Respuesta' },
      { id: 3, type: 'comparison', prompt: '45 ___ 54', answer: '<' },
      { id: 4, type: 'decomposition', prompt: '48 + 7 = 48 + 2 + 5 =', answer: '55', placeholder: 'Respuesta' },
      { id: 5, type: 'series', prompt: '10, 20, 30, __, __', answer: ['40', '50'] },
      { id: 6, type: 'intruder', prompt: 'Intruso: 12, 24, 36, 39, 48', answer: '39', placeholder: 'Número intruso' },
      { id: 7, type: 'subtract', prompt: '60 - 20 =', answer: '40', placeholder: 'Respuesta' },
      { id: 8, type: 'wordProblem', prompt: 'Luis tiene 25 cromos y pierde 7.', answer: '18', placeholder: '¿Cuántos quedan?' },
      { id: 9, type: 'logicMatch', prompt: '2?4 ; 6?', answer: '12', placeholder: 'Respuesta' },
      { id: 10, type: 'pattern', prompt: 'Cuadrado, círculo, cuadrado, círculo, __', answer: 'cuadrado', placeholder: 'Palabra' },
    ],
  },
  {
    id: 3,
    title: 'Nivel 3',
    exercises: [
      { id: 1, type: 'sum', prompt: '46 + 18 =', answer: '64', placeholder: 'Respuesta' },
      { id: 2, type: 'subtract', prompt: '80 - 27 =', answer: '53', placeholder: 'Respuesta' },
      { id: 3, type: 'comparison', prompt: '67 ___ 67', answer: '=' },
      { id: 4, type: 'decomposition', prompt: '73 + 9 = 73 + 7 + 2 =', answer: '82', placeholder: 'Respuesta' },
      { id: 5, type: 'series', prompt: '100, 90, 80, __, __', answer: ['70', '60'] },
      { id: 6, type: 'intruder', prompt: 'Intruso: 8, 16, 24, 25, 32', answer: '25', placeholder: 'Número intruso' },
      { id: 7, type: 'sum', prompt: '45 + 15 =', answer: '60', placeholder: 'Respuesta' },
      { id: 8, type: 'wordProblem', prompt: 'Hay 50 lápices, usan 16.', answer: '34', placeholder: '¿Cuántos quedan?' },
      { id: 9, type: 'logicMatch', prompt: '10?20 ; 12?24 ; 15?', answer: '30', placeholder: 'Respuesta' },
      { id: 10, type: 'thinkNumber', prompt: 'Pienso un número, +10 = 52. Número:', answer: '42', placeholder: 'Número' },
    ],
  },
  {
    id: 4,
    title: 'Nivel 4',
    exercises: [
      { id: 1, type: 'sum', prompt: '78 + 24 =', answer: '102', placeholder: 'Respuesta' },
      { id: 2, type: 'subtract', prompt: '120 - 39 =', answer: '81', placeholder: 'Respuesta' },
      { id: 3, type: 'comparison', prompt: '109 ___ 101', answer: '>' },
      { id: 4, type: 'decomposition', prompt: '96 + 8 = 96 + 4 + 4 =', answer: '104', placeholder: 'Respuesta' },
      { id: 5, type: 'series', prompt: '40, 50, 60, __, __', answer: ['70', '80'] },
      { id: 6, type: 'intruder', prompt: 'Intruso: 21, 42, 63, 64, 84', answer: '64', placeholder: 'Número intruso' },
      { id: 7, type: 'sum', prompt: '70 + 20 - 10 =', answer: '80', placeholder: 'Respuesta' },
      { id: 8, type: 'wordProblem', prompt: 'Marta leyó 35 páginas y luego 27.', answer: '62', placeholder: '¿Total?' },
      { id: 9, type: 'logicMatch', prompt: '7?21 ; 9?', answer: '27', placeholder: 'Respuesta' },
      { id: 10, type: 'series', prompt: '55, 60, __, 70, 75', answer: ['65'], placeholder: 'Número faltante' },
    ],
  },
  {
    id: 5,
    title: 'Nivel 5',
    exercises: [
      { id: 1, type: 'sum', prompt: '89 + 27 =', answer: '116', placeholder: 'Respuesta' },
      { id: 2, type: 'subtract', prompt: '118 - 46 =', answer: '72', placeholder: 'Respuesta' },
      { id: 3, type: 'comparison', prompt: '115 ___ 119', answer: '<' },
      { id: 4, type: 'decomposition', prompt: '98 + 7 = 98 + 2 + 5 =', answer: '105', placeholder: 'Respuesta' },
      { id: 5, type: 'series', prompt: '120, 110, 100, __, __', answer: ['90', '80'] },
      { id: 6, type: 'intruder', prompt: 'Intruso: 11, 22, 33, 34, 44', answer: '34', placeholder: 'Número intruso' },
      { id: 7, type: 'sum', prompt: '50 + 50 + 20 =', answer: '120', placeholder: 'Respuesta' },
      { id: 8, type: 'wordProblem', prompt: 'En una tienda venden 45 caramelos por la mañana y 38 por la tarde.', answer: '83', placeholder: '¿Total?' },
      { id: 9, type: 'logicMatch', prompt: '4?16 ; 5?25 ; 6?', answer: '36', placeholder: 'Respuesta' },
      { id: 10, type: 'thinkNumber', prompt: 'Pienso un número, -25 = 70. Número:', answer: '95', placeholder: 'Número' },
    ],
  },
];
