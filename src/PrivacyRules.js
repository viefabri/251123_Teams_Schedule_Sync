/**
 * プライバシー保護・フィルタリングルール
 */
const PrivacyRules = {
    // 除外キーワードリスト
    EXCLUDE_KEYWORDS: ['MyAnalytics', '昼休み', '移動時間'],

    // マスキング対象キーワードリスト
    MASK_KEYWORDS: ['機密', '採用', '面接', '人事評価', '1on1'],

    /**
     * 同期対象外かどうかを判定する
     * @param {Object} event - 予定オブジェクト
     * @return {boolean} true: 除外する, false: 同期する
     */
    shouldSkip: function (event) {
        if (!event || !event.subject) return false;
        const subject = event.subject;

        // キーワード判定
        for (const keyword of this.EXCLUDE_KEYWORDS) {
            if (subject.includes(keyword)) {
                return true;
            }
        }
        return false;
    },

    /**
     * マスキング処理を適用する
     * @param {Object} event - 予定オブジェクト (参照渡しで変更される可能性あり)
     * @return {Object} マスキング後の予定オブジェクト
     */
    applyMasking: function (event) {
        if (!event || !event.subject) return event;

        let needsMasking = false;
        for (const keyword of this.MASK_KEYWORDS) {
            if (event.subject.includes(keyword)) {
                needsMasking = true;
                break;
            }
        }

        if (needsMasking) {
            // マスキング適用
            return {
                ...event,
                subject: '予定あり',
                body: '（詳細はTeams/Outlookを確認してください）',
                location: '' // 場所も隠す
            };
        }

        return event;
    }
};
