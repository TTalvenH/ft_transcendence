import * as THREE from 'three'
import { GameStates  } from '../pong.js';

export class CameraEntity
{
	constructor(gameGlobals)
	{
		const fov = 75;
		const width = window.innerWidth;
		const height = window.innerHeight;

		this.time = 0;
		this.shakeTime = 0;
		this.gameGlobals = gameGlobals;
		this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);

		// init position
		this.distance = 7;
		this.angle = 45 * Math.PI / 180; // Convert angle to radians
		this.initPosition = new THREE.Vector3(0, -this.distance * Math.cos(this.angle), this.distance * Math.sin(this.angle));
	}

	shakeCamera(deltaTime, strength)
	{
        if (this.shakeTime > 0)
		{
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

	infinityLoop(deltaTime, speed, radius)
	{
		// Calculate the new position of the camera
		let x = radius * Math.sin(this.time);
		let y = radius * Math.sin(this.time) * Math.cos(this.time);
		const targetPos = new THREE.Vector3(x, y, 7);
		// Update the camera's position

		this.camera.position.lerp(new THREE.Vector3(x, y, 7), 0.1);
	
		// Make the camera look at the center of the scene
		this.camera.lookAt(0, 0, 0);
	
		// Update 'time' to progress the animation
		this.time += speed * deltaTime;
	}


	playingLoop(deltaTime)
	{
		if (this.shakeTime > 0)
		{
			this.shakeCamera(deltaTime, 0.04);
			this.shakeTime -= 0.01
		}
		if (this.camera.position.distanceTo(this.initPosition) > 0.01)
		{
			this.camera.position.lerp( this.initPosition, 0.008 * deltaTime);
			this.camera.lookAt(0, 0, 0);
		}
	}

	render(scene)
	{

	}

	update(deltaTime)
	{
		switch (this.gameGlobals.gameState)
		{
			case GameStates.MENU:
				this.infinityLoop(deltaTime, 0.005, 6);
				break;
			case GameStates.PLAYING:
				this.playingLoop(deltaTime);
				break;
			case GameStates.PAUSED:
				break;
		}
	}
}