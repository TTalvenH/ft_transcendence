import * as THREE from 'three'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'
import { ControlComponent } from '../components/ControlComponent.js'
import { MovementComponent } from '../components/MovementComponent.js'

export class PlayerEntity
{
	constructor()
	{
		const position = new THREE.Vector3(0, 0, 0);
		const geometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
		const material = new THREE.MeshStandardMaterial();

		// Components
		this.positionComponent = new PositionComponent(position);
		this.movementComponent = new MovementComponent();
		this.controlComponent = new ControlComponent(true);
		this.meshComponent = new MeshComponent(geometry, material);

		// init component data
		this.meshComponent.material.color.set(0xB5179E);
		this.movementComponent.acceleration = 0.1;
		this.movementComponent.friction = 0.1;
		
	}	

	update(deltaTime)
	{
		// Input
		let targetVelocity = new THREE.Vector3(0, 0, 0);
		if (this.controlComponent.keyRight === true)
			targetVelocity.x += 0.1;
		if (this.controlComponent.keyLeft === true)
			targetVelocity.x -= 0.1;
		if (this.controlComponent.keyUp === true)
			targetVelocity.y += 0.1;
		if (this.controlComponent.keyDown === true)
			targetVelocity.y -= 0.1;

		// Movement update
		if (targetVelocity.x !== 0 || targetVelocity.y !== 0 || targetVelocity.z !== 0)
			this.movementComponent.velocity.lerp(targetVelocity, this.movementComponent.acceleration * deltaTime);
		else
			this.movementComponent.velocity.lerp(new THREE.Vector3(0, 0, 0), this.movementComponent.friction * deltaTime);

		this.positionComponent.position.add(this.movementComponent.velocity.clone().multiplyScalar(deltaTime));
		this.meshComponent.mesh.position.copy(this.positionComponent.position);
		console.log(this.positionComponent.position);
	}

	render(scene)
	{	
		scene.add(this.meshComponent.mesh);
	}	
}