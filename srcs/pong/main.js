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

const	scene = initScene();
const	camera = initCamera();
const	renderer = initRenderer();
const	composer = initPostProcessing(scene, camera, renderer);

const controls = new OrbitControls( camera, renderer.domElement );

const	entities = [];	

entities.push(new PlayerEntity());
entities.push(new PlayerEntity());
entities.push(new NeonBoxEntity(new THREE.Vector3(0, -3, 0), 15, 0.1, 0.5));
entities.push(new NeonBoxEntity(new THREE.Vector3(0, 3, 0), 15, 0.1, 0.5));
entities.push(new PlaneEntity(new THREE.Vector3(0, 0, -0.25), window.innerWidth, window.innerHeight));

entities.forEach(entity => {
	entity.render(scene);
})

camera.position.set(0, 0, 5);

const	clock = new THREE.Clock();
const	clockDelta = new THREE.Clock();
const	interval = 1 / 60;

function gameLoop()
{
	requestAnimationFrame(gameLoop);

	if (clock.getElapsedTime() < interval) 
		return;

	clock.start();
	const deltaTime = clockDelta.getDelta() * 100;
	composer.render(scene, camera);
	entities.forEach(entity => {
		entity.update(deltaTime);
	})
}

initEventListener(entities);
gameLoop();