/**
 * AuraTemp Weather Generative Ambient Synthesizer
 * Architecture: Web Audio API & Canvas Generative Physics
 */

// --- Official 9-Tier Japanese Meteorological Discomfort Index (DI) Definitions ---
const DI_TIERS = [
  { id: 0, maxDI: 50.0, name: '寒くてたまらない', color: '#bae6fd' },
  { id: 1, maxDI: 55.0, name: '寒い', color: '#c7d2fe' },
  { id: 2, maxDI: 60.0, name: '肌寒い', color: '#ddd6fe' },
  { id: 3, maxDI: 65.0, name: '何も感じない', color: '#bbf7d0' },
  { id: 4, maxDI: 70.0, name: '快い (快適)', color: '#86efac' },
  { id: 5, maxDI: 75.0, name: '不快感を持つ人が出始める', color: '#fef08a' },
  { id: 6, maxDI: 80.0, name: '半数以上が不快', color: '#fed7aa' },
  { id: 7, maxDI: 85.0, name: '全員が不快', color: '#fbcfe8' },
  { id: 8, maxDI: 999.0, name: '暑くてたまらない', color: '#fda4af' }
];

// Initial Default Harmonic Matrix (9 Tiers x 3 Variations x 4 Chords)
const DEFAULT_HARMONIC_MATRIX = {
  0: [
    [{ name: 'C#m9', root: 49, notes: [49, 56, 60, 63, 68] }, { name: 'Amaj7(#11)', root: 45, notes: [45, 52, 56, 61, 67] }, { name: 'F#m9', root: 42, notes: [42, 49, 53, 57, 64] }, { name: 'G#7sus4', root: 44, notes: [44, 51, 56, 61, 66] }],
    [{ name: 'Ebm7', root: 51, notes: [51, 58, 61, 65, 70] }, { name: 'Bmaj7', root: 47, notes: [47, 54, 58, 63, 66] }, { name: 'Abm9', root: 44, notes: [44, 51, 54, 59, 66] }, { name: 'Bbsus4', root: 46, notes: [46, 53, 58, 63, 68] }],
    [{ name: 'Am9', root: 45, notes: [45, 52, 55, 60, 64] }, { name: 'Fmaj7', root: 41, notes: [41, 48, 52, 57, 64] }, { name: 'Dm9', root: 50, notes: [50, 57, 60, 65, 69] }, { name: 'Em7', root: 40, notes: [40, 47, 52, 55, 62] }]
  ],
  1: [
    [{ name: 'Bmaj9', root: 47, notes: [47, 54, 58, 61, 66] }, { name: 'G#m7', root: 44, notes: [44, 51, 56, 59, 66] }, { name: 'Emaj7', root: 40, notes: [40, 47, 51, 56, 63] }, { name: 'F#sus4', root: 42, notes: [42, 49, 54, 59, 66] }],
    [{ name: 'Dmaj7', root: 50, notes: [50, 57, 61, 64, 69] }, { name: 'Bm7', root: 47, notes: [47, 54, 57, 62, 66] }, { name: 'Gmaj7', root: 43, notes: [43, 50, 54, 59, 66] }, { name: 'Asus4', root: 45, notes: [45, 52, 57, 62, 69] }],
    [{ name: 'F#m7(9)', root: 42, notes: [42, 49, 53, 56, 63] }, { name: 'Dmaj7', root: 50, notes: [50, 57, 61, 64, 69] }, { name: 'Bm9', root: 47, notes: [47, 54, 57, 61, 66] }, { name: 'C#m7', root: 49, notes: [49, 56, 61, 64, 68] }]
  ],
  2: [
    [{ name: 'Gmaj9', root: 43, notes: [43, 50, 54, 57, 62] }, { name: 'Em7(9)', root: 40, notes: [40, 47, 50, 54, 62] }, { name: 'Cmaj7', root: 48, notes: [48, 55, 59, 64, 67] }, { name: 'Dsus4', root: 50, notes: [50, 57, 62, 67, 72] }],
    [{ name: 'Amaj7', root: 45, notes: [45, 52, 56, 61, 64] }, { name: 'F#m7', root: 42, notes: [42, 49, 52, 57, 64] }, { name: 'Dmaj9', root: 50, notes: [50, 57, 61, 64, 69] }, { name: 'Esus4', root: 52, notes: [52, 59, 64, 69, 74] }],
    [{ name: 'Cmaj7(9)', root: 48, notes: [48, 55, 59, 62, 67] }, { name: 'Am7', root: 45, notes: [45, 52, 55, 60, 67] }, { name: 'Fmaj7', root: 41, notes: [41, 48, 52, 57, 64] }, { name: 'G7sus4', root: 43, notes: [43, 50, 55, 60, 67] }]
  ],
  3: [
    [{ name: 'Fmaj7(9)', root: 41, notes: [41, 48, 52, 55, 60] }, { name: 'Cmaj7', root: 48, notes: [48, 55, 59, 64, 67] }, { name: 'Dm7(9)', root: 50, notes: [50, 57, 60, 64, 69] }, { name: 'Bbmaj7', root: 46, notes: [46, 53, 57, 62, 65] }],
    [{ name: 'Ebmaj7', root: 51, notes: [51, 58, 62, 65, 70] }, { name: 'Bbmaj7', root: 46, notes: [46, 53, 57, 62, 65] }, { name: 'Cm7', root: 48, notes: [48, 55, 58, 63, 70] }, { name: 'Abmaj7', root: 44, notes: [44, 51, 55, 60, 67] }],
    [{ name: 'Gmaj7', root: 43, notes: [43, 50, 54, 59, 62] }, { name: 'Dmaj7', root: 50, notes: [50, 57, 61, 66, 69] }, { name: 'Em7', root: 40, notes: [40, 47, 52, 55, 62] }, { name: 'Cmaj9', root: 48, notes: [48, 55, 59, 62, 67] }]
  ],
  4: [
    [{ name: 'Cmaj7(#11)', root: 48, notes: [48, 55, 59, 62, 66] }, { name: 'D/C', root: 48, notes: [48, 54, 57, 62, 66] }, { name: 'Bm7', root: 47, notes: [47, 54, 57, 62, 66] }, { name: 'Em9', root: 40, notes: [40, 47, 50, 54, 62] }],
    [{ name: 'Fmaj7(#11)', root: 41, notes: [41, 48, 52, 55, 59] }, { name: 'G/F', root: 41, notes: [41, 55, 59, 62, 67] }, { name: 'Em7', root: 40, notes: [40, 47, 52, 55, 64] }, { name: 'Am9', root: 45, notes: [45, 52, 55, 60, 67] }],
    [{ name: 'Abmaj7(#11)', root: 44, notes: [44, 51, 55, 58, 62] }, { name: 'Bb/Ab', root: 44, notes: [44, 50, 53, 58, 65] }, { name: 'Gm7', root: 43, notes: [43, 50, 53, 58, 65] }, { name: 'Cm9', root: 48, notes: [48, 55, 58, 62, 70] }]
  ],
  5: [
    [{ name: 'Dm9', root: 50, notes: [50, 57, 60, 64, 69] }, { name: 'G13', root: 43, notes: [43, 50, 53, 59, 64] }, { name: 'Cmaj9', root: 48, notes: [48, 55, 59, 62, 67] }, { name: 'Fmaj7', root: 41, notes: [41, 48, 52, 57, 64] }],
    [{ name: 'Gm9', root: 43, notes: [43, 50, 53, 57, 62] }, { name: 'C13', root: 48, notes: [48, 55, 58, 64, 69] }, { name: 'Fmaj9', root: 41, notes: [41, 48, 52, 55, 60] }, { name: 'Bbmaj7', root: 46, notes: [46, 53, 57, 62, 69] }],
    [{ name: 'Cm9', root: 48, notes: [48, 55, 58, 62, 67] }, { name: 'F13', root: 41, notes: [41, 48, 51, 57, 62] }, { name: 'Bbmaj9', root: 46, notes: [46, 53, 57, 60, 65] }, { name: 'Ebmaj7', root: 51, notes: [51, 58, 62, 67, 70] }]
  ],
  6: [
    [{ name: 'Ebmaj7(9)', root: 51, notes: [51, 58, 62, 65, 70] }, { name: 'Abmaj7', root: 44, notes: [44, 51, 55, 60, 63] }, { name: 'Fm9', root: 41, notes: [41, 48, 51, 56, 63] }, { name: 'Bbsus4(9)', root: 46, notes: [46, 53, 58, 60, 65] }],
    [{ name: 'Dbmaj9', root: 49, notes: [49, 56, 60, 63, 68] }, { name: 'Gbmaj7', root: 42, notes: [42, 49, 53, 58, 61] }, { name: 'Ebm9', root: 51, notes: [51, 58, 61, 66, 68] }, { name: 'Absus4', root: 44, notes: [44, 51, 56, 61, 66] }],
    [{ name: 'Fmaj9', root: 41, notes: [41, 48, 52, 55, 60] }, { name: 'Bbmaj7', root: 46, notes: [46, 53, 57, 62, 67] }, { name: 'Gm9', root: 43, notes: [43, 50, 53, 57, 62] }, { name: 'Csus4(9)', root: 48, notes: [48, 55, 60, 62, 67] }]
  ],
  7: [
    [{ name: 'Gbmaj7(#11)', root: 42, notes: [42, 49, 53, 56, 60] }, { name: 'F7(b9)', root: 41, notes: [41, 48, 52, 57, 62] }, { name: 'Bbm9', root: 46, notes: [46, 53, 56, 60, 65] }, { name: 'Eb13', root: 51, notes: [51, 58, 61, 67, 70] }],
    [{ name: 'Emaj7(#11)', root: 40, notes: [40, 47, 51, 54, 58] }, { name: 'Eb7(b9)', root: 51, notes: [51, 58, 62, 67, 71] }, { name: 'Abm9', root: 44, notes: [44, 51, 54, 58, 63] }, { name: 'Db13', root: 49, notes: [49, 56, 59, 65, 68] }],
    [{ name: 'Abmaj7(#11)', root: 44, notes: [44, 51, 55, 58, 62] }, { name: 'G7(b9)', root: 43, notes: [43, 50, 54, 59, 63] }, { name: 'Cm9', root: 48, notes: [48, 55, 58, 62, 67] }, { name: 'F13', root: 41, notes: [41, 48, 51, 57, 60] }]
  ],
  8: [
    [{ name: 'Dmaj9(#11)', root: 50, notes: [50, 57, 61, 64, 68] }, { name: 'C#7alt', root: 49, notes: [49, 55, 59, 63, 67] }, { name: 'F#m11', root: 42, notes: [42, 49, 52, 57, 62] }, { name: 'B13(b9)', root: 47, notes: [47, 54, 57, 63, 67] }],
    [{ name: 'Gmaj9(#11)', root: 43, notes: [43, 50, 54, 57, 61] }, { name: 'F#7alt', root: 42, notes: [42, 48, 52, 56, 60] }, { name: 'Bm11', root: 47, notes: [47, 54, 57, 62, 67] }, { name: 'E13(b9)', root: 40, notes: [40, 47, 50, 56, 60] }],
    [{ name: 'Amaj9(#11)', root: 45, notes: [45, 52, 56, 59, 63] }, { name: 'G#7alt', root: 44, notes: [44, 50, 54, 58, 62] }, { name: 'C#m11', root: 49, notes: [49, 56, 59, 64, 69] }, { name: 'F#13(b9)', root: 42, notes: [42, 49, 52, 58, 62] }]
  ]
};

