/* ═══════════════════════════════════════════════════════════
   THREE.JS PARTICLE SCENE — Hero background particles
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { gsap } from '../animations/gsapSetup.js';
import { prefersReducedMotion, isMobile, randomFloat } from '../utils/helpers.js';

let scene, camera, renderer, particles, particleMesh;
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let animationActive = true;

const CONFIG = {
  particleCount: isMobile() ? 1500 : 4000,
  fieldOfView: 75,
  nearPlane: 0.1,
  farPlane: 1000,
  cameraZ: 300,
  particleSize: isMobile() ? 2 : 1.5,
  rotationSpeed: 0.0002,
  mouseInfluence: 0.00008,
  colors: [0x6c63ff, 0x00f5d4, 0xff6b6b], // accent-primary, accent-secondary, accent-tertiary
};

/**
 * Initialize the Three.js particle scene
 */
export function initParticleScene() {
  if (prefersReducedMotion()) {
    // Still show a subtle static background
    initStaticBackground();
    return;
  }

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  initScene(canvas);
  createParticles();
  initMouseTracking();
  initResizeHandler();
  startAnimation();
}

function initScene(canvas) {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    CONFIG.fieldOfView,
    window.innerWidth / window.innerHeight,
    CONFIG.nearPlane,
    CONFIG.farPlane
  );
  camera.position.z = CONFIG.cameraZ;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
}

function createParticles() {
  const count = CONFIG.particleCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Galaxy-like distribution
    const radius = randomFloat(20, 400);
    const angle = randomFloat(0, Math.PI * 2);
    const height = randomFloat(-150, 150) * (1 - radius / 500);

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = height;
    positions[i3 + 2] = Math.sin(angle) * radius + randomFloat(-100, 100);

    // Random color from palette
    const color = new THREE.Color(
      CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
    );
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Random sizes
    sizes[i] = randomFloat(0.5, CONFIG.particleSize);

    // Slow drift velocities
    velocities[i3] = randomFloat(-0.02, 0.02);
    velocities[i3 + 1] = randomFloat(-0.02, 0.02);
    velocities[i3 + 2] = randomFloat(-0.02, 0.02);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Store velocities for animation
  particles = {
    geometry,
    positions,
    velocities,
    count,
  };

  // Custom shader material for particles
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        vAlpha = clamp(1.0 - dist / 500.0, 0.1, 0.8);
        gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = vAlpha * smoothstep(0.5, 0.1, d);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particleMesh = new THREE.Points(geometry, material);
  scene.add(particleMesh);
}

function initMouseTracking() {
  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

function startAnimation() {
  gsap.ticker.add((time) => {
    if (!animationActive || !renderer) return;

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Rotate particle system
    particleMesh.rotation.y += CONFIG.rotationSpeed;
    particleMesh.rotation.x = mouseY * 0.1;
    particleMesh.rotation.z = mouseX * 0.05;

    // Update time uniform
    particleMesh.material.uniforms.uTime.value = time;

    // Subtle particle drift
    const positions = particles.positions;
    const velocities = particles.velocities;
    for (let i = 0; i < particles.count; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Boundary check — wrap around
      if (Math.abs(positions[i3]) > 400) velocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > 200) velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2]) > 400) velocities[i3 + 2] *= -1;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  });
}

function initResizeHandler() {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200);
  });
}

function initStaticBackground() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Simple gradient overlay for reduced motion
  canvas.style.background =
    'radial-gradient(ellipse at 30% 50%, rgba(108,99,255,0.08) 0%, transparent 60%),' +
    'radial-gradient(ellipse at 70% 70%, rgba(0,245,212,0.05) 0%, transparent 50%)';
}

/**
 * Cleanup — call when navigating away
 */
export function destroyParticleScene() {
  animationActive = false;
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (particles?.geometry) {
    particles.geometry.dispose();
  }
  if (particleMesh?.material) {
    particleMesh.material.dispose();
  }
}
