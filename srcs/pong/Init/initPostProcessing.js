import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function initPostProcessing(scene, camera, renderer)
{
	const	composer = new EffectComposer(renderer);
	
	const	renderScene = new RenderPass( scene, camera );

	const	bloomPass = new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	// bloomPass.threshold = params.threshold;
	// bloomPass.strength = params.strength;
	// bloomPass.radius = params.radius;
	const	smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );
	const	outputPass =  new OutputPass();
	
	composer.addPass( renderScene );
	composer.addPass( bloomPass );
	composer.addPass( smaaPass );
	composer.addPass( outputPass );
	return composer;
}