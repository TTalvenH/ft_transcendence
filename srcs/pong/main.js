import * as THREE from 'three'
import { PlayerEntity } from './entities/PlayerEntity';
import { MeshComponent } from './components/MeshComponent';

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
scene.add(player.getComponent("MeshComponent").mesh);
scene.add(ambient);
scene.add(dirLight.target);
scene.add(dirLight);

camera.position.set(0, 0, 5);

function animate()
{
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

animate();