// Deep copy harmonic matrix to allow dynamic custom runtime edits
let HARMONIC_MATRIX = JSON.parse(JSON.stringify(DEFAULT_HARMONIC_MATRIX));

// State Management
const state = {
  isPlaying: false,
  temp: 24.0,
  hum: 50.0,
  di: 70.8,
  tierIndex: 4,
  bpm: 72,
  variationIndex: 0,
  variationTimerSec: 0,
  variationCycleSec: 300, // 5 min per variation
  chordIndex: 0,
  measureCount: 0,
  autoGeoSync: false,
  autoSyncInterval: null,
  hudIdleTimeout: null,
  masterLPF: 14000,
  masterGain: 0.85
};

// 8 Channels Definition
const CHANNELS = [
  { id: 0, name: 'Kick', gain: 0.75, mute: false, solo: false },
  { id: 1, name: 'Clap', gain: 0.65, mute: false, solo: false },
  { id: 2, name: 'Shaker', gain: 0.60, mute: false, solo: false },
  { id: 3, name: 'Shimmer', gain: 0.55, mute: false, solo: false },
  { id: 4, name: 'Pad', gain: 0.80, mute: false, solo: false },
  { id: 5, name: 'Lead', gain: 0.70, mute: false, solo: false },
  { id: 6, name: 'Bass', gain: 0.75, mute: false, solo: false },
  { id: 7, name: 'Bell', gain: 0.65, mute: false, solo: false }
];

