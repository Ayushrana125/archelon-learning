create extension if not exists pgcrypto;

create table if not exists public.interview_qa (
  id uuid primary key default gen_random_uuid(),
  course_name text not null default 'Claude + Codex Interview Questions',
  order_index integer not null,
  question text not null,
  answer text not null,
  module text not null default 'Basic',
  category text not null default 'Uncategorized',
  tags text[] not null default '{}',
  mark_as_complete boolean not null default false,
  bookmark boolean not null default false,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_qa_course_question_unique unique (course_name, question),
  constraint interview_qa_notes_is_array check (jsonb_typeof(notes) = 'array')
);

alter table public.interview_qa
add column if not exists course_name text not null default 'Claude + Codex Interview Questions';

alter table public.interview_qa
drop constraint if exists interview_qa_question_unique;

alter table public.interview_qa
drop constraint if exists interview_qa_course_question_unique;

alter table public.interview_qa
add constraint interview_qa_course_question_unique unique (course_name, question);

create table if not exists public.learning_bookmark_labels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#00c9b1',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint learning_bookmark_labels_name_unique unique (name)
);

create table if not exists public.learning_bookmark_label_assignments (
  question_id uuid not null references public.interview_qa(id) on delete cascade,
  label_id uuid not null references public.learning_bookmark_labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, label_id)
);

alter table public.learning_bookmark_labels
add column if not exists color text not null default '#00c9b1';

alter table public.learning_bookmark_labels
add column if not exists sort_order integer not null default 0;

drop index if exists public.learning_bookmark_labels_course_name_idx;

alter table public.learning_bookmark_labels
drop column if exists course_name;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'interview_qa'
      and column_name = 'bookmark_label_id'
  ) then
    insert into public.learning_bookmark_label_assignments (question_id, label_id)
    select id, bookmark_label_id
    from public.interview_qa
    where bookmark_label_id is not null
    on conflict (question_id, label_id) do nothing;
  end if;
end $$;

drop index if exists public.interview_qa_bookmark_label_id_idx;

alter table public.interview_qa
drop column if exists bookmark_label_id;

create index if not exists interview_qa_module_idx on public.interview_qa (module);
create index if not exists interview_qa_category_idx on public.interview_qa (category);
create index if not exists interview_qa_course_name_idx on public.interview_qa (course_name);
create index if not exists interview_qa_order_index_idx on public.interview_qa (order_index);
create index if not exists interview_qa_tags_gin_idx on public.interview_qa using gin (tags);
create index if not exists interview_qa_notes_gin_idx on public.interview_qa using gin (notes);
create index if not exists learning_bookmark_labels_sort_idx on public.learning_bookmark_labels (sort_order, name);
create unique index if not exists learning_bookmark_labels_name_unique_idx on public.learning_bookmark_labels (name);
create index if not exists learning_bookmark_label_assignments_question_idx on public.learning_bookmark_label_assignments (question_id);
create index if not exists learning_bookmark_label_assignments_label_idx on public.learning_bookmark_label_assignments (label_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists interview_qa_set_updated_at on public.interview_qa;
create trigger interview_qa_set_updated_at
before update on public.interview_qa
for each row
execute function public.set_updated_at();
