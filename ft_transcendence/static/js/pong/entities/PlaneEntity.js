import * as THREE from 'three'

export class PlaneEntity {
	constructor(position, ...args) {
		// Position
		this.position = position;

		// Mesh
		this.geometry = new THREE.PlaneGeometry(...args);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.material.color.set(0x3A0CA3);
		this.mesh.position.copy(this.position);
	}

	render(scene) {	
		scene.add(this.mesh);
	}	

	update(deltaTime) {

	}
}