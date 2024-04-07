import * as THREE from 'three'
import { PositionComponent } from '../components/PositionComponent.js';
import { MeshComponent } from '../components/MeshComponent.js'
import { RectLightComponent } from '../components/RectLightComponent.js'

export class NeonBoxEntity
{
	constructor(Position, width, height, depth)
	{
		const position = Position;
		
		// Neon Light around the box
		const lightColor = 0xB5179E; // Red color
        const lightIntensity = 100;

        this.rectLights = [
            new RectLightComponent(lightColor, lightIntensity, width, height, new THREE.Vector3(position.x, position.y, position.z + depth / 2 + 0.001)), // Front
            new RectLightComponent(lightColor, lightIntensity, width, height, new THREE.Vector3(position.x, position.y, position.z - depth / 2 - 0.001)), // Back
            new RectLightComponent(lightColor, lightIntensity, width, height, new THREE.Vector3(position.x, position.y + height / 2 + 0.001, position.z)), // Top
            new RectLightComponent(lightColor, lightIntensity, width, height, new THREE.Vector3(position.x, position.y - height / 2 - 0.001, position.z)), // Bottom
            new RectLightComponent(lightColor, lightIntensity, depth, height, new THREE.Vector3(position.x + width / 2 + 0.001, position.y, position.z)), // Right
            new RectLightComponent(lightColor, lightIntensity, depth, height, new THREE.Vector3(position.x + width / 2 - 0.001, position.y, position.z)), // Left
        ];

		this.rectLights[2].light.rotation.x = Math.PI / 2;
		this.rectLights[3].light.rotation.x = Math.PI / 2;
		this.rectLights[4].light.rotation.z = Math.PI / 2;
		this.rectLights[5].light.rotation.z = Math.PI / 2;

		this.rectLights[0].light.lookAt( position.x, position.y, position.z + depth / 2 + 1);
		this.rectLights[1].light.lookAt( position.x, position.y, position.z - depth / 2 - 1);
		this.rectLights[2].light.lookAt( position.x, position.y + height / 2 + 1, position.z );
		this.rectLights[3].light.lookAt( position.x, position.y - height / 2 - 1, position.z );
		this.rectLights[4].light.lookAt( position.x + width / 2 + 1, position.y, position.z );
		this.rectLights[5].light.lookAt( position.x + width / 2 - 1, position.y, position.z );

		// Geometry and Material
		const geometry = new THREE.BoxGeometry(width, height, depth)
		const material = new THREE.MeshStandardMaterial();

		this.positionComponent = new PositionComponent(position);
		this.meshComponent = new MeshComponent(geometry, material);
		this.meshComponent.mesh.position.copy(this.positionComponent.position);
		this.meshComponent.material.color.set(0xB5179E);
		this.meshComponent.material.emissive.set(0xB5179E);
		this.meshComponent.mesh.geometry.computeBoundingBox();

		this.collisionBox = new THREE.Box3();
		this.collisionBox.copy( this.meshComponent.mesh.geometry.boundingBox ).applyMatrix4( this.meshComponent.mesh.matrixWorld );
	}


	render(scene)
	{
		scene.add(this.meshComponent.mesh);
		this.rectLights.forEach(light => {
			scene.add(light.light);
		})
	}

	update(deltaTime)
	{
		this.collisionBox.copy( this.meshComponent.mesh.geometry.boundingBox ).applyMatrix4( this.meshComponent.mesh.matrixWorld );
	}
}