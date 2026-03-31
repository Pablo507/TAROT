/* ============================================================
   TAROT APP — Main Application Logic
   ============================================================ */

'use strict';

const state = {
  selectedSpread: 'three',
  drawnCards: [],
  isReading: false,
};

// ─── DOM REFERENCES ───────────────────────────────────────────
const $ = id => document.getElementById(id);

const els = {
  starfield:      $('starfield'),
  spreadArea:     $('spread-area'),
  drawBtn:        $('draw-btn'),
  questionInput:  $('question-input'),
  readingPanel:   $('reading-panel'),
  readingText:    $('reading-text'),
  readingDate:    $('reading-date'),
  cardsSummary:   $('cards-summary'),
  offeringPanel:  $('offering-panel'),
  dynRec:         $('dynamic-recommendation'),
  dynToolName:    $('dyn-tool-name'),
  dynToolDesc:    $('dyn-tool-desc'),
  dynToolLink:    $('dyn-tool-link'),
  dynToolIcon:    $('dyn-tool-icon'),
  dynToolCardName:$('dyn-tool-card-name'),
  dynToolTag:     $('dyn-tool-tag'),
  dynamicSchema:  $('dynamic-schema'),
};

// ─── STARFIELD ────────────────────────────────────────────────
function buildStarfield() {
  const count = 180;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      --dur:${Math.random()*5+3}s;
      --delay:${Math.random()*5}s;
      --base-op:${Math.random()*0.5+0.1};
    `;
    frag.appendChild(s);
  }
  els.starfield.appendChild(frag);
}

// ─── SPREAD SELECTION ─────────────────────────────────────────
function setupSpreadButtons() {
  document.querySelectorAll('.spread-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedSpread = btn.dataset.spread;
    });
  });
  // Default active
  document.querySelector('[data-spread="three"]').classList.add('active');
}

// ─── FISHER-YATES SHUFFLE ─────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── DRAW CARDS ───────────────────────────────────────────────
function drawCards() {
  const spread = SPREADS[state.selectedSpread];
  const shuffled = shuffle(TAROT_DECK);
  return shuffled.slice(0, spread.count).map(card => ({
    ...card,
    reversed: Math.random() < 0.35, // 35% chance reversed
  }));
}

// ─── BUILD CARD HTML ──────────────────────────────────────────
function getCardGradient(card) {
  if (!card.colors) return 'linear-gradient(160deg,#2a1060,#0a0020)';
  return `linear-gradient(160deg, ${card.colors[0]}22, #0a0020, ${card.colors[1]}11)`;
}

function getAccentColor(card) {
  if (!card.colors) return '#c9a84c';
  return card.colors[0];
}

function buildCardElement(card, positionLabel, index) {
  const slot = document.createElement('div');
  slot.className = 'card-slot';
  slot.style.animationDelay = `${index * 0.12}s`;

  const label = document.createElement('div');
  label.className = 'card-position-label';
  label.textContent = positionLabel;

  const card3d = document.createElement('div');
  card3d.className = 'card-3d';
  card3d.dataset.index = index;
  if (card.reversed) card3d.classList.add('reversed');

  const accentColor = getAccentColor(card);

  card3d.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <div class="card-back-pattern">✦</div>
      </div>
      <div class="card-face card-front" style="background: ${getCardGradient(card)};">
        <div class="card-front-inner" style="${card.reversed ? 'transform:rotate(180deg)' : ''}">
          <div class="card-symbol">${card.symbol}</div>
          <div class="card-numeral">${card.numeral}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-arcana">${card.suit ? card.suit : card.arcana}</div>
          ${card.reversed ? '<div class="card-reversed-tag">Invertida</div>' : ''}
        </div>
        <div class="card-accent" style="background: linear-gradient(90deg, ${accentColor}, transparent);"></div>
      </div>
    </div>
    <div class="card-glow" style="box-shadow: 0 0 30px ${accentColor}44 inset;"></div>
  `;

  // Click to flip tooltip
  card3d.title = 'Clic para revelar';

  slot.appendChild(label);
  slot.appendChild(card3d);
  return slot;
}

// ─── FLIP CARD ────────────────────────────────────────────────
function flipCard(card3d) {
  card3d.classList.add('flipped');
  if (card3d.classList.contains('reversed')) {
    // After flip, apply reversed rotation
    const inner = card3d.querySelector('.card-inner');
    setTimeout(() => {
      inner.style.transform = 'rotateY(180deg) rotateZ(180deg)';
    }, 500);
  }
  card3d.title = '';
}

// ─── RENDER SPREAD ────────────────────────────────────────────
function renderSpread(cards) {
  const spread = SPREADS[state.selectedSpread];
  els.spreadArea.innerHTML = '';

  cards.forEach((card, i) => {
    const slot = buildCardElement(card, spread.positions[i], i);
    els.spreadArea.appendChild(slot);
  });

  // Auto-flip with staggered delay
  document.querySelectorAll('.card-3d').forEach((card3d, i) => {
    setTimeout(() => flipCard(card3d), 600 + i * 400);
  });

  // Cards summary pills
  els.cardsSummary.innerHTML = '';
  els.cardsSummary.classList.add('visible');
  cards.forEach(card => {
    const pill = document.createElement('div');
    pill.className = `card-pill${card.reversed ? ' reversed' : ''}`;
    pill.textContent = card.name + (card.reversed ? ' ↓' : ' ↑');
    els.cardsSummary.appendChild(pill);
  });
}

// ─── BUILD GEMINI PROMPT ──────────────────────────────────────
function buildPrompt(question, cards) {
  const spread = SPREADS[state.selectedSpread];
  const cardDescriptions = cards.map((card, i) => {
    const orientation = card.reversed ? 'INVERTIDA' : 'VERTICAL (al derecho)';
    const meaning = card.reversed ? card.reversed : card.upright;
    return `Posición ${i + 1} — "${spread.positions[i]}": ${card.name} (${orientation})
    Arcano: ${card.arcana}${card.suit ? ' · ' + card.suit : ''}
    Palabras clave: ${card.keywords.join(', ')}
    Significado en esta posición: ${meaning}`;
  }).join('\n\n');

  const questionSection = question.trim()
    ? `La persona ha formulado esta pregunta o intención: "${question.trim()}"\n\n`
    : 'La persona no ha formulado una pregunta específica, realiza una lectura general sobre su situación actual.\n\n';

  return `Eres un maestro tarotista con décadas de experiencia, profundo conocimiento esotérico y una forma de comunicar que es a la vez precisa, poética y profundamente empática. Hablas en español, con un tono cálido, misterioso y esperanzador.

${questionSection}Se ha realizado una tirada de tarot "${spread.name}" con las siguientes cartas:

${cardDescriptions}

Por favor, realiza una lectura completa e integrada de estas cartas. Ten en cuenta:
1. El significado individual de cada carta en su posición específica
2. La narrativa que surge entre todas las cartas juntas
3. Las energías que se complementan o contrastan
4. Un mensaje final de síntesis que integre todo

Estructura tu respuesta así:
- Primero, una breve introducción poética que establezca el tono de la lectura
- Luego, analiza cada carta en su posición de manera rica y personal
- Finalmente, un mensaje de síntesis poderoso que conecte todo

Sé específico, emotivo y revelador. La lectura debe sentirse como una conversación íntima con el cosmos. No uses asteriscos ni formato markdown, escribe en prosa fluida y profunda.`;
}

async function getAIReading(question, cards) {
  const prompt = buildPrompt(question, cards);
  const url = '/api/reading';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Error ${res.status}`);
  }

  const data = await res.json();
  return data.reading || 'La voz del oráculo permanece en silencio…';
}

