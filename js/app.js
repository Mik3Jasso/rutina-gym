import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { DIBUJOS, urlVideo } from './rutina.js?v=202609182254';

// ------------------------------------------------------------
//  Conexión. Esta llave es pública por diseño: lo que protege
//  los datos es Row Level Security en la base, no ocultar la llave.
// ------------------------------------------------------------
const SUPABASE_URL = 'https://xinxbdlribqrxqphozvh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GjQHWHyY5NU4Bn8Q7O2hjA_UnTkfLgO';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

const $ = (s) => document.querySelector(s);

// Registrar escuchas sin reventar si el elemento no está. Pasa cuando el
// navegador sirve un index.html cacheado viejo junto a un app.js nuevo:
// sin esto, un solo elemento ausente aborta el módulo y la app no carga.
const alPulsar = (sel, fn, evento = 'click') => {
  const el = document.querySelector(sel);
  if (el) el.addEventListener(evento, fn);
  else console.warn('Falta en el HTML:', sel);
};

// El día abierto queda en la URL y en la sesión del navegador: si el
// teléfono descarta la página al cambiar de app, volvemos donde estabas.
const CLAVE_UBICACION = 'rutina:dia';

function recordarUbicacion(rutinaId, numDia) {
  const marca = rutinaId ? (numDia ? `${rutinaId}/${numDia}` : rutinaId) : '';
  try {
    if (marca) sessionStorage.setItem(CLAVE_UBICACION, marca);
    else sessionStorage.removeItem(CLAVE_UBICACION);
  } catch {}
  try {
    history.replaceState(null, '', marca ? `#${marca}` : location.pathname);
  } catch {}
}

function ubicacionGuardada() {
  let marca = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!marca) {
    try { marca = sessionStorage.getItem(CLAVE_UBICACION) || ''; } catch {}
  }
  if (!marca) return null;
  const [rutinaId, dia] = marca.split('/');
  if (!rutinaId) return null;
  const n = Number(dia);
  return { rutinaId, dia: n >= 1 && n <= 5 ? n : null };
}
const CLAVE_BORRADOR = 'rutina:borrador';

const estado = {
  usuario: null,
  nombre: '',
  rutina: null,      // rutina abierta, ya con sus días cargados
  catalogo: [],      // rutinas del usuario, con cuál está activa
  ejercicios: {},    // catálogo completo, traído de la base
  perfil: null,      // mi perfil: si soy entrenador y con qué código
  entrenador: null,  // quién me entrena, si alguien lo hace
  alumnos: [],       // a quién entreno yo
  editor: null,      // rutina que se está armando
  rutinas: {},       // definición de cada rutina disponible
  dia: null,        // día abierto
  sesionId: null,
  registros: {},    // "slug:serie" -> {peso, reps, hecho} (lo que se ve)
  guardados: {},    // "slug:serie" -> lo que el servidor tiene confirmado
  anteriores: {},   // "slug:serie" -> {peso, reps, fecha}
  fecha: null,       // fecha del entrenamiento abierto (hoy por defecto)
  fechas: [],        // fechas con entrenamiento de este día
  cardio: false,
  finalizada: null,  // marca de tiempo de cierre, o null si sigue abierta
  inicioSesion: null,
  ultimasFechas: {},// dia -> fecha del último entrenamiento
};

// ============================================================
//  Utilidades
// ============================================================
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const fechaCorta = (iso) => {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[m - 1]}`;
};

const diasDesde = (iso) => {
  if (!iso) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const dif = Math.round((new Date(hoy()) - new Date(a, m - 1, d)) / 86400000);
  return dif;
};

const relativo = (iso) => {
  const n = diasDesde(iso);
  if (n === null) return 'Sin registro todavía';
  if (n <= 0) return 'Entrenado hoy';
  if (n === 1) return 'Ayer';
  if (n < 7) return `Hace ${n} días`;
  return `Hace ${Math.floor(n / 7)} sem`;
};

const fechaLarga = (iso) => {
  const [a, m, d] = iso.split('-').map(Number);
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d} de ${meses[m - 1]} de ${a}`;
};

const nDecimal = (v) => (v === null || v === undefined || v === '' ? '' : String(Number(v)));

let avisoTimer;
function avisar(texto, malo = false) {
  const el = $('#aviso');
  el.textContent = texto;
  el.classList.toggle('malo', malo);
  el.classList.remove('oculto');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => el.classList.add('oculto'), 2800);
}

function mostrarVista(id) {
  document.querySelectorAll('.vista').forEach((v) => v.classList.add('oculto'));
  $(id).classList.remove('oculto');
  window.scrollTo(0, 0);
}

// ============================================================
//  Cola de guardado sin conexión
// ============================================================
//  Lo que escribes queda en el telefono hasta que lo guardas con la
//  palomita. Asi nada se pierde si cierras la app a medias.
const leerTodo = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE_BORRADOR) || '{}'); }
  catch { return {}; }
};
const escribirTodo = (obj) => {
  try { localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(obj)); } catch {}
};

const claveDia = () => `${estado.rutina?.id}:${estado.dia?.dia}:${estado.fecha || hoy()}`;

function anotarBorrador(clave, datos) {
  const todo = leerTodo();
  (todo[claveDia()] ||= {})[clave] = datos;
  escribirTodo(todo);
}

function limpiarBorrador(clave) {
  const todo = leerTodo();
  const grupo = todo[claveDia()];
  if (!grupo) return;
  delete grupo[clave];
  if (!Object.keys(grupo).length) delete todo[claveDia()];
  escribirTodo(todo);
}

const cargarBorrador = () => leerTodo()[claveDia()] || {};

function limpiarBorradorCompleto() {
  const todo = leerTodo();
  delete todo[claveDia()];
  escribirTodo(todo);
}

// ------------------------------------------------------------
//  Aviso de fallo al guardar: no desaparece solo, y ofrece reintentar
// ------------------------------------------------------------
let reintento = null;

function mostrarFallo(accion, texto) {
  reintento = accion;
  $('#fallo-texto').textContent = texto || 'Revisa tu conexión. Lo que escribiste sigue aquí.';
  $('#fallo').classList.remove('oculto');
}

function ocultarFallo() {
  reintento = null;
  $('#fallo').classList.add('oculto');
}

// ============================================================
//  Autenticación
// ============================================================
let modoAuth = 'entrar';

document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('activo'));
    t.classList.add('activo');
    modoAuth = t.dataset.modo;
    $('.campo-nombre').classList.toggle('oculto', modoAuth !== 'registro');
    $('#btn-auth').textContent = modoAuth === 'registro' ? 'Crear cuenta' : 'Entrar';
    $('#in-clave').autocomplete = modoAuth === 'registro' ? 'new-password' : 'current-password';
    $('#auth-error').classList.add('oculto');
  });
});

$('#form-auth')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const correo = $('#in-correo').value.trim();
  const clave = $('#in-clave').value;
  const nombre = $('#in-nombre').value.trim();
  const err = $('#auth-error');
  const btn = $('#btn-auth');

  if (!correo || clave.length < 6) {
    err.textContent = 'Escribe tu correo y una contraseña de al menos 6 caracteres.';
    err.classList.remove('oculto');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Un momento…';
  err.classList.add('oculto');

  try {
    if (modoAuth === 'registro') {
      const { data, error } = await sb.auth.signUp({
        email: correo,
        password: clave,
        options: { data: { nombre: nombre || correo.split('@')[0] } },
      });
      if (error) throw error;
      // Las cuentas nacen confirmadas, asi que entramos de una vez.
      if (!data.session) {
        const { error: errorEntrada } = await sb.auth.signInWithPassword({ email: correo, password: clave });
        if (errorEntrada) throw errorEntrada;
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: correo, password: clave });
      if (error) throw error;
    }
  } catch (ex) {
    const m = (ex.message || '').toLowerCase();
    err.textContent =
      m.includes('invalid login') ? 'Correo o contraseña incorrectos.'
      : m.includes('not confirmed') ? 'Esa cuenta quedó a medias. Avísale a Mike para reactivarla.'
      : m.includes('already registered') || m.includes('already been registered') ? 'Ese correo ya tiene cuenta. Entra con tu contraseña.'
      : m.includes('rate') ? 'Demasiados intentos seguidos. Espera unos minutos e intenta otra vez.'
      : ex.message || 'No se pudo completar. Intenta de nuevo.';
    err.classList.remove('oculto');
  } finally {
    btn.disabled = false;
    btn.textContent = modoAuth === 'registro' ? 'Crear cuenta' : 'Entrar';
  }
});

alPulsar('#btn-menu', abrirMenu);

// ============================================================
//  Entrenador y alumnos
// ============================================================
async function cargarPerfil() {
  const { data } = await sb
    .from('profiles').select('nombre, es_entrenador, codigo')
    .eq('id', estado.usuario.id).maybeSingle();
  estado.perfil = data || { nombre: '', es_entrenador: false, codigo: null };
  estado.nombre = estado.perfil.nombre || estado.usuario.email.split('@')[0];

  // Quién me entrena y a quién entreno yo
  const { data: vinculos } = await sb.from('alumnos').select('entrenador_id, alumno_id');
  const mio = (vinculos || []).find((v) => v.alumno_id === estado.usuario.id);
  estado.alumnos = (vinculos || []).filter((v) => v.entrenador_id === estado.usuario.id);

  estado.perfilesAlumnos = {};
  if (estado.alumnos.length) {
    const { data: ps } = await sb.from('profiles').select('id, nombre')
      .in('id', estado.alumnos.map((a) => a.alumno_id));
    (ps || []).forEach((p) => { estado.perfilesAlumnos[p.id] = p; });
  }

  estado.entrenador = null;
  if (mio) {
    const { data: e } = await sb.from('profiles').select('id, nombre').eq('id', mio.entrenador_id).maybeSingle();
    if (e) estado.entrenador = e;
  }
}

// Cuánta gente tiene una rutina que yo armé
function repartoTexto(rutinaId) {
  const n = estado.repartoRutinas?.[rutinaId] || 0;
  return n === 0 ? 'sin asignar' : n === 1 ? 'la tiene 1 persona' : `la tienen ${n} personas`;
}

function pintarTiraEntrenador() {
  const tira = $('#aviso-entrenador');
  if (estado.entrenador) {
    tira.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <div><b>Te entrena ${estado.entrenador.nombre}</b>
      <span>Las rutinas que te asigne aparecen aquí</span></div>`;
    tira.classList.remove('oculto');
  } else if (estado.perfil?.es_entrenador) {
    const n = estado.alumnos.length;
    tira.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <div><b>Entrenas a ${n} ${n === 1 ? 'persona' : 'personas'}</b>
      <span>Tu código: ${estado.perfil.codigo}</span></div>
      <button data-ver-alumnos>Ver</button>`;
    tira.classList.remove('oculto');
    tira.querySelector('[data-ver-alumnos]').addEventListener('click', abrirAlumnos);
  } else {
    tira.classList.add('oculto');
  }
}

