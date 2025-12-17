import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Person, Floor } from '@/pages/Index';

interface PeopleDatabaseProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  floors: Floor[];
}

const PeopleDatabase = ({ people, setPeople, floors }: PeopleDatabaseProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    age: 30,
    mobility: 100,
    panicLevel: 50,
    volume: 50,
    disabilities: [],
    connections: [],
  });

  const handleOpenDialog = (person?: Person) => {
    if (person) {
      setEditingPerson(person);
      setFormData(person);
    } else {
      setEditingPerson(null);
      setFormData({
        name: '',
        age: 30,
        mobility: 100,
        panicLevel: 50,
        volume: 50,
        disabilities: [],
        connections: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSavePerson = () => {
    if (!formData.name) {
      toast.error('Введите имя');
      return;
    }

    if (editingPerson) {
      const updatedPeople = people.map(p =>
        p.id === editingPerson.id ? { ...editingPerson, ...formData } : p
      );
      setPeople(updatedPeople);
      toast.success('Данные обновлены');
    } else {
      const newPerson: Person = {
        id: `person-${Date.now()}`,
        name: formData.name!,
        age: formData.age!,
        mobility: formData.mobility!,
        panicLevel: formData.panicLevel!,
        volume: formData.volume!,
        disabilities: formData.disabilities!,
        connections: formData.connections!,
        position: {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
          floor: 1,
        },
      };
      setPeople([...people, newPerson]);
      toast.success('Человек добавлен');
    }

    setIsDialogOpen(false);
  };

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    toast.success('Человек удален');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Имя', 'Возраст', 'Мобильность', 'Уровень паники', 'Объем', 'Ограничения'];
    const rows = people.map(p => [
      p.id,
      p.name,
      p.age,
      p.mobility,
      p.panicLevel,
      p.volume,
      p.disabilities.join(';'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `people-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV экспортирован');
  };

  const getMobilityColor = (mobility: number) => {
    if (mobility >= 80) return 'bg-green-500';
    if (mobility >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPanicColor = (panic: number) => {
    if (panic <= 30) return 'bg-green-500';
    if (panic <= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">База данных людей</h2>
            <p className="text-sm text-muted-foreground">
              Всего: {people.length} человек
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Icon name="FileDown" className="mr-2" size={16} />
              Экспорт CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Icon name="UserPlus" className="mr-2" size={16} />
                  Добавить человека
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPerson ? 'Редактировать данные' : 'Добавить человека'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Имя</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Возраст: {formData.age} лет</Label>
                      <Slider
                        value={[formData.age!]}
                        onValueChange={([v]) => setFormData({ ...formData, age: v })}
                        min={1}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Объем (кг): {formData.volume}</Label>
                      <Slider
                        value={[formData.volume!]}
                        onValueChange={([v]) => setFormData({ ...formData, volume: v })}
                        min={30}
                        max={150}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Мобильность: {formData.mobility}%</Label>
                    <Slider
                      value={[formData.mobility!]}
                      onValueChange={([v]) => setFormData({ ...formData, mobility: v })}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      100% - полная мобильность, 0% - инвалидное кресло
                    </p>
                  </div>

                  <div>
                    <Label>Уровень паники: {formData.panicLevel}%</Label>
                    <Slider
                      value={[formData.panicLevel!]}
                      onValueChange={([v]) => setFormData({ ...formData, panicLevel: v })}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Влияет на скорость и рациональность движения
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSavePerson} className="flex-1">
                      {editingPerson ? 'Сохранить' : 'Добавить'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map(person => (
              <Card key={person.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{person.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {person.age} лет • {person.volume} кг
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDialog(person)}
                    >
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeletePerson(person.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Мобильность</span>
                      <span className="font-mono">{person.mobility}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getMobilityColor(person.mobility)} transition-all`}
                        style={{ width: `${person.mobility}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Паника</span>
                      <span className="font-mono">{person.panicLevel}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPanicColor(person.panicLevel)} transition-all`}
                        style={{ width: `${person.panicLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {person.disabilities && person.disabilities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {person.disabilities.map((d, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {d}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default PeopleDatabase;
