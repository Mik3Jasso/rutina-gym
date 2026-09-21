-- Pruebas de permisos de la base (RLS, funciones de admin, invitaciones).
--
-- Se hace pasar por cada persona real (Mike, Jessica, Jerry), intenta
-- ataques y usos normales, y al final DESHACE TODO (rollback): no deja
-- nada en la base. Correr entero en el SQL Editor de Supabase (o con
-- psql); cada fila dice si el resultado fue el esperado.
--
-- Supone: Mike es admin, Jerry es entrenador de Mike y de Jessica.

begin;

create temp table ids on commit drop as select nombre, id from public.profiles;
create temp table res (n serial, caso text, espera text, obtuvo text) on commit drop;
grant select on ids to authenticated;
grant all on res to authenticated;
grant usage on sequence res_n_seq to authenticated;

-- Datos de prueba que sólo existen dentro de esta transacción
insert into public.rutinas (id, nombre, notas, creador_id) values
  ('prueba-privada-mike', 'Privada', 'secreto', (select id from ids where nombre = 'Mike')),
  ('prueba-de-jerry', 'De Jerry', 'para sus alumnos', (select id from ids where nombre = 'Jerry'));
insert into public.rutina_dias (id, rutina_id, dia, nombre) values
  ('00000000-0000-0000-0000-0000000000d1', 'prueba-de-jerry', 1, 'Pierna');
insert into public.rutinas_usuario (user_id, rutina_id, activa) values
  ((select id from ids where nombre = 'Mike'), 'prueba-de-jerry', false);
insert into public.sesiones (id, user_id, rutina_id, dia, fecha, notas) values
  ('00000000-0000-0000-0000-00000000aaaa', (select id from ids where nombre = 'Mike'),
   'prueba-de-jerry', 1, '2000-01-01', 'comentario de prueba');

-- probar(quien, caso, 'PERMITIDO' | 'bloqueado', sql)
create function pg_temp.probar(quien text, caso text, espera text, sql text) returns void
language plpgsql as $f$
declare filas int;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', (select id from ids where nombre = quien), 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    execute sql;
    get diagnostics filas = row_count;
    -- un select/update/delete que no toca nada también cuenta como bloqueado
    insert into res (caso, espera, obtuvo) values (caso, espera, case when filas > 0 then 'PERMITIDO' else 'bloqueado' end);
  exception when others then
    insert into res (caso, espera, obtuvo) values (caso, espera, 'bloqueado');
  end;
  execute 'reset role';
end $f$;

-- ---------- rutinas y catálogo ----------
select pg_temp.probar('Jessica Jasso', 'colarse una rutina ajena al catálogo', 'bloqueado',
  $$insert into rutinas_usuario (user_id, rutina_id, activa) values (auth.uid(), 'prueba-privada-mike', false)$$);
select pg_temp.probar('Jessica Jasso', 'cambiar el rutina_id de su catálogo', 'bloqueado',
  $$update rutinas_usuario set rutina_id = 'prueba-privada-mike' where user_id = auth.uid()$$);
select pg_temp.probar('Jessica Jasso', 'leer una rutina privada ajena', 'bloqueado',
  $$select 1 from rutinas where id = 'prueba-privada-mike'$$);
select pg_temp.probar('Mike', 'crear una rutina "por defecto" para todos', 'bloqueado',
  $$insert into rutinas (id, nombre, creador_id, por_defecto) values ('prueba-x', 'x', auth.uid(), true)$$);
select pg_temp.probar('Jerry', 'asignar a su alumno una rutina ajena', 'bloqueado',
  $$insert into rutinas_usuario (user_id, rutina_id, activa) values ((select id from ids where nombre = 'Jessica Jasso'), 'prueba-privada-mike', false)$$);
select pg_temp.probar('Jessica Jasso', 'asignar rutinas a quien no entrena', 'bloqueado',
  $$insert into rutinas_usuario (user_id, rutina_id, activa) values ((select id from ids where nombre = 'Mike'), 'entrenador-2026-08', false)$$);
