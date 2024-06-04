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
import { TextEntity } from './entities/TextEntity.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { gameOverEvent, handleMatchEnd } from '../router.js';

import * as COLORS from './colors.js';
import { KnockoffPlayerEntity } from './entities/knockoffPlayerEntity.js';
import { PowerUpEntity } from './entities/PowerUpEntity.js';

export const	GameStates = Object.freeze({
	PAUSED: 0,
	PLAYING: 1,
	GAMEOVER: 2,
	MENU: 3,
	LOADING: 4,
	TRANSITIONING: 5,
	COUNTDOWN: 6
});

export const	Game = Object.freeze({
	PONG: 0,
	KNOCKOFF: 1
});

export class Pong
{
	constructor() {
		this.gameData = {};
		this.gameGlobals = { gameState: GameStates.LOADING, game: Game.PONG };
		this.currentGame = this.gameGlobals.game;
		const loadingManager = new THREE.LoadingManager();
		const loader = new FontLoader(loadingManager);
		loader.load('static/fonts/jersey10-regular.json', (font) => {
			this.font = font;
		});
		
		loadingManager.onLoad = () => {
			this.gameInit();
			this.gameGlobals.gameState = GameStates.MENU;
		};
		this.gameLoop();
	}

	gameInit() {
		this.entities = {};
		this.pongEntities = {};
		this.knockoffEntities = {};
		this.allEntities = {
			entities: this.entities,
			pongEntities: this.pongEntities,
			knockoffEntities: this.knockoffEntities
		};
		this.scene = initScene();
		this.entities['Camera'] = new CameraEntity(this.gameGlobals);
		this.camera = this.entities['Camera'].camera;
		this.renderer = initRenderer();
		this.composer = initPostProcessing(this.scene, this.camera, this.renderer);
		
		// Pong
		this.pongEntities['Player1'] = new PlayerEntity(new THREE.Vector3(4, 0, 0), COLORS.FOLLY);
		this.pongEntities['Player2'] = new PlayerEntity(new THREE.Vector3(-4, 0, 0), COLORS.SKYBLUE);
		this.pongEntities['NeonBox1'] = new NeonBoxEntity(new THREE.Vector3(0, -3, 0), 9.9, 0.1, 0.04, false, COLORS.INDIGO);
		this.pongEntities['NeonBox2'] = new NeonBoxEntity(new THREE.Vector3(0, 3, 0), 9.9, 0.1, 0.04, false, COLORS.INDIGO);
		this.pongEntities['NeonBox3'] = new NeonBoxEntity(new THREE.Vector3(-5, 0, 0), 0.1, 6.1, 0.04, true, COLORS.SKYBLUE);
		this.pongEntities['NeonBox4'] = new NeonBoxEntity(new THREE.Vector3(5, 0, 0), 0.1, 6.1, 0.04, true, COLORS.FOLLY);
		this.pongEntities['Ball'] = new BallEntity();
		this.pongEntities['Plane'] = new PlaneEntity(new THREE.Vector3(0, 0, -0.25), 0x3A0CA3, 0, window.innerWidth, window.innerHeight);
		
		// Knockoff
		this.knockoffEntities['Player1'] = new KnockoffPlayerEntity(new THREE.Vector3(4, 0, 0.0001), COLORS.FOLLY);
		this.knockoffEntities['Player2'] = new KnockoffPlayerEntity(new THREE.Vector3(-4, 0, 0), COLORS.SKYBLUE);
		this.knockoffEntities['NeonBox1'] = new NeonBoxEntity(new THREE.Vector3(0, -3, -0.25), 10, 0.01, 0.01, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox2'] = new NeonBoxEntity(new THREE.Vector3(0, 3, -0.25), 10, 0.01, 0.01, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox3'] = new NeonBoxEntity(new THREE.Vector3(-5, 0, -0.25), 0.01, 6, 0.01, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox4'] = new NeonBoxEntity(new THREE.Vector3(5, 0, -0.25), 0.01, 6, 0.01, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox5'] = new NeonBoxEntity(new THREE.Vector3(5, 3, -7.75), 0.01, 0.01, -15, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox6'] = new NeonBoxEntity(new THREE.Vector3(5, -3, -7.75), 0.01, 0.01, -15, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox7'] = new NeonBoxEntity(new THREE.Vector3(-5, 3, -7.75), 0.01, 0.01, -15, false, COLORS.INDIGO);
		this.knockoffEntities['NeonBox8'] = new NeonBoxEntity(new THREE.Vector3(-5, -3, -7.75), 0.01, 0.01, -15, false, COLORS.INDIGO);
		this.knockoffEntities['Floor'] = new PlaneEntity(new THREE.Vector3(0, 0, -0.25), COLORS.INDIGO, 0.01, 10, 6);

		// Entities
		this.entities['User1Name'] = new TextEntity("Guest1", new THREE.Vector3(6, 7.7, 0), this.font, COLORS.INDIGO);
		this.entities['User2Name'] = new TextEntity("Guest2", new THREE.Vector3(-6, 7.7, 0), this.font, COLORS.INDIGO);
		this.entities['Countdown'] = new TextEntity("", new THREE.Vector3(0, 0, 3), this.font, COLORS.INDIGO, this.camera);
		this.entities['WinnerName'] = new TextEntity("", new THREE.Vector3(0, 0, 3), this.font, COLORS.INDIGO, this.camera);
		this.entities['Player1Health'] = new HealthBarEntity(new THREE.Vector3(5, 5.5, 0), this.pongEntities["Player1"]);
		this.entities['Player2Health'] = new HealthBarEntity(new THREE.Vector3(-5, 5.5, 0), this.pongEntities["Player2"]);
		this.entities['PowerUp1'] = new PowerUpEntity(new THREE.Vector3(0, 0, 0));
		
		// Render all entities
		for (const key in this.pongEntities) {
			if (this.pongEntities.hasOwnProperty(key)) {
				const entity = this.pongEntities[key];
				entity.render(this.scene);
			}
		}
		for (const key in this.entities) {
			if (this.entities.hasOwnProperty(key)) {
				const entity = this.entities[key];
				entity.render(this.scene);
			}
		}
		for (const key in this.knockoffEntities) {
			if (this.knockoffEntities.hasOwnProperty(key)) {
				const entity = this.knockoffEntities[key];
				entity.render(this.scene);
			}
		}

		this.gameClock = new THREE.Clock();
		this.clockDelta = new THREE.Clock();
		this.matchTime = new THREE.Clock();
		this.matchDate = {};
		this.isWinnerLoopOn = false;
		this.winnerText = "";

		initEventListener(this.allEntities, this.gameGlobals);	

		Object.values(this.knockoffEntities).forEach(entity => {
			entity.object.visible = false;
		});
	}

