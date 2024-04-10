import * as THREE from 'three'

export class PlayerEntity
{
	constructor(initPosition)
	{
		const position = initPosition;
		
		// Movement
		this.position = initPosition;
		this.velocity = new THREE.Vector3(0, 0, 0,);
		this.acceleration = 0;
		this.friction = 0;
		this.speed = 0.03

		// Input keys
		this.keyRight = false;
		this.keyLeft = false;
		this.keyUp = false;
		this.keyDown = false;

		// Mesh
		this.geometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
		this.height = 0.8;
		this.material = new THREE.MeshStandardMaterial();;
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.collisionBox = new THREE.Box3();

		// init object data
		this.material.color.set(0xF72585);
		this.material.emissive.set(0xF72585);
		this.mesh.geometry.computeBoundingBox();

		this.acceleration = 0.1;
		this.friction = 0.1;
		this.mesh.position.copy( this.position );
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
	}	

	update(deltaTime)
	{
		// Input
		let targetVelocity = new THREE.Vector3(0, 0, 0);
		if (this.keyRight === true)
			targetVelocity.x += this.speed;
		if (this.keyLeft === true)
			targetVelocity.x -= this.speed;
		if (this.keyUp === true)
			targetVelocity.y += this.speed;
		if (this.keyDown === true)
			targetVelocity.y -= this.speed;

		// Movement update
		if (targetVelocity.x !== 0 || targetVelocity.y !== 0 || targetVelocity.z !== 0)
			this.velocity.lerp( targetVelocity, this.acceleration * deltaTime );
		else
			this.velocity.lerp( new THREE.Vector3(0, 0, 0), this.friction * deltaTime );

		this.position.add( this.velocity.clone().multiplyScalar(deltaTime) );
		this.mesh.position.copy( this.position );
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
	}

	render(scene)
	{	
		scene.add(this.mesh);
	}	
}