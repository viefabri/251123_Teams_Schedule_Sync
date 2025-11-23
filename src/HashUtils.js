/**
 * ハッシュ生成ユーティリティ
 */
const HashUtils = {
    /**
     * 文字列からMD5ハッシュを生成する
     * @param {string} text - ハッシュ化対象の文字列
     * @return {string} MD5ハッシュ値（16進数文字列）
     */
    generateHash: function (text) {
        if (!text) return '';
        const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text, Utilities.Charset.UTF_8);
        let hash = '';
        for (let i = 0; i < digest.length; i++) {
            let byte = digest[i];
            if (byte < 0) byte += 256;
            let byteStr = byte.toString(16);
            if (byteStr.length == 1) byteStr = '0' + byteStr;
            hash += byteStr;
        }
        return hash;
    }
};
