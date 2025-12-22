import { GeneratorConfig } from '@/types/generator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Code, Info } from 'lucide-react';

interface PixelsStepProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

export function PixelsStep({ config, onConfigChange }: PixelsStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Code className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Scripts e Pixels</h2>
        <p className="text-muted-foreground">
          Adicione pixels de rastreamento e scripts personalizados
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Pixels suportados:</p>
            <p>Google Ads, Meta Pixel, TikTok Pixel, Google Analytics, e qualquer outro script personalizado.</p>
          </div>
        </div>

        {/* Code Input */}
        <div className="space-y-3">
          <Label htmlFor="custom-pixels" className="text-sm font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Código dos Pixels
          </Label>
          <Textarea
            id="custom-pixels"
            value={config.customPixels}
            onChange={(e) => onConfigChange({ ...config, customPixels: e.target.value })}
            placeholder={`<!-- Google Ads -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXX');
</script>

<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s){...}
</script>`}
            rows={12}
            className="font-mono text-sm bg-secondary/30 border-border/50 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Cole o código completo dos pixels, incluindo as tags &lt;script&gt;. 
            Eles serão adicionados no &lt;head&gt; da página gerada.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Adicionar Template</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Google Ads', template: '<!-- Google Ads -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'AW-XXXXXXX\');\n</script>' },
              { name: 'Meta Pixel', template: '<!-- Meta Pixel -->\n<script>\n  !function(f,b,e,v,n,t,s)\n  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n  n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\';\n  n.queue=[];t=b.createElement(e);t.async=!0;\n  t.src=v;s=b.getElementsByTagName(e)[0];\n  s.parentNode.insertBefore(t,s)}(window, document,\'script\',\n  \'https://connect.facebook.net/en_US/fbevents.js\');\n  fbq(\'init\', \'YOUR_PIXEL_ID\');\n  fbq(\'track\', \'PageView\');\n</script>' },
              { name: 'TikTok', template: '<!-- TikTok Pixel -->\n<script>\n  !function (w, d, t) {\n    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};\n    ttq.load(\'YOUR_PIXEL_ID\');\n    ttq.page();\n  }(window, document, \'ttq\');\n</script>' },
            ].map((pixel) => (
              <button
                key={pixel.name}
                onClick={() => onConfigChange({ 
                  ...config, 
                  customPixels: config.customPixels 
                    ? `${config.customPixels}\n\n${pixel.template}` 
                    : pixel.template 
                })}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-primary/50 transition-colors"
              >
                + {pixel.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
