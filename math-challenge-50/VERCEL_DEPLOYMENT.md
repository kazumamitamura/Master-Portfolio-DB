# Vercelデプロイ設定ガイド

## 404エラーの原因

Vercelで404エラーが発生する主な原因は、モノレポ構造で正しいディレクトリが指定されていないことです。

## 解決方法

### 方法1: Vercel Dashboardで設定（推奨）

1. **Vercel Dashboardにアクセス**
   - https://vercel.com にログイン
   - プロジェクト `master-portfolio-db-50masu` を選択

2. **Settings → General に移動**

3. **Root Directory を設定**
   - 「Root Directory」セクションを開く
   - 「Edit」をクリック
   - `math-challenge-50` を入力
   - 「Save」をクリック

4. **Build and Output Settings を確認**
   - Build Command: `npm run build`（または空欄 - 自動検出）
   - Output Directory: `.next`（または空欄 - 自動検出）
   - Install Command: `npm install`（または空欄 - 自動検出）

5. **環境変数を設定**
   - Settings → Environment Variables
   - 以下の変数を追加：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

6. **再デプロイ**
   - Deployments タブに移動
   - 最新のデプロイメントの「...」メニューから「Redeploy」を選択

### 方法2: vercel.json を使用

`Master-Portfolio-DB/vercel.json` ファイルを作成しました。これにより、Vercelが正しいディレクトリを認識します。

## 環境変数の設定

Vercel Dashboardで以下の環境変数を設定してください：

1. **Settings → Environment Variables**
2. 以下の3つの変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://otsvbxdfsaanpkbncxhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: 
- Production、Preview、Development すべての環境に設定
- 値の前後にスペースや引用符を入れない

## デプロイ後の確認

1. **ビルドログを確認**
   - Deployments タブで最新のデプロイメントをクリック
   - 「Build Logs」を確認してエラーがないか確認

2. **動作確認**
   - デプロイ完了後、URLにアクセス
   - `https://master-portfolio-db-50masu.vercel.app` が正常に表示されるか確認

## トラブルシューティング

### 404エラーが続く場合

1. **Root Directoryが正しく設定されているか確認**
   - Settings → General → Root Directory
   - `math-challenge-50` が設定されているか確認

2. **ビルドログを確認**
   - ビルドが成功しているか確認
   - エラーがないか確認

3. **環境変数が設定されているか確認**
   - Settings → Environment Variables
   - 3つの変数がすべて設定されているか確認

4. **キャッシュをクリア**
   - Deployments → 最新のデプロイメント → 「...」→ 「Redeploy」→ 「Use existing Build Cache」のチェックを外す

### ビルドエラーが発生する場合

1. **package.jsonの確認**
   - `math-challenge-50/package.json` が存在するか確認
   - 依存関係が正しく設定されているか確認

2. **Node.jsバージョンの確認**
   - Settings → General → Node.js Version
   - 18.x または 20.x を選択

## 参考

- [Vercel公式ドキュメント - Monorepos](https://vercel.com/docs/monorepos)
- [Vercel公式ドキュメント - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
