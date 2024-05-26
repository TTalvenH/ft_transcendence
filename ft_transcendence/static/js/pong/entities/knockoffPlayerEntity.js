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
		this.launchDirection = new THREE.Vector3(0, 0, 0,);
		this.launchVelocity = new THREE.Vector3(0, 0, 0,);
		this.launchSpeed = 0.0;
		this.friction = 0.025;
		this.gravity = 0.01;
		this.speed = 0.006;
		this.turnSpeed = 0.05;

		// Input keys
		this.keyUp = false;
		this.keyDown = false;
		this.keyRight = false;
		this.keyLeft = false;

		// Mesh
		this.radius = 0.5;
		this.geometry1 = new THREE.CircleGeometry(this.radius - 0.1, 64);
		this.geometry2 = new THREE.CircleGeometry(this.radius, 64);
		this.geometry3 = new THREE.CylinderGeometry(this.radius, this.radius, 0.001, 64);
		this.material1 = new THREE.MeshStandardMaterial();
		this.material2= new THREE.MeshStandardMaterial();
		this.object = new THREE.Object3D();
		this.mesh1 = new THREE.Mesh(this.geometry1, this.material2);
		this.mesh2 = new THREE.Mesh(this.geometry2, this.material1);
		this.mesh3 = new THREE.Mesh(this.geometry3, this.material1);
		
		this.pointLight = new THREE.PointLight( color, this.lightIntensity, 10);
		this.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-0.001), 0, color);
		
		this.object.add(this.mesh1);
		this.object.add(this.mesh2);
		this.object.add(this.mesh3);
		this.object.add(this.pointLight);
		this.object.add(this.arrowHelper);
		// init object data
		this.material1.emissive.set(color);
		this.material1.color.set(color);
		this.material1.transparent = true;
		this.material2.transparent = true;
		this.material1.opacity = 1.0;
		this.material2.opacity = 1.0;
		this.mesh1.position.set(0, 0, 0.001);
		this.mesh3.position.set(0, 0, -0.01);
		this.mesh3.rotation.x = -Math.PI/2;

		var darkColor = new THREE.Color(color);
		darkColor.multiplyScalar(0.6);
		this.material2.emissive.set(darkColor);
		this.material2.color.set(darkColor);
		
		
		this.flickerTime = 0;
		this.isFlickering = false;

		this.isFalling = false;
		this.spawnTimer = 0;
		this.object.position.copy(this.position);
	}	

	lightFlicker(minFlicker, maxFlicker, flickerTime) {
		if (!this.isFlickering){
			this.flickerTime = flickerTime;
			this.isFlickering = true;
		}
		if (this.flickerTime <= 0) {
			this.material1.emissiveIntensity = 1;
			this.isFlickering = false;
			return;
		}
		let emissiveIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker);
		this.material1.emissiveIntensity = emissiveIntensity;
		
		this.flickerTime -= 0.2 + 1/60;
		requestAnimationFrame(() => this.lightFlicker(minFlicker, maxFlicker, flickerTime));
	}

	update(deltaTime) {
		// Input
		const maxVelocity = 0.2;
		const minVelocity = -0.2;
		const exponent = 2;
		if (this.keyUp === true && !this.isFalling) {
			this.launchDirection.y += this.turnSpeed; 
			this.launchSpeed += this.speed * Math.pow((Math.abs(this.launchSpeed) - minVelocity) / (maxVelocity - minVelocity), exponent); 
		}
		if (this.keyDown === true && !this.isFalling) {
			this.launchDirection.y -= this.turnSpeed; 
			this.launchSpeed += this.speed * Math.pow((Math.abs(this.launchSpeed) - minVelocity) / (maxVelocity - minVelocity), exponent); 
		}
		if (this.keyRight === true && !this.isFalling) {
			this.launchDirection.x += this.turnSpeed; 
			this.launchSpeed += this.speed * Math.pow((Math.abs(this.launchSpeed) - minVelocity) / (maxVelocity - minVelocity), exponent); 
		}
		if (this.keyLeft === true && !this.isFalling) {
			this.launchDirection.x -= this.turnSpeed; 
			this.launchSpeed += this.speed * Math.pow((Math.abs(this.launchSpeed) - minVelocity) / (maxVelocity - minVelocity), exponent); 
		}
		
		this.launchSpeed = THREE.MathUtils.clamp(this.launchSpeed, minVelocity, maxVelocity);
		this.launchDirection.normalize();
		if (!this.isFalling && this.keyUp === false && this.keyDown === false && this.keyRight === false && this.keyLeft === false && this.launchSpeed > 0) {
			this.velocity.add(this.launchDirection.clone().multiplyScalar(this.launchSpeed));
			this.launchSpeed = 0;
			this.launchDirection = new THREE.Vector3(0, 0, 0);
			this.launchVelocity = new THREE.Vector3(0, 0, 0);
		}

		// Movement update
		if(!this.isFalling && this.velocity.length() > 0.000001) {
			this.velocity.lerp( new THREE.Vector3(0, 0, 0), this.friction * deltaTime );
		}

		// Falling
		if (this.isFalling) {
			this.fallingVelocity = this.velocity.clone();
			this.fallingVelocity.z = -0.2;
			this.velocity.lerp( this.fallingVelocity, this.gravity * deltaTime );
			const rotationSpeedFactor = 0.7; // Adjust as needed
			this.object.rotation.y += this.velocity.x * rotationSpeedFactor * deltaTime;
			this.object.rotation.x += -this.velocity.y * rotationSpeedFactor * deltaTime;
		}

		this.arrowHelper.setDirection(this.launchDirection);
		this.arrowHelper.setLength(this.launchSpeed * 20);
		this.position = this.position.clone().add( this.velocity.clone().multiplyScalar(deltaTime) );
		this.object.position.copy( this.position );

		if (Math.abs(this.position.y) > 3 || Math.abs(this.position.x) > 5) {
			this.isFalling = true;
			this.launchSpeed = 0;
			this.launchDirection = new THREE.Vector3(0, 0, 0);
			this.launchVelocity = new THREE.Vector3(0, 0, 0);
		}
		if (Math.abs(this.position.z) > 15) {
			this.isFalling = false;
			this.velocity = new THREE.Vector3(0, 0, 0);
			this.position = new THREE.Vector3(0, 0, 0);
			this.hitPoints--;
			if (this.hitPoints > 0) {
				this.object.position.copy(this.position);
				this.spawnTimer = 360;
			}
			this.object.rotation.set(0, 0, 0);
		}
		if (this.spawnTimer > 0) {
			const flashTime = 0.2;
			const flashInterval = 0.3;
			const opacity = Math.min(
				1,
				Math.max(0, 1 - (this.spawnTimer <= flashTime / 2 ? 1 : (this.spawnTimer <= flashTime ? 0 : 1 - (this.spawnTimer % (flashInterval * 2) < flashInterval ? 1 : 0))))
			);
			this.mesh1.material.opacity = opacity;
			this.mesh2.material.opacity = opacity;
			this.mesh3.material.opacity = opacity;
			this.pointLight.intensity = this.spawnTimer <= flashTime / 2 || this.spawnTimer % (flashInterval * 2) < flashInterval ? 0 : 1;
			this.spawnTimer -= deltaTime;
			if (this.spawnTimer <= 0) {
				this.mesh1.material.opacity = 1;
				this.mesh2.material.opacity = 1;
				this.mesh3.material.opacity = 1;
				this.pointLight.intensity = 1;
			}
		}
		console.log(this.spawnTimer);
	}
	render(scene) {	
		this.scene = scene;
		scene.add(this.object);
	}	
}