// ------------------------------------------------------------
//  Menú
// ------------------------------------------------------------
function abrirMenu() {
  const p = estado.perfil || {};
  const seccionEntrenador = p.es_entrenador
    ? `<div class="menu-seccion"><h3>Como entrenador</h3>
         <div class="codigo-caja"><b>${p.codigo}</b>
           <span>Comparte este código para que se unan a ti</span></div>
         <button class="menu-boton" data-alumnos>Mis alumnos
           <small>${estado.alumnos.length}</small></button>
         <button class="menu-boton" data-biblioteca>Mis rutinas
           <small>las que armé</small></button>
       </div>`
    : '';

  const miEntrenador = estado.entrenador
    ? `<p style="margin:0;font-size:15px">Te entrena <b>${estado.entrenador.nombre}</b>.</p>`
    : p.es_entrenador
    ? ''
    : `<div class="fila-codigo">
         <input id="in-codigo" maxlength="6" placeholder="CÓDIGO" autocomplete="off"
                aria-label="Código de tu entrenador">
         <button id="btn-unirme">Unirme</button>
       </div>
       <p id="error-codigo" class="error oculto" style="margin:10px 0 0"></p>`;

  $('#hoja-titulo').textContent = estado.nombre;
  $('#hoja-cuerpo').innerHTML = `
    <div class="menu-seccion">
      <button class="menu-boton" data-mi-progreso>Mi progreso
        <small>constancia y cargas</small></button>
    </div>
    ${seccionEntrenador}
    ${miEntrenador ? `<div class="menu-seccion"><h3>Tu entrenador</h3>${miEntrenador}</div>` : ''}
    <div class="menu-seccion">
      <button class="menu-boton peligro" data-salir>Cerrar sesión</button>
    </div>`;
  $('#hoja').classList.remove('oculto');

  $('#hoja-cuerpo').querySelector('[data-mi-progreso]')?.addEventListener('click', () => {
    $('#hoja').classList.add('oculto');
    abrirProgreso(estado.usuario.id, estado.nombre, cargarCatalogo);
  });
  $('#hoja-cuerpo').querySelector('[data-biblioteca]')?.addEventListener('click', () => {
    $('#hoja').classList.add('oculto'); abrirBiblioteca();
  });
  $('#hoja-cuerpo').querySelector('[data-alumnos]')?.addEventListener('click', () => {
    $('#hoja').classList.add('oculto'); abrirAlumnos();
  });
  $('#hoja-cuerpo').querySelector('#btn-unirme')?.addEventListener('click', unirme);
  $('#hoja-cuerpo').querySelector('[data-salir]')?.addEventListener('click', async () => {
    if (!confirm('¿Cerrar sesión?')) return;
    await sb.auth.signOut();
    location.reload();
  });
}


async function unirme() {
  const campo = $('#in-codigo');
  const err = $('#error-codigo');
  const codigo = (campo.value || '').trim();
  if (codigo.length < 4) { err.textContent = 'Escribe el código que te dieron.'; err.classList.remove('oculto'); return; }

  const { data, error } = await sb.rpc('unirse_con_codigo', { p_codigo: codigo });
  if (error) {
    const m = (error.message || '').toLowerCase();
    err.textContent = m.includes('ya_soy_entrenador') ? 'Un entrenador no puede unirse a otro.'
                    : m.includes('codigo_propio') ? 'Ese es tu propio código.'
                    : m.includes('codigo_invalido') ? 'Ese código no corresponde a ningún entrenador.'
                    : 'No se pudo unir. Revisa tu conexión.';
    err.classList.remove('oculto');
    return;
  }
  const e = Array.isArray(data) ? data[0] : data;
  estado.entrenador = { id: e.entrenador, nombre: e.nombre };
  $('#hoja').classList.add('oculto');
  pintarTiraEntrenador();
  await cargarCatalogo();
  avisar('Ahora te entrena ' + e.nombre);
}

// ------------------------------------------------------------
//  Biblioteca: lo que armé como entrenador
// ------------------------------------------------------------
async function abrirBiblioteca() {
  estado.origenEditor = null;
  mostrarVista('#vista-biblioteca');
  $('#lista-biblioteca').innerHTML = '<p class="vacio">Cargando…</p>';

  const { data: propias } = await sb
    .from('rutinas').select('id, nombre, creada, creador_id')
    .eq('creador_id', estado.usuario.id);

  const cuantos = {};
  if ((propias || []).length) {
    const { data: reparto } = await sb.from('rutinas_usuario')
      .select('rutina_id').in('rutina_id', propias.map((r) => r.id));
    (reparto || []).forEach((x) => { cuantos[x.rutina_id] = (cuantos[x.rutina_id] || 0) + 1; });
  }
  estado.repartoRutinas = cuantos;
  (propias || []).forEach((r) => { estado.rutinas[r.id] ||= r; });

  $('#lista-biblioteca').innerHTML = (propias || []).length
    ? propias
        .sort((a, b) => String(b.creada).localeCompare(String(a.creada)))
        .map((r) => `
          <button class="tarjeta-rutina ${cuantos[r.id] ? '' : 'rutina-suelta'}" data-abrir-rutina="${r.id}">
            <span class="rutina-icono">
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 20h4v8H6zM38 20h4v8h-4zM12 16h5v16h-5zM31 16h5v16h-5zM17 22h14v4H17z"/></svg>
            </span>
            <span class="rutina-info">
              <h3>${r.nombre}</h3>
              <p>Creada el ${fechaLarga(r.creada)} · ${repartoTexto(r.id)}</p>
            </span>
            <span class="rutina-flecha">
              <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </button>`).join('')
    : '<p class="vacio-biblioteca">Todavía no has armado ninguna rutina.<br>La que armes aparecerá aquí, con quién la tiene.</p>';

  $('#lista-biblioteca').querySelectorAll('[data-abrir-rutina]').forEach((b) => {
    b.addEventListener('click', () => editarRutina(b.dataset.abrirRutina));
  });
}

alPulsar('#btn-volver-de-biblioteca', cargarCatalogo);

// ------------------------------------------------------------
//  Una persona a la que entreno
// ------------------------------------------------------------
async function abrirAlumno(alumnoId) {
  const p = estado.perfilesAlumnos?.[alumnoId];
  estado.alumnoAbierto = alumnoId;
  estado.origenEditor = alumnoId;
  mostrarVista('#vista-alumno');
  $('#alumno-nombre').textContent = p?.nombre || 'Alumno';
  $('#alumno-resumen').textContent = 'Entrenas a';
  $('#alumno-rutinas').innerHTML = '<p class="vacio">Cargando…</p>';
  $('#alumno-mapa').innerHTML = '';

  const { data: suyas } = await sb.from('rutinas_usuario')
    .select('rutina_id, activa').eq('user_id', alumnoId);
  const ids = (suyas || []).map((x) => x.rutina_id);

  const { data: defs } = ids.length
    ? await sb.from('rutinas').select('id, nombre, creada, creador_id').in('id', ids)
    : { data: [] };
  const porId = {}; (defs || []).forEach((r) => { porId[r.id] = r; });

  const { data: ses } = await sb.from('sesiones')
    .select('fecha').eq('user_id', alumnoId);
  $('#alumno-mapa').innerHTML = mapaMini((ses || []).map((x) => x.fecha));
  const n = (ses || []).length;
  const ultima = (ses || []).map((x) => x.fecha).sort().pop();
  $('#alumno-resumen').textContent =
    `${n} ${n === 1 ? 'entrenamiento' : 'entrenamientos'} · ${relativo(ultima)}`;

  $('#alumno-rutinas').innerHTML = ids.length
    ? (suyas || []).filter((x) => porId[x.rutina_id]).map((x) => {
        const r = porId[x.rutina_id];
        return `
          <div class="tarjeta-rutina ${x.activa ? 'activa' : ''}" style="cursor:default">
            <span class="rutina-icono">
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 20h4v8H6zM38 20h4v8h-4zM12 16h5v16h-5zM31 16h5v16h-5zM17 22h14v4H17z"/></svg>
            </span>
            <span class="rutina-info">
              <h3>${r.nombre}${x.activa ? '<span class="insignia-activa">activa</span>' : ''}</h3>
              <p>Creada el ${fechaLarga(r.creada)}</p>
            </span>
          </div>`;
      }).join('')
    : '<p class="vacio-biblioteca">Todavía no tiene ninguna rutina asignada.</p>';
}

alPulsar('#btn-volver-de-alumno', abrirAlumnos);
alPulsar('#btn-crear-para-alumno', () => {
  nuevaRutina();
  if (estado.alumnoAbierto) { estado.editor.asignar.add(estado.alumnoAbierto); pintarEditor(); }
});
alPulsar('#btn-asignar-existente', asignarExistente);

// Asignar a esta persona una rutina que ya armé
async function asignarExistente() {
  const alumnoId = estado.alumnoAbierto;
  if (!alumnoId) return;

  const { data: propias } = await sb
    .from('rutinas').select('id, nombre, creada').eq('creador_id', estado.usuario.id);
  const { data: yaTiene } = await sb.from('rutinas_usuario')
    .select('rutina_id').eq('user_id', alumnoId);
  const tiene = new Set((yaTiene || []).map((x) => x.rutina_id));
  const libres = (propias || []).filter((r) => !tiene.has(r.id));

  $('#hoja-titulo').textContent = 'Asignar una rutina';
  $('#hoja-cuerpo').innerHTML = libres.length
    ? libres.map((r) => `
        <button class="resultado" data-asignar-rutina="${r.id}">
          <div><b>${r.nombre}</b><small>Creada el ${fechaLarga(r.creada)}</small></div>
        </button>`).join('')
    : '<p class="vacio">No te queda ninguna rutina por asignarle. Arma una nueva.</p>';
  $('#hoja').classList.remove('oculto');

  $('#hoja-cuerpo').querySelectorAll('[data-asignar-rutina]').forEach((b) => {
    b.addEventListener('click', async () => {
      const { error } = await sb.from('rutinas_usuario')
        .insert({ user_id: alumnoId, rutina_id: b.dataset.asignarRutina, activa: false });
      $('#hoja').classList.add('oculto');
      if (error) { mostrarFallo(asignarExistente, 'No se pudo asignar la rutina.'); return; }
      avisar('Rutina asignada');
      abrirAlumno(alumnoId);
    });
  });
}

// ============================================================
//  Progreso: constancia y cargas de una persona (yo o un alumno)
// ============================================================

// Supabase entrega 1000 filas por consulta; el historial crece
// más que eso, así que se pide por páginas.
async function todasLasFilas(consulta) {
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await consulta().range(desde, desde + 999);
    if (error) throw error;
    filas.push(...(data || []));
    if (!data || data.length < 1000) return filas;
  }
}

const isoDe = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Lunes de la semana de una fecha
function lunesDe(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  f.setDate(f.getDate() - ((f.getDay() + 6) % 7));
  return isoDe(f);
}

// Mapa de constancia: una columna por semana (de lunes a domingo),
// la última es la actual. `nivel` va de fecha a 0, 1 o 2.
function mapaConstancia(nivel, { semanas = 12, celda = 9, hueco = 3, etiqueta = '' } = {}) {
  const inicio = new Date(lunesDe(hoy()).replace(/-/g, '/'));
  inicio.setDate(inicio.getDate() - (semanas - 1) * 7);
  const paso = celda + hueco;
  const w = semanas * paso - hueco, h = 7 * paso - hueco;
  const colores = ['var(--surface-2)', 'color-mix(in srgb, var(--acento) 45%, var(--surface-2))', 'var(--acento)'];
  let cuadros = '';
  const d = new Date(inicio);
  for (let c = 0; c < semanas; c++) {
    for (let f = 0; f < 7; f++) {
      const iso = isoDe(d);
      if (iso <= hoy()) {
        cuadros += `<rect x="${c * paso}" y="${f * paso}" width="${celda}" height="${celda}" rx="${celda > 8 ? 2.5 : 1.5}" fill="${colores[nivel[iso] || 0]}"/>`;
      }
      d.setDate(d.getDate() + 1);
    }
  }
  return `<svg class="mapa-constancia" viewBox="0 0 ${w} ${h}" role="img"
    aria-label="${etiqueta || `Días entrenados en las últimas ${semanas} semanas`}">${cuadros}</svg>`;
}

