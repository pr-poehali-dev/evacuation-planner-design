import { Floor } from '@/pages/Index';

export const floorTemplates: { name: string; description: string; floors: Floor[] }[] = [
  {
    name: 'Офисное здание (2 этажа)',
    description: 'Типовой офис с открытой планировкой и двумя лестницами',
    floors: [
      {
        id: 1,
        walls: [
          { x1: 100, y1: 100, x2: 900, y2: 100 },
          { x1: 900, y1: 100, x2: 900, y2: 600 },
          { x1: 900, y1: 600, x2: 100, y2: 600 },
          { x1: 100, y1: 600, x2: 100, y2: 100 },
          { x1: 300, y1: 100, x2: 300, y2: 300 },
          { x1: 700, y1: 100, x2: 700, y2: 300 },
          { x1: 300, y1: 400, x2: 300, y2: 600 },
          { x1: 700, y1: 400, x2: 700, y2: 600 },
        ],
        doors: [
          { id: 'door-1', x: 500, y: 100, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-2', x: 300, y: 350, width: 60, capacity: 2, orientation: 'vertical', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-3', x: 700, y: 350, width: 60, capacity: 2, orientation: 'vertical', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 500, y: 50, floor: 1, type: 'exit' },
          { x: 80, y: 350, floor: 1, type: 'exit' },
          { x: 920, y: 350, floor: 1, type: 'exit' },
          { x: 180, y: 200, floor: 1, type: 'stairs' },
          { x: 820, y: 200, floor: 1, type: 'stairs' },
        ],
      },
      {
        id: 2,
        walls: [
          { x1: 100, y1: 100, x2: 900, y2: 100 },
          { x1: 900, y1: 100, x2: 900, y2: 600 },
          { x1: 900, y1: 600, x2: 100, y2: 600 },
          { x1: 100, y1: 600, x2: 100, y2: 100 },
          { x1: 500, y1: 100, x2: 500, y2: 600 },
        ],
        doors: [
          { id: 'door-4', x: 500, y: 350, width: 60, capacity: 2, orientation: 'vertical', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 180, y: 200, floor: 2, type: 'stairs' },
          { x: 820, y: 200, floor: 2, type: 'stairs' },
        ],
      },
    ],
  },
  {
    name: 'Торговый центр (1 этаж)',
    description: 'Большое пространство с несколькими выходами и широкими проходами',
    floors: [
      {
        id: 1,
        walls: [
          { x1: 50, y1: 50, x2: 950, y2: 50 },
          { x1: 950, y1: 50, x2: 950, y2: 650 },
          { x1: 950, y1: 650, x2: 50, y2: 650 },
          { x1: 50, y1: 650, x2: 50, y2: 50 },
          { x1: 350, y1: 200, x2: 350, y2: 500 },
          { x1: 650, y1: 200, x2: 650, y2: 500 },
          { x1: 350, y1: 200, x2: 650, y2: 200 },
          { x1: 350, y1: 500, x2: 650, y2: 500 },
        ],
        doors: [
          { id: 'door-5', x: 500, y: 200, width: 80, capacity: 3, orientation: 'horizontal', throughput: 1.5, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-6', x: 500, y: 500, width: 80, capacity: 3, orientation: 'horizontal', throughput: 1.5, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 500, y: 20, floor: 1, type: 'exit' },
          { x: 980, y: 350, floor: 1, type: 'exit' },
          { x: 500, y: 680, floor: 1, type: 'exit' },
          { x: 20, y: 350, floor: 1, type: 'exit' },
        ],
      },
    ],
  },
  {
    name: 'Школа (3 этажа)',
    description: 'Учебное заведение с коридорами и множеством классов',
    floors: [
      {
        id: 1,
        walls: [
          { x1: 100, y1: 100, x2: 900, y2: 100 },
          { x1: 900, y1: 100, x2: 900, y2: 600 },
          { x1: 900, y1: 600, x2: 100, y2: 600 },
          { x1: 100, y1: 600, x2: 100, y2: 100 },
          { x1: 100, y1: 300, x2: 400, y2: 300 },
          { x1: 600, y1: 300, x2: 900, y2: 300 },
          { x1: 100, y1: 400, x2: 400, y2: 400 },
          { x1: 600, y1: 400, x2: 900, y2: 400 },
        ],
        doors: [
          { id: 'door-7', x: 200, y: 300, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-8', x: 700, y: 300, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-9', x: 200, y: 400, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-10', x: 700, y: 400, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 500, y: 70, floor: 1, type: 'exit' },
          { x: 500, y: 630, floor: 1, type: 'exit' },
          { x: 150, y: 500, floor: 1, type: 'stairs' },
          { x: 850, y: 500, floor: 1, type: 'stairs' },
        ],
      },
      {
        id: 2,
        walls: [
          { x1: 100, y1: 100, x2: 900, y2: 100 },
          { x1: 900, y1: 100, x2: 900, y2: 600 },
          { x1: 900, y1: 600, x2: 100, y2: 600 },
          { x1: 100, y1: 600, x2: 100, y2: 100 },
          { x1: 100, y1: 300, x2: 400, y2: 300 },
          { x1: 600, y1: 300, x2: 900, y2: 300 },
        ],
        doors: [
          { id: 'door-11', x: 200, y: 300, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-12', x: 700, y: 300, width: 60, capacity: 2, orientation: 'horizontal', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 150, y: 500, floor: 2, type: 'stairs' },
          { x: 850, y: 500, floor: 2, type: 'stairs' },
        ],
      },
      {
        id: 3,
        walls: [
          { x1: 100, y1: 100, x2: 900, y2: 100 },
          { x1: 900, y1: 100, x2: 900, y2: 600 },
          { x1: 900, y1: 600, x2: 100, y2: 600 },
          { x1: 100, y1: 600, x2: 100, y2: 100 },
          { x1: 500, y1: 100, x2: 500, y2: 300 },
        ],
        doors: [
          { id: 'door-13', x: 500, y: 300, width: 60, capacity: 2, orientation: 'vertical', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 150, y: 500, floor: 3, type: 'stairs' },
          { x: 850, y: 500, floor: 3, type: 'stairs' },
        ],
      },
    ],
  },
  {
    name: 'Небольшой магазин',
    description: 'Компактное помещение с одним входом',
    floors: [
      {
        id: 1,
        walls: [
          { x1: 200, y1: 200, x2: 800, y2: 200 },
          { x1: 800, y1: 200, x2: 800, y2: 500 },
          { x1: 800, y1: 500, x2: 200, y2: 500 },
          { x1: 200, y1: 500, x2: 200, y2: 200 },
          { x1: 400, y1: 300, x2: 600, y2: 300 },
          { x1: 400, y1: 400, x2: 600, y2: 400 },
          { x1: 400, y1: 300, x2: 400, y2: 400 },
          { x1: 600, y1: 300, x2: 600, y2: 400 },
        ],
        doors: [],
        exits: [
          { x: 500, y: 170, floor: 1, type: 'exit' },
        ],
      },
    ],
  },
  {
    name: 'Конференц-зал',
    description: 'Большой зал с боковыми выходами',
    floors: [
      {
        id: 1,
        walls: [
          { x1: 150, y1: 150, x2: 850, y2: 150 },
          { x1: 850, y1: 150, x2: 850, y2: 550 },
          { x1: 850, y1: 550, x2: 150, y2: 550 },
          { x1: 150, y1: 550, x2: 150, y2: 150 },
          { x1: 400, y1: 150, x2: 400, y2: 250 },
          { x1: 600, y1: 150, x2: 600, y2: 250 },
        ],
        doors: [
          { id: 'door-14', x: 400, y: 250, width: 60, capacity: 2, orientation: 'vertical', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
          { id: 'door-15', x: 600, y: 250, width: 60, capacity: 2, orientation: 'vertical', throughput: 1.2, direction: 'both', autoOpen: false, currentQueue: 0 },
        ],
        exits: [
          { x: 120, y: 350, floor: 1, type: 'exit' },
          { x: 880, y: 350, floor: 1, type: 'exit' },
          { x: 500, y: 120, floor: 1, type: 'exit' },
        ],
      },
    ],
  },
];