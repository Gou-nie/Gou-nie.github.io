// StarMesh.js
import * as THREE from 'three';

/**
 * 创建一个立体五角星 Mesh（可添加到场景中）
 * @param {number} outerRadius - 外圈半径
 * @param {number} innerRadius - 内圈半径（星角）
 * @param {number} depth - 厚度（extrude 深度）
 * @returns {THREE.Mesh} - 返回一个可直接添加到场景的 Mesh
 */
export function createStarMesh(outerRadius = 1, innerRadius = 0.4, depth = 0.3) {
  const spikes = 5;
  const shape = new THREE.Shape();
  const step = Math.PI / spikes;

  for (let i = 0; i < 2 * spikes; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: outerRadius * 0.05,
    bevelThickness: depth * 0.2
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  const starMesh = new THREE.Mesh(geometry, material);

  // 默认旋转到Z轴竖立朝向
  starMesh.rotation.x = -Math.PI / 2;
  return starMesh;
}




/**
 * 创建一个立体锋利五角星（中国国徽式）Mesh
 * @param {number} radius - 五角星半径
 * @param {number} height - 中心顶点凸起高度
 * @returns {THREE.Mesh}
 */
export function createSharpStarMesh(radius = 1, topHeight = 0.3, bottomHeight = 0.3) {
  const spikes = 5;
  const angleStep = Math.PI / spikes;

  const vertices = [];
  const indices = [];

  const topZ = 0;
  const bottomZ = 0;

  const pointsTop = [];
  const pointsBottom = [];

  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.4;
    const angle = i * angleStep - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    pointsTop.push([x, y, topZ]);
    pointsBottom.push([x, y, bottomZ]);
  }

  const allPoints = [...pointsTop, ...pointsBottom];
  allPoints.forEach(p => vertices.push(...p));

  const tipIndex = vertices.length / 3;
  const centerTop = [0, 0, topZ + topHeight];
  const centerBottom = [0, 0, bottomZ - bottomHeight];
  vertices.push(...centerTop);
  vertices.push(...centerBottom);

  const topCenterIdx = tipIndex;
  const bottomCenterIdx = tipIndex + 1;

  for (let i = 0; i < pointsTop.length; i++) {
    const next = (i + 1) % pointsTop.length;
    indices.push(topCenterIdx, i, next);
    indices.push(bottomCenterIdx, pointsTop.length + next, pointsTop.length + i);
  }

  // for (let i = 0; i < pointsTop.length; i++) {
  //   const next = (i + 1) % pointsTop.length;
  //   const a = i;
  //   const b = next;
  //   const c = pointsTop.length + next;
  //   const d = pointsTop.length + i;
  //   indices.push(a, d, c);
  //   indices.push(a, c, b);
  // }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });
  return new THREE.Mesh(geometry, material);
}




/**
 * 创建带五个凸起星瓣的立体五角星
 * @param {number} radius - 五角星半径
 * @param {number} petalHeight - 单个星瓣凸起高度
 * @param {number} innerRadiusRatio - 内圈半径相对外圈比例（一般0.4）
 * @returns {THREE.Mesh}
 */
export function createPetalStarMesh(radius = 1, petalHeight = 0.3, innerRadiusRatio = 0.4) {
  const spikes = 5;
  const angleStep = Math.PI / spikes;

  // 计算五角星的顶点（2*spikes个：外角和内角）
  const outerPoints2D = [];
  const innerPoints2D = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0) ? radius : radius * innerRadiusRatio;
    const angle = i * angleStep - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i % 2 === 0) outerPoints2D.push(new THREE.Vector2(x, y));
    else innerPoints2D.push(new THREE.Vector2(x, y));
  }

  // 顶点列表
  const vertices = [];
  // 索引数组
  const indices = [];

  // 中心点，Z轴最低点（星瓣根部）
  const centerIndex = 0;
  vertices.push(0, 0, 0); // 顶点0：中心底部，Z=0

  // 五个星瓣尖顶点（高出中心petalHeight）
  for (let i = 0; i < spikes; i++) {
    const p = outerPoints2D[i];
    vertices.push(p.x, p.y, petalHeight);
  }

  // 五个内角点，稍微高一点（作为星瓣之间的过渡，不完全到中心高度）
  const innerHeight = petalHeight * 0.4;
  for (let i = 0; i < spikes; i++) {
    const p = innerPoints2D[i];
    vertices.push(p.x, p.y, innerHeight);
  }

  /*
    顶点索引如下：
    0: 中心底部 (z=0)
    1~5: 外角尖顶（星瓣尖，z=petalHeight）
    6~10: 内角点（z=innerHeight）
  */

  // 构造五个星瓣面的三角形：
  // 每个星瓣有两条边，三角形顶点顺序需要确保法线向外

  for (let i = 0; i < spikes; i++) {
    const next = (i + 1) % spikes;

    // 三角形1：中心底部 -> 当前内角点 -> 下一个内角点
    indices.push(centerIndex, 6 + i, 6 + next);

    // 三角形2：当前内角点 -> 当前外角尖顶 -> 下一个内角点
    indices.push(6 + i, 1 + i, 6 + next);

    // 三角形3：当前外角尖顶 -> 下一个外角尖顶 -> 下一个内角点
    indices.push(1 + i, 1 + next, 6 + next);
  }

  // 创建几何体
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // 金属感材质
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.25,
  });

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}