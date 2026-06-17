import Ship from "./ship.js";

function getDirection(from, to) {
    if (to[0] !== from[0] && to[1] !== from[1]) {
        return "diagonal";
    } else if (to[0] > from[0]) {
        return "right";
    } else if (to[0] < from[0]) {
        return "left";
    } else if (to[1] > from[1]) {
        return "up";
    } else if (to[1] < from[1]) {
        return "down";
    }
}

function getMagnitude(from, to) {
    if (to[0] !== from[0]) {
        return Math.abs(to[0] - from[0]) + 1;
    } else {
        return Math.abs(to[1] - from[1]) + 1;
    }
}

function isValidPosition(position) {
    if (
        position[0] > 9 ||
        position[1] > 9 ||
        position[0] < 0 ||
        position[1] < 0
    ) {
        return false;
    }

    return true;
}

export default function board() {
    const board = createBoard();
    const attackHistory = new Set();
    const ships = [];

    function createBoard() {
        return new Array(10).fill(null).map((_, rowIndex) =>
            new Array(10).fill(null).map((_, colIndex) => {
                return {
                    position: [colIndex, rowIndex],
                    ship: null,
                };
            }),
        );
    }

    function placeShip(from, to) {
        const [range, length] = getCellRange(from, to);
        const shipInRange = range.some((cell) => cell.ship !== null);

        if (shipInRange) {
            throw new Error(`Ship already in range [${from}] -> [${to}]`);
        }

        const ship = Ship(length);

        ships.push(ship);

        range.forEach((cell) => {
            cell.ship = ship;
        });
    }

    function getBoard() {
        return board;
    }

    function getCell(position) {
        if (!isValidPosition(position)) {
            throw new RangeError("Position's must range from 0-9");
        }

        const [x, y] = position;

        return board[y][x];
    }

    function getCellRange(from, to) {
        const direction = getDirection(from, to);

        if (direction === "diagonal") {
            throw new Error("Range can't be diagonal");
        }

        const length = getMagnitude(from, to);
        const range = Array(length)
            .fill(null)
            .map((_, i) => {
                if (direction === "up") {
                    return getCell([from[0], from[1] + i]);
                } else if (direction === "down") {
                    return getCell([from[0], from[1] - i]);
                } else if (direction === "right") {
                    return getCell([from[0] + i, from[1]]);
                } else if (direction === "left") {
                    return getCell([from[0] - i, from[1]]);
                }

                return null;
            });

        return [range, length];
    }

    function getAttackHistory() {
        return attackHistory;
    }

    function receiveAttack(position) {
        const cell = getCell(position);

        if (attackHistory.has(cell)) {
            throw new Error("You can't attack one cell multiple times");
        }

        attackHistory.add(cell);

        if (cell.ship) {
            cell.ship.hit();
        }
    }

    function hasAllShipsSunk() {
        return ships.length === 0 || !ships.some((ship) => !ship.hasSunk());
    }

    return {
        placeShip,
        receiveAttack,

        getBoard,
        getCell,
        getAttackHistory,
        hasAllShipsSunk,
    };
}
