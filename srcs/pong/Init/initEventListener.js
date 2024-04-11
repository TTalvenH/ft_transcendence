import { GameStates } from "../pong.js";

export function initEventListener(entities, gameStateWrapper)
{
	const player1 = entities["Player1"];
	const player2 = entities["Player2"];
	document.addEventListener('keydown', (event) =>
	{
		switch (event.key)
		{
			case "ArrowRight":
				player1.keyRight = true;
				break;
			case "ArrowLeft":
				player1.keyLeft = true;
				break;
			case "ArrowUp":
				player1.keyUp = true;
				break;
			case "ArrowDown":
				player1.keyDown = true;
				break;
			case "d":
				player2.keyRight = true;
				break;
			case "a":
				player2.keyLeft = true;
				break;
			case "w":
				player2.keyUp = true;
				break;
			case "s":
				player2.keyDown = true;
				break;
			case "p":
				if (gameStateWrapper.gameState === GameStates.PAUSED)
				{
					gameStateWrapper.gameState = GameStates.PLAYING;
				}
				else if (gameStateWrapper.gameState === GameStates.PLAYING)
				{
					gameStateWrapper.gameState = GameStates.PAUSED;
				}
				break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key)
		{
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
