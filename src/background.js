import * as THREE from 'three';

let scene, camera, renderer;
let particlesMesh;
let shapes = [];
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

// Dynamic state for scroll-reactive effects
let rotationSpeed = 0.001;
let targetColor = new THREE.Color('#FF90E8');

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Color presets for different moods
const moodColors = {
    default: '#FF90E8',
    happy: '#FFC900',
    calm: '#00FF94',
    intense: '#FF4444',
    creative: '#23A0FF',
    chaotic: '#FF90E8',
    focused: '#FFFFFF',
    tired: '#666666'
};

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
        new THREE.Color('#FF90E8'),
        new THREE.Color('#23A0FF'),
        new THREE.Color('#FFC900'),
        new THREE.Color('#00FF94')
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
        const mesh = new THREE.Mesh(geom, shapeMaterial.clone());
        
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
            baseRotateX: (Math.random() - 0.5) * 0.02,
            baseRotateY: (Math.random() - 0.5) * 0.02,
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

// Exported function to change the scene mood based on scroll section
export function setMood(moodKey, intensity = 1) {
    const color = moodColors[moodKey] || moodColors.default;
    targetColor = new THREE.Color(color);
    
    // Adjust rotation speed based on intensity
    rotationSpeed = 0.001 + (intensity * 0.003);
    
    // Update shape colors with transition
    shapes.forEach((item, i) => {
        // Stagger the color update for a wave effect
        setTimeout(() => {
            item.mesh.material.color.lerp(targetColor, 0.5);
            item.mesh.material.opacity = 0.1 + (intensity * 0.15);
        }, i * 20);
    });
}

// Exported function to set chaos level (0-1)
export function setChaosLevel(level) {
    shapes.forEach(item => {
        item.rotateX = item.baseRotateX * (1 + level * 3);
        item.rotateY = item.baseRotateY * (1 + level * 3);
    });
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

    // Rotate Particles with dynamic speed
    particlesMesh.rotation.y += rotationSpeed;
    particlesMesh.rotation.z += rotationSpeed * 0.5;

    // Rotate Shapes
    shapes.forEach(item => {
        item.mesh.rotation.x += item.rotateX;
        item.mesh.rotation.y += item.rotateY;
    });

    renderer.render(scene, camera);
}
