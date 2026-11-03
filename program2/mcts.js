// --- MONTE CARLO TREE SEARCH (MCTS) ALGORITHM ---

class MCTSNode {
    constructor(board, player, parent = null, move = null) {
        this.board = [...board];       // Current board state
        this.player = player;           // Player who moved to reach this state
        this.parent = parent;           // Parent node
        this.move = move;               // The move that led to this node
        this.children = [];             // Child nodes
        this.visits = 0;                // Visit count (n_i)
        this.wins = 0;                  // Accumulated wins/score (w_i)
        this.untriedMoves = getLegalMoves(this.board); // Unexpanded moves
    }

    // 1. SELECTION via UCT Formula: UCT = (w_i / n_i) + c * sqrt( ln(N_p) / n_i )
    selectChild(cParam = 1.41) {
        let bestScore = -Infinity;
        let bestChild = null;

        for (let child of this.children) {
            let exploitation = child.wins / child.visits;
            let exploration = cParam * Math.sqrt(Math.log(this.visits) / child.visits);
            let uctValue = exploitation + exploration;

            if (uctValue > bestScore) {
                bestScore = uctValue;
                bestChild = child;
            }
        }
        return bestChild;
    }

    // 2. EXPANSION
    expand() {
        let move = this.untriedMoves.pop();
        let nextPlayer = this.player === 'O' ? 'X' : 'O';
        let nextBoard = [...this.board];
        nextBoard[move] = nextPlayer;

        let childNode = new MCTSNode(nextBoard, nextPlayer, this, move);
        this.children.push(childNode);
        return childNode;
    }

    // 3. SIMULATION (Random Playout)
    simulate() {
        let currentBoard = [...this.board];
        let currentPlayer = this.player;

        while (true) {
            let winner = checkWinner(currentBoard);
            if (winner !== null) return winner;

            let legalMoves = getLegalMoves(currentBoard);
            if (legalMoves.length === 0) return 'TIE';

            let randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
            currentBoard[randomMove] = currentPlayer;
        }
    }

    // 4. BACKPROPAGATION
    backpropagate(result) {
        this.visits += 1;

        if (result === 'O') {
            this.wins += 1; // Win for AI ('O')
        } else if (result === 'TIE') {
            this.wins += 0.5; // Draw
        }

        if (this.parent) {
            this.parent.backpropagate(result);
        }
    }
}

function runMCTS(currentBoard, iterations = 1000) {
    let root = new MCTSNode(currentBoard, 'X');

    for (let i = 0; i < iterations; i++) {
        let node = root;

        // Selection
        while (node.untriedMoves.length === 0 && node.children.length > 0) {
            node = node.selectChild();
        }

        // Expansion
        if (node.untriedMoves.length > 0) {
            node = node.expand();
        }

        // Simulation
        let result = node.simulate();

        // Backpropagation
        node.backpropagate(result);
    }

    // Return the move with the highest visit count
    let bestChild = root.children.reduce((best, child) => 
        child.visits > best.visits ? child : best
    , root.children[0]);

    return bestChild.move;
}

function getLegalMoves(board) {
    return board
        .map((val, idx) => (typeof val === 'number' ? idx : null))
        .filter(val => val !== null);
}

function checkWinner(board) {
    const combos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of combos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}