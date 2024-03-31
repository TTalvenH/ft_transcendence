import * as THREE from 'three'

export class MeshComponent
{
	constructor(geometry, material)
	{
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