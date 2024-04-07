export function initEventListener(entities, gameState)
{
	const player1 = entities["Player1"];
	const player2 = entities["Player2"];
	document.addEventListener('keydown', (event) =>
	{
		switch (event.key)
		{
			case "ArrowRight":
				player1.controlComponent.keyRight = true;
				break;
			case "ArrowLeft":
				player1.controlComponent.keyLeft = true;
				break;
			case "ArrowUp":
				player1.controlComponent.keyUp = true;
				break;
			case "ArrowDown":
				player1.controlComponent.keyDown = true;
				break;
			case "p":
				gameState.state = !gameState.state;
				break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key)
		{
			case "ArrowRight":
				player1.controlComponent.keyRight = false;
				break;
			case "ArrowLeft":
				player1.controlComponent.keyLeft = false;
				break;
			case "ArrowUp":
				player1.controlComponent.keyUp = false;
				break;
			case "ArrowDown":
				player1.controlComponent.keyDown = false;
				break;
		}
	});

	document.addEventListener('keydown', (event) =>
	{
		switch (event.key)
		{
			case "d":
				player2.controlComponent.keyRight = true;
				break;
			case "a":
				player2.controlComponent.keyLeft = true;
				break;
			case "w":
				player2.controlComponent.keyUp = true;
				break;
			case "s":
				player2.controlComponent.keyDown = true;
				break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key)
		{
			case "d":
				player2.controlComponent.keyRight = false;
				break;
			case "a":
				player2.controlComponent.keyLeft = false;
				break;
			case "w":
				player2.controlComponent.keyUp = false;
				break;
			case "s":
				player2.controlComponent.keyDown = false;
				break;
		}
	});
}