// Semanas seguidas con al menos un entrenamiento. La semana en curso
// no rompe la racha si todavía no se ha entrenado en ella.
function semanasSeguidas(fechas) {
  const conEntreno = new Set(fechas.map(lunesDe));
  const lunes = new Date(lunesDe(hoy()).replace(/-/g, '/'));
  if (!conEntreno.has(isoDe(lunes))) lunes.setDate(lunes.getDate() - 7);
  let n = 0;
  while (conEntreno.has(isoDe(lunes))) { n++; lunes.setDate(lunes.getDate() - 7); }
  return n;
}

const formatoKilos = (kg) =>
  kg >= 1000 ? `${(kg / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} t`
             : `${Math.round(kg)} kg`;

// Por ejercicio, la serie más pesada de cada fecha. Si nunca lleva
// peso (abdominales, dominadas sin lastre) se sigue por repeticiones.
function puntosPorEjercicio(series, fechaDeSesion) {
  const porEj = {};
  series.forEach((s) => {
    if (!s.hecho) return;
    const fecha = fechaDeSesion[s.sesion_id];
    if (!fecha) return;
    ((porEj[s.ejercicio_slug] ||= {})[fecha] ||= []).push(s);
  });

  return Object.entries(porEj).map(([slug, porFecha]) => {
    const todas = Object.values(porFecha).flat();
    const conPeso = todas.some((s) => Number(s.peso) > 0);
    const puntos = Object.keys(porFecha).sort().map((fecha) => {
      const mejor = porFecha[fecha].reduce((a, b) => {
        const va = conPeso ? Number(a.peso) || 0 : a.reps || 0;
        const vb = conPeso ? Number(b.peso) || 0 : b.reps || 0;
        return vb > va || (vb === va && (b.reps || 0) > (a.reps || 0)) ? b : a;
      });
      return { fecha, valor: conPeso ? Number(mejor.peso) || 0 : mejor.reps || 0, reps: mejor.reps, series: porFecha[fecha] };
    });
    return { slug, unidad: conPeso ? 'kg' : 'reps', puntos };
  });
}

function chispa(valores) {
  const W = 84, H = 26;
  if (valores.length < 2) {
    return `<svg class="chispa" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <circle cx="${W - 4}" cy="${H / 2}" r="3" fill="var(--acento)"/></svg>`;
  }
  const min = Math.min(...valores), max = Math.max(...valores), rango = max - min || 1;
  const pts = valores.map((v, i) => [4 + i * ((W - 8) / (valores.length - 1)),
    max === min ? H / 2 : H - 4 - ((v - min) / rango) * (H - 8)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fin = pts[pts.length - 1];
  return `<svg class="chispa" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path d="${d}" fill="none" stroke="var(--acento)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${fin[0].toFixed(1)}" cy="${fin[1].toFixed(1)}" r="3" fill="var(--acento)" stroke="var(--surface)" stroke-width="1.5"/>
  </svg>`;
}

// Gráfica de un ejercicio: la serie más pesada por sesión. Las
// repeticiones van como cifra bajo cada punto, no como segunda línea.
function graficaEjercicio(ej, nombre) {
  const puntos = ej.puntos.slice(-10);
  const W = 340, H = 210, ML = 34, MR = 12, MT = 14, MB = 50;
  const valores = puntos.map((p) => p.valor);
  let min = Math.min(...valores), max = Math.max(...valores);
  if (max === min) { min = Math.max(0, min - 5); max += 5; }
  // Un paso redondo (1, 2, 5, 10…) que deje unas cuatro líneas
  const bruto = (max - min) / 4, orden = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 5, 10].find((f) => f * orden >= bruto) * orden;
  min = Math.floor(min / paso) * paso; max = Math.ceil(max / paso) * paso;
  const lineas = [];
  for (let v = min; v <= max + paso / 2; v += paso) lineas.push(Math.round(v * 10) / 10);

  // Los puntos se separan de los bordes para que su fecha y sus
  // repeticiones no choquen con el eje ni se corten.
  const IZQ = ML + 18, DER = W - MR - 16;
  const x = (i) => puntos.length === 1 ? (IZQ + DER) / 2 : IZQ + i * ((DER - IZQ) / (puntos.length - 1));
  const y = (v) => MT + (1 - (v - min) / (max - min)) * (H - MT - MB);
  const rejilla = lineas.map((v) => `
    <line x1="${ML}" y1="${y(v).toFixed(1)}" x2="${W - MR}" y2="${y(v).toFixed(1)}" stroke="var(--borde)"/>
    <text x="${ML - 7}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" class="g-eje">${v}</text>`).join('');
  const linea = puntos.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.valor).toFixed(1)).join(' ');
  const saltar = puntos.length > 6 ? 2 : 1;
  const abajo = puntos.map((p, i) => {
    const conFecha = i % saltar === (puntos.length - 1) % saltar;
    return `
      <circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="4" fill="var(--acento)" stroke="var(--surface)" stroke-width="2"/>
      ${ej.unidad === 'kg' && p.reps ? `<text x="${x(i).toFixed(1)}" y="${H - 30}" text-anchor="middle" class="g-reps">${p.reps}</text>` : ''}
      ${conFecha ? `<text x="${x(i).toFixed(1)}" y="${H - 12}" text-anchor="middle" class="g-eje">${fechaCorta(p.fecha)}</text>` : ''}`;
  }).join('');
  const primero = puntos[0], ultimo = puntos[puntos.length - 1];
  const resumen = `${nombre}: de ${primero.valor} a ${ultimo.valor} ${ej.unidad} entre el ${fechaCorta(primero.fecha)} y el ${fechaCorta(ultimo.fecha)}`;
  return `
    <p class="g-titulo">${ej.unidad === 'kg' ? 'Serie más pesada de cada sesión, en kilos' : 'Mejor serie de cada sesión, en repeticiones'}</p>
    <svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="${resumen}">
      ${rejilla}
      <path d="${linea}" fill="none" stroke="var(--acento)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${abajo}
      ${ej.unidad === 'kg' ? `<text x="${ML - 7}" y="${H - 30}" text-anchor="end" class="g-eje">reps</text>` : ''}
    </svg>`;
}

function filasHistorial(puntos) {
  return puntos.slice().reverse().slice(0, 12).map((p) => `
    <div class="hist-fila">
      <span class="hist-fecha">${fechaCorta(p.fecha)}</span>
      <span class="hist-pesos">
        ${p.series.sort((a, b) => a.serie - b.serie).map((s) =>
          `<span class="hist-peso">${s.peso === null ? 'sin peso' : `${nDecimal(s.peso)} kg`}${s.reps ? ` × ${s.reps}` : ''}</span>`).join('')}
      </span>
    </div>`).join('');
}

// Todo lo de una persona: sesiones y series registradas
async function leerHistorialDe(userId, slug = null) {
  const sesiones = await todasLasFilas(() => sb.from('sesiones')
    .select('id, fecha').eq('user_id', userId).order('id'));
  const series = await todasLasFilas(() => {
    let q = sb.from('series_log')
      .select('sesion_id, ejercicio_slug, serie, peso, reps, hecho').eq('user_id', userId);
    if (slug) q = q.eq('ejercicio_slug', slug);
    return q.order('id');
  });
  const fechaDeSesion = {};
  sesiones.forEach((s) => { fechaDeSesion[s.id] = s.fecha; });
  return { sesiones, series, fechaDeSesion };
}

async function abrirProgreso(userId, nombre, volver) {
  estado.volverDeProgreso = volver;
  mostrarVista('#vista-progreso');
  $('#progreso-nombre').textContent = nombre;
  $('#progreso-cuerpo').innerHTML = '<p class="vacio">Cargando…</p>';

  let datos;
  try { datos = await leerHistorialDe(userId); }
  catch { $('#progreso-cuerpo').innerHTML = '<p class="vacio">No se pudo cargar. Revisa tu conexión.</p>'; return; }
  const { sesiones, series, fechaDeSesion } = datos;

  if (!sesiones.length) {
    $('#progreso-cuerpo').innerHTML = `<p class="vacio-biblioteca">Todavía no hay entrenamientos registrados.<br>
      El progreso aparece aquí desde el primer día.</p>`;
    return;
  }

  // Constancia: cuántas series se hicieron cada día
  const seriesPorFecha = {};
  series.forEach((s) => {
    const f = fechaDeSesion[s.sesion_id];
    if (s.hecho && f) seriesPorFecha[f] = (seriesPorFecha[f] || 0) + 1;
  });
  const fechas = [...new Set(sesiones.map((s) => s.fecha))];
  const nivel = {};
  fechas.forEach((f) => { nivel[f] = (seriesPorFecha[f] || 0) >= 10 ? 2 : 1; });

  const en30 = fechas.filter((f) => diasDesde(f) < 30).length;
  const levantado = series.reduce((t, s) => {
    const f = fechaDeSesion[s.sesion_id];
    return s.hecho && f && diasDesde(f) < 30 ? t + (Number(s.peso) || 0) * (s.reps || 0) : t;
  }, 0);

  const ejercicios = puntosPorEjercicio(series, fechaDeSesion)
    .sort((a, b) => b.puntos[b.puntos.length - 1].fecha.localeCompare(a.puntos[a.puntos.length - 1].fecha));
  estado.progreso = { userId, ejercicios };

  const filaEjercicio = (e) => {
    const ult = e.puntos.slice(-8);
    const actual = ult[ult.length - 1].valor;
    const dif = Math.round((actual - ult[0].valor) * 10) / 10;
    const cambio = ult.length < 2 ? '<span class="plano">1 sesión</span>'
      : dif > 0 ? `<span class="sube">+${dif}</span>`
      : dif < 0 ? `<span class="baja">−${Math.abs(dif)}</span>`
      : '<span class="plano">igual</span>';
    const ej = estado.ejercicios[e.slug];
    return `
      <button class="fila-ej" data-ej="${e.slug}">
        <span class="fe-info"><b>${ej?.nombre || e.slug}</b><small>${ej?.musculo || ''}</small></span>
        ${chispa(ult.map((p) => p.valor))}
        <span class="fe-kg"><b>${actual} ${e.unidad}</b><small>${cambio}</small></span>
      </button>`;
  };

  $('#progreso-cuerpo').innerHTML = `
    <div class="resumen">
      <div class="resumen-item"><b>${en30}</b><span>en 30 días</span></div>
      <div class="resumen-item"><b>${semanasSeguidas(fechas)}</b><span>semanas seguidas</span></div>
      <div class="resumen-item"><b>${formatoKilos(levantado)}</b><span>levantado en 30 días</span></div>
    </div>

    <h2 class="titulo-seccion">Constancia</h2>
    <div class="caja-mapa">
      ${mapaConstancia(nivel, { celda: 20, hueco: 4 })}
      <div class="mapa-pie"><span>Hace 12 semanas</span><span>Esta semana</span></div>
    </div>

    <h2 class="titulo-seccion">Cargas</h2>
    <p class="nota-seccion">Últimas 8 sesiones de cada ejercicio. Toca uno para ver el detalle.</p>
    <div class="lista-ej">${ejercicios.map(filaEjercicio).join('')}</div>`;

  $('#progreso-cuerpo').querySelectorAll('[data-ej]').forEach((b) => {
    b.addEventListener('click', () => abrirHistorial(b.dataset.ej, userId));
  });
}

