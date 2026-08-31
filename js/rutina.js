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
const trazo = (d, w = 5) =>
  `<path d="${d}" fill="none" stroke="${C.cuerpo}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const flecha = (d) => `
  <path d="${d}" fill="none" stroke="${C.flecha}" stroke-width="2.2"
        stroke-linecap="round" stroke-dasharray="5 4" marker-end="url(#pf)"/>`;

const defs = `
  <defs>
    <marker id="pf" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="${C.flecha}"/>
    </marker>
  </defs>`;

const svg = (contenido) =>
  `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" role="img">${defs}${contenido}</svg>`;

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
};

export const DIAS = [
  {
    dia: 1,
    nombre: 'Pecho',
    tono: '#ff6b35',
    listo: true,
    bloques: [
      ['banco-inclinado-mancuernas', 'pull-over'],
      ['banco-horizontal-mancuernas', 'cross-over'],
      ['cristos', 'fondos-abiertos'],
    ],
  },
  {
    dia: 2, nombre: 'Cuádriceps', tono: '#4d96ff', listo: false,
    vista: 'Sentadilla · Prensa · Extensión unilateral',
  },
  {
    dia: 3, nombre: 'Brazo', tono: '#b06bff', listo: false,
    vista: 'Barra de pie · Predicador · Press francés · Cuerda',
  },
  {
    dia: 4, nombre: 'Espalda y hombro', tono: '#3ddc84', listo: false,
    vista: 'Jalón frontal · Remo sentado · Press Arnold',
  },
  {
    dia: 5, nombre: 'Femoral y glúteo', tono: '#ffd166', listo: false,
    vista: 'Femoral · Peso muerto · Desplante caminando',
  },
];

export const urlVideo = (nombre) =>
  'https://www.youtube.com/results?search_query=' +
  encodeURIComponent('como hacer ' + nombre + ' gimnasio tecnica');
