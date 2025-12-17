import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import FloorEditor from '@/components/FloorEditor';
import PeopleDatabase from '@/components/PeopleDatabase';
import SimulationPanel from '@/components/SimulationPanel';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import SimulationHistory from '@/components/SimulationHistory';

export interface Person {
  id: string;
  name: string;
  age: number;
  mobility: number;
  panicLevel: number;
  volume: number;
  disabilities: string[];
  connections: string[];
  position?: { x: number; y: number; floor: number };
}

export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Door {
  x: number;
  y: number;
  width: number;
  capacity: number;
  orientation: 'horizontal' | 'vertical';
}

export interface Exit {
  x: number;
  y: number;
  floor: number;
  type: 'exit' | 'stairs';
}

export interface Floor {
  id: number;
  walls: Wall[];
  doors: Door[];
  exits: Exit[];
}

export interface SimulationResult {
  id: string;
  timestamp: string;
  evacuationTime: number;
  bottlenecks: { x: number; y: number; density: number; floor: number }[];
  exitStats: { exit: Exit; count: number; avgTime: number }[];
  heatmapData: number[][][];
  peopleCount: number;
  floorCount: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [floors, setFloors] = useState<Floor[]>([
    { id: 1, walls: [], doors: [], exits: [] },
  ]);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [people, setPeople] = useState<Person[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);

  const handleAddFloor = () => {
    const newFloorId = floors.length + 1;
    setFloors([...floors, { id: newFloorId, walls: [], doors: [], exits: [] }]);
    toast.success(`Этаж ${newFloorId} добавлен`);
  };

  const handleExportProject = () => {
    const project = {
      floors,
      people,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evacuation-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Проект экспортирован');
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        setFloors(project.floors || []);
        setPeople(project.people || []);
        toast.success('Проект импортирован');
      } catch (error) {
        toast.error('Ошибка импорта проекта');
      }
    };
    reader.readAsText(file);
  };

  const handleStartSimulation = () => {
    if (people.length === 0) {
      toast.error('Добавьте людей для симуляции');
      return;
    }
    setIsSimulating(true);
    setActiveTab('simulation');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon name="Users" className="text-primary" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">EvacSim</h1>
                <p className="text-muted-foreground text-sm">Система моделирования эвакуации</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportProject}>
                <Icon name="Download" className="mr-2" size={16} />
                Экспорт
              </Button>
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <Icon name="Upload" className="mr-2" size={16} />
                    Импорт
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportProject}
                />
              </label>
              <Button onClick={handleStartSimulation} className="bg-primary hover:bg-primary/90">
                <Icon name="Play" className="mr-2" size={16} />
                Запустить симуляцию
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Icon name="Building" size={16} />
              <span>Редактор планов</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              <span>База людей</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Icon name="Play" size={16} />
              <span>Симуляция</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              <span>Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={16} />
              <span>История</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <FloorEditor
              floors={floors}
              currentFloor={currentFloor}
              setCurrentFloor={setCurrentFloor}
              setFloors={setFloors}
              onAddFloor={handleAddFloor}
              people={people}
              setPeople={setPeople}
            />
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            <PeopleDatabase people={people} setPeople={setPeople} floors={floors} />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <SimulationPanel
              floors={floors}
              people={people}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
              onSimulationComplete={(result) => {
                setSimulationResults(result);
                setSimulationHistory(prev => [result, ...prev]);
              }}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsPanel results={simulationResults} people={people} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <SimulationHistory
              history={simulationHistory}
              onSelectSimulation={setSimulationResults}
              onClearHistory={() => setSimulationHistory([])}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;