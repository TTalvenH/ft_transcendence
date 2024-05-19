import * as THREE from 'three';
import { Game } from './pong.js';

function handleDamage(wall, players, camera) {
    if (wall.isGoal === false) {
		wall.lightFlicker(0.7, 1, 3.0);
        return;
    }
	wall.lightFlicker(0, 1, 3.0);
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
    const intersects = raycaster.intersectObject(wall.object);
    if (intersects.length > 0) {
		ball.lightFlicker(0, 1, 3.0);
        handleDamage(wall, players, camera);
        const normal = intersects[0].normal.clone();
        const velocityPerpendicular = ball.direction.dot(normal);
		ball.direction.sub(normal.clone().multiplyScalar(2 * velocityPerpendicular));
    }
}

function handlePlayerCollision(ball, player) {
    const raycaster = new THREE.Raycaster(ball.position, ball.direction);
    const intersects = raycaster.intersectObject(player.object);
    
    if (intersects.length > 0) {
		ball.lightFlicker(0, 1, 6.0);
		player.lightFlicker(0, 1, 7.0);
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

export function collisionSystem(entities, game, deltaTime) {
	if (game === Game.PONG) {
		const ball = entities.pongEntities["Ball"];
		const walls = [
			entities.pongEntities["NeonBox1"],
			entities.pongEntities["NeonBox2"],
			entities.pongEntities["NeonBox3"],
			entities.pongEntities["NeonBox4"]
		];
		const players = [entities.pongEntities["Player1"], entities.pongEntities["Player2"]];
		const camera = entities.entities["Camera"];
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
	else if (game === Game.KNOCKOFF) {
		const player1 = entities.knockoffEntities["Player1"];
		const player2 = entities.knockoffEntities["Player2"];
		const camera = entities.entities["Camera"];

		// CCD steps
		const numberOfSteps = 20;
		const stepSize = deltaTime / numberOfSteps;
	
		for (let step = 0; step < numberOfSteps; step++) {
			const nextPosition1 = player1.position.clone().add(player1.velocity.clone().multiplyScalar((step + 1) * stepSize));
			const nextPosition2 = player2.position.clone().add(player2.velocity.clone().multiplyScalar((step + 1) * stepSize));
			// Check for collisions with players
			const distanceBetweenCenters = nextPosition1.distanceTo(nextPosition2);
			if (distanceBetweenCenters < player1.radius + player2.radius) {
				console.log("COLLISION");
				let fasterPlayer = player1;
				let slowerPlayer = player2;
				if (player2.velocity.length() > player1.velocity.length()) {
					fasterPlayer = player2;
					slowerPlayer = player1;
				}
				const normal = slowerPlayer.position.clone().sub(fasterPlayer.position).normalize();
				slowerPlayer.position.add(normal.clone().multiplyScalar(0.01));
				fasterPlayer.position.add(normal.clone().multiplyScalar(-0.01));
				const velocity = fasterPlayer.velocity.clone().add(slowerPlayer.velocity);
				const bounceBack = velocity.length();
				const bounceVelocity = normal.clone().multiplyScalar(bounceBack);
				slowerPlayer.velocity.copy(bounceVelocity.clone().multiplyScalar(1));
				fasterPlayer.velocity.copy(bounceVelocity.clone().multiplyScalar(-0.1));
			}
		}
		
	}
}