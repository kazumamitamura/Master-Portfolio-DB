# SQL実行ガイド

## ⭐ 重要なポイント

**SQLはSupabase DashboardのSQL Editorで実行します。フォルダを選ぶ必要はありません。**

## 実行手順（ステップバイステップ）

### 1. Supabase Dashboardにアクセス

1. [Supabase](https://supabase.com)にログイン
2. プロジェクトを選択（または新規作成）

### 2. SQL Editorを開く

1. 左サイドバーの「**SQL Editor**」をクリック
   - 📍 場所: 左サイドバーの下の方にあります
   - アイコン: データベースのアイコン（または「SQL」と表示）

### 3. 新しいクエリを作成

1. 「**New query**」ボタンをクリック
   - または既存のクエリを選択して編集

### 4. SQLをコピー＆ペースト

1. プロジェクト内の `supabase_schema_simple.sql` ファイルを開く
2. ファイルの内容をすべてコピー（`Ctrl+A` → `Ctrl+C`）
3. SQL Editorのエディタにペースト（`Ctrl+V`）

### 5. SQLを実行

1. 「**Run**」ボタンをクリック
   - または `Ctrl+Enter`（Windows） / `Cmd+Enter`（Mac）
2. 成功メッセージが表示されることを確認
   - ✅ "Success. No rows returned" または類似のメッセージ

## 実行するSQLファイルの選択

### オプション1: シンプル版（推奨）

**ファイル**: `supabase_schema_simple.sql`

**特徴**:
- `profiles`テーブル（`role`フィールド付き）
- `game_results`テーブル
- 基本的なRLSポリシー
- 先生が全員の結果を参照可能

**このSQLを使用する場合**: 提供されたSQLと同じ構造です。

### オプション2: 詳細版

**ファイル**: `supabase_schema.sql`

**特徴**:
- `profiles`テーブル
- `game_results`テーブル
- `user_progress`テーブル（レベルロック解除機能）
- 自動レベルアンロック機能
- ベストタイム記録機能

## 実行後の確認

### テーブルの確認

1. 左サイドバーの「**Table Editor**」をクリック
2. 以下のテーブルが表示されることを確認：
   - ✅ `profiles`
   - ✅ `game_results`

### RLSポリシーの確認

1. 左サイドバーの「**Authentication**」→「**Policies**」をクリック
2. 各テーブルにポリシーが設定されていることを確認

## よくあるエラーと対処法

### エラー: "relation already exists"

**原因**: テーブルが既に存在している

**対処法**:
```sql
-- 既存のテーブルを削除してから再実行
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

その後、再度SQLを実行してください。

### エラー: "permission denied"

**原因**: RLSポリシーの設定に問題がある

**対処法**:
1. RLSポリシーが正しく設定されているか確認
2. Service Role Keyが正しく設定されているか確認（`.env.local`）

### エラー: "column does not exist"

**原因**: テーブル構造が異なる

**対処法**:
1. 既存のテーブルを削除してから再実行
2. または、正しいSQLファイルを使用しているか確認

## 次のステップ

SQLの実行が完了したら：

1. 開発サーバーを起動：
   ```bash
   cd math-challenge-50
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開く

3. 新規登録でアカウントを作成して動作確認

## 参考

- [Supabase SQL Editor公式ドキュメント](https://supabase.com/docs/guides/database/overview#sql-editor)
- 詳細なセットアップ手順: `SUPABASE_SETUP.md`
