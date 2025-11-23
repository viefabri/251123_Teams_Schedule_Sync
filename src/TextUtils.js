/**
 * テキスト処理ユーティリティ
 */
const TextUtils = {
    /**
     * HTMLタグを除去し、プレーンテキスト化する
     * @param {string} html - HTML文字列
     * @return {string} プレーンテキスト
     */
    removeHtmlTags: function (html) {
        if (!html) return '';
        // 基本的なタグ除去
        let text = html.replace(/<[^>]+>/g, '\n');
        // 実体参照のデコード (簡易版)
        text = text.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');
        // 連続する改行を整理
        text = text.replace(/\n\s*\n/g, '\n').trim();
        return text;
    },

    /**
     * テキストを正規化する（前後の空白除去等）
     * @param {string} text 
     * @return {string}
     */
    normalizeText: function (text) {
        if (!text) return '';
        return text.trim();
    },

    /**
     * UTC日時文字列をDateオブジェクトに変換する
     * @param {string} dateString - UTC日時文字列 (例: "2023-11-23T12:00:00Z")
     * @return {Date} Dateオブジェクト
     */
    parseUtcDate: function (dateString) {
        if (!dateString) return null;
        return new Date(dateString);
    }
};
