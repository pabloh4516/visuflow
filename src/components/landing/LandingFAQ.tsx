import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'O que é cloaking e como funciona?',
    answer:
      'Cloaking é uma técnica que mostra diferentes conteúdos para usuários reais e para bots/ferramentas de revisão. Quando um bot acessa sua página, ele vê uma versão "segura", enquanto usuários reais são redirecionados para sua oferta. Isso protege suas campanhas de bloqueios.',
  },
  {
    question: 'Como funciona a proteção anti-bot?',
    answer:
      'Nossa proteção utiliza múltiplas camadas de detecção: análise de User-Agent, detecção de WebDriver/headless browsers, verificação de IPs de data centers, análise de comportamento e fingerprinting. Bots são automaticamente bloqueados ou redirecionados.',
  },
  {
    question: 'Posso usar em qualquer servidor?',
    answer:
      'Sim! O HTML gerado é 100% independente e pode ser hospedado em qualquer servidor: Cloudflare Pages, Vercel, Netlify, sua própria hospedagem, ou qualquer outro. Não há dependências externas.',
  },
  {
    question: 'Funciona com TikTok Ads e Facebook Ads?',
    answer:
      'Sim, nossa solução foi desenvolvida especialmente para campanhas de tráfego pago. Detectamos os bots de revisão dessas plataformas e mostramos uma página segura para eles, enquanto seus clientes reais veem sua oferta.',
  },
  {
    question: 'Os screenshots são capturados automaticamente?',
    answer:
      'Sim! Basta informar a URL da sua landing page e nosso sistema captura automaticamente screenshots em resolução desktop e mobile. Eles são usados como background visual da sua presell page.',
  },
  {
    question: 'Quanto tempo leva para gerar uma página?',
    answer:
      'O processo completo leva menos de 2 segundos. Isso inclui capturar os screenshots, aplicar a proteção anti-bot e gerar o HTML final pronto para uso.',
  },
];

export default function LandingFAQ() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o VisuFlow
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card/50 border border-border/50 rounded-lg px-6 data-[state=open]:bg-card/80 transition-colors"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
