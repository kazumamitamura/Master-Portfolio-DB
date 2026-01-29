# GitHubプッシュスクリプト
# パスワード設定機能の改善

$projectPath = "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHubプッシュ - パスワード設定機能の改善" -ForegroundColor Cyan
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
$commitMessage = "Fix: 既存管理者アカウントのパスワード設定機能を改善"
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
    Write-Host "改善内容:" -ForegroundColor Cyan
    Write-Host "- 既存アカウントのエラーメッセージを改善" -ForegroundColor White
    Write-Host "- パスワード設定ボタンを追加" -ForegroundColor White
    Write-Host "- パスワードリセット後の処理を改善" -ForegroundColor White
    Write-Host ""
    Write-Host "使い方:" -ForegroundColor Cyan
    Write-Host "1. /admin/auth にアクセス" -ForegroundColor White
    Write-Host "2. 管理者メールアドレスを入力" -ForegroundColor White
    Write-Host "3. 「パスワードを設定する（メール送信）」をクリック" -ForegroundColor White
    Write-Host "4. メールボックスを確認してリンクをクリック" -ForegroundColor White
    Write-Host "5. 新しいパスワードを設定" -ForegroundColor White
    Write-Host ""
    Write-Host "Vercelが自動的にデプロイを開始します。" -ForegroundColor Cyan
    Write-Host "デプロイの進行状況: https://vercel.com/dashboard" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "エラー: git push が失敗しました" -ForegroundColor Red
    Write-Host "リモートリポジトリの設定を確認してください" -ForegroundColor Yellow
}
