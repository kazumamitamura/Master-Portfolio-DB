# Vercelデプロイチェックリスト

## ビルドエラー修正完了 ✅

以下の修正を完了しました：

1. ✅ `@supabase/auth-helpers-nextjs` → `@supabase/ssr` に移行
2. ✅ `lib/supabaseClient.ts` を更新
3. ✅ `lib/supabaseServer.ts` を作成
4. ✅ `package.json` を更新
5. ✅ エラーメッセージを日本語化

## 次のステップ

### 1. GitHubにプッシュ

変更をGitHubにプッシュしてください：

```bash
cd Master-Portfolio-DB
git push origin main
```

### 2. Vercelの設定確認

Vercel Dashboardで以下を確認：

1. **Root Directory の設定**
   - Settings → General → Root Directory
   - `math-challenge-50` が設定されているか確認

2. **環境変数の設定**
   - Settings → Environment Variables
   - 以下の3つの変数が設定されているか確認：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **再デプロイ**
   - Deployments タブに移動
   - 最新のデプロイメントの「...」メニューから「Redeploy」を選択
   - 「Use existing Build Cache」のチェックを**外す**

### 3. ビルドログの確認

デプロイ後、ビルドログを確認：

1. Deployments タブで最新のデプロイメントをクリック
2. 「Build Logs」を確認
3. エラーがないか確認

## トラブルシューティング

### まだ404エラーが出る場合

1. **Root Directoryが正しく設定されているか確認**
   - `math-challenge-50` が設定されているか
   - スペルミスがないか

2. **環境変数が設定されているか確認**
   - 3つの変数がすべて設定されているか
   - 値が正しいか（プレースホルダーが残っていないか）

3. **ビルドが成功しているか確認**
   - ビルドログにエラーがないか
   - ビルドが完了しているか

### ビルドエラーが続く場合

1. **GitHubに最新のコードがプッシュされているか確認**
   ```bash
   git log --oneline -5
   ```

2. **Vercelのキャッシュをクリア**
   - Redeploy時に「Use existing Build Cache」のチェックを外す

3. **Node.jsバージョンを確認**
   - Settings → General → Node.js Version
   - 18.x または 20.x を選択

## 確認事項

- [ ] GitHubに最新のコードがプッシュされている
- [ ] VercelのRoot Directoryが `math-challenge-50` に設定されている
- [ ] 環境変数が3つすべて設定されている
- [ ] 再デプロイを実行した
- [ ] ビルドログにエラーがない
- [ ] デプロイが成功している
