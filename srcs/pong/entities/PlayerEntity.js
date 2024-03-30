import * as THREE from 'three'
import { BaseEntity } from './BaseEntity.js'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'
import { ControlComponent } from '../components/ControlComponent.js'
import { MovementComponent } from '../components/MovementComponent.js'

export class PlayerEntity extends BaseEntity
{
	constructor()
	{
		super();

		// Components
		this.addComponent(new PositionComponent(0, 0, 0));
		this.addComponent(new ControlComponent(true));
		this.addComponent(new MovementComponent());
		this.addComponent(new MeshComponent(new THREE.BoxGeometry(0.1, 0.8, 0.1), new THREE.MeshPhongMaterial()));
		this.getMesh().material.color.set(0x00fff0);
	}	

	update(deltaTime)
	{
		if (this.getComponent("ControlComponent").keyRight === true)
			this.getComponent("PositionComponent").position.x += 0.1;
		if (this.getComponent("ControlComponent").keyLeft === true)
			this.getComponent("PositionComponent").position.x -= 0.1;
		if (this.getComponent("ControlComponent").keyUp === true)
			this.getComponent("PositionComponent").position.y += 0.1;
		if (this.getComponent("ControlComponent").keyDown === true)
			this.getComponent("PositionComponent").position.y -= 0.1;
		this.getComponent("MeshComponent").mesh.position.set(this.getComponent("PositionComponent").position.x, this.getComponent("PositionComponent").position.y, this.getComponent("PositionComponent").position.z);
		console.log(this.getComponent("MeshComponent").mesh.position);
	}
}