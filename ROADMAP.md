# 🗺️ Forest Note 開発ロードマップ

---

## 📌 Version History

### ✅ v1.3.0 (Gamification & Growth)
**ステータス**: 完了（安定版）  
**リリース日**: 2026年7月8日  
**特徴**: ゲーミング完全版・成長の可視化

**実装完了フェーズ**:
- Phase 4: 森システム（Lv0-100・ビジュアル）
- Phase 1: AI記憶（過去14日分析・個人化質問）
- Phase 2: 成長レポート（9パターン・自動表示）
- Phase 3: カード進化（EXP・Lv・レアリティ）
- Phase 5: AIアドバイス（3軸・寄り添う）
- Phase 6: カレンダー強化（日別詳細）
- Phase 7: 実績システム（25バッジ・4称号）

---

### ✅ v1.0 (Forest Note JSON Integration - CURRENT)
**ステータス**: 完了（手動入力フル実装）  
**リリース日**: 2026年7月9日  
**特徴**: Forest Note v1.0 JSON・Card JSON の完全統合

**実装完了フェーズ**:
- Phase 1: DB Schema・型定義・Validation
  - `forest_note_json` JSONB カラム
  - `card_json` JSONB カラム
  - 7項目スコア（0-100）+ テキスト説明
  - `forestGenerated` / `cardGenerated` フラグ

- Phase 2: Forest Note JSON 入力・保存
  - paste/page.tsx に JSON 入力タブ追加
  - validateForestNoteJson() 関数実装
  - リアルタイムプレビュー
  - Supabase JSONB 保存

- Phase 3: Card JSON 入力・保存
  - confirm/page.tsx に Card JSON 入力セクション
  - validateCardJson() 関数実装
  - リアルタイムプレビュー
  - Supabase JSONB 保存

- Phase 4: Calendar・Modal 表示機能
  - Calendar に 🌲 forestGenerated インジケータ
  - Diary Detail Modal に Forest Note スコア（7項目）表示
  - Diary Detail Modal に Card JSON 情報表示
  - Card Grid に Card Name 検索・Attribute フィルタ機能

**特徴**:
- ✅ 手動入力フロー（Copy-Paste）完全対応
- ✅ 0-100 スコア範囲バリデーション
- ✅ localStorage バックアップ
- ✅ Demo Mode 対応
- ✅ ESLint Error 0
- ✅ TypeScript strict mode 完全対応

---

## 🚀 Upcoming Versions

### 🔄 Phase 5: GPT① API 連携（Forest Note 自動生成）
**ターゲット**: v1.5.0  
**テーマ**: テキスト入力から Forest Note JSON を自動生成

**実装予定**:
- OpenAI GPT-4 API 連携
- ユーザー自由入力テキスト → Forest Note JSON v1.0 自動生成
- scores（7項目 0-100）自動設定
- theme / summary / 各テキスト説明 自動生成
- 生成結果を forestNoteJson に保存
- 手動編集で調整可能

**入力**: テキスト / 音声（WAV/MP3） / 画像（OCR）  
**出力**: Forest Note JSON v1.0 (검증済み)  
**UI**: 生成完了時にプレビュー表示・編集フロー

---

### 🔄 Phase 6: GPT② API 連携（Card JSON 自動生成）
**ターゲット**: v1.5.0  
**テーマ**: Forest Note JSON から Card JSON を自動生成

**実装予定**:
- OpenAI GPT-4 API 連携
- Forest Note JSON のスコア・テーマ・サマリーから Card JSON 生成
- scores（7項目）から card_type・attribute・hp/atk/energy 決定
- theme から card_name・skill.name・skill.effect 生成
- summary から flavor_text 生成
- 生成結果を cardJson に保存
- 手動編集で調整可能

**ロジック例**:
```
scores[mental] >= 80 && scores[work] >= 70 → attribute = "Light"
scores[body] >= 70 → hp = 80-120
scores[work] >= 80 → atk = 85-120
rarity は総合スコアで決定（SSR: 平均 80+）
```

**UI**: confirm ページで自動生成・プレビュー・編集

---

### 🔄 Phase 7: 画像生成 API 連携（Card 画像化）
**ターゲット**: v1.5.0  
**テーマ**: Card JSON から カード画像を自動生成

