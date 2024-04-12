import * as THREE from 'three'

export function initCamera()
{
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	return camera;
}