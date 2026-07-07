# 🗺️ Forest Note - 開発ロードマップ

デモMVP（v1.0.0）から本番化・拡張に向けたロードマップ。

---

## 📍 現在地: デモMVP v1.0.0 ✅

### 実装済み機能
- ✅ ホーム画面（統計・カレンダー）
- ✅ Forest Note 入力（プレビュー・自動解析）
- ✅ カード一覧（フィルター・ソート）
- ✅ ランキング（表彰台・固定表示）
- ✅ デモモード（localStorage 完全動作）
- ✅ スマホ最適化（全ページレスポンシブ）

### 課題・制限
- ⏳ Supabase 本番連携（環境変数切り替えで可能だが、SQL設定は手動）
- ⏳ クラウドデータ同期（デモモード時はローカルのみ）
- ⏳ ユーザー認証（デモは仮ユーザー）
- ⏳ 複数ユーザー対応（デモモードは単一ユーザー）

---

## 🚀 Phase 1: 本番化・安定性向上 (v1.1.0)

**目標**: Supabase連携を簡単にし、本番運用可能に

### 機能
- [ ] Supabase SQL 設定スクリプト化
  - `scripts/setup-supabase.sql` で一発セットアップ
  - RLS ポリシー自動適用
  - テーブル・インデックス自動生成

- [ ] 本番環境チェックリスト
  - [ ] 環境変数の検証スクリプト
  - [ ] Supabase 接続確認
  - [ ] データベーススキーマの検証

- [ ] エラーハンドリング改善
  - [ ] Supabase エラーの日本語表示
  - [ ] ネットワークエラー時の自動リトライ
  - [ ] オフライン時のフォールバック

- [ ] ログイン画面の本番化
  - [ ] Google OAuth 対応
  - [ ] メール認証フロー
  - [ ] パスワードリセット機能

### UI/UX
- [ ] ダークモード対応
  - [ ] `prefers-color-scheme` 自動検出
  - [ ] トグルボタンで手動切り替え
  - [ ] 全ページで一貫性を保つ

- [ ] ローディング画面の改善
  - [ ] Skeleton UI（カード・リスト）
  - [ ] プログレスバー表示
  - [ ] タイムアウト警告

### 推定工数
- **実装**: 1-2週間
- **テスト**: 1週間
- **リリース**: 2024年8月中

---

## 💬 Phase 2: ソーシャル機能 (v1.2.0)

**目標**: ユーザー同士の競争と共有を促進

### 機能
- [ ] SNS 共有機能
  - [ ] ツイート・シェア機能（カード・ランキング）
  - [ ] OGP 画像生成（カード画像化）
  - [ ] URL リンク短縮

- [ ] フレンド機能
  - [ ] フレンド申請・承認
  - [ ] フレンドのランキング比較
  - [ ] フレンドの最新カード表示

- [ ] コメント・リアクション
  - [ ] カードへのコメント機能
  - [ ] 絵文字リアクション（👍🔥😆）
  - [ ] コメント通知

- [ ] チャレンジ機能
  - [ ] 期間限定チャレンジ（30日継続等）
  - [ ] チャレンジランキング
  - [ ] 達成バッジ獲得

### 推定工数
- **実装**: 2-3週間
- **テスト**: 2週間
- **リリース**: 2024年9月中

---

## 📊 Phase 3: AI・分析機能 (v2.0.0)

**目標**: データ駆動の習慣改善

### 機能
- [ ] AI による習慣分析
  - [ ] 達成パターン分析（曜日別・時間帯別）
  - [ ] 失敗パターン分析
  - [ ] 改善提案の自動生成

- [ ] グラフ・レポート機能
  - [ ] 週間レポート（HTML メール）
  - [ ] 月間レポート（PDF ダウンロード）
  - [ ] カスタムグラフ（期間・項目選択）

- [ ] 予測機能
  - [ ] 今月の達成率予測
  - [ ] 習慣達成確率（機械学習）
  - [ ] 最適な記録時間帯の提案

- [ ] インテグレーション
  - [ ] Google Calendar 連携
  - [ ] Slack 通知
  - [ ] Discord ボット

### 推定工数
- **実装**: 3-4週間
- **AI 学習**: 2週間（データ収集期間）
- **テスト**: 2週間
- **リリース**: 2024年10月中

---

## 📱 Phase 4: モバイル・展開 (v2.1.0)

**目標**: クロスプラットフォーム化

### 機能
- [ ] React Native モバイルアプリ
  - [ ] iOS アプリ（App Store）
  - [ ] Android アプリ（Google Play）
  - [ ] Web と同期

