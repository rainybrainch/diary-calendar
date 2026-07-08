# 🗺️ Forest Note - 開発ロードマップ

デモMVP（v1.0.0）から本番化・拡張に向けたロードマップ。

---

## 📍 現在地: v1.2.0 AI 統合 ✅

### 実装済み機能
- ✅ ホーム画面（統計・カレンダー）
- ✅ Forest Note 入力（プレビュー・自動解析）
- ✅ カード一覧（フィルター・ソート）
- ✅ ランキング（表彰台・固定表示）
- ✅ デモモード（localStorage 完全動作）
- ✅ スマホ最適化（全ページレスポンシブ）
- ✅ AI 質問チャット（5段階の質問・フォローアップ）
- ✅ AI 要約生成（タイトル・要約・タグ・属性）
- ✅ AI カード統合（生成コンテンツをカードに反映）

### v1.1 実装済み
- ✅ Supabase 本番連携（Google OAuth 対応）
- ✅ ユーザー認証（Google・メール）
- ✅ クラウドデータ同期
- ✅ RLS ポリシー

### 課題・制限
- ⏳ OpenAI/Gemini API 統合（Demo AI のみ実装）
- ⏳ AI API キーの安全な管理（環境変数対応）
- ⏳ AI 生成結果のキャッシング
- ⏳ 本番 API レート制限対応

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

## 💬 Phase 2: AI 統合 (v1.2.0) ✅

**目標**: AI による日記の自動整理と深掘り

### 実装済み機能
- ✅ AI 質問チャット
  - ✅ 5段階の質問（気分・イベント・学び・体調・目標）
  - ✅ フォローアップ質問（3回まで）
  - ✅ 進捗表示・質問スキップ機能

- ✅ AI 要約生成
  - ✅ タイトル自動生成（日付 + キーワード）
  - ✅ 要約文の自動生成
  - ✅ タグ自動生成（3～8個）
  - ✅ 属性選択（mind/body/work/relation/money/habit/dream）
  - ✅ 気分・エネルギー設定（1～5段階）

- ✅ AI カード統合
  - ✅ AI 生成タイトルをカード表示
  - ✅ AI タグをカードに表示
  - ✅ AI 属性をカード属性に反映
  - ✅ AI 気分・エネルギーをカード統計に反映

- ✅ Demo AI Provider
  - ✅ API キー不要（固定ロジック）
  - ✅ 本番デプロイ可能
  - ✅ TypeScript strict 完全準拠

### 次の Phase で実装予定
- [ ] OpenAI API 統合（gpt-3.5-turbo）
- [ ] Google Gemini API 統合
- [ ] API キー安全管理
- [ ] レート制限・キャッシング

### 推定工数（既実装）
- **実装**: ✅ 完了
- **テスト**: ✅ ビルド・デプロイ検証
- **リリース**: ✅ 2026-07-08

---

## 🔍 Phase 3: ソーシャル・分析機能 (v1.3.0)

**目標**: ユーザー同士の競争と共有、AI 分析

### 機能
- [ ] SNS 共有機能
  - [ ] ツイート・シェア機能（カード・ランキング）
  - [ ] OGP 画像生成（カード画像化）
  - [ ] URL リンク短縮

- [ ] AI 習慣分析
  - [ ] 達成パターン分析（曜日別・時間帯別）
  - [ ] 失敗パターン分析
  - [ ] 改善提案の自動生成（OpenAI）

- [ ] グラフ・レポート機能
  - [ ] 週間レポート（HTML メール）
  - [ ] 月間レポート（PDF ダウンロード）
  - [ ] カスタムグラフ（期間・項目選択）

- [ ] チャレンジ機能
  - [ ] 期間限定チャレンジ（30日継続等）
  - [ ] チャレンジランキング
  - [ ] 達成バッジ獲得

### 推定工数
- **実装**: 2-3週間
- **テスト**: 2週間
- **リリース**: 2026年9月中

---

## 📱 Phase 4: モバイル・展開 (v2.0.0)

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
- **リリース**: 2026年11月中

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
| v1.0.0 | 2026年7月 | デモMVP・ホーム・入力・カード・ランキング | ✅ 完了 |
| v1.1.0 | 2026年7月 | Supabase本番化・Google OAuth・RLS | ✅ 完了 |
| v1.2.0 | 2026年7月 | AI質問チャット・AI要約・タグ・属性 | ✅ 完了 |
| v1.3.0 | 2026年9月 | SNS共有・AI分析・グラフ・チャレンジ | 🔜 計画中 |
| v2.0.0 | 2026年11月 | モバイルアプリ・拡張機能・Watch | 🔜 計画中 |

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

**Last Updated**: 2026-07-08  
**Status**: v1.2.0 AI 統合完了  
**Next Phase**: v1.3.0 ソーシャル・分析（2026年9月予定）
