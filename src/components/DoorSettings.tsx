import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Door } from '@/pages/Index';
import { toast } from 'sonner';

interface DoorSettingsProps {
  door: Door | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (door: Door) => void;
}

const DoorSettings = ({ door, isOpen, onClose, onSave }: DoorSettingsProps) => {
  const [formData, setFormData] = useState<Door>(
    door || {
      x: 0,
      y: 0,
      width: 60,
      capacity: 2,
      orientation: 'horizontal',
      throughput: 1.2,
      direction: 'both',
      autoOpen: false,
      currentQueue: 0,
    }
  );

  const handleSave = () => {
    onSave(formData);
    toast.success('Настройки двери сохранены');
    onClose();
  };

  if (!door) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Настройки двери</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ширина двери (см)</Label>
              <Input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                min={40}
                max={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Рекомендуемая ширина: 80-120 см для эвакуации
              </p>
            </div>

            <div>
              <Label>Ориентация</Label>
              <Select
                value={formData.orientation}
                onValueChange={(v: 'horizontal' | 'vertical') =>
                  setFormData({ ...formData, orientation: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Горизонтальная</SelectItem>
                  <SelectItem value="vertical">Вертикальная</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Пропускная способность: {formData.throughput?.toFixed(1)} чел/сек</Label>
            <Slider
              value={[formData.throughput || 1.2]}
              onValueChange={([v]) => setFormData({ ...formData, throughput: v })}
              min={0.5}
              max={3}
              step={0.1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Стандартная дверь: 1.2 чел/сек, Широкая дверь: 2-3 чел/сек
            </p>
          </div>

          <div>
            <Label>Направление открывания</Label>
            <Select
              value={formData.direction || 'both'}
              onValueChange={(v: 'inward' | 'outward' | 'both') =>
                setFormData({ ...formData, direction: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inward">Внутрь</SelectItem>
                <SelectItem value="outward">Наружу (эвакуационная)</SelectItem>
                <SelectItem value="both">Двусторонняя</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Эвакуационные двери должны открываться наружу
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
            <div className="flex items-center gap-3">
              <Icon name="Zap" className="text-primary" size={20} />
              <div>
                <Label className="text-sm font-medium">Автоматическое открывание</Label>
                <p className="text-xs text-muted-foreground">
                  Двери с автоматикой открываются быстрее
                </p>
              </div>
            </div>
            <Switch
              checked={formData.autoOpen || false}
              onCheckedChange={(checked) => setFormData({ ...formData, autoOpen: checked })}
            />
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <Icon name="Info" className="text-primary mt-0.5" size={16} />
              <div className="text-xs text-foreground">
                <p className="font-semibold mb-1">Влияние параметров на симуляцию:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Узкая дверь создаёт очереди и заторы</li>
                  <li>• Автоматические двери увеличивают пропускную способность на 30%</li>
                  <li>• Эвакуационные двери (наружу) снижают задержки на 20%</li>
                  <li>
                    • Дверь 80 см пропускает ~1 чел/сек, 120 см ~1.5 чел/сек, 200 см ~2.5 чел/сек
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Icon name="Check" className="mr-2" size={16} />
              Сохранить
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoorSettings;
