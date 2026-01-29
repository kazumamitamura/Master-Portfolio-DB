# GitHubプッシュ & Vercelデプロイコマンド

## 前提条件
- Gitがインストールされていること
- GitHubリポジトリが設定されていること
- Vercelアカウントが設定されていること

## 1. 変更をGitHubにプッシュ

### PowerShell用コマンド（推奨）

```powershell
# Master-Portfolio-DBディレクトリに移動
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

# 変更をステージング
git add .

# コミット（メッセージを変更可能）
git commit -m "Update: 入力フィールドの改善、学年・クラス選択肢の更新、CSVアップロード機能、成績詳細ページの追加"

# GitHubにプッシュ
git push origin main
```

### 一括実行スクリプト

以下の内容を `deploy.ps1` として保存して実行することもできます：

```powershell
# deploy.ps1
$projectPath = "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
Set-Location $projectPath

Write-Host "変更をステージング中..." -ForegroundColor Yellow
git add .

Write-Host "コミット中..." -ForegroundColor Yellow
$commitMessage = Read-Host "コミットメッセージを入力してください（Enterでデフォルト）"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: 最新の変更をコミット"
}
git commit -m $commitMessage

Write-Host "GitHubにプッシュ中..." -ForegroundColor Yellow
git push origin main

Write-Host "完了しました！" -ForegroundColor Green
Write-Host "Vercelが自動的にデプロイを開始します。" -ForegroundColor Cyan
```

## 2. Vercelデプロイの確認

### 自動デプロイ
GitHubにプッシュすると、Vercelが自動的にデプロイを開始します。

### 手動デプロイ（必要な場合）

```powershell
# Vercel CLIがインストールされている場合
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
vercel --prod
```

## 3. デプロイ後の確認事項

1. **Vercelダッシュボードで確認**
   - https://vercel.com/dashboard にアクセス
   - 最新のデプロイメントの状態を確認
   - ビルドログでエラーがないか確認

2. **環境変数の確認**
   - Vercelプロジェクト設定 > Environment Variables
   - 以下の変数が設定されているか確認：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **動作確認**
   - デプロイされたURLにアクセス
   - 各機能が正常に動作するか確認

## トラブルシューティング

### Gitエラーが発生する場合

```powershell
# Gitの状態を確認
git status

# リモートリポジトリを確認
git remote -v

# リモートが設定されていない場合
git remote add origin https://github.com/kazumamitamura/Master-Portfolio-DB.git
```

### プッシュが拒否される場合

```powershell
# 最新の変更を取得
git pull origin main --rebase

# 再度プッシュ
git push origin main
```

### Vercelビルドエラーが発生する場合

1. ローカルでビルドを確認：
```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
npm run build
```

2. エラーがあれば修正してから再度プッシュ

3. Vercelのビルドログを確認してエラー内容を特定

## クイックデプロイコマンド（コピー&ペースト用）

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"; git add .; git commit -m "Update: 最新の変更"; git push origin main
```
