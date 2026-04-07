const fs = require('fs');
const path = require('path');

// ─── CONFIGURATION ──────────────────────────────────────────

const DATA_FILE = path.join(__dirname, '..', 'tarot-data.js');
const OUTPUT_DIR_SIGNIFICADO = path.join(__dirname, '..', 'significado');
const OUTPUT_DIR_ARTICULOS = path.join(__dirname, '..', 'articulos');

// ─── HELPER: SLUGIFY ─────────────────────────────────────────

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// ─── LOAD DATA ───────────────────────────────────────────────

let tarotDeck = [];
try {
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  // Simple extraction of TAROT_DECK array
  const match = content.match(/const TAROT_DECK = (\[[\s\S]*?\]);/);
  if (match) {
    // We use eval here cautiously as it's our own trusted file in a build script
    tarotDeck = eval(match[1]);
  }
} catch (e) {
  console.error("Error loading tarot data:", e);
  process.exit(1);
}

const majorArcana = tarotDeck.filter(c => c.arcana === "Mayor");

// ─── TEMPLATE ────────────────────────────────────────────────

function getTemplate(title, metaDesc, h1, bodyContent, slug, schema) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${metaDesc}">
    <link rel="stylesheet" href="../../index.css">
    <link rel="stylesheet" href="../article-style.css">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(schema, null, 2)}
    </script>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body>
    <div id="starfield"></div>
    <div id="app" class="article-page">
        <header>
            <a href="/" class="back-link">🔮 Volver al Oráculo</a>
            <h1>${h1}</h1>
            <div class="mystical-divider">✦ ✦ ✦</div>
        </header>

        <article class="panel">
            ${bodyContent}
        </article>

        <section class="cta-section">
            <div class="panel">
                <h2>¿Quieres una respuesta personalizada?</h2>
                <p>Deja que los arcanos guíen tu camino con una lectura gratuita ahora mismo.</p>
                <a href="/" class="draw-btn-link">Hacer mi Tirada de Tarot Gratis</a>
            </div>
        </section>

        <footer>
            ✦ Oráculo del Tarot — Guía de los Arcanos ✦
        </footer>
    </div>

    <!-- Scripts for background only -->
    <script>
      // Simple Starfield Background
      const field = document.getElementById('starfield');
      for(let i=0; i<100; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random()*100 + '%';
        s.style.top = Math.random()*100 + '%';
        s.style.setProperty('--dur', (Math.random()*3 + 3) + 's');
        s.style.setProperty('--delay', Math.random()*5 + 's');
        field.appendChild(s);
      }
    </script>
</body>
</html>`;
}

// ─── GENERATE SIGNIFICADO ───────────────────────────────────

majorArcana.forEach(card => {
  const slug = slugify(card.name);
  const dir = path.join(OUTPUT_DIR_SIGNIFICADO, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const title = `Significado de ${card.name} en el Tarot - Guía Completa`;
  const metaDesc = `Descubre todo lo que significa ${card.name} en el tarot: Amor, Dinero y Salud. Aprende su simbología y lectura al derecho y al revés con el Oráculo.`;
  
  const body = `
    <h2>Interpretación General de ${card.name}</h2>
    <p>${card.name} es el arcano número ${card.numeral} de los Arcanos Mayores. Representa energías de <strong>${card.keywords.join(', ')}</strong>.</p>
    
    <h3>Significado al Derecho</h3>
    <p>${card.upright}</p>
    <p>En una tirada, ${card.name} al derecho nos indica que fluyes con la energía del cosmos en relación a ${card.keywords[0]}. Es un momento de gran potencial espiritual.</p>

    <h3>Significado de ${card.name} en el Amor</h3>
    <p>Cuando ${card.name} aparece en preguntas sentimentales, sugiere que la relación está bajo la influencia de ${card.keywords[1]}. Si estás soltero, es una señal de que debes enfocarte en ${card.keywords[2]} para atraer lo que deseas.</p>

    <h3>Significado al Revés</h3>
    <p>${card.reversed}</p>
    <p>La carta invertida advierte sobre bloqueos o excesos en las áreas de ${card.keywords.slice(-2).join(' y ')}. Es una invitación a la reflexión y al cambio de perspectiva.</p>

    <h3>Simbología de la Carta</h3>
    <p>El símbolo "${card.symbol}" representa la esencia elemental de este arcano. Los colores ${card.colors.join(' y ')} que predominan en su aura reflejan ${card.keywords[0]} y equilibrio.</p>
  `;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": metaDesc,
    "author": { "@type": "Organization", "name": "Oráculo del Tarot" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://tarotgratis.online/significado/${slug}/` }
  };

  fs.writeFileSync(path.join(dir, 'index.html'), getTemplate(title, metaDesc, card.name, body, slug, schema));
});

