# GitHubプッシュスクリプト（即座に実行）
# パスワード設定機能の改善

# 現在のディレクトリを確認
$currentDir = Get-Location
Write-Host "現在のディレクトリ: $currentDir" -ForegroundColor Yellow

# プロジェクトパスを確認
$possiblePaths = @(
    "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB",
    ".\Master-Portfolio-DB",
    "..\Master-Portfolio-DB"
)

$projectPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $projectPath = $path
        break
    }
}

if (-not $projectPath) {
    Write-Host "エラー: プロジェクトパスが見つかりません" -ForegroundColor Red
    Write-Host "以下のいずれかのパスに移動してから実行してください:" -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        Write-Host "  - $path" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "プロジェクトパス: $projectPath" -ForegroundColor Green
Set-Location $projectPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHubプッシュ - パスワード設定機能の改善" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

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
    Write-Host "警告: git commit が失敗しました（変更がない可能性があります）" -ForegroundColor Yellow
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
    Write-Host "Vercelが自動的にデプロイを開始します。" -ForegroundColor Cyan
    Write-Host "デプロイの進行状況: https://vercel.com/dashboard" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "エラー: git push が失敗しました" -ForegroundColor Red
    Write-Host "リモートリポジトリの設定を確認してください" -ForegroundColor Yellow
}
