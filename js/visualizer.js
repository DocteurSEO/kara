// KARAGEN - Audio Visualizer
// Handles audio context and visual rendering (wave, bars, circle)

let vizCtx = null;

function initAudio(audioElement) {
    const state = window.KaraState;
    if (state.audioCtx) return;

    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.analyser = state.audioCtx.createAnalyser();
    const src = state.audioCtx.createMediaElementSource(audioElement);
    src.connect(state.analyser);
    state.analyser.connect(state.audioCtx.destination);
    state.analyser.fftSize = 256;
    state.dataArray = new Uint8Array(state.analyser.frequencyBinCount);
}

function initVisuals() {
    const pc = document.getElementById('particle-canvas');
    const pCtx = pc.getContext('2d');
    const wc = document.getElementById('wave-canvas');
    const wCtx = wc.getContext('2d');

    const resize = () => {
        pc.width = window.innerWidth;
        pc.height = window.innerHeight;
        wc.width = wc.offsetWidth;
        wc.height = wc.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const particles = Array(40).fill().map(() => ({
        x: Math.random() * pc.width,
        y: Math.random() * pc.height,
        size: Math.random() * 3,
        speed: Math.random() * 0.5 + 0.2
    }));

    vizCtx = { pCtx, wCtx, pc, wc, particles };
    return vizCtx;
}

function renderVisuals() {
    const state = window.KaraState;
    if (!vizCtx) return;

    // Get audio data
    if (state.analyser) {
        state.analyser.getByteFrequencyData(state.dataArray);
    }
    const bass = state.dataArray ? state.dataArray[2] : 0;

    // Particles
    vizCtx.pCtx.clearRect(0, 0, vizCtx.pc.width, vizCtx.pc.height);
    vizCtx.particles.forEach(p => {
        p.y -= p.speed * (1 + bass / 100);
        if (p.y < 0) p.y = vizCtx.pc.height;
        vizCtx.pCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        vizCtx.pCtx.beginPath();
        vizCtx.pCtx.arc(p.x, p.y, p.size * (1 + bass / 200), 0, Math.PI * 2);
        vizCtx.pCtx.fill();
    });

    // Audio visualization
    const w = vizCtx.wc.width;
    const h = vizCtx.wc.height;
    vizCtx.wCtx.clearRect(0, 0, w, h);

    if (state.dataArray && state.waveType !== 'none') {
        const waveColor = state.waveColor;

        if (state.waveType === 'wave') {
            // WAVE MODE
            vizCtx.wCtx.beginPath();
            const sliceWidth = w / state.dataArray.length;
            let x = 0;
            for (let i = 0; i < state.dataArray.length; i++) {
                const v = state.dataArray[i] / 255.0;
                const y = h - (v * h);
                if (i === 0) vizCtx.wCtx.moveTo(x, y);
                else vizCtx.wCtx.lineTo(x, y);
                x += sliceWidth;
            }
            vizCtx.wCtx.strokeStyle = waveColor + '80';
            vizCtx.wCtx.lineWidth = 2;
            vizCtx.wCtx.stroke();

        } else if (state.waveType === 'bars') {
            // BARS MODE
            const barCount = 32;
            const barWidth = w / barCount - 2;
            for (let i = 0; i < barCount; i++) {
                const dataIndex = Math.floor(i * state.dataArray.length / barCount);
                const v = state.dataArray[dataIndex] / 255.0;
                const barHeight = v * h * 0.9;
                const bx = i * (barWidth + 2);
                const by = h - barHeight;
                vizCtx.wCtx.fillStyle = waveColor + 'cc';
                vizCtx.wCtx.fillRect(bx, by, barWidth, barHeight);
            }

        } else if (state.waveType === 'circle') {
            // CIRCLE MODE
            const centerX = w / 2;
            const centerY = h / 2;
            const radius = Math.min(w, h) * 0.3;
            const bars = 64;

            for (let i = 0; i < bars; i++) {
                const dataIndex = Math.floor(i * state.dataArray.length / bars);
                const v = state.dataArray[dataIndex] / 255.0;
                const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
                const barLength = v * radius * 0.8;

                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barLength);
                const y2 = centerY + Math.sin(angle) * (radius + barLength);

                vizCtx.wCtx.beginPath();
                vizCtx.wCtx.moveTo(x1, y1);
                vizCtx.wCtx.lineTo(x2, y2);
                vizCtx.wCtx.strokeStyle = waveColor + 'cc';
                vizCtx.wCtx.lineWidth = 3;
                vizCtx.wCtx.stroke();
            }
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.KaraVisualizer = { initAudio, initVisuals, renderVisuals };
}
