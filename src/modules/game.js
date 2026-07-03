import Dom from "./dom.js";
import Player from "./player.js";

const settings = {
    ai: false,
    startingShips: [2, 3, 4, 5, 6],
};

function getDirection(from, to) {
    if (to[0] !== from[0] && to[1] !== from[1]) {
        return "diagonal";
    } else if (to[0] !== from[0]) {
        return "horizontal";
    } else if (to[1] !== from[1]) {
        return "vertical";
    }
}

function getAiMove(boards) {
    const playerBoard = boards[0];
    const boardArray = boards[0].getBoard();
    const attackHistory = playerBoard.getAttackHistory();

    if (attackHistory.size > 0) {
        const historyArray = [...attackHistory];

        let targetShip;

        const unsunkenShip = historyArray.filter((cell) => {
            const ship = cell.ship;

            if (ship === null || ship.hasSunk()) {
                return false;
            }

            if (!targetShip) {
                targetShip = ship;

                return true;
            }

            if (targetShip !== ship) {
                return false;
            }

            return true;
        });

        const possibleSegmentLocations = [];

        if (unsunkenShip.length === 1) {
            unsunkenShip.forEach((cell) => {
                const [x, y] = cell.position;

                if (y + 1 <= 9) {
                    const aboveCell = playerBoard.getCell([x, y + 1]);

                    if (!attackHistory.has(aboveCell)) {
                        possibleSegmentLocations.push(aboveCell);
                    }
                }

                if (y - 1 >= 0) {
                    const lowerCell = playerBoard.getCell([x, y - 1]);

                    if (!attackHistory.has(lowerCell)) {
                        possibleSegmentLocations.push(lowerCell);
                    }
                }

                if (x + 1 <= 9) {
                    const rightCell = playerBoard.getCell([x + 1, y]);

                    if (!attackHistory.has(rightCell)) {
                        possibleSegmentLocations.push(rightCell);
                    }
                }

                if (x - 1 >= 0) {
                    const leftCell = playerBoard.getCell([x - 1, y]);

                    if (!attackHistory.has(leftCell)) {
                        possibleSegmentLocations.push(leftCell);
                    }
                }
            });
        }

        if (unsunkenShip.length > 1) {
            const shipDirection = getDirection(
                unsunkenShip[0].position,
                unsunkenShip[1].position,
            );

            unsunkenShip.forEach((cell) => {
                const [x, y] = cell.position;

                if (shipDirection === "horizontal") {
                    if (x < 9) {
                        const rightCell = playerBoard.getCell([x + 1, y]);

                        if (!attackHistory.has(rightCell)) {
                            possibleSegmentLocations.push(rightCell);
                        }
                    }

                    if (x > 0) {
                        const leftCell = playerBoard.getCell([x - 1, y]);

                        if (!attackHistory.has(leftCell)) {
                            possibleSegmentLocations.push(leftCell);
                        }
                    }
                }

                if (shipDirection === "vertical") {
                    if (y < 9) {
                        const aboveCell = playerBoard.getCell([x, y + 1]);

                        if (!attackHistory.has(aboveCell)) {
                            possibleSegmentLocations.push(aboveCell);
                        }
                    }

                    if (y > 0) {
                        const lowerCell = playerBoard.getCell([x, y - 1]);

                        if (!attackHistory.has(lowerCell)) {
                            possibleSegmentLocations.push(lowerCell);
                        }
                    }
                }
            });
        }

        if (possibleSegmentLocations.length > 0) {
            const randomIndex = Math.floor(
                possibleSegmentLocations.length * Math.random(),
            );

            return possibleSegmentLocations[randomIndex].position;
        }
    }

    const legalMoves = boardArray.reduce((acc, cell) => {
        if (!attackHistory.has(cell)) {
            acc.push(cell);
        }

        return acc;
    }, []);

    const randomIndex = Math.floor(legalMoves.length * Math.random());

    return legalMoves[randomIndex].position;
}

function getAiPlacement(aiBoard, shipSize) {
    const freeSpots = [];

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9 - (shipSize - 2); y++) {
            const [spotRange] = aiBoard.getCellRange(
                [x, y],
                [x, y + (shipSize - 1)],
            );

            const isFree = !spotRange.some((cell) => {
                return cell.ship !== null;
            });

            if (isFree) {
                freeSpots.push([
                    spotRange[0].position,
                    spotRange[shipSize - 1].position,
                ]);
            }
        }
    }

    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9 - (shipSize - 2); x++) {
            const [spotRange] = aiBoard.getCellRange(
                [x, y],
                [x + (shipSize - 1), y],
            );

            const isFree = !spotRange.some((cell) => {
                return cell.ship !== null;
            });

            if (isFree) {
                freeSpots.push([
                    spotRange[0].position,
                    spotRange[shipSize - 1].position,
                ]);
            }
        }
    }

    const randomIndex = Math.floor(freeSpots.length * Math.random());

    return freeSpots[randomIndex];
}

