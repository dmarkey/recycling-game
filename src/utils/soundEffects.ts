// Sound effect utilities using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  // Caches for preloaded sounds
  private glassBuffer: AudioBuffer | null = null;
  private canBuffer: AudioBuffer | null = null;
  private preloadPromise: Promise<void> | null = null;

  /**
   * Preload all sound assets and cache their AudioBuffers.
   * Returns a promise that resolves when all are loaded.
   */
  public async preloadAll(): Promise<void> {
    if (this.preloadPromise) return this.preloadPromise; // Prevent duplicate preloads
    this.preloadPromise = (async () => {
      await this.ensureAudioContext();
      // Preload glass
      this.glassBuffer = await this.loadSound('/public/sounds/glass-bottle-smash-3-229205.mp3');
      // Preload can (used for both can and plastic)
      this.canBuffer = await this.loadSound('/public/sounds/crushed-can-139334.mp3');
    })();
    return this.preloadPromise;
  }

  constructor() {
    // Do not initialize audio context here; must be done on user gesture for browser compatibility
  }

  /**
   * Initialize AudioContext and preload all sounds in response to a user gesture.
   */
  public async initOnUserGesture(): Promise<void> {
    this.initAudioContext();
    await this.preloadAll();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private async loadSound(url: string): Promise<AudioBuffer | null> {
    await this.ensureAudioContext();
    if (!this.audioContext) {
      console.warn('AudioContext not available, cannot load sound.');
      return null;
    }

    try {
      console.log(`Attempting to load sound from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log(`Successfully loaded sound from ${url}`);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound from ${url}:`, error);
      return null;
    }
  }

  // Glass breaking sound effect
  async playGlassBreak() {
    await this.ensureAudioContext();
    let buffer = this.glassBuffer;
    if (!buffer) {
      buffer = await this.loadSound('/public/sounds/glass-bottle-smash-3-229205.mp3');
      this.glassBuffer = buffer;
    }
    if (!buffer || !this.audioContext) {
      console.warn('Glass sound buffer not available or AudioContext missing.');
      return;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
    //console.log('Glass break sound started.');
  }

  // Can crushing sound effect
  async playCanCrush() {
    await this.ensureAudioContext();
    let buffer = this.canBuffer;
    if (!buffer) {
      buffer = await this.loadSound('/public/sounds/crushed-can-139334.mp3');
      this.canBuffer = buffer;
    }
    if (!buffer || !this.audioContext) {
      console.warn('Can sound buffer not available or AudioContext missing.');
      return;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
    //console.log('Can crush sound started.');
  }

  // Plastic bottle crushing sound (using can crush sound for DRS bottles)
  async playPlasticCrush() {
    await this.ensureAudioContext();
    let buffer = this.canBuffer;
    if (!buffer) {
      buffer = await this.loadSound('/public/sounds/crushed-can-139334.mp3');
      this.canBuffer = buffer;
    }
    if (!buffer || !this.audioContext) {
      console.warn('Can sound buffer not available or AudioContext missing for plastic crush.');
      return;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
    //console.log('Plastic bottle crush sound (can crush) started.');
  }

  // Success sound for correct sorting
  async playSuccess() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const duration = 0.4;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Pleasant chord progression
    oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5

    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    // Volume envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    // Connect the audio graph
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and stop
    const startTime = this.audioContext.currentTime;
    oscillator1.start(startTime);
    oscillator2.start(startTime);
    oscillator1.stop(startTime + duration);
    oscillator2.stop(startTime + duration);
  }

  // Error sound for incorrect sorting
  async playError() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const duration = 0.3;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Low, discordant tone
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + duration);
    oscillator.type = 'sawtooth';

    // Volume envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    // Connect the audio graph
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and stop
    const startTime = this.audioContext.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // NEW: Speed Up Celebration Sound
  async playSpeedUp() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const duration = 1.5;

    // Create multiple oscillators for a rich celebration sound
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    // Ascending chord progression for celebration
    const frequencies = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      523.25, // C5
      659.25, // E5
      783.99  // G5
    ];

    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.audioContext!.currentTime + duration);
      osc.type = 'sine';

      // Staggered volume envelope for cascading effect
      const startTime = this.audioContext!.currentTime + (index * 0.1);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - (index * 0.1));

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);

      oscillators.push(osc);
      gainNodes.push(gain);
    });

    // Add some sparkle with high frequency oscillations
    const sparkleOsc = this.audioContext.createOscillator();
    const sparkleGain = this.audioContext.createGain();
    const sparkleFilter = this.audioContext.createBiquadFilter();

    sparkleOsc.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    sparkleOsc.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + 0.5);
    sparkleOsc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + duration);
    sparkleOsc.type = 'triangle';

    sparkleFilter.type = 'highpass';
    sparkleFilter.frequency.setValueAtTime(1500, this.audioContext.currentTime);

    sparkleGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    sparkleGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    sparkleOsc.connect(sparkleFilter);
    sparkleFilter.connect(sparkleGain);
    sparkleGain.connect(this.audioContext.destination);

    // Start all oscillators
    const startTime = this.audioContext.currentTime;
    oscillators.forEach((osc, index) => {
      osc.start(startTime + (index * 0.1));
      osc.stop(startTime + duration);
    });

    sparkleOsc.start(startTime);
    sparkleOsc.stop(startTime + duration);
  }
}

export const soundEffects = new SoundEffects();