# GitHubへのプッシュコマンド（入力フィールド修正）
# PowerShellで実行: .\GITHUB_PUSH_INPUT_FIX.ps1

Write-Host "=== GitHubへのプッシュを開始します ===" -ForegroundColor Cyan

# Gitリポジトリのルートに移動
$repoRoot = "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
if (Test-Path $repoRoot) {
    Set-Location $repoRoot
    Write-Host "リポジトリルートに移動: $repoRoot" -ForegroundColor Green
} else {
    Write-Host "エラー: リポジトリが見つかりません: $repoRoot" -ForegroundColor Red
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
$msg1 = "テンキー入力の修正とレスポンシブデザイン改善"
$msg2 = "テンキーで2桁以上の数字が入力できるように修正（Enter/Tabキーで次のフィールドへ移動）"
$msg3 = "周りの数字（行・列ヘッダー）を黒色に変更して視認性を向上"
$msg4 = "タブレット・スマホ対応のレスポンシブデザインを改善"
$msg5 = "ボタン名を「ゲームへ移動」に変更"

git commit -m $msg1 -m $msg2 -m $msg3 -m $msg4 -m $msg5

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
}
