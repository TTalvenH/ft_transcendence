import { GameStates } from "../pong.js";
import { Game } from "../pong.js";
export function initEventListener(entities, gameGlobals) {
	const pongPlayer1 = entities.pongEntities["Player1"];
	const pongPlayer2 = entities.pongEntities["Player2"];
	const knockoffPlayer1 = entities.knockoffEntities["Player1"];
	const knockoffPlayer2 = entities.knockoffEntities["Player2"];


	document.addEventListener('keydown', (event) => {
		switch (event.key) {
			case "ArrowUp":
				pongPlayer1.keyUp = true;
				knockoffPlayer1.keyUp = true;
				break;
			case "ArrowDown":
				pongPlayer1.keyDown = true;
				knockoffPlayer1.keyDown = true;
				break;
			case "ArrowRight":
				knockoffPlayer1.keyRight = true;
				break;
			case "ArrowLeft":
				knockoffPlayer1.keyLeft = true;
				break;
			case "w":
				pongPlayer2.keyUp = true;
				knockoffPlayer2.keyUp = true;
				break;
			case "s":
				pongPlayer2.keyDown = true;
				knockoffPlayer2.keyDown = true;
				break;
			case "a":
				knockoffPlayer2.keyLeft = true;
				break;
			case "d":
				knockoffPlayer2.keyRight = true;
				break;
			// case "p":
			// 	if (gameGlobals.gameState === GameStates.PAUSED || gameGlobals.gameState === GameStates.MENU)
			// 	{
			// 		gameGlobals.gameState = GameStates.PLAYING;
			// 	}
			// 	else if (gameGlobals.gameState === GameStates.PLAYING)
			// 	{
			// 		gameGlobals.gameState = GameStates.PAUSED;
			// 	}
			// 	break;
			// case "t":
			// 	if (gameGlobals.gameState === GameStates.MENU && gameGlobals.game === Game.PONG)
			// 		gameGlobals.game = Game.KNOCKOFF;
			// 	else if (gameGlobals.gameState === GameStates.MENU && gameGlobals.game === Game.KNOCKOFF)
			// 		gameGlobals.game = Game.PONG;
			// 	break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key) {
			case "ArrowRight":
				pongPlayer1.keyRight = false;
				knockoffPlayer1.keyRight = false;
				break;
			case "ArrowLeft":
				pongPlayer1.keyLeft = false;
				knockoffPlayer1.keyLeft = false;
				break;
			case "ArrowUp":
				pongPlayer1.keyUp = false;
				knockoffPlayer1.keyUp = false;
				break;
			case "ArrowDown":
				pongPlayer1.keyDown = false;
				knockoffPlayer1.keyDown = false;
				break;
			case "d":
				pongPlayer2.keyRight = false;
				knockoffPlayer2.keyRight = false;
				break;
			case "a":
				pongPlayer2.keyLeft = false;
				knockoffPlayer2.keyLeft = false;
				break;
			case "w":
				pongPlayer2.keyUp = false;
				knockoffPlayer2.keyUp = false;
				break;
			case "s":
				pongPlayer2.keyDown = false;
				knockoffPlayer2.keyDown = false;
				break;
		}
	});
}
