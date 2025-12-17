import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { EmergencyScenario, HazardZone } from '@/pages/Index';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface EmergencyScenariosProps {
  scenario: EmergencyScenario;
  onScenarioChange: (scenario: EmergencyScenario) => void;
  hazardZones: HazardZone[];
  onHazardZonesChange: (zones: HazardZone[]) => void;
  floors: number;
}

const EmergencyScenarios = ({
  scenario,
  onScenarioChange,
  hazardZones,
  onHazardZonesChange,
  floors,
}: EmergencyScenariosProps) => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [hazardIntensity, setHazardIntensity] = useState(50);

  const addHazardZone = (type: 'fire' | 'smoke') => {
    const newZone: HazardZone = {
      x: 300 + Math.random() * 400,
      y: 200 + Math.random() * 300,
      radius: type === 'fire' ? 80 : 150,
      floor: selectedFloor,
      intensity: hazardIntensity,
      type,
    };
    onHazardZonesChange([...hazardZones, newZone]);
  };

  const removeHazardZone = (index: number) => {
    onHazardZonesChange(hazardZones.filter((_, i) => i !== index));
  };

  const scenarioDescriptions = {
    none: 'Стандартная эвакуация без дополнительных факторов',
    fire: 'Пожар — люди избегают огненных зон, повышенная паника, видимость снижается',
    smoke: 'Задымление — снижение скорости, ухудшение ориентации, опасность отравления',
    earthquake: 'Землетрясение — обрушения, блокировка выходов, избегание стен и окон',
  };

  const scenarioIcons: Record<EmergencyScenario, string> = {
    none: 'Users',
    fire: 'Flame',
    smoke: 'Cloud',
    earthquake: 'Activity',
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="AlertTriangle" className="text-destructive" size={20} />
        <h3 className="text-lg font-semibold">Сценарии ЧС</h3>
      </div>

      <div>
        <Label>Тип чрезвычайной ситуации</Label>
        <Select value={scenario} onValueChange={(v: EmergencyScenario) => onScenarioChange(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={16} />
                <span>Без ЧС (стандартная эвакуация)</span>
              </div>
            </SelectItem>
            <SelectItem value="fire">
              <div className="flex items-center gap-2">
                <Icon name="Flame" size={16} />
                <span>Пожар</span>
              </div>
            </SelectItem>
            <SelectItem value="smoke">
              <div className="flex items-center gap-2">
                <Icon name="Cloud" size={16} />
                <span>Задымление</span>
              </div>
            </SelectItem>
            <SelectItem value="earthquake">
              <div className="flex items-center gap-2">
                <Icon name="Activity" size={16} />
                <span>Землетрясение</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {scenarioDescriptions[scenario]}
        </p>
      </div>

      {(scenario === 'fire' || scenario === 'smoke') && (
        <div className="space-y-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Зоны опасности</Label>
            <Badge variant="destructive">{hazardZones.length} активных</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Этаж размещения</Label>
              <Select
                value={selectedFloor.toString()}
                onValueChange={(v) => setSelectedFloor(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: floors }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Этаж {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Интенсивность: {hazardIntensity}%</Label>
              <Slider
                value={[hazardIntensity]}
                onValueChange={([v]) => setHazardIntensity(v)}
                min={10}
                max={100}
                step={10}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => addHazardZone('fire')}
              disabled={scenario !== 'fire'}
            >
              <Icon name="Flame" className="mr-2" size={14} />
              Добавить очаг огня
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addHazardZone('smoke')}
              disabled={scenario !== 'smoke'}
            >
              <Icon name="Cloud" className="mr-2" size={14} />
              Добавить дым
            </Button>
          </div>

          {hazardZones.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {hazardZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-card text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name={zone.type === 'fire' ? 'Flame' : 'Cloud'}
                      size={14}
                      className="text-destructive"
                    />
                    <span>
                      Этаж {zone.floor} • ({zone.x.toFixed(0)}, {zone.y.toFixed(0)}) •{' '}
                      {zone.intensity}%
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => removeHazardZone(idx)}
                  >
                    <Icon name="X" size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {scenario === 'earthquake' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <Icon name="Activity" className="text-destructive mt-0.5" size={16} />
            <div className="text-xs">
              <p className="font-semibold mb-1">Эффекты землетрясения:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Случайные блокировки выходов (10-30%)</li>
                <li>• Повышенная паника у всех людей (+50%)</li>
                <li>• Снижение скорости движения (-30%)</li>
                <li>• Люди избегают стен и могут падать</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-2">
          <Icon name="Info" className="text-primary mt-0.5" size={16} />
          <div className="text-xs text-foreground">
            <p className="font-semibold mb-1">Как работают сценарии ЧС:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Пожар:</strong> люди избегают зоны огня радиусом 80 пикселей</li>
              <li>• <strong>Задымление:</strong> скорость снижается на 40%, видимость ограничена</li>
              <li>• <strong>Землетрясение:</strong> хаотичное поведение, обрушения</li>
              <li>• Зоны опасности распространяются со временем</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmergencyScenarios;
