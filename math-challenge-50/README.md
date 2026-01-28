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

### 4. データベーススキーマの適用

SupabaseのSQL Editorで`supabase_schema.sql`の内容を実行してください。

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

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ！

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します！
