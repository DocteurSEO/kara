// KARAGEN - 3D Tunnel Engine
// Three.js powered 3D word tunnel with camera navigation

const Tunnel3DEngine = {
    scene: null,
    camera: null,
    renderer: null,
    wordMeshes: [],
    initialized: false,

    init: function (container, words) {
        const state = window.KaraState;

        // Hide other content, show 3D canvas
        container.innerHTML = '';
        container.style.display = 'none';

        // Get or create canvas
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

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Clear previous meshes
        this.wordMeshes = [];

        // Create word sprites
        words.forEach((w, i) => {
            const sprite = this.createTextSprite(w.text, state.primaryColor);
            const posX = (Math.random() - 0.5) * 3;  // Random X offset (reduced for phone)
            const posY = (Math.random() - 0.5) * 2;  // Random Y offset (reduced for phone)
            const posZ = -i * 8;                     // Depth along Z

            sprite.position.set(posX, posY, posZ);
            sprite.userData = {
                index: i,
                originalX: posX,
                originalY: posY,
                originalZ: posZ
            };
            this.scene.add(sprite);
            this.wordMeshes.push(sprite);
        });

        // Add ambient particles
        this.addParticles();

        // Store refs
        state.threeScene = this.scene;
        state.threeCamera = this.camera;
        state.threeRenderer = this.renderer;

        this.initialized = true;

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    },

    createTextSprite: function (text, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Very aggressive font size based on text length for vertical phone format
        const textLen = text.length;
        let fontSize;
        if (textLen <= 2) {
            fontSize = 48;
        } else if (textLen <= 4) {
            fontSize = 40;
        } else if (textLen <= 7) {
            fontSize = 32;
        } else if (textLen <= 12) {
            fontSize = 24;
        } else {
            fontSize = 18;
        }

        ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
        const textWidth = ctx.measureText(text).width;

        // Very limited max width for vertical phone
        const maxWidth = 250;
        const actualWidth = Math.min(textWidth + 30, maxWidth);

        canvas.width = actualWidth;
        canvas.height = fontSize + 30;

        // Redraw after resize
        ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });

        const sprite = new THREE.Sprite(material);

        // Very limited scale for vertical phone - max 2.5 width units
        const scaleX = Math.min(canvas.width / 100, 2.5);
        const scaleY = Math.min(canvas.height / 100, 1);
        sprite.scale.set(scaleX, scaleY, 1);

        return sprite;
    },

    addParticles: function () {
        const geometry = new THREE.BufferGeometry();
        const count = 800;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = -Math.random() * 300;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.08,
            transparent: true,
            opacity: 0.7
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Store initial positions for animation
        this.particlePositions = positions.slice();
    },

    update: function (time, words) {
        if (!this.initialized || !this.renderer) return;

        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const now = Date.now() * 0.001; // Time in seconds for effects

        // Find target
        let targetIdx = activeIdx !== -1 ? activeIdx : (words.findIndex(w => w.start > time) - 1);
        if (targetIdx < 0) targetIdx = 0;

        // Update word appearances with cool effects
        this.wordMeshes.forEach((sprite, i) => {
            const distance = Math.abs(i - targetIdx);
            const isActive = i === activeIdx;

            // Base scale with pulsing effect on active word
            let targetScale = 1;
            if (isActive) {
                const pulse = 1 + Math.sin(now * 8) * 0.1; // Fast pulsing
                targetScale = 1.5 * pulse;
            }

            const baseWidth = Math.min(sprite.material.map.image.width / 100, 2.5);
            const baseHeight = Math.min(sprite.material.map.image.height / 100, 1);
            sprite.scale.x += (targetScale * baseWidth - sprite.scale.x) * 0.15;
            sprite.scale.y += (targetScale * baseHeight - sprite.scale.y) * 0.15;

            // Opacity based on distance
            const targetOpacity = distance > 8 ? 0.1 : Math.max(0.2, 1 - distance * 0.1);
            sprite.material.opacity += (targetOpacity - sprite.material.opacity) * 0.1;

            // Gentle floating motion for inactive words
            if (!isActive && distance < 5) {
                const floatY = Math.sin(now * 2 + i * 0.5) * 0.15;
                const floatX = Math.cos(now * 1.5 + i * 0.3) * 0.1;
                sprite.position.x += (sprite.userData.originalX + floatX - sprite.position.x) * 0.05;
                sprite.position.y += (sprite.userData.originalY + floatY - sprite.position.y) * 0.05;
            }

            // Active word: center position with subtle movement
            if (isActive) {
                sprite.position.x += (0 - sprite.position.x) * 0.1;
                sprite.position.y += (0 - sprite.position.y) * 0.1;
            }
        });

        // Camera effects
        const targetMesh = this.wordMeshes[targetIdx];
        if (targetMesh) {
            const targetZ = targetMesh.userData.originalZ + 6;

            // Camera sway effect
            const swayX = Math.sin(now * 0.5) * 0.3;
            const swayY = Math.cos(now * 0.7) * 0.2;

            gsap.to(this.camera.position, {
                z: targetZ,
                x: swayX,
                y: swayY,
                duration: 0.8,
                ease: 'power2.out'
            });
        }

        // Animate particles - move them forward for speed effect
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 2] += 0.5; // Move particles towards camera

                // Reset particles that pass the camera
                if (positions[i + 2] > this.camera.position.z + 5) {
                    positions[i + 2] = this.camera.position.z - 100;
                    positions[i] = (Math.random() - 0.5) * 40;
                    positions[i + 1] = (Math.random() - 0.5) * 40;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Render
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
        // Cleanup when switching engines
        const canvas = document.getElementById('three-canvas');
        if (canvas) canvas.style.display = 'none';

        if (this.renderer) {
            this.renderer.dispose();
        }
        this.initialized = false;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.tunnel3d = Tunnel3DEngine;
}