	async startCountDown() {
		const countDown = this.entities['Countdown'];
		const camera = this.entities['Camera'];
		let i = 3;
		this.gameGlobals.gameState = GameStates.COUNTDOWN;

		while (i >= 0) {
			countDown.setText(i.toString());
			await new Promise(resolve => setTimeout(resolve, 1000));
			i--;
		}
		camera.setTargetLookAt(new THREE.Vector3(0, 0, 0));
		countDown.setText("");
		this.matchTime.start();
		this.matchDate = new Date();
		this.gameGlobals.gameState = GameStates.PLAYING;
	}

	async winnerLoop() {
		const winnerName = this.entities['WinnerName'];
		const camera = this.entities['Camera'];

		this.isWinnerLoopOn = true;
		winnerName.setText(this.winnerText);
		camera.setTargetLookAt(winnerName.position);
		await new Promise(resolve => setTimeout(resolve, 5000));
		camera.setTargetLookAt(new THREE.Vector3(0, 0, 0));
		this.isWinnerLoopOn = false;
	}

	startGame(data) {
		this.gameData = data;
		const user1Name = this.entities['User1Name']
		const user2Name = this.entities['User2Name']
		
		user1Name.setText(data.player1);
		user2Name.setText(data.player2);
		user1Name.text = data.player1;
		user2Name.text = data.player2;
		this.startCountDown();
	}

