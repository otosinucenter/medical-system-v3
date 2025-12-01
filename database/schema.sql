-- Create the patients table
create table patients (
  id text primary key, -- DNI or unique ID
  nombre text,
  edad text,
  sexo text,
  ocupacion text,
  procedencia text,
  celular text,
  email text,
  "fechaNacimiento" text, -- Quotes for camelCase if needed, or stick to snake_case. Let's use quotes to match JSON keys for simplicity or map them.
  -- Actually, better to use standard snake_case in DB and map in JS, but for speed we can match keys or use JSONB.
  -- Let's use a JSONB column for the entire patient object to avoid schema rigidity and migration issues, 
  -- since the app uses a complex nested structure (consultas, receta, etc).
  data jsonb,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table patients enable row level security;

-- Create policies
create policy "Users can view their own patients" on patients
  for select using (auth.uid() = user_id);

create policy "Users can insert their own patients" on patients
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own patients" on patients
  for update using (auth.uid() = user_id);

create policy "Users can delete their own patients" on patients
  for delete using (auth.uid() = user_id);
