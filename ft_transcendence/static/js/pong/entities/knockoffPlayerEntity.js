import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class KnockoffPlayerEntity {
	constructor(initPosition, color) {
		this.initHitPoints = 3;
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
		this.keyRight = false;
		this.keyLeft = false;

		// Mesh
		this.radius = 0.5;
		this.geometry1 = new THREE.CircleGeometry(this.radius - 0.1, 64);
		this.geometry2= new THREE.CircleGeometry(this.radius, 64);
		this.material1 = new THREE.MeshStandardMaterial();
		this.material2= new THREE.MeshStandardMaterial();
		this.object = new THREE.Object3D();
		this.mesh1 = new THREE.Mesh(this.geometry1, this.material2);
		this.mesh2 = new THREE.Mesh(this.geometry2, this.material1);

		this.object.add(this.mesh1);
		this.object.add(this.mesh2);
		// init object data
		this.material1.emissive.set(color);
		this.material1.color.set(color);
		this.mesh1.position.set(0, 0, 0.001);

		var darkColor = new THREE.Color(color);
		darkColor.multiplyScalar(0.6);
		this.material2.emissive.set(darkColor);
		this.material2.color.set(darkColor);
		
		
		this.flickerTime = 0;
		this.isFlickering = false;
		
		this.acceleration = 0.1;
		this.friction = 0.1;

		this.object.position.copy(this.position);
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
		if (this.keyRight === true)
			targetVelocity.x += this.speed;
		if (this.keyLeft === true)
			targetVelocity.x -= this.speed;

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
			this.mesh.position.copy( this.position );
		}
		this.mesh.position.copy( this.position );
		this.mesh.position.copy( this.position );
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
		}

	render(scene) {	
		this.scene = scene;
		scene.add(this.object);
	}	
}