// ─── DYNAMIC RECOMMENDATION ENGINE ────────────────────────────
function updateDynamicRecommendation(cards) {
  const counts = { "Bastos": 0, "Copas": 0, "Espadas": 0, "Pentáculos": 0, "Mayor": 0 };

  cards.forEach(card => {
    if (card.arcana === "Mayor") {
      counts["Mayor"]++;
    } else if (card.suit) {
      counts[card.suit]++;
    }
  });

  // Find the suit with the highest count
  let dominant = "Mayor";
  let max = -1;

  // We check suits first, then override with Mayor if it's very high or tied
  for (const [suit, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = suit;
    } else if (count === max && suit === "Mayor") {
      // Tie-breaker: Major Arcana takes precedence for spiritual importance
      dominant = "Mayor";
    }
  }

  const rec = ELEMENT_RECOMMENDATIONS[dominant];

  // Update UI
  els.dynToolName.textContent = rec.name;
  els.dynToolDesc.textContent = rec.desc;
  els.dynToolIcon.textContent = rec.icon;
  els.dynToolCardName.textContent = rec.name;
  els.dynToolTag.textContent = rec.tag;

  // Show the panel
  els.dynRec.style.display = 'block';
}

// ─── TYPE-WRITER EFFECT ───────────────────────────────────────
async function typewriterDisplay(text) {
  els.readingText.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';

  const container = document.createElement('p');
  container.style.whiteSpace = 'pre-wrap';
  container.style.lineHeight = '1.85';
  els.readingText.appendChild(container);
  container.appendChild(cursor);

  let i = 0;
  const chunkSize = 4;
  const delay = 18;

  await new Promise(resolve => {
    function write() {
      if (i < text.length) {
        const chunk = text.slice(i, i + chunkSize);
        container.insertBefore(document.createTextNode(chunk), cursor);
        i += chunkSize;
        setTimeout(write, delay);
      } else {
        cursor.remove();
        resolve();
      }
    }
    write();
  });
}

