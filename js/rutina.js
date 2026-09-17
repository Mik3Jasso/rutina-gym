// ============================================================
//  Rutina de 5 días — tal cual la indicó el entrenador.
//  4 series por ejercicio: 15 / 12 / 10 / 8 repeticiones,
//  subiendo el peso en cada serie.
// ============================================================

export const SERIES = [15, 12, 10, 8];

// Paleta compartida por los dibujos
const C = {
  equipo: '#39434f',
  equipoRelleno: '#1e242c',
  cuerpo: '#d5dde7',
  musculo: 'rgba(255,107,53,.42)',
  flecha: '#ff6b35',
};

// Mancuerna reutilizable: (x,y) es el centro, r la rotación en grados
const mancuerna = (x, y, r = 0) => `
  <g transform="translate(${x} ${y}) rotate(${r})">
    <rect x="-11" y="-2" width="22" height="4" rx="2" fill="${C.equipo}"/>
    <rect x="-15" y="-6" width="5" height="12" rx="2" fill="${C.cuerpo}"/>
    <rect x="10" y="-6" width="5" height="12" rx="2" fill="${C.cuerpo}"/>
  </g>`;

// Trazo de cuerpo con grosor uniforme
const mancuernaChica = (x, y, r = 0) => `
  <g transform="translate(${x} ${y}) rotate(${r})">
    <rect x="-7" y="-1.5" width="14" height="3" rx="1.5" fill="${C.equipo}"/>
    <rect x="-10" y="-4.5" width="4" height="9" rx="2" fill="${C.cuerpo}"/>
    <rect x="6" y="-4.5" width="4" height="9" rx="2" fill="${C.cuerpo}"/>
  </g>`;

const trazo = (d, w = 5) =>
  `<path d="${d}" fill="none" stroke="${C.cuerpo}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const flecha = (d) => `
  <path d="${d}" fill="none" stroke="${C.flecha}" stroke-width="2.2"
        stroke-linecap="round" stroke-dasharray="5 4" marker-end="url(#puntaFlecha)"/>`;

// Definicion unica de la punta de flecha. Va una sola vez en el documento
// (index.html la incluye oculta); asi ningun id se repite.
export const DEFS_FLECHA = `
  <defs>
    <marker id="puntaFlecha" viewBox="0 0 10 10" refX="7" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="${C.flecha}"/>
    </marker>
  </defs>`;

const svg = (contenido) =>
  `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${contenido}</svg>`;


// --- piezas reutilizables para maquinas y barras ---
const barra = (x, y, largo = 56, r = 0) => `
  <g transform="translate(${x} ${y}) rotate(${r})">
    <rect x="${-largo / 2}" y="-2" width="${largo}" height="4" rx="2" fill="${C.equipo}"/>
    <rect x="${-largo / 2 - 5}" y="-9" width="6" height="18" rx="2" fill="${C.cuerpo}"/>
    <rect x="${largo / 2 - 1}" y="-9" width="6" height="18" rx="2" fill="${C.cuerpo}"/>
  </g>`;

const disco = (x, y, rr = 12) =>
  `<circle cx="${x}" cy="${y}" r="${rr}" fill="none" stroke="${C.cuerpo}" stroke-width="4.5"/>`;

const marco = (d, w = 4) =>
  `<path d="${d}" fill="none" stroke="${C.equipo}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const cojin = (x, y, an, al, rx = 5) =>
  `<rect x="${x}" y="${y}" width="${an}" height="${al}" rx="${rx}" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3"/>`;

const polea = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${C.equipo}" stroke-width="3"/>`;

const cable = (d) => `<path d="${d}" fill="none" stroke="${C.equipo}" stroke-width="2.4"/>`;

const musculo = (cx, cy, rx, ry, rot = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.musculo}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;

const cabeza = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.cuerpo}"/>`;

// ------------------------------------------------------------
//  DÍA 1 — PECHO
// ------------------------------------------------------------

const svgBancoInclinado = svg(`
  <!-- banco inclinado -->
  <path d="M40 100 L95 52 L104 62 L49 110 Z" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M44 104 L36 116 M96 62 L100 116" stroke="${C.equipo}" stroke-width="4" stroke-linecap="round"/>
  <!-- cuerpo recostado -->
  <circle cx="98" cy="47" r="9" fill="${C.cuerpo}"/>
  ${trazo('M92 55 L64 85')}
  <ellipse cx="86" cy="62" rx="13" ry="9" fill="${C.musculo}" transform="rotate(-40 86 62)"/>
  ${trazo('M64 85 L44 92 L30 104')}
  <!-- brazos empujando -->
  ${trazo('M90 58 L104 44 L118 34', 4.5)}
  ${trazo('M84 64 L98 50 L112 40', 4.5)}
  ${mancuerna(120, 32, -38)}
  ${flecha('M126 52 Q132 42 128 30')}
`);

const svgPullOver = svg(`
  <!-- banco plano -->
  <rect x="34" y="72" width="82" height="11" rx="4" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3"/>
  <path d="M44 83 L40 112 M106 83 L110 112" stroke="${C.equipo}" stroke-width="4" stroke-linecap="round"/>
  <!-- cuerpo acostado -->
  <circle cx="46" cy="62" r="9" fill="${C.cuerpo}"/>
  ${trazo('M55 66 L92 66')}
  <ellipse cx="66" cy="64" rx="13" ry="8" fill="${C.musculo}"/>
  ${trazo('M92 66 L106 78 L120 96')}
  <!-- brazos extendidos por encima de la cabeza -->
  ${trazo('M58 64 L42 48 L30 32', 4.5)}
  ${mancuerna(26, 28, 52)}
  ${flecha('M46 26 Q66 18 84 34')}
`);

const svgBancoHorizontal = svg(`
  <rect x="32" y="76" width="86" height="11" rx="4" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3"/>
  <path d="M42 87 L38 114 M108 87 L112 114" stroke="${C.equipo}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="110" cy="66" r="9" fill="${C.cuerpo}"/>
  ${trazo('M101 70 L64 70')}
  <ellipse cx="92" cy="68" rx="14" ry="9" fill="${C.musculo}"/>
  ${trazo('M64 70 L48 80 L34 96')}
  <!-- brazos hacia arriba -->
  ${trazo('M96 66 L94 48 L92 32', 4.5)}
  ${trazo('M88 68 L86 50 L84 34', 4.5)}
  ${mancuerna(90, 28, 6)}
  ${flecha('M112 40 Q116 26 104 20')}
`);

const svgCrossOver = svg(`
  <!-- torres de poleas -->
  <path d="M16 16 L16 112 M144 16 L144 112" stroke="${C.equipo}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="16" cy="22" r="5" fill="none" stroke="${C.equipo}" stroke-width="3"/>
  <circle cx="144" cy="22" r="5" fill="none" stroke="${C.equipo}" stroke-width="3"/>
  <!-- cables tensos hasta las manos -->
  <path d="M16 27 L46 58 M144 27 L114 58" stroke="${C.equipo}" stroke-width="2.4"/>
  <!-- cuerpo de frente -->
  <circle cx="80" cy="32" r="9.5" fill="${C.cuerpo}"/>
  ${trazo('M80 42 L80 78')}
  <ellipse cx="80" cy="52" rx="17" ry="10" fill="${C.musculo}"/>
  ${trazo('M80 78 L70 100 L67 114')}
  ${trazo('M80 78 L90 100 L93 114')}
  <!-- brazos abiertos, a punto de juntarse al frente -->
  ${trazo('M74 50 L58 55 L46 58', 4.5)}
  ${trazo('M86 50 L102 55 L114 58', 4.5)}
  ${flecha('M40 74 Q56 80 68 74')}
  ${flecha('M120 74 Q104 80 92 74')}
`);

const svgCristos = svg(`
  <!-- banco visto desde arriba -->
  <rect x="66" y="16" width="28" height="96" rx="13" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3"/>
  <!-- cuerpo acostado, visto desde arriba -->
  <circle cx="80" cy="30" r="9" fill="${C.cuerpo}"/>
  ${trazo('M80 39 L80 90')}
  <ellipse cx="80" cy="52" rx="17" ry="11" fill="${C.musculo}"/>
  ${trazo('M80 90 L72 112')}
  ${trazo('M80 90 L88 112')}
  <!-- brazos abiertos en cruz -->
  ${trazo('M76 50 L50 44 L30 50', 4.5)}
  ${trazo('M84 50 L110 44 L130 50', 4.5)}
  ${mancuerna(26, 51, 76)}
  ${mancuerna(134, 51, 104)}
  ${flecha('M36 64 Q52 70 64 64')}
  ${flecha('M124 64 Q108 70 96 64')}
`);

const svgFondos = svg(`
  <!-- barras paralelas, vistas de frente -->
  <path d="M34 48 L62 48 M98 48 L126 48" stroke="${C.equipo}" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 48 L40 114 M120 48 L120 114" stroke="${C.equipo}" stroke-width="4" stroke-linecap="round"/>
  <!-- cuerpo suspendido, abajo del recorrido -->
  <circle cx="80" cy="40" r="9" fill="${C.cuerpo}"/>
  ${trazo('M80 49 L80 86')}
  <ellipse cx="80" cy="60" rx="15" ry="9" fill="${C.musculo}"/>
  <!-- piernas flexionadas hacia atras -->
  ${trazo('M80 86 L71 103 L74 116')}
  ${trazo('M80 86 L89 103 L86 116')}
  <!-- manos fijas en la barra y codos abiertos hacia afuera -->
  ${trazo('M73 57 L44 68 L48 48', 4.5)}
  ${trazo('M87 57 L116 68 L112 48', 4.5)}
  ${flecha('M140 56 L140 88')}
`);


// ------------------------------------------------------------
//  DÍA 2 — CUÁDRICEPS
// ------------------------------------------------------------

const svgSentadilla = svg(`
  ${marco('M50 112 L112 112')}
  ${barra(80, 42, 64)}
  ${cabeza(88, 32)}
  ${trazo('M84 46 L66 72')}
  ${musculo(79, 75, 13, 8, -12)}
  ${trazo('M66 72 L92 79 L90 110')}
  ${trazo('M66 72 L78 84 L76 110')}
  ${flecha('M116 80 L116 48')}
`);

const svgExtensiones = svg(`
  ${cojin(50, 74, 46, 11)}
  ${cojin(42, 38, 11, 38)}
  ${marco('M58 85 L56 112 M90 85 L92 112')}
  ${cabeza(58, 30)}
  ${trazo('M58 39 L58 70')}
  ${trazo('M58 70 L92 74')}
  ${musculo(76, 71, 14, 8)}
  ${trazo('M92 74 L124 60')}
  ${cojin(118, 52, 13, 16, 6)}
  ${flecha('M116 90 Q132 78 126 60')}
`);

const svgPrensa = svg(`
  ${marco('M26 100 L120 40', 4)}
  <path d="M110 25 L130 55" fill="none" stroke="${C.equipo}" stroke-width="7" stroke-linecap="round"/>
  ${cojin(12, 72, 40, 13, 6)}
  ${cabeza(20, 62)}
  ${trazo('M28 70 L56 82')}
  ${trazo('M56 82 L88 62')}
  ${musculo(72, 72, 14, 8, -32)}
  ${trazo('M88 62 L114 42')}
  ${flecha('M92 94 L118 68')}
`);

const svgAductor = svg(`
  ${cojin(64, 62, 32, 12)}
  ${marco('M80 74 L80 108 M62 108 L98 108')}
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 60')}
  ${trazo('M80 60 L52 82 L48 108')}
  ${trazo('M80 60 L108 82 L112 108')}
  ${musculo(64, 74, 10, 7, 40)}
  ${musculo(96, 74, 10, 7, -40)}
  ${cojin(61, 70, 11, 26)}
  ${cojin(88, 70, 11, 26)}
  ${flecha('M40 100 L58 94')}
  ${flecha('M120 100 L102 94')}
`);

const svgExtensionUnilateral = svg(`
  ${cojin(50, 74, 46, 11)}
  ${cojin(42, 38, 11, 38)}
  ${marco('M58 85 L56 112 M90 85 L92 112')}
  ${cabeza(58, 30)}
  ${trazo('M58 39 L58 70')}
  ${trazo('M58 70 L92 74')}
  ${musculo(76, 71, 14, 8)}
  ${trazo('M92 74 L124 58')}
  ${trazo('M92 78 L100 98 L98 112')}
  ${cojin(118, 50, 13, 16, 6)}
  ${flecha('M116 90 Q132 76 126 58')}
`);

const svgDesplanteSmith = svg(`
  ${marco('M28 10 L28 112', 4)}
  ${marco('M132 10 L132 112', 4)}
  ${marco('M44 112 L124 112')}
  ${cabeza(80, 32)}
  ${barra(80, 50, 66)}
  ${trazo('M80 52 L80 74')}
  ${trazo('M80 74 L56 88 L56 110')}
  ${musculo(65, 83, 11, 7, 32)}
  ${trazo('M80 74 L102 96 L116 108')}
  ${flecha('M118 62 L118 90')}
`);

