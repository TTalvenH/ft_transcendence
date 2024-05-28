import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class PlayerEntity {
	constructor(initPosition, color) {
		this.initHitPoints = 3;
		this.hitPoints = this.initHitPoints;
		this.initPosition = initPosition.clone();
		this.position = this.initPosition.clone();

		// Movement
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.acceleration = 0.1;
		this.friction = 0.1;
		this.speed = 0.09;

		// Input keys
		this.keyUp = false;
		this.keyDown = false;

		// Mesh
		this.height = 0.9;
		this.geometry = new THREE.BoxGeometry(0.1, this.height, 0.1);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.75, 3, 10), this.material);
		this.collisionMesh = new THREE.Mesh(this.geometry, this.material);
		this.collisionBox = new THREE.Box3();
		this.collisionMesh.visible = false;

		// init object data
		this.material.color.set(color);
		this.material.emissive.set(color);

		this.flickerTime = 0;
		this.isFlickering = false;

		this.object = new THREE.Group();
		this.object.add(this.mesh);
		this.object.add(this.collisionMesh);
		this.object.position.copy(this.position);

		this.collisionBox.setFromObject(this.object);
	}	

	lightFlicker(minFlicker, maxFlicker, flickerTime) {
		if (!this.isFlickering){
			this.flickerTime = flickerTime;
			this.isFlickering = true;
		}
		if (this.flickerTime <= 0) {
			this.material.emissiveIntensity = 1;
			this.isFlickering = false;
			return;
		}
		let emissiveIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker);
		this.material.emissiveIntensity = emissiveIntensity;
		
		this.flickerTime -= 0.2 + 1/60;
		requestAnimationFrame(() => this.lightFlicker(minFlicker, maxFlicker, flickerTime));
	}

	update(deltaTime) {
		// Input
		let targetVelocity = new THREE.Vector3(0, 0, 0);

		if (this.keyUp === true)
			targetVelocity.y += this.speed;
		if (this.keyDown === true)
			targetVelocity.y -= this.speed;

		// Movement update
		if (targetVelocity.x !== 0 || targetVelocity.y !== 0 || targetVelocity.z !== 0)
			this.velocity.lerp( targetVelocity, this.acceleration * deltaTime );
		else
			this.velocity.lerp( new THREE.Vector3(0, 0, 0), this.friction * deltaTime );

		let newPosition = this.position.clone().add( this.velocity.clone().multiplyScalar(deltaTime) );
		let minY = -2.45;
		let maxY = 2.45;
		if (newPosition.y >= minY && newPosition.y <= maxY) {
			this.position = newPosition;
		}
		this.object.position.copy(this.position);
		this.collisionBox.setFromObject(this.object);
		}

	render(scene) {	
		this.scene = scene;
		scene.add(this.object);
	}	
}