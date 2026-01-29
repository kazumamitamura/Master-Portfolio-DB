# GitHubプッシュ & Vercelデプロイスクリプト
# PowerShellで実行: .\deploy.ps1

$projectPath = "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

# ディレクトリが存在するか確認
if (-not (Test-Path $projectPath)) {
    Write-Host "エラー: プロジェクトパスが見つかりません: $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHubプッシュ & Vercelデプロイ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Gitの状態を確認
Write-Host "Gitの状態を確認中..." -ForegroundColor Yellow
$status = git status --porcelain

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "変更がありません。デプロイをスキップします。" -ForegroundColor Yellow
    exit 0
}

Write-Host "変更されたファイル:" -ForegroundColor Green
git status --short
Write-Host ""

# 変更をステージング
Write-Host "変更をステージング中..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: git add が失敗しました" -ForegroundColor Red
    exit 1
}

# コミットメッセージの入力
Write-Host ""
Write-Host "コミットメッセージを入力してください:" -ForegroundColor Cyan
Write-Host "(Enterキーでデフォルトメッセージを使用)" -ForegroundColor Gray
$commitMessage = Read-Host "> "

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: 最新の変更をコミット - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host ""
Write-Host "コミット中..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: git commit が失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host "コミット完了: $commitMessage" -ForegroundColor Green
Write-Host ""

# GitHubにプッシュ
Write-Host "GitHubにプッシュ中..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: git push が失敗しました" -ForegroundColor Red
    Write-Host "リモートリポジトリの設定を確認してください" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ GitHubへのプッシュが完了しました！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vercelが自動的にデプロイを開始します。" -ForegroundColor Cyan
Write-Host "デプロイの進行状況は以下で確認できます:" -ForegroundColor Cyan
Write-Host "https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host ""
Write-Host "デプロイ完了まで数分かかる場合があります。" -ForegroundColor Yellow
Write-Host ""
