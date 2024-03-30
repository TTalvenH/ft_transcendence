export class BaseEntity
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
		return this.components[componentName];
	}

	getMesh()
	{
		const meshComponent = this.getComponent("MeshComponent");
		if (meshComponent)
		{
			return meshComponent.mesh;
		}
		return null;
	}

	update(deltaTime){};
}