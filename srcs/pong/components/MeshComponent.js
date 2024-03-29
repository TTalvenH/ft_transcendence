import { Component } from './BaseComponent'
import * as THREE from 'three'

export class MeshComponent extends Component
{
	constructor(geometry, material)
	{
		super();
		this.geometry = geometry;
		this.material = material;
		this.mesh = new THREE.Mesh(this.geometry, this.material);
	}

	setPosition(x, y, z)
	{
		this.mesh.position.set(x , y, z);
	}

	setRotation(x, y, z)
	{
		this.mesh.rotation.set(x , y, z);
	}
}