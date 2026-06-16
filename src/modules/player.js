import Board from "./board.js";

export default function Player(name) {
    const board = Board();

    function getBoard() {
        return board;
    }

    function getName() {
        return name;
    }

    return {
        getBoard,
        getName,
    };
}
