import * as THREE from 'three'

export class ControlComponent
{
	constructor(playerControlled)
	{
		this.isPlayerControlled = playerControlled;
		this.keyRight = false;
		this.keyLeft = false;
		this.keyUp = false;
		this.keyDown = false;
	}
}