alPulsar('#btn-volver-de-progreso', () => (estado.volverDeProgreso || cargarCatalogo)());
alPulsar('#btn-progreso-inicio', () =>
  abrirProgreso(estado.usuario.id, estado.nombre, cargarInicio));
alPulsar('#btn-progreso-alumno', () => {
  const id = estado.alumnoAbierto;
  abrirProgreso(id, estado.perfilesAlumnos?.[id]?.nombre || 'Alumno', () => abrirAlumno(id));
});

// Estado de un alumno según cuándo entrenó por última vez
function estadoAlumno(ultima) {
  const n = diasDesde(ultima);
  if (n === null) return { clase: 'grave', texto: 'Sin entrenar' };
  if (n <= 7) return { clase: 'ok', texto: relativo(ultima) };
  if (n <= 14) return { clase: 'alerta', texto: `Hace ${n} días` };
  return { clase: 'grave', texto: relativo(ultima) };
}

const mapaMini = (fechas) => {
  const nivel = {}; fechas.forEach((f) => { nivel[f] = 2; });
  return mapaConstancia(nivel, { celda: 7, hueco: 2 });
};

// ------------------------------------------------------------
//  Lista de alumnos
// ------------------------------------------------------------
async function abrirAlumnos() {
  mostrarVista('#vista-alumnos');
  $('#lista-alumnos').innerHTML = '<p class="vacio">Cargando…</p>';

  // Releer los vínculos: alguien pudo unirse con el código mientras
  // la app estaba abierta, y la lista tiene que reflejarlo.
  const { data: vinculos } = await sb.from('alumnos').select('entrenador_id, alumno_id');
  estado.alumnos = (vinculos || []).filter((v) => v.entrenador_id === estado.usuario.id);
  pintarTiraEntrenador();

  const ids = estado.alumnos.map((a) => a.alumno_id);
  $('#cuenta-alumnos').textContent =
    ids.length + (ids.length === 1 ? ' persona' : ' personas');
  if (!ids.length) {
    $('#lista-alumnos').innerHTML =
      '<p class="catalogo-vacio">Nadie se ha unido todavía.<br>Comparte tu código: <b>' +
      (estado.perfil?.codigo || '') + '</b></p>';
    return;
  }

  const { data: perfiles } = await sb.from('profiles').select('id, nombre').in('id', ids);
  (perfiles || []).forEach((p) => { estado.perfilesAlumnos[p.id] = p; });
  const { data: ses } = await sb.from('sesiones').select('user_id, fecha').in('user_id', ids);

  const porUsuario = {};
  (ses || []).forEach((x) => {
    const u = (porUsuario[x.user_id] ||= { n: 0, ultima: null, fechas: [] });
    u.n++;
    u.fechas.push(x.fecha);
    if (!u.ultima || x.fecha > u.ultima) u.ultima = x.fecha;
  });
  const sinDatos = { n: 0, ultima: null, fechas: [] };

  // Arriba quien lleva más tiempo sin entrenar
  const orden = (p) => diasDesde((porUsuario[p.id] || sinDatos).ultima) ?? Infinity;
  $('#lista-alumnos').innerHTML = (perfiles || [])
    .sort((a, b) => orden(b) - orden(a))
    .map((p) => {
      const d = porUsuario[p.id] || sinDatos;
      const e = estadoAlumno(d.ultima);
      return `
        <button class="tarjeta-alumno" data-alumno="${p.id}">
          <span class="inicial">${(p.nombre || '?').charAt(0).toUpperCase()}</span>
          <span class="alumno-info">
            <h3>${p.nombre}</h3>
            <p><span class="chip ${e.clase}">${e.texto}</span></p>
            <p>${d.n} ${d.n === 1 ? 'entrenamiento' : 'entrenamientos'}</p>
          </span>
          <span class="tp-mapa">${mapaMini(d.fechas)}</span>
        </button>`;
    }).join('');

  $('#lista-alumnos').querySelectorAll('[data-alumno]').forEach((b) => {
    b.addEventListener('click', () => abrirAlumno(b.dataset.alumno));
  });
}

alPulsar('#btn-volver-catalogo', cargarCatalogo);

// ============================================================
//  Constructor de rutinas
// ============================================================
function nuevaRutina() {
  estado.editor = { id: null, nombre: '', dias: [{ nombre: '', ejercicios: [] }], asignar: new Set() };
  abrirEditor('Rutina nueva');
}

// Modificar una rutina que ya existe: se carga tal cual está y al
// guardar se reescriben sus días.
async function editarRutina(rutinaId) {
  const def = await cargarDefinicionRutina(rutinaId);
  if (!def?.dias) { avisar('No se pudo abrir la rutina', true); return; }

  const { data: asignada } = await sb.from('rutinas_usuario')
    .select('user_id').eq('rutina_id', rutinaId);

  estado.editor = {
    id: rutinaId,
    nombre: def.nombre,
    dias: def.dias.map((d) => ({
      nombre: d.nombre,
      ejercicios: d.bloques.flatMap((bloque, bi) =>
        bloque.map((e, ei) => ({ id: e.id, series: [...e.series], juntoAlAnterior: ei > 0 }))),
    })),
    asignar: new Set((asignada || []).map((a) => a.user_id)),
  };
  abrirEditor(def.nombre);
}

function abrirEditor(titulo) {
  const ed = estado.editor;
  $('#in-nombre-rutina').value = ed.nombre || '';
  $('#editor-titulo').textContent = titulo;
  $('#editor-nota').textContent = '';
  $('#btn-publicar-rutina').textContent = ed.id ? 'Guardar cambios' : 'Guardar rutina';
  $('#btn-borrar-rutina').classList.toggle('oculto', !ed.id);
  pintarEditor();
  mostrarVista('#vista-editor');
}

function pintarEditor() {
  const ed = estado.editor;

  $('#editor-dias').innerHTML = ed.dias.map((d, di) => `
    <section class="dia-editor" data-dia="${di}">
      <div class="dia-editor-cab">
        <span class="num">${di + 1}</span>
        <input value="${(d.nombre || '').replace(/"/g, '&quot;')}"
               placeholder="Nombre del día (pecho, pierna…)"
               data-nombre-dia="${di}" aria-label="Nombre del día ${di + 1}">
        <button class="btn-quitar" data-quitar-dia="${di}" aria-label="Quitar día">✕</button>
      </div>
      ${d.ejercicios.map((e, ei) => tarjetaEjercicioEditor(di, ei, e)).join('')
        || '<p class="vacio" style="padding:18px 0">Sin ejercicios todavía</p>'}
      <div style="padding:12px 14px">
        <button class="btn-agregar" data-agregar-ej="${di}" style="margin:0">+ Agregar ejercicio</button>
      </div>
    </section>`).join('');

  const n = estado.alumnos.length;
  $('#editor-asignar').innerHTML = n
    ? estado.alumnos.map((a) => {
        const p = estado.perfilesAlumnos?.[a.alumno_id];
        const marcado = ed.asignar.has(a.alumno_id);
        return `<label class="chip-alumno ${marcado ? 'marcado' : ''}">
          <input type="checkbox" data-asignar="${a.alumno_id}" ${marcado ? 'checked' : ''}>
          <span>${p?.nombre || 'Alumno'}</span>
        </label>`;
      }).join('') +
      `<label class="chip-alumno ${ed.asignar.has(estado.usuario.id) ? 'marcado' : ''}">
         <input type="checkbox" data-asignar="${estado.usuario.id}"
                ${ed.asignar.has(estado.usuario.id) ? 'checked' : ''}>
         <span>Para mí <small>· también la entreno yo</small></span>
       </label>`
    : '<p class="vacio">Todavía no tienes alumnos. Puedes guardarla y asignarla después.</p>';
}

function tarjetaEjercicioEditor(di, ei, e) {
  const ej = estado.ejercicios[e.id];
  const series = e.series;
  return `
    <div class="ej-editor ${e.juntoAlAnterior ? 'enlazado' : ''}">
      <div class="ej-editor-cab">
        <b>${ej?.nombre || e.id}</b>
        <small>${ej?.musculo || ''}</small>
        <button class="btn-quitar" data-quitar-ej="${di}.${ei}" aria-label="Quitar ejercicio">✕</button>
      </div>
      <div class="series-editor">
        <span class="etiqueta">Reps</span>
        ${series.map((reps, si) => `
          <input type="number" inputmode="numeric" min="1" max="999" value="${reps}"
                 data-reps="${di}.${ei}.${si}" aria-label="Repeticiones de la serie ${si + 1}">`).join('')}
        <button data-menos-serie="${di}.${ei}" aria-label="Quitar una serie">−</button>
        <button data-mas-serie="${di}.${ei}" aria-label="Agregar una serie">+</button>
      </div>
      ${ei > 0 ? `
        <label class="enlace-superserie">
          <input type="checkbox" data-enlazar="${di}.${ei}" ${e.juntoAlAnterior ? 'checked' : ''}>
          En superserie con el anterior
        </label>` : ''}
    </div>`;
}

// --- interacción del editor ---
$('#editor-dias')?.addEventListener('click', (e) => {
  const ed = estado.editor; if (!ed) return;
  const q = (a) => e.target.closest(`[${a}]`)?.getAttribute(a);
  const quitarDia = q('data-quitar-dia');
  if (quitarDia !== undefined && quitarDia !== null) {
    if (ed.dias.length === 1) { avisar('La rutina necesita al menos un día', true); return; }
    ed.dias.splice(Number(quitarDia), 1); pintarEditor(); return;
  }
  const agregar = q('data-agregar-ej');
  if (agregar !== undefined && agregar !== null) { abrirBuscador(Number(agregar)); return; }

  const quitarEj = q('data-quitar-ej');
  if (quitarEj) {
    const [di, ei] = quitarEj.split('.').map(Number);
    ed.dias[di].ejercicios.splice(ei, 1);
    if (ed.dias[di].ejercicios[0]) ed.dias[di].ejercicios[0].juntoAlAnterior = false;
    pintarEditor(); return;
  }
  const mas = q('data-mas-serie');
  if (mas) {
    const [di, ei] = mas.split('.').map(Number);
    const ser = ed.dias[di].ejercicios[ei].series;
    ser.push(ser[ser.length - 1] || 10);
    pintarEditor(); return;
  }
  const menos = q('data-menos-serie');
  if (menos) {
    const [di, ei] = menos.split('.').map(Number);
    const ser = ed.dias[di].ejercicios[ei].series;
    if (ser.length === 1) { avisar('Un ejercicio necesita al menos una serie', true); return; }
    ser.pop(); pintarEditor(); return;
  }
});

$('#editor-dias')?.addEventListener('input', (e) => {
  const ed = estado.editor; if (!ed) return;
  const nombreDia = e.target.getAttribute('data-nombre-dia');
  if (nombreDia !== null) { ed.dias[Number(nombreDia)].nombre = e.target.value; return; }
  const reps = e.target.getAttribute('data-reps');
  if (reps !== null) {
    const [di, ei, si] = reps.split('.').map(Number);
    const v = Number(e.target.value);
    if (v > 0) ed.dias[di].ejercicios[ei].series[si] = v;
  }
});

