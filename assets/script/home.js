// assets/script/home.js
// Import THREE và GLTFLoader từ module thiết lập chung
import { THREE, GLTFLoader } from './threejs_setup.js';
let scene, camera, renderer;
let glassModel;
// Hàm khởi tạo và chạy cảnh 3D kính
export function initGlassScene(containerId) {
    // 1. Lấy thẻ container mà cảnh này sẽ sử dụng
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found for glass scene.`);
        return;
    }

    // Tạo một canvas mới bên trong container
    const canvas = document.createElement('canvas');
    canvas.id = 'glass-three-canvas'; // Đặt ID cho canvas mới
    // Đảm bảo canvas chiếm toàn bộ container
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // 2. Thiết lập Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true // Quan trọng: nền trong suốt để thấy video/canvas khác phía dưới
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Bật đổ bóng
    renderer.setSize(container.clientWidth, container.clientHeight); // Thiết lập kích thước ban đầu

    // 3. Thiết lập Scene
    scene = new THREE.Scene();

    // 4. Thiết lập Camera
    const fov = 75;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 3); // Vị trí camera, điều chỉnh nếu cần

    // 5. Ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ánh sáng môi trường
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Ánh sáng định hướng
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(-10, -5, -10);
    scene.add(pointLight);

    // 6. Thêm Environment Map cho phản chiếu (RẤT quan trọng cho vật liệu kính)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new THREE.TextureLoader().load(
        'assets/3d/brown_photostudio_01_1k.hdr', // Ví dụ HDR map
        function (texture) {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.environment = envMap; // Áp dụng environment map cho cảnh này
            texture.dispose();
            pmremGenerator.dispose();
        },
        undefined,
        function (error) {
            console.error('Lỗi khi tải environment map cho cảnh kính:', error);
        }
    );

    // 7. Tải mô hình 3D (GLB/GLTF)
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        'assets/3d/glass.glb', // Đã cập nhật đường dẫn file 3D kính của bạn
        function (gltf) {
            glassModel = gltf.scene;

            // Duyệt qua tất cả các mesh và áp dụng vật liệu kính
            glassModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xffffff,
                        metalness: 0,
                        roughness: 0.1,
                        transmission: 1, // Kính trong suốt
                        ior: 1.5, // Chiết suất
                        thickness: 1.0, // Độ dày
                        clearcoat: 1.0, // Lớp phủ
                        clearcoatRoughness: 0.1, // Độ nhám lớp phủ
                        // Các thuộc tính khác có thể điều chỉnh
                    });
                }
            });

            // Điều chỉnh kích thước và vị trí của mô hình kính
            // Bạn cần điều chỉnh các giá trị này để phù hợp với bố cục của bạn
            glassModel.scale.set(1, 1, 1);
            glassModel.position.set(0, -0.15, 0); // Đặt tại trung tâm của canvas này
            glassModel.rotation.set(0, Math.PI / 2, 0); // Xoay mô hình 90 độ quanh trục Y
            scene.add(glassModel);
        },
        undefined,
        function (error) {
            console.error('Lỗi khi tải mô hình kính:', error);
        }
    );

    // 8. Xử lý thay đổi kích thước cửa sổ
    window.addEventListener('resize', () => onWindowResize(container));

    // Bắt đầu vòng lặp render cho cảnh này
    animateGlassScene();
}

// Hàm xử lý thay đổi kích thước cửa sổ
function onWindowResize(container) {
    if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// 9. Vòng lặp Render (Animation loop)
function animateGlassScene() {
    requestAnimationFrame(animateGlassScene);

   

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Hàm cleanup khi component hoặc trang bị hủy (để tránh rò rỉ bộ nhớ)
export function disposeGlassScene() {
    if (renderer) {
        renderer.dispose();
        // Không xóa canvas ở đây vì nó thuộc về container, mà chỉ xóa renderer
    }
    if (scene) {
        scene.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                if (object.material.isMaterial) {
                    cleanMaterial(object.material);
                } else if (Array.isArray(object.material)) {
                    object.material.forEach(cleanMaterial);
                }
            }
        });
        scene.children.forEach(child => scene.remove(child));
        scene = null;
    }
    camera = null;
    glassModel = null;
    window.removeEventListener('resize', () => onWindowResize(document.getElementById('glass-scene-container')));
}

// Hàm trợ giúp để giải phóng vật liệu
function cleanMaterial(material) {
    for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'dispose' in value) {
            value.dispose();
        }
    }
}