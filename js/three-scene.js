/* ==========================================================================
   THREE-SCENE.JS - 3D Wonderland (Balloons, Stars, Gift Boxes, Confetti)
   ========================================================================== */

(function () {
    let scene, camera, renderer;
    let balloons = [];
    let stars = [];
    let giftBoxes = [];
    let confettiParticles = [];
    let floatingGroup;
    let mouseX = 0, mouseY = 0;
    let targetCameraX = 0, targetCameraY = 0;
    let clock = { time: 0 };
    let pointLight1, pointLight2;

    function initThreeScene() {
        const canvas = document.getElementById('three-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        // 1. Scene & Camera Setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 28;

        // 2. WebGL Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 3. Dynamic Colorful Lighting
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.75);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xFFF3D6, 0.9);
        dirLight.position.set(12, 20, 18);
        scene.add(dirLight);

        // Moving Color Point Lights for Warm Festive Mood
        pointLight1 = new THREE.PointLight(0xFF6B8B, 1.2, 50);
        pointLight1.position.set(-15, 10, 10);
        scene.add(pointLight1);

        pointLight2 = new THREE.PointLight(0x4EA8DE, 1.2, 50);
        pointLight2.position.set(15, -10, 10);
        scene.add(pointLight2);

        floatingGroup = new THREE.Group();
        scene.add(floatingGroup);

        // Color Palettes (Star Champs Festive Theme)
        const colors = [
            0xFF6B8B, // Star Coral
            0xFFD166, // Star Yellow
            0x4EA8DE, // Star Blue
            0x06D6A0, // Star Mint
            0x9B5DE5, // Star Purple
            0xFF9F1C  // Orange
        ];

        // 4. Create 3D Balloons with string
        create3DBalloons(colors);

        // 5. Create 3D Sparkling Stars
        create3DStars();

        // 6. Create 3D Festive Gift Boxes
        create3DGiftBoxes(colors);

        // 7. Create 3D Speech Therapy Sound Wave Rings
        createSoundRings(colors);

        // 8. Create 3D Tumbling Confetti Cloud
        create3DConfetti(colors);

        // 9. Mouse & Touch Parallax Listener
        setupInteractionListeners();

        // 10. Start Animation Loop
        animate();
    }

    /* Helper: Create 3D Balloons with Tapered Bottom and String */
    function create3DBalloons(colors) {
        const sphereGeom = new THREE.SphereGeometry(1.2, 32, 24);
        // Taper bottom vertices slightly for balloon shape
        const pos = sphereGeom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i);
            if (y < 0) {
                let factor = 1 + (y * 0.18);
                pos.setX(i, pos.getX(i) * factor);
                pos.setZ(i, pos.getZ(i) * factor);
            }
        }
        sphereGeom.computeVertexNormals();

        const knotGeom = new THREE.ConeGeometry(0.22, 0.35, 12);
        knotGeom.rotateX(Math.PI);

        for (let i = 0; i < 9; i++) {
            const color = colors[i % colors.length];
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.25,
                metalness: 0.15,
                transparent: true,
                opacity: 0.88
            });

            const balloonMesh = new THREE.Mesh(sphereGeom, mat);
            const knotMesh = new THREE.Mesh(knotGeom, mat);
            knotMesh.position.y = -1.25;

            const balloonGroup = new THREE.Group();
            balloonGroup.add(balloonMesh);
            balloonGroup.add(knotMesh);

            // Balloon String (Curved Line)
            const stringPoints = [];
            for (let j = 0; j <= 8; j++) {
                stringPoints.push(new THREE.Vector3(
                    Math.sin(j * 0.7) * 0.15,
                    -1.3 - (j * 0.35),
                    0
                ));
            }
            const stringGeom = new THREE.BufferGeometry().setFromPoints(stringPoints);
            const stringMat = new THREE.LineBasicMaterial({ color: 0xCCCCCC, transparent: true, opacity: 0.6 });
            const stringLine = new THREE.Line(stringGeom, stringMat);
            balloonGroup.add(stringLine);

            // Positioning spread across the view
            const x = (Math.random() - 0.5) * 44;
            const y = (Math.random() - 0.5) * 26 + 2;
            const z = (Math.random() - 0.5) * 16 - 2;
            balloonGroup.position.set(x, y, z);

            const scale = Math.random() * 0.45 + 0.85;
            balloonGroup.scale.set(scale, scale, scale);

            floatingGroup.add(balloonGroup);
            balloons.push({
                group: balloonGroup,
                baseY: y,
                speedY: Math.random() * 0.015 + 0.01,
                swaySpeed: Math.random() * 0.02 + 0.01,
                offset: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.01
            });
        }
    }

    /* Helper: Create 3D Stars (Faceted Golden Stars) */
    function create3DStars() {
        const starGeom = new THREE.OctahedronGeometry(1.1, 0);
        const starMat = new THREE.MeshStandardMaterial({
            color: 0xFFD166,
            roughness: 0.2,
            metalness: 0.6,
            emissive: 0xFFA500,
            emissiveIntensity: 0.2
        });

        for (let i = 0; i < 14; i++) {
            const mesh = new THREE.Mesh(starGeom, starMat);
            const x = (Math.random() - 0.5) * 46;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 20 - 4;
            mesh.position.set(x, y, z);

            const s = Math.random() * 0.5 + 0.45;
            mesh.scale.set(s, s * 1.3, s);

            floatingGroup.add(mesh);
            stars.push({
                mesh: mesh,
                baseY: y,
                rotX: (Math.random() - 0.5) * 0.03,
                rotY: (Math.random() - 0.5) * 0.035,
                floatSpeed: Math.random() * 0.02 + 0.01,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    /* Helper: Create 3D Gift Boxes with Ribbons */
    function create3DGiftBoxes(colors) {
        const boxGeom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const ribbonHGeom = new THREE.BoxGeometry(1.54, 0.32, 1.54);
        const ribbonVGeom = new THREE.BoxGeometry(0.32, 1.54, 1.54);

        for (let i = 0; i < 6; i++) {
            const boxColor = colors[i % colors.length];
            const ribbonColor = (i % 2 === 0) ? 0xFFD166 : 0xFFFFFF;

            const boxMat = new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.3, metalness: 0.1 });
            const ribMat = new THREE.MeshStandardMaterial({ color: ribbonColor, roughness: 0.2, metalness: 0.2 });

            const boxMesh = new THREE.Mesh(boxGeom, boxMat);
            const ribH = new THREE.Mesh(ribbonHGeom, ribMat);
            const ribV = new THREE.Mesh(ribVGeom, ribMat);

            const giftGroup = new THREE.Group();
            giftGroup.add(boxMesh);
            giftGroup.add(ribH);
            giftGroup.add(ribV);

            const x = (Math.random() - 0.5) * 42;
            const y = (Math.random() - 0.5) * 24 - 4;
            const z = (Math.random() - 0.5) * 14 - 3;
            giftGroup.position.set(x, y, z);
            giftGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            const s = Math.random() * 0.35 + 0.65;
            giftGroup.scale.set(s, s, s);

            floatingGroup.add(giftGroup);
            giftBoxes.push({
                group: giftGroup,
                baseY: y,
                rotX: (Math.random() - 0.5) * 0.015,
                rotY: (Math.random() - 0.5) * 0.018,
                floatSpeed: Math.random() * 0.012 + 0.008,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    /* Helper: Speech Therapy Sound Wave Rings (Torus) */
    function createSoundRings(colors) {
        const torusGeom = new THREE.TorusGeometry(1.2, 0.22, 16, 32);
        for (let i = 0; i < 8; i++) {
            const mat = new THREE.MeshStandardMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.5,
                roughness: 0.2
            });
            const mesh = new THREE.Mesh(torusGeom, mat);
            const x = (Math.random() - 0.5) * 44;
            const y = (Math.random() - 0.5) * 28;
            const z = (Math.random() - 0.5) * 16 - 5;
            mesh.position.set(x, y, z);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            const s = Math.random() * 0.5 + 0.6;
            mesh.scale.set(s, s, s);

            floatingGroup.add(mesh);
            stars.push({
                mesh: mesh,
                baseY: y,
                rotX: (Math.random() - 0.5) * 0.02,
                rotY: (Math.random() - 0.5) * 0.02,
                floatSpeed: Math.random() * 0.015 + 0.01,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    /* Helper: 3D Confetti Particles Cloud */
    function create3DConfetti(colors) {
        const confGeom = new THREE.PlaneGeometry(0.35, 0.65);
        for (let i = 0; i < 45; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.75
            });
            const mesh = new THREE.Mesh(confGeom, mat);
            const x = (Math.random() - 0.5) * 48;
            const y = (Math.random() - 0.5) * 32;
            const z = (Math.random() - 0.5) * 20;
            mesh.position.set(x, y, z);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            floatingGroup.add(mesh);
            confettiParticles.push({
                mesh: mesh,
                baseY: y,
                rotSpeedX: (Math.random() - 0.5) * 0.04,
                rotSpeedY: (Math.random() - 0.5) * 0.05,
                floatSpeed: Math.random() * 0.018 + 0.01,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    /* Mouse & Touch Parallax */
    function setupInteractionListeners() {
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            targetCameraX = mouseX * 2.5;
            targetCameraY = -mouseY * 2.0;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const t = e.touches[0];
                mouseX = (t.clientX / window.innerWidth - 0.5) * 2;
                mouseY = (t.clientY / window.innerHeight - 0.5) * 2;
                targetCameraX = mouseX * 2.0;
                targetCameraY = -mouseY * 1.5;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /* Render & Animation Loop */
    function animate() {
        requestAnimationFrame(animate);
        if (!renderer || !scene || !camera) return;

        clock.time += 0.02;

        // Move Dynamic Point Lights in Circles
        if (pointLight1) {
            pointLight1.position.x = Math.sin(clock.time * 0.8) * 20;
            pointLight1.position.y = Math.cos(clock.time * 0.6) * 15;
        }
        if (pointLight2) {
            pointLight2.position.x = Math.cos(clock.time * 0.7) * 20;
            pointLight2.position.y = Math.sin(clock.time * 0.5) * 15;
        }

        // Balloons Swaying & Floating Up-Down
        balloons.forEach((b) => {
            b.group.position.y = b.baseY + Math.sin(clock.time * 1.2 + b.offset) * 1.4;
            b.group.rotation.z = Math.sin(clock.time * b.swaySpeed + b.offset) * 0.12;
            b.group.rotation.y += b.rotSpeed;
        });

        // Stars Twinkling & Rotating
        stars.forEach((s) => {
            s.mesh.rotation.x += s.rotX;
            s.mesh.rotation.y += s.rotY;
            s.mesh.position.y = s.baseY + Math.sin(clock.time + s.offset) * 0.8;
        });

        // Gift Boxes Floating
        giftBoxes.forEach((g) => {
            g.group.rotation.x += g.rotX;
            g.group.rotation.y += g.rotY;
            g.group.position.y = g.baseY + Math.sin(clock.time * 0.9 + g.offset) * 0.9;
        });

        // 3D Confetti Tumbling
        confettiParticles.forEach((c) => {
            c.mesh.rotation.x += c.rotSpeedX;
            c.mesh.rotation.y += c.rotSpeedY;
            c.mesh.position.y = c.baseY + Math.sin(clock.time * 1.4 + c.offset) * 1.1;
        });

        // Camera Smooth Spring Parallax (No slow easing, snappy tracking!)
        camera.position.x += (targetCameraX - camera.position.x) * 0.06;
        camera.position.y += (targetCameraY - camera.position.y) * 0.06;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    // Expose init function
    window.initThreeScene = initThreeScene;
})();