$('#editor-dias')?.addEventListener('change', (e) => {
  const ed = estado.editor; if (!ed) return;
  const enlazar = e.target.getAttribute('data-enlazar');
  if (enlazar !== null) {
    const [di, ei] = enlazar.split('.').map(Number);
    ed.dias[di].ejercicios[ei].juntoAlAnterior = e.target.checked;
    pintarEditor();
  }
});

$('#editor-asignar')?.addEventListener('change', (e) => {
  const id = e.target.getAttribute('data-asignar');
  if (!id) return;
  if (e.target.checked) estado.editor.asignar.add(id);
  else estado.editor.asignar.delete(id);
  e.target.closest('.chip-alumno')?.classList.toggle('marcado', e.target.checked);
});

alPulsar('#btn-nueva-rutina', nuevaRutina);

// Al cerrar el editor se vuelve a donde se abrió: la ficha de la
// persona o la biblioteca de rutinas.
function salirDelEditor() {
  return estado.origenEditor ? abrirAlumno(estado.origenEditor) : abrirBiblioteca();
}
alPulsar('#btn-agregar-dia', () => {
  estado.editor.dias.push({ nombre: '', ejercicios: [] });
  pintarEditor();
});
alPulsar('#btn-cancelar-editor', () => {
  if (confirm('¿Descartar esta rutina?')) { estado.editor = null; salirDelEditor(); }
});
$('#in-nombre-rutina')?.addEventListener('input', (e) => {
  estado.editor.nombre = e.target.value;
  $('#editor-titulo').textContent = e.target.value.trim() || 'Rutina nueva';
});

// --- buscador de ejercicios ---
function abrirBuscador(di) {
  $('#hoja-titulo').textContent = 'Agregar ejercicio';
  $('#hoja-cuerpo').innerHTML = `
    <div class="buscador">
      <input id="in-buscar" placeholder="Buscar por nombre, músculo o equipo" autocomplete="off">
    </div>
    <div class="resultados" id="resultados"></div>`;
  $('#hoja').classList.remove('oculto');
  const pintar = (texto) => {
    const t = (texto || '').toLowerCase().trim();
    const lista = Object.values(estado.ejercicios)
      .filter((e) => !t || [e.nombre, e.musculo, e.tipo, ...(e.equipo || [])]
        .join(' ').toLowerCase().includes(t))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .slice(0, 60);
    $('#resultados').innerHTML = lista.length
      ? lista.map((e) => `
        <button class="resultado" data-elegir="${e.id}">
          <span class="mini">${e.svg || '<span class="sin-dibujo">sin<br>dibujo</span>'}</span>
          <div><b>${e.nombre}</b><small>${e.musculo} · ${(e.equipo || []).join(' + ')}</small></div>
        </button>`).join('')
      : '<p class="vacio">Ningún ejercicio coincide.</p>';
  };
  pintar('');
  $('#in-buscar').addEventListener('input', (e) => pintar(e.target.value));
  $('#resultados').addEventListener('click', (e) => {
    const id = e.target.closest('[data-elegir]')?.getAttribute('data-elegir');
    if (!id) return;
    estado.editor.dias[di].ejercicios.push({ id, series: [15, 12, 10, 8], juntoAlAnterior: false });
    $('#hoja').classList.add('oculto');
    pintarEditor();
  });
  setTimeout(() => $('#in-buscar')?.focus(), 120);
}

// --- guardar ---
alPulsar('#btn-publicar-rutina', guardarRutina);

async function guardarRutina() {
  const ed = estado.editor;
  const btn = $('#btn-publicar-rutina');
  const nota = $('#editor-nota');

  const nombre = (ed.nombre || '').trim();
  if (!nombre) { nota.textContent = 'Ponle un nombre a la rutina.'; return; }
  const vacios = ed.dias.filter((d) => !d.ejercicios.length).length;
  if (vacios) { nota.textContent = 'Hay días sin ejercicios. Quítalos o agrégales algo.'; return; }

  btn.disabled = true; btn.textContent = 'Guardando…'; nota.textContent = '';
  const id = ed.id || nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
    + '-' + Math.random().toString(36).slice(2, 7);
  const rutinaId = ed.id || id;

  try {
    if (ed.id) {
      const { error: eN } = await sb.from('rutinas').update({ nombre }).eq('id', ed.id);
      if (eN) throw eN;
      // Reescribir los días: al borrarlos se van sus ejercicios en cascada
      const { error: eB } = await sb.from('rutina_dias').delete().eq('rutina_id', ed.id);
      if (eB) throw eB;
    } else {
      const { error: e1 } = await sb.from('rutinas').insert({
        id, nombre, creador_id: estado.usuario.id, por_defecto: false,
      });
      if (e1) throw e1;
    }

    for (let i = 0; i < ed.dias.length; i++) {
      const d = ed.dias[i];
      const { data: dia, error: e2 } = await sb.from('rutina_dias')
        .insert({ rutina_id: rutinaId, dia: i + 1, nombre: d.nombre.trim() || `Día ${i + 1}` })
        .select('id').single();
      if (e2) throw e2;

      // Cada ejercicio abre un bloque nuevo salvo que vaya en superserie
      // con el anterior; dentro del bloque, el orden en que se agregaron.
      let bloque = 0;
      const enBloque = {};
      const filas = d.ejercicios.map((e, ei) => {
        if (ei === 0 || !e.juntoAlAnterior) bloque++;
        enBloque[bloque] = (enBloque[bloque] || 0) + 1;
        return {
          dia_id: dia.id, bloque, orden: enBloque[bloque],
          ejercicio_id: e.id, series: e.series,
        };
      });

      const { error: e3 } = await sb.from('rutina_ejercicios').insert(filas);
      if (e3) throw e3;
    }

    if (ed.asignar.size) {
      // upsert: al modificar, quien ya la tenía no se duplica
      const { error: e4 } = await sb.from('rutinas_usuario').upsert(
        [...ed.asignar].map((uid) => ({ user_id: uid, rutina_id: rutinaId, activa: false })),
        { onConflict: 'user_id,rutina_id', ignoreDuplicates: true });
      if (e4) throw e4;
    }

    estado.editor = null;
    estado.rutinas = {};
    avisar(ed.id ? 'Cambios guardados' : 'Rutina guardada');
    await salirDelEditor();
  } catch (err) {
    nota.textContent = 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.';
  } finally {
    btn.disabled = false;
    btn.textContent = ed.id ? 'Guardar cambios' : 'Guardar rutina';
  }
}

// --- borrar ---
alPulsar('#btn-borrar-rutina', borrarRutina);

async function borrarRutina() {
  const ed = estado.editor;
  if (!ed?.id) return;
  const btn = $('#btn-borrar-rutina');
  const nota = $('#editor-nota');

  if (!confirm(`Vas a eliminar «${ed.nombre}».\n\nDesaparecerá del catálogo de quien la tenga. Esto no se puede deshacer.`)) return;

  btn.disabled = true; btn.textContent = 'Eliminando…'; nota.textContent = '';
  try {
    const { error } = await sb.from('rutinas').delete().eq('id', ed.id);
    if (error) throw error;
    estado.editor = null;
    estado.rutinas = {};
    avisar('Rutina eliminada');
    await salirDelEditor();
  } catch (err) {
    // La base impide borrar una rutina con entrenamientos: perdería el historial
    const m = (err?.message || '').toLowerCase();
    nota.textContent = m.includes('foreign key') || m.includes('viola')
      ? 'No se puede eliminar: ya hay entrenamientos registrados con ella y se perdería ese historial. Puedes modificarla en vez de borrarla.'
      : 'No se pudo eliminar. Revisa tu conexión.';
  } finally {
    btn.disabled = false; btn.textContent = 'Eliminar rutina';
  }
}

// ============================================================
//  El catálogo vive en la base. Aquí sólo se le pega el dibujo,
//  que sigue en el código. Un ejercicio creado por un entrenador
//  no tiene dibujo y se queda sin ilustración a propósito.
// ============================================================
async function cargarEjercicios() {
  const { data, error } = await sb
    .from('ejercicios')
    .select('id, nombre, musculo, tipo, grupos, patron, equipo, unilateral, tecnica, dibujo');
  if (error) throw error;
  estado.ejercicios = {};
  (data || []).forEach((e) => {
    estado.ejercicios[e.id] = { ...e, svg: (e.dibujo && DIBUJOS[e.dibujo]) || null };
  });
}

// Los días de una rutina, con sus superseries reconstruidas
async function cargarDefinicionRutina(rutinaId) {
  if (estado.rutinas[rutinaId]?.dias) return estado.rutinas[rutinaId];

  const { data: cab, error: e1 } = await sb
    .from('rutinas').select('id, nombre, creada').eq('id', rutinaId).maybeSingle();
  if (e1 || !cab) return null;

  const { data: dias, error: e2 } = await sb
    .from('rutina_dias')
    .select('id, dia, nombre, tono, rutina_ejercicios(bloque, orden, ejercicio_id, series)')
    .eq('rutina_id', rutinaId)
    .order('dia');
  if (e2) return null;

  cab.dias = (dias || []).map((d) => {
    const porBloque = {};
    (d.rutina_ejercicios || [])
      .sort((a, b) => a.bloque - b.bloque || a.orden - b.orden)
      .forEach((re) => {
        (porBloque[re.bloque] ||= []).push({
          id: re.ejercicio_id,
          series: re.series?.length ? re.series : [15, 12, 10, 8],
        });
      });
    return {
      dia: d.dia, nombre: d.nombre, tono: d.tono,
      bloques: Object.keys(porBloque).sort((a, b) => a - b).map((k) => porBloque[k]),
    };
  });
  estado.rutinas[rutinaId] = cab;
  return cab;
}

// ============================================================
//  Catálogo de rutinas
// ============================================================
async function cargarCatalogo() {
  estado.rutina = null;
  recordarUbicacion(null);
  document.documentElement.style.setProperty('--acento', '#ff6b35');

  const { data } = await sb
    .from('rutinas_usuario')
    .select('rutina_id, activa, agregada_at')
    .eq('user_id', estado.usuario.id);
  let mias = data || [];

  // Las rutinas marcadas por defecto entran solas en el catálogo de quien no las tenga
  const { data: porDefecto } = await sb
    .from('rutinas').select('id').eq('por_defecto', true);
  const faltan = (porDefecto || []).filter((r) => !mias.some((m) => m.rutina_id === r.id));
  if (faltan.length) {
    const nuevas = faltan.map((r, i) => ({
      user_id: estado.usuario.id,
      rutina_id: r.id,
      activa: mias.length === 0 && i === 0,
    }));
    const { error } = await sb.from('rutinas_usuario').insert(nuevas);
    if (!error) mias = mias.concat(nuevas.map((n) => ({ ...n, agregada_at: null })));
  }

  // Sólo las que existen en el código, y con la definición al lado
  const { data: defs } = await sb
    .from('rutinas').select('id, nombre, creada, creador_id')
    .in('id', mias.length ? mias.map((m) => m.rutina_id) : ['']);
  const porId = {};
  (defs || []).forEach((r) => { porId[r.id] = r; estado.rutinas[r.id] ||= r; });

  // El catálogo es sólo lo que YO entreno. Lo que armé como entrenador
  // vive en la biblioteca, que es otra pregunta y crece de otra forma.
  estado.catalogo = mias
    .map((m) => ({ ...m, def: porId[m.rutina_id] }))
    .filter((m) => m.def)
    .sort((a, b) => String(b.def.creada).localeCompare(String(a.def.creada)));

  $('#nombre-usuario').textContent = estado.nombre || 'atleta';
  pintarTiraEntrenador();
  $('#lista-rutinas').innerHTML = estado.catalogo.length
    ? estado.catalogo.map((m) => `
        <button class="tarjeta-rutina ${m.activa ? 'activa' : ''}" data-rutina="${m.rutina_id}">
          <span class="rutina-icono">
            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 20h4v8H6zM38 20h4v8h-4zM12 16h5v16h-5zM31 16h5v16h-5zM17 22h14v4H17z"/></svg>
          </span>
          <span class="rutina-info">
            <h3>${m.def.nombre}${m.activa ? '<span class="insignia-activa">activa</span>' : ''}</h3>
            <p>Creada el ${fechaLarga(m.def.creada)}</p>
          </span>
          <span class="rutina-flecha">
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </button>`).join('')
    : '<p class="catalogo-vacio">Todavía no tienes ninguna rutina en tu catálogo.</p>';

  $('#lista-rutinas').querySelectorAll('.tarjeta-rutina').forEach((b) => {
    b.addEventListener('click', () => abrirRutina(b.dataset.rutina));
  });
  $('#lista-rutinas').querySelectorAll('[data-editar]').forEach((b) => {
    b.addEventListener('click', () => editarRutina(b.dataset.editar));
  });

  mostrarVista('#vista-catalogo');
}