// ------------------------------------------------------------
//  DÍA 3 — BRAZO
// ------------------------------------------------------------

const svgBarraDePie = svg(`
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 76')}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M73 44 L60 62 L67 76', 4.5)}
  ${trazo('M87 44 L100 62 L93 76', 4.5)}
  ${musculo(63, 55, 8, 6, 32)}
  ${musculo(97, 55, 8, 6, -32)}
  ${barra(80, 78, 58)}
  ${flecha('M118 88 Q126 68 112 56')}
`);

const svgMartillos = svg(`
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 76')}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M73 44 L62 62 L68 74', 4.5)}
  ${trazo('M87 44 L98 62 L92 74', 4.5)}
  ${musculo(64, 55, 8, 6, 32)}
  ${musculo(96, 55, 8, 6, -32)}
  ${mancuerna(66, 76, 90)}
  ${mancuerna(94, 76, 90)}
  ${flecha('M118 88 Q126 70 112 58')}
`);

const svgPredicador = svg(`
  <path d="M44 90 L96 50 L104 60 L52 100 Z" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3" stroke-linejoin="round"/>
  ${marco('M56 100 L54 114 M96 66 L100 114')}
  ${cabeza(40, 54)}
  ${trazo('M42 63 L52 86')}
  ${trazo('M50 76 L84 58 L106 68', 4.5)}
  ${musculo(68, 66, 12, 6, -30)}
  ${barra(116, 70, 32)}
  ${flecha('M130 90 Q138 76 126 64')}
`);

const svgConcentrado = svg(`
  ${cojin(50, 74, 42, 11)}
  ${marco('M58 85 L56 112 M84 85 L86 112')}
  ${marco('M142 56 L142 112', 5)}
  ${polea(142, 100)}
  ${cabeza(62, 38)}
  ${trazo('M62 47 L68 72')}
  ${trazo('M68 72 L92 84 L92 110')}
  ${trazo('M66 54 L82 70 L104 62', 4.5)}
  ${musculo(88, 68, 10, 6, -22)}
  ${cable('M142 100 L104 62')}
  ${flecha('M114 86 Q122 72 110 60')}
`);

const svgPressFrances = svg(`
  ${cojin(32, 78, 88, 11, 4)}
  ${marco('M42 89 L38 114 M110 89 L114 114')}
  ${cabeza(110, 68)}
  ${trazo('M101 72 L64 72')}
  ${trazo('M64 72 L48 82 L34 98')}
  ${trazo('M96 68 L94 46 L110 40', 4.5)}
  ${trazo('M90 70 L88 48 L104 42', 4.5)}
  ${musculo(92, 55, 7, 10, 8)}
  ${barra(114, 40, 28, 72)}
  ${flecha('M128 58 Q134 44 124 34')}
`);

const svgJalonSupino = svg(`
  ${marco('M136 12 L136 112', 5)}
  ${polea(136, 18)}
  ${cable('M136 23 L106 56')}
  ${cabeza(72, 30)}
  ${trazo('M72 39 L72 76')}
  ${trazo('M72 76 L62 100 L60 114')}
  ${trazo('M72 76 L82 100 L84 114')}
  ${trazo('M78 48 L96 54 L106 56', 4.5)}
  ${musculo(93, 52, 9, 6, 14)}
  ${flecha('M118 70 L118 96')}
`);

const svgCuerda = svg(`
  ${marco('M132 12 L132 112', 5)}
  ${polea(132, 18)}
  ${cable('M132 23 L102 48')}
  <path d="M102 48 L94 72 M102 48 L110 72" fill="none" stroke="${C.cuerpo}" stroke-width="4" stroke-linecap="round"/>
  ${cabeza(74, 28)}
  ${trazo('M74 37 L74 76')}
  ${trazo('M74 76 L64 100 L62 114')}
  ${trazo('M74 76 L86 100 L88 114')}
  ${trazo('M79 46 L94 54 L100 70', 4.5)}
  ${musculo(88, 52, 8, 6, 26)}
  ${flecha('M118 60 L118 88')}
`);

const svgPatadaMula = svg(`
  ${cabeza(38, 46)}
  ${trazo('M47 50 L90 62')}
  ${musculo(66, 56, 13, 7, 14)}
  ${trazo('M90 62 L94 88 L92 114')}
  ${trazo('M90 62 L82 88 L80 114')}
  ${trazo('M58 54 L74 70 L100 62', 4.5)}
  ${musculo(88, 66, 10, 6, -14)}
  ${mancuerna(106, 60, 76)}
  ${flecha('M108 84 Q120 74 114 60')}
`);


// ------------------------------------------------------------
//  DÍA 4 — ESPALDA Y HOMBRO
// ------------------------------------------------------------

const svgJalonAbierto = svg(`
  ${marco('M134 10 L134 112', 5)}
  ${polea(134, 16)}
  ${cable('M134 21 L80 32')}
  ${barra(80, 32, 72)}
  ${cabeza(80, 54)}
  ${trazo('M80 63 L80 92')}
  ${musculo(80, 74, 18, 10)}
  ${trazo('M80 92 L70 112')}
  ${trazo('M80 92 L90 112')}
  ${trazo('M74 66 L58 48 L46 34', 4.5)}
  ${trazo('M86 66 L102 48 L114 34', 4.5)}
  ${flecha('M120 54 L120 82')}
`);

const svgPosterior = svg(`
  ${cabeza(80, 38)}
  ${trazo('M80 47 L80 68')}
  ${musculo(80, 55, 16, 8)}
  ${trazo('M80 68 L68 88 L64 114')}
  ${trazo('M80 68 L92 88 L96 114')}
  ${trazo('M73 53 L52 57 L34 65', 4.5)}
  ${trazo('M87 53 L108 57 L126 65', 4.5)}
  ${mancuerna(28, 67, 76)}
  ${mancuerna(132, 67, 104)}
  ${flecha('M66 86 Q48 94 32 88')}
  ${flecha('M94 86 Q112 94 128 88')}
`);

const svgJalonCerrado = svg(`
  ${marco('M136 10 L136 112', 5)}
  ${polea(136, 16)}
  ${cable('M136 21 L80 26')}
  <path d="M68 26 L92 26" fill="none" stroke="${C.equipo}" stroke-width="4.5" stroke-linecap="round"/>
  ${cabeza(80, 60)}
  ${trazo('M80 69 L80 94')}
  ${musculo(80, 79, 14, 10)}
  ${trazo('M80 94 L70 114')}
  ${trazo('M80 94 L90 114')}
  ${trazo('M74 72 L60 48 L76 28', 4.5)}
  ${trazo('M86 72 L100 48 L84 28', 4.5)}
  ${flecha('M118 48 L118 78')}
`);

const svgLateralesCable = svg(`
  ${marco('M22 12 L22 112', 5)}
  ${polea(22, 104)}
  ${cabeza(86, 32)}
  ${trazo('M86 41 L86 78')}
  ${trazo('M86 78 L78 100 L76 114')}
  ${trazo('M86 78 L94 100 L96 114')}
  ${trazo('M80 50 L64 52 L52 58', 4.5)}
  ${musculo(76, 46, 9, 6, -16)}
  ${cable('M22 104 L52 58')}
  ${flecha('M44 84 Q40 66 50 54')}
`);

const svgRemoSentado = svg(`
  ${marco('M16 38 L16 108', 5)}
  ${polea(16, 72)}
  ${cojin(56, 84, 48, 10)}
  ${cabeza(94, 42)}
  ${trazo('M94 51 L94 80')}
  ${musculo(94, 62, 11, 10)}
  ${trazo('M94 80 L60 86 L44 98')}
  ${trazo('M88 58 L70 66 L54 70', 4.5)}
  ${cable('M16 72 L54 70')}
  ${flecha('M46 48 L80 44')}
`);

const svgPressArnold = svg(`
  ${cojin(60, 84, 40, 10)}
  ${cojin(56, 46, 11, 40)}
  ${marco('M68 94 L66 114 M96 94 L98 114')}
  ${cabeza(80, 36)}
  ${trazo('M80 45 L80 82')}
  ${musculo(80, 54, 13, 8)}
  ${trazo('M74 50 L62 38 L58 24', 4.5)}
  ${trazo('M86 50 L98 38 L102 24', 4.5)}
  ${mancuerna(54, 20, -22)}
  ${mancuerna(106, 20, 22)}
  ${flecha('M38 46 Q42 26 56 18')}
  ${flecha('M122 46 Q118 26 104 18')}
`);

const svgRemoMancuerna = svg(`
  ${cojin(28, 78, 58, 11, 4)}
  ${marco('M38 89 L36 114 M76 89 L78 114')}
  ${cabeza(34, 48)}
  ${trazo('M43 52 L88 62')}
  ${musculo(64, 56, 14, 7, 12)}
  ${trazo('M88 62 L98 86 L96 114')}
  ${trazo('M60 56 L64 76 L66 90', 4.5)}
  ${mancuerna(66, 96, 0)}
  ${flecha('M86 98 L86 70')}
`);

const svgFrontalDisco = svg(`
  ${cabeza(68, 28)}
  ${trazo('M68 37 L68 78')}
  ${trazo('M68 78 L60 102 L58 114')}
  ${trazo('M68 78 L76 102 L78 114')}
  ${musculo(72, 46, 8, 7)}
  ${trazo('M70 46 L94 52', 4.5)}
  ${disco(108, 54, 13)}
  ${flecha('M112 86 Q126 70 116 54')}
`);

// ------------------------------------------------------------
//  DÍA 5 — FEMORAL Y GLÚTEO
// ------------------------------------------------------------

const svgFemoralAcostado = svg(`
  ${cojin(30, 60, 84, 12, 5)}
  ${marco('M40 72 L38 112 M104 72 L108 112')}
  ${cabeza(36, 50)}
  ${trazo('M45 54 L104 58')}
  ${musculo(86, 56, 15, 7)}
  ${trazo('M104 58 L128 42')}
  ${cojin(120, 30, 15, 14, 6)}
  ${flecha('M136 66 Q144 50 134 38')}
`);

const svgPesoMuerto = svg(`
  ${marco('M44 112 L112 112')}
  ${cabeza(62, 34)}
  ${trazo('M68 41 L84 66')}
  ${musculo(88, 76, 12, 8, -62)}
  ${trazo('M84 66 L86 92 L84 110')}
  ${trazo('M76 50 L74 74 L74 90', 4.5)}
  ${barra(76, 94, 62)}
  ${flecha('M118 92 L118 56')}
`);

const svgFemoralDePie = svg(`
  ${marco('M120 18 L120 112', 4)}
  ${cojin(90, 34, 28, 10, 5)}
  ${cabeza(70, 24)}
  ${trazo('M70 33 L70 76')}
  ${trazo('M70 76 L68 100 L66 114')}
  ${trazo('M70 76 L94 88 L102 62')}
  ${musculo(86, 84, 11, 6, -22)}
  ${cojin(95, 50, 15, 12, 5)}
  ${flecha('M114 94 Q128 76 114 58')}
`);

const svgAbductor = svg(`
  ${cojin(64, 64, 32, 12)}
  ${marco('M80 76 L80 108 M62 108 L98 108')}
  ${cabeza(80, 28)}
  ${trazo('M80 37 L80 62')}
  ${trazo('M80 62 L50 82 L44 108')}
  ${trazo('M80 62 L110 82 L116 108')}
  ${musculo(62, 74, 10, 7, 36)}
  ${musculo(98, 74, 10, 7, -36)}
  ${cojin(32, 70, 13, 24)}
  ${cojin(115, 70, 13, 24)}
  ${flecha('M58 100 L32 106')}
  ${flecha('M102 100 L128 106')}
`);

const svgDesplanteCaminando = svg(`
  ${marco('M26 112 L136 112')}
  ${cabeza(72, 26)}
  ${trazo('M72 35 L72 68')}
  ${trazo('M72 68 L44 88 L44 110')}
  ${musculo(54, 82, 10, 7, 36)}
  ${trazo('M72 68 L100 94 L118 108')}
  ${trazo('M66 44 L58 66 L56 80', 4.5)}
  ${trazo('M78 44 L86 66 L88 80', 4.5)}
  ${mancuernaChica(56, 86, 0)}
  ${mancuernaChica(88, 86, 0)}
  ${flecha('M20 70 L38 70')}
`);

const svgPatadaGluteo = svg(`
  ${marco('M120 14 L120 112', 4)}
  ${cojin(88, 38, 28, 10, 5)}
  ${cabeza(76, 28)}
  ${trazo('M76 37 L76 72')}
  ${trazo('M76 72 L72 96 L70 114')}
  ${trazo('M76 72 L100 80 L114 66')}
  ${musculo(83, 71, 11, 8, -16)}
  ${cojin(106, 56, 15, 12, 5)}
  ${flecha('M104 98 Q120 88 116 72')}
`);

