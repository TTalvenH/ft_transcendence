import * as THREE from 'three'

export class PlaneEntity {
	constructor(position, color, emissive, ...args) {
		// Position
		this.position = position;

		// Mesh
		this.geometry = new THREE.PlaneGeometry(...args);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.material.color.set(color);
		this.material.emissive.set(color);
		this.material.emissiveIntensity = emissive;
		this.mesh.position.copy(this.position);
		this.object = new THREE.Object3D();
		this.object.add(this.mesh);
	}

	render(scene) {	
		scene.add(this.object);
	}	

	update(deltaTime) {
		
	}
}