async function abrirRutina(rutinaId) {
  const def = await cargarDefinicionRutina(rutinaId);
  if (!def?.dias) {
    estado.rutina = null;
    recordarUbicacion(null);
    avisar('No se pudo abrir la rutina', true);
    return;
  }
  estado.rutina = def;

  // Abrir una rutina la vuelve la activa
  const yaActiva = estado.catalogo.find((m) => m.rutina_id === rutinaId)?.activa;
  if (!yaActiva) {
    await sb.from('rutinas_usuario').update({ activa: false }).eq('user_id', estado.usuario.id);
    await sb.from('rutinas_usuario').update({ activa: true })
      .eq('user_id', estado.usuario.id).eq('rutina_id', rutinaId);
    estado.catalogo.forEach((m) => { m.activa = m.rutina_id === rutinaId; });
  }

  $('#rutina-titulo').textContent = def.nombre;
  $('#rutina-fecha').textContent = `Creada el ${fechaLarga(def.creada)}`;
  await cargarInicio();
}

alPulsar('#btn-catalogo', cargarCatalogo);

// ============================================================
//  Días de la rutina abierta
// ============================================================
async function cargarInicio() {
  const { data } = await sb
    .from('sesiones')
    .select('dia, fecha, finalizada_at')
    .eq('user_id', estado.usuario.id)
    .eq('rutina_id', estado.rutina.id)
    .order('fecha', { ascending: false });

  estado.ultimasFechas = {};
  const cerradas = {};
  const fechas = new Set();
  (data || []).forEach((s) => {
    if (!estado.ultimasFechas[s.dia]) {
      estado.ultimasFechas[s.dia] = s.fecha;
      cerradas[s.dia] = !!s.finalizada_at;
    }
    fechas.add(s.fecha);
  });

  // entrenamientos de los últimos 7 días
  const semana = [...fechas].filter((f) => diasDesde(f) < 7).length;
  const total = fechas.size;
  const ultima = [...fechas].sort().pop();

  $('#resumen-semana').innerHTML = `
    <div class="resumen-item"><b>${semana}</b><span>esta semana</span></div>
    <div class="resumen-item"><b>${total}</b><span>entrenamientos</span></div>
    <div class="resumen-item"><b style="font-size:19px;padding-top:5px">${ultima ? fechaCorta(ultima) : '—'}</b><span>última vez</span></div>`;

  $('#lista-dias').innerHTML = estado.rutina.dias.map((d) => {
    const fecha = estado.ultimasFechas[d.dia];
    const esHoy = fecha && diasDesde(fecha) === 0;
    const terminadoHoy = esHoy && cerradas[d.dia];
    const n = d.bloques.reduce((t, b) => t + b.length, 0);
    const sub = `${n} ${n === 1 ? 'ejercicio' : 'ejercicios'} · ${relativo(fecha)}`;
    return `
      <button class="tarjeta-dia" data-dia="${d.dia}">
        <span class="dia-num" style="--tono:${d.tono};--tono-suave:${d.tono}22">${d.dia}</span>
        <span class="dia-info">
          <h3>${d.nombre}${terminadoHoy
            ? '<span class="insignia-fin">terminado</span>'
            : esHoy ? '<span class="insignia-hoy">hoy</span>' : ''}</h3>
          <p>${sub}</p>
        </span>
        <span class="dia-flecha">
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>`;
  }).join('');

  $('#lista-dias').querySelectorAll('.tarjeta-dia').forEach((b) => {
    b.addEventListener('click', () => abrirDia(Number(b.dataset.dia)));
  });

  recordarUbicacion(estado.rutina.id);
  mostrarVista('#vista-inicio');
}

// ============================================================
//  Vista de un día
// ============================================================
async function abrirDia(numDia) {
  if (!estado.rutina?.dias) return;
  const dia = estado.rutina.dias.find((d) => d.dia === numDia);
  if (!dia) return;
  estado.dia = dia;
  estado.fecha = hoy();

  $('#dia-etiqueta').textContent = `Día ${dia.dia}`;
  $('#dia-titulo').textContent = dia.nombre;
  document.documentElement.style.setProperty('--acento', dia.tono);
  recordarUbicacion(estado.rutina.id, dia.dia);
  mostrarVista('#vista-dia');
  limpiarPantalla();

  await cargarFechas();
  await cargarSesion();
}

function limpiarPantalla() {
  estado.registros = {};
  estado.guardados = {};
  estado.anteriores = {};
  estado.sesionId = null;
  estado.cardio = false;
  estado.finalizada = null;
  estado.inicioSesion = null;
  pintarBloques();
}

// Fechas en las que ya entrenaste este día, para poder volver y corregir.
async function cargarFechas() {
  const { data } = await sb
    .from('sesiones')
    .select('fecha')
    .eq('user_id', estado.usuario.id)
    .eq('rutina_id', estado.rutina.id)
    .eq('dia', estado.dia.dia)
    .order('fecha', { ascending: false })
    .limit(30);

  const fechas = (data || []).map((x) => x.fecha);
  if (!fechas.includes(hoy())) fechas.unshift(hoy());

  estado.fechas = fechas;
  $('#fechas').innerHTML = fechas.map((f) => `
    <button class="chip-fecha" data-fecha="${f}" aria-pressed="${f === estado.fecha}">
      ${f === hoy() ? 'Hoy' : fechaCorta(f)}
    </button>`).join('');
  $('#fechas').classList.toggle('oculto', fechas.length < 2);
}

function marcarFechaActiva() {
  $('#fechas').querySelectorAll('.chip-fecha').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.fecha === estado.fecha));
  });
  $('#aviso-pasado').classList.toggle('oculto', estado.fecha === hoy());
}

async function cargarSesion() {
  limpiarPantalla();
  marcarFechaActiva();

  const slugs = ejerciciosDelDia().map((e) => e.id);
  const { data: ses } = await sb
    .from('sesiones')
    .select('id, cardio_hecho, finalizada_at, created_at')
    .eq('user_id', estado.usuario.id)
    .eq('rutina_id', estado.rutina.id)
    .eq('dia', estado.dia.dia).eq('fecha', estado.fecha)
    .maybeSingle();

  if (ses) {
    estado.sesionId = ses.id;
    estado.cardio = ses.cardio_hecho;
    estado.finalizada = ses.finalizada_at;
    estado.inicioSesion = ses.created_at;
    const { data: logs } = await sb
      .from('series_log')
      .select('ejercicio_slug, serie, peso, reps, hecho')
      .eq('user_id', estado.usuario.id)
      .eq('sesion_id', ses.id);
    (logs || []).forEach((l) => {
      const clave = `${l.ejercicio_slug}:${l.serie}`;
      const fila = { peso: l.peso, reps: l.reps, hecho: l.hecho };
      estado.registros[clave] = fila;
      estado.guardados[clave] = { ...fila };
    });
  }

  // pesos de la última vez, para referencia
  const { data: prev } = await sb
    .from('ultimo_registro')
    .select('ejercicio_slug, serie, peso, reps, fecha')
    .eq('user_id', estado.usuario.id)
    .in('ejercicio_slug', slugs);
  (prev || []).forEach((p) => {
    estado.anteriores[`${p.ejercicio_slug}:${p.serie}`] = p;
  });

  // Recuperar lo escrito pero no guardado en este telefono
  const borrador = cargarBorrador();
  Object.entries(borrador).forEach(([clave, v]) => {
    estado.registros[clave] = { peso: v.peso, reps: v.reps, hecho: false };
  });

  pintarBloques();
  Object.keys(borrador).forEach((clave) => marcarPendiente(clave, true));
  if (Object.keys(borrador).length) avisar('Tienes series escritas sin guardar', true);

  actualizarProgreso();
  pintarFinalizacion();
  $('#btn-cardio').setAttribute('aria-pressed', String(estado.cardio));
  $('#btn-borrar-sesion').classList.toggle('oculto', !estado.sesionId);
}

// Cambiar de fecha dentro del mismo día
alPulsar('#fechas', (e) => {
  const chip = e.target.closest('.chip-fecha');
  if (!chip || chip.dataset.fecha === estado.fecha) return;
  if (document.querySelectorAll('#lista-bloques tr.pendiente').length &&
      !confirm('Tienes series escritas sin guardar. Si cambias de fecha se quedan aquí, pero no se subirán.\n\n¿Cambiar de todos modos?')) return;
  estado.fecha = chip.dataset.fecha;
  cargarSesion();
});