const svgFemoralSentado = svg(`
  ${cojin(44, 68, 46, 11)}
  ${cojin(36, 34, 11, 36)}
  ${marco('M52 79 L50 112 M82 79 L84 112')}
  ${cabeza(52, 26)}
  ${trazo('M52 35 L52 64')}
  ${trazo('M52 64 L92 68')}
  ${musculo(76, 70, 14, 7)}
  ${trazo('M92 68 L108 92')}
  ${cojin(100, 92, 17, 12, 5)}
  ${flecha('M124 60 Q132 80 118 96')}
`);

const svgSentadillaChina = svg(`
  ${cojin(104, 74, 40, 11, 4)}
  ${marco('M114 85 L112 112 M138 85 L140 112')}
  ${marco('M24 112 L100 112')}
  ${cabeza(58, 26)}
  ${trazo('M58 35 L58 66')}
  ${trazo('M58 66 L46 90 L46 110')}
  ${musculo(51, 80, 10, 7, 50)}
  ${trazo('M58 66 L84 80 L104 72')}
  ${trazo('M52 44 L44 66 L44 78', 4.5)}
  ${trazo('M64 44 L72 66 L72 78', 4.5)}
  ${mancuernaChica(42, 84, 0)}
  ${mancuernaChica(74, 84, 0)}
  ${flecha('M20 66 L20 94')}
`);


// ------------------------------------------------------------
//  ALTERNATIVAS
//  No salen en ninguna rutina: existen para cuando el aparato
//  está ocupado o no tienes el equipo que pide el ejercicio.
// ------------------------------------------------------------

const svgFlexiones = svg(`
  ${marco('M16 106 L144 106')}
  ${cabeza(36, 60)}
  ${trazo('M45 64 L104 76')}
  ${musculo(64, 68, 14, 7, 12)}
  ${trazo('M104 76 L132 100')}
  ${trazo('M48 68 L42 86 L48 104', 4.5)}
  ${flecha('M24 92 L24 62')}
`);

const svgBancoBarra = svg(`
  ${cojin(32, 78, 88, 11, 4)}
  ${marco('M42 89 L38 114 M110 89 L114 114')}
  ${cabeza(110, 68)}
  ${trazo('M101 72 L64 72')}
  ${musculo(92, 70, 14, 9)}
  ${trazo('M64 72 L48 82 L34 98')}
  ${trazo('M96 68 L94 46', 4.5)}
  ${trazo('M88 70 L86 48', 4.5)}
  ${barra(90, 42, 60)}
  ${flecha('M118 46 L118 24')}
`);

const svgPressPechoMaquina = svg(`
  ${marco('M26 14 L26 112', 5)}
  ${cojin(54, 84, 42, 10)}
  ${cojin(50, 44, 11, 42)}
  ${marco('M62 94 L60 114 M90 94 L92 114')}
  ${cabeza(72, 34)}
  ${trazo('M72 43 L72 82')}
  ${musculo(72, 56, 14, 9)}
  ${trazo('M78 52 L98 56 L114 54', 4.5)}
  ${marco('M114 38 L114 70')}
  ${flecha('M92 78 L122 72')}
`);

const svgPecDeck = svg(`
  ${marco('M18 14 L18 110 M142 14 L142 110', 4)}
  ${cojin(56, 84, 48, 10)}
  ${cabeza(80, 30)}
  ${trazo('M80 39 L80 82')}
  ${musculo(80, 54, 16, 9)}
  ${trazo('M74 50 L52 52 L38 50', 4.5)}
  ${trazo('M86 50 L108 52 L122 50', 4.5)}
  ${cojin(26, 36, 12, 28)}
  ${cojin(122, 36, 12, 28)}
  ${flecha('M38 72 Q56 78 70 70')}
  ${flecha('M122 72 Q104 78 90 70')}
`);

const svgPullOverPolea = svg(`
  ${marco('M136 12 L136 112', 5)}
  ${polea(136, 18)}
  ${cable('M136 23 L106 44')}
  ${cabeza(68, 30)}
  ${trazo('M68 39 L68 76')}
  ${trazo('M68 76 L58 100 L56 114')}
  ${trazo('M68 76 L78 100 L80 114')}
  ${musculo(68, 52, 12, 9)}
  ${trazo('M74 46 L92 44 L106 44', 4.5)}
  ${flecha('M116 60 Q120 78 108 86')}
`);

const svgDominadas = svg(`
  ${marco('M24 22 L136 22', 5)}
  ${marco('M30 22 L30 8 M130 22 L130 8')}
  ${cabeza(80, 44)}
  ${trazo('M80 53 L80 88')}
  ${musculo(80, 64, 15, 10)}
  ${trazo('M80 88 L72 106 L74 116')}
  ${trazo('M80 88 L88 106 L86 116')}
  ${trazo('M74 56 L62 38 L58 24', 4.5)}
  ${trazo('M86 56 L98 38 L102 24', 4.5)}
  ${flecha('M118 72 L118 44')}
`);

const svgRemoBarra = svg(`
  ${marco('M24 112 L136 112')}
  ${cabeza(34, 44)}
  ${trazo('M43 48 L92 58')}
  ${musculo(64, 52, 14, 8, 12)}
  ${trazo('M92 58 L98 86 L96 110')}
  ${trazo('M92 58 L86 86 L84 110')}
  ${trazo('M54 52 L54 72 L54 86', 4.5)}
  ${barra(54, 90, 44)}
  ${flecha('M112 96 L112 68')}
`);

const svgPressMilitar = svg(`
  ${cabeza(80, 48)}
  ${trazo('M80 57 L80 84')}
  ${musculo(80, 62, 13, 8)}
  ${trazo('M80 84 L70 106 L68 116')}
  ${trazo('M80 84 L90 106 L92 116')}
  ${trazo('M74 60 L64 42 L62 28', 4.5)}
  ${trazo('M86 60 L96 42 L98 28', 4.5)}
  ${barra(80, 26, 60)}
  ${flecha('M118 50 L118 26')}
`);

const svgPressHombroMaquina = svg(`
  ${marco('M124 14 L124 112', 5)}
  ${cojin(56, 84, 42, 10)}
  ${cojin(52, 46, 11, 40)}
  ${marco('M64 94 L62 114 M92 94 L94 114')}
  ${cabeza(76, 36)}
  ${trazo('M76 45 L76 82')}
  ${musculo(76, 54, 13, 8)}
  ${trazo('M70 50 L62 34 L64 22', 4.5)}
  ${trazo('M82 50 L92 34 L94 22', 4.5)}
  ${marco('M56 20 L102 20')}
  ${flecha('M112 46 L112 22')}
`);

const svgLateralesMancuerna = svg(`
  ${cabeza(80, 28)}
  ${trazo('M80 37 L80 76')}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M74 46 L54 48 L38 52', 4.5)}
  ${trazo('M86 46 L106 48 L122 52', 4.5)}
  ${musculo(72, 43, 9, 6, -14)}
  ${musculo(88, 43, 9, 6, 14)}
  ${mancuerna(32, 53, 84)}
  ${mancuerna(128, 53, 96)}
  ${flecha('M32 76 Q26 58 36 46')}
  ${flecha('M128 76 Q134 58 124 46')}
`);

const svgFrontalMancuerna = svg(`
  ${cabeza(66, 28)}
  ${trazo('M66 37 L66 78')}
  ${trazo('M66 78 L58 102 L56 114')}
  ${trazo('M66 78 L74 102 L76 114')}
  ${musculo(70, 46, 8, 7)}
  ${trazo('M68 46 L98 52', 4.5)}
  ${mancuerna(110, 53, 0)}
  ${flecha('M112 84 Q126 68 116 54')}
`);

const svgPosteriorPolea = svg(`
  ${marco('M20 14 L20 112', 5)}
  ${polea(20, 30)}
  ${cable('M20 35 L60 52')}
  ${cabeza(86, 32)}
  ${trazo('M86 41 L86 78')}
  ${trazo('M86 78 L78 100 L76 114')}
  ${trazo('M86 78 L94 100 L96 114')}
  ${musculo(81, 46, 10, 6, -16)}
  ${trazo('M80 48 L68 50 L60 52', 4.5)}
  ${flecha('M52 74 Q40 64 46 50')}
`);

const svgFondosBanco = svg(`
  ${cojin(18, 56, 46, 11, 4)}
  ${marco('M28 67 L26 112 M56 67 L58 112')}
  ${cabeza(78, 48)}
  ${trazo('M78 57 L82 84')}
  ${musculo(68, 58, 7, 11, 26)}
  ${trazo('M82 84 L116 90 L134 88')}
  ${trazo('M72 58 L58 74 L52 58', 4.5)}
  ${flecha('M102 62 L102 90')}
`);

const svgSentadillaGoblet = svg(`
  ${marco('M34 112 L130 112')}
  ${cabeza(70, 28)}
  ${trazo('M70 37 L66 66')}
  ${musculo(80, 80, 13, 8, -26)}
  ${trazo('M66 66 L102 78 L100 110')}
  ${trazo('M66 66 L82 86 L80 110')}
  ${trazo('M68 46 L82 52', 4.5)}
  ${mancuerna(90, 54, 90)}
  ${flecha('M118 86 L118 54')}
`);

const svgPesoMuertoRumano = svg(`
  ${marco('M38 112 L124 112')}
  ${cabeza(58, 36)}
  ${trazo('M65 42 L88 62')}
  ${musculo(94, 78, 12, 8, -62)}
  ${trazo('M88 62 L90 90 L88 112')}
  ${trazo('M76 48 L78 74 L78 88', 4.5)}
  ${mancuerna(78, 94, 0)}
  ${flecha('M114 92 L114 58')}
`);

const svgPuenteGluteo = svg(`
  ${marco('M16 106 L144 106')}
  ${cabeza(32, 92)}
  ${trazo('M41 88 L76 68')}
  ${musculo(84, 70, 12, 8, -14)}
  ${trazo('M76 68 L102 78 L102 104')}
  ${trazo('M76 68 L92 84 L92 104')}
  ${flecha('M122 90 L122 62')}
`);

const svgAbduccionDePie = svg(`
  ${marco('M28 114 L132 114')}
  ${cabeza(76, 28)}
  ${trazo('M76 37 L76 74')}
  ${trazo('M76 74 L72 98 L70 114')}
  ${musculo(92, 84, 10, 7, -42)}
  ${trazo('M76 74 L104 92 L114 110')}
  ${flecha('M126 98 Q136 82 124 70')}
`);


// ------------------------------------------------------------
//  ABDOMEN, PANTORRILLA Y TRAPECIO
//  Grupos que la rutina del entrenador no toca, pero que forman
//  parte de cualquier gimnasio.
// ------------------------------------------------------------

const svgEncogimiento = svg(`
  ${marco('M14 106 L146 106')}
  ${trazo('M86 100 L106 76 L112 102')}
  ${cabeza(46, 76)}
  ${trazo('M54 82 L86 100')}
  ${musculo(70, 92, 12, 8, 30)}
  ${trazo('M56 86 L70 82', 4.5)}
  ${flecha('M36 92 Q34 74 48 66')}
`);

const svgAbdominalCompleto = svg(`
  ${marco('M14 106 L146 106')}
  ${trazo('M88 100 L108 74 L114 102')}
  ${cabeza(58, 58)}
  ${trazo('M63 67 L88 100')}
  ${musculo(76, 84, 12, 8, 36)}
  ${trazo('M62 70 L78 66', 4.5)}
  ${flecha('M38 88 Q40 64 56 52')}
`);

const svgElevacionPiernas = svg(`
  ${marco('M24 20 L136 20', 5)}
  ${marco('M30 20 L30 8 M130 20 L130 8')}
  ${cabeza(78, 48)}
  ${trazo('M72 40 L70 24', 4.5)}
  ${trazo('M84 40 L86 24', 4.5)}
  ${trazo('M78 57 L78 84')}
  ${musculo(78, 76, 12, 9)}
  ${trazo('M78 84 L108 86 L114 74')}
  ${flecha('M116 108 Q130 94 122 80')}
`);

const svgEncogimientoPolea = svg(`
  ${marco('M136 12 L136 112', 5)}
  ${polea(136, 18)}
  ${cable('M136 23 L100 44')}
  ${marco('M50 104 L114 104')}
  ${cabeza(70, 50)}
  ${trazo('M72 59 L68 84')}
  ${musculo(70, 71, 11, 9)}
  ${trazo('M68 84 L92 92 L98 102')}
  ${trazo('M74 56 L92 48 L100 44', 4.5)}
  ${flecha('M50 62 Q46 80 58 90')}
`);

