-- Administración, 21 sep 2026
--
-- Un administrador (Mike) controla desde la app quién es entrenador,
-- quién entrena a quién, qué cuentas están bloqueadas y las invitaciones.
-- Todo pasa por funciones que primero comprueban que quien llama es
-- admin; la columna es_admin no se puede tocar desde la app.

alter table public.profiles add column es_admin boolean not null default false;
update public.profiles set es_admin = true
 where id = (select u.id from auth.users u where u.email = 'dackerjasso@gmail.com');

-- Bitácora de lo que hace el admin
create table privado.bitacora (
  id        bigserial primary key,
  admin_id  uuid not null,
  accion    text not null,
  detalle   jsonb not null default '{}',
  at        timestamptz not null default now()
);
alter table privado.bitacora enable row level security;
revoke all on privado.bitacora from public, anon, authenticated;

create function privado.exigir_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.es_admin) then
    raise exception 'no_autorizado';
  end if;
end $$;

create function privado.anotar(p_accion text, p_detalle jsonb) returns void
language sql security definer set search_path = '' as $$
  insert into privado.bitacora (admin_id, accion, detalle) values ((select auth.uid()), p_accion, p_detalle);
$$;

revoke execute on function privado.exigir_admin() from public, anon;
revoke execute on function privado.anotar(text, jsonb) from public, anon;
grant execute on function privado.exigir_admin() to authenticated;

