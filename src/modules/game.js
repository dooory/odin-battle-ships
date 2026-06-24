import Dom from "./dom.js";
import Player from "./player.js";

const settings = {
    ai: false,
    startingShips: [2, 3],
};

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

            settings.startingShips.forEach((length, index) => {
                aiBoard.placeShip([index, 0], [index, length - 1]);
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
