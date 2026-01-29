# GitHubへのプッシュ手順（管理者ゲーム機能追加）

## 方法1: 自動スクリプトを実行（推奨）

PowerShellで以下を実行：

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
.\GITHUB_PUSH_ADMIN_GAME.ps1
```

---

## 方法2: 手動でコマンドを実行

PowerShellで以下を順番に実行：

```powershell
# 1. Gitリポジトリのルートに移動
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

# 2. .git/index.lockファイルを削除（存在する場合）
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue

# 3. Gitの状態を確認
git status

# 4. すべての変更をステージング
git add .

# 5. コミット
git commit -m "管理者もゲームをプレイできる機能を追加

- 管理画面に「ゲームをプレイする」ボタンを追加
- ダッシュボードで管理者は全レベルをアンロック
- 管理者のプロファイルがない場合でもゲームをプレイ可能
- ダッシュボードに管理画面へのリンクを追加（管理者の場合）"

# 6. GitHubにプッシュ
git push origin main
```

---

## 変更されたファイル

- `math-challenge-50/app/dashboard/page.tsx` - 管理者対応を追加
  - 管理者は全レベルをアンロック
  - プロファイルがない場合の処理を追加
  - 管理画面へのリンクを追加

---

## トラブルシューティング

### エラー: "Permission denied" または ".git/index.lock"

別のgitプロセスが実行中かもしれません。以下を試してください：

```powershell
# .git/index.lockファイルを削除
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue

# 再度実行
git add .
```

### エラー: "remote: Permission denied"

GitHubの認証が必要です。以下を確認：

1. GitHubの認証情報が正しいか
2. SSHキーまたはPersonal Access Tokenが設定されているか

### エラー: "fatal: not a git repository"

正しいディレクトリに移動してください：

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
```

---

## 確認事項

プッシュ前に以下を確認してください：

- [ ] 変更内容が正しいか（`git status`で確認）
- [ ] コミットメッセージが適切か
- [ ] ネットワーク接続が正常か

---

## プッシュ後の確認

GitHubで以下を確認：

1. 変更が正しく反映されているか
2. ファイルがすべて含まれているか
3. コミットメッセージが正しいか

Vercelなどのデプロイサービスを使用している場合、自動デプロイが開始されます。
