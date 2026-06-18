import Dom from "./dom.js";
import Player from "./player.js";

function Game() {
    const players = [];
    const aiEnabled = true;
    let status = "intermission";
    let roundNumber;

    function start(player1Name, player2Name) {
        setStatus("placing");

        players[0] = Player(player1Name);
        players[1] = Player(player2Name);

        roundNumber = 0;

        Dom.renderGame();
    }

    function end(winner) {
        const boards = getPlayerBoards();
        console.log(winner.getName());
        setStatus("intermission");

        Dom.renderGame(boards);
    }

    function placeShips() {
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

        if (aiEnabled && roundNumber % 2 === 0) {
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

    function getRound() {
        return roundNumber;
    }

    function setStatus(newStatus) {
        if (status === newStatus) {
            throw new Error(`Game status is already set to <${newStatus}>`);
        }

        status = newStatus;
    }

    function getStatus() {
        return status;
    }

    function isAiEnabled() {
        return aiEnabled;
    }

    return {
        start,
        placeShips,
        end,
        nextRound,

        getPlayer,
        getPlayers,
        getPlayerBoards,
        getStatus,
        getRound,

        isAiEnabled,
    };
}

export default Game();
