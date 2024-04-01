import * as THREE from 'three'

export class RectLightComponent
{
    constructor(color, intensity, width, height, position)
    {
        this.light = new THREE.RectAreaLight(color, intensity, width, height);
        this.light.position.copy(position);
    }
}