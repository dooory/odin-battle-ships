import Dom from "./dom.js";
import Player from "./player.js";

const settings = {
    ai: false,
    startingShips: [2],
};

function Game() {
    const players = [Player("Player 1"), Player("Player 2")];

    let status = "intermission";
    let roundNumber;
    let whosPlacing;

    function start(player1Name, player2Name) {
        if (status !== "intermission") {
            throw new Error("Game must be in intermission to start");
        }

        players[0].setName(player1Name);
        players[1].setName(player2Name);

        setStatus("placing");

        roundNumber = 0;
        whosPlacing = 0;

        const [board1, board2] = getPlayerBoards();

        Dom.renderPlacementShips(0, board1.getAvailableShips());
        Dom.renderPlacementShips(1, board2.getAvailableShips());
    }

    function end(winnerId) {
        if (status !== "playing") {
            throw new Error("Game must be ongoing to end");
        }

        const boards = getPlayerBoards();
        setStatus("intermission");

        console.log(`Player ${winnerId} won!`);

        Dom.renderGame(boards);
    }

    function placedShips() {
        if (
            getPlayerBoard(whosPlacing).getShips().length <
            settings.startingShips.length
        ) {
            throw new Error(
                `Player <${whosPlacing}> hasn't placed all of their ships!`,
            );
        }

        whosPlacing += 1;

        if (getSettings().ai) {
            const aiBoard = getPlayerBoard(1);

            settings.startingShips.forEach((length, index) => {
                aiBoard.placeShip([index, 0], [index, length - 1]);
            });
        }

        // If all players have placed their ships, start.
        if (whosPlacing === players.length) {
            setStatus("playing");

            nextRound();
            Dom.renderGame();

            return;
        }
    }

    function nextRound() {
        if (status !== "playing") {
            throw new Error("Game is currently not ongoing");
        }

        const boards = getPlayerBoards();

        const winnerId = boards.findIndex((board, index) => {
            const nextIndex = (index + 1) % 2;

            return (
                !board.hasAllShipsSunk() && boards[nextIndex].hasAllShipsSunk()
            );
        });

        if (winnerId !== -1) {
            end(winnerId);

            return;
        }

        roundNumber += 1;

        if (getSettings().ai && getWhosPlaying() === 0) {
            const playerBoard = boards[0];
            const boardArray = boards[0].getBoard();
            const attackHistory = playerBoard.getAttackHistory();

            const legalMoves = boardArray.reduce((acc, cell) => {
                if (!attackHistory.has(cell)) {
                    acc.push(cell);
                }

                return acc;
            }, []);

            const randomIndex = Math.floor(legalMoves.length * Math.random());
            const aiMove = legalMoves[randomIndex].position;

            playerBoard.receiveAttack(aiMove);

            Dom.renderGame();
            nextRound();
        }
    }

    function getSettings() {
        return settings;
    }

    function getPlayer(id) {
        if (status === "intermission") {
            throw new Error("No players available as no game is ongoing");
        }

        if (players[id] === undefined) {
            throw new Error(`No player with id <${id}> found`);
        }

        return players[id];
    }

    function getPlayers() {
        if (status === "intermission") {
            throw new Error("No players available as no game is ongoing");
        }

        return players;
    }

    function getPlayerBoards() {
        if (status === "intermission") {
            throw new Error("No players available as no game is ongoing");
        }

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
        return whosPlacing;
    }

    function getWhosPlaying() {
        return roundNumber % 2;
    }

    function setStatus(newStatus) {
        if (status === newStatus) {
            throw new Error(`Game status is already set to <${newStatus}>`);
        }

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
    };
}

export default Game();
