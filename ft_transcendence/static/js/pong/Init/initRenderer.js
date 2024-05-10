import * as THREE from 'three'

export function initRenderer()
{
	const container = document.getElementById("game");

	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(window.innerWidth, window.innerHeight);

	const gameContainer = document.createElement('div');
	gameContainer.id = 'gameContainer';
	gameContainer.appendChild(renderer.domElement);
	gameContainer.style.minHeight = '600px';
	gameContainer.style.minWidth = '800px';
	document.getElementById('root').appendChild(gameContainer);

	return renderer;
}