// ─── GENERATE KEYWORD ARTICLES ──────────────────────────────

const articles = [
  {
    slug: 'tarot-del-amor-gratis',
    title: 'Tarot del Amor Gratis: Tu Lectura Sentimental Online',
    meta: 'Consulta el tarot del amor gratis y descubre tu futuro sentimental. Lectura de cartas detallada para solteros y parejas.',
    h1: 'Lectura de Tarot del Amor',
    content: `
      <h2>¿Qué dice el Tarot del Amor sobre tu relación?</h2>
      <p>El tarot del amor es una de las consultas más solicitadas al oráculo. A través de los arcanos, podemos entender las energías que fluyen entre dos personas y los desafíos que el destino tiene preparados.</p>
      <h3>Cómo realizar una lectura efectiva</h3>
      <p>Antes de tirar las cartas, respira hondo y visualiza a la persona o situación que te inquieta. El amor requiere claridad y honestidad espiritual.</p>
      <p>Nuestra aplicación utiliza inteligencia artificial para interpretar los arcanos mayores en el contexto específico de tus sentimientos, ofreciendo una guía única y personalizada.</p>
    `
  },
  {
    slug: 'tirada-de-tarot-gratis-online',
    title: 'Tirada de Tarot Gratis Online - El Oráculo Interactivo',
    meta: 'Realiza tu tirada de tarot gratis online ahora. Elige tus cartas y recibe una interpretación instantánea con nuestro oráculo virtual.',
    h1: 'Tirada de Tarot Interactiva',
    content: `
      <h2>El Oráculo Virtual a tu disposición</h2>
      <p>Una tirada de tarot online es una herramienta poderosa de introspección. No se trata solo de adivinar el futuro, sino de entender el presente para construir el destino que deseas.</p>
      <h3>Los beneficios del Tarot Online</h3>
      <p>Al contrario que una consulta presencial, la tirada online te permite repetir el proceso en momentos de duda, manteniendo un registro espiritual de tu evolución.</p>
    `
  },
  {
    slug: 'lectura-de-tarot-para-hoy',
    title: 'Lectura de Tarot para Hoy: Guía y Consejo del Día',
    meta: 'Obtén tu lectura de tarot para hoy gratis. Descubre el consejo arcano para tu jornada en amor, trabajo y bienestar.',
    h1: 'Tu Lectura de Tarot para Hoy',
    content: `
      <h2>Consejo Arcano para tu Jornada</h2>
      <p>Cada mañana, el universo nos ofrece una energía renovada. La lectura de tarot para hoy te ayuda a sintonizar con esa vibración y anticipar los desafíos y oportunidades del día.</p>
      <h3>La importancia de la Carta del Día</h3>
      <p>Nuestra recomendación es que consultes una sola carta al despertar. Este arquetipo actuará como tu faro guía durante las próximas 24 horas.</p>
    `
  },
  {
    slug: 'oraculo-gratis-respuestas',
    title: 'Oráculo Gratis Online: Respuestas Inmediatas a tu Destino',
    meta: 'Consulta nuestro oráculo gratis y obtén respuestas inmediatas sobre tu futuro. Descubre cómo el tarot del oráculo te ofrece guía espiritual sin coste.',
    h1: 'Oráculo Gratis Online: Tu Guía Espiritual',
    content: `
      <h2>¿Cómo funciona el Oráculo Gratis?</h2>
      <p>El anhelo de comprender nuestro destino nos ha llevado durante siglos a buscar consejo en el cosmos. Hoy, un <strong>oráculo gratis</strong> te permite obtener esas respuestas desde cualquier lugar, combinando la mística tradicional con la tecnología moderna.</p>
      <h3>La esencia del Tarot del Oráculo</h3>
      <p>A diferencia de una lectura rígida, el <strong>tarot del oráculo gratis</strong> actúa como un espejo de tu energía actual. No sentencia tu futuro, sino que ilumina las posibilidades. Conecta con tu voz interior antes de elegir tu tirada y permite que la interpretación guíe tus decisiones de forma gratuita y personal.</p>
    `
  },
  {
    slug: 'lecturas-de-cartas-online-ia',
    title: 'Lecturas de Cartas Online: Tarot Gratis con Inteligencia Artificial',
    meta: 'Experimenta las mejores lecturas de cartas online y tarot gratis con IA. Descubre la precisión de Llama 3 en la interpretación de los arcanos.',
    h1: 'Lecturas de Cartas Online Potenciadas por IA',
    content: `
      <h2>La Revolución de las Lecturas del Tarot Gratis</h2>
      <p>Las <strong>lecturas de cartas online</strong> han evolucionado radicalmente. Atrás quedaron los sistemas aleatorios que daban respuestas genéricas; en 2026, la inteligencia artificial (como nuestro motor Groq) analiza la posición de la carta y tu pregunta para ofrecer un resultado con profundidad empática.</p>
      <h3>¿Por qué elegir el Tarot Gratis con IA?</h3>
      <p>La IA actúa como un intérprete neutral y altamente capacitado de los arquetipos antiguos. En nuestras <strong>lecturas del tarot gratis</strong>, la máquina no adivina al azar: pondera las dignidades (al derecho o invertida), las combinaciones astrológicas y la intención de tu consulta, logrando revelar conexiones que a veces el ojo humano pasa por alto.</p>
    `
  },
  {
    slug: 'lecturas-del-tarot-gratis-destino',
    title: 'Cómo Aprovechar tus Lecturas del Tarot Gratis para Mejorar tu Vida',
    meta: 'Descubre los mejores consejos para realizar lecturas del tarot gratis online. Aprende cómo formular tus preguntas para recibir la mejor orientación espiritual.',
    h1: 'Maximizando el Valor de tus Lecturas del Tarot Gratis',
    content: `
      <h2>El Arte de Formular la Pregunta</h2>
      <p>Al enfrentarte a las <strong>lecturas del tarot gratis</strong> en nuestro oráculo de 2026, la calidad de tu respuesta dependerá en gran medida de tu enfoque. Es recomendable evitar preguntas cerradas de "Sí o No" y centrarse en el "Cómo" o "Por qué".</p>
      <h3>Conectando con el Oráculo Gratis</h3>
      <p>Cuando utilizas nuestro <strong>oráculo tarot gratis</strong>, respira profundamente. Pregúntale a los arcanos: '¿Qué necesito aprender sobre esta situación?' o '¿Cómo puedo mejorar mi situación actual?'. Esta apertura permite que la tecnología analítica interprete los arquetipos de forma expansiva y revele bloqueos ocultos, guiándote de la mejor forma hacia tus objetivos sin coste alguno.</p>
    `
  }
];

articles.forEach(art => {
  const dir = path.join(OUTPUT_DIR_ARTICULOS, art.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": art.title,
    "description": art.meta
  };

  fs.writeFileSync(path.join(dir, 'index.html'), getTemplate(art.title, art.meta, art.h1, art.content, art.slug, schema));
});

console.log("✅ SEO articles and meanings generated successfully!");
