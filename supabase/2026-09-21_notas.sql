-- Notas por ejercicio y comentario del alumno, 21 sep 2026

-- Nota del entrenador en cada ejercicio de una rutina ("baja lento, 3 segundos")
alter table public.rutina_ejercicios
  add column nota text check (nota is null or char_length(nota) <= 300);

-- Comentario del alumno al entrenar; lo lee su entrenador (la política
-- "sesiones: las de mis alumnos" ya lo permite)
alter table public.sesiones
  add constraint sesiones_notas_largo check (notas is null or char_length(notas) <= 1000);
