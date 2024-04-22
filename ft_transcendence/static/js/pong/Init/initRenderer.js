import * as THREE from 'three'

export function initRenderer()
{
	const container = document.getElementById("game");

	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setSize(container.clientWidth, container.clientHeight);
	// document.getElementById("neon-container").appendChild(renderer.domElement);
	document.body.appendChild(renderer.domElement);

	return renderer;
}