import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { SERIES, EJERCICIOS, DIAS, urlVideo } from './rutina.js';

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
const CLAVE_BORRADOR = 'rutina:borrador';

const estado = {
  usuario: null,
  nombre: '',
  dia: null,        // día abierto
  sesionId: null,
  registros: {},    // "slug:serie" -> {peso, reps, hecho}
  anteriores: {},   // "slug:serie" -> {peso, reps, fecha}
  cardio: false,
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

const claveDia = () => `${estado.dia?.dia}:${hoy()}`;

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

$('#form-auth').addEventListener('submit', async (e) => {
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

$('#btn-menu').addEventListener('click', async () => {
  if (confirm('¿Cerrar sesión?')) {
    await sb.auth.signOut();
    location.reload();
  }
});

// ============================================================
//  Pantalla de inicio
// ============================================================
async function cargarInicio() {
  const { data } = await sb
    .from('sesiones')
    .select('dia, fecha')
    .order('fecha', { ascending: false });

  estado.ultimasFechas = {};
  const fechas = new Set();
  (data || []).forEach((s) => {
    if (!estado.ultimasFechas[s.dia]) estado.ultimasFechas[s.dia] = s.fecha;
    fechas.add(s.fecha);
  });

  // entrenamientos de los últimos 7 días
  const semana = [...fechas].filter((f) => diasDesde(f) < 7).length;
  const total = fechas.size;
  const ultima = [...fechas].sort().pop();

  $('#nombre-usuario').textContent = estado.nombre || 'atleta';
  $('#resumen-semana').innerHTML = `
    <div class="resumen-item"><b>${semana}</b><span>esta semana</span></div>
    <div class="resumen-item"><b>${total}</b><span>entrenamientos</span></div>
    <div class="resumen-item"><b style="font-size:19px;padding-top:5px">${ultima ? fechaCorta(ultima) : '—'}</b><span>última vez</span></div>`;

  $('#lista-dias').innerHTML = DIAS.map((d) => {
    const fecha = estado.ultimasFechas[d.dia];
    const esHoy = fecha && diasDesde(fecha) === 0;
    const sub = d.listo
      ? `${d.bloques.length * 2} ejercicios · ${relativo(fecha)}`
      : d.vista;
    return `
      <button class="tarjeta-dia" data-dia="${d.dia}" ${d.listo ? '' : 'disabled style="opacity:.5"'}>
        <span class="dia-num" style="--tono:${d.tono};--tono-suave:${d.tono}22">${d.dia}</span>
        <span class="dia-info">
          <h3>${d.nombre}${esHoy ? '<span class="insignia-hoy">hoy</span>' : ''}</h3>
          <p>${sub}</p>
        </span>
        <span class="dia-flecha">${d.listo
          ? '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '<span class="pastilla">pronto</span>'}</span>
      </button>`;
  }).join('');

  $('#lista-dias').querySelectorAll('.tarjeta-dia:not([disabled])').forEach((b) => {
    b.addEventListener('click', () => abrirDia(Number(b.dataset.dia)));
  });

  mostrarVista('#vista-inicio');
}

// ============================================================
//  Vista de un día
// ============================================================
async function abrirDia(numDia) {
  const dia = DIAS.find((d) => d.dia === numDia);
  if (!dia || !dia.listo) return;
  estado.dia = dia;
  estado.registros = {};
  estado.anteriores = {};

  $('#dia-etiqueta').textContent = `Día ${dia.dia}`;
  $('#dia-titulo').textContent = dia.nombre;
  document.documentElement.style.setProperty('--acento', dia.tono);
  mostrarVista('#vista-dia');
  pintarBloques();

  // sesión de hoy (se crea sólo si no existe)
  const slugs = dia.bloques.flat();
  const { data: ses } = await sb
    .from('sesiones')
    .select('id, cardio_hecho')
    .eq('dia', dia.dia).eq('fecha', hoy())
    .maybeSingle();

  if (ses) {
    estado.sesionId = ses.id;
    estado.cardio = ses.cardio_hecho;
    const { data: logs } = await sb
      .from('series_log')
      .select('ejercicio_slug, serie, peso, reps, hecho')
      .eq('sesion_id', ses.id);
    (logs || []).forEach((l) => {
      estado.registros[`${l.ejercicio_slug}:${l.serie}`] = { peso: l.peso, reps: l.reps, hecho: l.hecho };
    });
  } else {
    estado.sesionId = null;
    estado.cardio = false;
  }

  // pesos de la última vez, para referencia
  const { data: prev } = await sb
    .from('ultimo_registro')
    .select('ejercicio_slug, serie, peso, reps, fecha')
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
  if (Object.keys(borrador).length) {
    avisar('Tienes series escritas sin guardar', true);
  }
  actualizarProgreso();
  $('#btn-cardio').setAttribute('aria-pressed', String(estado.cardio));
}

function pintarBloques() {
  const dia = estado.dia;
  $('#lista-bloques').innerHTML = dia.bloques.map((bloque, i) => `
    <section class="bloque">
      <div class="bloque-cab">
        <span class="bloque-num">${i + 1}</span>
        <span>Superserie</span>
      </div>
      ${bloque.map((slug) => tarjetaEjercicio(slug)).join('')}
    </section>`).join('');
}

function tarjetaEjercicio(slug) {
  const ej = EJERCICIOS[slug];
  const hechas = SERIES.filter((_, i) => estado.registros[`${slug}:${i + 1}`]?.hecho).length;
  const completo = hechas === SERIES.length;

  const filas = SERIES.map((reps, i) => {
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
          <span class="pastilla ${completo ? 'completo' : ''}">${hechas}/${SERIES.length}</span>
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
$('#lista-bloques').addEventListener('click', (e) => {
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
$('#lista-bloques').addEventListener('input', (e) => {
  const inp = e.target.closest('.in-num');
  if (!inp) return;
  const valor = inp.value === '' ? null : Number(inp.value);
  if (valor !== null && (Number.isNaN(valor) || valor < 0)) return;

  const clave = `${inp.dataset.slug}:${inp.dataset.serie}`;
  const actual = estado.registros[clave] || { peso: null, reps: null, hecho: false };
  actual[inp.dataset.campo] = valor;
  actual.hecho = false;
  estado.registros[clave] = actual;

  anotarBorrador(clave, { peso: actual.peso, reps: actual.reps });
  marcarPendiente(clave, actual.peso !== null || actual.reps !== null);
  actualizarPastilla(inp.dataset.slug);
  actualizarProgreso();
});

$('#btn-volver').addEventListener('click', () => {
  document.documentElement.style.setProperty('--acento', '#ff6b35');
  cargarInicio();
});

$('#btn-cardio').addEventListener('click', async () => {
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

$('#fallo-reintentar').addEventListener('click', () => {
  const accion = reintento;
  ocultarFallo();
  if (accion) accion();
});
$('#fallo-cerrar').addEventListener('click', ocultarFallo);

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
        { user_id: estado.usuario.id, dia: estado.dia.dia, fecha: hoy() },
        { onConflict: 'user_id,dia,fecha' }
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
  if (pendiente) tr.querySelector('.check').setAttribute('aria-pressed', 'false');
}

// La palomita es el boton de guardar: toma el peso y las reps de su
// fila, los sube, y solo entonces se pone verde.
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
    btn.setAttribute('aria-pressed', String(marcar));
    tr.classList.remove('pendiente');
    limpiarBorrador(clave);
    actualizarPastilla(slug);
    actualizarProgreso();
    if (marcar) iniciarTemporizador(90);
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
  const hechas = SERIES.filter((_, i) => estado.registros[`${slug}:${i + 1}`]?.hecho).length;
  const p = art.querySelector('.pastilla');
  p.textContent = `${hechas}/${SERIES.length}`;
  p.classList.toggle('completo', hechas === SERIES.length);
}

function actualizarProgreso() {
  if (!estado.dia) return;
  const slugs = estado.dia.bloques.flat();
  const total = slugs.length * SERIES.length;
  const hechas = slugs.reduce(
    (n, s) => n + SERIES.filter((_, i) => estado.registros[`${s}:${i + 1}`]?.hecho).length, 0);
  const pct = total ? Math.round((hechas / total) * 100) : 0;
  const anillo = $('#progreso-dia');
  anillo.style.setProperty('--pct', pct + '%');
  anillo.innerHTML = `<span>${pct}%</span>`;
}

// ============================================================
//  Historial por ejercicio
// ============================================================
async function abrirHistorial(slug) {
  const ej = EJERCICIOS[slug];
  $('#hoja-titulo').textContent = ej.nombre;
  $('#hoja-cuerpo').innerHTML = '<p class="vacio">Cargando…</p>';
  $('#hoja').classList.remove('oculto');

  const { data, error } = await sb
    .from('series_log')
    .select('serie, peso, reps, sesiones!inner(fecha)')
    .eq('ejercicio_slug', slug)
    .not('peso', 'is', null)
    .limit(200);

  if (error || !data || !data.length) {
    $('#hoja-cuerpo').innerHTML = '<p class="vacio">Todavía no tienes registros de este ejercicio.</p>';
    return;
  }

  const porFecha = {};
  data.forEach((r) => {
    const f = r.sesiones.fecha;
    (porFecha[f] ||= []).push(r);
  });

  $('#hoja-cuerpo').innerHTML = Object.keys(porFecha)
    .sort().reverse().slice(0, 12)
    .map((f) => {
      const series = porFecha[f].sort((a, b) => a.serie - b.serie);
      return `
        <div class="hist-fila">
          <span class="hist-fecha">${fechaCorta(f)}</span>
          <span class="hist-pesos">
            ${series.map((s) => `<span class="hist-peso">${nDecimal(s.peso)} kg${s.reps ? ` × ${s.reps}` : ''}</span>`).join('')}
          </span>
        </div>`;
    }).join('');
}

$('#hoja').addEventListener('click', (e) => {
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

$('#temp-mas').addEventListener('click', () => { tempRestante += 15; pintarTemp(); });
$('#temp-menos').addEventListener('click', () => { tempRestante = Math.max(0, tempRestante - 15); pintarTemp(); });
$('#temp-cerrar').addEventListener('click', () => {
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
  const { data: perfil } = await sb.from('profiles').select('nombre').eq('id', session.user.id).maybeSingle();
  estado.nombre = perfil?.nombre || session.user.email.split('@')[0];

  await cargarInicio();
}

sb.auth.onAuthStateChange((evento) => {
  if (evento === 'SIGNED_IN') arrancar();
  if (evento === 'SIGNED_OUT') mostrarVista('#vista-auth');
});

arrancar();
