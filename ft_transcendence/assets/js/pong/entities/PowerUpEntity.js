import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class PowerUpEntity {
	constructor(position) {
		// Position
		this.position = position;
		this.radius = 0.3;
		this.material = new THREE.MeshStandardMaterial();
		this.geometry1 = new THREE.BoxGeometry(0.3, 0.07, 0.07);
		this.geometry2 = new THREE.BoxGeometry(0.07, 0.3, 0.07);
		this.mesh1 = new THREE.Mesh(this.geometry1, this.material);
		this.mesh2 = new THREE.Mesh(this.geometry2, this.material);
		this.pointLight = new THREE.PointLight( COLORS.AQUAMARINE, 1, 10);
		this.object = new THREE.Object3D();
		this.object.add(this.mesh1);
		this.object.add(this.mesh2);
		this.object.add(this.pointLight);

		this.material.color.set(COLORS.AQUAMARINE);
		this.material.emissive.set(COLORS.AQUAMARINE);
		
		this.object.position.copy(this.position);
		this.object.rotateX(20);

		this.isVisible = false;
		this.object.scale.set(0, 0, 0);
		this.pointLight.intensity = 0;
		this.spawnTime = 300;

		this.object.updateMatrixWorld();
		this.material.needsUpdate = true;
		this.geometry1.computeBoundingBox();
		this.geometry2.computeBoundingBox();
	}

	render(scene) {	
		scene.add(this.object);
	}	

	update(deltaTime) {
		this.object.rotation.y += 0.03 * deltaTime;
		if ( !this.isVisible && this.spawnTime <= 0) {
			this.spawnTime = 400;
			this.isVisible = true;
			this.object.scale.set(1, 1, 1);
			this.pointLight.intensity = 1;
			this.object.position.x = Math.random() * 8 - 4;
			this.object.position.y = Math.random() * 5.4 - 2.7;
		}
		else if (!this.isVisible) {
			this.object.scale.set(0, 0, 0);
			this.pointLight.intensity = 0;
			this.spawnTime -= 0.2 * deltaTime;
		}
	}
}