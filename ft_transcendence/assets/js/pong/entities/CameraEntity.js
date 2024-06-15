import * as THREE from 'three'
import { GameStates  } from '../pong.js';

export class CameraEntity {
	constructor(gameGlobals) {
		const fov = 75;
		const width = window.innerWidth;
		const height = window.innerHeight;

		this.time = 0;
		this.shakeTime = 0;
		this.gameGlobals = gameGlobals;
		this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
		this.lookAt = new THREE.Vector3(0, 0, 0);
		this.targetLookAt = new THREE.Vector3(0, 0, 0);
		this.targetFov = 75;

		// init position
		this.distance = 7;
		this.angle = 45 * Math.PI / 180; // Convert angle to radians
		this.initPosition = new THREE.Vector3(0, -this.distance * Math.cos(this.angle), this.distance * Math.sin(this.angle));
	}

	setTargetLookAt(position){
		this.targetLookAt.copy(position);
	}

	shakeCamera(deltaTime, strength) {
        if (this.shakeTime > 0) {
            // Generate a random offset within the range defined by 'strength'
            let offsetX = (Math.random() - 0.5) * strength;
            let offsetY = (Math.random() - 0.5) * strength;
            let offsetZ = (Math.random() - 0.5) * strength;

            // Apply the offset to the camera's position
            this.camera.position.x += offsetX;
            this.camera.position.y += offsetY;
            this.camera.position.z += offsetZ;

            // Decrease the shakeTime
            this.shakeTime -= 0.01 * deltaTime;
		}
	}

	infinityLoop(deltaTime, speed, radius) {
		// Calculate the new position of the camera
		let x = radius * Math.sin(this.time);
		let y = radius * Math.sin(this.time) * Math.cos(this.time);
		const targetPos = new THREE.Vector3(x, y, 7);
		// Update the camera's position

		this.camera.position.lerp(new THREE.Vector3(x, y, 7), 0.1);
	
		// Update 'time' to progress the animation
		this.time += speed * deltaTime;
	}


	playingLoop(deltaTime) {
		if (this.shakeTime > 0) {
			this.shakeCamera(deltaTime, 0.04);
			this.shakeTime -= 0.01
		}
		if (this.camera.position.distanceTo(this.initPosition) > 0.01) {
			this.camera.position.lerp( this.initPosition, 0.008 * deltaTime);
		}
	}

	render(scene) {
	}

	update(deltaTime) {
		switch (this.gameGlobals.gameState) {
			case GameStates.MENU:
				this.infinityLoop(deltaTime, 0.003, 6);
				break;
			case GameStates.PLAYING:
				this.playingLoop(deltaTime);
				break;
			case GameStates.COUNTDOWN:
				this.playingLoop(deltaTime);
			case GameStates.PAUSED:
				break;
			case GameStates.GAMEOVER:
				this.infinityLoop(deltaTime, 0.01, 2);
				break;
		}
		if (this.lookAt.distanceTo(this.targetLookAt) > 0.01) {
			this.lookAt.lerp(this.targetLookAt, 0.030);
		}
		if (Math.abs(this.camera.fov - this.targetFov) > 0.1) {
			this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, 0.05);
			this.camera.updateProjectionMatrix();
		}
		this.camera.lookAt(this.lookAt);
	}
}