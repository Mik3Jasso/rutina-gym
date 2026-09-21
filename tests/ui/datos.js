// Datos inventados para las pruebas de pantalla. Cada texto que una
// persona escribe trae algo de HTML a propósito: la app tiene que
// mostrarlo como texto y nunca ejecutarlo.
const hace = (dias) => {
  const d = new Date(); d.setDate(d.getDate() - dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const TRAMPA = '<img src=x onerror="window.__xss=1">';

export const DATOS = {
  profiles: [
    { id: 'u-mike', nombre: 'Mike', es_entrenador: false, es_admin: true, codigo: null },
    { id: 'u-jessi', nombre: 'Jessica', es_entrenador: false, es_admin: false, codigo: null },
    { id: 'u-jerry', nombre: 'Jerry', es_entrenador: true, es_admin: false, codigo: 'CXANMH' },
  ],
  alumnos: [
    { entrenador_id: 'u-jerry', alumno_id: 'u-mike' },
    { entrenador_id: 'u-jerry', alumno_id: 'u-jessi' },
  ],
  ejercicios: [
    { id: 'prensa', nombre: 'Prensa', musculo: 'Cuádriceps y glúteo', tipo: 'pierna', grupos: [], patron: '', equipo: ['maquina'], unilateral: false, tecnica: 'Baja controlado.', dibujo: 'prensa', creador_id: null },
    { id: 'extensiones', nombre: 'Extensiones', musculo: 'Cuádriceps', tipo: 'pierna', grupos: [], patron: '', equipo: ['maquina'], unilateral: false, tecnica: 'Sube sin impulso.', dibujo: 'extensiones', creador_id: null },
  ],
  rutinas: [
    { id: 'r-jerry', nombre: 'Octubre', creada: hace(10), creador_id: 'u-jerry', por_defecto: false,
      notas: `Descansa 60 s entre series.\n${TRAMPA}` },
  ],
  rutina_dias: [{ id: 'd1', rutina_id: 'r-jerry', dia: 1, nombre: 'Pierna', tono: '#ff6b35' }],
  rutina_ejercicios: [
    { id: 're1', dia_id: 'd1', bloque: 1, orden: 1, ejercicio_id: 'prensa', series: [15, 12, 10, 8], nota: `Baja lento, 3 segundos ${TRAMPA}` },
    { id: 're2', dia_id: 'd1', bloque: 2, orden: 1, ejercicio_id: 'extensiones', series: [12, 10], nota: null },
  ],
  rutinas_usuario: [
    { user_id: 'u-mike', rutina_id: 'r-jerry', activa: true, agregada_at: hace(10) },
    { user_id: 'u-jessi', rutina_id: 'r-jerry', activa: true, agregada_at: hace(10) },
  ],
  sesiones: [
    { id: 's1', user_id: 'u-mike', rutina_id: 'r-jerry', dia: 1, fecha: hace(8), cardio_hecho: false, finalizada_at: null, created_at: hace(8), notas: null },
    { id: 's2', user_id: 'u-mike', rutina_id: 'r-jerry', dia: 1, fecha: hace(1), cardio_hecho: false, finalizada_at: null, created_at: hace(1), notas: `Me molestó el hombro ${TRAMPA}` },
  ],
  series_log: [
    { id: 'l1', user_id: 'u-mike', sesion_id: 's1', ejercicio_slug: 'prensa', serie: 1, peso: 80, reps: 15, hecho: true },
    { id: 'l2', user_id: 'u-mike', sesion_id: 's2', ejercicio_slug: 'prensa', serie: 1, peso: 90, reps: 15, hecho: true },
  ],
};

// Las funciones de administración, contestando con los datos de arriba
export const RPC = {
  admin_personas: (_, t) => ({
    data: t.profiles.map((p) => ({
      ...p, email: `${p.id}@ejemplo.test`,
      entrenadores: t.alumnos.filter((a) => a.alumno_id === p.id)
        .map((a) => t.profiles.find((x) => x.id === a.entrenador_id)?.nombre).join(', ') || null,
      entrenador_ids: t.alumnos.filter((a) => a.alumno_id === p.id).map((a) => a.entrenador_id),
      alumnos: t.alumnos.filter((a) => a.entrenador_id === p.id).length,
      entrenamientos: t.sesiones.filter((s) => s.user_id === p.id).length,
      ultima: null, creada: hace(20), bloqueada: false,
    })),
    error: null,
  }),
  admin_invitaciones: () => ({ data: [], error: null }),
  admin_bitacora: () => ({ data: [], error: null }),
};
