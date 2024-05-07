import * as THREE from 'three'

export function initRenderer() {
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(window.innerWidth, window.innerHeight);

	const gameContainer = document.createElement('div');
	gameContainer.id = 'gameContainer';
	gameContainer.appendChild(renderer.domElement);
	document.getElementById('root').insertBefore(gameContainer, document.getElementById('root').firstChild);

	return renderer;
}