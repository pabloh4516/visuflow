import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { fakePageTemplates, FakePageTemplateKey } from '@/lib/fakePageTemplates';

interface FakePagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: number;
  onSelectTemplate: (template: number) => void;
}

const templateKeys: FakePageTemplateKey[] = ['blog', 'maintenance', 'corporate', 'ecommerce', 'news'];

const templateMap: Record<number, FakePageTemplateKey> = {
  1: 'blog',
  2: 'maintenance',
  3: 'corporate',
  4: 'ecommerce',
  5: 'news',
};

const reverseTemplateMap: Record<FakePageTemplateKey, number> = {
  blog: 1,
  maintenance: 2,
  corporate: 3,
  ecommerce: 4,
  news: 5,
  custom: 0,
};

export function FakePagePreviewDialog({
  open,
  onOpenChange,
  selectedTemplate,
  onSelectTemplate,
}: FakePagePreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const key = templateMap[selectedTemplate];
    return templateKeys.indexOf(key);
  });

  const currentKey = templateKeys[currentIndex];
  const template = fakePageTemplates[currentKey];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : templateKeys.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < templateKeys.length - 1 ? prev + 1 : 0));
  };

  const handleSelect = () => {
    onSelectTemplate(reverseTemplateMap[currentKey]);
    onOpenChange(false);
  };

  const openInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(template.html);
      newWindow.document.close();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <DialogTitle className="text-lg">{template.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openInNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden bg-muted">
          {/* Navigation arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Preview iframe */}
          <iframe
            srcDoc={template.html}
            className="w-full h-full border-0"
            title={`Preview: ${template.name}`}
            sandbox="allow-same-origin"
          />
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0">
          {/* Template indicators */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} de {templateKeys.length}
            </span>
            <div className="flex gap-2">
              {templateKeys.map((key, index) => (
                <button
                  key={key}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSelect}>
              Usar este template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