// ─── STRUCTURED DATA (JSON-LD) ────────────────────────────────
function updateStructuredData(cards, reading) {
  const spread = SPREADS[state.selectedSpread];
  const now = new Date().toISOString();

  const cardFAQs = cards.map(card => ({
    "@type": "Question",
    "name": `¿Qué significa la carta ${card.name} en el Tarot?`,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": `${card.upright} Palabras clave: ${card.keywords.join(', ')}.`
    }
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": `Lectura de Tarot: ${spread.name}`,
        "description": reading.substring(0, 160) + "...",
        "author": { "@type": "Organization", "name": "Oráculo del Tarot Online" },
        "datePublished": now,
        "articleBody": reading
      },
      {
        "@type": "FAQPage",
        "mainEntity": cardFAQs
      }
    ]
  };

  els.dynamicSchema.textContent = JSON.stringify(schema);
}

// ─── SHOW LOADING ─────────────────────────────────────────────
function showReadingLoading() {
  els.readingPanel.classList.add('visible');
  els.readingText.innerHTML = `
    <div class="reading-loading">
      <div class="orb-loader">
        <div class="orb"></div>
        <div class="orb"></div>
        <div class="orb"></div>
      </div>
      <span class="loading-text">Las estrellas están siendo consultadas…</span>
    </div>
  `;
  const now = new Date();
  els.readingDate.textContent = now.toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ─── MAIN DRAW ACTION ─────────────────────────────────────────
async function onDraw() {
  if (state.isReading) return;

  state.isReading = true;
  els.drawBtn.disabled = true;
  els.drawBtn.classList.add('processing');
  els.drawBtn.innerHTML = `<span class="btn-icon">🔮</span> Consultando...`;
  els.readingPanel.classList.remove('visible');

  // Draw and render cards
  const cards = drawCards();
  state.drawnCards = cards;
  renderSpread(cards);

  // Start checking the stars immediately (shows loading and scrolls down)
  showReadingLoading();
  setTimeout(() => {
    els.readingPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  // Wait for flip animations and fetch reading in parallel
  const spread = SPREADS[state.selectedSpread];
  const flipDelay = 600 + spread.count * 400 + 600;

  // Start API request right away
  const readingPromise = getAIReading(els.questionInput.value, cards);
  
  // Wait for animation delay
  const delayPromise = new Promise(resolve => setTimeout(resolve, flipDelay));

  try {
    // Await both completion
    const [reading] = await Promise.all([readingPromise, delayPromise]);
    await typewriterDisplay(reading);

    // Update Structured Data for SEO Authority
    updateStructuredData(cards, reading);

    // Reveal monetization/offering panel after reading
    setTimeout(() => {
      updateDynamicRecommendation(cards);
      els.offeringPanel.style.display = 'block';
      els.offeringPanel.scrollIntoView({ behavior: 'smooth' });
    }, 500);

  } catch (err) {
    els.readingText.innerHTML = `
      <p style="color:#fca5a5; font-style:italic;">
        ⚠️ El oráculo no pudo conectarse: ${err.message}
      </p>
    `;
  } finally {
    state.isReading = false;
    els.drawBtn.disabled = false;
    els.drawBtn.classList.remove('processing');
    els.drawBtn.innerHTML = `<span class="btn-icon">🔮</span> Nueva Tirada`;
  }
}

// ─── EVENT LISTENERS ──────────────────────────────────────────
function setupEvents() {
  els.drawBtn.addEventListener('click', onDraw);
}

// ─── ORACLE INTRO ─────────────────────────────────────────────
function showOracleIntro() {
  const phrases = [
    "El cosmos aguarda tu pregunta…",
    "Cada carta es un espejo del alma.",
    "El universo tiene mensajes para ti.",
    "Las estrellas guardan tu historia.",
  ];
  const intro = document.createElement('p');
  intro.className = 'oracle-intro';
  intro.textContent = phrases[Math.floor(Math.random() * phrases.length)];
  els.spreadArea.appendChild(intro);
}



// ─── INIT ─────────────────────────────────────────────────────
function init() {
  buildStarfield();
  setupSpreadButtons();
  setupEvents();
  showOracleIntro();

  // Set current date
  const now = new Date();
  els.readingDate.textContent = now.toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

document.addEventListener('DOMContentLoaded', init);
