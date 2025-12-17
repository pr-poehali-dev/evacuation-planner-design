import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Person } from '@/pages/Index';
import { toast } from 'sonner';

interface Group {
  id: string;
  name: string;
  type: 'family' | 'colleagues' | 'friends' | 'random';
  color: string;
  members: string[];
}

interface GroupManagementProps {
  people: Person[];
  onUpdatePeople: (people: Person[]) => void;
}

const GroupManagement = ({ people, onUpdatePeople }: GroupManagementProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<Group['type']>('family');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const groupColors = {
    family: '#ef4444',
    colleagues: '#3b82f6',
    friends: '#10b981',
    random: '#8b5cf6',
  };

  const createGroup = () => {
    if (!newGroupName || selectedPeople.length < 2) {
      toast.error('Укажите название и выберите минимум 2 человека');
      return;
    }

    const groupId = `group-${Date.now()}`;
    const newGroup: Group = {
      id: groupId,
      name: newGroupName,
      type: newGroupType,
      color: groupColors[newGroupType],
      members: selectedPeople,
    };

    setGroups([...groups, newGroup]);

    const updatedPeople = people.map((p) => {
      if (selectedPeople.includes(p.id)) {
        return {
          ...p,
          groupId,
          isGroupLeader: p.id === selectedPeople[0],
          connections: [...new Set([...p.connections, ...selectedPeople.filter((id) => id !== p.id)])],
        };
      }
      return p;
    });

    onUpdatePeople(updatedPeople);
    toast.success(`Группа "${newGroupName}" создана`);
    
    setNewGroupName('');
    setSelectedPeople([]);
    setIsDialogOpen(false);
  };

  const deleteGroup = (groupId: string) => {
    const updatedPeople = people.map((p) => {
      if (p.groupId === groupId) {
        return {
          ...p,
          groupId: undefined,
          isGroupLeader: false,
        };
      }
      return p;
    });

    onUpdatePeople(updatedPeople);
    setGroups(groups.filter((g) => g.id !== groupId));
    toast.success('Группа удалена');
  };

  const togglePersonSelection = (personId: string) => {
    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter((id) => id !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const getGroupTypeLabel = (type: Group['type']) => {
    const labels = {
      family: '👨‍👩‍👧‍👦 Семья',
      colleagues: '💼 Коллеги',
      friends: '🤝 Друзья',
      random: '👥 Случайные',
    };
    return labels[type];
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="Users" className="text-secondary" size={20} />
            <h3 className="text-lg font-semibold">Управление группами</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Всего групп: {groups.length}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" className="mr-2" size={16} />
              Создать группу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создание новой группы</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название группы</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Например: Семья Ивановых"
                />
              </div>

              <div>
                <Label>Тип группы</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['family', 'colleagues', 'friends', 'random'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={newGroupType === type ? 'default' : 'outline'}
                      onClick={() => setNewGroupType(type)}
                      className="justify-start"
                    >
                      {getGroupTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Выберите участников ({selectedPeople.length} выбрано)</Label>
                <ScrollArea className="h-64 mt-2 border rounded-lg p-2">
                  <div className="space-y-1">
                    {people.map((person) => (
                      <div
                        key={person.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedPeople.includes(person.id)
                            ? 'bg-primary/20 border border-primary'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => togglePersonSelection(person.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              selectedPeople.includes(person.id) ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                          <span className="font-medium">{person.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {person.age} лет • Мобильность {person.mobility}%
                          </span>
                        </div>
                        {person.groupId && (
                          <Badge variant="secondary" className="text-xs">
                            Уже в группе
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2">
                <Button onClick={createGroup} className="flex-1">
                  Создать группу
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Users" size={48} className="mx-auto mb-2 opacity-50" />
          <p>Нет созданных групп</p>
          <p className="text-xs">Создайте группу, чтобы связать людей между собой</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="p-3"
                style={{ borderLeft: `4px solid ${group.color}` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{group.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {getGroupTypeLabel(group.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {group.members.length} участников
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>

                <div className="space-y-1">
                  {group.members.map((memberId) => {
                    const person = people.find((p) => p.id === memberId);
                    if (!person) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 text-xs p-1.5 rounded bg-accent/50"
                      >
                        {person.isGroupLeader && (
                          <Icon name="Crown" size={12} className="text-primary" />
                        )}
                        <span className="font-medium">{person.name}</span>
                        <span className="text-muted-foreground">
                          {person.age} лет • {person.mobility}% мобильность
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-2">
          <Icon name="Info" className="text-primary mt-0.5" size={16} />
          <div className="text-xs text-foreground">
            <p className="font-semibold mb-1">Влияние групп на эвакуацию:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Семья:</strong> держатся вместе, скорость равна самому медленному члену</li>
              <li>• <strong>Коллеги:</strong> средняя связь, могут разделиться при заторах</li>
              <li>• <strong>Друзья:</strong> слабая связь, легко разделяются</li>
              <li>• Лидер группы (с короной 👑) определяет направление движения</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GroupManagement;
