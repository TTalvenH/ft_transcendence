import * as THREE from 'three'


function handleDamage(wall, players)
{
    if (wall.isGoal === false)
        return;

    const player1DistanceFromWall = players[0].position.clone().sub(wall.position).length();
    const player2DistanceFromWall = players[1].position.clone().sub(wall.position).length();
    if (player1DistanceFromWall < player2DistanceFromWall)
        players[0].hitPoints --;
    else
        players[1].hitPoints --;
}

function handleWallCollision(ball, wall, players)
{
    const raycaster = new THREE.Raycaster(ball.position, ball.direction);
    const intersects = raycaster.intersectObject(wall.mesh);
    if (intersects.length > 0)
    {
        handleDamage(wall, players);
        const normal = intersects[0].normal.clone();
        const velocityPerpendicular = ball.direction.dot(normal);
		ball.direction.sub(normal.clone().multiplyScalar(2 * velocityPerpendicular));
    }
}

function handlePlayerCollision(ball, player)
{
	const raycaster = new THREE.Raycaster(ball.position, ball.direction);
    const intersects = raycaster.intersectObject(player.mesh);
    let sign = 0;
    if (intersects.length > 0)
    {
		const normal = intersects[0].normal.clone();
        const velocityPerpendicular = ball.direction.dot(normal);
		ball.direction.sub(normal.clone().multiplyScalar(2 * velocityPerpendicular));
		ball.speed += 0.005
    }
}

export function collisionSystem(entities, deltaTime)
{
    const ball = entities["Ball"];
    const walls = [entities["NeonBox1"], entities["NeonBox2"], entities["NeonBox3"], entities["NeonBox4"]];
    const players = [entities["Player1"], entities["Player2"]];
    
	// CCD steps
    const numberOfSteps = 10;
    const stepSize = deltaTime / numberOfSteps;

    for (let step = 0; step < numberOfSteps; step++)
	{
        const nextPosition = ball.position.clone().add(ball.velocity.clone().multiplyScalar((step + 1) * stepSize));

        // Check for collisions with walls
        for (const wall of walls)
        {
            if (wall.collisionBox.intersectsSphere(new THREE.Sphere(nextPosition, ball.radius)))
            {
                handleWallCollision(ball, wall, players);
            }
        }
        // Check for collisions with players
        for (const player of players)
        {
            if (player.collisionBox.intersectsSphere(new THREE.Sphere(nextPosition, ball.radius)))
            {
                handlePlayerCollision(ball, player);
            }
        }
    }
}