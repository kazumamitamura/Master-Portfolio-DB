# Master Portfolio DB

複数のプロジェクトを管理するモノレポ構造のポートフォリオリポジトリです。

## プロジェクト一覧

### math-challenge-50
**50ます計算WEBアプリ** - 楽しく学べる算数ゲーム

- 🎮 ゲーミフィケーション要素（レベル制、ロック解除システム）
- 📊 進捗管理とベストタイム記録
- 🎨 カラフルで直感的なUI/UX
- 📈 先生用管理画面（Excel一発ダウンロード）
- 🎉 クリア時の紙吹雪アニメーション

**技術スタック**: Next.js 14, Supabase, Tailwind CSS, framer-motion

詳細は `math-challenge-50/README.md` を参照してください。

## セットアップ

各プロジェクトは独立して動作します。各プロジェクトのディレクトリに移動して、個別にセットアップしてください。

### math-challenge-50 のセットアップ

```bash
cd math-challenge-50
npm install
# .env.local にSupabase認証情報を設定
npm run dev
```

## プロジェクト追加方法

新しいプロジェクトを追加する場合：

1. `Master-Portfolio-DB`ディレクトリ内に新しいプロジェクトフォルダを作成
2. プロジェクトのREADMEを追加
3. このREADMEにプロジェクト情報を追加
4. ルートの`package.json`にワークスペースを追加（オプション）

## 構造

```
Master-Portfolio-DB/
├── math-challenge-50/          # 50ます計算アプリ
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # 管理画面
│   │   ├── auth/               # 認証画面
│   │   ├── dashboard/          # ダッシュボード
│   │   ├── play/[level]/       # プレイ画面
│   │   └── api/                # API Routes
│   ├── lib/                    # ユーティリティ
│   ├── package.json
│   ├── tsconfig.json
│   ├── supabase_schema.sql     # データベーススキーマ
│   └── README.md
├── [他のプロジェクト]/         # 今後追加予定
├── package.json                # ルートワークスペース設定
└── README.md                   # このファイル
```

## 開発コマンド

ルートディレクトリから実行可能なコマンド：

```bash
# math-challenge-50の開発サーバー起動
npm run dev:math

# math-challenge-50のビルド
npm run build:math

# すべてのプロジェクトの依存関係をインストール
npm run install:all
```

## ライセンス

各プロジェクトは個別にライセンスが設定されています。詳細は各プロジェクトのREADMEを参照してください。
