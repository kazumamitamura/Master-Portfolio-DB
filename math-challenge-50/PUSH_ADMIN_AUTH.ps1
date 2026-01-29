# GitHubプッシュスクリプト
# 管理者認証ページの実装

$projectPath = "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHubプッシュ - 管理者認証機能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ディレクトリに移動
Set-Location $projectPath

# Gitの状態を確認
Write-Host "変更を確認中..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "変更をステージング中..." -ForegroundColor Yellow
git add .

Write-Host "コミット中..." -ForegroundColor Yellow
$commitMessage = "Add: 管理者専用認証ページの実装 - 生徒登録の制限"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: git commit が失敗しました" -ForegroundColor Red
    Write-Host "変更がない場合は、このメッセージは無視して構いません" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "GitHubにプッシュ中..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ GitHubへのプッシュが完了しました！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "実装内容:" -ForegroundColor Cyan
    Write-Host "- 管理者専用認証ページ (/admin/auth)" -ForegroundColor White
    Write-Host "- 生徒登録の制限" -ForegroundColor White
    Write-Host "- パスワードリセット機能" -ForegroundColor White
    Write-Host ""
    Write-Host "Vercelが自動的にデプロイを開始します。" -ForegroundColor Cyan
    Write-Host "デプロイの進行状況: https://vercel.com/dashboard" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "エラー: git push が失敗しました" -ForegroundColor Red
    Write-Host "リモートリポジトリの設定を確認してください" -ForegroundColor Yellow
}
