# GitHubへのプッシュ手順

## 現在の状況

ローカルのコードは修正済みですが、GitHubにプッシュされていないため、Vercelが古いコードをビルドしています。

## 解決手順

### 1. ターミナルを開く

VS Codeのターミナル、またはPowerShellを開きます。

### 2. Master-Portfolio-DBディレクトリに移動

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
```

### 3. 変更をステージング

```powershell
git add .
```

### 4. コミット

```powershell
git commit -m "Fix: Migrate to @supabase/ssr and update Supabase client configuration"
```

### 5. GitHubにプッシュ

```powershell
git push origin main
```

## 確認事項

プッシュ後、以下を確認してください：

1. **GitHubで確認**
   - https://github.com/kazumamitamura/Master-Portfolio-DB
   - `math-challenge-50/lib/supabaseClient.ts` が正しく更新されているか確認
   - `@supabase/ssr` を使用しているか確認

2. **Vercelの自動デプロイ**
   - GitHubにプッシュすると、Vercelが自動的に再デプロイを開始します
   - Vercel Dashboardの「Deployments」タブで進行状況を確認

3. **ビルドログの確認**
   - デプロイが開始されたら、ビルドログを確認
   - エラーが解消されているか確認

## トラブルシューティング

### git push でエラーが出る場合

1. **認証エラーの場合**
   ```powershell
   # GitHub CLIを使用する場合
   gh auth login
   
   # または、Personal Access Tokenを使用
   git remote set-url origin https://[YOUR_TOKEN]@github.com/kazumamitamura/Master-Portfolio-DB.git
   ```

2. **権限エラーの場合**
   - Gitのロックファイルを削除：
   ```powershell
   Remove-Item "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\.git\index.lock" -ErrorAction SilentlyContinue
   ```

### まだビルドエラーが出る場合

1. **Vercelのキャッシュをクリア**
   - Vercel Dashboard → Deployments → 最新のデプロイメント → 「...」→ 「Redeploy」
   - 「Use existing Build Cache」のチェックを**外す**

2. **Root Directoryの確認**
   - Settings → General → Root Directory
   - `math-challenge-50` が設定されているか確認

3. **環境変数の確認**
   - Settings → Environment Variables
   - 3つの変数がすべて設定されているか確認

## 次のステップ

プッシュが完了したら：

1. Vercel Dashboardでデプロイの進行状況を確認
2. ビルドログでエラーが解消されているか確認
3. デプロイ完了後、URLにアクセスして動作確認
