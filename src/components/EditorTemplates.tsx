import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { floorTemplates } from '@/data/floorTemplates';
import { Floor } from '@/pages/Index';

interface EditorTemplatesProps {
  setFloors: (floors: Floor[]) => void;
  setCurrentFloor: (floor: number) => void;
  setUploadedImage: (image: HTMLImageElement | null) => void;
  onClearFloor: () => void;
}

const EditorTemplates = ({
  setFloors,
  setCurrentFloor,
  setUploadedImage,
  onClearFloor,
}: EditorTemplatesProps) => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const handleLoadTemplate = (template: typeof floorTemplates[0]) => {
    setFloors(template.floors);
    setCurrentFloor(1);
    setShowTemplateDialog(false);
    toast.success(`Загружен шаблон: ${template.name}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        toast.success('Изображение загружено. Обведите стены по контурам');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pt-4 border-t border-border space-y-2">
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Icon name="Folder" className="mr-2" size={16} />
            Шаблоны планов
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Выберите шаблон плана здания</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {floorTemplates.map((template, idx) => (
              <Card
                key={idx}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleLoadTemplate(template)}
              >
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {template.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Этажей: {template.floors.length}
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <label>
        <Button variant="outline" className="w-full" asChild>
          <span>
            <Icon name="Image" className="mr-2" size={16} />
            Загрузить план (изображение)
          </span>
        </Button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      <div className="pt-2">
        <Button variant="outline" className="w-full" onClick={onClearFloor}>
          <Icon name="Trash2" className="mr-2" size={16} />
          Очистить этаж
        </Button>
      </div>
    </div>
  );
};

export default EditorTemplates;
