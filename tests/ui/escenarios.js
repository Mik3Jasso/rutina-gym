// Escenarios de las pruebas de pantalla. Cada uno maneja la app como lo
// haría una persona (tocar, escribir) y revisa lo que se ve y lo que se
// mandó a la base. Si algo no cuadra, lanza un error con qué esperaba.

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

async function esperar(cond, que, ms = 3000) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    if (cond()) return;
    await pausa(40);
  }
  throw new Error(`no pasó: ${que}`);
}
const visible = (id) => !$(id)?.classList.contains('oculto');
function esperarVista(id) { return esperar(() => visible(id), `se viera ${id}`); }

function tocar(sel) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) throw new Error(`no existe ${sel}`);
  el.click();
}
function escribir(sel, valor, evento = 'input') {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) throw new Error(`no existe ${sel}`);
  el.value = valor;
  el.dispatchEvent(new Event(evento, { bubbles: true }));
}
function igual(real, esperado, que) {
  if (real !== esperado) throw new Error(`${que}: esperaba ${JSON.stringify(esperado)}, salió ${JSON.stringify(real)}`);
}
function cierto(cond, que) { if (!cond) throw new Error(que); }

const escrituras = (base, tabla, tipo) =>
  base.escrituras.filter((e) => e.tabla === tabla && (!tipo || e.tipo === tipo));
async function abrirMenu(opcion) {
  tocar('#btn-menu');
  await esperar(() => $(`#hoja-cuerpo [${opcion}]`), `el menú tuviera ${opcion}`);
  tocar(`#hoja-cuerpo [${opcion}]`);
}
const cerrarHoja = () => $('#hoja').classList.add('oculto');

// ------------------------------------------------------------
const alumno = [
  ['el catálogo muestra la rutina que le asignaron', async () => {
    await esperarVista('#vista-catalogo');
    await esperar(() => $$('#lista-rutinas .tarjeta-rutina').length === 1, 'hubiera 1 rutina en el catálogo');
    cierto($('#lista-rutinas').textContent.includes('Octubre'), 'la rutina se llama Octubre');
  }],

  ['las notas de la rutina se ven, como texto', async () => {
    tocar('#lista-rutinas .tarjeta-rutina');
    await esperarVista('#vista-inicio');
    await esperar(() => visible('#rutina-notas'), 'se vieran las notas de la rutina');
    cierto($('#rutina-notas').textContent.includes('Descansa 60 s'), 'dicen "Descansa 60 s"');
    cierto($('#rutina-notas').textContent.includes('<img'), 'el HTML aparece como texto');
    igual($$('#rutina-notas img').length, 0, 'imágenes dentro de las notas');
    cierto($('#rutina-notas h3').textContent.includes('Jerry'), 'dice que son de Jerry');
  }],

  ['la nota de cada ejercicio se ve en su tarjeta', async () => {
    tocar('#lista-dias .tarjeta-dia');
    await esperarVista('#vista-dia');
    await esperar(() => $('.ejercicio[data-ej="prensa"] .ej-nota'), 'la prensa tuviera nota');
    cierto($('.ejercicio[data-ej="prensa"] .ej-nota').textContent.includes('Baja lento'), 'la nota dice "Baja lento"');
    igual($$('.ej-nota img').length, 0, 'imágenes dentro de la nota');
    igual($('.ejercicio[data-ej="extensiones"] .ej-nota'), null, 'nota en un ejercicio que no tiene');
  }],

  ['la palomita guarda el peso y las repeticiones', async (base) => {
    const fila = 'tr[data-fila="prensa:2"]';
    escribir(`${fila} [data-campo="peso"]`, '85');
    escribir(`${fila} [data-campo="reps"]`, '12');
    tocar(`${fila} .check`);
    await esperar(() => $(`${fila} .check`).getAttribute('aria-pressed') === 'true', 'la palomita se pusiera verde');
    const guardada = escrituras(base, 'series_log', 'upsert').at(-1)?.arg;
    igual(guardada?.peso, 85, 'peso guardado');
    igual(guardada?.reps, 12, 'reps guardadas');
    igual(guardada?.hecho, true, 'marcada como hecha');
  }],

  ['un peso absurdo pregunta antes de guardar, y cancelar no guarda', async (base) => {
    const antes = escrituras(base, 'series_log').length;
    window.__respuestaConfirm = false;
    const fila = 'tr[data-fila="prensa:3"]';
    escribir(`${fila} [data-campo="peso"]`, '900');
    escribir(`${fila} [data-campo="reps"]`, '10');
    tocar(`${fila} .check`);
    await pausa(300);
    igual(escrituras(base, 'series_log').length, antes, 'series guardadas tras cancelar');
    igual($(`${fila} .check`).getAttribute('aria-pressed'), 'false', 'la palomita sigue sin marcar');
  }],

  ['el comentario del día se guarda solo', async (base) => {
    cierto($('#comentario-quien').textContent.includes('Jerry'), 'avisa que lo lee Jerry');
    escribir('#in-comentario', 'Me molestó el hombro en el press');
    await esperar(() => escrituras(base, 'sesiones', 'update').some((e) => e.arg.notas?.includes('hombro')),
      'se mandara el comentario a la base', 4000);
    await esperar(() => $('#comentario-estado').textContent === 'Guardado', 'dijera "Guardado"');
  }],

  ['borrar el comentario lo deja vacío en la base', async (base) => {
    escribir('#in-comentario', '   ', 'change');
    await esperar(() => escrituras(base, 'sesiones', 'update').at(-1)?.arg.notas === null, 'se guardara vacío');
  }],

  ['su progreso muestra sus ejercicios', async () => {
    tocar('#btn-volver');
    await esperarVista('#vista-inicio');
    tocar('#btn-progreso-inicio');
    await esperarVista('#vista-progreso');
    await esperar(() => $$('#progreso-cuerpo .fila-ej').length >= 1, 'hubiera ejercicios en su progreso');
    cierto($('#progreso-cuerpo .fila-ej').textContent.includes('Prensa'), 'aparece la prensa');
  }],

  ['la administración aparece sólo para el admin', async () => {
    tocar('#btn-volver-de-progreso');
    await esperarVista('#vista-inicio');
    tocar('#btn-catalogo');
    await esperarVista('#vista-catalogo');
    await abrirMenu('data-admin');
    await esperarVista('#vista-admin');
    await esperar(() => $$('#admin-personas [data-persona]').length === 3, 'se vieran 3 personas');
  }],

  ['el buscador de personas filtra sin importar acentos', async () => {
    escribir('#in-buscar-persona', 'JÉRRY');
    igual($$('#admin-personas [data-persona]').length, 1, 'personas al buscar "JÉRRY"');
    escribir('#in-buscar-persona', 'nadie-se-llama-asi');
    igual($$('#admin-personas [data-persona]').length, 0, 'personas con una búsqueda sin resultado');
    cierto($('#admin-personas').textContent.includes('Nadie coincide'), 'avisa que nadie coincide');
    escribir('#in-buscar-persona', '');
  }],
];

