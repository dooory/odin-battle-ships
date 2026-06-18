import Dom from "./dom.js";
import Player from "./player.js";

const settings = {
    ai: true,
    startingShips: [5, 4, 3, 2],
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

        if (settings.ai) {
            whosPlacing = 0;

            Dom.renderPlacementShips(0, board1.getAvailableShips());
        }
    }

    function end(winner) {
        if (status !== "playing") {
            throw new Error("Game must be ongoing to end");
        }

        const boards = getPlayerBoards();
        console.log(winner.getName());
        setStatus("intermission");

        Dom.renderGame(boards);
    }

    function placedShips() {
        setStatus("playing");

        nextRound();
        Dom.renderGame();
    }

    function nextRound() {
        if (status !== "playing") {
            throw new Error("Game is currently not ongoing");
        }

        const boards = getPlayerBoards();

        if (boards[0].hasAllShipsSunk()) {
            end(players[1]);

            return;
        } else if (boards[1].hasAllShipsSunk()) {
            end(players[0]);

            return;
        }

        roundNumber += 1;

        if (aiEnabled && getWhosPlaying() === 0) {
            const playerBoard = boards[0].getBoard();
            const attackHistory = boards[0].getAttackHistory();

            const legalMoves = playerBoard.reduce((acc, cell) => {
                if (!attackHistory.has(cell)) {
                    acc.push(cell);
                }

                return acc;
            }, []);

            const randomIndex = Math.floor(legalMoves.length * Math.random());
            const aiMove = legalMoves[randomIndex].position;

            boards[0].receiveAttack(aiMove);

            nextRound();
            Dom.renderGame();
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
