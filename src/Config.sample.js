/**
 * プロジェクト設定 (サンプル)
 * このファイルをコピーして Config.js を作成してください。
 */
const CONFIG = {
  // JSONファイル(schedule_sync.json)が格納されているフォルダのID
  FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID',

  // 読み込むファイル名
  FILE_NAME: 'schedule_sync.json',

  // 同期先のカレンダーID ('primary' は自分のメインカレンダー)
  CALENDAR_ID: 'primary',

  // 同期範囲 (今日から前後30日間の予定のみを更新対象とする)
  SYNC_RANGE_DAYS: 30
};