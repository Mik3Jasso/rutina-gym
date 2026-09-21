// Una base de datos en memoria que se comporta como supabase-js para
// lo que usa la app: select/insert/upsert/update/delete con filtros,
// rpc y auth. No simula los permisos (RLS): eso lo prueba tests/base.sql.
// Los datos son inventados.

let contador = 0;
const nuevoId = () => `id-${++contador}`;
const hoyIso = () => new Date().toISOString().slice(0, 10);

// Los valores que la base real pone sola al insertar
const PREDETERMINADOS = {
  rutinas: () => ({ creada: hoyIso(), por_defecto: false, notas: null }),
  sesiones: () => ({ created_at: new Date().toISOString(), cardio_hecho: false, finalizada_at: null, notas: null }),
  rutinas_usuario: () => ({ agregada_at: new Date().toISOString() }),
};

export function crearBase(datos, { yo, rpc = {} } = {}) {
  const tablas = structuredClone(datos);
  const escrituras = [];

  function consulta(tabla) {
    const q = { tabla, filtros: [], orden: null, limite: null, rango: null, uno: null, escritura: null, conSelect: false, select: '*' };
    const api = {
      select(cols = '*') { q.conSelect = true; q.select = cols; return api; },
      eq(c, v) { q.filtros.push((r) => r[c] === v); return api; },
      in(c, vs) { q.filtros.push((r) => vs.includes(r[c])); return api; },
      not(c, op, v) { q.filtros.push((r) => (op === 'is' && v === null ? r[c] != null : r[c] !== v)); return api; },
      order(c, { ascending = true } = {}) { q.orden = [c, ascending]; return api; },
      limit(n) { q.limite = n; return api; },
      range(a, b) { q.rango = [a, b]; return api; },
      single() { q.uno = 'single'; return ejecutar(); },
      maybeSingle() { q.uno = 'maybe'; return ejecutar(); },
      insert(filas) { q.escritura = ['insert', filas]; return api; },
      upsert(filas, opciones = {}) { q.escritura = ['upsert', filas, opciones]; return api; },
      update(cambios) { q.escritura = ['update', cambios]; return api; },
      delete() { q.escritura = ['delete']; return api; },
      then(ok, mal) { return ejecutar().then(ok, mal); },
    };

    const filtrar = () => (tablas[tabla] ||= []).filter((r) => q.filtros.every((f) => f(r)));

    // Relaciones que pide la app dentro del select
    function adjuntar(filas) {
      if (tabla === 'rutina_dias' && q.select.includes('rutina_ejercicios(')) {
        return filas.map((d) => ({ ...d, rutina_ejercicios: (tablas.rutina_ejercicios || []).filter((e) => e.dia_id === d.id) }));
      }
      return filas;
    }

    async function ejecutar() {
      let filas;
      if (q.escritura) {
        const [tipo, arg, opciones] = q.escritura;
        escrituras.push({ tabla, tipo, arg: structuredClone(arg) });
        const t = (tablas[tabla] ||= []);
        if (tipo === 'insert' || tipo === 'upsert') {
          const lista = (Array.isArray(arg) ? arg : [arg])
            .map((f) => ({ ...(PREDETERMINADOS[tabla]?.() || {}), id: f.id || nuevoId(), ...f }));
          filas = [];
          for (const f of lista) {
            const claves = (opciones?.onConflict || '').split(',').filter(Boolean);
            const existe = claves.length && t.find((r) => claves.every((k) => r[k] === f[k]));
            if (existe) { if (!opciones.ignoreDuplicates) Object.assign(existe, f, { id: existe.id }); filas.push(existe); }
            else { t.push(f); filas.push(f); }
          }
        } else if (tipo === 'update') {
          filas = filtrar(); filas.forEach((r) => Object.assign(r, arg));
        } else {
          filas = filtrar(); tablas[tabla] = t.filter((r) => !filas.includes(r));
        }
        if (!q.conSelect) return { data: null, error: null };
      } else {
        filas = filtrar();
      }
      filas = adjuntar(filas.map((r) => ({ ...r })));
      if (q.orden) {
        const [c, asc] = q.orden;
        filas.sort((a, b) => (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (asc ? 1 : -1));
      }
      if (q.rango) filas = filas.slice(q.rango[0], q.rango[1] + 1);
      if (q.limite != null) filas = filas.slice(0, q.limite);
      if (q.uno === 'single') return filas.length === 1 ? { data: filas[0], error: null } : { data: null, error: { message: 'no single row' } };
      if (q.uno === 'maybe') return { data: filas[0] || null, error: null };
      return { data: filas, error: null };
    }
    return api;
  }

  const usuario = { id: yo, email: `${yo}@ejemplo.test` };
  const cliente = {
    from: consulta,
    rpc: async (nombre, args) => {
      escrituras.push({ tabla: 'rpc', tipo: nombre, arg: args });
      return rpc[nombre] ? rpc[nombre](args, tablas) : { data: null, error: null };
    },
    auth: {
      getSession: async () => ({ data: { session: { user: usuario } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({}),
      signUp: async () => ({ data: {}, error: null }),
      signInWithPassword: async () => ({ error: null }),
      updateUser: async () => ({ data: {}, error: null }),
    },
  };
  return { cliente, tablas, escrituras };
}