const svgPlancha = svg(`
  ${marco('M14 106 L146 106')}
  ${cabeza(36, 64)}
  ${trazo('M45 68 L118 92')}
  ${musculo(78, 80, 15, 8, 18)}
  ${trazo('M48 72 L40 92 L64 98', 4.5)}
  ${trazo('M118 92 L130 104')}
`);

const svgGiroRuso = svg(`
  ${marco('M18 106 L142 106')}
  ${cabeza(54, 46)}
  ${trazo('M57 55 L72 84')}
  ${musculo(66, 72, 11, 9, 26)}
  ${trazo('M72 84 L100 74 L114 88')}
  ${trazo('M62 64 L88 62', 4.5)}
  ${mancuernaChica(96, 62, 0)}
  ${flecha('M98 42 Q76 32 58 44')}
`);

const svgBicicleta = svg(`
  ${marco('M14 106 L146 106')}
  ${cabeza(42, 80)}
  ${trazo('M51 86 L86 96')}
  ${musculo(68, 90, 12, 7, 14)}
  ${trazo('M86 96 L106 76 L100 58')}
  ${trazo('M86 96 L116 102 L132 98')}
  ${trazo('M55 88 L70 78', 4.5)}
  ${flecha('M112 56 Q96 46 84 60')}
`);

const svgTalonesDePie = svg(`
  ${marco('M118 16 L118 112', 4)}
  ${cabeza(80, 18)}
  ${cojin(62, 30, 38, 11, 5)}
  ${trazo('M80 41 L80 78')}
  ${trazo('M80 78 L78 96')}
  ${musculo(75, 88, 7, 11)}
  ${trazo('M78 96 L90 102')}
  ${marco('M58 104 L102 104', 5)}
  ${flecha('M106 96 L106 66')}
`);

const svgTalonesSentado = svg(`
  ${cojin(42, 68, 44, 11)}
  ${cojin(34, 34, 11, 36)}
  ${marco('M50 79 L48 112 M78 79 L80 112')}
  ${cabeza(50, 24)}
  ${trazo('M50 33 L50 62')}
  ${trazo('M50 62 L90 70')}
  ${cojin(76, 52, 26, 12, 5)}
  ${trazo('M90 70 L94 92')}
  ${musculo(97, 84, 7, 10)}
  ${trazo('M94 92 L106 98')}
  ${marco('M84 104 L122 104')}
  ${flecha('M126 96 L126 72')}
`);

const svgPrensaTalones = svg(`
  ${marco('M26 100 L128 44', 4)}
  <path d="M116 30 L136 60" fill="none" stroke="${C.equipo}" stroke-width="7" stroke-linecap="round"/>
  ${cojin(12 , 72, 40, 13, 6)}
  ${cabeza(20, 62)}
  ${trazo('M28 70 L58 80')}
  ${trazo('M58 80 L96 60')}
  ${musculo(90, 64, 8, 10, -30)}
  ${trazo('M96 60 L114 48')}
  ${flecha('M104 80 L124 64')}
`);

const svgEncogimientoBarra = svg(`
  ${cabeza(80, 30)}
  ${trazo('M80 39 L80 76')}
  ${musculo(66, 46, 10, 7, -22)}
  ${musculo(94, 46, 10, 7, 22)}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M70 47 L68 72', 4.5)}
  ${trazo('M90 47 L92 72', 4.5)}
  ${barra(80, 76, 56)}
  ${flecha('M116 64 L116 38')}
`);

const svgEncogimientoMancuerna = svg(`
  ${cabeza(80, 30)}
  ${trazo('M80 39 L80 76')}
  ${musculo(66, 46, 10, 7, -22)}
  ${musculo(94, 46, 10, 7, 22)}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M68 47 L66 70', 4.5)}
  ${trazo('M92 47 L94 70', 4.5)}
  ${mancuerna(66, 76, 90)}
  ${mancuerna(94, 76, 90)}
  ${flecha('M118 64 L118 38')}
`);

const svgEncogimientoPoleaTrapecio = svg(`
  ${marco('M134 14 L134 112', 5)}
  ${polea(134, 104)}
  ${cable('M134 104 L96 76')}
  ${cabeza(74, 30)}
  ${trazo('M74 39 L74 76')}
  ${musculo(60, 46, 10, 7, -22)}
  ${musculo(88, 46, 10, 7, 22)}
  ${trazo('M74 76 L64 100 L62 114')}
  ${trazo('M74 76 L84 100 L86 114')}
  ${trazo('M86 47 L94 72', 4.5)}
  ${flecha('M110 62 L110 36')}
`);


// ------------------------------------------------------------
//  VARIANTES COMUNES
//  Mismos movimientos con otro aparato: lo que encuentras libre
//  cuando lo que buscabas está ocupado.
// ------------------------------------------------------------

const svgBancoInclinadoBarra = svg(`
  <path d="M40 100 L95 52 L104 62 L49 110 Z" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3" stroke-linejoin="round"/>
  ${marco('M44 104 L36 116 M96 62 L100 116')}
  ${cabeza(98, 47)}
  ${trazo('M92 55 L64 85')}
  ${musculo(86, 62, 13, 9, -40)}
  ${trazo('M64 85 L44 92 L30 104')}
  ${trazo('M90 58 L106 40', 4.5)}
  ${trazo('M84 64 L100 46', 4.5)}
  ${barra(104, 40, 46)}
  ${flecha('M128 56 L128 32')}
`);

const svgBancoDeclinadoMancuernas = svg(`
  <path d="M34 62 L110 86 L106 96 L30 72 Z" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3" stroke-linejoin="round"/>
  ${marco('M44 94 L42 114 M98 90 L102 114')}
  ${cabeza(40, 56)}
  ${trazo('M48 62 L94 78')}
  ${musculo(66, 68, 13, 8, 18)}
  ${trazo('M94 78 L110 88 L118 102')}
  ${trazo('M56 62 L54 42', 4.5)}
  ${trazo('M64 66 L62 46', 4.5)}
  ${mancuerna(58, 36, 6)}
  ${flecha('M32 46 L32 24')}
`);

const svgRemoT = svg(`
  ${marco('M18 108 L136 108')}
  ${marco('M20 108 L104 88', 4)}
  ${disco(112, 86, 11)}
  ${cabeza(50, 44)}
  ${trazo('M59 48 L100 60')}
  ${musculo(78, 54, 13, 8, 12)}
  ${trazo('M100 60 L104 84 L102 106')}
  ${trazo('M100 60 L92 84 L90 106')}
  ${trazo('M70 52 L72 72 L74 86', 4.5)}
  ${flecha('M122 96 L122 70')}
`);

const svgRemoMaquina = svg(`
  ${marco('M130 14 L130 112', 4)}
  ${cojin(56, 84, 42, 10)}
  ${cojin(94, 44, 11, 36)}
  ${marco('M64 94 L62 114 M92 94 L94 114')}
  ${cabeza(86, 34)}
  ${trazo('M86 43 L86 82')}
  ${musculo(86, 60, 12, 9)}
  ${trazo('M92 54 L108 52 L118 54', 4.5)}
  ${marco('M118 40 L118 68')}
  ${flecha('M112 78 L90 82')}
`);

const svgRemoVerticalBarra = svg(`
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 78')}
  ${musculo(66, 44, 9, 6, -24)}
  ${musculo(94, 44, 9, 6, 24)}
  ${trazo('M80 78 L70 102 L68 114')}
  ${trazo('M80 78 L90 102 L92 114')}
  ${trazo('M74 44 L58 50 L72 58', 4.5)}
  ${trazo('M86 44 L102 50 L88 58', 4.5)}
  ${barra(80, 58, 42)}
  ${flecha('M116 78 L116 52')}
`);

const svgPressNeutroMancuerna = svg(`
  ${cabeza(80, 48)}
  ${trazo('M80 57 L80 86')}
  ${musculo(80, 62, 13, 8)}
  ${trazo('M80 86 L70 106 L68 116')}
  ${trazo('M80 86 L90 106 L92 116')}
  ${trazo('M74 60 L60 42 L58 30', 4.5)}
  ${trazo('M86 60 L100 42 L102 30', 4.5)}
  ${mancuerna(56, 26, 90)}
  ${mancuerna(104, 26, 90)}
  ${flecha('M126 56 L126 28')}
`);

const svgCurlBarraZ = svg(`
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 76')}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M73 44 L60 62 L67 76', 4.5)}
  ${trazo('M87 44 L100 62 L93 76', 4.5)}
  ${musculo(63, 55, 8, 6, 32)}
  ${musculo(97, 55, 8, 6, -32)}
  <path d="M54 80 L64 74 L72 80 L88 80 L96 74 L106 80" fill="none" stroke="${C.equipo}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="47" y="72" width="6" height="16" rx="2" fill="${C.cuerpo}"/>
  <rect x="107" y="72" width="6" height="16" rx="2" fill="${C.cuerpo}"/>
  ${flecha('M124 88 Q132 68 118 56')}
`);

const svgCurlMancuerna = svg(`
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 76')}
  ${trazo('M80 76 L70 100 L68 114')}
  ${trazo('M80 76 L90 100 L92 114')}
  ${trazo('M73 44 L62 62 L68 74', 4.5)}
  ${trazo('M87 44 L98 62 L92 74', 4.5)}
  ${musculo(64, 55, 8, 6, 32)}
  ${musculo(96, 55, 8, 6, -32)}
  ${mancuerna(66, 76, 0)}
  ${mancuerna(94, 76, 0)}
  ${flecha('M120 88 Q128 70 114 58')}
`);

const svgCurlInclinado = svg(`
  <path d="M44 104 L96 56 L104 66 L52 114 Z" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3" stroke-linejoin="round"/>
  ${marco('M50 108 L44 118 M98 66 L102 118')}
  ${cabeza(98, 52)}
  ${trazo('M92 60 L64 88')}
  ${musculo(78, 76, 8, 7, -40)}
  ${trazo('M86 64 L86 86 L96 94', 4.5)}
  ${mancuerna(102, 98, 0)}
  ${flecha('M122 98 Q130 78 116 68')}
`);

const svgCurlMaquina = svg(`
  ${marco('M24 16 L24 112', 4)}
  ${cojin(52, 84, 40, 10)}
  <path d="M54 62 L94 46 L100 56 L60 72 Z" fill="${C.equipoRelleno}" stroke="${C.equipo}" stroke-width="3" stroke-linejoin="round"/>
  ${marco('M60 94 L58 114 M86 94 L88 114')}
  ${cabeza(50, 40)}
  ${trazo('M52 49 L58 82')}
  ${trazo('M56 56 L86 50 L104 62', 4.5)}
  ${musculo(74, 52, 11, 6, -16)}
  ${flecha('M120 78 Q128 62 116 54')}
`);

const svgExtensionTrasNucaBarra = svg(`
  ${cabeza(78, 44)}
  ${trazo('M78 53 L78 82')}
  ${trazo('M78 82 L68 104 L66 116')}
  ${trazo('M78 82 L88 104 L90 116')}
  ${trazo('M72 56 L70 36 L84 30', 4.5)}
  ${trazo('M84 56 L86 36 L72 30', 4.5)}
  ${musculo(74, 45, 7, 9, 6)}
  ${barra(78, 28, 46)}
  ${flecha('M116 48 L116 24')}
`);

const svgPressCerrado = svg(`
  ${cojin(30, 80, 86, 11, 4)}
  ${marco('M40 91 L36 114 M106 91 L110 114')}
  ${cabeza(106, 70)}
  ${trazo('M97 74 L62 74')}
  ${musculo(94, 58, 7, 11, 8)}
  ${trazo('M62 74 L46 84 L32 100')}
  ${trazo('M92 70 L90 46', 4.5)}
  ${trazo('M84 72 L82 46', 4.5)}
  ${barra(86, 42, 32)}
  ${flecha('M120 54 L120 28')}
`);

const svgExtensionCuerdaTrasNuca = svg(`
  ${marco('M16 14 L16 112', 5)}
  ${polea(16, 22)}
  ${cable('M16 27 L48 42')}
  <path d="M48 42 L62 32 M48 42 L60 48" fill="none" stroke="${C.cuerpo}" stroke-width="4" stroke-linecap="round"/>
  ${cabeza(90, 46)}
  ${trazo('M90 55 L90 84')}
  ${trazo('M90 84 L80 106 L78 116')}
  ${trazo('M90 84 L100 106 L102 116')}
  ${trazo('M84 58 L78 34 L60 40', 4.5)}
  ${musculo(82, 46, 7, 10)}
  ${flecha('M114 48 L114 24')}
`);

const svgExtensionTricepsMaquina = svg(`
  ${marco('M126 14 L126 112', 4)}
  ${cojin(56, 84, 42, 10)}
  ${cojin(52, 46, 11, 40)}
  ${marco('M64 94 L62 114 M92 94 L94 114')}
  ${cabeza(76, 36)}
  ${trazo('M76 45 L76 82')}
  ${trazo('M82 52 L100 58 L114 64', 4.5)}
  ${musculo(93, 55, 9, 6, 18)}
  ${marco('M114 52 L114 78')}
  ${flecha('M102 80 L116 86')}
`);

