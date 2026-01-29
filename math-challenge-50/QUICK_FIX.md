# 🚨 今すぐ修正すべきこと

## 現在の状態で不足しているもの

### 1. ⚠️ Service Role Keyが設定されていない
`.env.local`ファイルの11行目がまだプレースホルダーのままです。

**修正方法**:
1. [Supabase Dashboard](https://supabase.com)にログイン
2. プロジェクトを選択（URL: `https://otsvbxdfsaanpkbncxhj.supabase.co`）
3. 左サイドバー「Settings」→「API」
4. 「Project API keys」セクションの「service_role secret」キーをコピー
5. `.env.local`の11行目を更新：
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（実際のキー）
   ```

### 2. ⚠️ Next.js開発サーバーが起動していない
ブラウザで `http://localhost:3000` に接続できないのは、サーバーが起動していないためです。

**修正方法**:
1. VS Codeのターミナルで以下のコマンドを実行：
   ```powershell
   cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
   npm install
   npm run dev
   ```

### 3. ⚠️ Supabase SQLスキーマが実行されていない可能性
データベーステーブルが作成されていない可能性があります。

**確認・修正方法**:
1. [Supabase Dashboard](https://supabase.com)にログイン
2. プロジェクトを選択
3. 左サイドバー「Table Editor」をクリック
4. `profiles`と`game_results`テーブルが存在するか確認
5. 存在しない場合：
   - 左サイドバー「SQL Editor」をクリック
   - 「New query」をクリック
   - `supabase_schema_simple.sql`の内容をコピー＆ペースト
   - 「Run」ボタンをクリック

## 📍 Supabase URLの見つけ方（各プロジェクトごと）

### 重要なポイント
**各プロジェクト（`math-challenge-50`など）ごとに、Supabaseで別々のプロジェクトを作成します。**

### 手順

1. **Supabase Dashboardにログイン**
   - https://supabase.com

2. **プロジェクトを選択または作成**
   - 既存のプロジェクトがある場合：一覧から選択
   - 新規作成の場合：「New Project」をクリック

3. **Settings → API に移動**
   - 左サイドバーの「Settings」（⚙️ アイコン）をクリック
   - 「API」セクションをクリック

4. **以下の3つの値をコピー**：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**キー: 長い文字列（`eyJhbGci...`で始まる）
   - **service_role secret**キー: 長い文字列（`eyJhbGci...`で始まる）

5. **`.env.local`ファイルに設定**：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

### 複数のプロジェクトがある場合

各プロジェクトごとに**別々のSupabaseプロジェクト**を作成します：

```
Supabase Dashboard:
├── math-challenge-50 プロジェクト
│   └── URL: https://xxxxx.supabase.co
│   └── → Master-Portfolio-DB\math-challenge-50\.env.local に設定
│
└── other-project プロジェクト
    └── URL: https://yyyyy.supabase.co
    └── → Master-Portfolio-DB\other-project\.env.local に設定
```

## ✅ 動作確認チェックリスト

- [ ] `.env.local`の3つの値がすべて設定されている
- [ ] Supabase SQLスキーマが実行されている（Table Editorで確認）
- [ ] `npm install`が完了している
- [ ] `npm run dev`で開発サーバーが起動している
- [ ] ブラウザで `http://localhost:3000` が開ける

## 🎯 次のステップ

1. Service Role Keyを設定
2. 開発サーバーを起動
3. SQLスキーマを実行（まだの場合）
4. ブラウザで動作確認

詳細は `SUPABASE_URL_GUIDE.md` を参照してください。