// --- Audio Engine ---
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGainNode = null;
    this.masterFilterNode = null;
    this.channelGainNodes = [];
    this.channelAnalysers = [];
    this.padVoices = [];
    this.nextStepTime = 0;
    this.currentStep = 0;
    this.timerID = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.setValueAtTime(state.masterGain, this.ctx.currentTime);

    this.masterFilterNode = this.ctx.createBiquadFilter();
    this.masterFilterNode.type = 'lowpass';
    this.masterFilterNode.frequency.setValueAtTime(state.masterLPF, this.ctx.currentTime);

    this.masterFilterNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.ctx.destination);

    CHANNELS.forEach((ch) => {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(ch.gain, this.ctx.currentTime);
      g.connect(this.masterFilterNode);
      this.channelGainNodes.push(g);

      const an = this.ctx.createAnalyser();
      an.fftSize = 64;
      g.connect(an);
      this.channelAnalysers.push(an);
    });

    this.updateMixerGains();
  }

  midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  updateMixerGains() {
    if (!this.ctx) return;
    const anySolo = CHANNELS.some(c => c.solo);
    CHANNELS.forEach((ch, i) => {
      let eff = ch.gain;
      if (ch.mute) eff = 0;
      if (anySolo && !ch.solo) eff = 0;
      this.channelGainNodes[i].gain.setTargetAtTime(eff, this.ctx.currentTime, 0.04);
    });
  }

  start() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.currentStep = 0;
    this.scheduler();
    this.playPadSwell();
  }

  stop() {
    if (this.timerID) clearTimeout(this.timerID);
    this.padVoices.forEach(v => {
      try {
        v.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        setTimeout(() => v.osc.stop(), 300);
      } catch(e){}
    });
    this.padVoices = [];
  }

  scheduler() {
    if (!state.isPlaying) return;
    const stepInterval = (60 / state.bpm) / 4;
    while (this.nextStepTime < this.ctx.currentTime + 0.15) {
      this.triggerStep(this.currentStep, this.nextStepTime);
      this.currentStep = (this.currentStep + 1) % 16;
      this.nextStepTime += stepInterval;

      if (this.currentStep === 0) {
        state.measureCount++;
        // 8 bars per chord (~15 seconds)
        if (state.measureCount % 8 === 0) {
          state.chordIndex = (state.chordIndex + 1) % 4;
          this.playPadSwell();
          this.triggerShimmer(this.nextStepTime);
          const currentChord = this.getCurrentChord();
          document.getElementById('console-chord').innerText = currentChord.name;
        }
      }
    }
    this.timerID = setTimeout(() => this.scheduler(), 30);
  }

  getCurrentChord() {
    const tier = HARMONIC_MATRIX[state.tierIndex] || HARMONIC_MATRIX[4];
    const variations = tier[state.variationIndex] || tier[0];
    return variations[state.chordIndex] || variations[0];
  }

  triggerStep(step, time) {
    const chord = this.getCurrentChord();
    const rootFreq = this.midiToFreq(chord.root);

    if (step % 4 === 0) {
      triggerCanvasRipple();
    }

    // CH 0: Kick
    if (step === 0 || (state.di > 78 && step === 10)) {
      this.playKick(time);
    }
    // CH 1: Clap
    if (step === 4 || step === 12) {
      this.playClap(time);
    }
    // CH 2: Shaker
    if (step % 2 === 0 || state.di > 75) {
      this.playShaker(time, step % 4 === 2 ? 0.8 : 0.4);
    }
    // CH 6: Sub Bass
    if (step === 0 || step === 8) {
      this.playBass(time, rootFreq * 0.5, step === 0 ? 0.6 : 0.35);
    }
    // CH 5: Lead Synth
    if (Math.random() > 0.45 && (step % 2 === 0)) {
      const notes = chord.notes;
      const noteMidi = notes[Math.floor(Math.random() * notes.length)] + (state.di < 55 ? 12 : 0);
      this.playLead(time, this.midiToFreq(noteMidi));
    }
    // CH 7: Bell
    if (step % 4 === 2 && Math.random() > 0.3) {
      const notes = chord.notes;
      const noteMidi = notes[Math.floor(Math.random() * notes.length)] + 24;
      this.playBell(time, this.midiToFreq(noteMidi));
    }
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.channelGainNodes[0]);

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  playClap(time) {
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, time);
    filter.Q.setValueAtTime(1.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.channelGainNodes[1]);

    noise.start(time);
  }

  playShaker(time, vol = 0.5) {
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.channelGainNodes[2]);

    noise.start(time);
  }

  triggerShimmer(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, time);
    osc.frequency.exponentialRampToValueAtTime(2400, time + 1.2);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 3.0);

    osc.connect(gain);
    gain.connect(this.channelGainNodes[3]);

    osc.start(time);
    osc.stop(time + 3.1);
  }

  playPadSwell() {
    const chord = this.getCurrentChord();
    const now = this.ctx.currentTime;

    this.padVoices.forEach(v => {
      try {
        v.gain.gain.setTargetAtTime(0.0001, now, 1.8);
        setTimeout(() => {
          try { v.osc.stop(); } catch(e){}
        }, 3500);
      } catch(e){}
    });
    this.padVoices = [];

    chord.notes.forEach((midiNote, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(this.midiToFreq(midiNote), now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      const cutoff = 600 + (100 - state.hum) * 16;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18 / chord.notes.length, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.channelGainNodes[4]);

      osc.start(now);
      this.padVoices.push({ osc, gain });
    });
  }

  playLead(time, freq) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    if (state.di > 78) {
      osc.frequency.linearRampToValueAtTime(freq * 0.98, time + 0.25);
    }

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.25, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

    osc.connect(gain);
    gain.connect(this.channelGainNodes[5]);

    osc.start(time);
    osc.stop(time + 0.65);
  }

  playBass(time, freq, amp = 0.5) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(amp, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    osc.connect(gain);
    gain.connect(this.channelGainNodes[6]);

    osc.start(time);
    osc.stop(time + 1.3);
  }

  playBell(time, freq) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.16, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

    osc.connect(gain);
    gain.connect(this.channelGainNodes[7]);

    osc.start(time);
    osc.stop(time + 0.85);
  }

  getChannelPeaks() {
    if (!this.ctx) return new Array(8).fill(0);
    return this.channelAnalysers.map(an => {
      const buf = new Uint8Array(an.frequencyBinCount);
      an.getByteTimeDomainData(buf);
      let max = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = Math.abs(buf[i] - 128);
        if (v > max) max = v;
      }
      return Math.min(1, max / 64);
    });
  }
}

