-- Registro sólo por invitación, 19 sep 2026
--
-- Para crear una cuenta hace falta un código:
--   * el de un entrenador (profiles.codigo): la persona queda como su alumno;
--   * o una invitación suelta (tabla privado.invitaciones), con usos y vencimiento.
-- La base rechaza cualquier alta sin código válido, aunque alguien se salte la app.

create table privado.invitaciones (
  codigo      text primary key check (codigo ~ '^[A-Z2-9]{8}$'),
  usos        int  not null default 1 check (usos >= 0),
  vence       timestamptz,
  nota        text,
  creada_at   timestamptz not null default now()
);
-- Sólo el administrador la toca (desde SQL); nadie la ve desde la app.
alter table privado.invitaciones enable row level security;
revoke all on privado.invitaciones from public, anon, authenticated;

-- Genera una invitación de 8 caracteres (los entrenadores tienen 6: no chocan)
create function privado.nueva_invitacion(p_usos int default 1, p_dias int default 30, p_nota text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text; i int;
begin
  loop
    c := '';
    for i in 1..8 loop
      c := c || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from privado.invitaciones v where v.codigo = c);
  end loop;
  insert into privado.invitaciones (codigo, usos, vence, nota)
  values (c, p_usos, now() + make_interval(days => p_dias), p_nota);
  return c;
end $$;
revoke execute on function privado.nueva_invitacion(int, int, text) from public, anon, authenticated;

-- Antes de crear la cuenta: el código tiene que valer. Si es una
-- invitación suelta, se gasta un uso en la misma operación.
create function privado.exigir_invitacion()
returns trigger language plpgsql security definer set search_path = '' as $$
declare c text := upper(btrim(coalesce(new.raw_user_meta_data->>'codigo', '')));
begin
  if c = '' then
    raise exception 'invitacion_requerida';
  end if;
  if exists (select 1 from public.profiles p where p.codigo = c and p.es_entrenador) then
    return new;
  end if;
  update privado.invitaciones v set usos = v.usos - 1
   where v.codigo = c and v.usos > 0 and (v.vence is null or v.vence > now());
  if not found then
    raise exception 'invitacion_invalida';
  end if;
  return new;
end $$;
revoke execute on function privado.exigir_invitacion() from public, anon, authenticated;

create trigger on_auth_user_invitacion
  before insert on auth.users
  for each row execute function privado.exigir_invitacion();

-- Al crearse el perfil, si entró con el código de un entrenador,
-- queda de una vez como su alumno.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  c text := upper(btrim(coalesce(new.raw_user_meta_data->>'codigo', '')));
  e uuid;
begin
  insert into public.profiles (id, nombre)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data->>'nombre'), ''),
                  split_part(new.email, '@', 1)), 60)
  )
  on conflict (id) do nothing;

  select p.id into e from public.profiles p where p.codigo = c and p.es_entrenador;
  if e is not null and e <> new.id then
    insert into public.alumnos (entrenador_id, alumno_id)
    values (e, new.id)
    on conflict (entrenador_id, alumno_id) do nothing;
  end if;
  return new;
end;
$$;
