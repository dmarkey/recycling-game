// Sound effect utilities using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first user interaction
    this.initAudioContext();
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

  // Glass breaking sound effect
  async playGlassBreak() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const duration = 0.8;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Create a complex sound with multiple frequencies for glass breaking
    oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
    
    oscillator2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + duration);
    
    oscillator3.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    oscillator3.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);

    // Add noise-like characteristics
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'square';
    oscillator3.type = 'triangle';

    // High-pass filter for crisp glass sound
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);

    // Volume envelope - sharp attack, quick decay
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    // Connect the audio graph
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    oscillator3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and stop
    const startTime = this.audioContext.currentTime;
    oscillator1.start(startTime);
    oscillator2.start(startTime);
    oscillator3.start(startTime);
    
    oscillator1.stop(startTime + duration);
    oscillator2.stop(startTime + duration);
    oscillator3.stop(startTime + duration);
  }

  // Can crushing sound effect
  async playCanCrush() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const duration = 0.6;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Create metallic crushing sound
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
    oscillator.frequency.linearRampToValueAtTime(60, this.audioContext.currentTime + duration);

    oscillator.type = 'sawtooth';

    // Band-pass filter for metallic sound
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);

    // Volume envelope - gradual crush
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    // Connect the audio graph
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and stop
    const startTime = this.audioContext.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Plastic bottle crushing sound
  async playPlasticCrush() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const duration = 0.5;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Create plastic crinkling sound
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + duration);

    oscillator.type = 'square';

    // Low-pass filter for muffled plastic sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

    // Volume envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    // Connect the audio graph
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and stop
    const startTime = this.audioContext.currentTime;
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
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
    const oscillators = [];
    const gainNodes = [];
    
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