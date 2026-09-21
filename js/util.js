// Funciones puras de la app: no tocan la pantalla ni la base.
// Viven aparte para poder probarlas con `node --test` (ver tests/).

export const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Para meter en el HTML texto que escribió una persona
export const escapar = (t) => String(t ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Sin acentos ni mayúsculas: "jessica" encuentra a "Jéssica"
export const sinAcentos = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const isoDe = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Lunes de la semana de una fecha
export function lunesDe(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  f.setDate(f.getDate() - ((f.getDay() + 6) % 7));
  return isoDe(f);
}

// Semanas seguidas con al menos un entrenamiento. La semana en curso
// no rompe la racha si todavía no se ha entrenado en ella.
export function semanasSeguidas(fechas, hoyIso = hoy()) {
  const conEntreno = new Set(fechas.map(lunesDe));
  const lunes = new Date(lunesDe(hoyIso).replace(/-/g, '/'));
  if (!conEntreno.has(isoDe(lunes))) lunes.setDate(lunes.getDate() - 7);
  let n = 0;
  while (conEntreno.has(isoDe(lunes))) { n++; lunes.setDate(lunes.getDate() - 7); }
  return n;
}

export const formatoKilos = (kg) =>
  kg >= 1000 ? `${(kg / 1000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} t`
             : `${Math.round(kg)} kg`;

// Por ejercicio, la serie más pesada de cada fecha. Si nunca lleva
// peso (abdominales, dominadas sin lastre) se sigue por repeticiones.
export function puntosPorEjercicio(series, fechaDeSesion) {
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

// Un dedo de más convierte 38 kg en 388. Es exagerado si dobla lo más
// pesado que se conoce del ejercicio (la vez pasada u otras series de
// hoy, sin contar la que se marca) y son al menos 20 kg más; sin
// referencia, si pasa de 300 kg.
export function revisarPeso(peso, slug, serie, anteriores = {}, registros = {}) {
  if (!(peso > 0)) return { exagerado: false, referencia: 0 };
  const hoyOtras = Object.entries(registros).filter(([c]) => c !== `${slug}:${serie}`);
  const conocidos = [...Object.entries(anteriores), ...hoyOtras]
    .filter(([clave]) => clave.startsWith(slug + ':'))
    .map(([, r]) => Number(r.peso) || 0);
  const referencia = Math.max(0, ...conocidos);
  const exagerado = referencia > 0
    ? peso >= referencia * 2 && peso - referencia >= 20
    : peso > 300;
  return { exagerado, referencia };
}