const svgFondosMaquina = svg(`
  ${marco('M124 14 L124 112', 4)}
  ${cojin(54, 84, 42, 10)}
  ${cojin(50, 46, 11, 40)}
  ${marco('M62 94 L60 114 M90 94 L92 114')}
  ${cabeza(76, 36)}
  ${trazo('M76 45 L76 82')}
  ${musculo(90, 58, 7, 10, 14)}
  ${trazo('M82 52 L96 68 L108 80', 4.5)}
  ${marco('M106 64 L106 94')}
  ${flecha('M118 56 L118 86')}
`);

const svgSentadillaFrontal = svg(`
  ${marco('M44 112 L120 112')}
  ${cabeza(86, 30)}
  ${barra(76, 44, 56)}
  ${trazo('M84 48 L66 72')}
  ${musculo(78, 78, 13, 8, -16)}
  ${trazo('M66 72 L92 80 L90 110')}
  ${trazo('M66 72 L78 86 L76 110')}
  ${flecha('M114 84 L114 52')}
`);

const svgDesplanteBarra = svg(`
  ${marco('M34 112 L130 112')}
  ${cabeza(78, 30)}
  ${barra(78, 46, 60)}
  ${trazo('M78 50 L78 72')}
  ${trazo('M78 72 L54 88 L54 110')}
  ${musculo(63, 82, 11, 7, 32)}
  ${trazo('M78 72 L100 94 L114 108')}
  ${flecha('M124 66 L124 94')}
`);


const svgBuenosDias = svg(`
  ${marco('M38 112 L122 112')}
  ${cabeza(50, 44)}
  ${barra(60, 50, 50)}
  ${trazo('M58 54 L88 64')}
  ${musculo(94, 80, 12, 8, -62)}
  ${trazo('M88 64 L90 90 L88 110')}
  ${flecha('M114 66 Q122 84 112 98')}
`);

const svgJalonEntrePiernas = svg(`
  ${marco('M16 14 L16 112', 5)}
  ${polea(16, 100)}
  ${cable('M16 100 L64 90')}
  ${marco('M38 112 L132 112')}
  ${cabeza(94, 44)}
  ${trazo('M87 50 L106 66')}
  ${musculo(112, 80, 12, 8, -60)}
  ${trazo('M106 66 L106 92 L104 110')}
  ${trazo('M90 54 L78 78 L66 90', 4.5)}
  ${flecha('M126 84 L126 56')}
`);

const svgSubidaAlCajon = svg(`
  ${marco('M18 112 L136 112')}
  ${cojin(84, 78, 48, 34, 4)}
  ${cabeza(58, 28)}
  ${trazo('M58 37 L58 68')}
  ${trazo('M58 68 L84 74 L84 78')}
  ${musculo(72, 70, 11, 7, 16)}
  ${trazo('M58 68 L52 92 L50 112')}
  ${trazo('M52 46 L46 68', 4.5)}
  ${mancuernaChica(46, 74, 0)}
  ${flecha('M32 80 Q32 58 46 50')}
`);

const svgAduccionBanda = svg(`
  ${marco('M26 114 L136 114')}
  ${marco('M132 58 L132 114', 4)}
  <path d="M132 100 Q112 104 94 98" fill="none" stroke="${C.equipo}" stroke-width="3" stroke-dasharray="6 3"/>
  ${cabeza(64, 28)}
  ${trazo('M64 37 L64 74')}
  ${trazo('M64 74 L60 98 L58 114')}
  ${musculo(80, 86, 10, 7, -36)}
  ${trazo('M64 74 L90 92 L94 100')}
  ${flecha('M106 108 L78 106')}
`);


const svgTalonesMancuerna = svg(`
  ${marco('M54 106 L106 106', 6)}
  ${cabeza(80, 26)}
  ${trazo('M80 35 L80 74')}
  ${trazo('M80 74 L78 94')}
  ${musculo(75, 86, 7, 11)}
  ${trazo('M78 94 L92 100')}
  ${trazo('M88 42 L94 70', 4.5)}
  ${mancuerna(94, 78, 90)}
  ${flecha('M114 92 L114 62')}
`);

// ------------------------------------------------------------

