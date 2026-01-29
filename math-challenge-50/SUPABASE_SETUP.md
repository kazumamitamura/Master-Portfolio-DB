# Supabaseセットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成（またはログイン）
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `math-challenge-50`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（忘れずにメモ！）
   - **Region**: 最寄りのリージョンを選択（例: Northeast Asia (Tokyo)）
4. 「Create new project」をクリック
5. プロジェクトの作成が完了するまで待機（1-2分）

## 2. 環境変数の取得

プロジェクトが作成されたら、以下の情報を取得します：

1. **Project URL**:
   - 左サイドバーの「Settings」→「API」
   - 「Project URL」をコピー

2. **Anon Key**:
   - 同じページの「Project API keys」セクション
   - 「anon public」キーをコピー

3. **Service Role Key**:
   - 同じページの「Project API keys」セクション
   - 「service_role secret」キーをコピー（⚠️ 注意: このキーは秘密にしてください）

## 3. 環境変数の設定

プロジェクトのルートディレクトリ（`math-challenge-50`）に`.env.local`ファイルを作成または編集：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. SQLスキーマの実行 ⭐ **重要**

### 実行場所
**Supabase DashboardのSQL Editor**で実行します。**フォルダを選ぶ必要はありません。**

### 実行手順

1. **Supabase Dashboardにアクセス**
   - プロジェクトのダッシュボードを開く
   - 左サイドバーの「SQL Editor」をクリック

2. **SQLを実行**
   - 「New query」をクリック
   - 以下のいずれかのSQLファイルの内容をコピー＆ペースト：
     - `supabase_schema_simple.sql`（シンプル版 - 推奨）
     - `supabase_schema.sql`（詳細版 - ゲーミフィケーション機能付き）

3. **実行**
   - 「Run」ボタンをクリック（または `Ctrl+Enter` / `Cmd+Enter`）
   - 成功メッセージが表示されることを確認

### 実行するSQLの選択

#### オプション1: シンプル版（`supabase_schema_simple.sql`）
- `profiles`テーブル（`role`フィールド付き）
- `game_results`テーブル
- 基本的なRLSポリシー
- 先生が全員の結果を参照可能

#### オプション2: 詳細版（`supabase_schema.sql`）
- `profiles`テーブル
- `game_results`テーブル
- `user_progress`テーブル（レベルロック解除機能）
- 自動レベルアンロック機能
- ベストタイム記録機能

## 5. 動作確認

### テーブルの確認
1. 左サイドバーの「Table Editor」をクリック
2. 以下のテーブルが作成されていることを確認：
   - `profiles`
   - `game_results`
   - （詳細版の場合）`user_progress`

### RLSポリシーの確認
1. 左サイドバーの「Authentication」→「Policies」をクリック
2. 各テーブルにポリシーが設定されていることを確認

## 6. トラブルシューティング

### エラー: "relation already exists"
- テーブルが既に存在する場合、`DROP TABLE`で削除してから再実行
- または、`CREATE TABLE IF NOT EXISTS`を使用（既存のスキーマファイルは対応済み）

### エラー: "permission denied"
- Service Role Keyが正しく設定されているか確認
- RLSポリシーが正しく設定されているか確認

### 接続エラー
- `.env.local`の環境変数が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認

## 7. 次のステップ

SQLの実行が完了したら：

1. 開発サーバーを起動：
   ```bash
   cd math-challenge-50
   npm install
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開く

3. 新規登録でアカウントを作成して動作確認

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview#sql-editor)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
