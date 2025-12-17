import { toast } from 'sonner';
import { Floor, Wall, Door, Exit, Person } from '@/pages/Index';

type Tool = 'wall' | 'door' | 'exit' | 'stairs' | 'erase' | 'person' | 'bulkPerson';

interface EditorActionsProps {
  floors: Floor[];
  currentFloor: number;
  people: Person[];
  setFloors: (floors: Floor[]) => void;
  setPeople: (people: Person[]) => void;
}

export const useEditorActions = ({
  floors,
  currentFloor,
  people,
  setFloors,
  setPeople,
}: EditorActionsProps) => {
  const floor = floors.find(f => f.id === currentFloor);

  const addWall = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    if (!floor) return;
    const newWall: Wall = { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    const updatedFloors = floors.map(f =>
      f.id === currentFloor ? { ...f, walls: [...f.walls, newWall] } : f
    );
    setFloors(updatedFloors);
    toast.success('Стена добавлена');
  };

  const addDoor = (coords: { x: number; y: number }) => {
    if (!floor) return;
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      x: coords.x,
      y: coords.y,
      width: 60,
      capacity: 2,
      orientation: 'horizontal',
      throughput: 1.2,
      direction: 'both',
      autoOpen: false,
      currentQueue: 0,
    };
    const updatedFloors = floors.map(f =>
      f.id === currentFloor ? { ...f, doors: [...f.doors, newDoor] } : f
    );
    setFloors(updatedFloors);
    toast.success('Дверь добавлена (двойной клик для настроек)');
  };

  const addExit = (coords: { x: number; y: number }, selectedTool: Tool) => {
    if (!floor) return;
    const newExit: Exit = {
      x: coords.x,
      y: coords.y,
      floor: currentFloor,
      type: selectedTool === 'exit' ? 'exit' : 'stairs',
    };
    const updatedFloors = floors.map(f =>
      f.id === currentFloor ? { ...f, exits: [...f.exits, newExit] } : f
    );
    setFloors(updatedFloors);
    toast.success(selectedTool === 'exit' ? 'Выход добавлен' : 'Лестница добавлена');
  };

  const eraseAtPoint = (coords: { x: number; y: number }) => {
    if (!floor) return;
    const threshold = 15;

    const updatedFloors = floors.map(f => {
      if (f.id !== currentFloor) return f;
      
      return {
        ...f,
        walls: f.walls.filter(wall => {
          const distToStart = Math.hypot(wall.x1 - coords.x, wall.y1 - coords.y);
          const distToEnd = Math.hypot(wall.x2 - coords.x, wall.y2 - coords.y);
          return distToStart > threshold && distToEnd > threshold;
        }),
        doors: f.doors.filter(door => 
          Math.hypot(door.x - coords.x, door.y - coords.y) > threshold
        ),
        exits: f.exits.filter(exit => 
          Math.hypot(exit.x - coords.x, exit.y - coords.y) > threshold
        ),
      };
    });

    setFloors(updatedFloors);
  };

  const addPerson = (coords: { x: number; y: number }) => {
    const newPerson: Person = {
      id: `person-${Date.now()}-${Math.random()}`,
      name: `Человек ${people.length + 1}`,
      age: 30,
      mobility: 100,
      panicLevel: 50,
      volume: 70,
      disabilities: [],
      connections: [],
      position: { x: coords.x, y: coords.y, floor: currentFloor },
    };
    setPeople([...people, newPerson]);
    toast.success('Человек добавлен на карту');
  };

  const addBulkPeople = (coords: { x: number; y: number }, bulkCount: number) => {
    const newPeople: Person[] = [];
    const radius = 50;
    for (let i = 0; i < bulkCount; i++) {
      const angle = (i / bulkCount) * Math.PI * 2;
      const x = coords.x + Math.cos(angle) * radius;
      const y = coords.y + Math.sin(angle) * radius;
      newPeople.push({
        id: `person-${Date.now()}-${i}`,
        name: `Человек ${people.length + i + 1}`,
        age: 20 + Math.floor(Math.random() * 50),
        mobility: 70 + Math.floor(Math.random() * 30),
        panicLevel: 30 + Math.floor(Math.random() * 40),
        volume: 50 + Math.floor(Math.random() * 50),
        disabilities: [],
        connections: [],
        position: { x, y, floor: currentFloor },
      });
    }
    setPeople([...people, ...newPeople]);
    toast.success(`Добавлено ${bulkCount} человек`);
  };

  return {
    addWall,
    addDoor,
    addExit,
    eraseAtPoint,
    addPerson,
    addBulkPeople,
  };
};
