import * as THREE from 'three'

function handleWallCollision(ball, wall)
{
    const velocity = ball.velocity.clone().normalize();
    const raycaster = new THREE.Raycaster(ball.position, velocity);
    const intersects = raycaster.intersectObject(wall.mesh);
	if (intersects.length > 0)
	{
		const normal = intersects[0].normal.clone();
		const velocityPerpendicular = ball.velocity.dot(normal);
		ball.velocity.sub(normal.clone().multiplyScalar(2 * velocityPerpendicular));
	}
}

function handlePlayerCollision(ball, player)
{
    const velocity = ball.velocity.clone().normalize();
    const raycaster = new THREE.Raycaster(ball.position, velocity);
    const intersects = raycaster.intersectObject(player.mesh);
	let sign = 0;
	if (intersects.length > 0)
	{
		const	normal = intersects[0].normal.clone();
		if (normal.x > 0)
			sign = -1;
		else
			sign = 1;
		const	hitDirection = ball.position.clone().sub(player.position);
		const	cross = hitDirection.cross(normal);
		console.log(cross);
		ball.velocity.negate();
		ball.velocity.y = cross.z * 0.1 * sign;
	}
}

export function collisionSystem(entities)
{
	const ball = entities["Ball"];
	const walls = [entities["NeonBox1"], entities["NeonBox2"], entities["NeonBox3"], entities["NeonBox4"]];
	const players = [entities["Player1"], entities["Player2"]];
	const newPosition = ball.position.clone().add(ball.velocity);
	for (const wall of walls)
	{
        if (wall.collisionBox.intersectsSphere(new THREE.Sphere(newPosition, ball.radius)))
		{
            handleWallCollision(ball, wall);
        }
    }
	for (const player of players)
	{
		if (player.collisionBox.intersectsSphere(new THREE.Sphere(newPosition, ball.radius)))
		{
			handlePlayerCollision(ball, player);
		}
	}
}