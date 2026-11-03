let origBoard;
const HUMAN_PLAYER = 'X';
const AI_PLAYER = 'O';

const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');

startGame();

function startGame() {
    origBoard = Array.from(Array(9).keys());
    statusDisplay.innerText = "Your Turn (X)";
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].classList.remove('x', 'o');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.dataset.index] === 'number') {
        turn(square.target.dataset.index, HUMAN_PLAYER);
        if (!checkWin(origBoard, HUMAN_PLAYER) && !checkTie()) {
            statusDisplay.innerText = "AI is thinking...";
            setTimeout(() => {
                turn(bestMove(), AI_PLAYER);
                if (!checkWin(origBoard, AI_PLAYER) && !checkTie()) {
                    statusDisplay.innerText = "Your Turn (X)";
                }
            }, 300);
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    let el = document.querySelector(`[data-index='${squareId}']`);
    el.innerText = player;
    el.classList.add(player.toLowerCase());
    
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    statusDisplay.innerText = gameWon.player === HUMAN_PLAYER ? "You Win!" : "AI Wins!";
}

function emptySquares() {
    return origBoard.filter(s => typeof s === 'number');
}

function checkTie() {
    if (emptySquares().length === 0) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].removeEventListener('click', turnClick, false);
        }
        statusDisplay.innerText = "It's a Tie!";
        return true;
    }
    return false;
}

// --- MINIMAX ALGORITHM ---
function bestMove() {
    return minimax(origBoard, AI_PLAYER).index;
}

function minimax(newBoard, player) {
    let availSpots = emptySquares(newBoard);

    if (checkWin(newBoard, HUMAN_PLAYER)) {
        return { score: -10 };
    } else if (checkWin(newBoard, AI_PLAYER)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player === AI_PLAYER) {
            let result = minimax(newBoard, HUMAN_PLAYER);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, AI_PLAYER);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === AI_PLAYER) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function restartGame() {
    startGame();
}