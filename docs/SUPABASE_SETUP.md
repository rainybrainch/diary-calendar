# Supabase セットアップガイド

Forest Note v1.1 以降の Supabase 本番環境セットアップ手順。

---

## 前提条件

- Supabase アカウント作成済み
- Supabase プロジェクト作成済み

---

## ステップ1: SQL スキーマ作成

### Supabase ダッシュボードで実行

1. **Supabase ダッシュボード** を開く
2. **SQL Editor** をクリック
3. **New Query** をクリック
4. `scripts/setup-supabase.sql` の内容をコピー・ペースト
5. **Run** ボタンで実行

✅ 結果: 以下のテーブル・ポリシー・関数が作成される
- `users` テーブル
- `diary_entries` テーブル
- `habit_checks` テーブル
- RLS ポリシー（全て）
- トリガー関数（自動ユーザー作成など）

---

## ステップ2: Google OAuth 設定

### 2.1 Google Cloud Console で設定

1. **Google Cloud Console** を開く: https://console.cloud.google.com
2. **新しいプロジェクト** を作成（例: `forest-note`）
3. **APIs & Services** → **Credentials** に移動
4. **OAuth 2.0 Client ID** を作成
   - アプリケーションタイプ: **Web application**
   - 許可されたリダイレクト URI に以下を追加:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
5. **Client ID** と **Client Secret** をコピー

### 2.2 Supabase ダッシュボードで設定

1. **Supabase ダッシュボード** → **Authentication** に移動
2. **Providers** をクリック
3. **Google** をクリック
4. **Enabled** をON
5. **Client ID** と **Client Secret** をペースト
6. **Save** をクリック

✅ Google ログインが有効化される

---

## ステップ3: 環境変数設定

### .env.local を更新

```bash
# デモモード：OFF（Supabase 本番使用）
NEXT_PUBLIC_DEMO_MODE=false

# Supabase 接続情報
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth（オプション・自動検出可）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 値の取得方法

**SUPABASE_URL と SUPABASE_ANON_KEY:**
- Supabase ダッシュボード → **Project Settings** → **API**
- URL と anon key をコピー

**GOOGLE_CLIENT_ID:**
- Google Cloud Console → **Credentials** → OAuth 2.0 Client ID
- Client ID をコピー

---

## ステップ4: アプリケーション起動確認

```bash
# ビルド確認
npm run build

# ローカル開発環境で確認
npm run dev

# http://localhost:3000 でテスト
```

### テスト項目

- [ ] ログイン画面でGoogle ログインボタンが表示される
- [ ] Google ログインをクリック → Google ログイン画面へ
- [ ] ログイン後 → ホーム画面へ自動遷移
- [ ] ユーザー名・メールアドレスが正しく取得されている
- [ ] localStorage から Supabase へのデータ移行が実行されている

---

## ステップ5: 本番環境デプロイ

### Vercel に環境変数を設定

```bash
# Vercel で環境変数を設定
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add NEXT_PUBLIC_DEMO_MODE production
```

### デプロイ

```bash
npx vercel --prod
```

---

## トラブルシューティング

### Google ログインが表示されない

**原因**: `NEXT_PUBLIC_DEMO_MODE=true` のまま

**解決**:
```bash
# .env.local を確認
cat .env.local
# NEXT_PUBLIC_DEMO_MODE=false に変更
```

### 「ユーザーが見つかりません」エラー

**原因**: Supabase の `users` テーブルが未作成

**解決**:
1. SQL スキーマ実行を確認
2. RLS ポリシーを確認（`auth.uid()` が正しく動作しているか）

### Google 認証後、「リダイレクト URI が一致しません」

**原因**: Google Cloud Console のリダイレクト URI が設定されていない

**解決**:
1. Google Cloud Console に移動
2. **Credentials** → **OAuth 2.0 Client ID** を編集
3. **Authorized redirect URIs** に以下を追加:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Supabase ダッシュボードのURL と完全一致させる

### ローカルで Supabase に接続できない

**原因**: `NEXT_PUBLIC_SUPABASE_URL` が間違っている可能性

**解決**:
```bash
# .env.local を確認
cat .env.local

# Supabase ダッシュボード → Settings → API で確認
# https://your-project.supabase.co の形式
```

---

## 次のステップ

1. ✅ Supabase スキーマ作成
2. ✅ Google OAuth 設定
3. ✅ 環境変数設定
4. → **ログイン画面の改善**（Phase 1 実装）
5. → **データ同期ロジック**（Phase 1 実装）

---

## 参考資料

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **RLS ポリシー**: https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated**: 2026-07-08  
**Version**: 1.0
