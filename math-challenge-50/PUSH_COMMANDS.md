# GitHubプッシュコマンド

## 修正内容
- `app/admin/page.tsx`に`Link`コンポーネントのインポートを追加
- 管理者機能の実装（メールアドレスベースのアクセス制御）

## プッシュ方法

### 方法1: PowerShellスクリプトを使用（推奨）

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
.\PUSH_TO_GITHUB.ps1
```

### 方法2: 手動コマンド

```powershell
# 1. プロジェクトディレクトリに移動
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

# 2. 変更をステージング
git add .

# 3. コミット
git commit -m "Fix: Add Link import to admin page and implement admin email-based access control"

# 4. GitHubにプッシュ
git push origin main
```

### 方法3: 1行コマンド（コピー&ペースト用）

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"; git add .; git commit -m "Fix: Add Link import and admin email-based access control"; git push origin main
```

## デプロイ後の確認

1. **GitHub**: https://github.com/kazumamitamura/Master-Portfolio-DB
   - 最新のコミットが反映されているか確認

2. **Vercelダッシュボード**: https://vercel.com/dashboard
   - 自動デプロイが開始されているか確認
   - ビルドログでエラーがないか確認

3. **動作確認**
   - デプロイされたURLにアクセス
   - 管理者メールアドレス（`mitamuraka@haguroko.ed.jp` または `katoyu@haguroko.ed.jp`）でログイン
   - 管理画面にアクセスできるか確認

## トラブルシューティング

### エラー: "fatal: not a git repository"

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"
git init
git remote add origin https://github.com/kazumamitamura/Master-Portfolio-DB.git
```

### エラー: "Updates were rejected"

```powershell
git pull origin main --rebase
git push origin main
```

### エラー: "Permission denied"

GitHubの認証情報を確認してください。必要に応じて：
- Personal Access Tokenを使用
- SSHキーを設定
