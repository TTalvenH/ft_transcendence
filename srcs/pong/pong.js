import * as THREE from 'three'
import { initEventListener } from './Init/initEventListener.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PlayerEntity } from './entities/PlayerEntity.js';
import { PlaneEntity } from './entities/PlaneEntity.js';
import { NeonBoxEntity } from './entities/NeonBoxEntity.js';
import { initRenderer } from './Init/initRenderer.js';
import { initCamera } from './Init/initCamera.js';
import { initScene } from './Init/initScene.js';
import { initPostProcessing } from './Init/initPostProcessing.js';
import { BallEntity } from './entities/BallEntity.js';
import { collisionSystem } from './collisionSystem.js';

export const	GameStates = Object.freeze({
	PAUSED: 0,
	PLAYING: 1,
	GAMEOVER: 2
});

export class Pong
{
	constructor()
	{
		this.scene = initScene();
		this.camera = initCamera();
		this.renderer = initRenderer();
		this.composer = initPostProcessing(this.scene, this.camera, this.renderer);
		this.gameStateWrapper = { gameState: GameStates.PAUSED };
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		
		this.entities = {};
		this.entities['Player1'] = new PlayerEntity(new THREE.Vector3(-4, 0, 0));
		this.entities['Player2'] = new PlayerEntity(new THREE.Vector3(4, 0, 0));
		this.entities['NeonBox1'] = new NeonBoxEntity(new THREE.Vector3(0, -3, 0), 10, 0.1, 0.5, false);
		this.entities['NeonBox2'] = new NeonBoxEntity(new THREE.Vector3(0, 3, 0), 10, 0.1, 0.5, false);
		this.entities['NeonBox3'] = new NeonBoxEntity(new THREE.Vector3(-5, 0, 0), 0.1, 6, 0.5, true);
		this.entities['NeonBox4'] = new NeonBoxEntity(new THREE.Vector3(5, 0, 0), 0.1, 6, 0.5, true);
		this.entities['Ball'] = new BallEntity();
		this.entities['Plane'] = new PlaneEntity(new THREE.Vector3(0, 0, -0.25), window.innerWidth, window.innerHeight);
		
		for (const key in this.entities)
		{
			if (this.entities.hasOwnProperty(key))
			{
				const entity = this.entities[key];
				entity.render(this.scene);
			}
		}
		
		this.camera.position.set(0, 0, 5);
		
		this.clock = new THREE.Clock();
		this.clockDelta = new THREE.Clock();
		this.interval = 1 / 60;

		initEventListener(this.entities, this.gameStateWrapper);
	}

	endGame()
	{
		this.scene.traverse((object) => {
			object.visible = false;
		})
	}

	gameLoop()
	{
		requestAnimationFrame(() => this.gameLoop());
		if (this.clock.getElapsedTime() < this.interval) 
			return;
	
		this.clock.start();
		const deltaTime = this.clockDelta.getDelta() * 100;
		
		this.composer.render(this.scene, this.camera);

		switch (this.gameStateWrapper.gameState)
		{
			case GameStates.PAUSED:
				return;
			case GameStates.PLAYING:
				collisionSystem(this.entities, deltaTime);
				for (const key in this.entities)
				{
					if (this.entities.hasOwnProperty(key))
					{
						const entity = this.entities[key];
						entity.update(deltaTime);
					}
				}
				break;
			case GameStates.GAMEOVER:
				this.endGame();
		}
	}
}
