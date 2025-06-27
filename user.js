// ==UserScript==
// @name         Tetris Fumen with Custom Bundle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Use tetris-fumen from GitHub bundle
// @match        *://*/*
// @grant        none
// @require      https://raw.githubusercontent.com/chokotia/tetris-replay-fumen/refs/heads/main/lib/fumen.bundle.js
// ==/UserScript==

(function() {
    'use strict';

    // バンドルファイルでは `tetrisFumen` がグローバル変数になるようになっているはず
    if (typeof tetrisFumen === 'undefined') {
        console.error('tetrisFumen is not defined');
        return;
    }

    const fumenCode = 'v115@vhAAgH';  // テスト用のFumenコード
    try {
        const pages = tetrisFumen.decoder.decode(fumenCode);
        console.log('デコード成功: ページ数 =', pages.length);
        console.log('フィールド内容:\n' + pages[0].field.str());
    } catch (e) {
        console.error('Fumen decode error:', e);
    }
})();
