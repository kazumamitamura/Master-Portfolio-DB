# 🚀 クイックデプロイガイド

## 1行コマンドでデプロイ

以下のコマンドをコピー&ペーストして実行してください：

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"; git add .; git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"; git push origin main
```

## ステップバイステップ

### 1. プロジェクトディレクトリに移動

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
```

### 2. 変更を確認

```powershell
git status
```

### 3. 変更をステージング

```powershell
git add .
```

### 4. コミット

```powershell
git commit -m "Update: 最新の変更"
```

### 5. GitHubにプッシュ

```powershell
git push origin main
```

## デプロイスクリプトを使用

`deploy.ps1` スクリプトを使用すると、対話形式でデプロイできます：

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
.\deploy.ps1
```

## デプロイ後の確認

1. **Vercelダッシュボード**: https://vercel.com/dashboard
2. **ビルドログ**: エラーがないか確認
3. **動作確認**: デプロイされたURLにアクセスして動作確認

## トラブルシューティング

### エラー: "fatal: not a git repository"

```powershell
# Gitリポジトリを初期化（初回のみ）
git init
git remote add origin https://github.com/kazumamitamura/Master-Portfolio-DB.git
```

### エラー: "Updates were rejected"

```powershell
# 最新の変更を取得してから再度プッシュ
git pull origin main --rebase
git push origin main
```

### ビルドエラーが発生する場合

```powershell
# ローカルでビルドを確認
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
npm run build
```

エラーがあれば修正してから再度プッシュしてください。
