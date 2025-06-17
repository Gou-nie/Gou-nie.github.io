import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';


export function getLogBySvg(url,scale) {
    return new Promise((resolve, reject) => {
        const loader = new SVGLoader();

        loader.load(
            url,
            (data) => {
                const paths = data.paths;
                const material = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    side: THREE.DoubleSide,
                });

                const meshes = [];

                paths.forEach((path) => {
                    const shapes = SVGLoader.createShapes(path);
                    shapes.forEach((shape) => {
                        const geometry = new THREE.ExtrudeGeometry(shape, {
                            depth: 0.1,
                            bevelEnabled: false,
                        });

                        const mesh = new THREE.Mesh(geometry, material);
                        mesh.scale.set(scale, -scale, scale); // 翻转Y轴以适配SVG坐标
                        meshes.push(mesh);
                    });
                });

                resolve(meshes);
            },
            undefined,
            (error) => {
                reject(error);
            }
        );
    });
}