select pg_temp.probar('Jerry', 'asignar su rutina a su alumna', 'PERMITIDO',
  $$insert into rutinas_usuario (user_id, rutina_id, activa) values ((select id from ids where nombre = 'Jessica Jasso'), 'prueba-de-jerry', false)$$);
select pg_temp.probar('Mike', 'ver la rutina que le asignaron', 'PERMITIDO',
  $$select 1 from rutinas where id = 'prueba-de-jerry'$$);
select pg_temp.probar('Mike', 'marcar cuál rutina está activa', 'PERMITIDO',
  $$update rutinas_usuario set activa = (rutina_id = 'prueba-de-jerry') where user_id = auth.uid()$$);
select pg_temp.probar('Mike', 'editar la rutina de Jerry', 'bloqueado',
  $$update rutinas set notas = 'hackeado' where id = 'prueba-de-jerry'$$);

-- ---------- notas por ejercicio ----------
select pg_temp.probar('Jerry', 'poner nota a un ejercicio de su rutina', 'PERMITIDO',
  $$insert into rutina_ejercicios (dia_id, bloque, orden, ejercicio_id, series, nota)
    values ('00000000-0000-0000-0000-0000000000d1', 1, 1, 'prensa', '{15,12}', 'Baja lento')$$);
select pg_temp.probar('Jerry', 'nota de ejercicio de más de 300 letras', 'bloqueado',
  $$insert into rutina_ejercicios (dia_id, bloque, orden, ejercicio_id, series, nota)
    values ('00000000-0000-0000-0000-0000000000d1', 2, 1, 'prensa', '{15}', repeat('x', 301))$$);
select pg_temp.probar('Mike', 'meter ejercicios en la rutina de Jerry', 'bloqueado',
  $$insert into rutina_ejercicios (dia_id, bloque, orden, ejercicio_id, series)
    values ('00000000-0000-0000-0000-0000000000d1', 3, 1, 'prensa', '{15}')$$);

-- ---------- entrenamientos y comentarios ----------
select pg_temp.probar('Jerry', 'leer el comentario de su alumno', 'PERMITIDO',
  $$select 1 from sesiones where id = '00000000-0000-0000-0000-00000000aaaa' and notas is not null$$);
select pg_temp.probar('Jessica Jasso', 'leer el comentario de otra persona', 'bloqueado',
  $$select 1 from sesiones where id = '00000000-0000-0000-0000-00000000aaaa'$$);
select pg_temp.probar('Jerry', 'cambiar el comentario de su alumno', 'bloqueado',
  $$update sesiones set notas = 'x' where id = '00000000-0000-0000-0000-00000000aaaa'$$);
select pg_temp.probar('Mike', 'escribir su comentario', 'PERMITIDO',
  $$update sesiones set notas = 'Me molestó el hombro' where id = '00000000-0000-0000-0000-00000000aaaa'$$);
select pg_temp.probar('Mike', 'comentario de más de 1000 letras', 'bloqueado',
  $$update sesiones set notas = repeat('x', 1001) where id = '00000000-0000-0000-0000-00000000aaaa'$$);
select pg_temp.probar('Jessica Jasso', 'entrenar sobre una rutina ajena', 'bloqueado',
  $$insert into sesiones (user_id, rutina_id, dia, fecha) values (auth.uid(), 'prueba-privada-mike', 1, '2000-01-02')$$);
select pg_temp.probar('Jessica Jasso', 'guardar series en la sesión de otro', 'bloqueado',
  $$insert into series_log (user_id, sesion_id, ejercicio_slug, serie, peso, reps, hecho)
    values (auth.uid(), '00000000-0000-0000-0000-00000000aaaa', 'prensa', 9, 1, 1, true)$$);
select pg_temp.probar('Mike', 'guardar series en su sesión', 'PERMITIDO',
  $$insert into series_log (user_id, sesion_id, ejercicio_slug, serie, peso, reps, hecho)
    values (auth.uid(), '00000000-0000-0000-0000-00000000aaaa', 'prensa', 1, 80, 12, true)$$);
