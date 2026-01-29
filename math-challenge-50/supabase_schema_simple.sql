-- Math Challenge 50 Database Schema (Simplified Version)
-- Supabase PostgreSQL Schema

-- テーブル作成
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  grade int not null,
  class_name text not null,
  role text default 'student' check (role in ('student', 'teacher')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table game_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  level int not null,
  score int not null, -- 50問中何問正解か
  time_seconds numeric not null,
  mistakes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS（セキュリティ設定）
alter table profiles enable row level security;
alter table game_results enable row level security;

-- ポリシー
-- 生徒は自分のプロファイルのみ参照・編集可、先生は全員参照可
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- 結果テーブル
create policy "Students insert own results" on game_results for insert with check (auth.uid() = user_id);
create policy "View own or teacher view all" on game_results for select using (
  auth.uid() = user_id or 
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);

-- インデックス（パフォーマンス向上のため）
create index if not exists idx_game_results_user_id on game_results(user_id);
create index if not exists idx_game_results_level on game_results(level);
create index if not exists idx_game_results_created_at on game_results(created_at desc);
create index if not exists idx_profiles_grade_class on profiles(grade, class_name);
create index if not exists idx_profiles_role on profiles(role);
