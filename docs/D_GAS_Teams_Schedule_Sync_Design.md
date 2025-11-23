# System Design: Teams to Google Calendar Sync Tool

## 1. 概要 (Overview)
本システムは、Microsoft Teams (Outlook) から手動エクスポートされた予定データ（JSON）を、Googleカレンダーに一方向同期するGASツールである。
企業のセキュリティポリシー（API制限）を回避するため、ファイルを介した「JSON Drop Pod」方式を採用する。また、社外秘情報の漏洩を防ぐためのマスキング機能を実装する。

## 2. アーキテクチャ (Architecture)
- **Platform**: Google Apps Script (GAS) - Standalone Script
- **Input**: `schedule_sync.json` (OneDrive -> Google Drive 手動配置)
- **Output**: Google Calendar ('primary')
- **State Management**: Stateless Sync (Googleカレンダーの拡張プロパティにハッシュを埋め込み管理)

## 3. ファイル構成 (File Structure)
- `src/Config.js`: 設定値（フォルダID、カレンダーID）
- `src/Main.js`: 実行エントリーポイント
- `src/SyncEngine.js`: 同期ロジックの中核
- `src/HashUtils.js`: 変更検知用ハッシュ生成
- `src/TextUtils.js`: HTMLタグ除去、テキスト正規化
- `src/PrivacyRules.js`: マスキング・フィルタリングルール

## 4. 機能要件 (Functional Requirements)

### A. データ読み込み
- Googleドライブ上の指定フォルダから `schedule_sync.json` を読み込む。
- ファイルが存在しない場合はエラーログを出力して終了する。

### B. データ加工 (Privacy & Formatting)
- **HTML除去**: OutlookのHTML本文からタグを除去し、プレーンテキスト化する。
- **UTC変換**: 日時文字列（UTC）をGASのDateオブジェクト（JST）に正しく変換する。
- **マスキング**: `PrivacyRules.js` に基づき、特定キーワード（"機密", "採用"等）を含む予定を「予定あり」等に書き換える。
- **除外**: 特定キーワード（"MyAnalytics", "昼休み"等）を含む予定は同期対象外とする。

### C. 同期ロジック (Stateless Hash Sync)
- **検索**: 指定期間（前後30日）のGoogleカレンダー予定を一括取得する。
- **照合**: OutlookのID (`outlook_id`) をキーに既存予定を探す。
- **判定**:
    - **新規**: IDが存在しない場合 -> `createEvent`
    - **更新**: IDが存在し、かつハッシュ値 (`content_hash`) が異なる場合 -> `setTitle`, `setTime` 等で更新。
    - **スキップ**: ハッシュ値が一致する場合 -> 何もしない。
- **メタデータ**: 同期時に `outlook_id` と `content_hash` を `setTag` で埋め込む。

## 5. セキュリティ要件
- ソースコード内に個人情報（メールアドレス等）をハードコーディングしない。
- マスキングロジックは独立したファイルで管理し、変更容易性を確保する。
