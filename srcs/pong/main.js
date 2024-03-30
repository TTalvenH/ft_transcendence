import * as THREE from 'three'
import { PlayerEntity } from './entities/PlayerEntity';

const	scene = new THREE.Scene();
const	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const	renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const	ambient = new THREE.AmbientLight( {color: 0xffffff}, 0.5);
const	dirLight = new THREE.DirectionalLight( {color: 0xffffff}, 1);

const	player = new PlayerEntity();


dirLight.target.position.set(0, 0, 0);
dirLight.position.set(2, 5, 0);
scene.add(player.getMesh());
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
				player.getComponent("ControlComponent").keyRight = true;
				break;
			case "ArrowLeft":
				player.getComponent("ControlComponent").keyLeft = true;
				break;
			case "ArrowUp":
				player.getComponent("ControlComponent").keyUp = true;
				break;
			case "ArrowDown":
				player.getComponent("ControlComponent").keyDown = true;
				break;
		}
	});
	
	document.addEventListener('keyup', (event) =>
	{
		switch (event.key)
		{
			case "ArrowRight":
				player.getComponent("ControlComponent").keyRight = false;
				break;
			case "ArrowLeft":
				player.getComponent("ControlComponent").keyLeft = false;
				break;
			case "ArrowUp":
				player.getComponent("ControlComponent").keyUp = false;
				break;
			case "ArrowDown":
				player.getComponent("ControlComponent").keyDown = false;
				break;
		}
	});
}


function animate()
{
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	player.update();

}

initEventListener();
animate();