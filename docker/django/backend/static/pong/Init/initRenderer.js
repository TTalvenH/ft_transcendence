import * as THREE from 'three'

export function initRenderer()
{
	const container = document.getElementById("game");
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setSize(container.clientWidth, container.clientHeight);
	// document.body.appendChild(renderer.domElement);
	container.appendChild(renderer.domElement);
	return renderer;
}