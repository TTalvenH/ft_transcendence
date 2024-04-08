import * as THREE from 'three'


export function collisionSystem(entities)
{
	const player1 = entities["Player1"];
	const player2 = entities["Player2"];
	const ball = entities["Ball"];
	const wall1 = entities["NeonBox1"];
	const wall2 = entities["NeonBox2"];
	const wall3 = entities["NeonBox3"];
	const wall4 = entities["NeonBox4"];

	if (player1.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		ball.velocity.x *= -1;
		ball.velocity.y += player1.velocity.y;

	}

	if (player2.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		ball.velocity.x *= -1;
	}
	
	if (wall1.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		console.log("boom wall1");
		ball.velocity.y *= -1;
	}
	
	if (wall2.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		console.log("boom wall2");
		ball.velocity.y *= -1;
	}

	if (wall3.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		console.log("boom wall3");
		ball.velocity.x *= -1;
	}
	
	if (wall4.collisionBox.intersectsSphere(ball.collisionSphere))
	{
		console.log("boom wall4");
		ball.velocity.x *= -1;
	}
}