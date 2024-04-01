import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { PlayerEntity } from './entities/PlayerEntity.js';
import { PlaneEntity } from './entities/PlaneEntity.js';
import { NeonBoxEntity } from './entities/NeonBoxEntity.js';

const params = {
	threshold: 0,
	strength: 0.1,
	radius: 0,
	exposure: 1
};

const	scene = new THREE.Scene();
const	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const	renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );


const	ambient = new THREE.AmbientLight( {color: 0xffffff}, 0.1);
const	dirLight = new THREE.DirectionalLight( {color: 0xffffff}, 1);

const	renderScene = new RenderPass( scene, camera );

const	bloomPass = new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const	smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );

const	outputPass =  new OutputPass();
const	composer = new EffectComposer(renderer);

composer.addPass( renderScene );
composer.addPass( bloomPass );
composer.addPass( smaaPass );
composer.addPass( outputPass );

const gui = new GUI();

const bloomFolder = gui.addFolder( 'bloom' );

bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

	bloomPass.threshold = Number( value );

} );

bloomFolder.add( params, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

	bloomPass.strength = Number( value );

} );

gui.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

	bloomPass.radius = Number( value );

} );

const toneMappingFolder = gui.addFolder( 'tone mapping' );

toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

	renderer.toneMappingExposure = Math.pow( value, 4.0 );

} );


const	entities = [];

entities.push(new PlayerEntity());
entities.push(new NeonBoxEntity(new THREE.Vector3(0, -3, 0), 15, 0.1, 0.5));
entities.push(new NeonBoxEntity(new THREE.Vector3(0, 3, 0), 15, 0.1, 0.5));
entities.push(new PlaneEntity(new THREE.Vector3(0, 0, -0.25), window.innerWidth, window.innerHeight));

entities.forEach(entity => {
	entity.render(scene);
})

dirLight.target.position.set(0, 0, 0);
dirLight.position.set(2, 5, 0);
scene.add(ambient);
scene.add(dirLight.target);
scene.add(dirLight);


camera.position.set(0, 0, 5);

function initEventListener(entities)
{
	const player = entities.find(entity => entity instanceof PlayerEntity);
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
	composer.render(scene, camera);
	entities.forEach(entity => {
		entity.update(deltaTime);
	})
}

initEventListener(entities);
gameLoop();