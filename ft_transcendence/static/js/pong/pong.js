import * as THREE from 'three'
import { initEventListener } from './Init/initEventListener.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PlayerEntity } from './entities/PlayerEntity.js';
import { PlaneEntity } from './entities/PlaneEntity.js';
import { NeonBoxEntity } from './entities/NeonBoxEntity.js';
import { initRenderer } from './Init/initRenderer.js';
import { initScene } from './Init/initScene.js';
import { initPostProcessing } from './Init/initPostProcessing.js';
import { BallEntity } from './entities/BallEntity.js';
import { collisionSystem } from './collisionSystem.js';
import { HealthBarEntity } from './entities/HealthBarEntity.js';
import { CameraEntity } from './entities/CameraEntity.js';
import * as COLORS from './colors.js';

export const	GameStates = Object.freeze({
	PAUSED: 0,
	PLAYING: 1,
	GAMEOVER: 2,
	MENU: 3,
});

export class Pong
{
	constructor()
	{
		this.entities = {};
		this.scene = initScene();
		this.gameGlobals = { gameState: GameStates.MENU };
		this.entities['Camera'] = new CameraEntity(this.gameGlobals);
		this.camera = this.entities['Camera'].camera;
		this.renderer = initRenderer();
		this.composer = initPostProcessing(this.scene, this.camera, this.renderer);
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		
		this.entities['Player1'] = new PlayerEntity(new THREE.Vector3(4, 0, 0), COLORS.FOLLY);
		this.entities['Player1Health'] = new HealthBarEntity(new THREE.Vector3(5, 5.5, 0), this.entities["Player1"]);
		this.entities['Player2'] = new PlayerEntity(new THREE.Vector3(-4, 0, 0), COLORS.SKYBLUE);
		this.entities['Player2Health'] = new HealthBarEntity(new THREE.Vector3(-5, 5.5, 0), this.entities["Player2"]);
		this.entities['NeonBox1'] = new NeonBoxEntity(new THREE.Vector3(0, -3, 0), 9.9, 0.1, 0.04, false, COLORS.INDIGO);
		this.entities['NeonBox2'] = new NeonBoxEntity(new THREE.Vector3(0, 3, 0), 9.9, 0.1, 0.04, false, COLORS.INDIGO);
		this.entities['NeonBox3'] = new NeonBoxEntity(new THREE.Vector3(-5, 0, 0), 0.1, 6.1, 0.04, true, COLORS.SKYBLUE);
		this.entities['NeonBox4'] = new NeonBoxEntity(new THREE.Vector3(5, 0, 0), 0.1, 6.1, 0.04, true, COLORS.FOLLY);
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
		

		
		this.clock = new THREE.Clock();
		this.clockDelta = new THREE.Clock();
		this.interval = 1 / 300
		initEventListener(this.entities, this.gameGlobals);
	}

	endGame()
	{
		this.scene.traverse((object) => {
			object.visible = false;
		})
	}

	checkGameOver()
	{
		const player1 = this.entities["Player1"];
		const player2 = this.entities["Player2"];
		const winner = {};

		if (player1.hitPoints <= 0)
			console.log("Player2 WINS!");
		else if (player2.hitPoints <= 0)
			console.log("Player1 WINS!");
		else
			return;
		this.gameGlobals.gameState = GameStates.GAMEOVER;
	}

	gameLoop()
	{
		requestAnimationFrame(() => this.gameLoop());
		if (this.clock.getElapsedTime() < this.interval) 
			return;
		
		this.clock.start();
		const deltaTime = this.clockDelta.getDelta() * 100;
		
		this.composer.render(this.scene, this.camera);

		switch (this.gameGlobals.gameState)
		{
			case GameStates.PAUSED:
				return;
			case GameStates.PLAYING:
				collisionSystem(this.entities, deltaTime);
				this.checkGameOver()
				for (const key in this.entities)
				{
					if (this.entities.hasOwnProperty(key))
					{
						const entity = this.entities[key];
						entity.update(deltaTime);
					}
				}
				break;
			case GameStates.MENU:
				break;
			case GameStates.GAMEOVER:
				this.endGame();
		}
		this.entities['Camera'].update(deltaTime);
		if (this.renderer.getSize(new THREE.Vector2()).x !== window.innerWidth || this.renderer.getSize(new THREE.Vector2()).y !== window.innerHeight)
		{
			this.entities['Camera'].camera.aspect = window.innerWidth / window.innerHeight;
			this.entities['Camera'].camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
	}
}
