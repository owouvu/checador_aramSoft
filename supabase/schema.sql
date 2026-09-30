-- Esquema para la Smart Display (checador_aramSoft).
-- Ejecutar en el SQL editor de tu proyecto Supabase.

create extension if not exists pgcrypto;

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  device_group text not null default 'default',
  title text not null,
  body text,
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  device_group text not null default 'default',
  kind text not null check (kind in ('image', 'video')),
  url text not null,
  duration_seconds int,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  device_group text not null default 'default',
  label text not null,
  value numeric not null,
  unit text,
  trend text check (trend in ('up', 'down', 'flat')),
  updated_at timestamptz not null default now()
);

-- Identidad real de cada empleado. El PIN nunca se guarda en texto plano ni
-- se expone al cliente: se verifica del lado del servidor con la función
-- verify_employee_pin de abajo (security definer), la única forma permitida
-- de leer esta tabla con la anon key.
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  device_group text not null default 'default',
  name text not null,
  pin_hash text not null,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists attendance_events (
  id uuid primary key default gen_random_uuid(),
  -- Orden de inserción confiable para saber "el último evento": occurred_at
  -- puede empatar entre filas insertadas en la misma transacción (now() es
  -- constante dentro de ella), lo que rompería la validación de secuencia.
  seq bigserial,
  device_group text not null default 'default',
  employee_id uuid not null references employees(id),
  employee_name text not null,
  employee_photo_url text,
  event_type text not null check (
    event_type in ('entrada', 'inicio_descanso', 'fin_descanso', 'salida')
  ),
  occurred_at timestamptz not null default now()
);

-- Realtime: habilita cambios en vivo (los empleados NO se exponen por
-- Realtime/API directa; solo se accede a su identidad vía la función RPC).
alter publication supabase_realtime add table
  announcements, media_items, dashboard_widgets, attendance_events;

alter table announcements enable row level security;
alter table media_items enable row level security;
alter table dashboard_widgets enable row level security;
alter table attendance_events enable row level security;
alter table employees enable row level security;
-- Sin policies para "employees": ni select ni insert/update quedan
-- accesibles con la anon key. Solo se administra desde el SQL editor
-- (o con la service_role key) y se consulta vía verify_employee_pin.

create policy "Lectura pública de avisos" on announcements
  for select using (true);
create policy "Lectura pública de media" on media_items
  for select using (true);
create policy "Lectura pública de dashboard" on dashboard_widgets
  for select using (true);
create policy "Lectura pública de checadas" on attendance_events
  for select using (true);

-- La app móvil (checador/checador) inserta cada checada tras validar la
-- biometría local del propio celular; no hay credenciales que proteger
-- porque nunca se transmite el dato biométrico, solo el resultado.
create policy "Registrar checada" on attendance_events
  for insert with check (true);

-- Empareja un teléfono con un empleado real: recibe el PIN que el
-- empleado capturó y devuelve su identidad SOLO si el hash coincide.
-- security definer + search_path fijo para que pueda leer "employees"
-- aunque esa tabla no tenga policies para el rol anon.
create or replace function verify_employee_pin(p_device_group text, p_pin text)
returns table(employee_id uuid, employee_name text, employee_photo_url text)
language plpgsql
security definer
-- pgcrypto (crypt/gen_salt) vive en el esquema "extensions" en Supabase,
-- así que debe estar en el search_path para que security definer lo vea.
set search_path = public, extensions
as $$
begin
  return query
    select e.id, e.name, e.photo_url
    from employees e
    where e.device_group = p_device_group
      and e.active
      and e.pin_hash = crypt(p_pin, e.pin_hash)
    limit 1;
end;
$$;

revoke all on function verify_employee_pin(text, text) from public;
grant execute on function verify_employee_pin(text, text) to anon, authenticated;

-- Obliga la secuencia entrada -> (inicio_descanso -> fin_descanso)* -> salida
-- -> entrada -> ... por empleado (employee_id, no por nombre: dos empleados
-- podrían llamarse igual). "entrada" solo significa inicio de turno;
-- "fin_descanso" es el regreso del descanso — son botones distintos para
-- evitar la ambigüedad de reusar "entrada" con dos significados. Se valida
-- aquí también (y no solo en la app) porque la policy de insert es abierta:
-- cualquier cliente con la anon key podría insertar filas.
create or replace function enforce_attendance_transition()
returns trigger as $$
declare
  last_type text;
begin
  select event_type into last_type
  from attendance_events
  where employee_id = new.employee_id
    and device_group = new.device_group
  order by seq desc
  limit 1;

  if last_type is null and new.event_type <> 'entrada' then
    raise exception 'Debes registrar tu entrada antes de %', new.event_type;
  elsif last_type = 'entrada' and new.event_type not in ('inicio_descanso', 'salida') then
    raise exception 'Después de entrada solo puedes registrar inicio de descanso o salida';
  elsif last_type = 'inicio_descanso' and new.event_type <> 'fin_descanso' then
    raise exception 'Debes registrar el fin de tu descanso antes de %', new.event_type;
  elsif last_type = 'fin_descanso' and new.event_type not in ('inicio_descanso', 'salida') then
    raise exception 'Después de tu descanso solo puedes registrar otro descanso o salida';
  elsif last_type = 'salida' and new.event_type <> 'entrada' then
    raise exception 'Debes registrar tu entrada para iniciar un nuevo turno';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists attendance_transition_guard on attendance_events;
create trigger attendance_transition_guard
  before insert on attendance_events
  for each row execute function enforce_attendance_transition();

-- Ejemplo para dar de alta a un empleado con PIN "1234" (ejecutar aparte,
-- una vez por empleado, cambiando nombre y PIN):
-- insert into employees (device_group, name, pin_hash)
--   values ('default', 'Nombre Apellido', crypt('1234', gen_salt('bf')));
