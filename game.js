// World setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const TEAM_COLORS = {red: 0xff3333, blue: 0x3366ff, green: 0x33ff66, yellow: 0xffee33};
const TEAM_BED_POSITIONS = {
    red: [5, 0.5, 5],
    blue: [-5, 0.5, 5],
    green: [-5, 0.5, -5],
    yellow: [5, 0.5, -5]
};

// Floor
const floorGeometry = new THREE.BoxGeometry(30, 1, 30);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1;
scene.add(floor);

// Beds
const beds = {};
for (const team in TEAM_COLORS) {
    const bedGeometry = new THREE.BoxGeometry(2, 1, 3);
    const bedMaterial = new THREE.MeshLambertMaterial({ color: TEAM_COLORS[team] });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    const pos = TEAM_BED_POSITIONS[team];
    bed.position.set(...pos);
    scene.add(bed);
    beds[team] = bed;
}

// Wool blocks for each team
function createWool(team, x, z) {
    const woolGeometry = new THREE.BoxGeometry(1, 1, 1);
    const woolMaterial = new THREE.MeshLambertMaterial({ color: TEAM_COLORS[team] });
    const block = new THREE.Mesh(woolGeometry, woolMaterial);
    block.position.set(x, 0.5, z);
    scene.add(block);
    return block;
}
// Example: spawn some wool blocks
createWool('red', 7, 5);
createWool('blue', -7, 5);
createWool('green', -5, -7);
createWool('yellow', 5, -7);

// Resources
function createResource(color, x, z) {
    const geo = new THREE.SphereGeometry(0.5, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color: color });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(x, 1, z);
    scene.add(sphere);
    return sphere;
}
// Iron, gold, diamond spawns
createResource(0xd8d8d8, 0, 0);      // iron center
createResource(0xffcc00, 0, 10);     // gold near red/blue
createResource(0x44f0ff, 9, 0);      // diamond near yellow

// Shop cubes
function createShop(x, z, label, color = 0xf7931a) {
    const shopGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const shopMat = new THREE.MeshLambertMaterial({ color: color });
    const shopBlock = new THREE.Mesh(shopGeo, shopMat);
    shopBlock.position.set(x, 0.75, z);
    scene.add(shopBlock);
    return shopBlock;
}
createShop(4, 0, 'Shop');
createShop(0, 4, 'Upgrades', 0x29f793);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 40, 20);
scene.add(directionalLight);

// Camera & Controls (Pointer Lock)
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
camera.position.set(0, 2, 15);

document.body.addEventListener('click', () => controls.lock());

// Minimal movement logic
let velocity = new THREE.Vector3();
const moveState = { forward: false, back: false, left: false, right: false };

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveState.forward = true;
    if (e.code === 'KeyS') moveState.back = true;
    if (e.code === 'KeyA') moveState.left = true;
    if (e.code === 'KeyD') moveState.right = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveState.forward = false;
    if (e.code === 'KeyS') moveState.back = false;
    if (e.code === 'KeyA') moveState.left = false;
    if (e.code === 'KeyD') moveState.right = false;
});

function animate() {
    if (controls.isLocked) {
        velocity.set(0, 0, 0);
        if (moveState.forward) velocity.z -= 0.2;
        if (moveState.back) velocity.z += 0.2;
        if (moveState.left) velocity.x -= 0.2;
        if (moveState.right) velocity.x += 0.2;
        controls.moveRight(velocity.x);
        controls.moveForward(velocity.z);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
<script src="/socket.io/socket.io.js"></script>
<script>
  // Inside your game.js
  const socket = io();

  socket.on('init', data => {
      // Set up your player, team, etc. from data
  });

  // When player moves, emits position
  function sendMovement(pos) {
      socket.emit('move', pos);
  }
  // When player places block
  function placeBlock(team, position) {
      socket.emit('place-block', { team, position });
  }
  // Listen for other players
  socket.on('player-move', data => {
      // Update their avatar/block in scene
  });
  socket.on('update-block', data => {
      // Add block to scene
  });
  // ...more events
</script>

animate();
