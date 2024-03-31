import * as THREE from 'three'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'

export class PlaneEntity
{
	constructor(Position, ...args)
	{
		const position = Position;
		const geometry = new THREE.PlaneGeometry(...args)
		const material = new THREE.MeshStandardMaterial();

		this.positionComponent = new PositionComponent(position);
		this.meshComponent = new MeshComponent(geometry, material);

		this.meshComponent.material.color.set(0x3F37C9);
		this.meshComponent.mesh.position.copy(this.positionComponent.position);
	}
}