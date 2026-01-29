# GitHubへのプッシュコマンド（シンプル版）
# PowerShellで実行: .\GITHUB_PUSH_SIMPLE.ps1

Write-Host "=== GitHubへのプッシュを開始します ===" -ForegroundColor Cyan

# Gitリポジトリのルートに移動
Set-Location "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

Write-Host "`n1. 変更をステージング中..." -ForegroundColor Green
git add .

Write-Host "`n2. コミット中..." -ForegroundColor Green
git commit -m "生徒メール自動認識機能と教員メール一括登録機能を追加"

Write-Host "`n3. GitHubにプッシュ中..." -ForegroundColor Green
git push origin main

Write-Host "`n=== 完了しました ===" -ForegroundColor Cyan
