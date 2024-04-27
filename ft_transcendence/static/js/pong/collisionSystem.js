import * as THREE from 'three';


function handleDamage(wall, players, camera) {
    if (wall.isGoal === false) {
        return;
    }
    wall.flickerTime += 3;
    camera.shakeTime += 1.5;
    const player1DistanceFromWall = players[0].position.clone().sub(wall.position).length();
    const player2DistanceFromWall = players[1].position.clone().sub(wall.position).length();
    if (player1DistanceFromWall < player2DistanceFromWall) {
        players[0].hitPoints--;
    } else {
        players[1].hitPoints--;
    }
}

function handleWallCollision(ball, wall, players, camera) {
    const raycaster = new THREE.Raycaster(ball.position, ball.direction);
    const intersects = raycaster.intersectObject(wall.mesh);
    if (intersects.length > 0) {
        handleDamage(wall, players, camera);
        const normal = intersects[0].normal.clone();
        const velocityPerpendicular = ball.direction.dot(normal);
		ball.direction.sub(normal.clone().multiplyScalar(2 * velocityPerpendicular));
    }
}

function handlePlayerCollision(ball, player) {
    const raycaster = new THREE.Raycaster(ball.position, ball.direction);
    const intersects = raycaster.intersectObject(player.mesh);
    
    if (intersects.length > 0) {
        const normal = intersects[0].normal.clone();
        let relativeCollisionPoint = intersects[0].point.y - player.position.y;
        relativeCollisionPoint = 2 * (relativeCollisionPoint / player.height);
        const angleInDegrees = relativeCollisionPoint * 45;
        const angleInRadians = THREE.MathUtils.degToRad(angleInDegrees);
        if (normal.x > 0) {
            ball.direction = new THREE.Vector3(Math.cos(angleInRadians), Math.sin(angleInRadians), 0);
        } else {
            ball.direction = new THREE.Vector3(Math.cos(angleInRadians) * -1, Math.sin(angleInRadians), 0);
        }
		ball.speed += 0.003
    }
}

export function collisionSystem(entities, deltaTime) {
    const ball = entities["Ball"];
    const walls = [entities["NeonBox1"], entities["NeonBox2"], entities["NeonBox3"], entities["NeonBox4"]];
    const players = [entities["Player1"], entities["Player2"]];
    const camera = entities["Camera"];
	// CCD steps
    const numberOfSteps = 20;
    const stepSize = deltaTime / numberOfSteps;

    for (let step = 0; step < numberOfSteps; step++) {
        const nextPosition = ball.position.clone().add(ball.velocity.clone().multiplyScalar((step + 1) * stepSize));

        // Check for collisions with walls
        for (const wall of walls) {
            if (wall.collisionBox.intersectsSphere(new THREE.Sphere(nextPosition, ball.radius))) {
                handleWallCollision(ball, wall, players, camera);
            }
        }
        // Check for collisions with players
        for (const player of players) {
            if (player.collisionBox.intersectsSphere(new THREE.Sphere(nextPosition, ball.radius))) {
                handlePlayerCollision(ball, player);
            }
        }
    }
}