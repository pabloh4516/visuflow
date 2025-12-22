export type FakePageTemplateKey = 'blog' | 'maintenance' | 'corporate' | 'ecommerce' | 'news' | 'custom';

export interface FakePageTemplate {
  name: string;
  icon: string;
  description: string;
  html: string;
}

export const fakePageTemplates: Record<Exclude<FakePageTemplateKey, 'custom'>, FakePageTemplate> = {
  blog: {
    name: 'Blog de Notícias',
    icon: '📰',
    description: 'Artigo sobre produtividade',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5 Estratégias de Marketing Digital para 2025 | Blog Empresarial</title>
  <meta name="description" content="Descubra as melhores estratégias de marketing digital que vão transformar seu negócio em 2025. Guia completo com dicas práticas.">
  <meta property="og:title" content="5 Estratégias de Marketing Digital para 2025">
  <meta property="og:description" content="Guia completo com as melhores estratégias de marketing digital para 2025">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; background: #fafafa; }
    .header { background: #fff; border-bottom: 1px solid #eee; padding: 20px 0; position: sticky; top: 0; z-index: 100; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .nav { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 700; color: #1a1a1a; text-decoration: none; }
    .nav-links { display: flex; gap: 24px; list-style: none; }
    .nav-links a { color: #666; text-decoration: none; font-size: 14px; }
    .nav-links a:hover { color: #1a1a1a; }
    .article { background: #fff; margin: 40px auto; padding: 48px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .article h1 { font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 16px; color: #1a1a1a; }
    .meta { display: flex; gap: 16px; color: #888; font-size: 14px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #eee; }
    .content p { margin-bottom: 20px; color: #444; font-size: 17px; }
    .content h2 { font-size: 24px; font-weight: 600; margin: 32px 0 16px; color: #1a1a1a; }
    .content ul { margin: 16px 0 24px 24px; }
    .content li { margin-bottom: 8px; color: #444; }
    .sidebar { margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; }
    .sidebar h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #1a1a1a; }
    .sidebar ul { list-style: none; }
    .sidebar li { margin-bottom: 12px; }
    .sidebar a { color: #0066cc; text-decoration: none; font-size: 14px; }
    .footer { text-align: center; padding: 40px 20px; color: #888; font-size: 14px; }
    @media (max-width: 768px) { .article { padding: 24px; margin: 20px; } .article h1 { font-size: 24px; } .nav-links { display: none; } }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <a href="/" class="logo">Blog Empresarial</a>
        <ul class="nav-links">
          <li><a href="/marketing">Marketing</a></li>
          <li><a href="/negocios">Negócios</a></li>
          <li><a href="/tecnologia">Tecnologia</a></li>
          <li><a href="/carreira">Carreira</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="container">
    <article class="article">
      <h1>5 Estratégias de Marketing Digital que Vão Transformar seu Negócio em 2025</h1>
      <div class="meta">
        <span>Por João Silva</span>
        <span>18 de dezembro de 2024</span>
        <span>8 min de leitura</span>
      </div>
      
      <div class="content">
        <p>O marketing digital está em constante evolução, e 2025 promete ser um ano de grandes mudanças. Com o avanço da inteligência artificial, novas formas de interação com o consumidor e mudanças nos algoritmos das principais plataformas, empresas precisam se adaptar rapidamente para manter sua competitividade.</p>
        
        <p>Neste artigo, vamos explorar as cinco principais estratégias que você deve implementar para garantir o sucesso do seu negócio no próximo ano. Cada uma dessas táticas foi cuidadosamente selecionada com base em pesquisas de mercado e tendências emergentes.</p>
        
        <h2>1. Inteligência Artificial no Atendimento</h2>
        <p>A IA está revolucionando a forma como empresas interagem com clientes. Chatbots inteligentes, assistentes virtuais e sistemas de recomendação personalizados são apenas algumas das aplicações que estão transformando a experiência do consumidor.</p>
        
        <p>Empresas que adotam essas tecnologias conseguem oferecer atendimento 24/7, respostas instantâneas e uma experiência altamente personalizada. Estudos mostram que 73% dos consumidores preferem interagir com marcas que oferecem experiências personalizadas.</p>
        
        <h2>2. Marketing de Conteúdo Autêntico</h2>
        <p>Em um mundo saturado de informações, a autenticidade se tornou um diferencial competitivo. Consumidores estão cada vez mais céticos em relação a propagandas tradicionais e buscam conexões genuínas com as marcas.</p>
        
        <ul>
          <li>Conte histórias reais sobre sua marca e clientes</li>
          <li>Mostre os bastidores da sua empresa</li>
          <li>Seja transparente sobre processos e valores</li>
          <li>Engaje com sua comunidade de forma autêntica</li>
        </ul>
        
        <h2>3. Vídeo de Formato Curto</h2>
        <p>O consumo de vídeos curtos explodiu nos últimos anos, e essa tendência só vai crescer. Plataformas como TikTok, Instagram Reels e YouTube Shorts dominam a atenção dos usuários, especialmente das gerações mais jovens.</p>
        
        <h2>4. SEO para Busca por Voz</h2>
        <p>Com a popularização de assistentes de voz como Alexa, Google Assistant e Siri, otimizar seu conteúdo para buscas por voz se tornou essencial. Isso significa adaptar seu SEO para perguntas naturais e linguagem conversacional.</p>
        
        <h2>5. Comunidades e Engajamento</h2>
        <p>Construir uma comunidade engajada ao redor da sua marca é uma das estratégias mais poderosas para o longo prazo. Grupos exclusivos, programas de fidelidade e eventos online são formas eficazes de criar conexões duradouras.</p>
        
        <h2>Conclusão</h2>
        <p>Implementar essas estratégias pode parecer desafiador, mas os resultados valem o esforço. Comece identificando quais táticas fazem mais sentido para o seu negócio e implemente de forma gradual. O importante é começar agora e se adaptar conforme aprende mais sobre seu público.</p>
      </div>
      
      <aside class="sidebar">
        <h3>Artigos Relacionados</h3>
        <ul>
          <li><a href="#">Como Aumentar suas Vendas Online em 2025</a></li>
          <li><a href="#">SEO: Guia Completo para Iniciantes</a></li>
          <li><a href="#">Redes Sociais: Tendências para o Próximo Ano</a></li>
          <li><a href="#">E-mail Marketing: Estratégias que Funcionam</a></li>
        </ul>
      </aside>
    </article>
  </main>

  <footer class="footer">
    <p>&copy; 2024 Blog Empresarial. Todos os direitos reservados.</p>
  </footer>
</body>
</html>`
  },
  maintenance: {
    name: 'Em Manutenção',
    icon: '🛠️',
    description: 'Página de manutenção profissional',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site em Manutenção | Voltamos em Breve</title>
  <meta name="description" content="Estamos realizando melhorias em nosso site. Voltamos em breve com novidades!">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      text-align: center;
      padding: 20px;
    }
    .container { max-width: 600px; }
    .icon { font-size: 80px; margin-bottom: 30px; animation: float 3s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    h1 { font-size: 48px; font-weight: 700; margin-bottom: 16px; }
    .subtitle { font-size: 20px; opacity: 0.9; margin-bottom: 40px; line-height: 1.6; }
    .progress-container { background: rgba(255,255,255,0.2); border-radius: 20px; height: 8px; width: 100%; max-width: 400px; margin: 0 auto 40px; overflow: hidden; }
    .progress-bar { background: #fff; height: 100%; width: 75%; border-radius: 20px; animation: progress 2s ease-in-out infinite; }
    @keyframes progress { 0% { width: 60%; } 50% { width: 80%; } 100% { width: 60%; } }
    .eta { font-size: 14px; opacity: 0.8; margin-bottom: 40px; }
    .contact { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; backdrop-filter: blur(10px); }
    .contact h3 { font-size: 16px; margin-bottom: 12px; font-weight: 600; }
    .contact p { font-size: 14px; opacity: 0.8; }
    .contact a { color: #fff; text-decoration: underline; }
    .footer { margin-top: 60px; font-size: 12px; opacity: 0.6; }
    @media (max-width: 768px) { h1 { font-size: 32px; } .icon { font-size: 60px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🛠️</div>
    <h1>Estamos em Manutenção</h1>
    <p class="subtitle">Estamos trabalhando para melhorar sua experiência. Em breve voltamos com novidades incríveis!</p>
    
    <div class="progress-container">
      <div class="progress-bar"></div>
    </div>
    
    <p class="eta">Previsão de retorno: Em algumas horas</p>
    
    <div class="contact">
      <h3>Precisa de ajuda urgente?</h3>
      <p>Entre em contato pelo e-mail <a href="mailto:contato@empresa.com">contato@empresa.com</a></p>
    </div>
    
    <p class="footer">&copy; 2024 Empresa. Todos os direitos reservados.</p>
  </div>
</body>
</html>`
  },
  corporate: {
    name: 'Página Corporativa',
    icon: '🏢',
    description: 'Homepage empresarial genérica',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Innovate Solutions | Soluções Empresariais</title>
  <meta name="description" content="Oferecemos soluções empresariais inovadoras para transformar seu negócio. Consultoria, tecnologia e resultados.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #fff; padding: 20px 0; border-bottom: 1px solid #eee; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .nav { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 700; color: #2563eb; }
    .nav-links { display: flex; gap: 32px; list-style: none; }
    .nav-links a { color: #666; text-decoration: none; font-size: 15px; font-weight: 500; }
    .hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #fff; padding: 100px 0; text-align: center; }
    .hero h1 { font-size: 48px; font-weight: 700; margin-bottom: 20px; }
    .hero p { font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; }
    .btn { display: inline-block; padding: 16px 32px; background: #fff; color: #2563eb; font-weight: 600; text-decoration: none; border-radius: 8px; font-size: 16px; }
    .btn:hover { background: #f0f0f0; }
    .features { padding: 80px 0; background: #f8fafc; }
    .features h2 { text-align: center; font-size: 36px; margin-bottom: 60px; color: #1a1a1a; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .feature { background: #fff; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .feature-icon { font-size: 48px; margin-bottom: 20px; }
    .feature h3 { font-size: 20px; margin-bottom: 12px; color: #1a1a1a; }
    .feature p { color: #666; font-size: 15px; }
    .stats { padding: 60px 0; background: #1e40af; color: #fff; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
    .stat-number { font-size: 48px; font-weight: 700; margin-bottom: 8px; }
    .stat-label { font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
    .footer { background: #0f172a; color: #94a3b8; padding: 60px 0 40px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 40px; }
    .footer h4 { color: #fff; font-size: 16px; margin-bottom: 20px; }
    .footer ul { list-style: none; }
    .footer li { margin-bottom: 12px; }
    .footer a { color: #94a3b8; text-decoration: none; font-size: 14px; }
    .footer-bottom { border-top: 1px solid #1e293b; padding-top: 30px; text-align: center; font-size: 14px; }
    @media (max-width: 768px) { 
      .features-grid { grid-template-columns: 1fr; } 
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: 1fr; }
      .hero h1 { font-size: 32px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="logo">Innovate Solutions</div>
        <ul class="nav-links">
          <li><a href="#">Sobre</a></li>
          <li><a href="#">Serviços</a></li>
          <li><a href="#">Cases</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Contato</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>Transformamos Negócios com Tecnologia</h1>
      <p>Soluções empresariais inovadoras para acelerar o crescimento da sua empresa. Consultoria estratégica, desenvolvimento e resultados.</p>
      <a href="#" class="btn">Fale Conosco</a>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <h2>Nossos Serviços</h2>
      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon">💡</div>
          <h3>Consultoria Estratégica</h3>
          <p>Análise completa do seu negócio e planejamento estratégico para alcançar seus objetivos.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">⚡</div>
          <h3>Transformação Digital</h3>
          <p>Modernize seus processos e adote tecnologias que impulsionam a produtividade.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📊</div>
          <h3>Business Intelligence</h3>
          <p>Dashboards e análises para tomar decisões baseadas em dados concretos.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        <div>
          <div class="stat-number">500+</div>
          <div class="stat-label">Clientes Atendidos</div>
        </div>
        <div>
          <div class="stat-number">15</div>
          <div class="stat-label">Anos de Mercado</div>
        </div>
        <div>
          <div class="stat-number">98%</div>
          <div class="stat-label">Satisfação</div>
        </div>
        <div>
          <div class="stat-number">50+</div>
          <div class="stat-label">Especialistas</div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>Innovate Solutions</h4>
          <p>Transformando negócios através de soluções tecnológicas inovadoras desde 2009.</p>
        </div>
        <div>
          <h4>Empresa</h4>
          <ul>
            <li><a href="#">Sobre Nós</a></li>
            <li><a href="#">Carreiras</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4>Serviços</h4>
          <ul>
            <li><a href="#">Consultoria</a></li>
            <li><a href="#">Desenvolvimento</a></li>
            <li><a href="#">Suporte</a></li>
          </ul>
        </div>
        <div>
          <h4>Contato</h4>
          <ul>
            <li><a href="#">contato@innovate.com</a></li>
            <li><a href="#">(11) 3000-0000</a></li>
            <li><a href="#">São Paulo, SP</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Innovate Solutions. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
</body>
</html>`
  },
  ecommerce: {
    name: 'Produto E-commerce',
    icon: '🛒',
    description: 'Página de produto com reviews',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fone Bluetooth Premium | TechStore</title>
  <meta name="description" content="Fone de ouvido Bluetooth Premium com cancelamento de ruído ativo, bateria de 40h e qualidade de áudio Hi-Fi. Frete grátis!">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .header { background: #1a1a1a; padding: 16px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .nav { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 700; color: #fff; }
    .cart { color: #fff; font-size: 14px; display: flex; align-items: center; gap: 8px; }
    .breadcrumb { padding: 16px 0; font-size: 14px; color: #666; }
    .breadcrumb a { color: #666; text-decoration: none; }
    .product { background: #fff; border-radius: 12px; padding: 40px; margin-bottom: 24px; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .product-image { background: #f8f8f8; border-radius: 12px; padding: 40px; text-align: center; }
    .product-image img { max-width: 100%; height: auto; }
    .product-placeholder { font-size: 150px; }
    .product-info h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
    .rating { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .stars { color: #f59e0b; font-size: 18px; }
    .rating-text { color: #666; font-size: 14px; }
    .price { margin-bottom: 24px; }
    .price-current { font-size: 36px; font-weight: 700; color: #16a34a; }
    .price-original { font-size: 18px; color: #999; text-decoration: line-through; margin-left: 12px; }
    .discount { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-left: 12px; }
    .shipping { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .shipping-text { color: #166534; font-size: 14px; font-weight: 600; }
    .features { margin-bottom: 24px; }
    .features li { margin-bottom: 8px; color: #444; display: flex; align-items: center; gap: 8px; }
    .features li::before { content: "✓"; color: #16a34a; font-weight: 700; }
    .btn-buy { width: 100%; padding: 18px; background: #f59e0b; color: #fff; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; margin-bottom: 12px; }
    .btn-cart { width: 100%; padding: 18px; background: #fff; color: #1a1a1a; border: 2px solid #1a1a1a; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; }
    .reviews { background: #fff; border-radius: 12px; padding: 40px; }
    .reviews h2 { font-size: 24px; margin-bottom: 24px; }
    .review { border-bottom: 1px solid #eee; padding: 24px 0; }
    .review:last-child { border-bottom: none; }
    .review-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .reviewer { font-weight: 600; color: #1a1a1a; }
    .review-date { color: #999; font-size: 14px; }
    .review-stars { color: #f59e0b; margin-bottom: 8px; }
    .review-text { color: #666; }
    .footer { text-align: center; padding: 40px; color: #666; font-size: 14px; }
    @media (max-width: 768px) { 
      .product-grid { grid-template-columns: 1fr; gap: 24px; } 
      .product { padding: 24px; }
      .product-info h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="logo">TechStore</div>
        <div class="cart">🛒 Carrinho (0)</div>
      </nav>
    </div>
  </header>

  <div class="container">
    <div class="breadcrumb">
      <a href="#">Home</a> / <a href="#">Eletrônicos</a> / <a href="#">Fones de Ouvido</a> / Fone Bluetooth Premium
    </div>

    <div class="product">
      <div class="product-grid">
        <div class="product-image">
          <div class="product-placeholder">🎧</div>
        </div>
        <div class="product-info">
          <h1>Fone de Ouvido Bluetooth Premium com Cancelamento de Ruído</h1>
          <div class="rating">
            <span class="stars">★★★★★</span>
            <span class="rating-text">4.8 (2.547 avaliações)</span>
          </div>
          <div class="price">
            <span class="price-current">R$ 299,90</span>
            <span class="price-original">R$ 499,90</span>
            <span class="discount">-40%</span>
          </div>
          <div class="shipping">
            <span class="shipping-text">🚚 FRETE GRÁTIS para todo Brasil</span>
          </div>
          <ul class="features">
            <li>Cancelamento de ruído ativo (ANC)</li>
            <li>Bateria de 40 horas de duração</li>
            <li>Qualidade de áudio Hi-Fi com drivers de 40mm</li>
            <li>Conexão Bluetooth 5.3 estável</li>
            <li>Microfone integrado para chamadas</li>
            <li>Almofadas em espuma memory foam</li>
          </ul>
          <button class="btn-buy">Comprar Agora</button>
          <button class="btn-cart">Adicionar ao Carrinho</button>
        </div>
      </div>
    </div>

    <div class="reviews">
      <h2>Avaliações dos Clientes</h2>
      <div class="review">
        <div class="review-header">
          <span class="reviewer">Carlos M.</span>
          <span class="review-date">15/12/2024</span>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">Produto excelente! O cancelamento de ruído é impressionante, uso todos os dias no trabalho. A bateria dura muito e o conforto é perfeito.</p>
      </div>
      <div class="review">
        <div class="review-header">
          <span class="reviewer">Ana Paula S.</span>
          <span class="review-date">10/12/2024</span>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">Superou minhas expectativas! Qualidade de som incrível e muito confortável. Recomendo demais!</p>
      </div>
      <div class="review">
        <div class="review-header">
          <span class="reviewer">Roberto L.</span>
          <span class="review-date">05/12/2024</span>
        </div>
        <div class="review-stars">★★★★☆</div>
        <p class="review-text">Muito bom o produto. Só achei que poderia ter um estojo de transporte melhor. Mas no geral, vale muito a pena pelo preço.</p>
      </div>
    </div>
  </div>

  <footer class="footer">
    <p>&copy; 2024 TechStore. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
  </footer>
</body>
</html>`
  },
  news: {
    name: 'Portal de Notícias',
    icon: '📱',
    description: 'Notícia sobre tecnologia',
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova tecnologia promete revolucionar setor de energia | TechNews</title>
  <meta name="description" content="Empresa brasileira desenvolve tecnologia inovadora que pode reduzir custos de energia em até 40%. Saiba mais sobre essa revolução.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #1a1a1a; background: #fff; }
    .header { background: #dc2626; padding: 12px 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-family: 'Segoe UI', sans-serif; font-size: 28px; font-weight: 700; color: #fff; }
    .date { color: rgba(255,255,255,0.8); font-size: 14px; font-family: 'Segoe UI', sans-serif; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .nav { background: #1a1a1a; padding: 12px 0; }
    .nav-links { display: flex; gap: 24px; list-style: none; justify-content: center; }
    .nav-links a { color: #fff; text-decoration: none; font-size: 14px; font-family: 'Segoe UI', sans-serif; text-transform: uppercase; letter-spacing: 1px; }
    .breaking { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 20px 0; font-family: 'Segoe UI', sans-serif; }
    .breaking-label { color: #dc2626; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-right: 8px; }
    .article { padding: 40px 0; }
    .category { color: #dc2626; font-size: 14px; font-family: 'Segoe UI', sans-serif; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .article h1 { font-size: 40px; font-weight: 700; line-height: 1.2; margin-bottom: 20px; }
    .subtitle { font-size: 22px; color: #666; margin-bottom: 24px; font-style: italic; }
    .meta { display: flex; gap: 24px; color: #888; font-size: 14px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #eee; font-family: 'Segoe UI', sans-serif; }
    .featured-image { width: 100%; height: 400px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 8px; margin-bottom: 32px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 100px; }
    .content p { margin-bottom: 24px; font-size: 19px; }
    .content h2 { font-size: 28px; margin: 40px 0 20px; }
    .quote { background: #f8f8f8; border-left: 4px solid #dc2626; padding: 24px 32px; margin: 32px 0; font-style: italic; font-size: 22px; }
    .quote-author { font-size: 14px; color: #666; margin-top: 12px; font-style: normal; font-family: 'Segoe UI', sans-serif; }
    .tags { margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; }
    .tags-label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 12px; font-family: 'Segoe UI', sans-serif; }
    .tag { display: inline-block; background: #f0f0f0; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-right: 8px; margin-bottom: 8px; color: #666; font-family: 'Segoe UI', sans-serif; }
    .related { background: #f8f8f8; padding: 40px 0; margin-top: 40px; }
    .related h3 { font-size: 24px; margin-bottom: 24px; }
    .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .related-item { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .related-image { height: 120px; background: #ddd; display: flex; align-items: center; justify-content: center; font-size: 40px; }
    .related-content { padding: 16px; }
    .related-title { font-size: 16px; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
    .footer { background: #1a1a1a; color: #888; padding: 40px 0; text-align: center; font-size: 14px; font-family: 'Segoe UI', sans-serif; }
    @media (max-width: 768px) { 
      .article h1 { font-size: 28px; } 
      .featured-image { height: 200px; }
      .related-grid { grid-template-columns: 1fr; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">TechNews</div>
        <div class="date">Quarta-feira, 18 de Dezembro de 2024</div>
      </div>
    </div>
  </header>

  <nav class="nav">
    <ul class="nav-links">
      <li><a href="#">Tecnologia</a></li>
      <li><a href="#">Negócios</a></li>
      <li><a href="#">Ciência</a></li>
      <li><a href="#">Inovação</a></li>
      <li><a href="#">Startups</a></li>
    </ul>
  </nav>

  <div class="container">
    <div class="breaking">
      <span class="breaking-label">Última Hora</span>
      Empresa recebe aporte de R$ 500 milhões para expansão internacional
    </div>

    <article class="article">
      <div class="category">Tecnologia</div>
      <h1>Nova tecnologia brasileira promete revolucionar o setor de energia renovável</h1>
      <p class="subtitle">Startup paulista desenvolve sistema que aumenta eficiência de painéis solares em até 40%, atraindo atenção de investidores internacionais</p>
      
      <div class="meta">
        <span>Por Maria Santos</span>
        <span>18 de dezembro de 2024</span>
        <span>6 min de leitura</span>
      </div>

      <div class="featured-image">⚡</div>

      <div class="content">
        <p>Uma startup brasileira desenvolveu uma tecnologia que promete transformar o mercado de energia renovável. O sistema, batizado de SolarMax, utiliza inteligência artificial para otimizar a captação de energia solar, aumentando a eficiência dos painéis em até 40%.</p>

        <p>A empresa, fundada há três anos em São Paulo por engenheiros formados na USP e Unicamp, já atraiu mais de R$ 500 milhões em investimentos de fundos internacionais e prepara sua expansão para mercados da Europa e Ásia.</p>

        <div class="quote">
          "Estamos apenas começando. Nossa tecnologia tem o potencial de acelerar significativamente a transição energética global e tornar a energia limpa acessível para milhões de pessoas."
          <div class="quote-author">— Dr. Paulo Mendes, CEO e co-fundador da SolarMax</div>
        </div>

        <h2>Como funciona a tecnologia</h2>
        <p>O sistema utiliza sensores IoT e algoritmos de machine learning para ajustar em tempo real o ângulo e a posição dos painéis solares, maximizando a captação de luz durante todo o dia. Além disso, a tecnologia é capaz de prever padrões climáticos e ajustar o sistema antes de mudanças nas condições meteorológicas.</p>

        <p>Segundo estudos independentes realizados por universidades brasileiras e europeias, os resultados são consistentes: aumento médio de 35% a 40% na geração de energia em comparação com sistemas tradicionais.</p>

        <h2>Impacto no mercado</h2>
        <p>Especialistas do setor energético afirmam que a tecnologia pode acelerar a adoção de energia solar em países em desenvolvimento, onde o custo ainda é uma barreira significativa. Com a maior eficiência, o retorno sobre o investimento em sistemas solares pode ser alcançado em até 30% menos tempo.</p>

        <p>A empresa planeja abrir sua primeira fábrica internacional no primeiro semestre de 2025, com previsão de criar mais de 2.000 empregos diretos nos próximos três anos.</p>
      </div>

      <div class="tags">
        <div class="tags-label">Tags</div>
        <span class="tag">Energia Solar</span>
        <span class="tag">Startups</span>
        <span class="tag">Tecnologia Verde</span>
        <span class="tag">Inovação</span>
        <span class="tag">Sustentabilidade</span>
      </div>
    </article>
  </div>

  <section class="related">
    <div class="container">
      <h3>Leia Também</h3>
      <div class="related-grid">
        <div class="related-item">
          <div class="related-image">🔋</div>
          <div class="related-content">
            <div class="related-title">Baterias de estado sólido chegam ao mercado em 2025</div>
          </div>
        </div>
        <div class="related-item">
          <div class="related-image">🚗</div>
          <div class="related-content">
            <div class="related-title">Carros elétricos dominam vendas na Europa pela primeira vez</div>
          </div>
        </div>
        <div class="related-item">
          <div class="related-image">🌍</div>
          <div class="related-content">
            <div class="related-title">Brasil atinge meta de energia limpa 5 anos antes do previsto</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>&copy; 2024 TechNews. Todos os direitos reservados.</p>
  </footer>
</body>
</html>`
  },
};

export function getTemplateHtml(templateKey: FakePageTemplateKey, customHtml?: string): string {
  if (templateKey === 'custom') {
    return customHtml || '';
  }
  return fakePageTemplates[templateKey]?.html || '';
}
