import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Megaphone, GraduationCap, Store } from 'lucide-react';

const useCases = [
  {
    icon: Megaphone,
    title: 'Afiliados',
    description:
      'Proteja suas campanhas de afiliado contra revisores. Mostre uma página segura para bots e sua oferta real para clientes.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'hover:border-blue-500/30',
  },
  {
    icon: ShoppingBag,
    title: 'Dropshipping',
    description:
      'Evite bloqueios de anúncios mostrando páginas de produto genéricas para revisores enquanto direciona tráfego real.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: GraduationCap,
    title: 'Infoprodutos',
    description:
      'Lance seus infoprodutos com segurança. Proteja VSLs e páginas de vendas de serem copiadas ou bloqueadas.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'hover:border-purple-500/30',
  },
  {
    icon: Store,
    title: 'E-commerce',
    description:
      'Crie páginas de pré-venda para produtos específicos com proteção total contra scrapers e bots.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'hover:border-orange-500/30',
  },
];

export default function LandingUseCases() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ideal Para
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluções para diferentes tipos de negócios digitais
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, i) => (
            <Card
              key={i}
              className={`border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${useCase.borderColor}`}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${useCase.bgColor} mb-4`}
                >
                  <useCase.icon className={`h-7 w-7 ${useCase.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {useCase.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
