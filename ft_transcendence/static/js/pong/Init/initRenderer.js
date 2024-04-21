import * as THREE from 'three'

export function initRenderer()
{
	const container = document.getElementById("neon-container");

	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setSize(window.innerWidth, window.innerHeight);

	const gameContainer = document.createElement('div');
	gameContainer.id = 'gameContainer';
	gameContainer.appendChild(renderer.domElement);
	document.getElementById('root').appendChild(gameContainer);

	return renderer;
}