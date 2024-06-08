import * as THREE from 'three'

export function initRenderer() {
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(window.innerWidth/1.3, window.innerHeight/1.3);
	const gameContainer = document.createElement('div');
	gameContainer.id = 'gameContainer';
	// gameContainer.appendChild(renderer.domElement);
	gameContainer.style.minHeight = '600px';
	gameContainer.style.minWidth = '800px';
	document.getElementById('root').appendChild(gameContainer);
	return renderer;
}