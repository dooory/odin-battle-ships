export default function Ship(length) {
    let hitCount = 0;

    function hit() {
        if (hasSunk()) {
            return false;
        }

        hitCount += 1;

        return hitCount;
    }

    function hasSunk() {
        return hitCount === length;
    }

    function getLength() {
        return length;
    }

    return {
        hit,
        hasSunk,
        getLength,
    };
}
