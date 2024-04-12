import * as THREE from 'three'

export function initRenderer()
{
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	return renderer;
}