/**
 * 同期エンジン
 */
const SyncEngine = {
    TAG_OUTLOOK_ID: 'outlook_id',
    TAG_CONTENT_HASH: 'content_hash',

    /**
     * 同期処理を実行する
     */
    runSync: function () {
        console.log('Sync started.');

        // 1. 期間設定
        const now = new Date();
        const rangeDays = CONFIG.SYNC_RANGE_DAYS;
        const startTime = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
        const endTime = new Date(now.getTime() + rangeDays * 24 * 60 * 60 * 1000);

        // 2. Googleカレンダーから既存予定を取得
        const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
        if (!calendar) {
            console.error(`Calendar not found: ${CONFIG.CALENDAR_ID}`);
            return;
        }
        const existingEvents = calendar.getEvents(startTime, endTime);

        // outlook_id をキーにしたマップを作成
        const eventMap = new Map();
        existingEvents.forEach(event => {
            const outlookId = event.getTag(this.TAG_OUTLOOK_ID);
            if (outlookId) {
                eventMap.set(outlookId, event);
            }
        });
        console.log(`Found ${existingEvents.length} existing events in range.`);

        // 3. JSONファイル読み込み
        const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
        const files = folder.getFilesByName(CONFIG.FILE_NAME);
        if (!files.hasNext()) {
            console.error(`File not found: ${CONFIG.FILE_NAME}`);
            return;
        }
        const file = files.next();
        const jsonContent = file.getBlob().getDataAsString();
        let outlookEvents = [];
        try {
            outlookEvents = JSON.parse(jsonContent);
        } catch (e) {
            console.error('JSON parse error:', e);
            return;
        }
        console.log(`Loaded ${outlookEvents.length} events from JSON.`);

        // 4. 同期ループ
        let createdCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        outlookEvents.forEach(rawEvent => {
            // 4.1. データ加工 & フィルタリング
            if (PrivacyRules.shouldSkip(rawEvent)) {
                return;
            }

            const event = PrivacyRules.applyMasking(rawEvent);

            // 日時変換
            const start = TextUtils.parseUtcDate(event.start.dateTime || event.start); // Adjust based on actual JSON format
            const end = TextUtils.parseUtcDate(event.end.dateTime || event.end);

            // 範囲外チェック (念のため)
            if (end < startTime || start > endTime) {
                return;
            }

            // 本文整形
            const description = TextUtils.removeHtmlTags(event.body?.content || event.body || '');
            const location = event.location?.displayName || event.location || '';
            const title = event.subject || '(No Title)';
            const outlookId = event.ID || event.id;

            if (!outlookId) {
                console.warn('Event without ID found, skipping.');
                return;
            }

            // 4.2. ハッシュ生成 (変更検知用)
            // タイトル、開始、終了、場所、本文 をハッシュ対象とする
            const hashSource = `${title}|${start.getTime()}|${end.getTime()}|${location}|${description}`;
            const currentHash = HashUtils.generateHash(hashSource);

            // 4.3. 照合 & アクション
            if (eventMap.has(outlookId)) {
                // 既存あり -> 更新判定
                const existingEvent = eventMap.get(outlookId);
                const storedHash = existingEvent.getTag(this.TAG_CONTENT_HASH);

                if (storedHash !== currentHash) {
                    // 更新
                    existingEvent.setTitle(title);
                    existingEvent.setTime(start, end);
                    existingEvent.setLocation(location);
                    existingEvent.setDescription(description);
                    existingEvent.setTag(this.TAG_CONTENT_HASH, currentHash);
                    updatedCount++;
                    console.log(`Updated: ${title}`);
                } else {
                    // スキップ
                    skippedCount++;
                }
            } else {
                // 新規作成
                const newEvent = calendar.createEvent(title, start, end, {
                    location: location,
                    description: description
                });
                newEvent.setTag(this.TAG_OUTLOOK_ID, outlookId);
                newEvent.setTag(this.TAG_CONTENT_HASH, currentHash);
                createdCount++;
                console.log(`Created: ${title}`);
            }
        });

        console.log(`Sync completed. Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    }
};