	resetGame(deltaTime) {
		const pongPlayer1 = this.pongEntities["Player1"];
		const pongPlayer2 = this.pongEntities["Player2"];
		const knockoffPlayer1 = this.knockoffEntities["Player1"];
		const knockoffPlayer2 = this.knockoffEntities["Player2"];
		const healthBar1 = this.entities["Player1Health"];
		const healthBar2 = this.entities["Player2Health"];
		const ball = this.pongEntities["Ball"];
		const camera = this.entities['Camera'];
		const winnerName = this.entities['WinnerName'];

		if (this.isWinnerLoopOn){
			return;
		}

		camera.targetFov = 180;
		if (Math.abs(this.camera.fov - camera.targetFov) > 0.1) {
			return;
		}

		Object.values(this.pongEntities).concat(Object.values(this.knockoffEntities)).forEach(entity => {
			entity.object.visible = false;
		});
		
		if (this.gameGlobals.game === Game.KNOCKOFF) {
			healthBar1.setPlayerRef(knockoffPlayer1);
			healthBar2.setPlayerRef(knockoffPlayer2);
			Object.values(this.knockoffEntities).forEach(entity => {
				entity.object.visible = true;
			});
			this.knockoffEntities['Player1'].pointLight.intensity = 1;
			this.knockoffEntities['Player2'].pointLight.intensity = 1;
		}
		else if (this.gameGlobals.game === Game.PONG) {
			healthBar1.setPlayerRef(pongPlayer1);
			healthBar2.setPlayerRef(pongPlayer2);
			Object.values(this.pongEntities).forEach(entity => {
				entity.object.visible = true;
			});
		}

		winnerName.setText("");
		pongPlayer1.position.copy(pongPlayer1.initPosition);
		pongPlayer1.hitPoints = pongPlayer1.initHitPoints;
		pongPlayer2.position.copy(pongPlayer2.initPosition);
		pongPlayer2.hitPoints = pongPlayer2.initHitPoints;
		knockoffPlayer1.position.copy(knockoffPlayer1.initPosition);
		knockoffPlayer1.object.rotation.set(0, 0, 0);
		knockoffPlayer1.hitPoints = knockoffPlayer1.initHitPoints;
		knockoffPlayer1.velocity.set(0, 0, 0);
		knockoffPlayer1.launchSpeed = 0;
		knockoffPlayer1.spawnTimer = 0;
		knockoffPlayer1.mesh1.material.opacity = 1;
		knockoffPlayer1.mesh2.material.opacity = 1;
		knockoffPlayer1.mesh3.material.opacity = 1;
		knockoffPlayer1.pointLight.intensity = 1;
		knockoffPlayer2.position.copy(knockoffPlayer2.initPosition);
		knockoffPlayer2.object.rotation.set(0, 0, 0);
		knockoffPlayer2.hitPoints = knockoffPlayer2.initHitPoints;
		knockoffPlayer2.velocity.set(0, 0, 0);
		knockoffPlayer2.launchSpeed = 0;
		knockoffPlayer2.spawnTimer = 0;
		knockoffPlayer2.mesh1.material.opacity = 1;
		knockoffPlayer2.mesh2.material.opacity = 1;
		knockoffPlayer2.mesh3.material.opacity = 1;
		knockoffPlayer2.pointLight.intensity = 1;
		
		this.entities['PowerUp1'].object.scale.set(0, 0, 0);
		this.entities['PowerUp1'].pointLight.intensity = 0;
		this.entities['PowerUp1'].isVisible = false;
		this.entities['PowerUp1'].spawnTime = 300;
		

		ball.position.copy(ball.initPosition);
		ball.speed = ball.initSpeed;
		ball.trail.forEach(trailMesh => {
			trailMesh.position.set(0, 0, 0);
		});

		for (const key in this.pongEntities) {
			if (this.pongEntities.hasOwnProperty(key)) {
				const entity = this.pongEntities[key];
				entity.update(deltaTime);
			}
		}

		for (const key in this.knockoffEntities) {
			if (this.knockoffEntities.hasOwnProperty(key)) {
				const entity = this.knockoffEntities[key];
				entity.update(deltaTime);
			}
		}
		healthBar1.update(deltaTime);
		healthBar2.update(deltaTime);
		camera.targetFov = 75;
		this.gameGlobals.gameState = GameStates.MENU;
	}

