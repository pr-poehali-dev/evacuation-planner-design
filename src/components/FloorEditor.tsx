import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Floor, Wall, Door, Exit, Person } from '@/pages/Index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { floorTemplates } from '@/data/floorTemplates';

interface FloorEditorProps {
  floors: Floor[];
  currentFloor: number;
  setCurrentFloor: (floor: number) => void;
  setFloors: (floors: Floor[]) => void;
  onAddFloor: () => void;
  people: Person[];
  setPeople: (people: Person[]) => void;
}

type Tool = 'wall' | 'door' | 'exit' | 'stairs' | 'erase' | 'person' | 'bulkPerson';

const FloorEditor = ({ floors, currentFloor, setCurrentFloor, setFloors, onAddFloor, people, setPeople }: FloorEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>('wall');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [gridSize] = useState(20);
  const [bulkCount, setBulkCount] = useState(10);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);

  const floor = floors.find(f => f.id === currentFloor);

  useEffect(() => {
    drawCanvas();
  }, [floor, selectedTool, startPoint]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
    const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;
    return { x, y };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !floor) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#2a3441';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#0EA5E9';
    ctx.lineWidth = 3;
    floor.walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
    });

    floor.doors.forEach(door => {
      ctx.fillStyle = '#22c55e';
      if (door.orientation === 'horizontal') {
        ctx.fillRect(door.x - door.width / 2, door.y - 3, door.width, 6);
      } else {
        ctx.fillRect(door.x - 3, door.y - door.width / 2, 6, door.width);
      }
    });

    floor.exits.forEach(exit => {
      ctx.fillStyle = exit.type === 'exit' ? '#F97316' : '#8B5CF6';
      ctx.beginPath();
      ctx.arc(exit.x, exit.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    if (uploadedImage) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    people.filter(p => p.position?.floor === currentFloor).forEach(person => {
      if (person.position) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(person.position.x, person.position.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    if (startPoint && isDrawing && selectedTool === 'wall') {
      ctx.strokeStyle = '#0EA5E955';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      const currentPos = { x: startPoint.x, y: startPoint.y };
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setStartPoint(coords);
    setIsDrawing(true);

    if (selectedTool === 'exit' || selectedTool === 'stairs') {
      addExit(coords);
    } else if (selectedTool === 'door') {
      addDoor(coords);
    } else if (selectedTool === 'erase') {
      eraseAtPoint(coords);
    } else if (selectedTool === 'person') {
      addPerson(coords);
    } else if (selectedTool === 'bulkPerson') {
      addBulkPeople(coords);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const coords = getCanvasCoords(e);
    
    if (selectedTool === 'wall') {
      addWall(startPoint, coords);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

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
      x: coords.x,
      y: coords.y,
      width: 60,
      capacity: 2,
      orientation: 'horizontal',
    };
    const updatedFloors = floors.map(f =>
      f.id === currentFloor ? { ...f, doors: [...f.doors, newDoor] } : f
    );
    setFloors(updatedFloors);
    toast.success('Дверь добавлена');
  };

  const addExit = (coords: { x: number; y: number }) => {
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

  const addBulkPeople = (coords: { x: number; y: number }) => {
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

  const handleLoadTemplate = (template: typeof floorTemplates[0]) => {
    setFloors(template.floors);
    setCurrentFloor(1);
    setShowTemplateDialog(false);
    toast.success(`Загружен шаблон: ${template.name}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        toast.success('Изображение загружено. Обведите стены по контурам');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClearFloor = () => {
    const updatedFloors = floors.map(f =>
      f.id === currentFloor ? { ...f, walls: [], doors: [], exits: [] } : f
    );
    setFloors(updatedFloors);
    toast.success('План этажа очищен');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
      <Card className="p-4 space-y-4 h-fit">
        <div>
          <Label className="text-sm font-medium mb-2 block">Этаж</Label>
          <div className="flex gap-2">
            <Select
              value={currentFloor.toString()}
              onValueChange={(v) => setCurrentFloor(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {floors.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    Этаж {f.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onAddFloor} size="icon" variant="outline">
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Icon name="Folder" className="mr-2" size={16} />
                Шаблоны планов
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Выберите шаблон плана здания</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {floorTemplates.map((template, idx) => (
                  <Card
                    key={idx}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Этажей: {template.floors.length}
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <label>
            <Button variant="outline" className="w-full" asChild>
              <span>
                <Icon name="Image" className="mr-2" size={16} />
                Загрузить план (изображение)
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Инструменты</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedTool === 'wall' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('wall')}
              className="justify-start"
            >
              <Icon name="Minus" className="mr-2" size={16} />
              Стена
            </Button>
            <Button
              variant={selectedTool === 'door' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('door')}
              className="justify-start"
            >
              <Icon name="DoorOpen" className="mr-2" size={16} />
              Дверь
            </Button>
            <Button
              variant={selectedTool === 'exit' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('exit')}
              className="justify-start"
            >
              <Icon name="LogOut" className="mr-2" size={16} />
              Выход
            </Button>
            <Button
              variant={selectedTool === 'stairs' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('stairs')}
              className="justify-start"
            >
              <Icon name="ArrowDown" className="mr-2" size={16} />
              Лестница
            </Button>
            <Button
              variant={selectedTool === 'person' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('person')}
              className="justify-start"
            >
              <Icon name="User" className="mr-2" size={16} />
              Человек
            </Button>
            <Button
              variant={selectedTool === 'bulkPerson' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('bulkPerson')}
              className="justify-start"
            >
              <Icon name="Users" className="mr-2" size={16} />
              Группа
            </Button>
            <Button
              variant={selectedTool === 'erase' ? 'destructive' : 'outline'}
              onClick={() => setSelectedTool('erase')}
              className="justify-start col-span-2"
            >
              <Icon name="Eraser" className="mr-2" size={16} />
              Ластик
            </Button>
          </div>
        </div>

        {selectedTool === 'bulkPerson' && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Количество людей: {bulkCount}
            </Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 10)}
            />
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleClearFloor}>
            <Icon name="Trash2" className="mr-2" size={16} />
            Очистить этаж
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2">
          <p>💡 Стена: клик → тянуть → отпустить</p>
          <p>💡 Дверь/Выход/Человек: один клик</p>
          <p>💡 Группа: клик для размещения людей</p>
          <p>💡 Ластик: клик на объекте</p>
        </div>
      </Card>

      <Card className="p-4">
        <canvas
          ref={canvasRef}
          width={1000}
          height={700}
          className="border border-border rounded-lg cursor-crosshair bg-card"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </Card>
    </div>
  );
};

export default FloorEditor;