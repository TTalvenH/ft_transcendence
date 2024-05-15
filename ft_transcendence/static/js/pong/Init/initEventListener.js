import { GameStates } from "../pong.js";
import { Game } from "../pong.js";
export function initEventListener(entities, gameGlobals) {
	const player1 = entities["Player1"];
	const player2 = entities["Player2"];

	document.addEventListener('keydown', (event) => {
		switch (event.key) {
			case "ArrowUp":
				player1.keyUp = true;
				break;
			case "ArrowDown":
				player1.keyDown = true;
				break;
			case "w":
				player2.keyUp = true;
				break;
			case "s":
				player2.keyDown = true;
				break;
			case "p":
				if (gameGlobals.gameState === GameStates.PAUSED || gameGlobals.gameState === GameStates.MENU)
				{
					gameGlobals.gameState = GameStates.PLAYING;
				}
				else if (gameGlobals.gameState === GameStates.PLAYING)
				{
					gameGlobals.gameState = GameStates.PAUSED;
				}
				break;
			case "t":
				if (gameGlobals.gameState === GameStates.MENU && gameGlobals.game === Game.PONG)
					gameGlobals.game = Game.KNOCKOFF;
				else if (gameGlobals.gameState === GameStates.MENU && gameGlobals.game === Game.KNOCKOFF)
					gameGlobals.game = Game.PONG;
				break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key) {
			case "ArrowRight":
				player1.keyRight = false;
				break;
			case "ArrowLeft":
				player1.keyLeft = false;
				break;
			case "ArrowUp":
				player1.keyUp = false;
				break;
			case "ArrowDown":
				player1.keyDown = false;
				break;
			case "d":
				player2.keyRight = false;
				break;
			case "a":
				player2.keyLeft = false;
				break;
			case "w":
				player2.keyUp = false;
				break;
			case "s":
				player2.keyDown = false;
				break;
		}
	});
}
