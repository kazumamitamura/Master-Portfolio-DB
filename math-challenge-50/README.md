# Math Challenge 50 - 50ます計算WEBアプリ

楽しく学べる50ます計算ゲーム！レベル別チャレンジで算数が得意になる！

## 特徴

- 🎮 **ゲーミフィケーション**: レベル制とロック解除システムで生徒が熱狂
- 📊 **進捗管理**: ベストタイム記録と進捗の可視化
- 🎨 **美しいUI**: カラフルで直感的なデザイン
- 📈 **管理機能**: 先生用の管理画面でExcel一発ダウンロード
- 🎉 **演出**: クリア時の紙吹雪アニメーション

## 技術スタック

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Animation**: framer-motion, canvas-confetti
- **Database**: Supabase (Auth, Postgres)
- **Export**: xlsx (Excel出力)
- **Icons**: Lucide React

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 3. 環境変数の設定

`.env.local`ファイルを編集し、Supabaseの認証情報を入力してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. データベーススキーマの適用 ⭐ **重要**

**SQLの実行場所**: Supabase Dashboardの**SQL Editor**で実行します。**フォルダを選ぶ必要はありません。**

**実行手順**:
1. Supabase Dashboardにアクセス
2. 左サイドバーの「**SQL Editor**」をクリック
3. 「New query」をクリック
4. `supabase_schema_simple.sql` または `supabase_schema.sql` の内容をコピー＆ペースト
5. 「Run」ボタンをクリック（または `Ctrl+Enter`）

詳細は以下のファイルを参照してください：
- **SQL実行方法**: `SQL_EXECUTION_GUIDE.md` ⭐ **まずこちらを読んでください**
- **詳細なセットアップ**: `SUPABASE_SETUP.md`

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

### 生徒向け

1. **登録**: `/auth`でアカウントを作成（氏名、学年、クラス、メール、パスワード）
2. **ステージ選択**: `/dashboard`でレベルを選択
3. **プレイ**: 50ます計算に挑戦！タイムを競おう！

### 先生向け（管理画面）

1. **ログイン**: メールアドレスに`admin`または`teacher`が含まれるアカウントでログイン
2. **フィルタリング**: 学年・クラス・レベルで結果を絞り込み
3. **Excel出力**: 「Excelダウンロード」ボタンで一発集計

## レベル説明

- **Level 1 (Novice)**: 足し算のみ (1桁 + 1桁)
- **Level 2 (Normal)**: 引き算あり (答えがマイナスにならない)
- **Level 3 (Hard)**: 掛け算 (九九)
- **Level 4 (Master)**: ランダムミックス + タイムアタック制限あり

## プロジェクト構造

```
math-challenge-50/
├── app/
│   ├── admin/          # 管理画面
│   ├── auth/           # 認証画面
│   ├── dashboard/      # ダッシュボード
│   ├── play/[level]/   # プレイ画面
│   └── page.tsx        # ランディングページ
├── lib/
│   ├── gameLogic.ts    # ゲームロジック
│   ├── supabaseClient.ts  # Supabaseクライアント
│   └── utils.ts        # ユーティリティ関数
├── supabase_schema.sql # データベーススキーマ
└── README.md
```

## デプロイ

### GitHubへのプッシュ & Vercelデプロイ

#### 方法1: PowerShellスクリプトを使用（推奨）

```powershell
# deploy.ps1を実行
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB\math-challenge-50"
.\deploy.ps1
```

#### 方法2: 手動コマンド

```powershell
# Master-Portfolio-DBディレクトリに移動
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"

# 変更をステージング
git add .

# コミット
git commit -m "Update: 最新の変更"

# GitHubにプッシュ
git push origin main
```

#### クイックコマンド（コピー&ペースト用）

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\math-challenge-50\Master-Portfolio-DB"; git add .; git commit -m "Update: 最新の変更"; git push origin main
```

### Vercelデプロイの確認

1. **自動デプロイ**: GitHubにプッシュすると、Vercelが自動的にデプロイを開始します
2. **デプロイ状況の確認**: [Vercel Dashboard](https://vercel.com/dashboard)で確認
3. **環境変数の確認**: Vercelプロジェクト設定で以下が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

詳細は `DEPLOY_COMMANDS.md` を参照してください。

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します！
