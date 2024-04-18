import * as THREE from 'three'

export function initCamera()
{
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	let distance = 7;
	let angle = 45 * Math.PI / 180; // Convert angle to radians
	camera.position.set(0, -distance * Math.cos(angle), distance * Math.sin(angle)); // Only rotate on the horizontal axis
	return camera;
}