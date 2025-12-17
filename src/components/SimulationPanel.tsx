import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Floor, Person, SimulationResult } from '@/pages/Index';

interface SimulationPanelProps {
  floors: Floor[];
  people: Person[];
  isSimulating: boolean;
  setIsSimulating: (value: boolean) => void;
  onSimulationComplete: (results: SimulationResult) => void;
}

interface SimPerson extends Person {
  x: number;
  y: number;
  floor: number;
  vx: number;
  vy: number;
  evacuated: boolean;
  evacuationTime?: number;
}

const SimulationPanel = ({
  floors,
  people,
  isSimulating,
  setIsSimulating,
  onSimulationComplete,
}: SimulationPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [simSpeed, setSimSpeed] = useState(1);
  const [simTime, setSimTime] = useState(0);
  const [simPeople, setSimPeople] = useState<SimPerson[]>([]);
  const [evacuatedCount, setEvacuatedCount] = useState(0);
  const animationRef = useRef<number>();
  const [heatmapData, setHeatmapData] = useState<number[][][]>([]);

  useEffect(() => {
    if (isSimulating) {
      initializeSimulation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating]);

  useEffect(() => {
    if (isSimulating && simPeople.length > 0) {
      animationRef.current = requestAnimationFrame(updateSimulation);
    }
  }, [simPeople, simTime, isSimulating]);

  const initializeSimulation = () => {
    const initialized: SimPerson[] = people.map(p => ({
      ...p,
      x: p.position?.x || 100 + Math.random() * 700,
      y: p.position?.y || 100 + Math.random() * 500,
      floor: p.position?.floor || 1,
      vx: 0,
      vy: 0,
      evacuated: false,
    }));

    setSimPeople(initialized);
    setSimTime(0);
    setEvacuatedCount(0);

    const heatmap: number[][][] = floors.map(() => {
      const grid: number[][] = [];
      for (let i = 0; i < 35; i++) {
        grid.push(new Array(50).fill(0));
      }
      return grid;
    });
    setHeatmapData(heatmap);

    toast.success('Симуляция запущена');
  };

  const updateSimulation = () => {
    if (!isSimulating) return;

    setSimTime(prev => prev + 0.016 * simSpeed);

    setSimPeople(prevPeople => {
      const updated = prevPeople.map(person => {
        if (person.evacuated) return person;

        const currentFloor = floors.find(f => f.id === person.floor);
        if (!currentFloor) return person;

        let nearestExit = currentFloor.exits[0];
        let minDist = Infinity;

        currentFloor.exits.forEach(exit => {
          const dist = Math.hypot(exit.x - person.x, exit.y - person.y);
          if (dist < minDist) {
            minDist = dist;
            nearestExit = exit;
          }
        });

        if (!nearestExit) return person;

        const dx = nearestExit.x - person.x;
        const dy = nearestExit.y - person.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
          if (nearestExit.type === 'exit') {
            setEvacuatedCount(prev => prev + 1);
            return { ...person, evacuated: true, evacuationTime: simTime };
          } else if (nearestExit.type === 'stairs' && person.floor > 1) {
            const lowerFloor = floors.find(f => f.id === person.floor - 1);
            if (lowerFloor && lowerFloor.exits.length > 0) {
              return { ...person, floor: person.floor - 1, x: nearestExit.x, y: nearestExit.y };
            }
          }
        }

        const baseSpeed = 2 * (person.mobility / 100) * simSpeed;
        const panicFactor = 1 + (person.panicLevel / 100) * 0.5;
        const speed = baseSpeed * panicFactor;

        let fx = (dx / distance) * speed;
        let fy = (dy / distance) * speed;

        const crowdForce = { x: 0, y: 0 };
        let nearbyCount = 0;
        prevPeople.forEach(other => {
          if (other.id === person.id || other.evacuated || other.floor !== person.floor) return;
          
          const odx = person.x - other.x;
          const ody = person.y - other.y;
          const oDist = Math.sqrt(odx * odx + ody * ody);
          
          if (oDist < 30 && oDist > 0) {
            const repulsionForce = 50 / (oDist * oDist);
            fx += (odx / oDist) * repulsionForce;
            fy += (ody / oDist) * repulsionForce;
            nearbyCount++;
          }

          if (oDist < 80 && oDist > 0) {
            crowdForce.x += other.vx * 0.1;
            crowdForce.y += other.vy * 0.1;
          }
        });

        if (nearbyCount > 3) {
          fx += crowdForce.x;
          fy += crowdForce.y;
        }

        currentFloor.walls.forEach(wall => {
          const px = person.x;
          const py = person.y;
          
          const wallDx = wall.x2 - wall.x1;
          const wallDy = wall.y2 - wall.y1;
          const wallLen = Math.sqrt(wallDx * wallDx + wallDy * wallDy);
          
          const t = Math.max(0, Math.min(1, ((px - wall.x1) * wallDx + (py - wall.y1) * wallDy) / (wallLen * wallLen)));
          const closestX = wall.x1 + t * wallDx;
          const closestY = wall.y1 + t * wallDy;
          
          const distToWall = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
          
          if (distToWall < 20) {
            const repulsion = 100 / (distToWall + 1);
            fx += ((px - closestX) / (distToWall + 0.1)) * repulsion;
            fy += ((py - closestY) / (distToWall + 0.1)) * repulsion;
          }
        });

        const newVx = person.vx * 0.8 + fx * 0.2;
        const newVy = person.vy * 0.8 + fy * 0.2;

        const newX = Math.max(10, Math.min(990, person.x + newVx));
        const newY = Math.max(10, Math.min(690, person.y + newVy));

        return {
          ...person,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });

      const evacuated = updated.filter(p => p.evacuated).length;
      if (evacuated === people.length) {
        handleSimulationComplete(updated);
      }

      return updated;
    });

    setHeatmapData(prevHeatmap => {
      const newHeatmap = prevHeatmap.map(floor => floor.map(row => row.map(cell => cell * 0.95)));
      
      simPeople.forEach(person => {
        if (!person.evacuated) {
          const floorIdx = person.floor - 1;
          const gridX = Math.floor(person.y / 20);
          const gridY = Math.floor(person.x / 20);
          
          if (newHeatmap[floorIdx] && newHeatmap[floorIdx][gridX] && newHeatmap[floorIdx][gridX][gridY] !== undefined) {
            newHeatmap[floorIdx][gridX][gridY] += 1;
          }
        }
      });
      
      return newHeatmap;
    });

    drawSimulation();
  };

  const handleSimulationComplete = (finalPeople: SimPerson[]) => {
    setIsSimulating(false);
    
    const bottlenecks: { x: number; y: number; density: number; floor: number }[] = [];
    heatmapData.forEach((floorData, floorIdx) => {
      floorData.forEach((row, i) => {
        row.forEach((density, j) => {
          if (density > 50) {
            bottlenecks.push({ x: j * 20, y: i * 20, density, floor: floorIdx + 1 });
          }
        });
      });
    });

    const results: SimulationResult = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      evacuationTime: simTime,
      bottlenecks: bottlenecks.sort((a, b) => b.density - a.density).slice(0, 5),
      exitStats: [],
      heatmapData,
      peopleCount: people.length,
      floorCount: floors.length,
    };

    onSimulationComplete(results);
    toast.success(`Эвакуация завершена за ${simTime.toFixed(1)} сек`);
  };

  const drawSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentFloor = floors.find(f => f.id === 1);
    if (!currentFloor) return;

    ctx.strokeStyle = '#2a3441';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (heatmapData[0]) {
      heatmapData[0].forEach((row, i) => {
        row.forEach((density, j) => {
          if (density > 0) {
            const alpha = Math.min(density / 100, 0.6);
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
            ctx.fillRect(j * 20, i * 20, 20, 20);
          }
        });
      });
    }

    ctx.strokeStyle = '#0EA5E9';
    ctx.lineWidth = 3;
    currentFloor.walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
    });

    currentFloor.doors.forEach(door => {
      ctx.fillStyle = '#22c55e';
      if (door.orientation === 'horizontal') {
        ctx.fillRect(door.x - door.width / 2, door.y - 3, door.width, 6);
      } else {
        ctx.fillRect(door.x - 3, door.y - door.width / 2, 6, door.width);
      }
    });

    currentFloor.exits.forEach(exit => {
      ctx.fillStyle = exit.type === 'exit' ? '#F97316' : '#8B5CF6';
      ctx.beginPath();
      ctx.arc(exit.x, exit.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    simPeople.forEach(person => {
      if (!person.evacuated && person.floor === 1) {
        const panicColor = person.panicLevel > 70 ? '#ef4444' : person.panicLevel > 40 ? '#f59e0b' : '#10b981';
        ctx.fillStyle = panicColor;
        ctx.beginPath();
        ctx.arc(person.x, person.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Симуляция эвакуации</h2>
            <p className="text-sm text-muted-foreground">
              Время: {simTime.toFixed(1)} сек • Эвакуировано: {evacuatedCount} / {people.length}
            </p>
          </div>
          <div className="flex gap-2">
            {isSimulating ? (
              <>
                <Button variant="outline" onClick={() => setIsSimulating(false)}>
                  <Icon name="Pause" className="mr-2" size={16} />
                  Пауза
                </Button>
                <Button variant="destructive" onClick={() => { setIsSimulating(false); setSimPeople([]); }}>
                  <Icon name="Square" className="mr-2" size={16} />
                  Стоп
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsSimulating(true)}>
                <Icon name="Play" className="mr-2" size={16} />
                Старт
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Label>Скорость симуляции: {simSpeed}x</Label>
          <Slider
            value={[simSpeed]}
            onValueChange={([v]) => setSimSpeed(v)}
            min={0.5}
            max={5}
            step={0.5}
            className="mt-2"
          />
        </div>

        <canvas
          ref={canvasRef}
          width={1000}
          height={700}
          className="border border-border rounded-lg bg-card"
        />
      </Card>
    </div>
  );
};

export default SimulationPanel;