-- ---------- Personas ----------
create function public.admin_personas()
returns table (id uuid, nombre text, email text, es_entrenador boolean, es_admin boolean,
               codigo text, entrenadores text, entrenador_ids uuid[], alumnos int,
               entrenamientos int, ultima date, creada date, bloqueada boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  return query
  select p.id, p.nombre, u.email::text, p.es_entrenador, p.es_admin, p.codigo,
         (select string_agg(e.nombre, ', ' order by e.nombre)
            from public.alumnos a join public.profiles e on e.id = a.entrenador_id
           where a.alumno_id = p.id),
         (select coalesce(array_agg(a.entrenador_id), '{}') from public.alumnos a where a.alumno_id = p.id),
         (select count(*)::int from public.alumnos a where a.entrenador_id = p.id),
         (select count(*)::int from public.sesiones s where s.user_id = p.id),
         (select max(s.fecha) from public.sesiones s where s.user_id = p.id),
         u.created_at::date,
         coalesce(u.banned_until > now(), false)
    from public.profiles p join auth.users u on u.id = p.id
   order by p.nombre;
end $$;

-- Hacer o quitar entrenador. Al quitarlo se sueltan sus alumnos (los
-- permisos de lectura dependen del vínculo) y su código deja de valer.
create function public.admin_hacer_entrenador(p_usuario uuid, p_si boolean)
returns text language plpgsql security definer set search_path = '' as $$
declare c text; sueltos int := 0;
begin
  perform privado.exigir_admin();
  if not exists (select 1 from public.profiles p where p.id = p_usuario) then raise exception 'no_existe'; end if;
  if p_si then
    select p.codigo into c from public.profiles p where p.id = p_usuario;
    if c is null then c := public.generar_codigo(); end if;
    update public.profiles set es_entrenador = true, codigo = c where id = p_usuario;
  else
    delete from public.alumnos a where a.entrenador_id = p_usuario;
    get diagnostics sueltos = row_count;
    update public.profiles set es_entrenador = false, codigo = null where id = p_usuario;
  end if;
  perform privado.anotar(case when p_si then 'hacer_entrenador' else 'quitar_entrenador' end,
                         jsonb_build_object('usuario', p_usuario, 'alumnos_soltados', sueltos));
  return c;
end $$;

create function public.admin_nuevo_codigo(p_entrenador uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  perform privado.exigir_admin();
  if not exists (select 1 from public.profiles p where p.id = p_entrenador and p.es_entrenador) then
    raise exception 'no_es_entrenador';
  end if;
  c := public.generar_codigo();
  update public.profiles set codigo = c where id = p_entrenador;
  perform privado.anotar('nuevo_codigo', jsonb_build_object('entrenador', p_entrenador));
  return c;
end $$;

create function public.admin_ligar(p_entrenador uuid, p_alumno uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  if not exists (select 1 from public.profiles p where p.id = p_entrenador and p.es_entrenador) then
    raise exception 'no_es_entrenador';
  end if;
  if p_entrenador = p_alumno then raise exception 'mismo_usuario'; end if;
  if not exists (select 1 from public.profiles p where p.id = p_alumno) then raise exception 'no_existe'; end if;
  insert into public.alumnos (entrenador_id, alumno_id) values (p_entrenador, p_alumno)
  on conflict (entrenador_id, alumno_id) do nothing;
  perform privado.anotar('ligar', jsonb_build_object('entrenador', p_entrenador, 'alumno', p_alumno));
end $$;

create function public.admin_soltar(p_entrenador uuid, p_alumno uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  delete from public.alumnos a where a.entrenador_id = p_entrenador and a.alumno_id = p_alumno;
  perform privado.anotar('soltar', jsonb_build_object('entrenador', p_entrenador, 'alumno', p_alumno));
end $$;

-- Bloquear: no puede entrar y se cierran sus sesiones abiertas.
create function public.admin_bloquear(p_usuario uuid, p_si boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  if p_usuario = (select auth.uid()) then raise exception 'no_a_ti_mismo'; end if;
  if exists (select 1 from public.profiles p where p.id = p_usuario and p.es_admin) then
    raise exception 'es_admin';
  end if;
  update auth.users set banned_until = case when p_si then 'infinity'::timestamptz else null end
   where id = p_usuario;
  if not found then raise exception 'no_existe'; end if;
  if p_si then delete from auth.sessions s where s.user_id = p_usuario; end if;
  perform privado.anotar(case when p_si then 'bloquear' else 'desbloquear' end,
                         jsonb_build_object('usuario', p_usuario));
end $$;

-- ---------- Invitaciones ----------
create function public.admin_invitaciones()
returns table (codigo text, usos int, vence timestamptz, nota text, creada_at timestamptz, vigente boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  return query
  select v.codigo, v.usos, v.vence, v.nota, v.creada_at,
         v.usos > 0 and (v.vence is null or v.vence > now())
    from privado.invitaciones v
   order by v.creada_at desc
   limit 50;
end $$;

create function public.admin_crear_invitacion(p_usos int, p_dias int, p_nota text)
returns text language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  perform privado.exigir_admin();
  if p_usos not between 1 and 50 then raise exception 'usos_fuera_de_rango'; end if;
  if p_dias not between 1 and 365 then raise exception 'dias_fuera_de_rango'; end if;
  c := privado.nueva_invitacion(p_usos, p_dias, left(nullif(btrim(p_nota), ''), 120));
  perform privado.anotar('crear_invitacion', jsonb_build_object('codigo', c, 'usos', p_usos, 'dias', p_dias));
  return c;
end $$;

create function public.admin_anular_invitacion(p_codigo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  update privado.invitaciones set usos = 0 where codigo = p_codigo;
  perform privado.anotar('anular_invitacion', jsonb_build_object('codigo', p_codigo));
end $$;

-- ---------- Bitácora ----------
create function public.admin_bitacora()
returns table (accion text, detalle jsonb, at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform privado.exigir_admin();
  return query select b.accion, b.detalle, b.at from privado.bitacora b order by b.at desc limit 40;
end $$;

-- Sólo usuarios con sesión pueden llamarlas; dentro, sólo el admin pasa.
do $$
declare f text;
begin
  foreach f in array array[
    'admin_personas()', 'admin_hacer_entrenador(uuid, boolean)', 'admin_nuevo_codigo(uuid)',
    'admin_ligar(uuid, uuid)', 'admin_soltar(uuid, uuid)', 'admin_bloquear(uuid, boolean)',
    'admin_invitaciones()', 'admin_crear_invitacion(int, int, text)',
    'admin_anular_invitacion(text)', 'admin_bitacora()']
  loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
