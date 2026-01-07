// KARAGEN - Explosion Engine
// Word explodes from center with particles

const ExplosionEngine = {
    init: function (container) {
        container.innerHTML = '<div id="explosion-wrapper" class="explosion-container"></div>';
    },

    update: function (time, words) {
        const state = window.KaraState;
        const activeIdx = words.findIndex(w => time >= w.start && time <= w.end);
        const wrapper = document.getElementById('explosion-wrapper');

        if (activeIdx !== -1 && state.lastRenderedIdx !== activeIdx) {
            state.lastRenderedIdx = activeIdx;
            const w = words[activeIdx];
            wrapper.innerHTML = '';

            // Create word element
            const el = document.createElement('div');
            el.className = 'explosion-word';
            el.innerText = w.text;

            // Size based on length
            const len = w.text.length;
            el.style.fontSize = len < 5 ? '4rem' : len < 10 ? '3rem' : '2rem';

            wrapper.appendChild(el);

            // Create explosion particles
            for (let i = 0; i < 12; i++) {
                const particle = document.createElement('div');
                particle.className = 'explosion-particle';
                particle.style.setProperty('--angle', (i * 30) + 'deg');
                wrapper.appendChild(particle);

                // Animate particle outward
                gsap.fromTo(particle,
                    { scale: 0, x: 0, y: 0, opacity: 1 },
                    {
                        scale: 1,
                        x: Math.cos(i * 30 * Math.PI / 180) * 100,
                        y: Math.sin(i * 30 * Math.PI / 180) * 100,
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power2.out'
                    }
                );
            }

            // Animate word - explode in
            gsap.fromTo(el,
                { scale: 0, opacity: 0, rotation: -10 },
                { scale: 1, opacity: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)' }
            );
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KaraEngines = window.KaraEngines || {};
    window.KaraEngines.explosion = ExplosionEngine;
}
