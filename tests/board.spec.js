import Board from "../src/modules/board.js";

let board;

beforeEach(() => {
    board = Board();
});

describe("getCell()", () => {
    it("returns the correct cell", () => {
        const cell = board.getCell([9, 5]);

        expect(cell.position[0] === 9).toBe(true);
        expect(cell.position[1] === 5).toBe(true);
    });

    it("doesn't accept a position that is above 9", () => {
        expect(() => {
            board.getCell([17, 0]);
        }).toThrow();

        expect(() => {
            board.getCell([0, 12]);
        }).toThrow();

        expect(() => {
            board.getCell([15, 20]);
        }).toThrow();
    });

    it("doesn't accept a position that is below 0", () => {
        expect(() => {
            board.getCell([-10, 0]);
        }).toThrow();

        expect(() => {
            board.getCell([0, -10]);
        }).toThrow();

        expect(() => {
            board.getCell([-10, -10]);
        }).toThrow();
    });
});

describe("placeShip()", () => {
    it("places a ship vertically", () => {
        board.placeShip([0, 0], [0, 3]);

        expect(board.getCell([0, 0]).ship).not.toBeNull();
        expect(board.getCell([0, 1]).ship).not.toBeNull();
        expect(board.getCell([0, 2]).ship).not.toBeNull();
        expect(board.getCell([0, 3]).ship).not.toBeNull();
    });

    it("places a ship horizontally", () => {
        board.placeShip([0, 0], [3, 0]);

        expect(board.getCell([0, 0]).ship).not.toBeNull();
        expect(board.getCell([1, 0]).ship).not.toBeNull();
        expect(board.getCell([2, 0]).ship).not.toBeNull();
        expect(board.getCell([3, 0]).ship).not.toBeNull();
    });

    it("can't place a ship diagonally", () => {
        expect(() => board.placeShip([0, 3], [1, 4])).toThrow();
    });

    it("ships can't occupy the same cells", () => {
        board.placeShip([0, 0], [0, 3]);
        expect(() => board.placeShip([0, 0], [0, 3])).toThrow();
    });
});

describe("receiveAttack()", () => {
    it("hits a ship at a position", () => {
        board.placeShip([0, 0], [2, 0]);
        board.receiveAttack([0, 0]);
        board.receiveAttack([1, 0]);
        board.receiveAttack([2, 0]);

        const ship = board.getCell([0, 0]).ship;

        expect(ship.hasSunk()).toBe(true);
    });
});

describe("getAttackHistory()", () => {
    it("has access to all attack history", () => {
        const positions = [
            [0, 0],
            [8, 4],
            [3, 7],
            [2, 1],
        ];

        positions.forEach((pos) => {
            board.receiveAttack(pos);
        });

        const history = board.getAttackHistory();

        positions.forEach((pos) => {
            const cell = board.getCell(pos);

            expect(history).toContain(cell);
        });
    });
});

describe("hasAllShipsSunk()", () => {
    it("returns true if all ships have sunk", () => {
        board.placeShip([0, 0], [0, 2]);
        board.placeShip([1, 5], [3, 5]);

        board.receiveAttack([0, 0]);
        board.receiveAttack([0, 1]);
        board.receiveAttack([0, 2]);

        board.receiveAttack([1, 5]);
        board.receiveAttack([2, 5]);
        board.receiveAttack([3, 5]);

        expect(board.hasAllShipsSunk()).toBe(true);
    });

    it("returns true if no ships are on the board", () => {
        expect(board.hasAllShipsSunk()).toBe(true);
    });

    it("returns false if a ship on the board hasn't sunk", () => {
        board.placeShip([0, 0], [0, 2]);
        board.receiveAttack([0, 1]);
        board.receiveAttack([0, 2]);

        expect(board.hasAllShipsSunk()).toBe(false);
    });
});