const audio = new AudioEngine();

// --- Calculations & Updates ---
function calcDI(temp, hum) {
  return 0.81 * temp + 0.01 * hum * (0.99 * temp - 14.3) + 46.3;
}

function getDITier(di) {
  for (let i = 0; i < DI_TIERS.length; i++) {
    if (di < DI_TIERS[i].maxDI) return i;
  }
  return DI_TIERS.length - 1;
}

function updateClimateMetrics() {
  state.di = calcDI(state.temp, state.hum);
  state.tierIndex = getDITier(state.di);
  const tier = DI_TIERS[state.tierIndex];

  state.bpm = Math.round(62 + (state.di - 45) * 0.7);
  state.bpm = Math.max(58, Math.min(96, state.bpm));

  // Surface minimal HUD
  document.getElementById('hud-temp-hum').innerText = `${state.temp.toFixed(1)}°C / ${Math.round(state.hum)}%`;
  document.getElementById('hud-di-val').innerText = `DI ${state.di.toFixed(1)}`;
  document.getElementById('hud-di-tier').innerText = tier.name;

  const badge = document.getElementById('hud-di-badge');
  badge.style.color = tier.color;
  badge.style.borderColor = tier.color + '55';
  badge.style.background = tier.color + '1a';

  const dot = document.getElementById('live-dot');
  dot.style.background = tier.color;
  dot.style.boxShadow = `0 0 10px ${tier.color}`;

  // Console Telemetry labels
  document.getElementById('label-val-temp').innerText = `${state.temp.toFixed(1)} °C`;
  document.getElementById('label-val-hum').innerText = `${Math.round(state.hum)} %`;
  document.getElementById('slider-temp').value = state.temp;
  document.getElementById('slider-hum').value = state.hum;

  const currentChord = audio.getCurrentChord();
  document.getElementById('console-chord').innerText = currentChord.name;
}

