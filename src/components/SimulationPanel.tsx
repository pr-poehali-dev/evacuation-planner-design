import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Floor, Person, SimulationResult } from '@/pages/Index';
import { calculateOptimalPath, checkWallCollision } from '@/utils/pathfinding';

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
  path?: { x: number; y: number }[];
  pathIndex?: number;
  reachedAssembly?: boolean;
}

const ASSEMBLY_POINT = { x: 500, y: 30 };

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
  const [viewFloor, setViewFloor] = useState(1);
  const [showPaths, setShowPaths] = useState(true);

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
    const initialized: SimPerson[] = people.map(p => {
      const floor = floors.find(f => f.id === (p.position?.floor || 1));
      const x = p.position?.x || 100 + Math.random() * 700;
      const y = p.position?.y || 100 + Math.random() * 500;
      
      let path: { x: number; y: number }[] = [];
      if (floor && floor.exits.length > 0) {
        const nearestExit = floor.exits.reduce((closest, exit) => {
          const dist = Math.hypot(exit.x - x, exit.y - y);
          const closestDist = Math.hypot(closest.x - x, closest.y - y);
          return dist < closestDist ? exit : closest;
        });
        path = calculateOptimalPath({ x, y }, nearestExit, floor);
      }

      return {
        ...p,
        x,
        y,
        floor: p.position?.floor || 1,
        vx: 0,
        vy: 0,
        evacuated: false,
        path,
        pathIndex: 0,
      };
    });

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
        if (person.evacuated && person.reachedAssembly) return person;
        
        if (person.evacuated && !person.reachedAssembly) {
          const dx = ASSEMBLY_POINT.x - person.x;
          const dy = ASSEMBLY_POINT.y - person.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 20) {
            return { ...person, reachedAssembly: true };
          }
          
          const speed = 2 * simSpeed;
          const newX = person.x + (dx / distance) * speed;
          const newY = person.y + (dy / distance) * speed;
          
          return { ...person, x: newX, y: newY };
        }

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

        if (distance < 30) {
          if (nearestExit.type === 'exit') {
            return { ...person, evacuated: true, evacuationTime: simTime };
          } else if (nearestExit.type === 'stairs' && person.floor > 1) {
            const lowerFloor = floors.find(f => f.id === person.floor - 1);
            if (lowerFloor && lowerFloor.exits.length > 0) {
              const newPath = calculateOptimalPath(
                { x: nearestExit.x, y: nearestExit.y },
                lowerFloor.exits[0],
                lowerFloor
              );
              return {
                ...person,
                floor: person.floor - 1,
                x: nearestExit.x,
                y: nearestExit.y,
                path: newPath,
                pathIndex: 0,
              };
            }
          }
        }

        let targetX = nearestExit.x;
        let targetY = nearestExit.y;

        if (person.path && person.path.length > 0 && person.pathIndex !== undefined) {
          if (person.pathIndex < person.path.length) {
            const target = person.path[person.pathIndex];
            targetX = target.x;
            targetY = target.y;

            const distToTarget = Math.hypot(target.x - person.x, target.y - person.y);
            if (distToTarget < 25) {
              person.pathIndex++;
            }
          }
        }

        const pathDx = targetX - person.x;
        const pathDy = targetY - person.y;
        const pathDist = Math.sqrt(pathDx * pathDx + pathDy * pathDy);

        const baseSpeed = 2 * (person.mobility / 100) * simSpeed;
        const panicFactor = 1 + (person.panicLevel / 100) * 0.5;
        const speed = baseSpeed * panicFactor;

        let fx = (pathDx / pathDist) * speed;
        let fy = (pathDy / pathDist) * speed;

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

        let newX = person.x + newVx;
        let newY = person.y + newVy;

        const correctedPos = checkWallCollision(person.x, person.y, newX, newY, currentFloor);
        newX = Math.max(10, Math.min(990, correctedPos.x));
        newY = Math.max(10, Math.min(690, correctedPos.y));

        return {
          ...person,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });

      const reachedAssembly = updated.filter(p => p.reachedAssembly).length;
      setEvacuatedCount(reachedAssembly);
      
      if (reachedAssembly === people.length) {
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

    const currentFloor = floors.find(f => f.id === viewFloor);
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

    const floorHeatmap = heatmapData[viewFloor - 1];
    if (floorHeatmap) {
      floorHeatmap.forEach((row, i) => {
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

    if (viewFloor === 1) {
      ctx.fillStyle = '#10b98180';
      ctx.beginPath();
      ctx.arc(ASSEMBLY_POINT.x, ASSEMBLY_POINT.y, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Точка сбора', ASSEMBLY_POINT.x, ASSEMBLY_POINT.y - 50);
    }

    if (showPaths) {
      simPeople.forEach(person => {
        if (!person.evacuated && person.floor === viewFloor && person.path) {
          ctx.strokeStyle = '#8B5CF640';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(person.x, person.y);
          person.path.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    simPeople.forEach(person => {
      if (!person.evacuated && person.floor === viewFloor) {
        const panicColor = person.panicLevel > 70 ? '#ef4444' : person.panicLevel > 40 ? '#f59e0b' : '#10b981';
        ctx.fillStyle = panicColor;
        ctx.beginPath();
        ctx.arc(person.x, person.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      if (person.evacuated && viewFloor === 1) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(person.x, person.y, 4, 0, Math.PI * 2);
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
              Время: {simTime.toFixed(1)} сек • В точке сбора: {evacuatedCount} / {people.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              🟢 Точка сбора находится за пределами здания
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Этаж для просмотра</Label>
            <Select value={viewFloor.toString()} onValueChange={(v) => setViewFloor(parseInt(v))}>
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
          </div>

          <div>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="show-paths"
              checked={showPaths}
              onCheckedChange={setShowPaths}
            />
            <Label htmlFor="show-paths" className="cursor-pointer">
              Показывать пути эвакуации
            </Label>
          </div>
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