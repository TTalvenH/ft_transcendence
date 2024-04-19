import * as THREE from 'three'

export class HealthBarEntity
{
	constructor(position, player)
	{
		this.playerRef = player;
		this.position = position;
		this.geometry = new THREE.CapsuleGeometry(0.2, 0.5, 3, 10);
		this.material = new THREE.MeshStandardMaterial();

		this.material.color.set(0xF72585);
		this.material.emissive.set(0xF72585);

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
		if (this.currentHealth > this.playerRef.hitPoints)
		{
			if (this.playerRef.position.x < 0)
				this.healthBars[this.playerRef.hitPoints].material.emissive.set(0x000000);
			else
				this.healthBars[this.healthBars.length - 1 - this.playerRef.hitPoints].material.emissive.set(0x000000);
			this.currentHealth--;
		}
	}
}