# Supabase URL取得ガイド

## 各プロジェクトごとのSupabase URLの見つけ方

### 重要なポイント

**Supabaseでは、各プロジェクト（`math-challenge-50`など）ごとに別々のSupabaseプロジェクトを作成する必要があります。**

ローカルのフォルダ構造（`Master-Portfolio-DB/math-challenge-50`）とは関係なく、Supabase側では**完全に独立したプロジェクト**として管理されます。

## 手順1: Supabaseプロジェクトを作成

### 新しいプロジェクトを作成する場合

1. [Supabase Dashboard](https://supabase.com)にログイン
2. 右上の「**New Project**」をクリック
3. プロジェクト情報を入力：
   - **Name**: `math-challenge-50`（プロジェクト名として識別しやすい名前）
   - **Database Password**: 強力なパスワードを設定
   - **Region**: 最寄りのリージョン（例: Northeast Asia (Tokyo)）
4. 「Create new project」をクリック
5. プロジェクト作成完了を待つ（1-2分）

### 既存のプロジェクトを使用する場合

1. Supabase Dashboardにログイン
2. プロジェクト一覧から使用したいプロジェクトを選択

## 手順2: Supabase URLとAPIキーを取得

### 方法1: Settings → API（推奨）

1. **Supabase Dashboardでプロジェクトを選択**
   - ダッシュボードのプロジェクト一覧から選択

2. **左サイドバーの「Settings」（⚙️ アイコン）をクリック**
   - 下の方にあります

3. **「API」セクションをクリック**
   - Settingsメニューの中にあります

4. **以下の情報をコピー**：

   #### Project URL
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - 「Project URL」の下に表示されます
   - これを `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` に設定

   #### Project API keys
   
   **anon public**（公開キー）:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - 「Project API keys」セクションの「anon public」キー
   - これを `.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定

   **service_role secret**（秘密キー）:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - 「Project API keys」セクションの「service_role secret」キー
   - ⚠️ **このキーは秘密にしてください！** サーバーサイドのみで使用
   - これを `.env.local` の `SUPABASE_SERVICE_ROLE_KEY` に設定

### 方法2: プロジェクト設定から直接

1. プロジェクトのダッシュボードを開く
2. 右上の「Project Settings」をクリック
3. 左メニューから「API」を選択
4. 上記と同じ情報が表示されます

## 手順3: 環境変数ファイルに設定

取得した値を `Master-Portfolio-DB\math-challenge-50\.env.local` に設定：

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Anon Key（公開キー）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key（秘密キー - サーバーサイドのみ）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 複数のプロジェクトがある場合

### 例: `math-challenge-50` と `other-project` がある場合

各プロジェクトごとに**別々のSupabaseプロジェクト**を作成します：

#### math-challenge-50用
1. Supabaseで「New Project」→ 名前: `math-challenge-50`
2. URLとキーを取得
3. `Master-Portfolio-DB\math-challenge-50\.env.local` に設定

#### other-project用
1. Supabaseで「New Project」→ 名前: `other-project`
2. URLとキーを取得
3. `Master-Portfolio-DB\other-project\.env.local` に設定

### プロジェクトごとの設定ファイル

```
Master-Portfolio-DB/
├── math-challenge-50/
│   └── .env.local          ← math-challenge-50用のSupabase設定
├── other-project/
│   └── .env.local          ← other-project用のSupabase設定
└── ...
```

## トラブルシューティング

### URLが見つからない
- プロジェクトが作成完了しているか確認（1-2分待つ）
- 正しいプロジェクトを選択しているか確認

### キーが長すぎてコピーできない
- キーの右側に「Copy」ボタンがあるので、それをクリック
- または、キー全体を選択してコピー

### 環境変数が反映されない
- `.env.local`ファイルを保存したか確認
- 開発サーバーを再起動（`Ctrl+C`で停止 → `npm run dev`で再起動）

## 参考

- [Supabase公式ドキュメント - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase公式ドキュメント - Project Settings](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs#get-the-api-keys)
