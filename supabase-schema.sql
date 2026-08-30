-- FlowDesk database schema for Supabase
-- Run this in the Supabase SQL editor on a fresh project.
-- Mirrors the shapes used in src/types/index.ts and src/lib/db.ts.

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_color text not null default '#3454D1',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by any authenticated user"
  on profiles for select using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- projects ----------
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  owner_id uuid not null references profiles(id) on delete cascade,
  color text not null default '#3454D1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

-- ---------- team_memberships ----------
create table team_memberships (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

alter table team_memberships enable row level security;

-- Projects are visible to their members
create policy "Members can view their projects"
  on projects for select using (
    exists (select 1 from team_memberships m where m.project_id = id and m.profile_id = auth.uid())
  );

create policy "Owners can insert projects"
  on projects for insert with check (owner_id = auth.uid());

create policy "Owners and admins can update projects"
  on projects for update using (
    exists (select 1 from team_memberships m where m.project_id = id and m.profile_id = auth.uid() and m.role in ('owner', 'admin'))
  );

create policy "Owners can delete projects"
  on projects for delete using (owner_id = auth.uid());

create policy "Members can view project memberships"
  on team_memberships for select using (
    exists (select 1 from team_memberships m2 where m2.project_id = project_id and m2.profile_id = auth.uid())
  );

create policy "Owners and admins can manage memberships"
  on team_memberships for insert with check (
    exists (select 1 from team_memberships m where m.project_id = project_id and m.profile_id = auth.uid() and m.role in ('owner', 'admin'))
    or not exists (select 1 from team_memberships where project_id = team_memberships.project_id)
  );

-- ---------- tasks ----------
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references profiles(id) on delete set null,
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "Members can view project tasks"
  on tasks for select using (
    exists (select 1 from team_memberships m where m.project_id = tasks.project_id and m.profile_id = auth.uid())
  );

create policy "Members can manage project tasks"
  on tasks for all using (
    exists (select 1 from team_memberships m where m.project_id = tasks.project_id and m.profile_id = auth.uid())
  );

-- ---------- comments ----------
create table comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "Members can view task comments"
  on comments for select using (
    exists (
      select 1 from tasks t
      join team_memberships m on m.project_id = t.project_id
      where t.id = comments.task_id and m.profile_id = auth.uid()
    )
  );

create policy "Members can add comments"
  on comments for insert with check (
    author_id = auth.uid() and exists (
      select 1 from tasks t
      join team_memberships m on m.project_id = t.project_id
      where t.id = comments.task_id and m.profile_id = auth.uid()
    )
  );

-- ---------- notifications ----------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('assigned', 'status_change', 'comment', 'due_soon')),
  message text not null,
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select using (profile_id = auth.uid());

create policy "Users can update their own notifications"
  on notifications for update using (profile_id = auth.uid());

-- ---------- activity_logs ----------
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  actor_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

alter table activity_logs enable row level security;

create policy "Members can view project activity"
  on activity_logs for select using (
    exists (select 1 from team_memberships m where m.project_id = activity_logs.project_id and m.profile_id = auth.uid())
  );

create policy "Members can log activity"
  on activity_logs for insert with check (
    actor_id = auth.uid() and exists (
      select 1 from team_memberships m where m.project_id = activity_logs.project_id and m.profile_id = auth.uid()
    )
  );

-- ---------- indexes ----------
create index idx_tasks_project on tasks(project_id);
create index idx_tasks_assignee on tasks(assignee_id);
create index idx_memberships_project on team_memberships(project_id);
create index idx_memberships_profile on team_memberships(profile_id);
create index idx_activity_project on activity_logs(project_id, created_at desc);
create index idx_notifications_profile on notifications(profile_id, created_at desc);