export const EJERCICIOS = {
  'banco-inclinado-mancuernas': {
    nombre: 'Banco inclinado con mancuernas',
    musculo: 'Pecho superior',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'empuje-horizontal',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-horizontal-mancuernas', 'banco-inclinado-barra', 'banco-barra', 'fondos-abiertos', 'flexiones', 'press-pecho-maquina'],
    tecnica: 'Banco a 30–45°. Baja las mancuernas al nivel del pecho alto con los codos a unos 45° del torso, y empuja sin trabar los codos arriba.',
    svg: svgBancoInclinado,
  },
  'pull-over': {
    nombre: 'Pull over',
    musculo: 'Pecho y dorsal',
    tipo: 'tronco-superior',
    grupos: ['pecho', 'espalda'],
    patron: 'pull-over',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['pull-over-polea'],
    tecnica: 'Una mancuerna sujeta con las dos manos. Baja en arco por detrás de la cabeza con los codos ligeramente flexionados, y sube abriendo la caja torácica.',
    svg: svgPullOver,
  },
  'banco-horizontal-mancuernas': {
    nombre: 'Banco horizontal con mancuernas',
    musculo: 'Pecho medio',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'empuje-horizontal',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-inclinado-barra', 'banco-inclinado-mancuernas', 'banco-barra', 'fondos-abiertos', 'flexiones', 'press-pecho-maquina'],
    tecnica: 'Escápulas retraídas contra el banco y pies firmes. Baja controlado hasta sentir el estiramiento en el pecho y empuja juntando ligeramente arriba.',
    svg: svgBancoHorizontal,
  },
  'cross-over': {
    nombre: 'Cross over',
    musculo: 'Pecho interno',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'apertura',
    equipo: ['polea'],
    equivalentes: ['cristos', 'pec-deck'],
    tecnica: 'Poleas altas, un pie adelante y el torso levemente inclinado. Junta las manos al frente cruzando un poco, y aprieta el pecho un segundo.',
    svg: svgCrossOver,
  },
  'cristos': {
    nombre: 'Cristos',
    musculo: 'Pecho externo',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'apertura',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['cross-over', 'pec-deck'],
    tecnica: 'Aperturas en banco con los codos algo flexionados y fijos. Abre hasta la altura del pecho sin bajar de más, y cierra en arco amplio.',
    svg: svgCristos,
  },
  'fondos-abiertos': {
    nombre: 'Fondos abiertos',
    musculo: 'Pecho inferior',
    tipo: 'tronco-superior',
    grupos: ['pecho', 'triceps'],
    patron: 'empuje-horizontal',
    equipo: ['barras-paralelas'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-horizontal-mancuernas', 'banco-inclinado-barra', 'banco-inclinado-mancuernas', 'banco-barra', 'flexiones', 'press-pecho-maquina'],
    tecnica: 'Barras anchas, torso inclinado al frente y codos abiertos hacia afuera. Baja hasta que el hombro quede a la altura del codo.',
    svg: svgFondos,
  },

  // ---------- DÍA 2 · CUÁDRICEPS ----------
  'sentadilla': {
    nombre: 'Sentadilla',
    musculo: 'Cuádriceps y glúteo',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'sentadilla',
    equipo: ['barra'],
    equivalentes: ['sentadilla-frontal', 'sentadilla-goblet', 'prensa'],
    tecnica: 'Barra apoyada en los trapecios, pies al ancho de los hombros. Baja como si te sentaras, con la espalda recta y las rodillas siguiendo la línea de los pies.',
    svg: svgSentadilla,
  },
  'extensiones': {
    nombre: 'Extensiones',
    musculo: 'Cuádriceps',
    tipo: 'pierna',
    grupos: ['cuadriceps'],
    patron: 'extension-rodilla',
    equipo: ['maquina'],
    equivalentes: ['desplante-caminando', 'sentadilla-goblet', 'extension-unilateral'],
    tecnica: 'Espalda pegada al respaldo y rodillo sobre el empeine. Estira hasta casi bloquear la rodilla, aprieta arriba un segundo y baja sin soltar la tensión.',
    svg: svgExtensiones,
  },
  'prensa': {
    nombre: 'Prensa',
    musculo: 'Cuádriceps y glúteo',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'sentadilla',
    equipo: ['maquina'],
    equivalentes: ['sentadilla', 'sentadilla-frontal', 'sentadilla-goblet'],
    tecnica: 'Pies a media plataforma al ancho de las caderas. Baja hasta unos 90° sin que la cadera se despegue del asiento, y empuja sin bloquear las rodillas.',
    svg: svgPrensa,
  },
  'aductor': {
    nombre: 'Aductor',
    musculo: 'Aductores',
    tipo: 'pierna',
    grupos: ['aductores'],
    patron: 'aduccion',
    equipo: ['maquina'],
    equivalentes: ['sentadilla-goblet', 'aduccion-banda'],
    tecnica: 'Sentado con las piernas abiertas contra los rodillos. Cierra apretando la cara interna del muslo y regresa despacio, sin dejar que el peso te gane.',
    svg: svgAductor,
  },
  'extension-unilateral': {
    nombre: 'Extensión unilateral',
    musculo: 'Cuádriceps',
    tipo: 'pierna',
    grupos: ['cuadriceps'],
    patron: 'extension-rodilla',
    equipo: ['maquina'],
    equivalentes: ['desplante-caminando', 'sentadilla-goblet', 'extensiones'],
    unilateral: true,
    tecnica: 'Una pierna a la vez para corregir descompensaciones. Sube controlado, aprieta arriba y baja más lento de lo que subiste.',
    svg: svgExtensionUnilateral,
  },
  'desplante-smith': {
    nombre: 'Desplante en Smith',
    musculo: 'Cuádriceps y glúteo',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'zancada',
    equipo: ['smith'],
    equivalentes: ['desplante-caminando', 'desplante-barra', 'sentadilla-china', 'subida-al-cajon'],
    tecnica: 'Un pie adelante y otro atrás bajo la barra guiada. Baja en vertical hasta que la rodilla trasera casi toque el piso, con el torso erguido.',
    svg: svgDesplanteSmith,
  },

  // ---------- DÍA 3 · BRAZO ----------
  'barra-de-pie': {
    nombre: 'Barra de pie',
    musculo: 'Bíceps',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['barra'],
    equivalentes: ['curl-barra-z', 'curl-mancuerna', 'martillos-mancuerna', 'curl-inclinado', 'concentrado-polea', 'curl-maquina', 'predicador'],
    tecnica: 'De pie, codos pegados al costado y agarre supino al ancho de los hombros. Sube sin balancear el torso y baja controlando todo el recorrido.',
    svg: svgBarraDePie,
  },
  'martillos-mancuerna': {
    nombre: 'Martillos con mancuerna',
    musculo: 'Bíceps y braquial',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['mancuernas'],
    equivalentes: ['barra-de-pie', 'curl-barra-z', 'curl-mancuerna', 'curl-inclinado', 'concentrado-polea', 'curl-maquina', 'predicador'],
    tecnica: 'Agarre neutro, como si sostuvieras un martillo. Los codos no se mueven del costado; sube alternando o a la vez, sin girar la muñeca.',
    svg: svgMartillos,
  },
  'predicador': {
    nombre: 'Predicador',
    musculo: 'Bíceps',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['barra', 'maquina'],
    equivalentes: ['barra-de-pie', 'curl-barra-z', 'curl-mancuerna', 'martillos-mancuerna', 'curl-inclinado', 'concentrado-polea', 'curl-maquina'],
    tecnica: 'Axilas apoyadas en el cojín inclinado para que el codo no se despegue. Baja hasta casi estirar del todo y sube sin despegar los brazos del apoyo.',
    svg: svgPredicador,
  },
  'concentrado-polea': {
    nombre: 'Concentrado en polea',
    musculo: 'Bíceps',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['polea', 'banco'],
    equivalentes: ['barra-de-pie', 'curl-barra-z', 'curl-mancuerna', 'martillos-mancuerna', 'curl-inclinado', 'curl-maquina', 'predicador'],
    unilateral: true,
    tecnica: 'Sentado, codo apoyado en la cara interna del muslo y polea baja al frente. Sube apretando el bíceps arriba y baja lento hasta estirar.',
    svg: svgConcentrado,
  },
  'press-frances': {
    nombre: 'Press francés',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['barra', 'banco'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-cerrado', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    tecnica: 'Acostado, brazos verticales. Flexiona sólo el codo llevando la barra hacia la frente, con el brazo quieto, y estira sin bloquear de golpe.',
    svg: svgPressFrances,
  },
  'jalon-una-mano-supino': {
    nombre: 'Jalón a una mano supino',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['polea'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-cerrado', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'extension-triceps-maquina', 'fondos-maquina'],
    unilateral: true,
    tecnica: 'Polea alta con agarre supino, una mano. Codo pegado al costado y fijo: sólo se mueve el antebrazo. Estira abajo y aprieta un segundo.',
    svg: svgJalonSupino,
  },
  'cuerda': {
    nombre: 'Cuerda',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['polea'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-cerrado', 'press-frances', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    tecnica: 'Polea alta con cuerda, codos al costado. Empuja hacia abajo y separa las manos al final del recorrido para cerrar más el tríceps.',
    svg: svgCuerda,
  },
  'patada-de-mula': {
    nombre: 'Patada de mula',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['mancuernas'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'press-cerrado', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    unilateral: true,
    tecnica: 'Torso inclinado al frente y brazo pegado al costado. Estira el codo llevando la mancuerna hacia atrás y aprieta arriba antes de volver.',
    svg: svgPatadaMula,
  },

  // ---------- DÍA 4 · ESPALDA Y HOMBRO ----------
  'jalon-frontal-abierto': {
    nombre: 'Jalón frontal abierto',
    musculo: 'Dorsal ancho',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-vertical',
    equipo: ['maquina'],
    equivalentes: ['dominadas', 'jalon-frontal-cerrado'],
    tecnica: 'Agarre más ancho que los hombros. Jala la barra al pecho llevando los codos hacia abajo y atrás, con el pecho arriba y sin balancearte.',
    svg: svgJalonAbierto,
  },
  'posterior-mancuerna': {
    nombre: 'Posterior con mancuerna',
    musculo: 'Deltoide posterior',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'elevacion-posterior',
    equipo: ['mancuernas'],
    equivalentes: ['posterior-polea'],
    tecnica: 'Torso inclinado al frente y rodillas algo flexionadas. Abre los brazos hacia los lados con los codos casi rectos, sin encoger los hombros.',
    svg: svgPosterior,
  },
  'jalon-frontal-cerrado': {
    nombre: 'Jalón frontal cerrado',
    musculo: 'Dorsal y espalda media',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-vertical',
    equipo: ['maquina'],
    equivalentes: ['dominadas', 'jalon-frontal-abierto'],
    tecnica: 'Agarre estrecho o en triángulo. Jala al pecho pegando los codos al cuerpo y junta las escápulas al final del recorrido.',
    svg: svgJalonCerrado,
  },
  'laterales-cable': {
    nombre: 'Laterales con cable',
    musculo: 'Deltoide lateral',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'elevacion-lateral',
    equipo: ['polea'],
    equivalentes: ['laterales-mancuerna'],
    tecnica: 'Polea baja cruzada por delante del cuerpo. Sube el brazo hasta la altura del hombro, sin encogerlo, y baja resistiendo la vuelta.',
    svg: svgLateralesCable,
  },
  'remo-sentado': {
    nombre: 'Remo sentado',
    musculo: 'Espalda media',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-horizontal',
    equipo: ['maquina'],
    equivalentes: ['remo-barra', 'remo-t', 'remo-mancuerna', 'remo-maquina'],
    tecnica: 'Espalda recta y rodillas ligeramente flexionadas. Jala al abdomen juntando las escápulas, sin echar el torso hacia atrás para ayudarte.',
    svg: svgRemoSentado,
  },
  'press-arnold': {
    nombre: 'Press Arnold',
    musculo: 'Hombro completo',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'empuje-vertical',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['press-neutro-mancuerna', 'press-militar', 'press-hombro-maquina'],
    tecnica: 'Empieza con las palmas hacia ti a la altura del pecho. Gira las muñecas hacia afuera mientras empujas arriba, y deshaz el giro al bajar.',
    svg: svgPressArnold,
  },
  'remo-mancuerna': {
    nombre: 'Remo con mancuerna',
    musculo: 'Dorsal',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-horizontal',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['remo-barra', 'remo-t', 'remo-maquina', 'remo-sentado'],
    unilateral: true,
    tecnica: 'Rodilla y mano apoyadas en el banco, espalda paralela al piso. Jala la mancuerna hacia la cadera, con el codo pegado, sin girar el torso.',
    svg: svgRemoMancuerna,
  },
  'frontal-disco': {
    nombre: 'Levantamiento frontal con disco',
    musculo: 'Deltoide anterior',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'elevacion-frontal',
    equipo: ['disco'],
    equivalentes: ['frontal-mancuerna'],
    tecnica: 'Disco sujeto con ambas manos frente a los muslos. Sube hasta la altura de los ojos con los brazos casi rectos, sin impulso de cadera.',
    svg: svgFrontalDisco,
  },

  // ---------- DÍA 5 · FEMORAL Y GLÚTEO ----------
  'femoral-acostado': {
    nombre: 'Femoral acostado',
    musculo: 'Isquiotibiales',
    tipo: 'pierna',
    grupos: ['femoral'],
    patron: 'flexion-rodilla',
    equipo: ['maquina'],
    equivalentes: ['peso-muerto-rumano', 'femoral-de-pie', 'femoral-sentado'],
    tecnica: 'Boca abajo, rodillo justo sobre el tendón de Aquiles. Flexiona llevando los talones al glúteo sin despegar la cadera del cojín.',
    svg: svgFemoralAcostado,
  },
  'peso-muerto': {
    nombre: 'Peso muerto',
    musculo: 'Femoral y glúteo',
    tipo: 'pierna',
    grupos: ['femoral', 'gluteo'],
    patron: 'bisagra',
    equipo: ['barra'],
    equivalentes: ['buenos-dias', 'peso-muerto-rumano', 'jalon-entre-piernas'],
    tecnica: 'Barra pegada a las piernas y espalda recta. Lleva la cadera hacia atrás bajando la barra por el muslo, y sube empujando el piso con los pies.',
    svg: svgPesoMuerto,
  },
  'femoral-de-pie': {
    nombre: 'Femoral de pie',
    musculo: 'Isquiotibiales',
    tipo: 'pierna',
    grupos: ['femoral'],
    patron: 'flexion-rodilla',
    equipo: ['maquina'],
    equivalentes: ['peso-muerto-rumano', 'femoral-acostado', 'femoral-sentado'],
    unilateral: true,
    tecnica: 'Una pierna a la vez, torso apoyado y estable. Flexiona la rodilla llevando el talón atrás y arriba, sin mover la cadera.',
    svg: svgFemoralDePie,
  },
  'abductor': {
    nombre: 'Abductor',
    musculo: 'Glúteo medio',
    tipo: 'pierna',
    grupos: ['abductores', 'gluteo'],
    patron: 'abduccion',
    equipo: ['maquina'],
    equivalentes: ['abduccion-de-pie'],
    tecnica: 'Sentado con las piernas juntas contra los rodillos. Abre empujando con la cara externa del muslo y cierra despacio, sin rebotar.',
    svg: svgAbductor,
  },
  'desplante-caminando': {
    nombre: 'Desplante caminando',
    musculo: 'Glúteo y cuádriceps',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'zancada',
    equipo: ['mancuernas'],
    equivalentes: ['desplante-barra', 'sentadilla-china', 'desplante-smith', 'extension-unilateral', 'extensiones', 'subida-al-cajon'],
    tecnica: 'Mancuernas a los costados. Da un paso largo y baja hasta que la rodilla trasera casi toque el piso; impúlsate con el talón de adelante.',
    svg: svgDesplanteCaminando,
  },
  'patada-gluteo': {
    nombre: 'Patada en máquina para glúteo',
    musculo: 'Glúteo mayor',
    tipo: 'pierna',
    grupos: ['gluteo'],
    patron: 'extension-cadera',
    equipo: ['maquina'],
    equivalentes: ['puente-gluteo'],
    unilateral: true,
    tecnica: 'Torso apoyado y abdomen firme. Empuja el pie hacia atrás estirando la cadera y aprieta el glúteo arriba, sin arquear la espalda baja.',
    svg: svgPatadaGluteo,
  },
  'femoral-sentado': {
    nombre: 'Femoral sentado',
    musculo: 'Isquiotibiales',
    tipo: 'pierna',
    grupos: ['femoral'],
    patron: 'flexion-rodilla',
    equipo: ['maquina'],
    equivalentes: ['peso-muerto-rumano', 'femoral-acostado', 'femoral-de-pie'],
    tecnica: 'Espalda pegada al respaldo y muslo bien sujeto por el cojín. Flexiona llevando los talones bajo el asiento y vuelve resistiendo.',
    svg: svgFemoralSentado,
  },
  'sentadilla-china': {
    nombre: 'Sentadilla china',
    musculo: 'Glúteo y cuádriceps',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'zancada',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['desplante-caminando', 'desplante-barra', 'desplante-smith', 'subida-al-cajon'],
    unilateral: true,
    tecnica: 'Pie trasero elevado en el banco y el delantero bien adelantado. Baja en vertical con el torso erguido y sube empujando con el talón.',
    svg: svgSentadillaChina,
  },

  // ---------- ALTERNATIVAS (no salen en ninguna rutina) ----------
  'flexiones': {
    nombre: 'Flexiones',
    musculo: 'Pecho y tríceps',
    tipo: 'tronco-superior',
    grupos: ['pecho', 'triceps'],
    patron: 'empuje-horizontal',
    equipo: ['ninguno'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-horizontal-mancuernas', 'banco-inclinado-barra', 'banco-inclinado-mancuernas', 'banco-barra', 'fondos-abiertos', 'press-pecho-maquina'],
    tecnica: 'Manos algo más anchas que los hombros y cuerpo en línea recta. Baja hasta que el pecho casi toque el suelo, sin arquear la espalda baja.',
    svg: svgFlexiones,
  },
  'banco-barra': {
    nombre: 'Banco plano con barra',
    musculo: 'Pecho medio',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'empuje-horizontal',
    equipo: ['barra', 'banco'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-horizontal-mancuernas', 'banco-inclinado-barra', 'banco-inclinado-mancuernas', 'fondos-abiertos', 'flexiones', 'press-pecho-maquina'],
    tecnica: 'Escápulas retraídas y pies firmes. Baja la barra al centro del pecho rozando, y empuja sin despegar la espalda alta del banco.',
    svg: svgBancoBarra,
  },
  'press-pecho-maquina': {
    nombre: 'Press de pecho en máquina',
    musculo: 'Pecho medio',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'empuje-horizontal',
    equipo: ['maquina'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-horizontal-mancuernas', 'banco-inclinado-barra', 'banco-inclinado-mancuernas', 'banco-barra', 'fondos-abiertos', 'flexiones'],
    tecnica: 'Ajusta el asiento para que las agarraderas queden a la altura del pecho. Empuja al frente sin bloquear los codos y vuelve controlando.',
    svg: svgPressPechoMaquina,
  },
  'pec-deck': {
    nombre: 'Mariposa',
    musculo: 'Pecho interno',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'apertura',
    equipo: ['maquina'],
    equivalentes: ['cristos', 'cross-over'],
    tecnica: 'Codos apoyados en los cojines a la altura del hombro. Junta al frente apretando el pecho y abre despacio sin pasarte del estiramiento.',
    svg: svgPecDeck,
  },
  'pull-over-polea': {
    nombre: 'Pull over en polea',
    musculo: 'Dorsal y pecho',
    tipo: 'tronco-superior',
    grupos: ['pecho', 'espalda'],
    patron: 'pull-over',
    equipo: ['polea'],
    equivalentes: ['pull-over'],
    tecnica: 'De pie frente a la polea alta, brazos casi rectos. Baja llevando la barra hacia los muslos con el torso firme, sin flexionar los codos.',
    svg: svgPullOverPolea,
  },
  'dominadas': {
    nombre: 'Dominadas',
    musculo: 'Dorsal ancho',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-vertical',
    equipo: ['barra-fija'],
    equivalentes: ['jalon-frontal-abierto', 'jalon-frontal-cerrado'],
    tecnica: 'Agarre más ancho que los hombros. Sube llevando el pecho a la barra con los codos hacia abajo, sin impulso de piernas.',
    svg: svgDominadas,
  },
  'remo-barra': {
    nombre: 'Remo con barra',
    musculo: 'Espalda media',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-horizontal',
    equipo: ['barra'],
    equivalentes: ['remo-t', 'remo-mancuerna', 'remo-maquina', 'remo-sentado'],
    tecnica: 'Torso inclinado unos 45° y espalda recta. Jala la barra al ombligo juntando las escápulas, y baja sin dejar caer el peso.',
    svg: svgRemoBarra,
  },
  'press-militar': {
    nombre: 'Press militar',
    musculo: 'Hombro completo',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'empuje-vertical',
    equipo: ['barra'],
    equivalentes: ['press-neutro-mancuerna', 'press-arnold', 'press-hombro-maquina'],
    tecnica: 'De pie, barra a la altura de la clavícula y abdomen apretado. Empuja arriba metiendo la cabeza al final, sin arquear la espalda baja.',
    svg: svgPressMilitar,
  },
  'press-hombro-maquina': {
    nombre: 'Press de hombro en máquina',
    musculo: 'Hombro completo',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'empuje-vertical',
    equipo: ['maquina'],
    equivalentes: ['press-neutro-mancuerna', 'press-militar', 'press-arnold'],
    tecnica: 'Espalda pegada al respaldo y agarraderas a la altura de los hombros. Empuja arriba sin bloquear los codos y baja controlado.',
    svg: svgPressHombroMaquina,
  },
  'laterales-mancuerna': {
    nombre: 'Laterales con mancuerna',
    musculo: 'Deltoide lateral',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'elevacion-lateral',
    equipo: ['mancuernas'],
    equivalentes: ['remo-vertical-barra', 'laterales-cable'],
    tecnica: 'Codos ligeramente flexionados y fijos. Sube hasta la altura del hombro guiando con el codo, sin encoger los trapecios.',
    svg: svgLateralesMancuerna,
  },
  'frontal-mancuerna': {
    nombre: 'Levantamiento frontal con mancuerna',
    musculo: 'Deltoide anterior',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'elevacion-frontal',
    equipo: ['mancuernas'],
    equivalentes: ['frontal-disco'],
    tecnica: 'Brazos casi rectos y torso quieto. Sube al frente hasta la altura de los ojos y baja sin balancearte para tomar impulso.',
    svg: svgFrontalMancuerna,
  },
  'posterior-polea': {
    nombre: 'Posterior en polea',
    musculo: 'Deltoide posterior',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'elevacion-posterior',
    equipo: ['polea'],
    equivalentes: ['posterior-mancuerna'],
    tecnica: 'Polea a la altura del hombro, brazo cruzado por delante. Abre hacia atrás y afuera con el codo casi recto, sin girar el torso.',
    svg: svgPosteriorPolea,
  },
  'fondos-banco': {
    nombre: 'Fondos en banco',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['banco'],
    equivalentes: ['extension-tras-nuca-barra', 'patada-de-mula', 'press-cerrado', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    tecnica: 'Manos en el borde del banco a la anchura de la cadera. Baja doblando sólo el codo, con los hombros lejos de las orejas.',
    svg: svgFondosBanco,
  },
  'sentadilla-goblet': {
    nombre: 'Sentadilla goblet',
    musculo: 'Cuádriceps y glúteo',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo', 'aductores'],
    patron: 'sentadilla',
    equipo: ['mancuernas'],
    equivalentes: ['sentadilla', 'sentadilla-frontal', 'aductor', 'extension-unilateral', 'extensiones', 'prensa'],
    tecnica: 'Una mancuerna sujeta contra el pecho. Baja con el torso erguido y los codos entre las rodillas, y sube empujando con los talones.',
    svg: svgSentadillaGoblet,
  },
  'peso-muerto-rumano': {
    nombre: 'Peso muerto rumano',
    musculo: 'Isquiotibiales y glúteo',
    tipo: 'pierna',
    grupos: ['femoral', 'gluteo'],
    patron: 'bisagra',
    equipo: ['mancuernas'],
    equivalentes: ['buenos-dias', 'peso-muerto', 'jalon-entre-piernas', 'femoral-acostado', 'femoral-de-pie', 'femoral-sentado'],
    tecnica: 'Rodillas casi rectas y espalda firme. Lleva la cadera atrás bajando las mancuernas por el muslo hasta sentir el estiramiento detrás.',
    svg: svgPesoMuertoRumano,
  },
  'puente-gluteo': {
    nombre: 'Puente de glúteo',
    musculo: 'Glúteo mayor',
    tipo: 'pierna',
    grupos: ['gluteo'],
    patron: 'extension-cadera',
    equipo: ['ninguno'],
    equivalentes: ['patada-gluteo'],
    tecnica: 'Boca arriba, pies apoyados cerca del glúteo. Sube la cadera hasta alinear rodilla, cadera y hombro, y aprieta arriba un segundo.',
    svg: svgPuenteGluteo,
  },
  'abduccion-de-pie': {
    nombre: 'Abducción de pie',
    musculo: 'Glúteo medio',
    tipo: 'pierna',
    grupos: ['abductores', 'gluteo'],
    patron: 'abduccion',
    equipo: ['ninguno'],
    equivalentes: ['abductor'],
    tecnica: 'De pie y apoyado en algo firme. Levanta la pierna hacia el lado sin inclinar el torso, y baja resistiendo el último tramo.',
    svg: svgAbduccionDePie,
  },

  // ---------- ABDOMEN, PANTORRILLA, TRAPECIO Y VARIANTES ----------
  'encogimiento': {
    nombre: 'Encogimiento abdominal',
    musculo: 'Abdomen',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'flexion-tronco',
    equipo: ['ninguno'],
    equivalentes: ['elevacion-piernas', 'encogimiento-en-polea', 'abdominal-completo', 'plancha'],
    tecnica: 'Boca arriba con las rodillas dobladas. Despega sólo los omóplatos llevando las costillas hacia la cadera, sin tirar del cuello.',
    svg: svgEncogimiento,
  },
  'abdominal-completo': {
    nombre: 'Abdominal completo',
    musculo: 'Abdomen',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'flexion-tronco',
    equipo: ['ninguno'],
    equivalentes: ['elevacion-piernas', 'encogimiento-en-polea', 'encogimiento'],
    tecnica: 'Sube hasta sentarte con la espalda redondeada, no recta. Baja vértebra a vértebra en vez de dejarte caer.',
    svg: svgAbdominalCompleto,
  },
  'elevacion-piernas': {
    nombre: 'Elevación de piernas colgado',
    musculo: 'Abdomen bajo',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'elevacion-piernas',
    equipo: ['barra-fija'],
    equivalentes: ['abdominal-completo', 'bicicleta', 'encogimiento'],
    tecnica: 'Colgado de la barra, sin balanceo. Sube las piernas llevando la cadera hacia arriba, no sólo los pies, y baja despacio.',
    svg: svgElevacionPiernas,
  },
  'encogimiento-en-polea': {
    nombre: 'Encogimiento en polea',
    musculo: 'Abdomen',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'flexion-tronco',
    equipo: ['polea'],
    equivalentes: ['abdominal-completo', 'encogimiento'],
    tecnica: 'De rodillas frente a la polea alta, cuerda a los lados de la cabeza. Flexiona el tronco con la cadera quieta; el trabajo no es de brazos.',
    svg: svgEncogimientoPolea,
  },
  'plancha': {
    nombre: 'Plancha',
    musculo: 'Abdomen y core',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'anti-extension',
    equipo: ['ninguno'],
    equivalentes: ['bicicleta', 'encogimiento'],
    tecnica: 'Antebrazos y puntas de los pies, cuerpo en línea recta. Aprieta glúteo y abdomen para que la cadera no se hunda. Se mide en segundos, no en repeticiones.',
    svg: svgPlancha,
  },
  'giro-ruso': {
    nombre: 'Giro ruso',
    musculo: 'Oblicuos',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'rotacion-tronco',
    equipo: ['mancuernas'],
    equivalentes: ['bicicleta'],
    tecnica: 'Sentado con el torso inclinado atrás y los pies levantados. Gira llevando el peso de un lado a otro con el movimiento saliendo del tronco.',
    svg: svgGiroRuso,
  },
  'bicicleta': {
    nombre: 'Bicicleta',
    musculo: 'Abdomen y oblicuos',
    tipo: 'core',
    grupos: ['abdomen'],
    patron: 'rotacion-tronco',
    equipo: ['ninguno'],
    equivalentes: ['giro-ruso', 'elevacion-piernas', 'plancha'],
    tecnica: 'Boca arriba, lleva el codo hacia la rodilla contraria alternando. Despacio: el chiste es la rotación, no la velocidad.',
    svg: svgBicicleta,
  },
  'talones-mancuerna': {
    nombre: 'Elevación de talones con mancuerna',
    musculo: 'Pantorrilla',
    tipo: 'pierna',
    grupos: ['pantorrilla'],
    patron: 'flexion-plantar',
    equipo: ['mancuernas'],
    equivalentes: ['talones-de-pie', 'talones-sentado', 'prensa-talones'],
    tecnica: 'De pie con una mancuerna en la mano, punta del pie en un escalón. Sube lo más alto que puedas y baja hasta estirar. También sirve sin peso.',
    svg: svgTalonesMancuerna,
  },
  'talones-de-pie': {
    nombre: 'Elevación de talones de pie',
    musculo: 'Pantorrilla',
    tipo: 'pierna',
    grupos: ['pantorrilla'],
    patron: 'flexion-plantar',
    equipo: ['maquina'],
    equivalentes: ['talones-mancuerna', 'talones-sentado', 'prensa-talones'],
    tecnica: 'Punta del pie en el escalón y talón libre. Sube lo más alto que puedas y baja hasta estirar del todo la pantorrilla.',
    svg: svgTalonesDePie,
  },
  'talones-sentado': {
    nombre: 'Elevación de talones sentado',
    musculo: 'Sóleo',
    tipo: 'pierna',
    grupos: ['pantorrilla'],
    patron: 'flexion-plantar',
    equipo: ['maquina'],
    equivalentes: ['talones-mancuerna', 'talones-de-pie', 'prensa-talones'],
    tecnica: 'Sentado con el cojín sobre la rodilla. Al tener la rodilla doblada trabaja más el sóleo, la parte profunda de la pantorrilla.',
    svg: svgTalonesSentado,
  },
  'prensa-talones': {
    nombre: 'Prensa de talones',
    musculo: 'Pantorrilla',
    tipo: 'pierna',
    grupos: ['pantorrilla'],
    patron: 'flexion-plantar',
    equipo: ['maquina'],
    equivalentes: ['talones-mancuerna', 'talones-de-pie', 'talones-sentado'],
    tecnica: 'En la prensa, apoya sólo la punta del pie en el borde de la plataforma. Empuja con el pie sin doblar la rodilla.',
    svg: svgPrensaTalones,
  },
  'encogimiento-hombros-barra': {
    nombre: 'Encogimiento de hombros con barra',
    musculo: 'Trapecio',
    tipo: 'tronco-superior',
    grupos: ['trapecio'],
    patron: 'encogimiento',
    equipo: ['barra'],
    equivalentes: ['encogimiento-hombros-mancuerna', 'remo-vertical-barra', 'encogimiento-hombros-polea'],
    tecnica: 'Barra colgando con los brazos rectos. Sube los hombros hacia las orejas sin girarlos, y aguanta arriba un segundo.',
    svg: svgEncogimientoBarra,
  },
  'encogimiento-hombros-mancuerna': {
    nombre: 'Encogimiento de hombros con mancuerna',
    musculo: 'Trapecio',
    tipo: 'tronco-superior',
    grupos: ['trapecio'],
    patron: 'encogimiento',
    equipo: ['mancuernas'],
    equivalentes: ['encogimiento-hombros-barra', 'encogimiento-hombros-polea'],
    tecnica: 'Una mancuerna a cada lado, brazos rectos. Sube los hombros en vertical; los codos no se doblan en ningún momento.',
    svg: svgEncogimientoMancuerna,
  },
  'encogimiento-hombros-polea': {
    nombre: 'Encogimiento de hombros en polea',
    musculo: 'Trapecio',
    tipo: 'tronco-superior',
    grupos: ['trapecio'],
    patron: 'encogimiento',
    equipo: ['polea'],
    equivalentes: ['encogimiento-hombros-barra', 'encogimiento-hombros-mancuerna'],
    tecnica: 'Polea baja, brazos rectos al costado. La tensión constante del cable mantiene el trapecio cargado en todo el recorrido.',
    svg: svgEncogimientoPoleaTrapecio,
  },
  'banco-inclinado-barra': {
    nombre: 'Banco inclinado con barra',
    musculo: 'Pecho superior',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'empuje-horizontal',
    equipo: ['barra', 'banco'],
    equivalentes: ['banco-declinado-mancuernas', 'banco-horizontal-mancuernas', 'banco-inclinado-mancuernas', 'banco-barra', 'fondos-abiertos', 'flexiones', 'press-pecho-maquina'],
    tecnica: 'Banco a 30–45° y agarre algo más ancho que los hombros. Baja la barra a la clavícula y empuja sin rebotar en el pecho.',
    svg: svgBancoInclinadoBarra,
  },
  'banco-declinado-mancuernas': {
    nombre: 'Banco declinado con mancuernas',
    musculo: 'Pecho inferior',
    tipo: 'tronco-superior',
    grupos: ['pecho'],
    patron: 'empuje-horizontal',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['banco-horizontal-mancuernas', 'banco-inclinado-barra', 'banco-inclinado-mancuernas', 'banco-barra', 'fondos-abiertos', 'flexiones', 'press-pecho-maquina'],
    tecnica: 'Banco inclinado hacia abajo y piernas bien sujetas. Baja al pecho bajo y empuja; es el ángulo que más carga la parte inferior.',
    svg: svgBancoDeclinadoMancuernas,
  },
  'remo-t': {
    nombre: 'Remo en T',
    musculo: 'Espalda media',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-horizontal',
    equipo: ['barra'],
    equivalentes: ['remo-barra', 'remo-mancuerna', 'remo-maquina', 'remo-sentado'],
    tecnica: 'Barra anclada por un extremo, torso inclinado y espalda recta. Jala al abdomen juntando las escápulas al final.',
    svg: svgRemoT,
  },
  'remo-maquina': {
    nombre: 'Remo en máquina',
    musculo: 'Espalda media',
    tipo: 'tronco-superior',
    grupos: ['espalda'],
    patron: 'jalon-horizontal',
    equipo: ['maquina'],
    equivalentes: ['remo-barra', 'remo-t', 'remo-mancuerna', 'remo-sentado'],
    tecnica: 'Pecho apoyado en el cojín para que la espalda baja no trabaje. Jala llevando los codos atrás y junta los omóplatos.',
    svg: svgRemoMaquina,
  },
  'remo-vertical-barra': {
    nombre: 'Remo vertical con barra',
    musculo: 'Hombro y trapecio',
    tipo: 'hombro',
    grupos: ['hombro', 'trapecio'],
    patron: 'remo-vertical',
    equipo: ['barra'],
    equivalentes: ['encogimiento-hombros-barra', 'laterales-mancuerna'],
    tecnica: 'Agarre a la anchura de los hombros. Sube la barra guiando con los codos hasta el pecho, sin pasar de la altura de la clavícula.',
    svg: svgRemoVerticalBarra,
  },
  'press-neutro-mancuerna': {
    nombre: 'Press de hombro neutro',
    musculo: 'Hombro completo',
    tipo: 'hombro',
    grupos: ['hombro'],
    patron: 'empuje-vertical',
    equipo: ['mancuernas'],
    equivalentes: ['press-militar', 'press-arnold', 'press-hombro-maquina'],
    tecnica: 'De pie, palmas enfrentadas. El agarre neutro es más amable con el hombro que el press clásico; empuja sin arquear la espalda.',
    svg: svgPressNeutroMancuerna,
  },
  'curl-barra-z': {
    nombre: 'Curl con barra Z',
    musculo: 'Bíceps',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['barra-z'],
    equivalentes: ['barra-de-pie', 'curl-mancuerna', 'martillos-mancuerna', 'curl-inclinado', 'concentrado-polea', 'curl-maquina', 'predicador'],
    tecnica: 'La barra ondulada deja la muñeca en un ángulo más cómodo. Codos pegados al costado y sin balancear el torso.',
    svg: svgCurlBarraZ,
  },
  'curl-mancuerna': {
    nombre: 'Curl con mancuerna',
    musculo: 'Bíceps',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['mancuernas'],
    equivalentes: ['barra-de-pie', 'curl-barra-z', 'martillos-mancuerna', 'curl-inclinado', 'concentrado-polea', 'curl-maquina', 'predicador'],
    tecnica: 'Palmas al frente y codos fijos al costado. Puedes alternar brazos para controlar mejor cada repetición.',
    svg: svgCurlMancuerna,
  },
  'curl-inclinado': {
    nombre: 'Curl inclinado',
    musculo: 'Bíceps (cabeza larga)',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['mancuernas', 'banco'],
    equivalentes: ['barra-de-pie', 'curl-barra-z', 'curl-mancuerna', 'martillos-mancuerna', 'concentrado-polea', 'curl-maquina', 'predicador'],
    tecnica: 'Sentado en banco inclinado con los brazos colgando atrás. Ese estiramiento extra es lo que distingue este curl de los demás.',
    svg: svgCurlInclinado,
  },
  'curl-maquina': {
    nombre: 'Curl en máquina',
    musculo: 'Bíceps',
    tipo: 'brazo',
    grupos: ['biceps'],
    patron: 'flexion-codo',
    equipo: ['maquina'],
    equivalentes: ['barra-de-pie', 'curl-barra-z', 'curl-mancuerna', 'martillos-mancuerna', 'curl-inclinado', 'concentrado-polea', 'predicador'],
    tecnica: 'Brazos apoyados en el cojín inclinado. La máquina fija el codo por ti, así que no hay forma de hacer trampa con el impulso.',
    svg: svgCurlMaquina,
  },
  'extension-tras-nuca-barra': {
    nombre: 'Extensión tras nuca con barra',
    musculo: 'Tríceps (cabeza larga)',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['barra'],
    equivalentes: ['fondos-banco', 'patada-de-mula', 'press-cerrado', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    tecnica: 'Barra por detrás de la cabeza y codos apuntando al techo. Estira sin mover el brazo de sitio; sólo gira el codo.',
    svg: svgExtensionTrasNucaBarra,
  },
  'press-cerrado': {
    nombre: 'Press cerrado',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['barra', 'banco'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    tecnica: 'Agarre a la anchura de los hombros y codos pegados al cuerpo. Baja al esternón y empuja; es press de banca enfocado al tríceps.',
    svg: svgPressCerrado,
  },
  'extension-cuerda-tras-nuca': {
    nombre: 'Extensión de tríceps tras nuca en polea',
    musculo: 'Tríceps (cabeza larga)',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['polea'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-cerrado', 'press-frances', 'cuerda', 'jalon-una-mano-supino', 'extension-triceps-maquina', 'fondos-maquina'],
    tecnica: 'De espaldas a la polea, cuerda por detrás de la cabeza. Estira al frente con los codos altos y quietos.',
    svg: svgExtensionCuerdaTrasNuca,
  },
  'extension-triceps-maquina': {
    nombre: 'Extensión de tríceps en máquina',
    musculo: 'Tríceps',
    tipo: 'brazo',
    grupos: ['triceps'],
    patron: 'extension-codo',
    equipo: ['maquina'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-cerrado', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'fondos-maquina'],
    tecnica: 'Sentado con los brazos apoyados. Empuja abajo estirando el codo por completo y vuelve resistiendo la subida.',
    svg: svgExtensionTricepsMaquina,
  },
  'fondos-maquina': {
    nombre: 'Fondos en máquina',
    musculo: 'Tríceps y pecho',
    tipo: 'brazo',
    grupos: ['triceps', 'pecho'],
    patron: 'extension-codo',
    equipo: ['maquina'],
    equivalentes: ['extension-tras-nuca-barra', 'fondos-banco', 'patada-de-mula', 'press-cerrado', 'press-frances', 'cuerda', 'extension-cuerda-tras-nuca', 'jalon-una-mano-supino', 'extension-triceps-maquina'],
    tecnica: 'La máquina asistida te deja hacer fondos con parte de tu peso descargado. Codos cerca del cuerpo para cargar el tríceps.',
    svg: svgFondosMaquina,
  },
  'sentadilla-frontal': {
    nombre: 'Sentadilla frontal',
    musculo: 'Cuádriceps',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'sentadilla',
    equipo: ['barra'],
    equivalentes: ['sentadilla', 'sentadilla-goblet', 'prensa'],
    tecnica: 'Barra apoyada al frente sobre los deltoides, codos altos. Obliga a bajar con el torso muy erguido y carga más el cuádriceps.',
    svg: svgSentadillaFrontal,
  },
  'desplante-barra': {
    nombre: 'Desplante con barra',
    musculo: 'Cuádriceps y glúteo',
    tipo: 'pierna',
    grupos: ['cuadriceps', 'gluteo'],
    patron: 'zancada',
    equipo: ['barra'],
    equivalentes: ['desplante-caminando', 'sentadilla-china', 'desplante-smith', 'subida-al-cajon'],
    tecnica: 'Barra en los trapecios. Da un paso al frente y baja en vertical hasta que la rodilla trasera casi toque el piso.',
    svg: svgDesplanteBarra,
  },

  'buenos-dias': {
    nombre: 'Buenos días',
    musculo: 'Isquiotibiales y lumbar',
    tipo: 'pierna',
    grupos: ['femoral', 'gluteo'],
    patron: 'bisagra',
    equipo: ['barra'],
    equivalentes: ['peso-muerto', 'peso-muerto-rumano', 'jalon-entre-piernas'],
    tecnica: 'Barra en la espalda y rodillas casi rectas. Inclina el torso llevando la cadera atrás, con la espalda recta todo el rato. Empieza ligero.',
    svg: svgBuenosDias,
  },
  'jalon-entre-piernas': {
    nombre: 'Jalón entre piernas en polea',
    musculo: 'Glúteo e isquiotibiales',
    tipo: 'pierna',
    grupos: ['gluteo', 'femoral'],
    patron: 'bisagra',
    equipo: ['polea'],
    equivalentes: ['buenos-dias', 'peso-muerto', 'peso-muerto-rumano'],
    tecnica: 'De espaldas a la polea baja, cuerda entre las piernas. Lleva la cadera atrás y vuelve empujándola al frente apretando el glúteo.',
    svg: svgJalonEntrePiernas,
  },
  'subida-al-cajon': {
    nombre: 'Subida al cajón',
    musculo: 'Glúteo y cuádriceps',
    tipo: 'pierna',
    grupos: ['gluteo', 'cuadriceps'],
    patron: 'zancada',
    equipo: ['cajon', 'mancuernas'],
    equivalentes: ['desplante-caminando', 'desplante-barra', 'sentadilla-china', 'desplante-smith'],
    unilateral: true,
    tecnica: 'Sube empujando con el talón de la pierna que está arriba, sin impulsarte con la de abajo. Baja controlando en vez de dejarte caer.',
    svg: svgSubidaAlCajon,
  },
  'aduccion-banda': {
    nombre: 'Aducción con banda',
    musculo: 'Aductores',
    tipo: 'pierna',
    grupos: ['aductores'],
    patron: 'aduccion',
    equipo: ['banda'],
    equivalentes: ['aductor'],
    unilateral: true,
    tecnica: 'Banda atada a un punto fijo y al tobillo. Lleva la pierna hacia dentro cruzando ligeramente, con el torso quieto.',
    svg: svgAduccionBanda,
  },
};

// ------------------------------------------------------------
//  Catalogo de rutinas
//
//  Cada rutina es una entrada aqui. Para agregar una nueva se define
//  con su id, su fecha de creacion y sus dias; los ejercicios se toman
//  de EJERCICIOS y los que falten se dibujan arriba.
//  `porDefecto` significa que aparece sola en el catalogo de cualquiera.
// ------------------------------------------------------------

const DIAS_ENTRENADOR = [
  {
    dia: 1, nombre: 'Pecho', tono: '#ff6b35', listo: true,
    bloques: [
      ['banco-inclinado-mancuernas', 'pull-over'],
      ['banco-horizontal-mancuernas', 'cross-over'],
      ['cristos', 'fondos-abiertos'],
    ],
  },
  {
    dia: 2, nombre: 'Cuádriceps', tono: '#4d96ff', listo: true,
    bloques: [
      ['sentadilla', 'extensiones'],
      ['prensa', 'aductor'],
      ['extension-unilateral', 'desplante-smith'],
    ],
  },
  {
    dia: 3, nombre: 'Brazo', tono: '#b06bff', listo: true,
    bloques: [
      ['barra-de-pie', 'martillos-mancuerna'],
      ['predicador', 'concentrado-polea'],
      ['press-frances', 'jalon-una-mano-supino'],
      ['cuerda', 'patada-de-mula'],
    ],
  },
  {
    dia: 4, nombre: 'Espalda y hombro', tono: '#3ddc84', listo: true,
    bloques: [
      ['jalon-frontal-abierto', 'posterior-mancuerna'],
      ['jalon-frontal-cerrado', 'laterales-cable'],
      ['remo-sentado', 'press-arnold'],
      ['remo-mancuerna', 'frontal-disco'],
    ],
  },
  {
    dia: 5, nombre: 'Femoral y glúteo', tono: '#ffd166', listo: true,
    bloques: [
      ['femoral-acostado', 'peso-muerto'],
      ['femoral-de-pie', 'abductor'],
      ['desplante-caminando', 'patada-gluteo'],
      ['femoral-sentado', 'sentadilla-china'],
    ],
  },
];

export const RUTINAS = [
  {
    id: 'entrenador-2026-08',
    nombre: 'Rutina del entrenador',
    resumen: '5 días · superseries · 4 series de 15/12/10/8',
    creada: '2026-08-31',
    porDefecto: true,
    dias: DIAS_ENTRENADOR,
  },
];

export const rutinaPorId = (id) => RUTINAS.find((r) => r.id === id) || null;

export const urlVideo = (nombre) =>
  'https://www.youtube.com/results?search_query=' +
  encodeURIComponent('como hacer ' + nombre + ' gimnasio tecnica');