// Eliminar el entrenamiento completo de esta fecha
async function borrarSesion() {
  if (!estado.sesionId) return;
  const btn = $('#btn-borrar-sesion');
  const cuantas = Object.values(estado.guardados).filter((g) => g.hecho).length;
  const cuando = estado.fecha === hoy() ? 'de hoy' : `del ${fechaCorta(estado.fecha)}`;

  const seguro = confirm(
    `Vas a eliminar el entrenamiento ${cuando} de ${estado.dia.nombre}, ` +
    `con ${cuantas} ${cuantas === 1 ? 'serie registrada' : 'series registradas'}.\n\n` +
    'Esto no se puede deshacer.'
  );
  if (!seguro) return;

  btn.disabled = true;
  btn.textContent = 'Eliminando…';
  try {
    const { error } = await sb.from('sesiones').delete().eq('id', estado.sesionId);
    if (error) throw error;
    limpiarBorradorCompleto();
    estado.fecha = hoy();
    await cargarFechas();
    await cargarSesion();
    avisar('Entrenamiento eliminado');
  } catch {
    mostrarFallo(borrarSesion, 'No se pudo eliminar. Revisa tu conexión.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Eliminar este entrenamiento';
  }
}

alPulsar('#btn-borrar-sesion', borrarSesion);

// El día abierto, como lista de ejercicios con su propio esquema
const ejerciciosDelDia = () => (estado.dia?.bloques || []).flat();
const seriesDe = (slug) => ejerciciosDelDia().find((e) => e.id === slug)?.series || [];

function pintarBloques() {
  const dia = estado.dia;
  $('#lista-bloques').innerHTML = dia.bloques.map((bloque, i) => `
    <section class="bloque">
      <div class="bloque-cab">
        <span class="bloque-num">${i + 1}</span>
        <span>Superserie</span>
      </div>
      ${bloque.map((item) => tarjetaEjercicio(item)).join('')}
    </section>`).join('');
}

function tarjetaEjercicio(item) {
  const slug = item.id;
  const series = item.series;
  const ej = estado.ejercicios[slug];
  const hechas = series.filter((_, i) => estado.registros[`${slug}:${i + 1}`]?.hecho).length;
  const completo = hechas === series.length;

  const filas = series.map((reps, i) => {
    const n = i + 1;
    const r = estado.registros[`${slug}:${n}`] || {};
    const ant = estado.anteriores[`${slug}:${n}`];
    return `
      <tr data-fila="${slug}:${n}">
        <td class="serie-reps">${reps}</td>
        <td class="celda-in">
          <input class="in-num" type="number" inputmode="decimal" step="0.5" min="0"
                 placeholder="${ant ? nDecimal(ant.peso) : 'kg'}"
                 value="${nDecimal(r.peso)}"
                 data-slug="${slug}" data-serie="${n}" data-campo="peso"
                 aria-label="Peso serie ${n} de ${ej.nombre}">
        </td>
        <td class="celda-in">
          <input class="in-num" type="number" inputmode="numeric" step="1" min="0"
                 placeholder="${reps}"
                 value="${r.reps ?? ''}"
                 data-slug="${slug}" data-serie="${n}" data-campo="reps"
                 aria-label="Repeticiones serie ${n} de ${ej.nombre}">
        </td>
        <td class="celda-check">
          <button class="check" aria-pressed="${!!r.hecho}"
                  data-slug="${slug}" data-serie="${n}"
                  aria-label="Marcar serie ${n} de ${ej.nombre}">
            <svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6"/></svg>
          </button>
        </td>
      </tr>`;
  }).join('');

  return `
    <article class="ejercicio" data-ej="${slug}">
      <button class="ej-cab" data-abrir="${slug}">
        <span class="ej-dibujo">${ej.svg}</span>
        <span class="ej-txt">
          <h4>${ej.nombre}</h4>
          <p class="ej-musculo">${ej.musculo}</p>
        </span>
        <span class="ej-estado">
          <span class="pastilla ${completo ? 'completo' : ''}">${hechas}/${series.length}</span>
          <svg class="chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <div class="ej-cuerpo">
        <div class="ej-visual">
          <span class="ej-visual-svg">${ej.svg}</span>
          <span class="ej-visual-txt">
            <p>${ej.tecnica}</p>
            <a class="btn-video" href="${urlVideo(ej.nombre)}" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Ver técnica en video
            </a>
          </span>
        </div>
        <table class="tabla-series">
          <thead><tr><th>Reps</th><th>Peso (kg)</th><th>Reps reales</th><th></th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <div class="ej-pie">
          <button class="btn-menor" data-historial="${slug}">Ver historial</button>
          <button class="btn-menor" data-descanso="90">Descanso 1:30</button>
        </div>
      </div>
    </article>`;
}

// ---- interacción dentro del día (delegación de eventos) ----
alPulsar('#lista-bloques', (e) => {
  const cab = e.target.closest('[data-abrir]');
  if (cab) {
    cab.parentElement.classList.toggle('abierto');
    return;
  }
  const chk = e.target.closest('.check');
  if (chk) {
    guardarSerie(chk.dataset.slug, Number(chk.dataset.serie), chk);
    return;
  }
  const hist = e.target.closest('[data-historial]');
  if (hist) { abrirHistorial(hist.dataset.historial); return; }

  const desc = e.target.closest('[data-descanso]');
  if (desc) { iniciarTemporizador(Number(desc.dataset.descanso)); return; }
});

// Escribir no toca la red: solo actualiza el borrador local y marca
// la fila como pendiente de guardar.
$('#lista-bloques')?.addEventListener('input', (e) => {
  const inp = e.target.closest('.in-num');
  if (!inp) return;
  const valor = inp.value === '' ? null : Number(inp.value);
  if (valor !== null && (Number.isNaN(valor) || valor < 0)) return;

  const clave = `${inp.dataset.slug}:${inp.dataset.serie}`;
  const actual = estado.registros[clave] || { peso: null, reps: null, hecho: false };
  actual[inp.dataset.campo] = valor;
  estado.registros[clave] = actual;

  const guardado = estado.guardados[clave];
  const coincide = !!guardado && guardado.hecho
    && guardado.peso === actual.peso && guardado.reps === actual.reps;

  actual.hecho = coincide;

  if (coincide) {
    // Volvio exactamente al valor guardado: no hay nada que subir.
    limpiarBorrador(clave);
    marcarGuardada(clave);
  } else {
    const hayAlgo = actual.peso !== null || actual.reps !== null;
    if (hayAlgo || guardado) anotarBorrador(clave, { peso: actual.peso, reps: actual.reps });
    else limpiarBorrador(clave);
    marcarPendiente(clave, hayAlgo || !!guardado);
  }

  actualizarPastilla(inp.dataset.slug);
  actualizarProgreso();
  pintarFinalizacion();
});

alPulsar('#btn-volver', () => {
  document.documentElement.style.setProperty('--acento', '#ff6b35');
  recordarUbicacion(estado.rutina.id);
  cargarInicio();
});

$('#btn-cardio')?.addEventListener('click', async () => {
  const nuevo = !estado.cardio;
  $('#btn-cardio').setAttribute('aria-pressed', String(nuevo));
  try {
    const id = await asegurarSesion();
    const { error } = await sb.from('sesiones').update({ cardio_hecho: nuevo }).eq('id', id);
    if (error) throw error;
    estado.cardio = nuevo;
    ocultarFallo();
  } catch {
    $('#btn-cardio').setAttribute('aria-pressed', String(estado.cardio));
    mostrarFallo(null, 'No se pudo guardar el cardio. Revisa tu conexión.');
  }
});

$('#fallo-reintentar')?.addEventListener('click', () => {
  const accion = reintento;
  ocultarFallo();
  if (accion) accion();
});
alPulsar('#fallo-cerrar', ocultarFallo);

// ============================================================
//  Guardado
// ============================================================
// Una sola creacion en vuelo a la vez: dos guardados simultaneos
// compartian la misma promesa en lugar de crear sesiones duplicadas.
let sesionEnCurso = null;

async function asegurarSesion() {
  if (estado.sesionId) return estado.sesionId;
  if (sesionEnCurso) return sesionEnCurso;

  sesionEnCurso = (async () => {
    const { data, error } = await sb
      .from('sesiones')
      .upsert(
        { user_id: estado.usuario.id, rutina_id: estado.rutina.id, dia: estado.dia.dia, fecha: estado.fecha },
        { onConflict: 'user_id,rutina_id,dia,fecha' }
      )
      .select('id')
      .single();
    if (error) throw error;
    estado.sesionId = data.id;
    return data.id;
  })();

  try { return await sesionEnCurso; }
  finally { sesionEnCurso = null; }
}

function marcarPendiente(clave, pendiente) {
  const tr = document.querySelector(`tr[data-fila="${clave}"]`);
  if (!tr) return;
  tr.classList.toggle('pendiente', !!pendiente);
  // Editar siempre desmarca: lo que se ve ya no es lo que esta guardado.
  tr.querySelector('.check').setAttribute('aria-pressed', 'false');
}

function marcarGuardada(clave) {
  const tr = document.querySelector(`tr[data-fila="${clave}"]`);
  if (!tr) return;
  tr.classList.remove('pendiente');
  tr.querySelector('.check').setAttribute('aria-pressed', 'true');
}

// La palomita es el boton de guardar: toma el peso y las reps de su
// fila, los sube, y solo entonces se pone verde.
// Un dedo de más convierte 38 kg en 388 y descompone el progreso.
// Si el peso es mucho mayor que lo más pesado que se conoce de este
// ejercicio (la vez pasada o las otras series de hoy), se pregunta.
function pesoCreible(slug, serie, peso) {
  if (!(peso > 0)) return true;
  // De hoy cuentan las otras series; la que se está marcando no.
  const hoyOtras = Object.entries(estado.registros).filter(([c]) => c !== `${slug}:${serie}`);
  const conocidos = [...Object.entries(estado.anteriores), ...hoyOtras]
    .filter(([clave]) => clave.startsWith(slug + ':'))
    .map(([, r]) => Number(r.peso) || 0);
  const referencia = Math.max(0, ...conocidos);
  const exagerado = referencia > 0
    ? peso >= referencia * 2 && peso - referencia >= 20
    : peso > 300;
  if (!exagerado) return true;
  return confirm(referencia > 0
    ? `¿${nDecimal(peso)} kg? Lo más pesado que tienes en este ejercicio es ${nDecimal(referencia)} kg.\n\nAcepta si es correcto, o cancela para corregirlo.`
    : `¿${nDecimal(peso)} kg? Es mucho peso.\n\nAcepta si es correcto, o cancela para corregirlo.`);
}

async function guardarSerie(slug, serie, btn) {
  if (btn.classList.contains('guardando')) return;

  const clave = `${slug}:${serie}`;
  const tr = btn.closest('tr');
  const inPeso = tr.querySelector('[data-campo="peso"]');
  const inReps = tr.querySelector('[data-campo="reps"]');
  const peso = inPeso.value === '' ? null : Number(inPeso.value);
  const reps = inReps.value === '' ? null : Number(inReps.value);
  const marcar = btn.getAttribute('aria-pressed') !== 'true';

  if (marcar && peso === null && reps === null) {
    tr.classList.add('falta');
    setTimeout(() => tr.classList.remove('falta'), 1400);
    avisar('Escribe el peso o las repeticiones antes de marcar', true);
    return;
  }

  if (marcar && !pesoCreible(slug, serie, peso)) {
    inPeso.focus();
    inPeso.select();
    return;
  }

  tr.classList.remove('falta');
  btn.classList.add('guardando');
  btn.disabled = true;
  ocultarFallo();

  try {
    const sesionId = await asegurarSesion();
    const { error } = await sb.from('series_log').upsert(
      {
        user_id: estado.usuario.id,
        sesion_id: sesionId,
        ejercicio_slug: slug,
        serie,
        peso,
        reps,
        hecho: marcar,
      },
      { onConflict: 'sesion_id,ejercicio_slug,serie' }
    );
    if (error) throw error;

    estado.registros[clave] = { peso, reps, hecho: marcar };
    estado.guardados[clave] = { peso, reps, hecho: marcar };
    btn.setAttribute('aria-pressed', String(marcar));
    tr.classList.remove('pendiente');
    limpiarBorrador(clave);
    // La sesión ya existe: se puede eliminar
    $('#btn-borrar-sesion').classList.remove('oculto');
    actualizarPastilla(slug);
    actualizarProgreso();
    pintarFinalizacion();
    // El descanso lo arranca el usuario con su botón, no la palomita.
  } catch {
    btn.setAttribute('aria-pressed', 'false');
    tr.classList.add('pendiente');
    anotarBorrador(clave, { peso, reps });
    mostrarFallo(() => guardarSerie(slug, serie, btn));
  } finally {
    btn.classList.remove('guardando');
    btn.disabled = false;
  }
}

function actualizarPastilla(slug) {
  const art = document.querySelector(`.ejercicio[data-ej="${slug}"]`);
  if (!art) return;
  const series = seriesDe(slug);
  const hechas = series.filter((_, i) => estado.registros[`${slug}:${i + 1}`]?.hecho).length;
  const p = art.querySelector('.pastilla');
  p.textContent = `${hechas}/${series.length}`;
  p.classList.toggle('completo', hechas === series.length);
}

function actualizarProgreso() {
  if (!estado.dia) return;
  const items = ejerciciosDelDia();
  const total = items.reduce((n, e) => n + e.series.length, 0);
  const hechas = items.reduce(
    (n, e) => n + e.series.filter((_, i) => estado.registros[`${e.id}:${i + 1}`]?.hecho).length, 0);
  const pct = total ? Math.round((hechas / total) * 100) : 0;
  const anillo = $('#progreso-dia');
  anillo.style.setProperty('--pct', pct + '%');
  anillo.innerHTML = `<span>${pct}%</span>`;
}

// ============================================================
//  Finalizar la rutina del día
// ============================================================
const seriesPendientes = () =>
  [...document.querySelectorAll('#lista-bloques tr.pendiente')];

function pintarFinalizacion() {
  const cerrada = !!estado.finalizada;
  $('#btn-finalizar').classList.toggle('oculto', cerrada);
  $('#finalizar-nota').classList.toggle('oculto', cerrada);
  $('#ya-finalizada').classList.toggle('oculto', !cerrada);

  if (cerrada) {
    const h = new Date(estado.finalizada);
    $('#finalizada-hora').textContent =
      'Cerraste este entrenamiento a las ' +
      h.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    return;
  }

  const pend = seriesPendientes().length;
  const marcadas = contarMarcadas();
  $('#finalizar-nota').textContent = pend
    ? `${pend} ${pend === 1 ? 'serie escrita sin guardar' : 'series escritas sin guardar'}`
    : marcadas
      ? `${marcadas} ${marcadas === 1 ? 'serie guardada' : 'series guardadas'}`
      : 'Todavía no has guardado ninguna serie';
}

function contarMarcadas() {
  if (!estado.dia) return 0;
  return ejerciciosDelDia().reduce(
    (n, e) => n + e.series.filter((_, i) => estado.registros[`${e.id}:${i + 1}`]?.hecho).length, 0);
}

// Sube en orden todas las series en ámbar. Devuelve cuántas fallaron.
async function guardarTodasPendientes() {
  let fallos = 0;
  for (const tr of seriesPendientes()) {
    const btn = tr.querySelector('.check');
    await guardarSerie(btn.dataset.slug, Number(btn.dataset.serie), btn);
    if (tr.classList.contains('pendiente')) fallos++;
  }
  return fallos;
}

async function finalizarRutina() {
  const btn = $('#btn-finalizar');
  const pend = seriesPendientes().length;

  if (pend) {
    const guardar = confirm(
      `Tienes ${pend} ${pend === 1 ? 'serie escrita sin guardar' : 'series escritas sin guardar'}.\n\n` +
      'Aceptar: guardarlas y finalizar.\nCancelar: volver sin finalizar.'
    );
    if (!guardar) return;
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    const fallos = await guardarTodasPendientes();
    btn.disabled = false;
    btn.textContent = 'Finalizar rutina';
    if (fallos) {
      mostrarFallo(finalizarRutina, `Quedaron ${fallos} series sin guardar. No cerré la rutina.`);
      return;
    }
  }

  if (!contarMarcadas() && !estado.cardio) {
    avisar('No hay nada que finalizar todavía', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Cerrando…';
  try {
    const id = await asegurarSesion();
    const cierre = new Date().toISOString();
    const { error } = await sb.from('sesiones').update({ finalizada_at: cierre }).eq('id', id);
    if (error) throw error;
    estado.finalizada = cierre;
    pintarFinalizacion();
    mostrarResumen();
  } catch {
    mostrarFallo(finalizarRutina, 'No se pudo cerrar la rutina. Revisa tu conexión.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Finalizar rutina';
  }
}

function mostrarResumen() {
  const items = ejerciciosDelDia();
  const marcadas = contarMarcadas();
  const completos = items.filter(
    (e) => e.series.every((_, i) => estado.registros[`${e.id}:${i + 1}`]?.hecho)).length;

  let volumen = 0;
  items.forEach((e) => e.series.forEach((_, i) => {
    const r = estado.registros[`${e.id}:${i + 1}`];
    if (r?.hecho && r.peso && r.reps) volumen += r.peso * r.reps;
  }));

  let duracion = '';
  if (estado.inicioSesion && estado.finalizada) {
    const min = Math.round((new Date(estado.finalizada) - new Date(estado.inicioSesion)) / 60000);
    if (min > 0) duracion = min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
  }

  const porEjercicio = items.map((e) => {
    const s = e.id;
    const hechas = e.series.filter((_, i) => estado.registros[`${s}:${i + 1}`]?.hecho).length;
    const pesos = e.series.map((_, i) => estado.registros[`${s}:${i + 1}`])
      .filter((r) => r?.hecho && r.peso != null).map((r) => nDecimal(r.peso));
    return `<li><span style="color:var(--texto)">${estado.ejercicios[s].nombre}</span>
      <span>${hechas ? pesos.join(' · ') + ' kg' : '—'}</span></li>`;
  }).join('');

  $('#hoja-titulo').textContent = 'Entrenamiento terminado';
  $('#hoja-cuerpo').innerHTML = `
    <div class="resumen-cifras">
      <div class="resumen-cifra"><b>${marcadas}</b><span>${marcadas === 1 ? 'serie guardada' : 'series guardadas'}</span></div>
      <div class="resumen-cifra"><b>${completos}/${items.length}</b><span>ejercicios</span></div>
      <div class="resumen-cifra"><b>${volumen ? volumen.toLocaleString('es-MX') : '—'}</b><span>kg levantados</span></div>
      <div class="resumen-cifra"><b>${duracion || '—'}</b><span>duración</span></div>
    </div>
    <p class="resumen-detalle">
      ${estado.cardio ? 'Cardio hecho. ' : 'Falta el cardio de 20 a 30 minutos. '}
      Tus pesos de hoy aparecerán como referencia la próxima vez que entrenes ${estado.dia.nombre.toLowerCase()}.
    </p>
    <ul class="resumen-lista">${porEjercicio}</ul>
    <button class="btn-primario" data-cerrar-hoja>Listo</button>`;
  $('#hoja').classList.remove('oculto');
}

async function reabrirRutina() {
  try {
    const { error } = await sb.from('sesiones').update({ finalizada_at: null }).eq('id', estado.sesionId);
    if (error) throw error;
    estado.finalizada = null;
    pintarFinalizacion();
    avisar('Rutina reabierta');
  } catch {
    mostrarFallo(reabrirRutina, 'No se pudo reabrir. Revisa tu conexión.');
  }
}

alPulsar('#btn-finalizar', finalizarRutina);
alPulsar('#btn-reabrir', reabrirRutina);

// ============================================================
//  Historial por ejercicio
// ============================================================
async function abrirHistorial(slug, userId = estado.usuario.id) {
  const ej = estado.ejercicios[slug];
  $('#hoja-titulo').textContent = ej?.nombre || slug;
  $('#hoja-cuerpo').innerHTML = '<p class="vacio">Cargando…</p>';
  $('#hoja').classList.remove('oculto');

  // Desde la pantalla de progreso ya están los datos; desde un
  // entrenamiento se leen frescos, que acaban de cambiar.
  let datos = !$('#vista-progreso').classList.contains('oculto')
    && estado.progreso?.userId === userId
    && estado.progreso.ejercicios.find((e) => e.slug === slug);
  if (!datos) {
    try {
      const h = await leerHistorialDe(userId, slug);
      datos = puntosPorEjercicio(h.series, h.fechaDeSesion)[0];
    } catch { datos = null; }
  }

  if (!datos?.puntos.length) {
    $('#hoja-cuerpo').innerHTML = '<p class="vacio">Todavía no hay registros de este ejercicio.</p>';
    return;
  }
  $('#hoja-cuerpo').innerHTML = graficaEjercicio(datos, ej?.nombre || slug) + filasHistorial(datos.puntos);
}

alPulsar('#hoja', (e) => {
  if (e.target.dataset.cerrarHoja !== undefined) $('#hoja').classList.add('oculto');
});

// ============================================================
//  Temporizador de descanso
// ============================================================
let tempInt = null, tempRestante = 0;

function pintarTemp() {
  const m = Math.floor(Math.max(tempRestante, 0) / 60);
  const s = Math.max(tempRestante, 0) % 60;
  $('#temp-tiempo').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function iniciarTemporizador(segundos) {
  tempRestante = segundos;
  $('#temporizador').classList.remove('oculto', 'terminado');
  pintarTemp();
  clearInterval(tempInt);
  tempInt = setInterval(() => {
    tempRestante--;
    pintarTemp();
    if (tempRestante <= 0) {
      clearInterval(tempInt);
      $('#temporizador').classList.add('terminado');
      sonar();
      setTimeout(() => $('#temporizador').classList.add('oculto'), 4000);
    }
  }, 1000);
}

function sonar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22, 0.44].forEach((t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.16);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.18);
    });
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  } catch {}
}

