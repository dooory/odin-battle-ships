import game from "./game.js";
import Game from "./game.js";

const boardTemplate = document.getElementById("boardTemplate");

function Dom() {
    function clearBoard(board) {
        board.textContent = "";
    }

    function renderGame(boards = Game.getPlayerBoards()) {
        const [board1, board2] = boards;

        const section1 = document.getElementById("player1Section");
        const section2 = document.getElementById("player2Section");

        const player1Board = section1.querySelector(".player-board");
        const player2Board = section2.querySelector(".player-board");

        const roundNumber = Game.getRound();

        if (game.getStatus() === "intermission") {
            section1.classList.remove("active");
            section2.classList.remove("active");
        } else if (roundNumber % 2 === 0) {
            section1.classList.add("active");
            section2.classList.remove("active");
        } else {
            section1.classList.remove("active");
            section2.classList.add("active");
        }

        const board1Table = renderBoard(board1);
        const board2Table = renderBoard(board2);

        clearBoard(player1Board);
        clearBoard(player2Board);

        player1Board.append(board1Table);
        player2Board.append(board2Table);
    }

    function renderBoard(board) {
        const boardClone = boardTemplate.content.cloneNode(true);
        const boardEl = boardClone.querySelector(".game-board");
        const attackHistory = board.getAttackHistory();

        for (let rowIndex = 9; rowIndex >= 0; rowIndex--) {
            const row = document.createElement("tr");
            row.classList.add("board-row");
            row.dataset.index = rowIndex;

            for (let colIndex = 0; colIndex < 10; colIndex++) {
                const cellContents = board.getCell([colIndex, rowIndex]);
                const cell = document.createElement("td");
                cell.classList.add("board-cell");
                cell.dataset.index = colIndex;

                if (cellContents.ship?.hasSunk()) {
                    cell.classList.add("sunk-ship");
                }

                if (cellContents.ship !== null) {
                    cell.classList.add("has-ship");
                }

                if (attackHistory.has(cellContents)) {
                    cell.classList.add("hit");
                }

                row.append(cell);
            }

            boardEl.append(row);
        }

        boardEl.addEventListener("click", handleBoardClick);

        return boardEl;
    }

    function handleBoardClick(event) {
        if (Game.getStatus() === "intermission") {
            return;
        }

        const sectionEl = event.currentTarget.parentNode?.parentNode;

        if (Game.isAiEnabled() === true && sectionEl.dataset.index === 0)
            return;

        if (!sectionEl?.classList.contains("active")) return;

        if (!event.target.classList.contains("board-cell")) return;

        const cell = event.target;
        const row = cell.parentNode;
        const position = [
            Number(cell.dataset.index),
            Number(row.dataset.index),
        ];

        const currentPlayer = Game.getPlayer(Number(sectionEl.dataset.index));
        const board = currentPlayer.getBoard();
        const boardCell = board.getCell(position);

        if (board.getAttackHistory().has(boardCell)) return;

        board.receiveAttack(position);

        Game.nextRound();

        if (Game.getStatus() === "intermission") {
            return;
        }

        renderGame();
    }

    return {
        renderGame,
    };
}

export default Dom();
