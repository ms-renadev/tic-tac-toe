let origBoard;
const HUMAN_PLAYER = 'X';
const AI_PLAYER = 'O';

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
    let index = square.target.dataset.index;
    if (typeof origBoard[index] === 'number') {
        turn(index, HUMAN_PLAYER);
        if (!checkWin(origBoard, HUMAN_PLAYER) && !checkTie()) {
            statusDisplay.innerText = "AI is thinking (MCTS)...";
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
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    for (let win of winCombos) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            return { player: player };
        }
    }
    return null;
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

function bestMove() {
    // Executes 1,000 MCTS simulation iterations per move
    return runMCTS(origBoard, 1000);
}

function restartGame() {
    startGame();
}