- [ ] ブラウザ拡張機能
  - [ ] Chrome 拡張（素早い入力）
  - [ ] Safari 拡張

- [ ] Apple Watch アプリ
  - [ ] 習慣チェック（手首から完了）
  - [ ] 統計表示（コンプリケーション）

- [ ] Slack ボット
  - [ ] `/note` コマンドで入力
  - [ ] 日次サマリー通知

### 推定工数
- **React Native**: 4-6週間
- **拡張機能**: 2-3週間
- **Apple Watch**: 2週間
- **Slack ボット**: 1週間
- **リリース**: 2024年11月中

---

## 💡 今後の課題と検討事項

### 技術的課題
1. **スケーラビリティ**
   - Supabase の RLS ポリシー最適化
   - キャッシング戦略（Redis 導入検討）
   - データベースインデックス設計

2. **セキュリティ**
   - OAuth フロー（認可コード・PKCE）
   - データ暗号化（日記テキスト・個人情報）
   - レート制限（API 保護）

3. **パフォーマンス**
   - 画像最適化（WebP・遅延読み込み）
   - バンドルサイズ最適化
   - CDN キャッシング戦略

### ビジネス課題
1. **マネタイズ**
   - 有料プラン（プレミアム機能）
   - AI 分析の有料化
   - 広告枠の導入検討

2. **ユーザー獲得**
   - App Store 最適化（ASO）
   - SNS マーケティング
   - インフルエンサー活動

3. **リテンション**
   - プッシュ通知の最適化
   - ゲーミフィケーション（バッジ・称号）
   - ユーザーコミュニティ構築

### 運用課題
1. **サポート体制**
   - FAQ ページ構築
   - チャットボット導入（Zendesk）
   - ユーザーフォーラム

2. **データ管理**
   - ユーザーデータ削除ポリシー
   - GDPR・個人情報保護法対応
   - バックアップ・リカバリ計画

3. **監視・保守**
   - エラートラッキング（Sentry）
   - ロギング・分析（DataDog）
   - 定期メンテナンス計画

---

## 🎯 マイルストーン

| バージョン | 時期 | 主要機能 | 状態 |
|-----------|------|--------|------|
| v1.0.0 | 2024年7月 | デモMVP・ホーム・入力・カード・ランキング | ✅ 完了 |
| v1.1.0 | 2024年8月 | Supabase本番化・ダークモード・本番ログイン | 🔜 計画中 |
| v1.2.0 | 2024年9月 | SNS共有・フレンド機能・チャレンジ | 🔜 計画中 |
| v2.0.0 | 2024年10月 | AI分析・グラフ・インテグレーション | 🔜 計画中 |
| v2.1.0 | 2024年11月 | モバイルアプリ・拡張機能・Watch | 🔜 計画中 |

---

## 📋 Supabase 本番セットアップ手順

### 前提
- Supabase アカウント作成済み
- プロジェクト作成済み

### SQL スキーマ作成

```sql
-- Users テーブル（Supabase Auth と連携）
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diary Entries テーブル
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT,
  mood INT CHECK (mood >= 0 AND mood <= 10),
  energy INT CHECK (energy >= 0 AND energy <= 10),
  activity TEXT,
  work_time INT,
  image_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Habit Checks テーブル
CREATE TABLE habit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  pushups BOOLEAN DEFAULT FALSE,
  squats BOOLEAN DEFAULT FALSE,
  plank BOOLEAN DEFAULT FALSE,
  run BOOLEAN DEFAULT FALSE,
  reading BOOLEAN DEFAULT FALSE,
  ai_learning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(diary_entry_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_diary_user_date ON diary_entries(user_id, date DESC);
CREATE INDEX idx_habit_diary ON habit_checks(diary_entry_id);

-- RLS ポリシー（ユーザーは自分のデータのみアクセス可能）
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diary" 
  ON diary_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary" 
  ON diary_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary" 
  ON diary_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own habits" 
  ON habit_checks FOR SELECT 
  USING (diary_entry_id IN (
    SELECT id FROM diary_entries WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own habits" 
  ON habit_checks FOR INSERT, UPDATE 
  WITH CHECK (diary_entry_id IN (
    SELECT id FROM diary_entries WHERE user_id = auth.uid()
  ));
```

### 環境変数設定

```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### ビルド・デプロイ

```bash
npm run build
npx vercel --prod
```

---

## 🤝 コントリビューション

バグ報告・機能リクエストは GitHub Issues で。

---

**Last Updated**: 2024-07-07  
**Status**: デモMVP v1.0.0 安定版  
**Next Phase**: v1.1.0 本番化（2024年8月予定）
