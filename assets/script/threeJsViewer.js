// assets/script/threeJsViewer.js

// Import các module cần thiết từ CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.177.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/controls/OrbitControls.js';

// Import thư viện CANNON.js từ file cục bộ
import * as CANNON from './cannon-es.min.js';

// === BẮT ĐẦU MÃ 3D VIEWER ===
// Bọc toàn bộ logic trong một hàm để tránh xung đột biến toàn cục
export function initThreeJSViewer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found. Please provide a valid DOM element ID.`);
        return;
    }

    // Kiểm tra WebGL
    if (!window.WebGLRenderingContext) {
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.innerText = 'Error: Your browser does not support WebGL.';
        }
        throw new Error('WebGL not supported');
    }

    let scene, camera, renderer, world, controls;
    const meshesWithPhysics = []; // Sẽ lưu { mesh, body, visual, originalMaterial }
    let shadowHelperMesh;
    let directionalLight;
    let initialCameraState = null;
    let groundYPosition = 0; // Biến để lưu trữ vị trí Y của mặt đất
    let hdriTexture = null; // Biến để lưu trữ HDRI texture

    // Mảng để lưu trữ trạng thái ban đầu của các đối tượng vật lý
    const initialPhysicsStates = new Map();

    // TARGET_ASPECT được giữ lại để duy trì tỉ lệ 16:10
    const TARGET_ASPECT = 16 / 10; 

    // === ĐỐI TƯỢNG CẤU HÌNH CÁC TÍNH NĂNG ===
    const appConfig = {
        enableOrbitControls: false,
        showShadowHelper: false,
        enablePhysicsVisuals: false,
        enablePhysics: true,
        enableDragAndDrop: true,
        showHDRIBackground:false, // Đặt thành true để hiển thị HDRI làm nền
        hdriInitialRotationY: Math.PI * -0.1
    };

    const groundMaterial = new CANNON.Material('groundMaterial');
    const defaultBodyMaterial = new CANNON.Material('defaultBodyMaterial');

    const customMaterialCache = new Map();
    const contactMaterialPairs = new Set();

    function addContactMaterialSafely(mat1, mat2, friction, restitution, world) {
        const sortedNames = [mat1.name, mat2.name].sort();
        const contactKey = `${sortedNames[0]}_${sortedNames[1]}`;

        if (!contactMaterialPairs.has(contactKey)) {
            const contactMat = new CANNON.ContactMaterial(
                mat1, mat2,
                { friction: friction, restitution: restitution }
            );
            world.addContactMaterial(contactMat);
            contactMaterialPairs.add(contactKey);
            console.log(`Added ContactMaterial for: ${sortedNames[0]} vs ${sortedNames[1]} (F:${friction}, R:${restitution})`);
        }
    }

    function getOrCreateCustomMaterial(friction, restitution, world) {
        const key = `f${friction}_r${restitution}`;
        if (customMaterialCache.has(key)) {
            return customMaterialCache.get(key);
        }

        const newMat = new CANNON.Material(key);
        customMaterialCache.set(key, newMat);
        console.log(`Created new custom material: ${key}`);

        addContactMaterialSafely(groundMaterial, newMat, friction, restitution, world);
        addContactMaterialSafely(defaultBodyMaterial, newMat, friction, restitution, world);
        customMaterialCache.forEach((existingMat, existingKey) => {
            if (existingMat.name !== newMat.name) {
                addContactMaterialSafely(newMat, existingMat, friction, restitution, world);
            }
        });

        return newMat;
    }

    function createBodyVisualizer(body, scene, color = 0x00ff00, wireframe = true, opacity = 0.5) {
        if (body.shapes.length === 1 && body.shapes[0] instanceof CANNON.Trimesh) {
            return null;
        }

        const group = new THREE.Group();
        body.shapes.forEach((shape, index) => {
            let geometry;
            let material = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: wireframe,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            });

            if (shape instanceof CANNON.Box) {
                const s = shape.halfExtents;
                geometry = new THREE.BoxGeometry(s.x * 2, s.y * 2, s.z * 2);
            } else if (shape instanceof CANNON.Sphere) {
                geometry = new THREE.SphereGeometry(shape.radius, 16, 16);
            } else if (shape instanceof CANNON.Cylinder) {
                geometry = new THREE.CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, 16);
            } else if (shape instanceof CANNON.Plane) {
                geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
                material.opacity = 0.2;
            } else {
                console.warn(`Unsupported CANNON.Shape type for standalone visualization: ${shape.constructor.name}`);
                return;
            }

            if (geometry) {
                const visualMesh = new THREE.Mesh(geometry, material);

                const shapeOffset = body.shapeOffsets[index];
                const shapeQuaternion = body.shapeOrientations[index];

                if (shapeOffset) visualMesh.position.copy(shapeOffset);
                if (shapeQuaternion) visualMesh.quaternion.copy(shapeQuaternion);

                group.add(visualMesh);
            }
        });
        scene.add(group);
        return group;
    }

    function init() {
        try {
            scene = new THREE.Scene();

            // ĐIỀU CHỈNH RENDERER ĐỂ KHẮC PHỤC KẺ SỌC (Răng cưa)
            renderer = new THREE.WebGLRenderer({
                antialias: true, // Rất quan trọng để làm mịn các cạnh
                alpha: true      // Giữ nền trong suốt nếu không có HDRI background
            });

            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.5;
            renderer.outputColorSpace = THREE.SRGBColorSpace; 
            renderer.setClearColor(0x000000, 0); // Vẫn trong suốt

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Đặt kích thước ban đầu, sẽ được điều chỉnh bởi onWindowResize
            renderer.setSize(container.clientWidth, container.clientHeight);
            // Canvas sẽ được định vị và thay đổi kích thước bởi onWindowResize
            // Không cần absolute/top/left ở đây vì onWindowResize sẽ xử lý
            container.appendChild(renderer.domElement); // Gắn vào container được truyền vào

            world = new CANNON.World();
            world.gravity.set(0, -9.82, 0);
            world.solver.iterations = 15;
            world.allowSleep = true;

            addContactMaterialSafely(groundMaterial, defaultBodyMaterial, 0.8, 0.05, world);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            scene.add(ambientLight);

            directionalLight = new THREE.DirectionalLight(0xffffff, 2);
            directionalLight.position.set(10, 15, 10);

            directionalLight.castShadow = true;

            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;

            const d = 15;
            directionalLight.shadow.camera.left = -d;
            directionalLight.shadow.camera.right = d;
            directionalLight.shadow.camera.top = d;
            directionalLight.shadow.camera.bottom = -d;
            directionalLight.shadow.camera.near = 0.1;
            directionalLight.shadow.camera.far = 50;

            shadowHelperMesh = new THREE.CameraHelper( directionalLight.shadow.camera );
            if (appConfig.showShadowHelper) {
                scene.add( shadowHelperMesh );
                shadowHelperMesh.update();
            }

            scene.add(directionalLight);

            const rgbeLoader = new RGBELoader();
            // CẬP NHẬT ĐƯỜNG DẪN HDRI MỚI
            rgbeLoader.load('assets/3d/brown_photostudio_01_1k.hdr', function (texture) {
                hdriTexture = texture;
                hdriTexture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = hdriTexture;
                scene.environment.intensity = 1.5;

                // Áp dụng rotation cho môi trường và nền
                scene.environmentRotation.y = appConfig.hdriInitialRotationY;

                if (appConfig.showHDRIBackground) {
                    scene.background = hdriTexture;
                    scene.backgroundIntensity = 1.5;
                    if (scene.background && scene.background.isTexture) {
                         scene.backgroundRotation.y = appConfig.hdriInitialRotationY; 
                    }
                } else {
                    scene.background = null;
                }
                console.log('HDRI loaded successfully:', hdriTexture);
            }, function (progress) {
                console.log('HDRI loading progress:', progress.loaded / progress.total * 100, '%');
            }, function (error) {
                console.error('Error loading HDRI:', error);
                scene.background = null; 
                document.getElementById('error').innerText = 'Error: Failed to load HDRI';
            });

            // Tạo mặt đất vật lý
            const groundShape = new CANNON.Plane();
            const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
            groundBody.addShape(groundShape);
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Xoay mặt đất
            groundYPosition = 0; // Đảm bảo groundBody.position.y là 0
            groundBody.position.y = groundYPosition;
            world.addBody(groundBody);


            // Tải mô hình GLB
            const loader = new GLTFLoader();
            // Đường dẫn mô hình GLB cũng tương đối từ index.html
            loader.load('assets/3d/SOFTWARE.glb', function (gltf) {
                const model = gltf.scene;

                console.log('Model loaded:', model);

                model.traverse(function (object) {
                    if (object.isLight) {
                        console.log('Light found:', object, 'Original intensity:', object.intensity);
                        object.intensity = 1;
                        console.log('Adjusted intensity:', object.intensity);
                    }
                    if (object.isMesh && object.material) {
                        const mesh = object;
                        const geometry = mesh.geometry;

                        if (!geometry.boundingBox) {
                            geometry.computeBoundingBox();
                        }

                        const size = new THREE.Vector3();
                        geometry.boundingBox.getSize(size);

                        if (size.x <= 0 || size.y <= 0 || size.z <= 0) {
                            console.warn(`Mesh "${mesh.name}" has zero dimension bounding box. Skipping physics body.`);
                            return;
                        }

                        mesh.castShadow = true;
                        mesh.receiveShadow = true;

                        if (mesh.material.isMeshStandardMaterial || mesh.material.isMeshPhysicalMaterial) {
                            if (mesh.material.roughnessMap) {
                                if (mesh.material.roughnessMap.colorSpace && mesh.material.roughnessMap.colorSpace !== THREE.NoColorSpace) {
                                    console.warn(`Roughness map for mesh "${mesh.name}" has sRGB colorSpace. Setting to THREE.NoColorSpace.`);
                                    mesh.material.roughnessMap.colorSpace = THREE.NoColorSpace;
                                    mesh.material.needsUpdate = true;
                                }
                            }
                        }

                        if (mesh.name === 'STATIC_Ground' && !(mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial)) {
                            console.warn(`STATIC_Ground is using a material type (${mesh.material.type}) that might not correctly receive shadows. Consider converting it to MeshStandardMaterial if shadows are still not visible.`);
                        } else if (!(mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial)) {
                            console.warn(`Mesh "${mesh.name}" is using a material type (${mesh.material.type}) that might not correctly receive/cast shadows.`);
                        }

                        let shape;
                        let mass;
                        let bodyMaterial;

                        const worldPosition = new THREE.Vector3();
                        mesh.getWorldPosition(worldPosition);
                        const worldQuaternion = new THREE.Quaternion();
                        mesh.getWorldQuaternion(worldQuaternion);

                        const physicsMass = mesh.userData.physicsMass;
                        const physicsFriction = mesh.userData.physicsFriction;
                        const physicsRestitution = mesh.userData.physicsRestitution;
                        const physicsShapeType = mesh.userData.physicsShape;
                        const isCollisionObject = mesh.userData.isCollisionObject;

                        console.log(`Mesh ${mesh.name} custom properties: isCollisionObject=${isCollisionObject}, Mass=${physicsMass}, Friction=${physicsFriction}, Restitution=${physicsRestitution}, Shape=${physicsShapeType}`);

                        if (mesh.name === 'STATIC_Ground' || isCollisionObject === true) {
                            mass = 0;
                            bodyMaterial = groundMaterial;
                            console.log(`Static object found: ${mesh.name}. Setting mass to 0.`);

                            switch (physicsShapeType) {
                                case 'Sphere':
                                    const radius = Math.max(size.x, size.y, size.z) / 2;
                                    shape = new CANNON.Sphere(radius);
                                    console.log(`Static Mesh ${mesh.name} identified as Sphere (radius: ${radius}).`);
                                    break;
                                case 'Mesh':
                                    if (!mesh.geometry.isBufferGeometry) {
                                        console.warn(`Mesh "${mesh.name}" geometry is not BufferGeometry. Cannot create CANNON.Trimesh. Falling back to Box.`);
                                        shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                                        break;
                                    }

                                    const positions = mesh.geometry.attributes.position.array;
                                    let indices = mesh.geometry.index ? mesh.geometry.index.array : undefined;

                                    if (!indices) {
                                        console.warn(`Mesh "${mesh.name}" is non-indexed. Generating indices for CANNON.Trimesh.`);
                                        const numVertices = positions.length / 3;
                                        indices = [];
                                        for (let i = 0; i < numVertices; i += 3) {
                                            indices.push(i, i + 1, i + 2);
                                        }
                                    }
                                    
                                    shape = new CANNON.Trimesh(positions, indices);
                                    console.log(`Static Mesh ${mesh.name} identified as CANNON.Trimesh.`);
                                    console.warn(`LƯU Ý: CANNON.Trimesh tốn kém tài nguyên tính toán cho các mesh phức tạp. Dynamic Trimeshes rất hạn chế và chỉ va chạm được với các hình dạng nguyên thủy.`);
                                    break;
                                case 'Box':
                                default:
                                    shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                                    console.log(`Static Mesh ${mesh.name} identified as Box (default).`);
                                    break;
                            }

                            if (mesh.name === 'STATIC_Ground') {
                                groundYPosition = worldPosition.y;
                                console.log(`Ground Y position set to: ${groundYPosition}`);
                            }
                        }
                        else {
                            mass = physicsMass !== undefined ? physicsMass : 1;

                            switch (physicsShapeType) {
                                case 'Sphere':
                                    const radius = Math.max(size.x, size.y, size.z) / 2;
                                    shape = new CANNON.Sphere(radius);
                                    console.log(`Dynamic Mesh ${mesh.name} identified as Sphere by custom property (radius: ${radius}).`);
                                    break;
                                case 'Mesh':
                                    console.warn(`CẢNH BÁO: Đang cố gắng tạo CANNON.Trimesh cho đối tượng động "${mesh.name}". Dynamic Trimeshes bị hạn chế nghiêm ngặt (không thể va chạm với Trimeshes khác, chỉ có thể va chạm với các hình nguyên thủy) và có thể không ổn định/hiệu suất kém. Quay lại sử dụng CANNON.Box.`);
                                    shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                                    break;
                                case 'Box':
                                default:
                                    shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                                    console.log(`Dynamic Mesh ${mesh.name} identified as Box (default).`);
                                    break;
                            }

                            if (physicsFriction !== undefined || physicsRestitution !== undefined) {
                                const frictionVal = physicsFriction !== undefined ? physicsFriction : 0.8;
                                const restitutionVal = physicsRestitution !== undefined ? physicsRestitution : 0.05;
                                bodyMaterial = getOrCreateCustomMaterial(frictionVal, restitutionVal, world);
                            } else {
                                bodyMaterial = getOrCreateCustomMaterial(1, 0, world);
                                console.log(`Dynamic Mesh ${mesh.name} using default body material (F:1, R:0).`);
                            }

                            worldPosition.y += 0.05;
                        }

                        const body = new CANNON.Body({
                            mass: mass,
                            position: new CANNON.Vec3(worldPosition.x, worldPosition.y, worldPosition.z),
                            quaternion: new CANNON.Quaternion(worldQuaternion.x, worldQuaternion.y, worldQuaternion.z, worldQuaternion.w),
                            shape: shape,
                            material: bodyMaterial,
                            allowSleep: true,
                            sleepSpeedLimit: 0.1,
                            sleepTimeLimit: 3,
                            linearDamping: 0.9,
                            angularDamping: 0.9
                        });
                        world.addBody(body);

                        let visualMeshGroup = null;
                        if (!(shape instanceof CANNON.Trimesh)) {
                            visualMeshGroup = createBodyVisualizer(body, scene, (mass === 0) ? 0x0000ff : 0x00ff00);
                            if (visualMeshGroup && mesh.name === 'STATIC_Ground') {
                                visualMeshGroup.position.y += 0.005;
                            }
                            if (visualMeshGroup) {
                                visualMeshGroup.visible = appConfig.enablePhysicsVisuals;
                            }
                        }
                        
                        meshesWithPhysics.push({ mesh: mesh, body: body, visual: visualMeshGroup, originalMaterial: mesh.material });

                        initialPhysicsStates.set(body.id, {
                            position: body.position.clone(),
                            quaternion: body.quaternion.clone(),
                            type: body.type,
                            mass: body.mass
                        });
                    }
                });

                // Camera handling logic
                if (gltf.cameras && gltf.cameras.length > 0) {
                    camera = gltf.cameras[0];
                    console.log('Camera found in GLB and set:', camera);
                    if (camera.isPerspectiveCamera) {
                        camera.fov = 18; // Giữ FOV nếu bạn muốn
                        // Aspect ratio sẽ được điều chỉnh bởi onWindowResize để giữ 16:10
                        camera.updateProjectionMatrix();
                    }
                    initialCameraState = {
                        position: camera.position.clone(),
                        quaternion: camera.quaternion.clone(),
                        fov: camera.fov,
                        near: camera.near,
                        far: camera.far,
                    };
                } else {
                    console.warn('No camera found in GLB, using default camera');
                    // Sử dụng TARGET_ASPECT cho camera ban đầu
                    camera = new THREE.PerspectiveCamera(75, TARGET_ASPECT, 0.1, 1000);
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    camera.position.copy(center).add(new THREE.Vector3(0, maxDim * 0.7, maxDim * 2.5));
                    camera.lookAt(center);
                    initialCameraState = {
                        position: camera.position.clone(),
                        quaternion: camera.quaternion.clone(),
                        fov: camera.fov,
                        near: camera.near,
                        far: camera.far,
                    };
                }

                scene.add(model);

                if (appConfig.enableOrbitControls) {
                    controls = new OrbitControls(camera, renderer.domElement);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.05;
                    controls.screenSpacePanning = false;
                    controls.maxPolarAngle = Math.PI / 2;
                    const modelCenter = new THREE.Vector3();
                    if (model) {
                         const box = new THREE.Box3().setFromObject(model);
                         box.getCenter(modelCenter);
                         controls.target.copy(modelCenter);
                    } else {
                        controls.target.set(0,0,0);
                    }
                    controls.update();
                }

                setupDragControls(); // Call setupDragControls after scene and camera are ready

                onWindowResize(); // Initial resize
                window.addEventListener('resize', onWindowResize); // Attach resize listener to window
                animate(); // Start animation loop
            }, undefined, function (error) {
                console.error('Error loading GLB:', error);
                document.getElementById('error').innerText = 'Error: Failed to load GLB model';
            });
        } catch (e) {
            console.error('Runtime error:', e);
            document.getElementById('error').innerText = 'Runtime error: ' + e.message;
        }
    }

    let lastTime = performance.now();
    const timeStep = 1 / 60;
    function animate(currentTime) {
        requestAnimationFrame(animate);

        if (appConfig.enablePhysics && world) {
            const dt = (currentTime - lastTime) / 1000;

            if (dt > 0 && dt < 0.1) {
                 world.step(timeStep, dt, 3);
            } else if (dt >= 0.1) {
                world.step(timeStep);
                console.warn('Large delta time detected, capping physics step to fixed time step.');
            }

            lastTime = currentTime;

            for (let i = 0; i < meshesWithPhysics.length; i++) {
                const { mesh, body, visual } = meshesWithPhysics[i];
                // Chỉ cập nhật vị trí/quaternion của mesh nếu nó không đang được kéo
                if (!isDragging || draggedObject !== mesh) {
                    mesh.position.copy(body.position);
                    mesh.quaternion.copy(body.quaternion);
                }

                if (visual) {
                    visual.position.copy(body.position);
                    visual.quaternion.copy(body.quaternion);
                }

                // Cập nhật hiển thị visualizer của Trimesh (nếu enablePhysicsVisuals là true)
                if (appConfig.enablePhysicsVisuals && body.shapes[0] instanceof CANNON.Trimesh) {
                     if (mesh.material && mesh.material.uuid !== meshesWithPhysics[i].originalMaterial.uuid) {
                         // Nếu vật liệu đã là visual, không làm gì cả
                     } else {
                        const visualColor = (body.mass === 0) ? 0x0000ff : 0x00ff00;
                        mesh.material = new THREE.MeshBasicMaterial({
                            color: visualColor,
                            wireframe: true,
                            transparent: true,
                            opacity: 0.5,
                            side: THREE.DoubleSide
                        });
                     }
                } else if (!appConfig.enablePhysicsVisuals && body.shapes[0] instanceof CANNON.Trimesh) {
                    // Khôi phục vật liệu gốc nếu không hiển thị visualizer
                    if (mesh.material && meshesWithPhysics[i].originalMaterial) {
                        mesh.material = meshesWithPhysics[i].originalMaterial;
                    }
                }
            }
        } else if (!appConfig.enablePhysics) {
            lastTime = currentTime;
        }

        if (appConfig.enableOrbitControls && controls) {
            controls.update();
        }

        if (shadowHelperMesh) {
            shadowHelperMesh.visible = appConfig.showShadowHelper;
            if (appConfig.showShadowHelper) {
                shadowHelperMesh.update();
            }
        }

        if (scene && camera) {
            renderer.render(scene, camera);
        }
    }
function onWindowResize() {
    if (!camera || !renderer || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 👉 Thay đổi ở đây: dùng aspect thật của container
    const aspect = containerWidth / containerHeight;

    // ✅ Cập nhật camera theo đúng kích thước thật
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize(containerWidth, containerHeight);

    // Loại bỏ logic canh giữa vì không còn cần thiết nữa
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';

    console.log(`Resized to: ${containerWidth}x${containerHeight}, Aspect: ${aspect}`);
}

    // === LOGIC KÉO THẢ ĐỐI TƯỢNG ===
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let isDragging = false;
    let draggedObject = null;
    let plane = new THREE.Plane();
    let intersection = new THREE.Vector3();
    let offset = new THREE.Vector3();

    function setupDragControls() {
        if (appConfig.enableDragAndDrop) {
            // Lắng nghe sự kiện trên renderer.domElement (canvas)
            renderer.domElement.addEventListener('mousedown', onMouseDown, false);
            renderer.domElement.addEventListener('mousemove', onMouseMove, false);
            renderer.domElement.addEventListener('mouseup', onMouseUp, false);
            renderer.domElement.addEventListener('mouseleave', onMouseUp, false);
        }
    }

    function onMouseDown(event) {
        if (!appConfig.enableDragAndDrop) return;
        if (appConfig.enableOrbitControls) { // Tránh xung đột với OrbitControls
            return;
        }

        const canvasBounds = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const draggableMeshes = meshesWithPhysics
            .filter(item => item.body.mass > 0)
            .map(item => item.mesh);

        const intersects = raycaster.intersectObjects(draggableMeshes, true);

        if (intersects.length > 0) {
            // Tìm đối tượng cấp cao nhất trong meshesWithPhysics
            let currentMesh = intersects[0].object;
            while(currentMesh.parent && !meshesWithPhysics.some(item => item.mesh === currentMesh)) {
                currentMesh = currentMesh.parent;
                if(currentMesh.isScene) break;
            }
            if(meshesWithPhysics.some(item => item.mesh === currentMesh)) {
                draggedObject = currentMesh;
                console.log("Kéo đối tượng:", draggedObject.name);

                const physicsItem = meshesWithPhysics.find(item => item.mesh === draggedObject);
                if (physicsItem && physicsItem.body) {
                    physicsItem.body.type = CANNON.Body.STATIC; // Chuyển sang STATIC khi kéo
                    physicsItem.body.allowSleep = false;
                }

                // Đánh thức các body khác để chúng có thể tương tác với đối tượng đang kéo
                world.bodies.forEach(body => {
                    if (body.mass > 0 && body !== physicsItem.body) {
                        body.wakeUp();
                    }
                });

                plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal).negate(), draggedObject.position);

                raycaster.ray.intersectPlane(plane, intersection);
                offset.copy(draggedObject.position).sub(intersection);
                isDragging = true;
                renderer.domElement.style.cursor = 'grabbing';
            } else {
                draggedObject = null;
                isDragging = false;
            }
        }
    }

    function onMouseMove(event) {
        if (!appConfig.enableDragAndDrop || !isDragging || !draggedObject) return;
        if (appConfig.enableOrbitControls) return;

        event.preventDefault();

        const canvasBounds = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (raycaster.ray.intersectPlane(plane, intersection)) {
            const physicsItem = meshesWithPhysics.find(item => item.mesh === draggedObject);
            if (physicsItem && physicsItem.body) {
                let objectHalfHeight = 0;
                if (physicsItem.body.shapes[0] instanceof CANNON.Box) {
                    objectHalfHeight = physicsItem.body.shapes[0].halfExtents.y;
                } else if (physicsItem.body.shapes[0] instanceof CANNON.Sphere) {
                    objectHalfHeight = physicsItem.body.shapes[0].radius;
                } else if (physicsItem.body.shapes[0] instanceof CANNON.Trimesh) {
                    const aabb = physicsItem.body.shapes[0].computeAABB();
                    objectHalfHeight = (aabb.upperBound.y - aabb.lowerBound.y) / 2;
                }
                
                const minAllowedY = groundYPosition + objectHalfHeight; // Đảm bảo đối tượng không xuyên qua mặt đất

                if (intersection.y + offset.y < minAllowedY) {
                    intersection.y = minAllowedY - offset.y;
                }
            }

            draggedObject.position.copy(intersection).add(offset);

            if (physicsItem && physicsItem.body) {
                physicsItem.body.position.copy(draggedObject.position);
                physicsItem.body.velocity.set(0, 0, 0); // Đảm bảo không có vận tốc khi kéo
                physicsItem.body.angularVelocity.set(0, 0, 0);
            }
        }
    }

    function onMouseUp() {
        if (!appConfig.enableDragAndDrop) return;
        if (appConfig.enableOrbitControls) return;

        if (isDragging && draggedObject) {
            const physicsItem = meshesWithPhysics.find(item => item.mesh === draggedObject);
            if (physicsItem && physicsItem.body) {
                const initialState = initialPhysicsStates.get(physicsItem.body.id);
                if (initialState) {
                    physicsItem.body.type = initialState.type; // Trở lại kiểu ban đầu (DYNAMIC/STATIC)
                    physicsItem.body.mass = initialState.mass; // Trở lại khối lượng ban đầu
                    physicsItem.body.allowSleep = initialState.type === CANNON.Body.DYNAMIC; // Cho phép ngủ nếu là dynamic
                }
                physicsItem.body.velocity.set(0, -0.01, 0); // Tạo một lực nhỏ để nó rơi nếu là dynamic
                physicsItem.body.wakeUp();
            }
            draggedObject = null;
            isDragging = false;
            renderer.domElement.style.cursor = 'auto'; // Khôi phục con trỏ chuột
        }
    }

   // === LOGIC NÚT ĐIỀU KHIỂN GIA DIỆN CÒN LẠI ===
    // const resetAnimationButton = document.getElementById('resetAnimationButton'); // Dòng này không cần nữa

    const toolsTitleElement = document.getElementById('toolsTitle'); // Lấy thẻ h3 theo ID mới

    // Di chuyển hàm reset animation ra ngoài để có thể tái sử dụng
    function resetSceneAnimation() {
        console.log('Resetting animation...');
        meshesWithPhysics.forEach(({ mesh, body }) => {
            const initialState = initialPhysicsStates.get(body.id);
            if (initialState) {
                body.position.copy(initialState.position);
                body.quaternion.copy(initialState.quaternion);

                body.velocity.set(0, 0, 0);
                body.angularVelocity.set(0, 0, 0);

                body.type = initialState.type;
                body.mass = initialState.mass;

                body.wakeUp();

                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        });
        console.log('Animation reset complete.');
    }

    if (toolsTitleElement) {
        // Gán sự kiện click cho tiêu đề "Tools"
        toolsTitleElement.addEventListener('click', resetSceneAnimation);
        console.log('Reset animation listener attached to Tools title.');
    }
    
    init();
}
// === KẾT THÚC MÃ 3D VIEWER ===