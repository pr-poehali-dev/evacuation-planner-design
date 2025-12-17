import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Floor } from '@/pages/Index';

type Tool = 'wall' | 'door' | 'exit' | 'stairs' | 'erase' | 'person' | 'bulkPerson';

interface EditorToolbarProps {
  floors: Floor[];
  currentFloor: number;
  setCurrentFloor: (floor: number) => void;
  onAddFloor: () => void;
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  bulkCount: number;
  setBulkCount: (count: number) => void;
  templatesSection: React.ReactNode;
}

const EditorToolbar = ({
  floors,
  currentFloor,
  setCurrentFloor,
  onAddFloor,
  selectedTool,
  setSelectedTool,
  bulkCount,
  setBulkCount,
  templatesSection,
}: EditorToolbarProps) => {
  return (
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

      {templatesSection}

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

      <div className="text-xs text-muted-foreground space-y-1 pt-2">
        <p>💡 Стена: клик → тянуть → отпустить</p>
        <p>💡 Дверь/Выход/Человек: один клик</p>
        <p>💡 Группа: клик для размещения людей</p>
        <p>💡 Ластик: клик на объекте</p>
      </div>
    </Card>
  );
};

export default EditorToolbar;
