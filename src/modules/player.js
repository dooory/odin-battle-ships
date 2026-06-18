import Board from "./board.js";

export default function Player(name) {
    const board = Board();

    function getBoard() {
        return board;
    }

    function getName() {
        return name;
    }

    function setName(newName) {
        name = newName;
    }

    return {
        getBoard,
        getName,
        setName,
    };
}
