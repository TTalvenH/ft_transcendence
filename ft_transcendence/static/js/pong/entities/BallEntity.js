import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class BallEntity {
	constructor() {
		// Position
		this.initPosition = new THREE.Vector3(0, 0, 0);
		this.position = this.initPosition.clone();
		this.radius = 0.08;

		// Generate random angles for x and y components within the specified range
		const minRandomAngle = -Math.PI / 4; // -45 degrees
		const maxRandomAngle = Math.PI / 4; // 45 degrees
		const randomAngleX = Math.random() * (maxRandomAngle - minRandomAngle) + minRandomAngle;
		const randomAngleY = Math.random() * (maxRandomAngle - minRandomAngle) + minRandomAngle;
		const maxXComponent = Math.cos(randomAngleX);
		const randomXComponent = Math.random() < 0.5 ? maxXComponent : -maxXComponent;

		// Movement
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.direction = new THREE.Vector3(randomXComponent, Math.sin(randomAngleY), 0);
		this.initSpeed = 0.03;
		this.speed = this.initSpeed;
		
		// Mesh
		this.geometry = new THREE.SphereGeometry(this.radius);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		// Effects
		this.lightIntensity = 0.5;
		this.pointLight = new THREE.PointLight( COLORS.SAFFRON, this.lightIntensity, 10);
		this.flickerTime = 0;
		this.isFlickering = false;

		// Trail
		this.trailLength = 10;
		this.trail = [];

		// Create the trail objects
		// init object data
		this.material.color.set(COLORS.SAFFRON);
		this.material.emissive.set(COLORS.SAFFRON);
		this.mesh.geometry.computeBoundingSphere();

		for (var i = 0; i < this.trailLength; i++) {
			var trailObject = this.mesh.clone(); // Clone the ball object
			trailObject.material = trailObject.material.clone(); // Clone the material
			trailObject.material.transparent = true; // Enable transparency
 			// Set the opacity based on the position in the trail
			this.trail.push(trailObject);
		}

	}
	lightFlicker(minFlicker, maxFlicker, flickerTime) {
		if (!this.isFlickering){
			this.flickerTime = flickerTime;
			this.isFlickering = true;
		}
		if (this.flickerTime <= 0) {
			this.pointLight.intensity = this.lightIntensity; // Reset to the original intensity
			this.material.emissiveIntensity = 1;
			this.isFlickering = false;
			return;
		}
		let emissiveIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker);
		let lightIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker) * 4;
		this.pointLight.intensity = lightIntensity;
		this.material.emissiveIntensity = emissiveIntensity;
		
		this.flickerTime -= 0.2 + 1/60;
		requestAnimationFrame(() => this.lightFlicker(minFlicker, maxFlicker, flickerTime));
	}
	update(deltaTime) {
		this.velocity = this.direction.clone().multiplyScalar(this.speed);
		this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
		this.position.z = 0;
		this.pointLight.position.copy(this.position);
		this.mesh.position.copy(this.position);
		this.mesh.position.copy(this.position);
		for (var i = this.trail.length - 1; i > 0; i--) {
			this.trail[i].position.copy(this.trail[i - 1].position);
			var factor = 7; // Adjust this to change the rate of decrease
			this.trail[i].material.opacity = Math.exp(-factor * i / this.trailLength); // Update the opacity based on the position in the trail
		}
		this.trail[0].position.copy(this.position);
		this.trail[0].material.opacity = 1; 
	}

	render(scene) {
		scene.add(this.mesh);
		scene.add(this.pointLight);
		for (var i = 0; i < this.trail.length; i++) {
			scene.add(this.trail[i]);
		}
	}
}