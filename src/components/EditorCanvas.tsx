import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Floor, Person } from '@/pages/Index';

type Tool = 'wall' | 'door' | 'exit' | 'stairs' | 'erase' | 'person' | 'bulkPerson';

interface EditorCanvasProps {
  floor: Floor | undefined;
  currentFloor: number;
  people: Person[];
  selectedTool: Tool;
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  uploadedImage: HTMLImageElement | null;
  gridSize: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

const EditorCanvas = ({
  floor,
  currentFloor,
  people,
  selectedTool,
  isDrawing,
  startPoint,
  uploadedImage,
  gridSize,
  onMouseDown,
  onMouseUp,
  onDoubleClick,
}: EditorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCanvas();
  }, [floor, selectedTool, startPoint, people, uploadedImage]);

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

  return (
    <Card className="p-4">
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        className="border border-border rounded-lg cursor-crosshair bg-card"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      />
      <p className="text-xs text-muted-foreground mt-2">
        💡 Двойной клик на двери для настройки пропускной способности и ориентации
      </p>
    </Card>
  );
};

export default EditorCanvas;
