import { BaseComponent } from './BaseComponent'
import * as THREE from 'three'

export class ControlComponent extends BaseComponent
{
	constructor(playerControlled)
	{
		super()
		this.isPlayerControlled = playerControlled;
		this.keyRight = false;
		this.keyLeft = false;
		this.keyUp = false;
		this.keyDown = false;
	}
}