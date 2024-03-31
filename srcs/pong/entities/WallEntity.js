import * as THREE from 'three'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'

export class WallEntity
{
	constructor(Position, width, height, depth)
	{
		const position = Position;

		const geometry = new THREE.BoxGeometry(width, height, depth)
		const material = new THREE.MeshStandardMaterial();
		this.rectLight = new THREE.RectAreaLight(0xF72585, 100, width, height);
		this.rectLight.position.set(0, -3 - height / 2, 0);
		this.rectLight.lookAt( 0, 0, 0 );
		this.positionComponent = new PositionComponent(position);
		this.meshComponent = new MeshComponent(geometry, material);
		this.meshComponent.mesh.position.copy(this.positionComponent.position);
		this.meshComponent.material.color.set(0xF72585);
	}
}