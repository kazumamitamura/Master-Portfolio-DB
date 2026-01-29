# GitHubへのプッシュコマンド（管理者ゲーム機能追加）
# PowerShellで実行: .\GITHUB_PUSH_ADMIN_GAME.ps1

Write-Host "=== GitHubへのプッシュを開始します ===" -ForegroundColor Cyan

# Gitリポジトリのルートに移動
$repoRoot = "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
if (Test-Path $repoRoot) {
    Set-Location $repoRoot
    Write-Host "リポジトリルートに移動: $repoRoot" -ForegroundColor Green
} else {
    Write-Host "エラー: リポジトリが見つかりません: $repoRoot" -ForegroundColor Red
    Write-Host "現在のディレクトリから実行してください: cd `"$repoRoot`"" -ForegroundColor Yellow
    exit 1
}

# .git/index.lockファイルを削除（存在する場合）
if (Test-Path ".git\index.lock") {
    Write-Host ".git\index.lockファイルを削除中..." -ForegroundColor Yellow
    Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
}

# Gitの状態を確認
Write-Host ""
Write-Host "1. Gitの状態を確認中..." -ForegroundColor Green
git status

# すべての変更をステージング
Write-Host ""
Write-Host "2. 変更をステージング中..." -ForegroundColor Green
git add .

# ステージング後の状態を確認
Write-Host ""
Write-Host "3. ステージング後の状態:" -ForegroundColor Green
git status

# コミット
Write-Host ""
Write-Host "4. コミット中..." -ForegroundColor Green
git commit -m "管理者もゲームをプレイできる機能を追加" -m "- 管理画面に「ゲームをプレイする」ボタンを追加" -m "- ダッシュボードで管理者は全レベルをアンロック" -m "- 管理者のプロファイルがない場合でもゲームをプレイ可能" -m "- ダッシュボードに管理画面へのリンクを追加（管理者の場合）"

if ($LASTEXITCODE -ne 0) {
    Write-Host "コミットに失敗しました。エラーを確認してください。" -ForegroundColor Red
    exit 1
}

# リモートリポジトリを確認
Write-Host ""
Write-Host "5. リモートリポジトリを確認中..." -ForegroundColor Green
git remote -v

# プッシュ
Write-Host ""
Write-Host "6. GitHubにプッシュ中..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== プッシュが完了しました ===" -ForegroundColor Cyan
    Write-Host "GitHubで変更を確認してください。" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== エラーが発生しました ===" -ForegroundColor Red
    Write-Host "エラーコード: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "トラブルシューティング:" -ForegroundColor Yellow
    Write-Host "1. リモートリポジトリが設定されているか確認: git remote -v" -ForegroundColor Yellow
    Write-Host "2. 認証情報が正しいか確認" -ForegroundColor Yellow
    Write-Host "3. ネットワーク接続を確認" -ForegroundColor Yellow
}
