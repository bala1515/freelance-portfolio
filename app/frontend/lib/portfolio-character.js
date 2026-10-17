import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function createEmployee() {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({
    color: "#c8875b",
    roughness: 0.72,
  });
  const skinLight = new THREE.MeshStandardMaterial({
    color: "#dc9a6c",
    roughness: 0.72,
  });
  const hair = new THREE.MeshStandardMaterial({
    color: "#292029",
    roughness: 0.86,
  });
  const shirt = new THREE.MeshStandardMaterial({
    color: "#a99ed8",
    roughness: 0.8,
  });
  const cuff = new THREE.MeshStandardMaterial({
    color: "#d6ceec",
    roughness: 0.9,
  });
  const trousers = new THREE.MeshStandardMaterial({
    color: "#363347",
    roughness: 0.88,
  });
  const shoe = new THREE.MeshStandardMaterial({
    color: "#f5f0e7",
    roughness: 0.6,
  });
  const sole = new THREE.MeshStandardMaterial({
    color: "#ad9e93",
    roughness: 0.9,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#231e2c",
    roughness: 0.4,
  });
  const white = new THREE.MeshStandardMaterial({
    color: "#fffaf0",
    roughness: 0.35,
  });
  const iris = new THREE.MeshStandardMaterial({
    color: "#553425",
    roughness: 0.4,
  });
  const lime = new THREE.MeshStandardMaterial({
    color: "#d4ee7f",
    roughness: 0.75,
  });
  const mesh = (geometry, material, position, scale, parent = root) => {
    const object = new THREE.Mesh(geometry, material);
    if (position) object.position.set(...position);
    if (scale) object.scale.set(...scale);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const sphere = (material, position, scale, parent) =>
    mesh(
      new THREE.SphereGeometry(1, 32, 24),
      material,
      position,
      scale,
      parent,
    );
  const capsule = (radius, length, material, position, parent) =>
    mesh(
      new THREE.CapsuleGeometry(radius, length, 6, 16),
      material,
      position,
      null,
      parent,
    );
  const box = (dimensions, material, position, radius = 0.04, parent = root) =>
    mesh(
      new RoundedBoxGeometry(...dimensions, 3, radius),
      material,
      position,
      null,
      parent,
    );
  const tube = (points, radius, material, parent = root) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    return mesh(
      new THREE.TubeGeometry(curve, 18, radius, 6, false),
      material,
      null,
      null,
      parent,
    );
  };
  const body = new THREE.Group();
  root.add(body);
  sphere(shirt, [0, 1.75, 0], [0.57, 0.68, 0.34], body);
  sphere(trousers, [0, 1.17, -0.015], [0.45, 0.25, 0.3], body);
  capsule(0.18, 0.25, skin, [0, 2.34, 0], body);
  const collarLeft = box(
    [0.26, 0.2, 0.07],
    cuff,
    [-0.15, 2.24, 0.29],
    0.025,
    body,
  );
  collarLeft.rotation.z = 0.35;
  const collarRight = box(
    [0.26, 0.2, 0.07],
    cuff,
    [0.15, 2.24, 0.29],
    0.025,
    body,
  );
  collarRight.rotation.z = -0.35;
  const tie = new THREE.Group();
  tie.position.set(0, 2.25, 0.35);
  body.add(tie);
  const tieMat = new THREE.MeshStandardMaterial({
    color: "#694081",
    roughness: 0.8,
  });
  sphere(tieMat, [0, -0.05, 0.015], [0.07, 0.095, 0.04], tie);
  const tieTail = mesh(
    new THREE.ConeGeometry(0.1, 0.56, 4),
    tieMat,
    [0, -0.36, 0.035],
    [0.75, 1, 0.4],
    tie,
  );
  tieTail.rotation.z = Math.PI;
  for (let i = 0; i < 3; i++)
    sphere(white, [0, 1.7 - i * 0.18, 0.335], [0.022, 0.022, 0.012], body);
  const head = new THREE.Group();
  head.position.set(0, 2.89, 0.015);
  body.add(head);
  sphere(skin, [0, 0, 0], [0.57, 0.65, 0.49], head);
  sphere(skinLight, [0, -0.18, 0.17], [0.46, 0.36, 0.36], head);
  for (const side of [-1, 1]) {
    sphere(skin, [side * 0.56, -0.02, -0.01], [0.125, 0.19, 0.115], head);
    sphere(skinLight, [side * 0.6, -0.025, 0.055], [0.06, 0.105, 0.04], head);
  }
  sphere(hair, [0, 0.35, -0.1], [0.59, 0.39, 0.48], head);
  for (const [x, y, z, sx, sy, sz, rz] of [
    [-0.36, 0.47, 0.2, 0.25, 0.2, 0.29, -0.45],
    [-0.1, 0.57, 0.22, 0.31, 0.23, 0.29, -0.35],
    [0.2, 0.52, 0.2, 0.29, 0.23, 0.3, -0.45],
    [0.4, 0.37, 0.16, 0.17, 0.22, 0.26, -0.45],
    [-0.48, 0.17, -0.06, 0.1, 0.28, 0.29, 0.1],
  ]) {
    const tuft = sphere(hair, [x, y, z], [sx, sy, sz], head);
    tuft.rotation.z = rz;
  }
  const eyes = [];
  const brows = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.225, 0.075, 0.425);
    head.add(eye);
    sphere(white, [0, 0, 0], [0.183, 0.205, 0.092], eye);
    sphere(iris, [side * -0.018, -0.005, 0.075], [0.092, 0.112, 0.031], eye);
    sphere(dark, [side * -0.018, -0.003, 0.1], [0.052, 0.073, 0.018], eye);
    sphere(
      white,
      [side * -0.018 - 0.025, 0.033, 0.12],
      [0.022, 0.027, 0.009],
      eye,
    );
    const frame = mesh(
      new THREE.TorusGeometry(0.185, 0.022, 8, 40),
      dark,
      [0, 0, 0.1],
      [1, 1.07, 1],
      eye,
    );
    eyes.push(eye);
    const brow = capsule(0.035, 0.17, hair, [side * 0.225, 0.34, 0.43], head);
    brow.rotation.z = side * 0.2 + Math.PI / 2;
    brows.push(brow);
  }
  tube(
    [
      [-0.043, 0.08, 0.54],
      [0, 0.11, 0.57],
      [0.043, 0.08, 0.54],
    ],
    0.021,
    dark,
    head,
  );
  tube(
    [
      [-0.41, 0.09, 0.48],
      [-0.55, 0.07, 0.13],
    ],
    0.018,
    dark,
    head,
  );
  tube(
    [
      [0.41, 0.09, 0.48],
      [0.55, 0.07, 0.13],
    ],
    0.018,
    dark,
    head,
  );
  sphere(skinLight, [0, -0.09, 0.52], [0.115, 0.14, 0.15], head);
  const mouth = sphere(
    new THREE.MeshStandardMaterial({ color: "#542c2e", roughness: 0.9 }),
    [0, -0.32, 0.465],
    [0.115, 0.13, 0.025],
    head,
  );
  const smile = tube(
    [
      [-0.13, -0.31, 0.48],
      [0, -0.37, 0.5],
      [0.13, -0.31, 0.48],
    ],
    0.022,
    new THREE.MeshStandardMaterial({ color: "#713e35" }),
    head,
  );
  smile.visible = false;
  for (const side of [-1, 1])
    sphere(
      new THREE.MeshStandardMaterial({ color: "#c9795b", roughness: 1 }),
      [side * 0.33, -0.18, 0.432],
      [0.08, 0.044, 0.008],
      head,
    );
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.49, 2.04, 0);
    body.add(arm);
    capsule(0.16, 0.34, shirt, [0, -0.22, 0], arm);
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.48, 0);
    arm.add(elbow);
    capsule(0.155, 0.08, cuff, [0, 0.025, 0], elbow);
    capsule(0.115, 0.28, skin, [0, -0.16, 0], elbow);
    const hand = new THREE.Group();
    hand.position.set(0, -0.41, 0.015);
    elbow.add(hand);
    sphere(skinLight, [0, 0, 0], [0.145, 0.17, 0.09], hand);
    for (let i = 0; i < 4; i++) {
      const finger = capsule(
        0.029,
        0.11 + (i === 1 ? 0.035 : 0),
        skinLight,
        [(i - 1.5) * 0.067, -0.13, 0.015],
        hand,
      );
      finger.rotation.z = (i - 1.5) * 0.11;
    }
    const thumb = capsule(
      0.045,
      0.09,
      skinLight,
      [-side * 0.145, -0.015, 0.045],
      hand,
    );
    thumb.rotation.z = -side * 0.7;
    arms.push({ arm, elbow, hand, side });
  }
  const legs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.24, 1.14, 0);
    body.add(leg);
    capsule(0.195, 0.28, trousers, [0, -0.2, 0], leg);
    const knee = new THREE.Group();
    knee.position.set(0, -0.46, 0);
    leg.add(knee);
    capsule(0.16, 0.25, trousers, [0, -0.17, 0.01], knee);
    box([0.31, 0.1, 0.32], cuff, [0, -0.35, 0.01], 0.025, knee);
    box([0.36, 0.2, 0.57], shoe, [0, -0.45, 0.14], 0.08, knee);
    box([0.37, 0.065, 0.58], sole, [0, -0.54, 0.14], 0.025, knee);
    for (let i = 0; i < 3; i++)
      box(
        [0.21, 0.018, 0.025],
        white,
        [0, -0.35, 0.13 + i * 0.065],
        0.005,
        knee,
      );
    legs.push({ leg, knee, side });
  }
  tube(
    [
      [-0.18, 2.24, 0.33],
      [-0.24, 1.95, 0.37],
      [0, 1.67, 0.4],
      [0.24, 1.95, 0.37],
      [0.18, 2.24, 0.33],
    ],
    0.023,
    lime,
    body,
  );
  const badge = new THREE.Group();
  badge.position.set(0, 1.69, 0.415);
  body.add(badge);
  box([0.43, 0.55, 0.05], white, [0, -0.25, 0], 0.035, badge);
  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = 256;
  cardCanvas.height = 320;
  const ctx = cardCanvas.getContext("2d");
  ctx.fillStyle = "#fffdf6";
  ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = "#29232e";
  ctx.fillRect(0, 0, 256, 44);
  ctx.fillStyle = "#e4fb92";
  ctx.font = "bold 17px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BUILT BY BALA", 128, 29);
  ctx.fillStyle = "#e8e0f2";
  ctx.beginPath();
  ctx.arc(128, 112, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6b4a85";
  ctx.font = "bold 32px Arial";
  ctx.fillText("B", 128, 123);
  ctx.fillStyle = "#29232e";
  ctx.font = "bold 43px Arial";
  ctx.fillText("BALA", 128, 202);
  ctx.fillStyle = "#71677b";
  ctx.font = "18px Arial";
  ctx.fillText("DEVELOPER", 128, 232);
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = "#29232e";
    ctx.fillRect(40 + i * 8, 265, i % 3 === 0 ? 4 : 2, 25);
  }
  const texture = new THREE.CanvasTexture(cardCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  mesh(
    new THREE.PlaneGeometry(0.395, 0.5),
    new THREE.MeshBasicMaterial({ map: texture }),
    [0, -0.25, 0.029],
    null,
    badge,
  );
  box([0.09, 0.065, 0.06], dark, [0, 0.015, 0.005], 0.015, badge);
  return {
    root,
    body,
    head,
    arms,
    legs,
    tie,
    badge,
    eyes,
    brows,
    mouth,
    smile,
  };
}