	checkGameOver() {
		let player1, player2;
		if (this.gameGlobals.game === Game.PONG) {
			player1 = this.pongEntities["Player1"];
			player2 = this.pongEntities["Player2"];
		}
		else if (this.gameGlobals.game === Game.KNOCKOFF) {
			player1 = this.knockoffEntities["Player1"];
			player2 = this.knockoffEntities["Player2"];
		}
		const userName1 = this.entities["User1Name"];
		const userName2 = this.entities["User2Name"];
		const goal1 = this.pongEntities["NeonBox3"];
		const goal2 = this.pongEntities["NeonBox4"];
		let winner = {};

		if (player1.hitPoints <= 0) {
			console.log("Player2 WINS!");
			winner = userName2.text;
			this.winnerText = "Winner is " + userName2.text + " !";
		} else if (player2.hitPoints <= 0) {
			console.log("Player1 WINS!");
			winner = userName1.text;
			this.winnerText = "Winner is " + userName1.text + " !";
		} else {
			return;
		}

		//todo add game type. tournament or 1v1
		const gameOverData = {
			game: this.gameGlobals.game,
			player1: {
				username: this.gameData.player1,
				id: this.gameData.player1_id,
				hitpoints: player1.hitPoints,
			},
			player2: {
				name: this.gameData.player2,
				id: this.gameData.player2_id,
				hitpoints: player2.hitPoints,
			},
			winner: winner,
			matchTimeLength: this.matchTime.getElapsedTime().toFixed(2) + "s",
			dateTime: this.matchDate,
		};

		goal1.material.emissiveIntensity = 1;
		goal2.material.emissiveIntensity = 1;
		gameOverEvent.detail.gameOverData = gameOverData;
		handleMatchEnd(gameOverData);
		this.winnerLoop();
		this.gameGlobals.gameState = GameStates.GAMEOVER;
	}

	changeGame() {
		if (this.gameGlobals.game === Game.PONG) {
			this.gameGlobals.game = Game.KNOCKOFF;
		}
		else if (this.gameGlobals.game === Game.KNOCKOFF) {
			this.gameGlobals.game = Game.PONG;
		}
	}

	toggleButton(){
		const gameToggle = document.getElementById('check');
		if (this.gameGlobals.gameState !== GameStates.TRANSITIONING) {
			gameToggle.disabled = false;	
		}
	}

	hasGameChanged(){
		if (this.currentGame !== this.gameGlobals.game) {
			this.gameGlobals.gameState = GameStates.TRANSITIONING;
			this.currentGame = this.gameGlobals.game;
		}
	}

	update(deltaTime) {
		this.entities['Player1Health'].update(deltaTime);
		this.entities['Player2Health'].update(deltaTime);
		this.entities['PowerUp1'].update(deltaTime);
		if (this.gameGlobals.game === Game.PONG) {
			for (const key in this.pongEntities) {
				const entity = this.pongEntities[key];
				entity.update(deltaTime);
			}
		}
		else if (this.gameGlobals.game === Game.KNOCKOFF) {
			for (const key in this.knockoffEntities) {
				const entity = this.knockoffEntities[key];
				entity.update(deltaTime);
			}
		}
	}
	gameLoop() {
		requestAnimationFrame(() => this.gameLoop());
		if ( this.gameGlobals.gameState === GameStates.LOADING) {
			return;
		}
		const deltaTime = this.clockDelta.getDelta() * 100;
		this.composer.render(this.scene, this.camera);
		switch (this.gameGlobals.gameState) {
			case GameStates.PAUSED:
				return;
			case GameStates.PLAYING:
				collisionSystem(this.allEntities, this.gameGlobals.game, deltaTime);
				this.checkGameOver()
				this.update(deltaTime);
				break;
			case GameStates.MENU:
				this.hasGameChanged();
				break;
			case GameStates.GAMEOVER:
				this.resetGame(deltaTime);
				break;
			case GameStates.TRANSITIONING:
				this.resetGame(deltaTime);
				break;
		}
		this.toggleButton();
		this.entities['Camera'].update(deltaTime);
		this.entities['Countdown'].update(deltaTime);
		this.entities['WinnerName'].update(deltaTime);
		const { width, height } = this.renderer.getSize(new THREE.Vector2());
		if (width !== window.innerWidth || height !== window.innerHeight) {
			this.entities['Camera'].camera.aspect = window.innerWidth / window.innerHeight;
			this.entities['Camera'].camera.updateProjectionMatrix();
			if (window.innerWidth > 800 && window.innerHeight > 600)
				this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
	}
}
