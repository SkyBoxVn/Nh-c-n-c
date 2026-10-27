// Procedural Web Audio API sound synthesizer and real-time Microphone analyser
// Complies with zero 404 dependencies directive

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private floatArray: Float32Array<ArrayBuffer> | null = null;

  // Music playback state
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private currentBeat = 0;
  private currentBpm = 120;
  private chords: string[] = ['Am', 'F', 'C', 'G'];
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Geyser & Laser audio nodes
  private geyserNoiseNode: AudioBufferSourceNode | null = null;
  private geyserGain: GainNode | null = null;
  private geyserFilter: BiquadFilterNode | null = null;

  // Simulated volume for fallback / testing
  private simulatedVolume = 0;
  private isMicActive = false;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public async initAudio(): Promise<boolean> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.setupGeyserNoise();
    }

    return true;
  }

  // Setup ambient water fountain sound loop procedurally
  private setupGeyserNoise() {
    if (!this.ctx || !this.sfxGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // pink/white noise for water
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.geyserFilter = this.ctx.createBiquadFilter();
    this.geyserFilter.type = 'lowpass';
    this.geyserFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

    this.geyserGain = this.ctx.createGain();
    this.geyserGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    whiteNoise.connect(this.geyserFilter);
    this.geyserFilter.connect(this.geyserGain);
    this.geyserGain.connect(this.sfxGain);

    whiteNoise.start();
    this.geyserNoiseNode = whiteNoise;
  }

  public updateGeyserSound(heightPercent: number) {
    if (!this.ctx || !this.geyserFilter || !this.geyserGain) return;
    const targetFreq = 200 + heightPercent * 1800; // more rushing water frequencies when high
    const targetGain = 0.03 + heightPercent * 0.22;
    this.geyserFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    this.geyserGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  // Play laser pulse SFX
  public triggerLaserSound() {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Microphone Setup
  public async startMicrophone(): Promise<boolean> {
    try {
      await this.initAudio();
      if (!this.ctx) return false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.micStream = stream;
      this.micSource = this.ctx.createMediaStreamSource(stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.4;

      this.micSource.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.floatArray = new Float32Array(this.analyser.fftSize);
      this.isMicActive = true;
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable:', err);
      this.isMicActive = false;
      return false;
    }
  }

  public stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.isMicActive = false;
  }

  public setSimulatedVolume(val: number) {
    this.simulatedVolume = Math.max(0, Math.min(1, val));
  }

  public getIsMicActive(): boolean {
    return this.isMicActive;
  }

  // Retrieve current audio analysis metrics: volume (0..1), decibels (dB), pitch (Hz), and calculated fountain height (m)
  public getAudioMetrics(): {
    volume: number; // 0..1
    decibels: number; // 30..105 dB
    pitchHz: number; // 80..1200 Hz
    heightMeters: number; // 5..100 meters
  } {
    let volume = 0;
    let pitch = 0;

    if (this.isMicActive && this.analyser && this.floatArray) {
      this.analyser.getFloatTimeDomainData(this.floatArray);

      // Calculate RMS
      let sumSquares = 0;
      for (let i = 0; i < this.floatArray.length; i++) {
        sumSquares += this.floatArray[i] * this.floatArray[i];
      }
      const rms = Math.sqrt(sumSquares / this.floatArray.length);

      // Dynamic sensitivity curve for vocal input:
      // Background noise floor is typically around 0.005 - 0.01
      const noiseThreshold = 0.008;
      if (rms > noiseThreshold) {
        // Boost human voice range
        volume = Math.min(1, Math.pow((rms - noiseThreshold) * 7.5, 0.75));
      }

      // Auto-correlation for pitch estimation
      pitch = this.detectPitch(this.floatArray);
    } else {
      // Use simulated volume with slight natural modulation
      const wobble = Math.sin(Date.now() * 0.008) * 0.04;
      volume = Math.max(0, Math.min(1, this.simulatedVolume + wobble));
      pitch = 220 + volume * 440;
    }

    // Convert to decibels (30 dB quiet room to 105 dB loud singing)
    const decibels = Math.round(35 + volume * 68);

    // Height calculation:
    // Base height: 8 meters idling
    // As volume increases, fountain shoots up non-linearly to 100m!
    const heightMeters = Math.min(100, Math.round((8 + Math.pow(volume, 1.15) * 92) * 10) / 10);

    this.updateGeyserSound(volume);

    return {
      volume,
      decibels,
      pitchHz: Math.round(pitch),
      heightMeters,
    };
  }

  private detectPitch(buffer: Float32Array<ArrayBuffer>): number {
    if (!this.ctx) return 0;
    const sampleRate = this.ctx.sampleRate;
    const SIZE = buffer.length;
    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buffer.slice(r1, r2);
    const c = new Array(trimmed.length).fill(0);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    if (T0 > 0) {
      const freq = sampleRate / T0;
      if (freq >= 70 && freq <= 1200) {
        return freq;
      }
    }
    return 0;
  }

  // Procedural Music Synthesizer for selected song
  public startMusic(bpm: number, chords: string[]) {
    this.stopMusic();
    if (!this.ctx || !this.musicGain) return;

    this.currentBpm = bpm;
    this.chords = chords.length > 0 ? chords : ['Am', 'F', 'C', 'G'];
    this.isMusicPlaying = true;
    this.currentBeat = 0;

    const beatIntervalMs = (60 / this.currentBpm) * 250; // sixteenth notes

    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying) return;
      this.playProceduralStep(this.currentBeat);
      this.currentBeat = (this.currentBeat + 1) % 64; // 4-bar loop
    }, beatIntervalMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public setMusicVolume(val: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  // Synthesize rhythmic instruments in real time
  private playProceduralStep(step: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const bar = Math.floor(step / 16);
    const chordIndex = bar % this.chords.length;
    const chordName = this.chords[chordIndex];

    const chordRootFrequencies: Record<string, number> = {
      C: 130.81,
      Dm: 146.83,
      Em: 164.81,
      F: 174.61,
      G: 196.0,
      Am: 220.0,
      Bb: 233.08,
    };
    const rootFreq = chordRootFrequencies[chordName] || 220.0;

    // 1. Drum Kick on beat 0, 4, 8, 12 of 16
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.16);
    }

    // 2. Snare / Clap on beat 4 and 12 of 16
    if (step % 16 === 4 || step % 16 === 12) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    // 3. Hi-hat on every odd 16th note
    if (step % 2 === 1) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'highpass' as unknown as OscillatorType;
      osc.type = 'square';
      osc.frequency.setValueAtTime(6000 + (step % 4) * 800, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.05);
    }

    // 4. Bassline
    if (step % 4 === 0 || step % 4 === 2) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      const bassFreq = rootFreq / 2;
      bassOsc.frequency.setValueAtTime(bassFreq, now);
      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.2);
    }

    // 5. Arpeggio Synth melody
    if (step % 2 === 0) {
      const arpHarmonics = [1, 1.25, 1.5, 2.0];
      const harmonic = arpHarmonics[(step / 2) % 4];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(rootFreq * harmonic, now);
      leadGain.gain.setValueAtTime(0.07, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.14);
    }
  }

  public dispose() {
    this.stopMusic();
    this.stopMicrophone();
    if (this.geyserNoiseNode) {
      try {
        this.geyserNoiseNode.stop();
      } catch {}
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundEngine();
