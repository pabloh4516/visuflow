import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloakingFormData, defaultCloakingFormData } from '@/types/cloaking';
import { Shield, Link2, Bot, Monitor, Smartphone, FileText, ExternalLink, Ban, ShieldCheck, Eye } from 'lucide-react';
import { FakePagePreviewDialog } from './FakePagePreviewDialog';

interface CloakingFormProps {
  initialData?: CloakingFormData;
  onSubmit: (data: CloakingFormData) => Promise<void>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const fakePageTemplates = [
  { value: 1, label: 'Blog', description: 'Artigo de marketing digital' },
  { value: 2, label: 'Manutenção', description: 'Página de site em manutenção' },
  { value: 3, label: 'Corporativo', description: 'Site institucional' },
  { value: 4, label: 'E-commerce', description: 'Página de produto' },
  { value: 5, label: 'Notícias', description: 'Artigo de notícias' },
];

export function CloakingForm({ initialData, onSubmit, isSubmitting, isEditing }: CloakingFormProps) {
  const [formData, setFormData] = useState<CloakingFormData>(initialData || defaultCloakingFormData);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = <K extends keyof CloakingFormData>(field: K, value: CloakingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome do Cloaking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Identificação
          </CardTitle>
          <CardDescription>Nome e slug para identificar esta configuração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cloaking</Label>
            <Input
              id="name"
              placeholder="Ex: Campanha Black Friday"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug personalizado (opcional)</Label>
            <Input
              id="slug"
              placeholder="Ex: black-friday (gera: seudominio.com/p/black-friday)"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            />
            <p className="text-xs text-muted-foreground">
              Use apenas letras minúsculas, números e hífens. Se vazio, será gerado um código curto automático.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* URLs de Destino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            URLs de Destino
          </CardTitle>
          <CardDescription>Para onde usuários reais serão redirecionados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redirect_url">URL Principal</Label>
            <Input
              id="redirect_url"
              type="url"
              placeholder="https://sua-pagina-real.com"
              value={formData.redirect_url}
              onChange={(e) => updateField('redirect_url', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="use_separate_urls"
              checked={formData.use_separate_urls}
              onCheckedChange={(checked) => updateField('use_separate_urls', checked)}
            />
            <Label htmlFor="use_separate_urls" className="text-sm text-muted-foreground">
              Usar URLs diferentes para Desktop e Mobile
            </Label>
          </div>

          {formData.use_separate_urls && (
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="space-y-2">
                <Label htmlFor="redirect_url_desktop" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  URL Desktop
                </Label>
                <Input
                  id="redirect_url_desktop"
                  type="url"
                  placeholder="https://desktop.sua-pagina.com"
                  value={formData.redirect_url_desktop}
                  onChange={(e) => updateField('redirect_url_desktop', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect_url_mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  URL Mobile
                </Label>
                <Input
                  id="redirect_url_mobile"
                  type="url"
                  placeholder="https://mobile.sua-pagina.com"
                  value={formData.redirect_url_mobile}
                  onChange={(e) => updateField('redirect_url_mobile', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ação para Bots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            Ação para Bots
          </CardTitle>
          <CardDescription>O que fazer quando um bot for detectado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.bot_action}
            onValueChange={(value) => updateField('bot_action', value as CloakingFormData['bot_action'])}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="fake_page" id="fake_page" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="fake_page" className="flex items-center gap-2 font-medium cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Exibir Página Fake
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Mostra uma página inofensiva para bots (recomendado)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="redirect" id="redirect" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="redirect" className="flex items-center gap-2 font-medium cursor-pointer">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  Redirecionar
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Redireciona bots para outra URL
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="block" id="block" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="block" className="flex items-center gap-2 font-medium cursor-pointer">
                  <Ban className="h-4 w-4 text-muted-foreground" />
                  Bloquear
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Retorna erro 403 para bots
                </p>
              </div>
            </div>
          </RadioGroup>

          {formData.bot_action === 'fake_page' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Template da Página Fake</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizar Templates
                  </Button>
                </div>
                <Select
                  value={String(formData.fake_page_template)}
                  onValueChange={(value) => updateField('fake_page_template', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {fakePageTemplates.map((template) => (
                      <SelectItem key={template.value} value={String(template.value)}>
                        <div className="flex flex-col">
                          <span>{template.label}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FakePagePreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                selectedTemplate={formData.fake_page_template}
                onSelectTemplate={(template) => updateField('fake_page_template', template)}
              />

              <div className="space-y-2">
                <Label htmlFor="fake_page_html">HTML Personalizado (opcional)</Label>
                <Textarea
                  id="fake_page_html"
                  placeholder="Cole seu HTML personalizado aqui (deixe vazio para usar o template)"
                  value={formData.fake_page_html}
                  onChange={(e) => updateField('fake_page_html', e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
            </div>
          )}

          {formData.bot_action === 'redirect' && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="bot_redirect_url">URL de Redirecionamento para Bots</Label>
              <Input
                id="bot_redirect_url"
                type="url"
                placeholder="https://google.com"
                value={formData.bot_redirect_url}
                onChange={(e) => updateField('bot_redirect_url', e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Safe para Verificadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            URL Safe para Verificadores
          </CardTitle>
          <CardDescription>
            Página segura mostrada para verificadores do TikTok e Facebook (apps com emulador)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="safe_redirect_url">URL Safe (opcional)</Label>
            <Input
              id="safe_redirect_url"
              type="url"
              placeholder="https://sua-pagina-segura.com"
              value={formData.safe_redirect_url}
              onChange={(e) => updateField('safe_redirect_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Quando detectado um verificador de plataforma (ex: TikTok com SwiftShader), o usuário será redirecionado para esta URL em vez de ser bloqueado. Se vazio, usará a ação padrão para bots.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detecção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Detecção de Bots
          </CardTitle>
          <CardDescription>Configure quais métodos de detecção usar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="block_known_bots" className="font-medium cursor-pointer">
                Bloquear Bots Conhecidos
              </Label>
              <p className="text-sm text-muted-foreground">
                Meta, Google, TikTok, Bing e outros crawlers
              </p>
            </div>
            <Switch
              id="block_known_bots"
              checked={formData.block_known_bots}
              onCheckedChange={(checked) => updateField('block_known_bots', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="block_data_centers" className="font-medium cursor-pointer">
                Bloquear Data Centers
              </Label>
              <p className="text-sm text-muted-foreground">
                IPs de AWS, Google Cloud, Azure e outros
              </p>
            </div>
            <Switch
              id="block_data_centers"
              checked={formData.block_data_centers}
              onCheckedChange={(checked) => updateField('block_data_centers', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Cloaking'}
      </Button>
    </form>
  );
}
