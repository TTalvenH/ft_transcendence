import { BaseComponent } from './BaseComponent'

export class MovementComponent extends BaseComponent
{
	constructor()
	{
		super();

		// Attributes
		this.velocity = 0;
		this.acceleration = 0;
	}
}