select pg_temp.probar('Mike', 'entrenar el día 7', 'PERMITIDO',
  $$insert into sesiones (user_id, rutina_id, dia, fecha) values (auth.uid(), 'prueba-de-jerry', 7, '2000-01-03')$$);
select pg_temp.probar('Mike', 'entrenar un día 8', 'bloqueado',
  $$insert into sesiones (user_id, rutina_id, dia, fecha) values (auth.uid(), 'prueba-de-jerry', 8, '2000-01-04')$$);

-- ---------- perfiles ----------
select pg_temp.probar('Jessica Jasso', 'hacerse entrenadora a sí misma', 'bloqueado',
  $$update profiles set es_entrenador = true where id = auth.uid()$$);
select pg_temp.probar('Jessica Jasso', 'hacerse admin a sí misma', 'bloqueado',
  $$update profiles set es_admin = true where id = auth.uid()$$);
select pg_temp.probar('Jessica Jasso', 'nombre de 200 mil letras', 'bloqueado',
  $$update profiles set nombre = repeat('x', 200000) where id = auth.uid()$$);
select pg_temp.probar('Jessica Jasso', 'cambiar su propio nombre', 'PERMITIDO',
  $$update profiles set nombre = 'Jessica J' where id = auth.uid()$$);
select pg_temp.probar('Jessica Jasso', 'leer el perfil de alguien que no la entrena', 'bloqueado',
  $$select 1 from profiles where id = (select id from ids where nombre = 'Mike')$$);

-- ---------- administración ----------
select pg_temp.probar('Jessica Jasso', 'ver la lista de personas del admin', 'bloqueado',
  $$select * from admin_personas()$$);
select pg_temp.probar('Jerry', 'un entrenador usa funciones de admin', 'bloqueado',
  $$select admin_hacer_entrenador((select id from ids where nombre = 'Jessica Jasso'), true)$$);
select pg_temp.probar('Jessica Jasso', 'crear invitaciones sin ser admin', 'bloqueado',
  $$select admin_crear_invitacion(50, 365, 'x')$$);
select pg_temp.probar('Jessica Jasso', 'leer las invitaciones directo', 'bloqueado',
  $$select * from privado.invitaciones$$);
select pg_temp.probar('Mike', 'el admin ve a todas las personas', 'PERMITIDO',
  $$select * from admin_personas()$$);
select pg_temp.probar('Mike', 'el admin crea una invitación', 'PERMITIDO',
  $$select admin_crear_invitacion(1, 1, 'prueba')$$);
select pg_temp.probar('Mike', 'el admin se bloquea a sí mismo', 'bloqueado',
  $$select admin_bloquear(auth.uid(), true)$$);

-- ---------- registro por invitación (como lo hace Supabase al crear cuenta) ----------
create function pg_temp.alta(caso text, espera text, meta jsonb) returns void language plpgsql as $f$
begin
  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    values (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'prueba-' || gen_random_uuid() || '@ejemplo.test', meta, '{"provider":"email"}', now(), now());
    insert into res (caso, espera, obtuvo) values (caso, espera, 'PERMITIDO');
  exception when others then
    insert into res (caso, espera, obtuvo) values (caso, espera, 'bloqueado');
  end;
end $f$;
select pg_temp.alta('crear cuenta sin código', 'bloqueado', '{"nombre":"A"}');
select pg_temp.alta('crear cuenta con código inventado', 'bloqueado', '{"nombre":"B","codigo":"ZZZZZZ"}');
select pg_temp.alta('crear cuenta con el código de Jerry', 'PERMITIDO',
  jsonb_build_object('nombre', 'C', 'codigo', (select codigo from public.profiles where nombre = 'Jerry')));

-- ---------- resultado ----------
select n, case when espera = obtuvo then 'ok' else 'FALLA' end as resultado, caso, espera, obtuvo
  from res
 order by (espera = obtuvo), n;

rollback;
