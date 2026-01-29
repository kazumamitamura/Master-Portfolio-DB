# GitHubへのプッシュ手順（今すぐ実行）

## 方法1: シンプルスクリプトを実行（最も簡単）

PowerShellで以下を実行：

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
.\GITHUB_PUSH_SIMPLE.ps1
```

---

## 方法2: 手動でコマンドを実行

PowerShellで以下を順番に実行：

```powershell
# 1. Gitリポジトリのルートに移動
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

# 2. 変更をステージング
git add .

# 3. コミット
git commit -m "生徒メール自動認識機能と教員メール一括登録機能を追加"

# 4. GitHubにプッシュ
git push origin main
```

---

## 追加・変更されたファイル

### 新規作成
- `math-challenge-50/lib/adminUtils.ts` - メール判定関数（生徒・管理者）
- `math-challenge-50/app/api/admin/bulk-register-teachers/route.ts` - 教員一括登録API

### 変更
- `math-challenge-50/app/auth/page.tsx` - 生徒メール自動認識UI追加
- `math-challenge-50/app/admin/auth/page.tsx` - 管理者認証UI改善

---

## トラブルシューティング

### エラー: "Permission denied"
`.git/index.lock`ファイルを削除してから再実行：
```powershell
Remove-Item ".git\index.lock" -ErrorAction SilentlyContinue
git add .
```

### エラー: "remote: Permission denied"
GitHubの認証が必要です。Personal Access TokenまたはSSHキーを設定してください。

### エラー: "fatal: not a git repository"
正しいディレクトリに移動してください。

---

## 確認

プッシュ後、GitHubで変更が反映されているか確認してください。
