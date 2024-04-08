import * as THREE from 'three'

export class NeonBoxEntity
{
	constructor(position, width, height, depth)
	{
		// Neon Light around the box
		const lightColor = 0xB5179E; // Red color
        const lightIntensity = 100;

		this.position = position;
		// Mesh
		this.geometry = new THREE.BoxGeometry(width, height, depth);
		this.material = new THREE.MeshStandardMaterial();
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.collisionSphere = new THREE.Sphere();

        this.rectLights = [
            new THREE.RectAreaLight(lightColor, lightIntensity, width, height), // Front
            new THREE.RectAreaLight(lightColor, lightIntensity, width, height), // Back
            new THREE.RectAreaLight(lightColor, lightIntensity, width, height), // Top
            new THREE.RectAreaLight(lightColor, lightIntensity, width, height), // Bottom
            new THREE.RectAreaLight(lightColor, lightIntensity, width, height), // Right
            new THREE.RectAreaLight(lightColor, lightIntensity, width, height), // Left
        ];

		this.rectLights[0].position.set(position.x, position.y, position.z + depth / 2 + 0.001);
		this.rectLights[1].position.set(position.x, position.y, position.z - depth / 2 - 0.001);
		this.rectLights[2].position.set(position.x, position.y + height / 2 + 0.001, position.z);
		this.rectLights[3].position.set(position.x, position.y - height / 2 - 0.001, position.z);
		this.rectLights[4].position.set(position.x + width / 2 + 0.001, position.y, position.z);
		this.rectLights[5].position.set(position.x + width / 2 - 0.001, position.y, position.z);

		this.rectLights[2].rotation.x = Math.PI / 2;
		this.rectLights[3].rotation.x = Math.PI / 2;
		this.rectLights[4].rotation.z = Math.PI / 2;
		this.rectLights[5].rotation.z = Math.PI / 2;

		this.rectLights[0].lookAt( position.x, position.y, position.z + depth / 2 + 1);
		this.rectLights[1].lookAt( position.x, position.y, position.z - depth / 2 - 1);
		this.rectLights[2].lookAt( position.x, position.y + height / 2 + 1, position.z );
		this.rectLights[3].lookAt( position.x, position.y - height / 2 - 1, position.z );
		this.rectLights[4].lookAt( position.x + width / 2 + 1, position.y, position.z );
		this.rectLights[5].lookAt( position.x + width / 2 - 1, position.y, position.z );

		// Geometry and Material
		this.mesh.position.copy(this.position);
		this.material.color.set(0xB5179E);
		this.material.emissive.set(0xB5179E);
		this.mesh.geometry.computeBoundingBox();

		this.collisionBox = new THREE.Box3();
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
		this.mesh.geometry.computeVertexNormals();

	}

	render(scene)
	{
		scene.add(this.mesh);
		this.rectLights.forEach(light => {
			scene.add(light);
		})
	}

	update(deltaTime)
	{
		this.collisionBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
	}
}