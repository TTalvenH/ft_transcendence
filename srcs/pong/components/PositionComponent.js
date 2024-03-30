import { BaseComponent } from './BaseComponent'
import * as THREE from 'three'

export class PositionComponent extends BaseComponent
{
	constructor(x, y, z)
	{
		super();

		// Attributes
		this.position = new THREE.Vector3(0, 0, 0);
	}
}