function Game() {
    const players = [Player("Player 1"), Player("Player 2")];

    let status = "intermission";
    let roundNumber;
    let whosPlacing;
    let lastWinner;

    function start(player1Name, player2Name, versingComputer) {
        if (status !== "intermission") {
            throw new Error("Game must be in intermission to start");
        }

        settings.ai = versingComputer;

        players.forEach((player) => {
            player.getBoard().clearBoard();
        });

        players[0].setName(player1Name);

        if (settings.ai === true) {
            players[1].setName("Computer");
            roundNumber = -1;
        } else {
            players[1].setName(player2Name);
            roundNumber = 0;
        }

        setStatus("placing");

        whosPlacing = 0;

        const [board1, board2] = getPlayerBoards();

        Dom.renderPlacementShips(0, board1.getAvailableShips());

        if (settings.ai === false) {
            Dom.renderPlacementShips(1, board2.getAvailableShips());
        }
    }

    function end(winner) {
        if (status !== "playing") {
            throw new Error("Game must be ongoing to end");
        }

        Dom.updateGameStatus();
        setStatus("intermission");

        lastWinner = winner;

        Dom.renderGame();
    }

    function placedShips(lastPlacer) {
        if (
            getPlayerBoard(lastPlacer).getShips().length <
            settings.startingShips.length
        ) {
            throw new Error(
                `Player <${lastPlacer}> hasn't placed all of their ships!`,
            );
        }

        whosPlacing += 1;

        if (getSettings().ai) {
            const aiBoard = getPlayerBoard(1);

            settings.startingShips.forEach((length) => {
                const randomPlacement = getAiPlacement(aiBoard, length);

                aiBoard.placeShip(randomPlacement[0], randomPlacement[1]);
            });

            whosPlacing += 1;
        }

        // If all players have placed their ships, start.
        if (whosPlacing === players.length) {
            setStatus("playing");

            nextRound();
            Dom.renderGame();
        }
    }

    function nextRound() {
        if (status !== "playing") {
            throw new Error("Game is currently not ongoing");
        }

        const players = getPlayers();
        const boards = getPlayerBoards();

        const winner = players.find((player, index) => {
            const nextIndex = (index + 1) % 2;
            const board = player.getBoard();
            const nextBoard = players[nextIndex].getBoard();

            return !board.hasAllShipsSunk() && nextBoard.hasAllShipsSunk();
        });

        if (winner !== undefined) {
            end(winner);

            return;
        }

        roundNumber += 1;

        if (getSettings().ai && getWhosPlaying() === 1) {
            const playerBoard = boards[0];

            playerBoard.receiveAttack(getAiMove(boards));

            Dom.renderGame();
            nextRound();
        }
    }

    function getSettings() {
        return settings;
    }

    function getPlayer(id) {
        if (players[id] === undefined) {
            throw new Error(`No player with id <${id}> found`);
        }

        return players[id];
    }

    function getPlayers() {
        return players;
    }

    function getPlayerBoards() {
        return players.map((plr) => plr.getBoard());
    }

    function getPlayerBoard(id) {
        return getPlayer(id).getBoard();
    }

    function getRound() {
        return roundNumber;
    }

    function getStatus() {
        return status;
    }

    function getWhosPlacing() {
        if (getStatus() !== "placing") return null;

        return whosPlacing;
    }

    function getWhosPlaying() {
        if (getStatus() !== "playing") return null;

        return roundNumber % 2;
    }

    function getLastWinner() {
        return lastWinner;
    }

    function setStatus(newStatus) {
        if (status === newStatus) {
            throw new Error(`Game status is already set to <${newStatus}>`);
        }

        console.log(`${status} -> ${newStatus}`);
        status = newStatus;
    }

    return {
        start,
        placedShips,
        end,
        nextRound,

        getPlayer,
        getPlayers,
        getPlayerBoards,
        getPlayerBoard,
        getStatus,
        getRound,
        getSettings,
        getWhosPlacing,
        getWhosPlaying,
        getLastWinner,
    };
}

export default Game();
