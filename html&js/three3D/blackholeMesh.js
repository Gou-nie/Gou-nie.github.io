// BlackHole.js
import * as THREE from 'three';

/**
 * 创建动态波浪黑洞
 * @param {Object} options 自定义参数
 * @returns {{mesh: THREE.Mesh, update: Function}} 黑洞 mesh 和更新函数
 */
export function createBlackHoleMesh({
    radius = 1,
    segments = 128,
    waveHeight = 0.1,
    waveFrequency = 8,
    waveSpeed = 2.0
} = {}) {
    const geometry = new THREE.CircleGeometry(radius, segments);

    // 保存角度信息
    const position = geometry.attributes.position;
    const angles = [];

    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const angle = Math.atan2(y, x);
        angles.push(angle);
    }

    const material = new THREE.MeshBasicMaterial({
        color: 0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData={name: "blackHole"}; // 添加标识
    // 更新函数：每帧调用
    function update(time) {
        for (let i = 0; i < position.count; i++) {
            const angle = angles[i];
            const dist = Math.sqrt(
                position.getX(i) * position.getX(i) + position.getY(i) * position.getY(i)
            );

            if (dist > 0.95 * radius) {
                const wave = waveHeight * Math.sin(angle * waveFrequency + time * waveSpeed);
                const newRadius = radius + wave;
                position.setX(i, Math.cos(angle) * newRadius);
                position.setY(i, Math.sin(angle) * newRadius);
            }
        }

        position.needsUpdate = true;
    }

    return { mesh, update };
}
