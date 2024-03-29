import { Component } from './BaseComponent'

export class PositionComponent extends Component
{
	constructor(x, y, z)
	{
		super();
		this.x = x;
		this.y = y;
		this.z = z;
	}
}