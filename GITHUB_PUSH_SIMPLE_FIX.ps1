# GitHubへのプッシュコマンド（シンプル版）
# PowerShellで実行: .\GITHUB_PUSH_SIMPLE_FIX.ps1

Set-Location "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

Write-Host "変更をステージング中..." -ForegroundColor Green
git add .

Write-Host "コミット中..." -ForegroundColor Green
git commit -m "テンキー入力の修正とレスポンシブデザイン改善"

Write-Host "GitHubにプッシュ中..." -ForegroundColor Green
git push origin main

Write-Host "完了しました！" -ForegroundColor Cyan
