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

export const EJERCICIOS = {
  'banco-inclinado-mancuernas': {
    nombre: 'Banco inclinado con mancuernas',
    musculo: 'Pecho superior',
    tecnica: 'Banco a 30–45°. Baja las mancuernas al nivel del pecho alto con los codos a unos 45° del torso, y empuja sin trabar los codos arriba.',
    svg: svgBancoInclinado,
  },
  'pull-over': {
    nombre: 'Pull over',
    musculo: 'Pecho y dorsal',
    tecnica: 'Una mancuerna sujeta con las dos manos. Baja en arco por detrás de la cabeza con los codos ligeramente flexionados, y sube abriendo la caja torácica.',
    svg: svgPullOver,
  },
  'banco-horizontal-mancuernas': {
    nombre: 'Banco horizontal con mancuernas',
    musculo: 'Pecho medio',
    tecnica: 'Escápulas retraídas contra el banco y pies firmes. Baja controlado hasta sentir el estiramiento en el pecho y empuja juntando ligeramente arriba.',
    svg: svgBancoHorizontal,
  },
  'cross-over': {
    nombre: 'Cross over',
    musculo: 'Pecho interno',
    tecnica: 'Poleas altas, un pie adelante y el torso levemente inclinado. Junta las manos al frente cruzando un poco, y aprieta el pecho un segundo.',
    svg: svgCrossOver,
  },
  'cristos': {
    nombre: 'Cristos',
    musculo: 'Pecho externo',
    tecnica: 'Aperturas en banco con los codos algo flexionados y fijos. Abre hasta la altura del pecho sin bajar de más, y cierra en arco amplio.',
    svg: svgCristos,
  },
  'fondos-abiertos': {
    nombre: 'Fondos abiertos',
    musculo: 'Pecho inferior',
    tecnica: 'Barras anchas, torso inclinado al frente y codos abiertos hacia afuera. Baja hasta que el hombro quede a la altura del codo.',
    svg: svgFondos,
  },

  // ---------- DÍA 2 · CUÁDRICEPS ----------
  'sentadilla': {
    nombre: 'Sentadilla',
    musculo: 'Cuádriceps y glúteo',
    tecnica: 'Barra apoyada en los trapecios, pies al ancho de los hombros. Baja como si te sentaras, con la espalda recta y las rodillas siguiendo la línea de los pies.',
    svg: svgSentadilla,
  },
  'extensiones': {
    nombre: 'Extensiones',
    musculo: 'Cuádriceps',
    tecnica: 'Espalda pegada al respaldo y rodillo sobre el empeine. Estira hasta casi bloquear la rodilla, aprieta arriba un segundo y baja sin soltar la tensión.',
    svg: svgExtensiones,
  },
  'prensa': {
    nombre: 'Prensa',
    musculo: 'Cuádriceps y glúteo',
    tecnica: 'Pies a media plataforma al ancho de las caderas. Baja hasta unos 90° sin que la cadera se despegue del asiento, y empuja sin bloquear las rodillas.',
    svg: svgPrensa,
  },
  'aductor': {
    nombre: 'Aductor',
    musculo: 'Aductores',
    tecnica: 'Sentado con las piernas abiertas contra los rodillos. Cierra apretando la cara interna del muslo y regresa despacio, sin dejar que el peso te gane.',
    svg: svgAductor,
  },
  'extension-unilateral': {
    nombre: 'Extensión unilateral',
    musculo: 'Cuádriceps',
    tecnica: 'Una pierna a la vez para corregir descompensaciones. Sube controlado, aprieta arriba y baja más lento de lo que subiste.',
    svg: svgExtensionUnilateral,
  },
  'desplante-smith': {
    nombre: 'Desplante en Smith',
    musculo: 'Cuádriceps y glúteo',
    tecnica: 'Un pie adelante y otro atrás bajo la barra guiada. Baja en vertical hasta que la rodilla trasera casi toque el piso, con el torso erguido.',
    svg: svgDesplanteSmith,
  },

  // ---------- DÍA 3 · BRAZO ----------
  'barra-de-pie': {
    nombre: 'Barra de pie',
    musculo: 'Bíceps',
    tecnica: 'De pie, codos pegados al costado y agarre supino al ancho de los hombros. Sube sin balancear el torso y baja controlando todo el recorrido.',
    svg: svgBarraDePie,
  },
  'martillos-mancuerna': {
    nombre: 'Martillos con mancuerna',
    musculo: 'Bíceps y braquial',
    tecnica: 'Agarre neutro, como si sostuvieras un martillo. Los codos no se mueven del costado; sube alternando o a la vez, sin girar la muñeca.',
    svg: svgMartillos,
  },
  'predicador': {
    nombre: 'Predicador',
    musculo: 'Bíceps',
    tecnica: 'Axilas apoyadas en el cojín inclinado para que el codo no se despegue. Baja hasta casi estirar del todo y sube sin despegar los brazos del apoyo.',
    svg: svgPredicador,
  },
  'concentrado-polea': {
    nombre: 'Concentrado en polea',
    musculo: 'Bíceps',
    tecnica: 'Sentado, codo apoyado en la cara interna del muslo y polea baja al frente. Sube apretando el bíceps arriba y baja lento hasta estirar.',
    svg: svgConcentrado,
  },
  'press-frances': {
    nombre: 'Press francés',
    musculo: 'Tríceps',
    tecnica: 'Acostado, brazos verticales. Flexiona sólo el codo llevando la barra hacia la frente, con el brazo quieto, y estira sin bloquear de golpe.',
    svg: svgPressFrances,
  },
  'jalon-una-mano-supino': {
    nombre: 'Jalón a una mano supino',
    musculo: 'Tríceps',
    tecnica: 'Polea alta con agarre supino, una mano. Codo pegado al costado y fijo: sólo se mueve el antebrazo. Estira abajo y aprieta un segundo.',
    svg: svgJalonSupino,
  },
  'cuerda': {
    nombre: 'Cuerda',
    musculo: 'Tríceps',
    tecnica: 'Polea alta con cuerda, codos al costado. Empuja hacia abajo y separa las manos al final del recorrido para cerrar más el tríceps.',
    svg: svgCuerda,
  },
  'patada-de-mula': {
    nombre: 'Patada de mula',
    musculo: 'Tríceps',
    tecnica: 'Torso inclinado al frente y brazo pegado al costado. Estira el codo llevando la mancuerna hacia atrás y aprieta arriba antes de volver.',
    svg: svgPatadaMula,
  },

  // ---------- DÍA 4 · ESPALDA Y HOMBRO ----------
  'jalon-frontal-abierto': {
    nombre: 'Jalón frontal abierto',
    musculo: 'Dorsal ancho',
    tecnica: 'Agarre más ancho que los hombros. Jala la barra al pecho llevando los codos hacia abajo y atrás, con el pecho arriba y sin balancearte.',
    svg: svgJalonAbierto,
  },
  'posterior-mancuerna': {
    nombre: 'Posterior con mancuerna',
    musculo: 'Deltoide posterior',
    tecnica: 'Torso inclinado al frente y rodillas algo flexionadas. Abre los brazos hacia los lados con los codos casi rectos, sin encoger los hombros.',
    svg: svgPosterior,
  },
  'jalon-frontal-cerrado': {
    nombre: 'Jalón frontal cerrado',
    musculo: 'Dorsal y espalda media',
    tecnica: 'Agarre estrecho o en triángulo. Jala al pecho pegando los codos al cuerpo y junta las escápulas al final del recorrido.',
    svg: svgJalonCerrado,
  },
  'laterales-cable': {
    nombre: 'Laterales con cable',
    musculo: 'Deltoide lateral',
    tecnica: 'Polea baja cruzada por delante del cuerpo. Sube el brazo hasta la altura del hombro, sin encogerlo, y baja resistiendo la vuelta.',
    svg: svgLateralesCable,
  },
  'remo-sentado': {
    nombre: 'Remo sentado',
    musculo: 'Espalda media',
    tecnica: 'Espalda recta y rodillas ligeramente flexionadas. Jala al abdomen juntando las escápulas, sin echar el torso hacia atrás para ayudarte.',
    svg: svgRemoSentado,
  },
  'press-arnold': {
    nombre: 'Press Arnold',
    musculo: 'Hombro completo',
    tecnica: 'Empieza con las palmas hacia ti a la altura del pecho. Gira las muñecas hacia afuera mientras empujas arriba, y deshaz el giro al bajar.',
    svg: svgPressArnold,
  },
  'remo-mancuerna': {
    nombre: 'Remo con mancuerna',
    musculo: 'Dorsal',
    tecnica: 'Rodilla y mano apoyadas en el banco, espalda paralela al piso. Jala la mancuerna hacia la cadera, con el codo pegado, sin girar el torso.',
    svg: svgRemoMancuerna,
  },
  'frontal-disco': {
    nombre: 'Levantamiento frontal con disco',
    musculo: 'Deltoide anterior',
    tecnica: 'Disco sujeto con ambas manos frente a los muslos. Sube hasta la altura de los ojos con los brazos casi rectos, sin impulso de cadera.',
    svg: svgFrontalDisco,
  },

  // ---------- DÍA 5 · FEMORAL Y GLÚTEO ----------
  'femoral-acostado': {
    nombre: 'Femoral acostado',
    musculo: 'Isquiotibiales',
    tecnica: 'Boca abajo, rodillo justo sobre el tendón de Aquiles. Flexiona llevando los talones al glúteo sin despegar la cadera del cojín.',
    svg: svgFemoralAcostado,
  },
  'peso-muerto': {
    nombre: 'Peso muerto',
    musculo: 'Femoral y glúteo',
    tecnica: 'Barra pegada a las piernas y espalda recta. Lleva la cadera hacia atrás bajando la barra por el muslo, y sube empujando el piso con los pies.',
    svg: svgPesoMuerto,
  },
  'femoral-de-pie': {
    nombre: 'Femoral de pie',
    musculo: 'Isquiotibiales',
    tecnica: 'Una pierna a la vez, torso apoyado y estable. Flexiona la rodilla llevando el talón atrás y arriba, sin mover la cadera.',
    svg: svgFemoralDePie,
  },
  'abductor': {
    nombre: 'Abductor',
    musculo: 'Glúteo medio',
    tecnica: 'Sentado con las piernas juntas contra los rodillos. Abre empujando con la cara externa del muslo y cierra despacio, sin rebotar.',
    svg: svgAbductor,
  },
  'desplante-caminando': {
    nombre: 'Desplante caminando',
    musculo: 'Glúteo y cuádriceps',
    tecnica: 'Mancuernas a los costados. Da un paso largo y baja hasta que la rodilla trasera casi toque el piso; impúlsate con el talón de adelante.',
    svg: svgDesplanteCaminando,
  },
  'patada-gluteo': {
    nombre: 'Patada en máquina para glúteo',
    musculo: 'Glúteo mayor',
    tecnica: 'Torso apoyado y abdomen firme. Empuja el pie hacia atrás estirando la cadera y aprieta el glúteo arriba, sin arquear la espalda baja.',
    svg: svgPatadaGluteo,
  },
  'femoral-sentado': {
    nombre: 'Femoral sentado',
    musculo: 'Isquiotibiales',
    tecnica: 'Espalda pegada al respaldo y muslo bien sujeto por el cojín. Flexiona llevando los talones bajo el asiento y vuelve resistiendo.',
    svg: svgFemoralSentado,
  },
  'sentadilla-china': {
    nombre: 'Sentadilla china',
    musculo: 'Glúteo y cuádriceps',
    tecnica: 'Pie trasero elevado en el banco y el delantero bien adelantado. Baja en vertical con el torso erguido y sube empujando con el talón.',
    svg: svgSentadillaChina,
  },
};

export const DIAS = [
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

export const urlVideo = (nombre) =>
  'https://www.youtube.com/results?search_query=' +
  encodeURIComponent('como hacer ' + nombre + ' gimnasio tecnica');
