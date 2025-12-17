import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { SimulationResult } from '@/pages/Index';
import { toast } from 'sonner';

interface SimulationHistoryProps {
  history: SimulationResult[];
  onSelectSimulation: (result: SimulationResult) => void;
  onClearHistory: () => void;
}

const SimulationHistory = ({ history, onSelectSimulation, onClearHistory }: SimulationHistoryProps) => {
  const handleClear = () => {
    if (confirm('Очистить всю историю симуляций?')) {
      onClearHistory();
      toast.success('История очищена');
    }
  };

  const handleExportComparison = () => {
    const comparison = history.map((result, idx) => ({
      simulation: idx + 1,
      timestamp: result.timestamp,
      evacuationTime: result.evacuationTime,
      peopleCount: result.peopleCount,
      floorCount: result.floorCount,
      bottlenecksCount: result.bottlenecks.length,
    }));

    const csv = [
      ['Симуляция', 'Время', 'Время эвакуации (сек)', 'Людей', 'Этажей', 'Заторов'],
      ...comparison.map(c => [
        c.simulation,
        new Date(c.timestamp).toLocaleString('ru-RU'),
        c.evacuationTime.toFixed(1),
        c.peopleCount,
        c.floorCount,
        c.bottlenecksCount,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-comparison-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Сравнение экспортировано');
  };

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Icon name="History" size={48} className="opacity-50" />
          <div>
            <p className="text-lg font-medium">История симуляций пуста</p>
            <p className="text-sm">Запустите симуляцию, чтобы увидеть результаты здесь</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">История симуляций</h2>
            <p className="text-sm text-muted-foreground">
              Всего запусков: {history.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportComparison} disabled={history.length === 0}>
              <Icon name="FileDown" className="mr-2" size={16} />
              Экспорт сравнения
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              <Icon name="Trash2" className="mr-2" size={16} />
              Очистить историю
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[700px]">
          <div className="space-y-3">
            {history.map((result, idx) => (
              <Card
                key={result.id}
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => {
                  onSelectSimulation(result);
                  toast.success('Результат загружен в аналитику');
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono">
                      #{history.length - idx}
                    </Badge>
                    <div>
                      <p className="font-semibold text-foreground">
                        Симуляция от {new Date(result.timestamp).toLocaleString('ru-RU')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.peopleCount} человек • {result.floorCount} этажей
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSimulation(result);
                      toast.success('Открыта аналитика');
                    }}
                  >
                    <Icon name="ExternalLink" size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Время эвакуации</p>
                    <p className="text-lg font-bold">{result.evacuationTime.toFixed(1)} сек</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Заторов</p>
                    <p className="text-lg font-bold">{result.bottlenecks.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Скорость</p>
                    <p className="text-lg font-bold">
                      {(result.peopleCount / result.evacuationTime).toFixed(2)} чел/с
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Эффективность</p>
                    <Badge
                      variant={
                        result.evacuationTime < 120
                          ? 'default'
                          : result.evacuationTime < 180
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {result.evacuationTime < 120
                        ? 'Отлично'
                        : result.evacuationTime < 180
                        ? 'Хорошо'
                        : 'Требует оптимизации'}
                    </Badge>
                  </div>
                </div>

                {result.bottlenecks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Критические зоны:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.bottlenecks.slice(0, 3).map((b, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          Этаж {b.floor}: ({b.x.toFixed(0)}, {b.y.toFixed(0)})
                        </Badge>
                      ))}
                      {result.bottlenecks.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.bottlenecks.length - 3} еще
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {history.length >= 2 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="TrendingUp" className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">Сравнение симуляций</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 bg-primary/5">
                <p className="text-xs text-muted-foreground mb-1">Лучший результат</p>
                <p className="text-xl font-bold">
                  {Math.min(...history.map(h => h.evacuationTime)).toFixed(1)} сек
                </p>
              </Card>
              <Card className="p-3 bg-destructive/5">
                <p className="text-xs text-muted-foreground mb-1">Худший результат</p>
                <p className="text-xl font-bold">
                  {Math.max(...history.map(h => h.evacuationTime)).toFixed(1)} сек
                </p>
              </Card>
            </div>

            <Card className="p-3 bg-secondary/5">
              <p className="text-xs text-muted-foreground mb-1">Средняя скорость эвакуации</p>
              <p className="text-xl font-bold">
                {(history.reduce((sum, h) => sum + h.peopleCount / h.evacuationTime, 0) / history.length).toFixed(2)} чел/сек
              </p>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SimulationHistory;
