# GitHubへのプッシュコマンド（ゲーム修正）
# PowerShellで実行: .\GITHUB_PUSH_GAME_FIX.ps1

Set-Location "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

Write-Host "変更をステージング中..." -ForegroundColor Green
git add .

Write-Host "コミット中..." -ForegroundColor Green
git commit -m "ゲーム画面の修正と成績記録の改善" -m "- ボタン名を「ダッシュボードへ移動」に変更" -m "- すべての成績を記録するように修正（完璧でなくても記録）" -m "- 行・列の数字が重複しないように修正"

Write-Host "GitHubにプッシュ中..." -ForegroundColor Green
git push origin main

Write-Host "完了しました！" -ForegroundColor Cyan
