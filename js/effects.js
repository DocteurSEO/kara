// KARAGEN - Effects Module
// Global effects that apply to all animations: Bass Pulse, Color Shift, Sparkles, Fire Glow

const KaraEffects = {
    sparklesContainer: null,
    fireContainer: null,
    colorHue: 0,

    // Initialize effects containers
    init: function () {
        // Sparkles container
        if (!document.getElementById('sparkles-container')) {
            this.sparklesContainer = document.createElement('div');
            this.sparklesContainer.id = 'sparkles-container';
            this.sparklesContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:15;overflow:hidden;';
            document.getElementById('phone-wrapper').appendChild(this.sparklesContainer);
        } else {
            this.sparklesContainer = document.getElementById('sparkles-container');
        }

        // Fire glow container
        if (!document.getElementById('fire-glow')) {
            this.fireContainer = document.createElement('div');
            this.fireContainer.id = 'fire-glow';
            this.fireContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 4;
                opacity: 0;
                filter: blur(40px);
            `;
            document.getElementById('phone-wrapper').appendChild(this.fireContainer);
        } else {
            this.fireContainer = document.getElementById('fire-glow');
        }
    },

    // Bass Pulse - scale elements based on bass frequency
    bassPulse: function (dataArray, elements) {
        if (!dataArray || !elements || elements.length === 0) return;

        // Get bass level (low frequencies)
        const bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3 / 255;
        const pulseScale = 1 + bass * 0.15;

        elements.forEach(el => {
            if (el && el.style) {
                const currentTransform = el.style.transform || '';
                // Only apply if not already animated by GSAP
                if (!currentTransform.includes('matrix')) {
                    el.style.transform = `scale(${pulseScale})`;
                }
            }
        });
    },

    // Color Shift - gradually change primary color over time
    colorShift: function () {
        this.colorHue = (this.colorHue + 0.5) % 360;
        const color = `hsl(${this.colorHue}, 70%, 60%)`;
        document.documentElement.style.setProperty('--primary', color);
    },

    // Sparkles - create sparkle particles around active area
    sparkles: function (x, y) {
        if (!this.sparklesContainer) return;

        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px var(--primary), 0 0 20px var(--primary);
            left: ${x || 50}%;
            top: ${y || 50}%;
            pointer-events: none;
        `;

        this.sparklesContainer.appendChild(sparkle);

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        gsap.to(sparkle, {
            x: endX,
            y: endY,
            opacity: 0,
            scale: 0,
            duration: 0.8 + Math.random() * 0.4,
            ease: 'power2.out',
            onComplete: () => sparkle.remove()
        });
    },

    // Burst of sparkles
    sparkleBurst: function (count = 8) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.sparkles(50, 50), i * 30);
        }
    },

    // Fire Glow - animated fire aura
    fireGlow: function (active) {
        if (!this.fireContainer) return;

        if (active) {
            const colors = ['#ff6b00', '#ff9500', '#ffb800', '#ff4400'];
            const color = colors[Math.floor(Date.now() / 100) % colors.length];

            this.fireContainer.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
            this.fireContainer.style.opacity = 0.6 + Math.sin(Date.now() / 100) * 0.2;
            this.fireContainer.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(Date.now() / 80) * 0.1})`;
        } else {
            this.fireContainer.style.opacity = 0;
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEffects = KaraEffects;
}