// --- Open-Meteo Real-Time Geolocation Sync ---
async function syncRealWeather() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`);
      const data = await res.json();
      if (data && data.current) {
        state.temp = data.current.temperature_2m;
        state.hum = data.current.relative_humidity_2m;
        updateClimateMetrics();
      }
    } catch(e) {
      console.error("Open-Meteo error:", e);
    }
  });
}

// --- Dreamy Hybrid Visualizer Canvas ---
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let ripples = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
}
window.addEventListener('resize', resizeCanvas);

function initParticles() {
  particles = [];
  const count = Math.min(80, Math.floor(width / 20));
  const types = ['bubble', 'star', 'orb'];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      type: types[Math.floor(Math.random() * types.length)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.5 + 0.2),
      alpha: Math.random() * 0.5 + 0.25,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function triggerCanvasRipple() {
  ripples.push({
    x: width * 0.5 + (Math.random() - 0.5) * (width * 0.45),
    y: height * 0.5 + (Math.random() - 0.5) * (height * 0.35),
    r: 10,
    maxR: Math.random() * 140 + 90,
    alpha: 0.6
  });
}

function renderCanvas() {
  const tier = DI_TIERS[state.tierIndex];
  ctx.fillStyle = '#131726';
  ctx.fillRect(0, 0, width, height);

  // Soft Pastel Aura Radiance
  const grad = ctx.createRadialGradient(
    width * 0.5, height * 0.5, 60,
    width * 0.5, height * 0.5, width * 0.75
  );
  grad.addColorStop(0, tier.color + '2c');
  grad.addColorStop(0.5, tier.color + '10');
  grad.addColorStop(1, 'rgba(19, 23, 38, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Render Dreamy Motifs
  particles.forEach(p => {
    p.pulse += 0.02;
    p.y += p.vy;
    p.x += p.vx + Math.sin(p.pulse) * 0.4;

    if (p.y < -20) p.y = height + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.x < -10) p.x = width + 10;

    ctx.save();
    ctx.globalAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
    ctx.fillStyle = tier.color;
    ctx.strokeStyle = tier.color;

    if (p.type === 'bubble') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.4, p.y - p.size * 0.4, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'star') {
      ctx.beginPath();
      const s = p.size * 1.5;
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x, p.y + s);
      ctx.moveTo(p.x - s, p.y);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Candy Bouncing Ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.r += 2.0;
    r.alpha *= 0.955;
    ctx.save();
    ctx.strokeStyle = tier.color;
    ctx.globalAlpha = r.alpha;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#fed7aa';
    ctx.globalAlpha = r.alpha * 0.5;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(r.x, r.y, Math.max(1, r.r - 8), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (r.alpha < 0.02 || r.r > r.maxR) {
      ripples.splice(i, 1);
    }
  }

  requestAnimationFrame(renderCanvas);
}

// --- Progression Editor Logic ---
function initProgressionEditor() {
  const tierSelect = document.getElementById('edit-tier-select');
  const varSelect = document.getElementById('edit-var-select');
  const container = document.getElementById('chord-steps-container');

  tierSelect.innerHTML = '';
  DI_TIERS.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.innerText = `Tier ${t.id}: ${t.name}`;
    tierSelect.appendChild(opt);
  });
  tierSelect.value = state.tierIndex;

  function loadEditorFields() {
    const tId = parseInt(tierSelect.value);
    const vId = parseInt(varSelect.value);
    const chords = HARMONIC_MATRIX[tId][vId];
    container.innerHTML = '';

    chords.forEach((c, idx) => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML = `
        <div class="step-header">Step ${idx + 1} (~15s)</div>
        <input type="text" class="step-input" id="edit-name-${idx}" value="${c.name}" placeholder="Chord Name">
        <input type="text" class="step-input" id="edit-notes-${idx}" value="${c.notes.join(', ')}" placeholder="MIDI Notes (e.g. 48, 55, 59)">
      `;
      container.appendChild(card);
    });
  }

  tierSelect.addEventListener('change', loadEditorFields);
  varSelect.addEventListener('change', loadEditorFields);
  loadEditorFields();

  document.getElementById('btn-apply-chords').addEventListener('click', () => {
    const tId = parseInt(tierSelect.value);
    const vId = parseInt(varSelect.value);
    const updated = [];
    for (let i = 0; i < 4; i++) {
      const name = document.getElementById(`edit-name-${i}`).value.trim();
      const notesRaw = document.getElementById(`edit-notes-${i}`).value;
      const notes = notesRaw.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const root = notes.length > 0 ? notes[0] : 48;
      updated.push({ name: name || 'Chord', root, notes: notes.length ? notes : [48, 55, 59] });
    }
    HARMONIC_MATRIX[tId][vId] = updated;
    if (state.isPlaying && state.tierIndex === tId && state.variationIndex === vId) {
      audio.playPadSwell();
    }
    const currentChord = audio.getCurrentChord();
    document.getElementById('console-chord').innerText = currentChord.name;
    alert(`Progression for Tier ${tId} (Var ${['A','B','C'][vId]}) applied successfully!`);
  });

  document.getElementById('btn-reset-chords').addEventListener('click', () => {
    if (confirm("Reset all progressions back to initial system defaults?")) {
      HARMONIC_MATRIX = JSON.parse(JSON.stringify(DEFAULT_HARMONIC_MATRIX));
      loadEditorFields();
      if (state.isPlaying) audio.playPadSwell();
    }
  });
}

// --- UI Event Bindings ---
const playBtn = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const drawerOverlay = document.getElementById('drawer-overlay');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnFullscreen = document.getElementById('btn-fullscreen');
const hudLayer = document.getElementById('hud-layer');

function togglePlayback() {
  state.isPlaying = !state.isPlaying;
  if (state.isPlaying) {
    audio.start();
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
  } else {
    audio.stop();
    playIcon.innerHTML = '<polygon points="6 3 20 12 6 21 6 3"></polygon>';
  }
}
playBtn.addEventListener('click', togglePlayback);

function resetHudIdle() {
  hudLayer.classList.remove('idle');
  if (state.hudIdleTimeout) clearTimeout(state.hudIdleTimeout);
  state.hudIdleTimeout = setTimeout(() => {
    if (!drawerOverlay.classList.contains('active')) {
      hudLayer.classList.add('idle');
    }
  }, 4500);
}
window.addEventListener('mousemove', resetHudIdle);
window.addEventListener('click', resetHudIdle);

btnFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

btnOpenSettings.addEventListener('click', () => {
  drawerOverlay.classList.add('active');
});
btnCloseSettings.addEventListener('click', () => {
  drawerOverlay.classList.remove('active');
});
drawerOverlay.addEventListener('click', (e) => {
  if (e.target === drawerOverlay) drawerOverlay.classList.remove('active');
});

const sliderTemp = document.getElementById('slider-temp');
const sliderHum = document.getElementById('slider-hum');
sliderTemp.addEventListener('input', (e) => {
  state.temp = parseFloat(e.target.value);
  updateClimateMetrics();
});
sliderHum.addEventListener('input', (e) => {
  state.hum = parseFloat(e.target.value);
  updateClimateMetrics();
});

const syncGeoToggle = document.getElementById('sync-geo-toggle');
syncGeoToggle.addEventListener('change', (e) => {
  state.autoGeoSync = e.target.checked;
  sliderTemp.disabled = state.autoGeoSync;
  sliderHum.disabled = state.autoGeoSync;
  if (state.autoGeoSync) {
    syncRealWeather();
    state.autoSyncInterval = setInterval(syncRealWeather, 10 * 60 * 1000);
  } else {
    if (state.autoSyncInterval) clearInterval(state.autoSyncInterval);
  }
});

const vChips = document.querySelectorAll('.v-chip');
vChips.forEach(chip => {
  chip.addEventListener('click', () => {
    vChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.variationIndex = parseInt(chip.getAttribute('data-v'));
    state.variationTimerSec = 0;
    updateClimateMetrics();
    if (state.isPlaying) audio.playPadSwell();
  });
});

setInterval(() => {
  if (!state.isPlaying) return;
  state.variationTimerSec += 1;
  const progress = (state.variationTimerSec % state.variationCycleSec) / state.variationCycleSec;
  document.getElementById('lp-progress-bar').style.width = `${(progress * 100).toFixed(1)}%`;

  if (state.variationTimerSec >= state.variationCycleSec) {
    state.variationTimerSec = 0;
    state.variationIndex = (state.variationIndex + 1) % 3;
    vChips.forEach((c, idx) => {
      c.classList.toggle('active', idx === state.variationIndex);
    });
    updateClimateMetrics();
    audio.playPadSwell();
  }
}, 1000);

// Build 8-Channel Mixer UI
const mixerContainer = document.getElementById('mixer-container');
CHANNELS.forEach((ch, idx) => {
  const strip = document.createElement('div');
  strip.className = 'channel-strip';
  strip.innerHTML = `
    <span class="ch-name">${ch.name}</span>
    <div class="ch-meter-wrap">
      <div class="ch-meter-fill" id="meter-fill-${idx}"></div>
    </div>
    <input type="range" min="0" max="100" value="${Math.round(ch.gain * 100)}" class="styled-range ch-fader" data-ch="${idx}">
    <div class="ch-buttons">
      <button class="mini-btn" id="mute-btn-${idx}">M</button>
      <button class="mini-btn" id="solo-btn-${idx}">S</button>
    </div>
  `;
  mixerContainer.appendChild(strip);

  const fader = strip.querySelector('.ch-fader');
  fader.addEventListener('input', (e) => {
    ch.gain = parseInt(e.target.value) / 100;
    audio.updateMixerGains();
  });

  const muteBtn = strip.querySelector(`#mute-btn-${idx}`);
  muteBtn.addEventListener('click', () => {
    ch.mute = !ch.mute;
    muteBtn.classList.toggle('active', ch.mute);
    audio.updateMixerGains();
  });

  const soloBtn = strip.querySelector(`#solo-btn-${idx}`);
  soloBtn.addEventListener('click', () => {
    ch.solo = !ch.solo;
    soloBtn.classList.toggle('active-solo', ch.solo);
    audio.updateMixerGains();
  });
});

