import Dom from "./modules/dom.js";
import Game from "./modules/game.js";
import "./style/style.css";

Game.start("Player1", "Player2");

const [board1, board2] = Game.getPlayerBoards();

board1.placeShip([8, 0], [8, 3]);
// board1.placeShip([4, 6], [0, 6]);
// board1.placeShip([4, 2], [4, 0]);
// board1.placeShip([9, 9], [9, 8]);

board2.placeShip([8, 0], [8, 3]);
// board2.placeShip([4, 6], [0, 6]);
// board2.placeShip([4, 2], [4, 0]);
// board2.placeShip([9, 9], [9, 8]);

Game.placeShips();
