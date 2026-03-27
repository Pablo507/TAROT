// ============================================================
// TAROT DATA - All 78 Cards
// ============================================================

const TAROT_DECK = [
  // ─── MAJOR ARCANA ───────────────────────────────────────────
  {
    id: 0, name: "El Loco", arcana: "Mayor", suit: null,
    symbol: "☀️", numeral: "0",
    keywords: ["nuevos comienzos", "inocencia", "espontaneidad", "aventura"],
    upright: "Nuevos comienzos emocionantes, libertad espiritual, potencial ilimitado, fe en el universo.",
    reversed: "Imprudencia, irresponsabilidad, ingenuidad peligrosa, falta de dirección.",
    colors: ["#ffd700", "#87ceeb"]
  },
  {
    id: 1, name: "El Mago", arcana: "Mayor", suit: null,
    symbol: "⚡", numeral: "I",
    keywords: ["manifestación", "poder", "habilidad", "concentración"],
    upright: "Poder de manifestación, habilidades y recursos a tu disposición, acción decidida, voluntad.",
    reversed: "Manipulación, ilusión, talentos desaprovechados, engaño.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 2, name: "La Suma Sacerdotisa", arcana: "Mayor", suit: null,
    symbol: "🌙", numeral: "II",
    keywords: ["intuición", "misterio", "sabiduría interior", "lo oculto"],
    upright: "Intuición elevada, sabiduría del subconsciente, misterio, paciencia, conocimiento esotérico.",
    reversed: "Secretos, información oculta, desconexión de la intuición, superficialidad.",
    colors: ["#4b0082", "#c0c0c0"]
  },
  {
    id: 3, name: "La Emperatriz", arcana: "Mayor", suit: null,
    symbol: "🌿", numeral: "III",
    keywords: ["feminidad", "abundancia", "naturaleza", "fertilidad"],
    upright: "Abundancia, creatividad floreciente, conexión con la naturaleza, fertilidad, amor maternal.",
    reversed: "Dependencia, bloqueo creativo, negligencia, sobreprotección.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 4, name: "El Emperador", arcana: "Mayor", suit: null,
    symbol: "👑", numeral: "IV",
    keywords: ["autoridad", "estructura", "estabilidad", "padre"],
    upright: "Autoridad, estabilidad, poder, liderazgo paternal, disciplina y logro.",
    reversed: "Tiranía, rigidez excesiva, dominación, falta de disciplina.",
    colors: ["#8b0000", "#ffd700"]
  },
  {
    id: 5, name: "El Sumo Sacerdote", arcana: "Mayor", suit: null,
    symbol: "✝️", numeral: "V",
    keywords: ["tradición", "espiritualidad", "guía", "conformidad"],
    upright: "Tradición espiritual, guía sabia, instituciones, enseñanza, rituales sagrados.",
    reversed: "Dogmatismo, rebeldía contra normas, pensamiento no convencional.",
    colors: ["#4b0082", "#ffd700"]
  },
  {
    id: 6, name: "Los Amantes", arcana: "Mayor", suit: null,
    symbol: "💞", numeral: "VI",
    keywords: ["amor", "elección", "unión", "valores"],
    upright: "Amor profundo, conexión de almas, elecciones importantes, alineación de valores.",
    reversed: "Desequilibrio en relaciones, mala elección, conflictos internos.",
    colors: ["#ff69b4", "#ffd700"]
  },
  {
    id: 7, name: "El Carro", arcana: "Mayor", suit: null,
    symbol: "⚔️", numeral: "VII",
    keywords: ["victoria", "determinación", "control", "viaje"],
    upright: "Victoria a través de la determinación, control sobre fuerzas opuestas, triunfo y avance.",
    reversed: "Falta de control, agresión sin dirección, derrota, obstáculos.",
    colors: ["#1e90ff", "#ffd700"]
  },
  {
    id: 8, name: "La Fuerza", arcana: "Mayor", suit: null,
    symbol: "🦁", numeral: "VIII",
    keywords: ["coraje", "paciencia", "compasión", "fuerza interior"],
    upright: "Fuerza interior, valentía compasiva, dominio de los impulsos, paciencia infinita.",
    reversed: "Inseguridad, debilidad, auto-duda, pérdida de control.",
    colors: ["#ff8c00", "#ffd700"]
  },
  {
    id: 9, name: "El Ermitaño", arcana: "Mayor", suit: null,
    symbol: "🔦", numeral: "IX",
    keywords: ["introspección", "soledad", "búsqueda interior", "guía"],
    upright: "Introspección profunda, guía interior, soledad renovadora, sabiduría a través del retiro.",
    reversed: "Aislamiento extremo, soledad no elegida, rechazo a la guía.",
    colors: ["#708090", "#ffd700"]
  },
  {
    id: 10, name: "La Rueda de la Fortuna", arcana: "Mayor", suit: null,
    symbol: "🎡", numeral: "X",
    keywords: ["destino", "cambio", "ciclos", "buena fortuna"],
    upright: "Giros del destino, ciclos de la vida, buena suerte, puntos de inflexión.",
    reversed: "Mala suerte, resistencia al cambio, quiebres en ciclos.",
    colors: ["#ffd700", "#4b0082"]
  },
  {
    id: 11, name: "La Justicia", arcana: "Mayor", suit: null,
    symbol: "⚖️", numeral: "XI",
    keywords: ["justicia", "verdad", "causa y efecto", "ley"],
    upright: "Justicia, verdad, ley kármica, toma de decisiones justa, equilibrio.",
    reversed: "Injusticia, desequilibrio, deshonestidad, consecuencias evitadas.",
    colors: ["#dc143c", "#ffd700"]
  },
  {
    id: 12, name: "El Colgado", arcana: "Mayor", suit: null,
    symbol: "🔄", numeral: "XII",
    keywords: ["pausa", "rendición", "nueva perspectiva", "sacrificio"],
    upright: "Pausa necesaria, nueva perspectiva, sacrificio consciente, iluminación a través de la espera.",
    reversed: "Resistencia al sacrificio, demora innecesaria, martirio.",
    colors: ["#00ced1", "#ffd700"]
  },
  {
    id: 13, name: "La Muerte", arcana: "Mayor", suit: null,
    symbol: "🌑", numeral: "XIII",
    keywords: ["transformación", "fin de ciclo", "transición", "cambio"],
    upright: "Transformación profunda, fin de una etapa, transición inevitable, renacimiento.",
    reversed: "Resistencia al cambio, estancamiento, incapacidad de soltar.",
    colors: ["#1a1a2e", "#c0c0c0"]
  },
  {
    id: 14, name: "La Templanza", arcana: "Mayor", suit: null,
    symbol: "🌊", numeral: "XIV",
    keywords: ["equilibrio", "moderación", "paciencia", "propósito"],
    upright: "Equilibrio, moderación, paciencia, fluidez entre extremos, propósito mayor.",
    reversed: "Impaciencia, exceso, desbalance, falta de perspectiva a largo plazo.",
    colors: ["#87ceeb", "#ffd700"]
  },
  {
    id: 15, name: "El Diablo", arcana: "Mayor", suit: null,
    symbol: "🔗", numeral: "XV",
    keywords: ["apego", "sombra", "limitaciones", "materialismo"],
    upright: "Ataduras materiales, sombra personal, apego excesivo, adicciones, engaño.",
    reversed: "Liberación de ataduras, reconocimiento de la sombra, recuperación del poder.",
    colors: ["#8b0000", "#1a1a2e"]
  },
  {
    id: 16, name: "La Torre", arcana: "Mayor", suit: null,
    symbol: "⚡", numeral: "XVI",
    keywords: ["caos", "revelación", "cambio abrupto", "despertar"],
    upright: "Cambio abrupto, colapso de estructuras falsas, revelación perturbadora, liberación.",
    reversed: "Evitar el desastre, resistencia al cambio necesario, explosión demorada.",
    colors: ["#ff4500", "#1a1a2e"]
  },
  {
    id: 17, name: "La Estrella", arcana: "Mayor", suit: null,
    symbol: "⭐", numeral: "XVII",
    keywords: ["esperanza", "fe", "inspiración", "renovación"],
    upright: "Esperanza renovada, fe en el futuro, inspiración, sanación, guía divina.",
    reversed: "Desesperanza, pérdida de fe, desconexión espiritual.",
    colors: ["#00bfff", "#ffd700"]
  },
  {
    id: 18, name: "La Luna", arcana: "Mayor", suit: null,
    symbol: "🌕", numeral: "XVIII",
    keywords: ["ilusión", "miedo", "inconsciente", "confusión"],
    upright: "Ilusión, miedos ocultos, la sombra inconsciente, confusión, ciclos emocionales.",
    reversed: "Liberación de miedos, claridad que emerge, revelación de ilusiones.",
    colors: ["#4b0082", "#c0c0c0"]
  },
  {
    id: 19, name: "El Sol", arcana: "Mayor", suit: null,
    symbol: "☀️", numeral: "XIX",
    keywords: ["éxito", "alegría", "vitalidad", "claridad"],
    upright: "Éxito, alegría radiante, claridad mental, vitalidad, optimismo fundado.",
    reversed: "Optimismo excesivo, dificultad para ver la verdad, energía dispersa.",
    colors: ["#ffd700", "#ff8c00"]
  },
  {
    id: 20, name: "El Juicio", arcana: "Mayor", suit: null,
    symbol: "🎺", numeral: "XX",
    keywords: ["renacimiento", "llamado interior", "absolución", "reflexión"],
    upright: "Renacimiento espiritual, llamado a un propósito mayor, absolución, reflexión profunda.",
    reversed: "Auto-duda, miedo al cambio, incapacidad de renacer.",
    colors: ["#dc143c", "#ffd700"]
  },
  {
    id: 21, name: "El Mundo", arcana: "Mayor", suit: null,
    symbol: "🌍", numeral: "XXI",
    keywords: ["completud", "integración", "logro", "totalidad"],
    upright: "Completud total, integración de todas las partes, logro supremo, totalidad del ser.",
    reversed: "Incompletud, búsqueda de cierre, objetivos sin finalizar.",
    colors: ["#228b22", "#ffd700"]
  },

  // ─── MENOR ARCANA - BASTOS ───────────────────────────────────
  {
    id: 22, name: "As de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "As",
    keywords: ["inspiración", "nuevos proyectos", "potencial creativo", "chispa"],
    upright: "Chispa creativa, nuevos proyectos llenos de potencial, inspiración reciente.",
    reversed: "Bloqueo creativo, falta de energía, proyectos estancados.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 23, name: "Dos de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "II",
    keywords: ["planificación", "futuros planes", "decisión", "poder personal"],
    upright: "Planificación a futuro, poder personal, decisiones sobre el camino, expansión.",
    reversed: "Miedo al cambio, mala planificación, falta de visión.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 24, name: "Tres de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "III",
    keywords: ["expansión", "visión", "empresa", "avance"],
    upright: "Expansión de proyectos, visión lejana, empresa en marcha, avance hacia metas.",
    reversed: "Reveses, obstáculos inesperados, falta de previsión.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 25, name: "Cuatro de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "IV",
    keywords: ["celebración", "hogar", "armonía", "logro"],
    upright: "Celebración, armonía familiar, logro compartido, estabilidad hogareña.",
    reversed: "Falta de armonía en el hogar, inestabilidad, celebración incompleta.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 26, name: "Cinco de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "V",
    keywords: ["conflicto", "competencia", "discordia", "caos"],
    upright: "Conflicto abierto, competencia, caos creativo, desacuerdos que enseñan.",
    reversed: "Conflicto interno, evitar confrontaciones, competencia desleal.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 27, name: "Seis de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "VI",
    keywords: ["victoria", "reconocimiento", "progreso", "confianza"],
    upright: "Victoria pública, reconocimiento merecido, progreso notable, confianza en el éxito.",
    reversed: "Ego desmedido, caída pública, falta de reconocimiento.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 28, name: "Siete de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "VII",
    keywords: ["desafío", "perseverancia", "defensiva", "ventaja"],
    upright: "Defensa de la posición, perseverancia ante desafíos, ventaja ganada con esfuerzo.",
    reversed: "Rendirse ante la presión, abrumarse, posición insostenible.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 29, name: "Ocho de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "VIII",
    keywords: ["velocidad", "acción", "movimiento", "noticias"],
    upright: "Movimiento rápido, noticias en camino, acción acelerada, viaje.",
    reversed: "Retrasos, frustración, noticias retrasadas, obstáculos.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 30, name: "Nueve de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "IX",
    keywords: ["resiliencia", "resistencia", "cauteloso", "persistencia"],
    upright: "Resiliencia tras batallas, persistencia cautelosa, defensa de lo construido.",
    reversed: "Paranoia, agotamiento total, incapacidad de persistir.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 31, name: "Diez de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "X",
    keywords: ["carga", "responsabilidad", "agotamiento", "opresión"],
    upright: "Carga excesiva de responsabilidades, esfuerzo al límite, meta cercana pero agotadora.",
    reversed: "Incapacidad de delegar, colapso por exceso, liberación de cargas.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 32, name: "Sota de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "Sota",
    keywords: ["exploración", "entusiasmo", "mensaje creativo", "potencial joven"],
    upright: "Espíritu explorador, mensaje de creatividad, entusiasmo juvenil, potencial sin refinar.",
    reversed: "Falta de dirección, impulsividad, mensajes retrasados.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 33, name: "Caballo de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "Caballo",
    keywords: ["energía", "pasión", "aventura", "impulsividad"],
    upright: "Energía desbordante, aventura apasionada, acción impulsiva, viaje emocionante.",
    reversed: "Imprudencia, furia sin control, energía dispersa.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 34, name: "Reina de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "Reina",
    keywords: ["confianza", "determinación", "carisma", "independencia"],
    upright: "Liderazgo carismático, confianza radiante, independencia apasionada, creatividad en acción.",
    reversed: "Demanda excesiva, egoísmo, celos.",
    colors: ["#ff4500", "#ffd700"]
  },
  {
    id: 35, name: "Rey de Bastos", arcana: "Menor", suit: "Bastos",
    symbol: "🔥", numeral: "Rey",
    keywords: ["visión", "liderazgo natural", "honor", "maestría"],
    upright: "Liderazgo visionario, maestría creativa, honor y dignidad, empresa próspera.",
    reversed: "Impulsividad peligrosa, arrogancia, liderazgo tiránico.",
    colors: ["#ff4500", "#ffd700"]
  },

  // ─── MENOR ARCANA - COPAS ────────────────────────────────────
  {
    id: 36, name: "As de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "As",
    keywords: ["amor nuevo", "intuición", "abundancia emocional", "oferta espiritual"],
    upright: "Nuevo amor, abundancia emocional, oferta espiritual, apertura del corazón.",
    reversed: "Emociones bloqueadas, amor reprimido, vacío interior.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 37, name: "Dos de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "II",
    keywords: ["unión", "compañerismo", "conexión", "acuerdo mutuo"],
    upright: "Conexión profunda, unión mutua, compañerismo, armonía en relaciones.",
    reversed: "Ruptura, desequilibrio en relaciones, comunicación rota.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 38, name: "Tres de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "III",
    keywords: ["celebración", "amistad", "comunidad", "abundancia"],
    upright: "Celebración con amigos, comunidad amorosa, abundancia compartida, alegría.",
    reversed: "Excesos sociales, conflictos grupales, aislamiento.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 39, name: "Cuatro de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "IV",
    keywords: ["meditación", "apatía", "reflexión", "nuevas oportunidades"],
    upright: "Contemplación profunda, apatía transitoria, oportunidad ignorada, reflexión necesaria.",
    reversed: "Salida de la apatía, nuevas posibilidades, apertura.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 40, name: "Cinco de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "V",
    keywords: ["pérdida", "duelo", "arrepentimiento", "lo que queda"],
    upright: "Pérdida emocional, duelo, enfoque en lo perdido, pero aún hay esperanza en lo que queda.",
    reversed: "Aceptación del duelo, avanzar, perdonarse.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 41, name: "Seis de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "VI",
    keywords: ["nostalgia", "infancia", "inocencia", "regreso"],
    upright: "Nostalgia feliz, recuerdos de infancia, inocencia recuperada, regreso al pasado.",
    reversed: "Vivir en el pasado, idealización excesiva, incapacidad de soltar.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 42, name: "Siete de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "VII",
    keywords: ["ilusión", "fantasía", "elección", "sueños"],
    upright: "Múltiples ilusiones, ensoñación, elección entre fantasías, imaginación desbordante.",
    reversed: "Enfoque, realismo, claridad sobre deseos.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 43, name: "Ocho de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "VIII",
    keywords: ["abandono", "búsqueda", "dejar ir", "camino espiritual"],
    upright: "Dejar atrás lo que ya no sirve, búsqueda espiritual, valentía para partir.",
    reversed: "Quedarse por miedo, huida sin propósito, resignación.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 44, name: "Nueve de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "IX",
    keywords: ["contentamiento", "satisfacción", "gratitud", "deseos cumplidos"],
    upright: "Satisfacción profunda, deseos cumplidos, bienestar emocional, gratitud.",
    reversed: "Deseos no satisfechos, complacencia excesiva, materialismo.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 45, name: "Diez de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "X",
    keywords: ["felicidad familiar", "armonía", "alineación divina", "plenitud"],
    upright: "Plenitud emocional, felicidad familiar duradera, armonía, realización del sueño.",
    reversed: "Disfunción familiar, ideales poco realistas, ruptura del hogar.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 46, name: "Sota de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "Sota",
    keywords: ["mensajes emocionales", "creatividad", "intuición", "juventud sensible"],
    upright: "Mensajes del corazón, creatividad emocional, intuición joven, apertura al amor.",
    reversed: "Inmadurez emocional, manipulación, capricho.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 47, name: "Caballo de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "Caballo",
    keywords: ["romanticismo", "encanto", "visión", "propuesta"],
    upright: "Propuesta romántica, mensajero del amor, encanto y visión, avance emocional.",
    reversed: "Romance irreal, manipulación emocional, impracticidad.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 48, name: "Reina de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "Reina",
    keywords: ["compasión", "expresión emocional", "cuidado", "intuición"],
    upright: "Compasión profunda, intuición elevada, cuidado amoroso, expresión emocional madura.",
    reversed: "Dependencia emocional, manipulación, inseguridad.",
    colors: ["#1e90ff", "#c0c0c0"]
  },
  {
    id: 49, name: "Rey de Copas", arcana: "Menor", suit: "Copas",
    symbol: "💧", numeral: "Rey",
    keywords: ["madurez emocional", "diplomacia", "balance", "sabiduría"],
    upright: "Madurez emocional, diplomacia compasiva, liderazgo equilibrado, sabio del corazón.",
    reversed: "Manipulación emocional, frialdad, volcán emocional.",
    colors: ["#1e90ff", "#c0c0c0"]
  },

  // ─── MENOR ARCANA - ESPADAS ──────────────────────────────────
  {
    id: 50, name: "As de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "As",
    keywords: ["claridad", "verdad", "corte", "avance"],
    upright: "Claridad mental absoluta, verdad revelada, corte de ilusiones, avance decisivo.",
    reversed: "Confusión, crueldad sin propósito, verdad dolorosa negada.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 51, name: "Dos de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "II",
    keywords: ["indecisión", "bloqueo", "equilibrio tenso", "punto muerto"],
    upright: "Parálisis ante una decisión, equilibrio tenso, punto muerto, negación de la verdad.",
    reversed: "Bloqueo que se libera, exceso de información, confusión.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 52, name: "Tres de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "III",
    keywords: ["corazón roto", "dolor", "separación", "tristeza"],
    upright: "Dolor de corazón, separación dolorosa, tristeza necesaria, herida que sana.",
    reversed: "Recuperación del dolor, perdón difícil, heridas pasadas.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 53, name: "Cuatro de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "IV",
    keywords: ["descanso", "recuperación", "meditación", "retiro"],
    upright: "Descanso necesario, recuperación, retiro meditativo, pausa antes del próximo paso.",
    reversed: "Agitación que no cede, dificultad para descansar, regreso prematuro.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 54, name: "Cinco de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "V",
    keywords: ["conflicto", "derrota", "deshonra", "victoria pírrica"],
    upright: "Victoria sin honor, conflicto destructivo, humillación, pérdidas por ego.",
    reversed: "Reconciliación, pasar el conflicto, ceder para ganar la paz.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 55, name: "Seis de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "VI",
    keywords: ["transición", "viaje", "alivio", "cambio necesario"],
    upright: "Transición hacia aguas más calmadas, alejarse del conflicto, viaje sanador.",
    reversed: "Resistencia al cambio, transición bloqueada, bagage emocional.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 56, name: "Siete de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "VII",
    keywords: ["engaño", "astucia", "táctica", "secreto"],
    upright: "Estrategia astuta, engaño, actuar en solitario, secretos que se guardan.",
    reversed: "Mentiras destapadas, remordimiento, confesar la verdad.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 57, name: "Ocho de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "VIII",
    keywords: ["trampa", "restricción", "victimismo", "limitación auto-impuesta"],
    upright: "Trampa mental, restricciones autopercibidas, victimismo, miedo que paraliza.",
    reversed: "Liberación de restricciones, ver el camino, dejar el victimismo.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 58, name: "Nueve de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "IX",
    keywords: ["ansiedad", "pesadillas", "angustia", "miedo nocturno"],
    upright: "Ansiedad extrema, pesadillas, desesperación nocturna, mente en tormento.",
    reversed: "Alivio de la angustia, buscar ayuda, salir de la oscuridad.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 59, name: "Diez de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "X",
    keywords: ["fin doloroso", "derrota total", "víctima", "tocar fondo"],
    upright: "Fin doloroso pero definitivo, traición, tocar fondo, pero el amanecer viene.",
    reversed: "Recuperarse de la derrota, resistencia al fin inevitable.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 60, name: "Sota de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "Sota",
    keywords: ["curiosidad", "comunicación directa", "aprendizaje", "juventud inquieta"],
    upright: "Mente ágil, comunicación directa, aprendizaje incisivo, curiosidad activa.",
    reversed: "Rumores, hablar sin pensar, crueldad verbal.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 61, name: "Caballo de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "Caballo",
    keywords: ["acción rápida", "ambición", "impulsividad intelectual", "determinación"],
    upright: "Acción decidida y rápida, determinación intelectual, ambición sin freno.",
    reversed: "Acción irreflexiva, arrogancia, atropellar a otros.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 62, name: "Reina de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "Reina",
    keywords: ["intelecto", "independencia", "percepción aguda", "claridad"],
    upright: "Mente brillante e independiente, percepción aguda, claridad sin filtros, sabiduría ganada en la experiencia.",
    reversed: "Frialdad cruel, juicio severo, aislamiento.",
    colors: ["#708090", "#c0c0c0"]
  },
  {
    id: 63, name: "Rey de Espadas", arcana: "Menor", suit: "Espadas",
    symbol: "⚔️", numeral: "Rey",
    keywords: ["autoridad intelectual", "ética", "juicio", "verdad"],
    upright: "Autoridad fundamentada en la razón, ética, juicio justo, verdad sin adornos.",
    reversed: "Tiranía intelectual, juicio sesgado, crueldad racional.",
    colors: ["#708090", "#c0c0c0"]
  },

  // ─── MENOR ARCANA - PENTÁCULOS ───────────────────────────────
  {
    id: 64, name: "As de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "As",
    keywords: ["nueva oportunidad material", "prosperidad", "abundancia", "manifestación"],
    upright: "Nueva oportunidad de prosperidad, semilla de abundancia, manifestación material.",
    reversed: "Oportunidad perdida, codicia, falta de planificación.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 65, name: "Dos de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "II",
    keywords: ["equilibrio", "adaptación", "malabarismo", "flexibilidad"],
    upright: "Equilibrio entre múltiples prioridades, adaptación ágil, gestión flexible de recursos.",
    reversed: "Desbalance financiero, abrumado por responsabilidades.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 66, name: "Tres de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "III",
    keywords: ["colaboración", "aprendizaje", "habilidad", "reconocimiento del trabajo"],
    upright: "Trabajo en equipo exitoso, aprendizaje de oficio, reconocimiento de habilidades.",
    reversed: "Falta de trabajo en equipo, mediocridad, no valorar el esfuerzo ajeno.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 67, name: "Cuatro de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "IV",
    keywords: ["seguridad", "conservación", "control", "avaricia"],
    upright: "Seguridad financiera, conservación de recursos, pero riesgo de avaricia o bloqueo.",
    reversed: "Generosidad, soltar el apego, pérdida financiera.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 68, name: "Cinco de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "V",
    keywords: ["dificultad financiera", "pobreza", "preocupación", "aislamiento"],
    upright: "Dificultades materiales, sensación de abandono, pero la ayuda está cerca si se busca.",
    reversed: "Recuperación económica, final de tiempos difíciles, apoyo encontrado.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 69, name: "Seis de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "VI",
    keywords: ["generosidad", "dar y recibir", "caridad", "equidad"],
    upright: "Generosidad equilibrada, dar y recibir en armonía, caridad, recursos compartidos.",
    reversed: "Deudas, generosidad condicionada, dependencia.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 70, name: "Siete de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "VII",
    keywords: ["paciencia", "inversión", "evaluación", "crecimiento lento"],
    upright: "Paciencia ante el crecimiento lento, evaluación del progreso, inversión a largo plazo.",
    reversed: "Impaciencia, trabajo sin recompensa, cuestionamiento de esfuerzos.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 71, name: "Ocho de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "VIII",
    keywords: ["maestría", "dedicación", "artesanía", "aprendizaje diligente"],
    upright: "Dedicación al oficio, aprendizaje constante, maestría en desarrollo, trabajo arduo.",
    reversed: "Perfeccionismo paralizante, falta de motivación, trabajo de mala calidad.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 72, name: "Nueve de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "IX",
    keywords: ["independencia", "abundancia", "lujo", "logro personal"],
    upright: "Independencia ganada, abundancia disfrutada en soledad, lujo merecido, autosuficiencia.",
    reversed: "Dependencia, fracaso de proyectos, falta de disciplina.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 73, name: "Diez de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "X",
    keywords: ["legado", "riqueza familiar", "herencia", "plenitud material"],
    upright: "Riqueza duradera, legado familiar, plenitud material y espiritual, comunidad próspera.",
    reversed: "Problemas familiares financieros, herencia en disputa, pérdida del legado.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 74, name: "Sota de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "Sota",
    keywords: ["estudiante", "ambición práctica", "oportunidad", "nuevas habilidades"],
    upright: "Estudiante dedicado, ambición práctica, nueva habilidad aprendida, oportunidad concreta.",
    reversed: "Falta de enfoque, procrastinación, oportunidades desaprovechadas.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 75, name: "Caballo de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "Caballo",
    keywords: ["trabajo duro", "rutina", "confiabilidad", "progreso constante"],
    upright: "Trabajo constante y confiable, progreso metódico, rutina productiva, solidez.",
    reversed: "Estancamiento, tedio, aversión al esfuerzo.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 76, name: "Reina de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "Reina",
    keywords: ["practicidad", "nutrición", "abundancia hogareña", "sensatez"],
    upright: "Practicidad abundante, nutrición y cuidado del hogar, sensatez financiera, generosidad.",
    reversed: "Desequilibrio trabajo-vida, descuido del hogar, materialismo.",
    colors: ["#228b22", "#ffd700"]
  },
  {
    id: 77, name: "Rey de Pentáculos", arcana: "Menor", suit: "Pentáculos",
    symbol: "🌿", numeral: "Rey",
    keywords: ["riqueza", "negocios", "liderazgo pragmático", "seguridad"],
    upright: "Éxito material consolidado, liderazgo firme y práctico, riqueza y seguridad duradera.",
    reversed: "Materialismo extremo, corrupción, fracaso empresarial.",
    colors: ["#228b22", "#ffd700"]
  }
];

