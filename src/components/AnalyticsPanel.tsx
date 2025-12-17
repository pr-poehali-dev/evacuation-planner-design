import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { SimulationResult, Person } from '@/pages/Index';

interface AnalyticsPanelProps {
  results: SimulationResult | null;
  people: Person[];
}

const AnalyticsPanel = ({ results, people }: AnalyticsPanelProps) => {
  if (!results) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Icon name="BarChart3" size={48} className="opacity-50" />
          <div>
            <p className="text-lg font-medium">Нет данных симуляции</p>
            <p className="text-sm">Запустите симуляцию для получения аналитики</p>
          </div>
        </div>
      </Card>
    );
  }

  const avgAge = people.length > 0 ? people.reduce((sum, p) => sum + p.age, 0) / people.length : 0;
  const avgMobility = people.length > 0 ? people.reduce((sum, p) => sum + p.mobility, 0) / people.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon name="Clock" className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Время эвакуации</p>
              <p className="text-2xl font-bold">{results.evacuationTime.toFixed(1)} сек</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Icon name="Users" className="text-secondary" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Эвакуировано</p>
              <p className="text-2xl font-bold">{people.length} чел</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Icon name="AlertTriangle" className="text-destructive" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Заторов</p>
              <p className="text-2xl font-bold">{results.bottlenecks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Icon name="Activity" className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ср. мобильность</p>
              <p className="text-2xl font-bold">{avgMobility.toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {results.bottlenecks.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="AlertTriangle" className="text-destructive" size={20} />
            <h3 className="text-lg font-semibold">Узкие места (заторы)</h3>
          </div>
          <div className="space-y-2">
            {results.bottlenecks.map((bottleneck, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="font-mono">
                    #{idx + 1}
                  </Badge>
                  <div className="text-sm">
                    <p className="font-medium">
                      Координаты: x={bottleneck.x.toFixed(0)}, y={bottleneck.y.toFixed(0)}
                    </p>
                    <p className="text-muted-foreground">
                      Этаж {bottleneck.floor}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-destructive">
                    {bottleneck.density.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">плотность</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="TrendingUp" className="text-primary" size={20} />
          <h3 className="text-lg font-semibold">Тепловая карта плотности</h3>
        </div>
        <div className="space-y-3">
          {results.heatmapData.map((floorData, floorIdx) => {
            const maxDensity = Math.max(...floorData.flat());
            if (maxDensity === 0) return null;

            return (
              <div key={floorIdx} className="space-y-2">
                <p className="text-sm font-medium">Этаж {floorIdx + 1}</p>
                <div className="grid grid-cols-50 gap-px bg-muted p-1 rounded-lg overflow-hidden">
                  {floorData.map((row, i) =>
                    row.map((density, j) => {
                      const intensity = density / maxDensity;
                      let color = 'bg-background';
                      if (intensity > 0.7) color = 'bg-red-500';
                      else if (intensity > 0.4) color = 'bg-orange-500';
                      else if (intensity > 0.2) color = 'bg-yellow-500';
                      else if (intensity > 0) color = 'bg-green-500';

                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`w-2 h-2 ${color}`}
                          title={`Плотность: ${density.toFixed(1)}`}
                        />
                      );
                    })
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-muted-foreground">Низкая</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded" />
                    <span className="text-muted-foreground">Средняя</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded" />
                    <span className="text-muted-foreground">Высокая</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-muted-foreground">Критическая</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Users" className="text-secondary" size={20} />
          <h3 className="text-lg font-semibold">Характеристики группы</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Средний возраст</p>
            <p className="text-xl font-bold">{avgAge.toFixed(1)} лет</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Всего людей</p>
            <p className="text-xl font-bold">{people.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Мобильность</p>
            <p className="text-xl font-bold">{avgMobility.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Скорость эвакуации</p>
            <p className="text-xl font-bold">
              {(people.length / results.evacuationTime).toFixed(2)} чел/сек
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-primary mt-0.5" size={20} />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-foreground">Рекомендации по оптимизации:</p>
            <ul className="space-y-1 text-muted-foreground">
              {results.bottlenecks.length > 3 && (
                <li>• Критическое количество заторов — расширьте выходы или добавьте альтернативные пути</li>
              )}
              {results.evacuationTime > 180 && (
                <li>• Время эвакуации превышает 3 минуты — оптимизируйте маршруты и увеличьте пропускную способность</li>
              )}
              {avgMobility < 70 && (
                <li>• Низкая средняя мобильность группы — предусмотрите пандусы и специальные выходы</li>
              )}
              {people.length > 50 && results.bottlenecks.length === 0 && (
                <li>✓ Отличная организация эвакуации для данной группы</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
