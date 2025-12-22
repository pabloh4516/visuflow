import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, FileText, Eye, Globe, CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WelcomeCardProps {
  hasPages?: boolean;
  hasCloaking?: boolean;
  hasDomain?: boolean;
}

export function WelcomeCard({ hasPages = false, hasCloaking = false, hasDomain = false }: WelcomeCardProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('welcome-card-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('welcome-card-dismissed', 'true');
  };

  const tasks = [
    {
      id: 'pages',
      title: 'Criar primeira página',
      description: 'Crie uma landing page com proteção anti-bot',
      completed: hasPages,
      href: '/app',
      icon: FileText,
    },
    {
      id: 'cloaking',
      title: 'Configurar cloaking',
      description: 'Proteja suas ofertas de revisores',
      completed: hasCloaking,
      href: '/cloaking/new',
      icon: Eye,
    },
    {
      id: 'domain',
      title: 'Conectar domínio próprio',
      description: 'Use seu domínio personalizado',
      completed: hasDomain,
      href: '/settings/domain',
      icon: Globe,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;
  const allCompleted = completedCount === tasks.length;

  if (dismissed || allCompleted) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground z-10"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Bem-vindo ao VisuFlow!</h3>
            <p className="text-sm text-muted-foreground">
              Complete os passos abaixo para começar a proteger suas páginas
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{completedCount}/{tasks.length} completos</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={task.href}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all group',
                task.completed
                  ? 'bg-success/5 cursor-default'
                  : 'bg-muted/50 hover:bg-muted'
              )}
              onClick={(e) => task.completed && e.preventDefault()}
            >
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                  task.completed ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                )}
              >
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <task.icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {task.description}
                </p>
              </div>
              {!task.completed && (
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
