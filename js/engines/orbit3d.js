// KARAGEN - Orbit 3D Engine
// Words orbit around the active word like planets

const Orbit3DEngine = {
    scene: null,
    camera: null,
    renderer: null,
    wordMeshes: [],
    particles: null,
    orbitGroup: null,
    initialized: false,
    currentCenter: null,

    init: function (container, words) {
        const state = window.KaraState;

        container.innerHTML = '';
        container.style.display = 'none';

        let canvas = document.getElementById('three-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'three-canvas';
            canvas.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;';
            document.getElementById('phone-wrapper').appendChild(canvas);
        }
        canvas.style.display = 'block';

        const wrapper = document.getElementById('phone-wrapper');
        const width = wrapper.offsetWidth;
        const height = wrapper.offsetHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
        this.camera.position.set(0, 3, 10);

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Orbit group
        this.orbitGroup = new THREE.Group();
        this.scene.add(this.orbitGroup);

        this.wordMeshes = [];

        // Create words - all start at origin, will orbit during update
        words.forEach((w, i) => {
            const sprite = this.createTextSprite(w.text, state.primaryColor);
            sprite.position.set(0, 0, 0);
            sprite.userData = {
                index: i,
                orbitRadius: 0,
                orbitAngle: 0,
                orbitSpeed: 0
            };

            this.orbitGroup.add(sprite);
            this.wordMeshes.push(sprite);
        });

        // Add orbit rings
        this.addOrbitRings();

        // Add particles
        this.addStars();

        this.initialized = true;
        window.addEventListener('resize', () => this.onResize());
    },

    createTextSprite: function (text, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const textLen = text.length;
        let fontSize;
        if (textLen <= 2) fontSize = 44;
        else if (textLen <= 4) fontSize = 36;
        else if (textLen <= 7) fontSize = 28;
        else if (textLen <= 12) fontSize = 22;
        else fontSize = 16;

        ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
        const textWidth = ctx.measureText(text).width;

        const maxWidth = 200;
        canvas.width = Math.min(textWidth + 30, maxWidth);
        canvas.height = fontSize + 30;

        ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });

        const sprite = new THREE.Sprite(material);
        const scaleX = Math.min(canvas.width / 100, 2);
        const scaleY = Math.min(canvas.height / 100, 0.8);
        sprite.scale.set(scaleX, scaleY, 1);

        return sprite;
    },

    addOrbitRings: function () {
        for (let i = 1; i <= 4; i++) {
            const geometry = new THREE.RingGeometry(i * 1.5 - 0.02, i * 1.5, 64);
            const material = new THREE.MeshBasicMaterial({
                color: 0xa855f7,
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2;
            this.scene.add(ring);
        }
    },

    addStars: function () {
        const geometry = new THREE.BufferGeometry();
        const count = 800;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.08,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    },

    update: function (time, words) {
        if (!this.initialized || !this.renderer) return;

        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const now = Date.now() * 0.001;

        let targetIdx = activeIdx !== -1 ? activeIdx : (words.findIndex(w => w.start > time) - 1);
        if (targetIdx < 0) targetIdx = 0;

        // Update each word's orbit
        this.wordMeshes.forEach((sprite, i) => {
            const isActive = i === activeIdx;
            const distanceFromActive = Math.abs(i - targetIdx);

            if (isActive) {
                // Active word goes to center
                sprite.userData.orbitRadius = 0;
                sprite.position.x += (0 - sprite.position.x) * 0.1;
                sprite.position.y += (0 - sprite.position.y) * 0.1;
                sprite.position.z += (0 - sprite.position.z) * 0.1;

                // Pulse scale
                const pulse = 2 + Math.sin(now * 8) * 0.2;
                const baseWidth = Math.min(sprite.material.map.image.width / 100, 2);
                const baseHeight = Math.min(sprite.material.map.image.height / 100, 0.8);
                sprite.scale.x += (pulse * baseWidth - sprite.scale.x) * 0.15;
                sprite.scale.y += (pulse * baseHeight - sprite.scale.y) * 0.15;
                sprite.material.opacity += (1 - sprite.material.opacity) * 0.1;
            } else {
                // Orbit around center
                const orbitNum = Math.min(distanceFromActive, 4);
                const targetRadius = orbitNum * 1.5;
                sprite.userData.orbitRadius += (targetRadius - sprite.userData.orbitRadius) * 0.05;

                // Assign angle based on position
                sprite.userData.orbitAngle += (0.5 + orbitNum * 0.2) * 0.02;

                const angle = sprite.userData.orbitAngle + i * 0.5;
                const targetX = Math.cos(angle) * sprite.userData.orbitRadius;
                const targetZ = Math.sin(angle) * sprite.userData.orbitRadius;
                const targetY = Math.sin(angle * 0.5) * 0.5;

                sprite.position.x += (targetX - sprite.position.x) * 0.08;
                sprite.position.y += (targetY - sprite.position.y) * 0.08;
                sprite.position.z += (targetZ - sprite.position.z) * 0.08;

                // Scale based on distance
                const scale = Math.max(0.5, 1 - distanceFromActive * 0.1);
                const baseWidth = Math.min(sprite.material.map.image.width / 100, 2);
                const baseHeight = Math.min(sprite.material.map.image.height / 100, 0.8);
                sprite.scale.x += (scale * baseWidth - sprite.scale.x) * 0.1;
                sprite.scale.y += (scale * baseHeight - sprite.scale.y) * 0.1;

                // Opacity based on orbit
                const targetOpacity = distanceFromActive > 5 ? 0.15 : Math.max(0.3, 1 - distanceFromActive * 0.12);
                sprite.material.opacity += (targetOpacity - sprite.material.opacity) * 0.1;
            }
        });

        // Camera movement
        this.camera.position.x = Math.sin(now * 0.3) * 2;
        this.camera.position.y = 3 + Math.cos(now * 0.2) * 1;
        this.camera.lookAt(0, 0, 0);

        // Rotate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    },

    onResize: function () {
        if (!this.renderer) return;
        const wrapper = document.getElementById('phone-wrapper');
        const width = wrapper.offsetWidth;
        const height = wrapper.offsetHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    destroy: function () {
        const canvas = document.getElementById('three-canvas');
        if (canvas) canvas.style.display = 'none';
        if (this.renderer) this.renderer.dispose();
        this.initialized = false;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.orbit3d = Orbit3DEngine;
}
