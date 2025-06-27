// ==UserScript==
// @name         Tetris Fumen with Custom Bundle
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Convert Tetris board to Fumen on button click with next queue support
// @match        https://blox.askplays.com/replay/*
// @grant        none
// @require      https://raw.githubusercontent.com/chokotia/tetris-replay-fumen/refs/heads/main/lib/fumen.bundle.js
// ==/UserScript==

(function () {
    'use strict';

    // モジュールが読み込みできているか確認
    if (typeof tetrisFumen === 'undefined') {
        console.error('tetrisFumen is not defined');
        return;
    }

    // 色 → ミノ種類（大文字）へのマッピング
    const colorToTypeMap = {
        red: 'Z',
        green: 'S',
        orange: 'L',
        blue: 'J',
        purple: 'T',
        teal: 'I',
        yellow: 'O',
        null: null,
    };

    // 1つの Piece オブジェクトをミノ種類に変換する（null 安全対応）
    function pieceToType(piece) {
        if (!piece || piece.color == null) return null;
        return colorToTypeMap[piece.color] ?? null;
    }

    // 複数の Piece オブジェクトをミノ種類の配列に変換する（null 安全対応）
    function convertPiecesToTypes(pieces) {
        return pieces.map(pieceToType);
    }

    // ブロックを文字に変換
    function blockToChar(block) {
        if (!block || block.color == null) return '_';
        return colorToTypeMap[block.color] ?? '_';
    }

    // ボードを文字列に変換
    function boardToFumenFieldString(boardB) {
        const height = boardB[0].length;
        const width = boardB.length;

        let result = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                result += blockToChar(boardB[x][y]);
            }
        }
        return result;
    }

    // ボードをFumen URLに変換
    function boardToFumenURLWithNext(boardB, currentPiece, nextQueue) {
        const fieldStr = boardToFumenFieldString(boardB);
        const field = tetrisFumen.Field.create(fieldStr);

        // 現在のミノとネクストを別々に処理
        const currentType = pieceToType(currentPiece);
        const nextTypes = convertPiecesToTypes(nextQueue);

        // ネクスト情報をコメント形式で作成: #Q=[](現在のミノ)ネクスト
        let nextComment = '';
        if (currentType || nextTypes.length > 0) {
            nextComment = `#Q=[](${currentType})${nextTypes.join('')}`;
        }

        const pages = [{
            field,
            comment: nextComment
        }];

        const fumen = tetrisFumen.encoder.encode(pages);
        return `https://knewjade.github.io/fumen-for-mobile/#?d=${fumen}`;
    }

    // =====================
    // 🔘 UIボタンを追加
    // =====================
    function createButton() {
        const btn = document.createElement('button');
        btn.textContent = '🧩 Export Fumen';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = 9999;
        btn.style.padding = '10px';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '14px';

        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            try {
                if (!board || !board.b) {
                    alert('board.b が見つかりません。先にゲームを読み込んでください。');
                    return;
                }

                // ネクスト情報の確認
                const currentPiece = board.piece || null;
                const nextQueue = board.queue || [];

                console.log('[DEBUG] Current piece:', currentPiece);
                console.log('[DEBUG] Next queue:', nextQueue);
                console.log('[DEBUG] Current piece type:', pieceToType(currentPiece));
                console.log('[DEBUG] Next queue types:', convertPiecesToTypes(nextQueue));

                const url = boardToFumenURLWithNext(board.b, currentPiece, nextQueue);
                console.log('[FUMEN WITH NEXT]', url);
                prompt('Fumen URL をコピーしてください', url);
            } catch (e) {
                console.error(e);
                alert('Fumen生成中にエラーが発生しました');
            }
        });
    }

    // ページ読み込み完了後にボタンを設置
    window.addEventListener('load', () => {
        setTimeout(createButton, 1000);  // ゲームが完全に読み込まれる時間を確保
    });
})();