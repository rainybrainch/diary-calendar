# 📔 Forest Note - 日記カレンダー

毎日の日記を記録し、習慣を可視化するWebアプリ。**デモモード完全対応・手動セットアップ不要**。

🌐 **本番デモ**: https://diary-calendar-mu.vercel.app

---

## 🎯 コンセプト

朝の日常利用フローを想定した、**習慣追跡型日記アプリ**。

- **毎朝5分の記録習慣** → テキストペースト → 自動解析
- **習慣達成度をビジュアル化** → カレンダーのヒートマップ
- **カード収集の喜び** → レアリティ計算 → コレクション欲求
- **ランキング参加** → 友人と競う → 継続動機付け

---

## ✨ 実装済み機能

### 🏠 ホーム画面
- **🎯 今日の習慣** - 6つのチェックボックス（pushups/squats/plank/run/reading/ai_learning）
- **📊 統計表示** - 連続日数・今日の達成数・気分スコア
- **📅 カレンダー** - 習慣達成度のヒートマップ表示（6段階色分け）
- **ボトムナビ** - 4つの主要機能へのワンタップアクセス

### ✍️ Forest Note 入力画面
- **テキストペースト** - Ctrl+V で貼り付け
- **リアルタイムプレビュー** - 入力中に解析結果を表示
- **自動解析** - FOREST_NOTE形式のテキストを自動パース
- **日記・習慣・気分の保存** - localStorage に自動保存
- **💭 AI 質問チャット** - テキスト → 5段階の質問で深掘り
- **✨ AI 要約生成** - タイトル・要約・タグ・属性を自動生成
- **🎴 AI カード統合** - 生成されたコンテンツをカードに反映

### 🎴 カード一覧画面
- **グリッド表示** - レスポンシブ対応（2～4列自動調整）
- **レアリティフィルター** - common/rare/epic/legendary別表示
- **ソート機能** - 新しい順 / レアリティ順
- **進捗バー** - 月間達成率を視覚化
- **フリップアニメーション** - カード表裏の3D回転

### 🏆 ランキング画面
- **表彰台デザイン** - 1～3位を金・銀・銅で表示
- **自分の順位固定表示** - sticky で常時表示（3位以下）
- **タブ切り替え** - 今日・週間・月間・連続達成
- **メダル表示** - 順位を視覚的に強調

### 📅 カレンダー機能
- **習慣達成度ヒートマップ** - 6段階の色分け（緑→オレンジ）
- **月の統計** - 記録数・達成率・プログレスバー
- **日付インジケータ** - 気分・体力の絵文字表示
- **前月・次月移動** - スムーズな月間閲覧

### 🔐 デモモード
- **localStorage基盤** - Supabase不要で即座に動作
- **自動サンプルデータ** - 初回アクセス時に14日分を生成
- **手動セットアップ不要** - クリック1つでデモ開始

---

## 🚀 クイックスタート

### 本番デモ（推奨）
ブラウザで https://diary-calendar-mu.vercel.app を開くだけ。セットアップ不要。

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/rainybrainch/diary-calendar.git
cd diary-calendar

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで開く
open http://localhost:3000
```

---

## 🔧 デモモード ↔ 本番モード

### デモモード（デフォルト）
```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
```

**特性**:
- ✅ Supabase不要
- ✅ localStorage にデータ保存
- ✅ 初回自動でサンプルデータ生成
- ✅ 仮ユーザーで自動ログイン

### 本番モード（Supabase有効）
```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Supabase セットアップは [ROADMAP.md](./ROADMAP.md) を参照。

---

## 📊 技術スタック

| 層 | 技術 |
|---|---|
| **フロントエンド** | Next.js 16 (App Router) |
| **言語** | TypeScript (strict mode) |
| **スタイル** | Tailwind CSS |
| **状態管理** | React Context API |
| **データ永続化** | localStorage (Demo) / Supabase (本番) |
| **デプロイ** | Vercel |

---

## 📈 実装済み機能スコアカード

| 項目 | 状態 | 詳細 |
|------|------|------|
| **コア機能** | ✅ | 入力→保存→表示の全フロー |
| **デモモード** | ✅ | 手動セットアップ不要 |
| **サンプルデータ** | ✅ | 初回アクセス時に14日分自動生成 |
| **UI/UXデザイン** | ✅ | スマホ・タブレット・PC対応 |
| **アニメーション** | ✅ | フリップ・スムーズなスクロール |
| **ヒートマップ** | ✅ | 習慣達成度を色分け表示 |
| **Supabase統合** | ⏳ | 環境変数で簡単切り替え |
| **プッシュ通知** | 🔜 | Phase 2 計画中 |

---

## 🎯 今後の拡張予定

詳細は [ROADMAP.md](./ROADMAP.md) を参照。

- **Phase 1**: ダークモード・プッシュ通知
- **Phase 2**: SNS共有・フレンド機能
- **Phase 3**: AI分析・レポート生成
- **Phase 4**: モバイルアプリ化

---

## 📝 ライセンス

MIT

---

**Made with ❤️ by Claude Code**
