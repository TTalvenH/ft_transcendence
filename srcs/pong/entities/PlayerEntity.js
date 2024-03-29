import * as THREE from 'three'
import { Entity } from './BaseEntity.js'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'

export class PlayerEntity extends Entity
{
	constructor()
	{
		super();
		this.addComponent(new PositionComponent(0, 0, 0));
		this.addComponent(new MeshComponent(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial()));
	}	
}