**実装予定**:
- DALL-E 3 / Midjourney / Stable Diffusion 連携
- image_prompt → Card 画像生成
- Supabase Storage に保存
- card_image_url に URL 格納
- Card Grid・Modal で画像表示

**プロンプト生成ロジック**:
```
attribute: Fire → 「火炎・赤・熱」イメージ付与
card_name: 「朝日の戦士」 → 「朝日・戦士・勇敢」
rarity: SR → 「高品質・光効果」
skill.effect: 「全体に80のダメージ」 → 「爆発・光の波動」
```

---

### 🔄 Phase 8: UI / UX 改善
**ターゲット**: v1.4.0 (先行実装)  
**テーマ**: 毎朝3分で終わる体験の磨き込み

**実装予定**:
- ✅ ダークモード（light / dark / auto）
- ✅ レスポンシブ最適化（375px-1920px 完全対応）
- ✅ アニメーション（Forest Note スコア・Card JSON の段階開示）
- ✅ PWA 強化（オフライン対応・プッシュ通知）
- ✅ パフォーマンス最適化（画像最適化・CSR→ISR）
- ✅ 入力フロー簡素化（スマホ2分以内）

---

### 🔄 v1.4.0 (Morning Experience)
**ターゲット**: 2026年8月  
**テーマ**: Phase 8 + AI API 基本統合

**実装予定**:
- Phase 8: UI/UX 完全最適化
- Phase 5・6 の UI/UX 統合（生成フロー）
- テキスト → JSON 自動変換UI
- 生成結果の一括確認フロー

---

### 🔄 v1.5.0 (API Full Integration & Social)
**ターゲット**: 2026年9月-10月  
**テーマ**: 全 API 連携完了・SNS 連携

**実装予定**:
- Phase 5・6・7 完全実装（GPT + 画像生成）
- SNS 共有（Twitter / Instagram / Notion）
- フレンド機能・チャレンジシステム
- コメント・リアクション機能
- 高度な分析（習慣の相関・波動パターン・予測）

---

### 🔄 v2.0.0 (Mobile App)
**ターゲット**: 2026年12月  
**テーマ**: ネイティブアプリ・デバイス統合

**実装予定**:
- React Native アプリ（iOS / Android）
- Apple Watch 統携・スマートウォッチ連携
- Slack / Teams / Discord インテグレーション
- オフライン-オンライン自動同期
- 音声入力（Whisper API）

---

## 📊 実装進捗

| バージョン | ステータス | 開始日 | 完了予定 |
|-----------|-----------|--------|---------|
| v1.0 | ✅ 完了 | 2026-07-01 | 2026-07-09 |
| v1.4.0 | 🔄 計画中 | 2026-07-20 | 2026-08-31 |
| v1.5.0 | 📋 予定 | 2026-09-01 | 2026-10-31 |
| v2.0.0 | 📋 予定 | 2026-11-01 | 2026-12-31 |

---

## 🎯 コア機能の進捗

| 機能 | v1.3 | v1.0 | v1.4 | v1.5 | v2.0 |
|------|------|------|------|------|------|
| **テキスト入力** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **森・カード・実績** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Forest Note JSON** | - | ✅ | ✅ | ✅ | ✅ |
| **Card JSON** | - | ✅ | ✅ | ✅ | ✅ |
| **JSON 自動生成** | - | - | 🔄 | ✅ | ✅ |
| **画像生成** | - | - | 🔄 | ✅ | ✅ |
| **ダークモード** | - | - | 🔄 | ✅ | ✅ |
| **SNS 共有** | - | - | - | ✅ | ✅ |
| **モバイルアプリ** | - | - | - | - | ✅ |

---

**Last Updated**: 2026-07-09  
**License**: MIT

---

## 🚦 現在地

### ✅ v1.0 完成
- 手動入力フロー完全実装
- Supabase JSONB 統合
- Calendar・Modal 表示対応
- 本番デプロイ可能

### 🔜 次フェーズ（v1.4.0〜v1.5.0）
- Phase 5-7: GPT + 画像生成 API 連携
- Phase 8: UI/UX 最適化
- v1.5.0: SNS・API 完全統合
