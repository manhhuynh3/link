// assets/script/threejs_setup.js
import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/controls/OrbitControls.js';

// Export THREE và GLTFLoader để các module khác có thể import chúng
export { THREE, GLTFLoader, RGBELoader, OrbitControls };

// Tùy chọn: Nếu bạn muốn, có thể gán chúng vào window cho mục đích debug hoặc tương thích ngược,
// NHƯNG hãy ưu tiên import trực tiếp.
// window.THREE = THREE;
// window.GLTFLoader = GLTFLoader;