import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as COLORS from '../colors.js';

export class TextEntity {

	constructor(text, location, font, color) {
		const loaderManager = new THREE.LoadingManager();
		const loader = new FontLoader(loaderManager);
		this.font = {};
		loader.load( 'static/fonts/jersey10-regular.json', ( font ) => {
			this.position = location;
			const parameters = {
				size: 1,
				depth: 0.05,
				curveSegments: 12,
				font: font,
				bevelEnabled: false
			};
			const textGeometry = new TextGeometry(text, parameters);
			this.mesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({ color: color }));
			this.mesh.position.copy( this.position );
			this.mesh.rotateX( Math.PI / 4.5 );
			this.mesh.geometry.computeBoundingBox();
			this.mesh.geometry.center();
			this.font = font;
			this.doneAdding = false;
		} );
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

	render(scene) {
		this.scene = scene;
	}
	
	update(deltaTime) {
		if (this.font && this.doneAdding === false) {
			this.scene.add(this.mesh);
			this.doneAdding = true;
		}
	}
}