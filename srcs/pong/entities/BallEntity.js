import * as THREE from 'three'

export class BallEntity
{
	constructor()
	{
		// Movement
		this.position = new THREE.Vector3(0, 0, 0);;
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.acceleration = 0;
		this.friction = 0;
		
		// Mesh
		this.geometry = new THREE.SphereGeometry(0.05);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.collisionSphere = new THREE.Sphere();

		// Effects
		this.pointLight = new THREE.PointLight( 0xB5179E, 0.5, 10);

		// init object data
		this.material.color.set(0xF72585);
		this.material.emissive.set(0xF72585);
		this.mesh.geometry.computeBoundingSphere();

		this.velocity.x = 0.02;
		this.acceleration = 0.1;
		this.friction = 0.1;
	}

	update(deltaTime)
	{
		// if (this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0)
		// 	this.velocity.lerp(targetVelocity, this.acceleration * deltaTime);
		// else
		// 	this.velocity.lerp(new THREE.Vector3(0, 0, 0), this.friction * deltaTime);

		this.collisionSphere.copy( this.mesh.geometry.boundingSphere ).applyMatrix4( this.mesh.matrixWorld );
		this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
		this.pointLight.position.copy(this.position);
		this.mesh.position.copy(this.position);
		this.mesh.position.copy(this.position);
		this.collisionSphere.center.copy(this.position);
	}

	render(scene)
	{
		scene.add(this.mesh);
		scene.add(this.pointLight);
	}
}