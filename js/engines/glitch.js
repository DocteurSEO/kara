// KARAGEN - Glitch Engine
// VHS/Glitch effect on active word

const GlitchEngine = {
    init: function (container) {
        container.innerHTML = '<div id="glitch-wrapper" class="glitch-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('glitch-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];
            wrapper.innerHTML = '';

            // Create glitch container
            const glitchBox = document.createElement('div');
            glitchBox.className = 'glitch-box';

            // Main text
            const el = document.createElement('div');
            el.className = 'glitch-word';
            el.innerText = w.text;
            el.dataset.text = w.text;

            const len = w.text.length;
            const fontSize = len < 5 ? '4rem' : len < 10 ? '3rem' : '2rem';
            el.style.fontSize = fontSize;

            // Clone layers for glitch effect
            const clone1 = el.cloneNode(true);
            clone1.className = 'glitch-word glitch-clone-1';
            clone1.style.fontSize = fontSize;

            const clone2 = el.cloneNode(true);
            clone2.className = 'glitch-word glitch-clone-2';
            clone2.style.fontSize = fontSize;

            glitchBox.appendChild(clone2);
            glitchBox.appendChild(clone1);
            glitchBox.appendChild(el);
            wrapper.appendChild(glitchBox);

            // Initial glitch animation
            gsap.fromTo(el,
                { opacity: 0, scale: 1.2 },
                { opacity: 1, scale: 1, duration: 0.2 }
            );

            // Random glitch effect
            this.startGlitch(glitchBox);
        }
    },

    startGlitch: function (box) {
        const clones = box.querySelectorAll('.glitch-clone-1, .glitch-clone-2');

        const glitchInterval = setInterval(() => {
            if (!document.body.contains(box)) {
                clearInterval(glitchInterval);
                return;
            }

            clones.forEach((clone, i) => {
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = (Math.random() - 0.5) * 5;
                clone.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                clone.style.opacity = Math.random() * 0.8;
            });
        }, 50);

        // Stop after a bit
        setTimeout(() => clearInterval(glitchInterval), 500);
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.glitch = GlitchEngine;
}
