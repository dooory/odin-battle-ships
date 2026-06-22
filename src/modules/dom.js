import Game from "./game.js";

const boardTemplate = document.getElementById("boardTemplate");

const rotateOrder = ["right", "up"];

function Dom() {
    let whosDragging;
    let draggingShipLength;
    const placementDirections = ["right", "right"];

    function clearBoard(board) {
        board.textContent = "";
    }

    function renderGame(boards = Game.getPlayerBoards()) {
        const [board1, board2] = boards;

        const section1 = document.getElementById("player1Section");
        const section2 = document.getElementById("player2Section");

        const player1Board = section1.querySelector(".player-board");
        const player2Board = section2.querySelector(".player-board");

        section1.classList.remove("active");
        section2.classList.remove("active");

        if (Game.getWhosPlaying() === 0 || Game.getWhosPlacing() === 0) {
            section1.classList.add("active");
        } else if (Game.getWhosPlaying() === 1 || Game.getWhosPlacing() === 1) {
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

            for (let colIndex = 0; colIndex < 10; colIndex++) {
                const cellContents = board.getCell([colIndex, rowIndex]);
                const cell = document.createElement("td");
                cell.classList.add("board-cell");
                cell.dataset.x = colIndex;
                cell.dataset.y = rowIndex;

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

        return boardEl;
    }

    function createPlacementShip(length) {
        const shipEl = document.createElement("table");
        shipEl.classList.add("placement-ship");
        shipEl.draggable = true;
        shipEl.dataset.length = length;

        for (let i = 0; i < length; i++) {
            const cell = document.createElement("td");

            shipEl.append(cell);

            cell.classList.add("ship-segment");
        }

        return shipEl;
    }

    function renderPlacementShips(playerId, unplacedShips) {
        const playerSection = document.querySelector(
            `.player-section[data-index="${playerId}"]`,
        );

        const availableShips = playerSection.querySelector(".available-ships");

        availableShips.textContent = "";

        unplacedShips.forEach((shipSize) => {
            const placementShip = createPlacementShip(shipSize);

            availableShips.append(placementShip);
        });

        renderGame();
    }

    function handleBoardClick(playerId, event) {
        const attackCell = event.target;
        const position = [
            Number(attackCell.dataset.x),
            Number(attackCell.dataset.y),
        ];

        const board = Game.getPlayerBoard(playerId);
        const boardCell = board.getCell(position);

        if (board.getAttackHistory().has(boardCell)) return;

        board.receiveAttack(position);

        Game.nextRound();

        if (Game.getStatus() === "intermission") {
            return;
        }

        renderGame();
    }

    function handlePlacementReset(playerId) {
        const board = Game.getPlayerBoard(playerId);

        if (board.getShips().length === 0) return;

        board.clearBoard();

        renderPlacementShips(0, board.getAvailableShips());
    }

    function handleRotatePlacement(playerId, directionText) {
        const orderIndex = rotateOrder.indexOf(placementDirections[playerId]);

        placementDirections[playerId] =
            rotateOrder[(orderIndex + 1) % rotateOrder.length];

        const direction = placementDirections[playerId];

        directionText.textContent = `${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    }

    function handlePlacementDrop(playerId, targetCell) {
        const board = Game.getPlayerBoard(playerId);

        const fromPos = [
            Number(targetCell.dataset.x),
            Number(targetCell.dataset.y),
        ];

        let endPos = [];

        if (placementDirections[playerId] === "up") {
            endPos = [fromPos[0], fromPos[1] + (draggingShipLength - 1)];
        } else if (placementDirections[playerId] === "down") {
            endPos = [fromPos[0], fromPos[1] - (draggingShipLength - 1)];
        } else if (placementDirections[playerId] === "left") {
            endPos = [fromPos[0] - (draggingShipLength - 1), fromPos[1]];
        } else if (placementDirections[playerId] === "right") {
            endPos = [fromPos[0] + (draggingShipLength - 1), fromPos[1]];
        }

        // Warn user about invalid position
        if (!board.isValidPosition(endPos) || !board.isValidPosition(fromPos))
            return;

        const range = board.getCellRange(fromPos, endPos)[0];

        if (range.some((cell) => cell.ship !== null)) return;

        board.placeShip(fromPos, endPos);
        renderPlacementShips(playerId, board.getAvailableShips());
    }

    function handlePlacementDragEnter(playerId, target) {
        const boardDiv = target.parentNode.parentNode;
        const ghostShips = boardDiv.querySelectorAll(".has-ghost-ship");

        ghostShips.forEach((cell) => {
            cell.classList.remove("has-ghost-ship");
            cell.classList.remove("invalid-ghost-ship");
        });

        let lastChild = target;
        const shipCells = [];
        let isInvalidPosition = false;

        for (let i = 0; i < draggingShipLength; i++) {
            if (!lastChild) {
                isInvalidPosition = true;

                break;
            }

            if (lastChild.classList.contains("has-ship")) {
                isInvalidPosition = true;
            }

            lastChild.classList.add("has-ghost-ship");

            shipCells.push(lastChild);

            if (placementDirections[playerId] === "right") {
                lastChild = lastChild.nextElementSibling;
            } else if (placementDirections[playerId] === "left") {
                lastChild = lastChild.previousElementSibling;
            } else if (placementDirections[playerId] === "up") {
                lastChild = boardDiv.querySelector(
                    `.board-cell[data-x="${lastChild.dataset.x}"][data-y="${Number(lastChild.dataset.y) + 1}"]`,
                );
            } else if (placementDirections[playerId] === "down") {
                lastChild = boardDiv.querySelector(
                    `.board-cell[data-x="${lastChild.dataset.x}"][data-y="${Number(lastChild.dataset.y) - 1}"]`,
                );
            }
        }

        if (isInvalidPosition) {
            shipCells.forEach((cell) => {
                cell.classList.add("invalid-ghost-ship");
            });
        }
    }

    function handleFinishPlacement(playerId) {
        const requiredShipCount = Game.getSettings().startingShips.length;

        const playerBoard = Game.getPlayerBoard(playerId);

        // Warn the users that they need to place all the available ships down
        if (playerBoard.getShips().length < requiredShipCount) return;

        Game.placedShips(playerId);
        renderGame();
    }

    function setupShipPlacement(section, playerId) {
        function isPlacing() {
            return (
                Game.getStatus() === "placing" &&
                Game.getWhosPlacing() === playerId
            );
        }

        const boardDiv = section.querySelector(".player-board");

        const availableShipsDiv = section.querySelector(".available-ships");

        const rotateButton = section.querySelector(".rotate-ship");
        const directionText = section.querySelector(".current-direction");
        const direction = placementDirections[playerId];

        const placementResetButton = section.querySelector(".reset-ships");
        const placementFinishButton =
            section.querySelector(".finish-placement");

        let targetCell;

        placementResetButton.addEventListener("click", () => {
            if (Game.getStatus() !== "placing") return;

            if (Game.getWhosPlacing() !== playerId) return;

            handlePlacementReset(playerId);
        });

        placementFinishButton.addEventListener("click", () => {
            if (!isPlacing()) return;

            handleFinishPlacement(playerId);
        });

        directionText.textContent = `${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;

        rotateButton.addEventListener("click", () => {
            if (!isPlacing()) return;

            handleRotatePlacement(playerId, directionText);
        });

        availableShipsDiv.addEventListener("dragstart", (event) => {
            if (!isPlacing()) return;

            const target = event.target;

            if (!target.classList.contains("placement-ship")) return;

            whosDragging = playerId;
            draggingShipLength = Number(target.dataset.length);
        });

        availableShipsDiv.addEventListener("dragend", () => {
            if (!isPlacing()) return;

            const ghostShips = section.querySelectorAll(".has-ghost-ship");

            ghostShips.forEach((cell) => {
                cell.classList.remove("has-ghost-ship");
                cell.classList.remove("invalid-ghost-ship");
            });

            whosDragging = null;
            draggingShipLength = null;
        });

        boardDiv.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        boardDiv.addEventListener("dragenter", (event) => {
            event.preventDefault();

            if (!event.target.classList.contains("board-cell")) return;

            if (!isPlacing()) return;

            handlePlacementDragEnter(playerId, event.target);

            targetCell = event.target;
        });

        boardDiv.addEventListener("drop", () => {
            if (!targetCell) return;

            if (!isPlacing()) return;

            if (whosDragging !== playerId) return;

            handlePlacementDrop(playerId, targetCell);
        });
    }

    function setupShipAttacking(section, playerId) {
        function isPlaying() {
            return (
                Game.getStatus() === "playing" &&
                Game.getWhosPlaying() === playerId
            );
        }

        const boardDiv = section.querySelector(".player-board");

        boardDiv.addEventListener("click", (event) => {
            if (!isPlaying()) return;

            if (!event.target.classList.contains("board-cell")) return;

            handleBoardClick(playerId, event);
        });
    }

    function setupSection(section) {
        const playerId = Number(section.dataset.index);

        setupShipPlacement(section, playerId);
        setupShipAttacking(section, playerId);
    }

    function setupAllSections() {
        const sections = document.querySelectorAll(".player-section");

        sections.forEach(setupSection);
    }

    return {
        renderGame,
        renderPlacementShips,
        setupAllSections,
    };
}

export default Dom();
