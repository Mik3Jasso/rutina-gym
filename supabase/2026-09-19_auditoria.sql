-- Auditoría de seguridad, 19 sep 2026

-- Qué rutinas se pueden poner en un catálogo: las del sistema o las
-- propias. Es una función aparte porque las políticas de rutinas y
-- de rutinas_usuario se consultan entre sí y harían un ciclo.
create function public.rutina_asignable(p_rutina text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rutinas r
                 where r.id = p_rutina
                   and (r.por_defecto or r.creador_id = (select auth.uid())));
$$;
revoke execute on function public.rutina_asignable(text) from public, anon;
grant execute on function public.rutina_asignable(text) to authenticated;

-- 1. Nadie mete en su catálogo una rutina ajena: sólo las del sistema
--    o las propias. Así "ver las rutinas de mi catálogo" deja de ser
--    una puerta para leer rutinas privadas de otros.
alter policy "catalogo propio: agregar" on public.rutinas_usuario
  with check (
    user_id = (select auth.uid()) and public.rutina_asignable(rutina_id)
  );

-- 2. El entrenador asigna a sus alumnos sólo rutinas suyas o del sistema
alter policy "catalogo: mi entrenador me asigna" on public.rutinas_usuario
  with check (
    exists (select 1 from public.alumnos a
            where a.alumno_id = user_id and a.entrenador_id = (select auth.uid()))
    and public.rutina_asignable(rutina_id)
  );

-- 3. En el catálogo sólo se cambia cuál está activa; cambiar el
--    rutina_id era otra forma de colarse una rutina ajena.
revoke update on public.rutinas_usuario from anon, authenticated;
grant update (activa) on public.rutinas_usuario to authenticated;

-- 4. Un entrenamiento sólo se registra sobre una rutina que uno puede ver
--    (si no, cualquiera bloqueaba el borrado de una rutina ajena).
alter policy "sesiones propias: crear" on public.sesiones
  with check (user_id = (select auth.uid())
              and exists (select 1 from public.rutinas r where r.id = rutina_id));
alter policy "sesiones propias: actualizar" on public.sesiones
  with check (user_id = (select auth.uid())
              and exists (select 1 from public.rutinas r where r.id = rutina_id));

-- 5. Las series van en una sesión propia
alter policy "series propias: crear" on public.series_log
  with check (user_id = (select auth.uid())
              and exists (select 1 from public.sesiones s
                          where s.id = sesion_id and s.user_id = (select auth.uid())));
alter policy "series propias: actualizar" on public.series_log
  with check (user_id = (select auth.uid())
              and exists (select 1 from public.sesiones s
                          where s.id = sesion_id and s.user_id = (select auth.uid())));

-- 6. Largos razonables para el texto que otros ven
alter table public.profiles
  add constraint profiles_nombre_largo check (char_length(nombre) between 1 and 60);
alter table public.rutinas
  add constraint rutinas_nombre_largo check (char_length(nombre) between 1 and 80);
alter table public.rutina_dias
  add constraint rutina_dias_nombre_largo check (nombre is null or char_length(nombre) <= 60);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nombre)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data->>'nombre'), ''),
                  split_part(new.email, '@', 1)), 60)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 7. Hasta siete días por rutina (antes el registro se atoraba en 5
--    aunque el constructor dejaba agregar más)
alter table public.sesiones drop constraint sesiones_dia_check;
alter table public.sesiones add constraint sesiones_dia_check check (dia between 1 and 7);
alter table public.rutina_dias add constraint rutina_dias_dia_check check (dia between 1 and 7);

-- 8. (aplicado después) La función sólo la usan las políticas: fuera
--    del esquema public para que la API no la exponga como RPC.
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;
alter function public.rutina_asignable(text) set schema privado;
