# GitHub Push Script for Score Fix and UI Improvements
# 成績反映修正とUI改善のためのGitHubプッシュスクリプト

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Push: Score Fix & UI Improvements" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the correct directory
Set-Location "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"

# Remove lock file if exists
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue

Write-Host "ステージング中..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "コミット中..." -ForegroundColor Yellow
git commit -m "成績記録の修正とUI改善" -m "- game_resultsテーブルのスキーマに合わせてmistakesカラムを使用するように修正" -m "- 成績ページに学年・クラスを黒色で表示" -m "- ゲーム画面に操作説明を大きく表示" -m "- 管理画面のフィルターセクションのテキストを黒色に変更"

Write-Host ""
Write-Host "GitHubにプッシュ中..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "完了しました！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
