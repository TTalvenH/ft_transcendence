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

const	scene = initScene();
const	camera = initCamera();
const	renderer = initRenderer();
const	composer = initPostProcessing(scene, camera, renderer);

const controls = new OrbitControls( camera, renderer.domElement );

const entities = {};
entities['Player1'] = new PlayerEntity(new THREE.Vector3(-2, 0, 0));
entities['Player2'] = new PlayerEntity(new THREE.Vector3(2, 0, 0));
entities['NeonBox1'] = new NeonBoxEntity(new THREE.Vector3(0, -3, 0), 10, 0.1, 0.5);
entities['NeonBox2'] = new NeonBoxEntity(new THREE.Vector3(0, 3, 0), 10, 0.1, 0.5);
entities['NeonBox3'] = new NeonBoxEntity(new THREE.Vector3(-5, 0, 0), 0.1, 6, 0.5);
entities['NeonBox4'] = new NeonBoxEntity(new THREE.Vector3(5, 0, 0), 0.1, 6, 0.5);
entities['Ball'] = new BallEntity();
entities['Plane'] = new PlaneEntity(new THREE.Vector3(0, 0, -0.25), window.innerWidth, window.innerHeight);

for (const key in entities) {
    if (entities.hasOwnProperty(key)) {
        const entity = entities[key];
        entity.render(scene);
    }
}

camera.position.set(0, 0, 5);

const	clock = new THREE.Clock();
const	clockDelta = new THREE.Clock();
const	interval = 1 / 60;
const	gameState = { state: false };

function gameLoop()
{
	requestAnimationFrame(gameLoop);

	if (clock.getElapsedTime() < interval) 
		return;

	clock.start();
	const deltaTime = clockDelta.getDelta() * 100;

	composer.render(scene, camera);
	if (gameState.state === true)
	{
		collisionSystem(entities);
		for (const key in entities) {
			if (entities.hasOwnProperty(key)) {
				const entity = entities[key];
				entity.update(deltaTime);
			}
		}
	}	
}

initEventListener(entities, gameState);
gameLoop();