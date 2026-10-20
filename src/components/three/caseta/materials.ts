import * as THREE from 'three';
import type { CasetaTextures } from './textures';

/**
 * Materiales compartidos por todas las mallas de la caseta. Los colores base
 * están en las texturas; el color de vértice hace de oclusión falsa (interior
 * en penumbra) y pinta los herrajes de oscuro sin otra llamada de dibujo.
 */
export interface CasetaMaterials {
  wood: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  plain: THREE.MeshStandardMaterial;
  dispose: () => void;
}

export function createMaterials(tex: CasetaTextures, quality: 'high' | 'low'): CasetaMaterials {
  const high = quality === 'high';
  const wood = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: high ? tex.woodNormal : null,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughness: 0.62,
    metalness: 0,
    vertexColors: true,
    envMapIntensity: 0.9,
  });
  const roof = new THREE.MeshStandardMaterial({
    map: tex.roof,
    color: '#9a9a98',
    normalMap: high ? tex.roofNormal : null,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: high ? tex.roofRough : null,
    roughness: high && tex.roofRough ? 1 : 0.86,
    metalness: 0,
    vertexColors: true,
    envMapIntensity: 0.75,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: '#B4B9BC',
    metalness: 0.35,
    roughness: 0.5,
    vertexColors: true,
  });
  const dark = new THREE.MeshStandardMaterial({ color: '#1d1f1e', metalness: 0.5, roughness: 0.45 });
  const plain = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.6,
    metalness: 0.2,
    vertexColors: true,
  });
  const list = [wood, roof, metal, dark, plain];
  return { wood, roof, metal, dark, plain, dispose: () => list.forEach((m) => m.dispose()) };
}
