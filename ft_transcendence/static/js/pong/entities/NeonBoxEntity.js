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

        this.rectLights = [
            new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Front
            new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Back
            new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Top
            new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Bottom
            new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Right
            new THREE.RectAreaLight(color, this.lightIntensity, width, height), // Left
        ];

		this.rectLights[0].position.set(0, 0, depth / 2 + 0.001);
		this.rectLights[1].position.set(0, 0, -depth / 2 - 0.001);
		this.rectLights[2].position.set(0, height / 2 + 0.001, 0);
		this.rectLights[3].position.set(0, -height / 2 - 0.001, 0);
		this.rectLights[4].position.set(width / 2 + 0.001, 0, 0);
		this.rectLights[5].position.set(width / 2 - 0.001, 0, 0);

		this.rectLights[2].rotation.x = Math.PI / 2;
		this.rectLights[3].rotation.x = Math.PI / 2;
		this.rectLights[4].rotation.z = Math.PI / 2;
		this.rectLights[5].rotation.z = Math.PI / 2;

		this.rectLights[0].lookAt( 0, 0, depth / 2 + 1);
		this.rectLights[1].lookAt( 0, 0, -depth / 2 - 1);
		this.rectLights[2].lookAt( 0, height / 2 + 1, 0 );
		this.rectLights[3].lookAt( 0, -height / 2 - 1, 0 );
		this.rectLights[4].lookAt( width / 2 + 1, 0, 0 );
		this.rectLights[5].lookAt( width / 2 - 1, 0, 0 );

		// Geometry and Material
		this.object = new THREE.Group();
		this.object.add(this.mesh);
		this.object.add(this.rectLights[0]);
		this.object.add(this.rectLights[1]);
		this.object.add(this.rectLights[2]);
		this.object.add(this.rectLights[3]);
		this.object.add(this.rectLights[4]);
		this.object.add(this.rectLights[5]);
		
		this.object.position.copy(this.position);
		this.material.color.set(color);
		this.material.emissive.set(color);

		// this.mesh.geometry.computeBoundingBox();
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
			for (let i = 0; i < this.rectLights.length; i++){
				this.rectLights[i].intensity = this.lightIntensity; // Reset to the original intensity
			}
			this.material.emissiveIntensity = 1;
			this.isFlickering = false;
			return;
		}
		let emissiveIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker);
		let lightIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker) * 10;
		for (let i = 0; i < this.rectLights.length; i++) {
			this.rectLights[i].intensity = lightIntensity;
		}
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