// ------------------------------------------------------------
const entrenador = [
  ['arriba de sus alumnos va quien lleva más sin entrenar', async () => {
    await esperarVista('#vista-catalogo');
    await esperar(() => $('[data-ver-alumnos]'), 'apareciera la tira de entrenador');
    tocar('[data-ver-alumnos]');
    await esperarVista('#vista-alumnos');
    await esperar(() => $$('#lista-alumnos [data-alumno]').length === 2, 'hubiera 2 alumnos');
    igual($('#lista-alumnos [data-alumno]').dataset.alumno, 'u-jessi', 'la primera de la lista');
    cierto($('#lista-alumnos [data-alumno="u-jessi"] .chip').classList.contains('grave'), 'Jessica en rojo: nunca entrenó');
  }],

  ['en la ficha del alumno se leen sus comentarios', async () => {
    tocar('#lista-alumnos [data-alumno="u-mike"]');
    await esperarVista('#vista-alumno');
    await esperar(() => $('#alumno-comentarios .comentario'), 'aparecieran sus comentarios');
    cierto($('#alumno-comentarios').textContent.includes('Me molestó el hombro'), 'se lee el comentario');
    igual($$('#alumno-comentarios img').length, 0, 'imágenes dentro del comentario');
  }],

  ['armar una rutina guarda sus notas y las de cada ejercicio', async (base) => {
    tocar('#btn-crear-para-alumno');
    await esperarVista('#vista-editor');
    cierto($('#editor-asignar [data-asignar="u-mike"]').checked, 'ya viene asignada a Mike');
    escribir('#in-nombre-rutina', 'Fuerza noviembre');
    escribir('#in-notas-rutina', 'Calienta 10 minutos');
    tocar('[data-agregar-ej="0"]');
    await esperar(() => $('[data-elegir="prensa"]'), 'el buscador mostrara la prensa');
    tocar('[data-elegir="prensa"]');
    await esperar(() => $('[data-nota-ej="0.0"]'), 'la prensa entrara al día');
    escribir('[data-nota-ej="0.0"]', '  Pies a la altura de la cadera  ');
    tocar('#btn-publicar-rutina');
    await esperarVista('#vista-alumno');

    const rutina = escrituras(base, 'rutinas', 'insert').at(-1)?.arg;
    igual(rutina?.nombre, 'Fuerza noviembre', 'nombre de la rutina');
    igual(rutina?.notas, 'Calienta 10 minutos', 'notas de la rutina');
    const ejercicios = escrituras(base, 'rutina_ejercicios', 'insert').at(-1)?.arg;
    igual(ejercicios?.[0]?.ejercicio_id, 'prensa', 'ejercicio guardado');
    igual(ejercicios?.[0]?.nota, 'Pies a la altura de la cadera', 'nota del ejercicio, sin espacios de sobra');
    const asignada = escrituras(base, 'rutinas_usuario', 'upsert').at(-1)?.arg;
    cierto(asignada?.some((a) => a.user_id === 'u-mike'), 'quedó asignada a Mike');
  }],

  ['una rutina no pasa de 7 días', async () => {
    tocar('#btn-crear-para-alumno');
    await esperarVista('#vista-editor');
    for (let i = 0; i < 10; i++) tocar('#btn-agregar-dia');
    igual($$('.dia-editor').length, 7, 'días en el editor');
    tocar('#btn-cancelar-editor');
    await esperarVista('#vista-alumno');
  }],

  ['un entrenador no ve la administración', async () => {
    tocar('#btn-menu');
    await esperar(() => visible('#hoja'), 'abriera el menú');
    igual($('#hoja-cuerpo [data-admin]'), null, 'botón de administración');
    cerrarHoja();
  }],
];

export const SUITES = {
  alumno: { yo: 'u-mike', escenarios: alumno },
  entrenador: { yo: 'u-jerry', escenarios: entrenador },
};
