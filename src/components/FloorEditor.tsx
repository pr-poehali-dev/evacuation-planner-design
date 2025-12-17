import { useState } from 'react';
import { toast } from 'sonner';
import { Floor, Door, Person } from '@/pages/Index';
import DoorSettings from './DoorSettings';
import EditorCanvas from './EditorCanvas';
import EditorToolbar from './EditorToolbar';
import EditorTemplates from './EditorTemplates';
import { useEditorActions } from './EditorActions';

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

const FloorEditor = ({ 
  floors, 
  currentFloor, 
  setCurrentFloor, 
  setFloors, 
  onAddFloor, 
  people, 
  setPeople 
}: FloorEditorProps) => {
  const [selectedTool, setSelectedTool] = useState<Tool>('wall');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [gridSize] = useState(20);
  const [bulkCount, setBulkCount] = useState(10);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isDoorSettingsOpen, setIsDoorSettingsOpen] = useState(false);

  const floor = floors.find(f => f.id === currentFloor);

  const { 
    addWall, 
    addDoor, 
    addExit, 
    eraseAtPoint, 
    addPerson, 
    addBulkPeople 
  } = useEditorActions({ 
    floors, 
    currentFloor, 
    people, 
    setFloors, 
    setPeople 
  });

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
    const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.detail === 2) return;
    
    const coords = getCanvasCoords(e);
    setStartPoint(coords);
    setIsDrawing(true);

    if (selectedTool === 'exit' || selectedTool === 'stairs') {
      addExit(coords, selectedTool);
    } else if (selectedTool === 'door') {
      addDoor(coords);
    } else if (selectedTool === 'erase') {
      eraseAtPoint(coords);
    } else if (selectedTool === 'person') {
      addPerson(coords);
    } else if (selectedTool === 'bulkPerson') {
      addBulkPeople(coords, bulkCount);
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

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!floor) return;
    const coords = getCanvasCoords(e);
    const threshold = 20;
    
    const clickedDoor = floor.doors.find(door => 
      Math.hypot(door.x - coords.x, door.y - coords.y) < threshold
    );
    
    if (clickedDoor) {
      setSelectedDoor(clickedDoor);
      setIsDoorSettingsOpen(true);
    }
  };

  const handleSaveDoor = (updatedDoor: Door) => {
    const updatedFloors = floors.map(f => {
      if (f.id === currentFloor) {
        return {
          ...f,
          doors: f.doors.map(d => d.id === updatedDoor.id ? updatedDoor : d)
        };
      }
      return f;
    });
    setFloors(updatedFloors);
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
      <EditorToolbar
        floors={floors}
        currentFloor={currentFloor}
        setCurrentFloor={setCurrentFloor}
        onAddFloor={onAddFloor}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        bulkCount={bulkCount}
        setBulkCount={setBulkCount}
        templatesSection={
          <EditorTemplates
            setFloors={setFloors}
            setCurrentFloor={setCurrentFloor}
            setUploadedImage={setUploadedImage}
            onClearFloor={handleClearFloor}
          />
        }
      />

      <EditorCanvas
        floor={floor}
        currentFloor={currentFloor}
        people={people}
        selectedTool={selectedTool}
        isDrawing={isDrawing}
        startPoint={startPoint}
        uploadedImage={uploadedImage}
        gridSize={gridSize}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
      />

      <DoorSettings
        door={selectedDoor}
        isOpen={isDoorSettingsOpen}
        onClose={() => {
          setIsDoorSettingsOpen(false);
          setSelectedDoor(null);
        }}
        onSave={handleSaveDoor}
      />
    </div>
  );
};

export default FloorEditor;
