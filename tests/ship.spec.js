import Ship from "../src/modules/ship.js";

let testShip;

beforeEach(() => {
    testShip = Ship(4);
});

describe("hit()", () => {
    it("hits the ship if it has health", () => {
        expect(testShip.hit()).toBeCloseTo(1);
    });

    it("doesn't hit the ship if it has no health", () => {
        testShip.hit();
        testShip.hit();
        testShip.hit();
        testShip.hit();

        expect(testShip.hit()).toBe(false);
    });
});

describe("hasSunk()", () => {
    it("returns true when its sunk", () => {
        testShip.hit();
        testShip.hit();
        testShip.hit();
        testShip.hit();

        expect(testShip.hasSunk()).toBe(true);
    });

    it("returns false when it has health", () => {
        expect(testShip.hasSunk()).toBe(false);
    });
});
