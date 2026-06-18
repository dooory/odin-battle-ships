import Dom from "./modules/dom.js";
import Game from "./modules/game.js";
import "./style/style.css";

Dom.setupAllSections();
Game.start("Player1", "Player2");
