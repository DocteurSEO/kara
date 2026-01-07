// KARAGEN - Global State
// Shared state object for all modules

const state = {
    words: [],
    isPlaying: false,
    isRecording: false,
    mode: 'scroll',
    domElements: [],
    audioCtx: null,
    analyser: null,
    dataArray: null,
    recorder: null,
    recordedChunks: [],
    syncOffset: 0,
    primaryColor: '#a855f7',
    waveType: 'wave',
    waveColor: '#a855f7',
    lastRenderedIdx: -1,
    lastCheckActive: -1,
    waveLastActive: -1,
    classicLastActive: -1,
    // Three.js related
    threeScene: null,
    threeCamera: null,
    threeRenderer: null
};

// Export for ES modules (optional, works with script tags too)
if (typeof window !== 'undefined') {
    window.KaraState = state;
}