$('#temp-mas')?.addEventListener('click', () => { tempRestante += 15; pintarTemp(); });
$('#temp-menos')?.addEventListener('click', () => { tempRestante = Math.max(0, tempRestante - 15); pintarTemp(); });
alPulsar('#temp-cerrar', () => {
  clearInterval(tempInt);
  $('#temporizador').classList.add('oculto');
});

window.addEventListener('online', () => avisar('Conexión restablecida'));

// ============================================================
//  Arranque
// ============================================================
async function arrancar() {
  const { data: { session } } = await sb.auth.getSession();
  $('#cargando').classList.add('oculto');

  if (!session) { mostrarVista('#vista-auth'); return; }

  estado.usuario = session.user;
  await cargarPerfil();

  try {
    await cargarEjercicios();
  } catch {
    $('#cargando').classList.remove('oculto');
    mostrarFallo(arrancar, 'No se pudo cargar el catálogo de ejercicios.');
    return;
  }

  // Leerlo ANTES: cargar el catálogo borra la ubicación guardada.
  const dondeEstaba = ubicacionGuardada();
  await cargarCatalogo();

  if (dondeEstaba) {
    await abrirRutina(dondeEstaba.rutinaId);
    // Si la rutina guardada ya no carga, abrirRutina se rinde y hay que
    // quedarse en el catálogo en vez de intentar abrir un día de nada.
    if (dondeEstaba.dia && estado.rutina) await abrirDia(dondeEstaba.dia);
  }
}

sb.auth.onAuthStateChange((evento, sesion) => {
  if (evento === 'SIGNED_OUT') {
    estado.usuario = null;
    mostrarVista('#vista-auth');
    return;
  }
  // Al volver de otra app, Supabase revalida la sesión y vuelve a emitir
  // SIGNED_IN. Arrancar de nuevo aquí te sacaba del día que estabas
  // haciendo y te devolvía al inicio, así que sólo arrancamos la primera vez.
  if (evento === 'SIGNED_IN') {
    if (!estado.usuario) arrancar();
    else if (sesion?.user) estado.usuario = sesion.user;
  }
});

arrancar();
