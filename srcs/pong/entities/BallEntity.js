import * as THREE from 'three'

export class BallEntity
{
	constructor()
	{
		// Position
		this.position = new THREE.Vector3(0, 0, 0);;
		this.radius = 0.05;

		// Generate random angles for x and y components within the specified range
		const minRandomAngle = -Math.PI / 4; // -45 degrees
		const maxRandomAngle = Math.PI / 4; // 45 degrees
		const randomAngleX = Math.random() * (maxRandomAngle - minRandomAngle) + minRandomAngle;
		const randomAngleY = Math.random() * (maxRandomAngle - minRandomAngle) + minRandomAngle;
		const maxXComponent = Math.cos(randomAngleX);
		const randomXComponent = Math.random() < 0.5 ? maxXComponent : -maxXComponent;

		// Movement
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.direction = new THREE.Vector3(randomXComponent, Math.sin(randomAngleY), 0);;
		this.speed = 0.03;
		this.acceleration = 0;
		this.friction = 0;
		
		// Mesh
		this.geometry = new THREE.SphereGeometry(this.radius);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		// Effects
		this.pointLight = new THREE.PointLight( 0xB5179E, 0.5, 10);

		// init object data
		this.material.color.set(0xF72585);
		this.material.emissive.set(0xF72585);
		this.mesh.geometry.computeBoundingSphere();
		this.acceleration = 0.1;
		this.friction = 0.1;
	}

	update(deltaTime)
	{
		// if (this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0)
		// 	this.velocity.lerp(targetVelocity, this.acceleration * deltaTime);
		// else
		// 	this.velocity.lerp(new THREE.Vector3(0, 0, 0), this.friction * deltaTime);
		console.log(this.speed);
		this.velocity = this.direction.clone().multiplyScalar(this.speed);
		this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
		this.pointLight.position.copy(this.position);
		this.mesh.position.copy(this.position);
		this.mesh.position.copy(this.position);
	}

	render(scene)
	{
		scene.add(this.mesh);
		scene.add(this.pointLight);
	}
}