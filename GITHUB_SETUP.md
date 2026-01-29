# GitHub連携セットアップ

## 手順

### 1. GitHubでリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ名: `Master-Portfolio-DB`
4. 説明: 「モノレポ構造のポートフォリオリポジトリ」
5. Public または Private を選択
6. 「Initialize this repository with a README」は**チェックしない**（既にREADMEがあります）
7. 「Create repository」をクリック

### 2. リモートリポジトリを追加

以下のコマンドを実行してください：

```bash
cd Master-Portfolio-DB
git remote add origin https://github.com/kazumamitamura/Master-Portfolio-DB.git
git branch -M main
git push -u origin main
```

### 3. 認証

初回のpush時にGitHubの認証情報を求められる場合があります。
- Personal Access Token (PAT) を使用することを推奨します
- または、GitHub CLI (`gh`) を使用することもできます

## 今後の作業フロー

```bash
# 変更をステージング
git add .

# コミット
git commit -m "コミットメッセージ"

# GitHubにプッシュ
git push origin main
```
