import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Target, Hash, FileText, Search } from 'lucide-react';

interface PageEvent {
  id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  created_at: string;
}

interface TrafficSourcesProps {
  events: PageEvent[];
}

export function TrafficSources({ events }: TrafficSourcesProps) {
  const utmData = useMemo(() => {
    const sources: Record<string, number> = {};
    const mediums: Record<string, number> = {};
    const campaigns: Record<string, number> = {};
    const referrers: Record<string, number> = {};

    events.forEach(event => {
      // Sources
      const source = event.utm_source || 'Direto';
      sources[source] = (sources[source] || 0) + 1;

      // Mediums
      if (event.utm_medium) {
        mediums[event.utm_medium] = (mediums[event.utm_medium] || 0) + 1;
      }

      // Campaigns
      if (event.utm_campaign) {
        campaigns[event.utm_campaign] = (campaigns[event.utm_campaign] || 0) + 1;
      }

      // Referrers
      if (event.referrer) {
        try {
          const url = new URL(event.referrer);
          const domain = url.hostname;
          referrers[domain] = (referrers[domain] || 0) + 1;
        } catch {
          referrers[event.referrer] = (referrers[event.referrer] || 0) + 1;
        }
      }
    });

    return {
      sources: Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5),
      mediums: Object.entries(mediums).sort((a, b) => b[1] - a[1]).slice(0, 5),
      campaigns: Object.entries(campaigns).sort((a, b) => b[1] - a[1]).slice(0, 5),
      referrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [events]);

  const total = events.length;

  const sections = [
    { 
      title: 'Fontes (utm_source)', 
      icon: Globe, 
      data: utmData.sources, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Mídia (utm_medium)', 
      icon: Target, 
      data: utmData.mediums, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Campanhas', 
      icon: Hash, 
      data: utmData.campaigns, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Referrers', 
      icon: FileText, 
      data: utmData.referrers, 
      color: 'bg-orange-500' 
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Origem do Tráfego</h3>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <section.icon className="w-4 h-4 text-muted-foreground" />
              {section.title}
            </div>
            
            {section.data.length > 0 ? (
              <div className="space-y-2">
                {section.data.map(([name, value]) => {
                  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                  
                  return (
                    <div key={name} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground truncate max-w-[60%]" title={name}>
                          {name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{value}</span>
                          <span className="text-xs text-muted-foreground">({percent}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${section.color} transition-all duration-300 rounded-full`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Sem dados</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
