import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class PlayerEntity {
	constructor(initPosition, color) {
		this.initHitPoints = 10;
		this.hitPoints = this.initHitPoints;
		this.initPosition = initPosition.clone();
		this.position = this.initPosition.clone();

		// Movement
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.acceleration = 0;
		this.friction = 0;
		this.speed = 0.09;

		// Input keys
		this.keyUp = false;
		this.keyDown = false;

		// Mesh
		this.height = 0.9;
		this.geometry = new THREE.BoxGeometry(0.1, this.height, 0.1);
		this.material = new THREE.MeshStandardMaterial();
		this.visualMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.75, 3, 10), this.material);
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.collisionBox = new THREE.Box3();
		this.mesh.visible = false;
		// init object data
		this.material.color.set(color);
		this.material.emissive.set(color);
		this.mesh.geometry.computeBoundingBox();

		this.flickerTime = 0;
		this.isFlickering = false;

		this.trailMeshes = [];
		this.trailLife = 3;

		this.acceleration = 0.1;
		this.friction = 0.1;
		this.mesh.position.copy( this.position );
		this.visualMesh.position.copy( this.position );
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
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
		if (newPosition.y >= minY && newPosition.y <= maxY)
		{
			this.position = newPosition;
			this.mesh.position.copy( this.position );
			this.visualMesh.position.copy( this.position );
		}
		this.mesh.position.copy( this.position );
		this.visualMesh.position.copy( this.position );
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
		let trailMesh = this.visualMesh.clone();
		// Create a new material for the trail mesh
		trailMesh.material = this.material.clone();
		trailMesh.material.transparent = true;
		this.trailMeshes.push(trailMesh);
		this.scene.add(trailMesh);

		// Fade out and remove old trail meshes
		for (let i = this.trailMeshes.length - 1; i >= 0; i--) {
			let mesh = this.trailMeshes[i];
			mesh.material.opacity -= deltaTime / this.trailLife;
			if (mesh.material.opacity <= 0) {
				this.scene.remove(mesh);
				this.trailMeshes.splice(i, 1);
			}
		}
	}

	render(scene) {	
		this.scene = scene;
		scene.add(this.mesh);
		scene.add(this.visualMesh);
	}	
}