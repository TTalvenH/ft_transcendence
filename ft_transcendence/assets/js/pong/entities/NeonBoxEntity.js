import * as THREE from 'three'
import * as COLORS from '../colors.js';
export class NeonBoxEntity {
	constructor(position, width, height, depth, isGoal, color)
	{
		// Neon Light around the box
        this.lightIntensity = 10;

		this.position = position;
		this.isGoal = isGoal;
		// Mesh
		this.geometry = new THREE.BoxGeometry(width, height, depth, 100, 100, 100);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.rectLight = new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Back
		this.rectLight.position.set(0, 0, -depth / 2 - 0.001);
		this.rectLight.lookAt( 0, 0, -depth / 2 - 1);

		// Geometry and Material
		this.object = new THREE.Group();
		this.object.add(this.mesh);
		this.object.add(this.rectLight);

		this.object.position.copy(this.position);
		this.material.color.set(color);
		this.material.emissive.set(color);

		this.collisionBox = new THREE.Box3();
		this.collisionBox.setFromObject(this.object);
		this.flickerTime = 0;
		this.isFlickering = false;
	}
	
	lightFlicker(minFlicker, maxFlicker, flickerTime) {
		if (!this.isFlickering){
			this.flickerTime = flickerTime;
			this.isFlickering = true;
		}
		if (this.flickerTime <= 0) {
			this.rectLight.intensity = this.lightIntensity; // Reset to the original intensity
			this.material.emissiveIntensity = 1;
			this.isFlickering = false;
			return;
		}
		let emissiveIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker);
		let lightIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker) * 10;
		this.rectLight.intensity = lightIntensity;
		this.material.emissiveIntensity = emissiveIntensity;
		
		this.flickerTime -= 0.2 + 1/60;
		requestAnimationFrame(() => this.lightFlicker(minFlicker, maxFlicker, flickerTime));
	}

	render(scene) {
		scene.add(this.object);
	}
	
	update(deltaTime) {
	}
}