export class Entity
{
	constructor()
	{
		this.components = {};
	}

	addComponent(component)
	{
		this.components[component.constructor.name] = component;
	}
	
	getComponent(componentName)
	{
		console.log(this.components[componentName]);
		return this.components[componentName];
	}
}