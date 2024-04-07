import * as THREE from 'three'


export function collisionSystem(entities)
{
	const player1 = entities["Player1"];
	const player2 = entities["Player2"];
	const ball = entities["Ball"];
	const wall1 = entities["NeonBox1"];
	const wall2 = entities["NeonBox2"];

	if (player1.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		ball.movementComponent.velocity.x *= -1;
		ball.movementComponent.velocity.y += player1.movementComponent.velocity.y;

	}

	if (player2.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		ball.movementComponent.velocity.x *= -1;
	}
	
	if (wall1.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		console.log("boom wall1");
		ball.movementComponent.velocity.y *= -1;
	}
	
	if (wall2.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		console.log("boom wall2");
		ball.movementComponent.velocity.y *= -1;
	}
}