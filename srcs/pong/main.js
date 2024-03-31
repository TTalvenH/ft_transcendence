import * as THREE from 'three'
import { PlayerEntity } from './entities/PlayerEntity.js';
import { PlaneEntity } from './entities/PlaneEntity.js';
import { WallEntity } from './entities/WallEntity.js';

const	scene = new THREE.Scene();
const	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const	renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const	ambient = new THREE.AmbientLight( {color: 0xffffff}, 0.1);
const	dirLight = new THREE.DirectionalLight( {color: 0xffffff}, 1);

const	player = new PlayerEntity();
const	wall1 = new WallEntity(new THREE.Vector3(0, -3, -0.05), 15, 0.1, 1);
const	wall2 = new WallEntity(new THREE.Vector3(0, 3, -0.05), 15, 0.1, 1);
const	plane = new PlaneEntity(new THREE.Vector3(0, 0, -0.05), window.innerWidth, window.innerHeight);

dirLight.target.position.set(0, 0, 0);
dirLight.position.set(2, 5, 0);
scene.add(player.meshComponent.mesh);
scene.add(plane.meshComponent.mesh);
scene.add(wall1.meshComponent.mesh);
scene.add(wall1.rectLight);
scene.add(wall2.meshComponent.mesh);
scene.add(ambient);
scene.add(dirLight.target);
scene.add(dirLight);

camera.position.set(0, 0, 5);

function initEventListener()
{
	document.addEventListener('keydown', (event) =>
	{
		switch (event.key)
		{
			case "ArrowRight":
				player.controlComponent.keyRight = true;
				break;
			case "ArrowLeft":
				player.controlComponent.keyLeft = true;
				break;
			case "ArrowUp":
				player.controlComponent.keyUp = true;
				break;
			case "ArrowDown":
				player.controlComponent.keyDown = true;
				break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key)
		{
			case "ArrowRight":
				player.controlComponent.keyRight = false;
				break;
			case "ArrowLeft":
				player.controlComponent.keyLeft = false;
				break;
			case "ArrowUp":
				player.controlComponent.keyUp = false;
				break;
			case "ArrowDown":
				player.controlComponent.keyDown = false;
				break;
		}
	});
}

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
	renderer.render(scene, camera);
	player.update(deltaTime);
}

initEventListener();
gameLoop();