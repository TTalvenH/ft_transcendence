import * as THREE from 'three'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'
import { MovementComponent } from '../components/MovementComponent.js'

export class BallEntity
{
	constructor()
	{
		const position = new THREE.Vector3(0, 0, 0);
		const geometry = new THREE.SphereGeometry(0.05);
		const material = new THREE.MeshStandardMaterial();


		this.collisionSphere = new THREE.Sphere();
		this.pointLight = new THREE.PointLight( 0xB5179E, 0.5, 10);
		// Components
		this.positionComponent = new PositionComponent(position);
		this.movementComponent = new MovementComponent();
		this.meshComponent = new MeshComponent(geometry, material);

		this.meshComponent.material.color.set(0xF72585);
		this.meshComponent.material.emissive.set(0xF72585);
		this.meshComponent.mesh.geometry.computeBoundingSphere();

		this.movementComponent.velocity.x = 0.02;
		this.movementComponent.acceleration = 0.1;
		this.movementComponent.friction = 0.1;
	}

	update(deltaTime)
	{
		// if (this.movementComponent.velocity.x !== 0 || this.movementComponent.velocity.y !== 0 || this.movementComponent.velocity.z !== 0)
		// 	this.movementComponent.velocity.lerp(targetVelocity, this.movementComponent.acceleration * deltaTime);
		// else
		// 	this.movementComponent.velocity.lerp(new THREE.Vector3(0, 0, 0), this.movementComponent.friction * deltaTime);

		this.collisionSphere.copy( this.meshComponent.mesh.geometry.boundingSphere ).applyMatrix4( this.meshComponent.mesh.matrixWorld );
		this.positionComponent.position.add(this.movementComponent.velocity.clone().multiplyScalar(deltaTime));
		this.pointLight.position.copy(this.positionComponent.position);
		this.meshComponent.mesh.position.copy(this.positionComponent.position);
		this.meshComponent.mesh.position.copy(this.positionComponent.position);
		this.collisionSphere.center.copy(this.positionComponent.position);
	}

	render(scene)
	{
		scene.add(this.meshComponent.mesh);
		scene.add(this.pointLight);
	}
}