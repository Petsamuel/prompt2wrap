import * as THREE from 'three';

let scene, camera, renderer;
let particles, particlesMesh;
let shapes = [];
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

export function initBackground() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    // CAMERA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // PARTICLES (STARS/DUST)
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const colorPalette = [
        new THREE.Color('#FF90E8'), // Neon Pink
        new THREE.Color('#23A0FF'), // Neon Blue
        new THREE.Color('#FFC900'), // Neon Yellow
        new THREE.Color('#00FF94')  // Neon Green
    ];

    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 4000;
        const y = (Math.random() - 0.5) * 4000;
        const z = (Math.random() - 0.5) * 4000;
        vertices.push(x, y, z);

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 4,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // GEOMETRIC SHAPES (FLOATING DEBRIS)
    const shapeGeometries = [
        new THREE.IcosahedronGeometry(15, 0),
        new THREE.OctahedronGeometry(15, 0),
        new THREE.TetrahedronGeometry(15, 0),
        new THREE.TorusGeometry(10, 3, 16, 100)
    ];

    const shapeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    for (let i = 0; i < 50; i++) {
        const geom = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
        const mesh = new THREE.Mesh(geom, shapeMaterial);
        
        mesh.position.x = (Math.random() - 0.5) * 2000;
        mesh.position.y = (Math.random() - 0.5) * 2000;
        mesh.position.z = (Math.random() - 0.5) * 2000;
        
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;

        const scale = Math.random() + 0.5;
        mesh.scale.set(scale, scale, scale);

        scene.add(mesh);
        shapes.push({
            mesh: mesh,
            rotateX: (Math.random() - 0.5) * 0.02,
            rotateY: (Math.random() - 0.5) * 0.02
        });
    }

    // EVENTS
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    // ANIMATE
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.5;
    mouseY = (event.clientY - windowHalfY) * 0.5;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate Particles
    particlesMesh.rotation.y += 0.001;
    particlesMesh.rotation.z += 0.0005;

    // Rotate Shapes
    shapes.forEach(item => {
        item.mesh.rotation.x += item.rotateX;
        item.mesh.rotation.y += item.rotateY;
    });

    renderer.render(scene, camera);
}
