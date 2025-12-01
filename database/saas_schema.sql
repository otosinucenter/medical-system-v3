-- 1. Crear tabla de Consultorios (Clinics)
create table clinics (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Crear tabla de Perfiles (Profiles) - Vincula Usuario con Consultorio
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  clinic_id uuid references clinics(id) on delete cascade,
  role text default 'doctor', -- 'doctor' o 'assistant'
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Actualizar tabla Pacientes (Agregar columna clinic_id)
alter table patients add column clinic_id uuid references clinics(id);

-- 4. Activar seguridad (RLS) en nuevas tablas
alter table clinics enable row level security;
alter table profiles enable row level security;

-- 5. Políticas de Seguridad (Permisos)

-- Perfiles: Ver y editar mi propio perfil
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Consultorios: Ver mi consultorio
create policy "Users can view own clinic" on clinics
  for select using (
    id in (select clinic_id from profiles where id = auth.uid())
  );

-- Consultorios: Crear consultorio (al registrarse)
create policy "Users can create clinics" on clinics
  for insert with check (true);

-- 6. ACTUALIZAR POLÍTICAS DE PACIENTES (El cambio clave)
-- Borrar políticas antiguas (personales)
drop policy if exists "Users can view their own patients" on patients;
drop policy if exists "Users can insert their own patients" on patients;
drop policy if exists "Users can update their own patients" on patients;
drop policy if exists "Users can delete their own patients" on patients;

-- Nuevas Políticas: Acceso por Consultorio (Equipo)
create policy "Clinic members can view patients" on patients
  for select using (
    clinic_id in (select clinic_id from profiles where id = auth.uid())
  );

create policy "Clinic members can insert patients" on patients
  for insert with check (
    clinic_id in (select clinic_id from profiles where id = auth.uid())
  );

create policy "Clinic members can update patients" on patients
  for update using (
    clinic_id in (select clinic_id from profiles where id = auth.uid())
  );

create policy "Clinic members can delete patients" on patients
  for delete using (
    clinic_id in (select clinic_id from profiles where id = auth.uid())
  );
