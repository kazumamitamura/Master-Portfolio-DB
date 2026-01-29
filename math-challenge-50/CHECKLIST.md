# セットアップチェックリスト

## ✅ 現在の状態で不足しているもの

### 1. ⚠️ Next.js開発サーバーが起動していない
- **症状**: ブラウザで `http://localhost:3000` に接続できない
- **解決方法**: ターミナルで以下のコマンドを実行
  ```bash
  cd Master-Portfolio-DB\math-challenge-50
  npm install
  npm run dev
  ```

### 2. ⚠️ Supabase環境変数が設定されていない
- **症状**: `.env.local`ファイルにプレースホルダーのみ
- **解決方法**: 実際のSupabaseプロジェクトの値を設定（下記参照）

### 3. ⚠️ Supabase SQLスキーマが実行されていない可能性
- **症状**: データベーステーブルが存在しない
- **解決方法**: Supabase DashboardのSQL EditorでSQLを実行

### 4. ⚠️ ターミナルのディレクトリパスの問題
- **症状**: `cd Master-Portfolio-DB`でエラー
- **解決方法**: 正しいパスに移動
  ```bash
  cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
  ```

## 📋 セットアップ手順（順番に実行）

### Step 1: Supabaseプロジェクトの作成とURL取得

1. [Supabase Dashboard](https://supabase.com)にログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `math-challenge-50`（任意）
   - **Database Password**: 強力なパスワードを設定
   - **Region**: 最寄りのリージョン
4. 「Create new project」をクリック
5. プロジェクト作成完了を待つ（1-2分）

### Step 2: Supabase URLとAPIキーの取得

1. Supabase Dashboardでプロジェクトを選択
2. 左サイドバーの「**Settings**」（⚙️ アイコン）をクリック
3. 「**API**」セクションをクリック
4. 以下の値をコピー：
   - **Project URL**: `https://xxxxx.supabase.co` の形式
   - **anon public**キー: 長い文字列
   - **service_role secret**キー: 長い文字列（⚠️ 秘密にしてください）

### Step 3: 環境変数の設定

`Master-Portfolio-DB\math-challenge-50\.env.local` ファイルを開いて、以下のように設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: SQLスキーマの実行

1. Supabase Dashboardでプロジェクトを選択
2. 左サイドバーの「**SQL Editor**」をクリック
3. 「New query」をクリック
4. `supabase_schema_simple.sql`の内容をコピー＆ペースト
5. 「Run」ボタンをクリック

### Step 5: 開発サーバーの起動

```bash
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
npm install
npm run dev
```

### Step 6: 動作確認

ブラウザで `http://localhost:3000` を開いて動作確認