function updateMixerMeters() {
  if (state.isPlaying && audio.ctx) {
    const peaks = audio.getChannelPeaks();
    peaks.forEach((val, idx) => {
      const fill = document.getElementById(`meter-fill-${idx}`);
      if (fill) fill.style.height = `${Math.round(val * 100)}%`;
    });
  }
  requestAnimationFrame(updateMixerMeters);
}
updateMixerMeters();

const sliderMasterLpf = document.getElementById('slider-master-lpf');
sliderMasterLpf.addEventListener('input', (e) => {
  state.masterLPF = parseInt(e.target.value);
  document.getElementById('label-val-lpf').innerText = `${state.masterLPF} Hz`;
  if (audio.masterFilterNode) {
    audio.masterFilterNode.frequency.setTargetAtTime(state.masterLPF, audio.ctx.currentTime, 0.05);
  }
});

const sliderMasterGain = document.getElementById('slider-master-gain');
sliderMasterGain.addEventListener('input', (e) => {
  state.masterGain = parseInt(e.target.value) / 100;
  document.getElementById('label-val-gain').innerText = `${Math.round(state.masterGain * 100)} %`;
  if (audio.masterGainNode) {
    audio.masterGainNode.gain.setTargetAtTime(state.masterGain, audio.ctx.currentTime, 0.05);
  }
});

// Boot Initializer
resizeCanvas();
updateClimateMetrics();
initProgressionEditor();
renderCanvas();
resetHudIdle();