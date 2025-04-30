import * as THREE from "three";
import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ADDITION, Brush, Evaluator, SUBTRACTION} from 'three-bvh-csg';

export default class ThreeRenderer {
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    private controls: OrbitControls;
    private clearCuts: boolean;
    private directLight: THREE.DirectionalLight;
    private loader: HTMLElement;
    constructor(previewElement)
    {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(previewElement.clientWidth, previewElement.clientHeight);
        this.loader = previewElement.querySelector('#loading');
        this.loader.style.display = 'none';
        previewElement.appendChild(this.renderer.domElement);
        this.renderer.shadowMap.enabled = true;                  // 🔥 důležité
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.z = 5;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.clearCuts = false;

        window.addEventListener('resize', () => {
            this.onWindowResize(previewElement, this.renderer, this.camera);
        });
        this.onWindowResize(previewElement, this.renderer, this.camera);
        this.animate();
    }

    hideRenderer()
    {
        this.loader.style.display = 'block';
        this.renderer.domElement.style.display = 'none';
    }

    showRenderer()
    {
        this.loader.style.display = 'none';
        this.renderer.domElement.style.display = 'block';
    }

    animate()
    {
        requestAnimationFrame(() => this.animate());
        this.updateLighting();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    update(mesh: THREE.Mesh)
    {
        this.scene.clear();
        this.scene.add(mesh);
        this.scene.add(this.createDimensionHelper(mesh));
        this.controls.target.copy(mesh.position);

        this.frameObject(this.camera, mesh, this.controls);
        this.setupLighting(mesh);

        this.renderer.render(this.scene, this.camera);
        this.showRenderer();
    }

    setupLighting(mesh: THREE.Mesh) {
        this.directLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directLight.castShadow = true;
        this.scene.add(this.directLight);

        const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(ambientLight);

        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
    }

    updateLighting() {
        if (this.directLight) {
            this.directLight.position.copy(this.camera.position);

            // Nastavíme target světla
            this.directLight.target.position.set(0, 0, 0);
            this.directLight.target.updateMatrixWorld();
        }
    }

    onWindowResize(previewElement, renderer, camera) {
        const width = previewElement.clientWidth;
        const height = previewElement.clientHeight;

        // Přenastav renderer
        renderer.setSize(width, height);

        // Přepočítat poměr stran kamery
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    generateMesh(width: number, height: number, cutX: number, cutY: number): THREE.Mesh
    {
        const depth = 10;
        const board = new Brush(new THREE.BoxGeometry(width, height, depth, cutX, cutY));
        const material = new THREE.MeshStandardMaterial({ color: 0xF5F5DC, wireframe: false });
        board.updateMatrixWorld();

        const evaluator = new Evaluator();
        let result = board;

        const bigRadius = 30;
        const largeCylinderGeo = new THREE.CylinderGeometry(bigRadius, bigRadius, depth * 2, 32, 1, false);
        largeCylinderGeo.rotateX(Math.PI / 2); // leží
        let cutter = new Brush(new THREE.BoxGeometry(bigRadius*2, bigRadius*2, depth * 2));
        cutter.position.set(bigRadius, bigRadius, 0);
        const cylinder = new Brush(largeCylinderGeo);
        cutter.updateMatrixWorld();
        cutter = evaluator.evaluate(cutter, cylinder, SUBTRACTION);

        const largeCorners = [
            [ width / 2 - bigRadius,  height / 2 - bigRadius, 0, Math.PI / 2 * 4],
            [ width / 2 - bigRadius, -height / 2 + bigRadius, 0, Math.PI / 2 * 3],
            [-width / 2 + bigRadius,  height / 2 - bigRadius, 0, Math.PI / 2],
            [-width / 2 + bigRadius, -height / 2 + bigRadius, 0, Math.PI / 2 * 2],
        ];

        let step = 4;
        for (const [x, y, z, rotation] of largeCorners) {
            cutter.rotation.z = Math.PI / 2;
            cutter.position.set(x, y, z);
            cutter.rotation.z = rotation;
            cutter.updateMatrixWorld();
            result = evaluator.evaluate(result, cutter, SUBTRACTION);
        }

        let pillRadius = 5;
        let pillHeight = 15;
        const pillGeo = new THREE.BoxGeometry(pillRadius, pillHeight - pillRadius, depth * 4);
        let pill = new Brush(pillGeo);
        const pillCircleGeo = new THREE.CylinderGeometry(pillRadius/2, pillRadius/2, depth * 2, 32, 1, false);
        const pillCircle = new Brush(pillCircleGeo);
        pillCircle.rotation.x = Math.PI / 2;
        pillCircle.position.set(0, (pillHeight - pillRadius) / 2, 0);
        pillCircle.updateMatrixWorld();
        pill = evaluator.evaluate(pill, pillCircle, ADDITION);
        pillCircle.position.set(0, -(pillHeight - pillRadius) / 2, 0);
        pillCircle.updateMatrixWorld();
        pill = evaluator.evaluate(pill, pillCircle, ADDITION);

        let coords = this.generatePattern(width, height, cutX, cutY);
        for (let i in coords)
        {
            pill.position.set(coords[i].x, coords[i].y, 0);
            pill.updateMatrixWorld();
            result = evaluator.evaluate(result, pill, SUBTRACTION);
        }

        let mesh = new THREE.Mesh(result.geometry, material);

        return mesh;
    }

    generatePattern(width, height, cutX, cutY)
    {
        const points = [];

        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const rowSpacing = 20;
        const colSpacing = 40;
        const offsetX = 20;

        const cutClearanceX = 15;
        const cutClearanceY = 5;

        const marginX = 20;
        const marginY = 20 + (cutClearanceY / 2);

        const minX = -halfWidth + marginX;
        const maxX = halfWidth - marginX;
        const minY = -halfHeight + marginY;
        const maxY = halfHeight - marginY;

        const cutLinesX = [];
        const cutLinesY = [];

        if (this.clearCuts) {
            for (let i = 1; i < cutX; i++) {
                cutLinesX.push(-halfWidth + (i * width / cutX));
            }
            for (let i = 1; i < cutY; i++) {
                cutLinesY.push(-halfHeight + (i * height / cutY));
            }
        }

        let y = minY;
        let rowIndex = 0;

        while (y <= maxY) {
            let x = minX + (rowIndex % 2 === 1 ? offsetX : 0);

            while (x <= maxX) {
                let valid = true;

                if (this.clearCuts) {
                    for (const cx of cutLinesX) {
                        if (Math.abs(x - cx) < cutClearanceX / 2) {
                            valid = false;
                            break;
                        }
                    }
                    for (const cy of cutLinesY) {
                        if (Math.abs(y - cy) < cutClearanceY / 2) {
                            valid = false;
                            break;
                        }
                    }
                }

                if (valid) {
                    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
                }

                x += colSpacing;
            }

            y += rowSpacing;
            rowIndex++;
        }

        return points;
    }

    createDimensionHelper(object) {
        const group = new THREE.Group();

        const box = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        // --- Čáry (Line) ---
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

        // Width line (X)
        const widthLineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(box.min.x, box.min.y, box.min.z),
            new THREE.Vector3(box.max.x, box.min.y, box.min.z)
        ]);
        const widthLine = new THREE.Line(widthLineGeom, material);
        group.add(widthLine);

        // Height line (Y)
        const heightLineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(box.min.x, box.min.y, box.min.z),
            new THREE.Vector3(box.min.x, box.max.y, box.min.z)
        ]);
        const heightLine = new THREE.Line(heightLineGeom, material);
        group.add(heightLine);

        // Depth line (Z)
        const depthLineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(box.min.x, box.min.y, box.min.z),
            new THREE.Vector3(box.min.x, box.min.y, box.max.z)
        ]);
        const depthLine = new THREE.Line(depthLineGeom, material);
        group.add(depthLine);

        // --- Popisky (Sprite) ---
        function createLabel(text, position) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(80, 40, 1); // Velikost labelu – upravit dle scény
            sprite.position.copy(position);
            return sprite;
        }

        // Šířka (X)
        const widthLabelPos = new THREE.Vector3(
            (box.min.x + box.max.x) / 2,
            box.min.y - size.y * 0.1,
            box.min.z
        );
        const widthLabel = createLabel(`${Math.round(size.x)} mm`, widthLabelPos);
        group.add(widthLabel);

        // Výška (Y)
        const heightLabelPos = new THREE.Vector3(
            box.min.x - size.x * 0.1,
            (box.min.y + box.max.y) / 2,
            box.min.z
        );
        const heightLabel = createLabel(`${Math.round(size.y)} mm`, heightLabelPos);
        group.add(heightLabel);

        // Hloubka (Z)
        const depthLabelPos = new THREE.Vector3(
            box.min.x - size.x * 0.1,
            box.min.y,
            (box.min.z + box.max.z) / 2
        );
        const depthLabel = createLabel(`${Math.round(size.z)} mm`, depthLabelPos);
        group.add(depthLabel);

        return group;
    }

    frameObject(camera, object, controls = null, offset = 1.25) {
        const box = new THREE.Box3().setFromObject(object);

        const size = new THREE.Vector3();
        box.getSize(size);

        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180); // přepočítáme FOV na radiány

        let cameraZ = (maxDim / 2) / Math.tan(fov / 2) * offset;

        // Pozice kamery
        camera.position.set(center.x, center.y, center.z + cameraZ);

        // Pokud je potřeba, můžeš kameru posunout víc nahoru nebo stranou:
        // camera.position.y += maxDim * 0.2;

        camera.lookAt(center);

        // Pokud používáš OrbitControls, aktualizuj target
        if (controls) {
            controls.target.copy(center);
            controls.update();
        }
    }
}
