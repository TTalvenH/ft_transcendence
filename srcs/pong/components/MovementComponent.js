import * as THREE from 'three'

export class MovementComponent
{
	constructor()
	{
		// Attributes
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.acceleration = 0;
		this.friction = 0;
	}
}