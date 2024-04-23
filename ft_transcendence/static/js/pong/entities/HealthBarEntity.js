import * as THREE from 'three'
import * as COLORS from '../colors.js';

export class HealthBarEntity
{
	constructor(position, player)
	{
		this.playerRef = player;
		this.position = position;
		this.geometry = new THREE.CapsuleGeometry(0.2, 0.5, 3, 10);
		this.material = new THREE.MeshStandardMaterial();

		this.material.color.set(COLORS.AQUAMARINE);
		this.material.emissive.set(COLORS.AQUAMARINE);

		this.currentHealth = this.playerRef.hitPoints;
		this.healthBars = [];
		let spacing = 0.6
		let totalWidth = (this.currentHealth - 1) * spacing;
		for (let i = 0; i < this.currentHealth; i++)
		{
			this.healthBars.push(new THREE.Mesh(this.geometry, new THREE.MeshStandardMaterial().copy(this.material)));
			this.healthBars[i].rotateX(20)
			this.healthBars[i].position.copy(this.position);
			this.healthBars[i].position.x += i * spacing - totalWidth / 2;
		}
	}	

	render(scene)
	{
		this.healthBars.forEach( bar => {
			scene.add(bar);
		})
	}

	update(deltaTime)
	{
		if (this.currentHealth === this.playerRef.hitPoints)
			return;

		for (let i = 0; i < this.healthBars.length; i++) {
			this.healthBars[i].material.emissive.set(0x000000);
		}
		for (let i = 0; i < this.playerRef.hitPoints; i++) {
			if (this.playerRef.position.x < 0)
				this.healthBars[i].material.emissive.set(COLORS.AQUAMARINE);
			else
				this.healthBars[this.healthBars.length - 1 - i].material.emissive.set(COLORS.AQUAMARINE);
		}
		this.currentHealth = this.playerRef.hitPoints;
	}
}