// Posiciones para los diferentes spreads
const SPREADS = {
  daily: {
    name: "Carta del Día",
    count: 1,
    positions: ["La Energía del Día"]
  },
  three: {
    name: "Pasado · Presente · Futuro",
    count: 3,
    positions: ["Pasado", "Presente", "Futuro"]
  },
  five: {
    name: "Cruz Celta (5 Cartas)",
    count: 5,
    positions: ["Situación Actual", "El Desafío", "El Pasado", "El Futuro", "El Resultado"]
  },
  celtic: {
    name: "Cruz Celta Completa",
    count: 10,
    positions: [
      "Situación Central", "El Obstáculo", "La Raíz", "El Pasado Reciente",
      "El Potencial", "El Futuro Cercano", "Tu Actitud", "Influencias Externas",
      "Esperanzas y Miedos", "El Resultado Final"
    ]
  }
};

// ─── RECOMENDACIONES DINÁMICAS (MONETIZACIÓN) ─────────────────
const ELEMENT_RECOMMENDATIONS = {
  "Espadas": {
    name: "Incienso de Lavanda",
    tag: "Claridad Mental",
    icon: "🌬️",
    url: "https://amazon.com/lavender-incense-placeholder",
    desc: "Detectamos una fuerte presencia de Espadas. La Lavanda ayuda a calmar la mente y clarificar tus pensamientos."
  },
  "Copas": {
    name: "Incienso de Jazmín",
    tag: "Armonía Emocional",
    icon: "💧",
    url: "https://amazon.com/jasmine-incense-placeholder",
    desc: "Tus cartas hablan de profundas emociones. El Jazmín vibra con la energía de las Copas para sanar el corazón."
  },
  "Bastos": {
    name: "Incienso de Sándalo",
    tag: "Energía y Acción",
    icon: "🔥",
    url: "https://amazon.com/sandalwood-incense-placeholder",
    desc: "La pasión de los Bastos predomina. El Sándalo potencia tu voluntad y protege tus proyectos ambiciosos."
  },
  "Pentáculos": {
    name: "Incienso de Pachulí",
    tag: "Abundancia y Tierra",
    icon: "🌿",
    url: "https://amazon.com/patchouli-incense-placeholder",
    desc: "La energía de los Pentáculos busca manifestar. El Pachulí ayuda a enraizar tus ambiciones materiales."
  },
  "Mayor": {
    name: "Incienso de Copal",
    tag: "Conexión Divina",
    icon: "✨",
    url: "https://amazon.com/copal-incense-placeholder",
    desc: "Los Arcanos Mayores dominan tu tirada. El Copal abre los canales para una guía espiritual superior."
  }
};
