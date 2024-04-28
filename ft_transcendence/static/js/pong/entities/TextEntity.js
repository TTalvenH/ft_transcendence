import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as COLORS from '../colors.js';

export class TextEntity {
	constructor(text, location, font, color, camera) {
		this.position = location;
		const parameters = {
			size: 1,
			depth: 0.05,
			curveSegments: 12,
			font: font,
			bevelEnabled: false
		};
		const textGeometry = new TextGeometry(text, parameters);
		this.camera = camera;
		this.text = text;
		this.mesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({ color: color }));
		this.mesh.position.copy( this.position );
		this.mesh.rotateX( Math.PI / 4.5 );
		this.mesh.geometry.computeBoundingBox();
		this.mesh.geometry.center();
		this.font = font;
	}

	setText(newText) {
		this.mesh.geometry.dispose();
		const parameters = {
			size: 1,
			depth: 0.05,
			curveSegments: 12,
			font: this.font,
			bevelEnabled: false
		};
		const textGeometry = new TextGeometry(newText, parameters);
		this.mesh.geometry = textGeometry;
		this.mesh.geometry.computeBoundingBox();
		this.mesh.geometry.center();
	}

	lightFlicker(minFlicker, maxFlicker, flickerTime) {
		if (!this.isFlickering){
			this.flickerTime = flickerTime;
			this.isFlickering = true;
		}
		if (this.flickerTime <= 0) {
			this.material.emissiveIntensity = 1;
			this.isFlickering = false;
			return;
		}
		let emissiveIntensity = THREE.MathUtils.clamp(Math.random(), minFlicker, maxFlicker);
		this.material.emissiveIntensity = emissiveIntensity;
		
		this.flickerTime -= 0.2 + 1/60;
		requestAnimationFrame(() => this.lightFlicker(minFlicker, maxFlicker, flickerTime));
	}

	render(scene) {
		scene.add(this.mesh);
	}
	
	update(deltaTime) {
		if (this.camera) {
			const target = this.camera.position.clone();
			this.mesh.quaternion.setFromUnitVectors(this.mesh.position.clone().normalize(), target);
		}
	}
}