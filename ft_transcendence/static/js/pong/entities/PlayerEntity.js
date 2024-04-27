import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class PlayerEntity {
	constructor(initPosition, color) {
		this.initHitPoints = 1;
		this.hitPoints = this.initHitPoints;
		this.initPosition = initPosition.clone();
		this.position = this.initPosition.clone();

		// Movement
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.acceleration = 0;
		this.friction = 0;
		this.speed = 0.05

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

		this.acceleration = 0.1;
		this.friction = 0.1;
		this.mesh.position.copy( this.position );
		this.visualMesh.position.copy( this.position );
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
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
	}

	render(scene) {	
		scene.add(this.mesh);
		scene.add(this.visualMesh);
	}	
}