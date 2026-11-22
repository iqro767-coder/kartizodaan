import type { CategoryId, TaskMusicConfig } from '../types/task';
import { getCustomAudio } from './audioStorage';

export interface BuiltinTrack {
  id: string;
  title: string;
  category: CategoryId;
  moodLabel: string;
  bpm: number;
  waveform: OscillatorType;
  bassWaveform: OscillatorType;
  /** MIDI note sequence for melody (0 = rest) */
  melody: number[];
  /** MIDI note sequence for chords/bass */
  bass: number[];
  hasBeat: boolean;
  softEnvelope: boolean;
}

export const BUILTIN_TRACKS: BuiltinTrack[] = [
  // SPORT — Tez va kuchli (Fast & energetic)
  {
    id: 'sport_energy',
    title: 'Energiya Ritmi',
    category: 'Sport',
    moodLabel: 'Tez va kuchli',
    bpm: 138,
    waveform: 'sawtooth',
    bassWaveform: 'triangle',
    melody: [64, 67, 71, 76, 74, 71, 69, 71, 64, 67, 72, 76, 79, 76, 74, 71],
    bass: [40, 40, 43, 43, 45, 45, 47, 47, 40, 40, 43, 43, 48, 48, 47, 43],
    hasBeat: true,
    softEnvelope: false,
  },
  {
    id: 'sport_sprint',
    title: 'Chempion Yugurishi',
    category: 'Sport',
    moodLabel: 'Jadal va ruhlantiruvchi',
    bpm: 146,
    waveform: 'square',
    bassWaveform: 'sawtooth',
    melody: [69, 72, 76, 81, 79, 76, 74, 76, 69, 72, 77, 81, 84, 81, 79, 76],
    bass: [45, 45, 48, 48, 50, 50, 52, 52, 45, 45, 48, 48, 53, 53, 52, 48],
    hasBeat: true,
    softEnvelope: false,
  },

  // O'QISH — Tinch (Calm & contemplative)
  {
    id: 'study_library',
    title: 'Sokin Kutubxona',
    category: "O'qish",
    moodLabel: 'Tinch va mulohazali',
    bpm: 72,
    waveform: 'sine',
    bassWaveform: 'sine',
    melody: [67, 0, 71, 74, 72, 0, 69, 67, 64, 0, 67, 71, 69, 0, 67, 0],
    bass: [48, 0, 55, 0, 53, 0, 52, 0, 45, 0, 52, 0, 50, 0, 48, 0],
    hasBeat: false,
    softEnvelope: true,
  },
  {
    id: 'study_focus',
    title: 'Tonggi Diqqat',
    category: "O'qish",
    moodLabel: 'Mayin va osoyishta',
    bpm: 78,
    waveform: 'triangle',
    bassWaveform: 'sine',
    melody: [65, 69, 72, 0, 74, 72, 69, 0, 64, 67, 71, 0, 72, 69, 67, 0],
    bass: [53, 0, 48, 0, 50, 0, 45, 0, 52, 0, 47, 0, 48, 0, 43, 0],
    hasBeat: false,
    softEnvelope: true,
  },

  // ISH — Diqqatni jamlovchi (Structured focus)
  {
    id: 'work_deep',
    title: 'Chuqur Fokus',
    category: 'Ish',
    moodLabel: 'Diqqatni jamlovchi',
    bpm: 94,
    waveform: 'triangle',
    bassWaveform: 'triangle',
    melody: [64, 67, 71, 67, 74, 71, 67, 71, 62, 66, 69, 66, 72, 69, 66, 69],
    bass: [48, 0, 48, 0, 52, 0, 52, 0, 50, 0, 50, 0, 47, 0, 47, 0],
    hasBeat: false,
    softEnvelope: false,
  },
  {
    id: 'work_flow',
    title: 'Samarali Oqim',
    category: 'Ish',
    moodLabel: 'Aniq va barqaror',
    bpm: 98,
    waveform: 'sine',
    bassWaveform: 'triangle',
    melody: [69, 72, 76, 72, 74, 71, 69, 71, 67, 71, 74, 71, 72, 69, 67, 64],
    bass: [45, 45, 0, 45, 47, 47, 0, 47, 43, 43, 0, 43, 48, 48, 0, 45],
    hasBeat: false,
    softEnvelope: false,
  },

  // DAM OLISH — Quvnoq (Cheerful & uplifting)
  {
    id: 'rest_sunny',
    title: 'Quyoshli Kayfiyat',
    category: 'Dam olish',
    moodLabel: 'Quvnoq va yorqin',
    bpm: 112,
    waveform: 'triangle',
    bassWaveform: 'sine',
    melody: [72, 76, 79, 76, 81, 79, 76, 74, 72, 74, 76, 79, 76, 74, 72, 0],
    bass: [48, 55, 52, 55, 53, 57, 52, 55, 48, 55, 52, 55, 50, 55, 48, 55],
    hasBeat: true,
    softEnvelope: false,
  },
  {
    id: 'rest_smile',
    title: 'Yengil Tabassum',
    category: 'Dam olish',
    moodLabel: 'Shodlik ohangi',
    bpm: 108,
    waveform: 'sine',
    bassWaveform: 'triangle',
    melody: [67, 71, 74, 79, 78, 74, 71, 74, 69, 72, 76, 81, 79, 76, 74, 72],
    bass: [43, 50, 47, 50, 50, 57, 54, 57, 45, 52, 48, 52, 48, 55, 50, 55],
    hasBeat: true,
    softEnvelope: false,
  },

  // UYQU — Yumshoq (Soft lullaby)
  {
    id: 'sleep_stars',
    title: 'Tungi Yulduzlar',
    category: 'Uyqu',
    moodLabel: 'Yumshoq allalovchi',
    bpm: 56,
    waveform: 'sine',
    bassWaveform: 'sine',
    melody: [64, 0, 67, 0, 71, 0, 69, 0, 67, 0, 64, 0, 62, 0, 64, 0],
    bass: [48, 0, 0, 0, 45, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0],
    hasBeat: false,
    softEnvelope: true,
  },
  {
    id: 'sleep_dream',
    title: 'Orom Ohangi',
    category: 'Uyqu',
    moodLabel: 'Osuda va mayin',
    bpm: 52,
    waveform: 'sine',
    bassWaveform: 'sine',
    melody: [69, 0, 72, 0, 71, 0, 67, 0, 65, 0, 69, 0, 67, 0, 64, 0],
    bass: [45, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0],
    hasBeat: false,
    softEnvelope: true,
  },

  // UY ISHLARI — Yengil va ritmik (Light & rhythmic)
  {
    id: 'chores_harmony',
    title: "Uyg'un Tartib",
    category: 'Uy ishlari',
    moodLabel: 'Yengil va ritmik',
    bpm: 116,
    waveform: 'triangle',
    bassWaveform: 'sine',
    melody: [69, 72, 74, 72, 76, 74, 72, 69, 67, 71, 72, 71, 74, 72, 71, 67],
    bass: [45, 0, 52, 0, 48, 0, 55, 0, 43, 0, 50, 0, 48, 0, 52, 0],
    hasBeat: true,
    softEnvelope: false,
  },
  {
    id: 'chores_breeze',
    title: 'Xushchaqchaq Kun',
    category: 'Uy ishlari',
    moodLabel: 'Tetik va yengil',
    bpm: 120,
    waveform: 'triangle',
    bassWaveform: 'triangle',
    melody: [72, 74, 76, 72, 79, 76, 74, 72, 69, 71, 72, 69, 76, 74, 72, 71],
    bass: [48, 0, 55, 0, 52, 0, 55, 0, 45, 0, 52, 0, 50, 0, 55, 0],
    hasBeat: true,
    softEnvelope: false,
  },
];

export function getAutoTrackForCategory(category: CategoryId): BuiltinTrack {
  return BUILTIN_TRACKS.find((t) => t.category === category) || BUILTIN_TRACKS[0];
}

export function getTrackById(id: string | undefined): BuiltinTrack | undefined {
  if (!id) return undefined;
  return BUILTIN_TRACKS.find((t) => t.id === id);
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private stepTimer: number | null = null;
  private currentAudioEl: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private volume = 0.7;
  private playingKey: string | null = null;
  private listeners: Set<() => void> = new Set();

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async unlock(): Promise<boolean> {
    try {
      const ctx = this.ensureContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Play an inaudible 10ms pulse to firmly unlock mobile browsers (iOS/Android)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
      this.notify();
      return ctx.state === 'running';
    } catch {
      return false;
    }
  }

  isUnlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  setVolume(val: number): void {
    this.volume = Math.min(1, Math.max(0, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.03);
    }
    if (this.currentAudioEl) {
      this.currentAudioEl.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  getPlayingKey(): string | null {
    return this.playingKey;
  }

  stop(): void {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.currentAudioEl) {
      this.currentAudioEl.pause();
      this.currentAudioEl.currentTime = 0;
      this.currentAudioEl = null;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.playingKey = null;
    this.notify();
  }

  private playSynthNote(
    ctx: AudioContext,
    freq: number,
    durationSec: number,
    type: OscillatorType,
    gainLevel: number,
    softEnvelope: boolean,
  ): void {
    if (!this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(softEnvelope ? 1400 : 2600, now);

    const attack = softEnvelope ? 0.06 : 0.015;
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(gainLevel, now + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + durationSec + 0.03);
  }

  private playPercussionHit(ctx: AudioContext, stepIdx: number): void {
    if (!this.masterGain) return;
    const now = ctx.currentTime;

    // Kick on beats 0, 4, 8, 12
    if (stepIdx % 4 === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(125, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (stepIdx % 2 === 1) {
      // Soft hi-hat pulse
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(980, now);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  }

  async playTrack(track: BuiltinTrack, key: string, loop = true): Promise<void> {
    this.stop();
    try {
      const ctx = this.ensureContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      this.playingKey = key;
      this.notify();

      const stepMs = Math.round((60 / track.bpm / 2) * 1000);
      let step = 0;

      const tick = () => {
        if (!this.ctx || this.playingKey !== key) return;
        const idx = step % track.melody.length;
        const melMidi = track.melody[idx];
        const bassMidi = track.bass[idx];
        const noteDur = (stepMs / 1000) * (track.softEnvelope ? 1.85 : 1.15);

        if (melMidi > 0) {
          this.playSynthNote(
            this.ctx,
            midiToFreq(melMidi),
            noteDur,
            track.waveform,
            track.softEnvelope ? 0.18 : 0.14,
            track.softEnvelope,
          );
        }
        if (bassMidi > 0) {
          this.playSynthNote(
            this.ctx,
            midiToFreq(bassMidi),
            noteDur * 1.4,
            track.bassWaveform,
            0.12,
            true,
          );
        }
        if (track.hasBeat) {
          this.playPercussionHit(this.ctx, idx);
        }

        step++;
        if (!loop && step >= track.melody.length * 2) {
          this.stop();
        }
      };

      tick();
      this.stepTimer = window.setInterval(tick, stepMs);
    } catch {
      this.playingKey = null;
      this.notify();
    }
  }

  async playCustomAudio(customAudioId: string, key: string, loop = true): Promise<boolean> {
    this.stop();
    try {
      const record = await getCustomAudio(customAudioId);
      if (!record) return false;
      const url = URL.createObjectURL(record.blob);
      this.currentObjectUrl = url;
      const audio = new Audio(url);
      audio.loop = loop;
      audio.volume = this.volume;
      this.currentAudioEl = audio;
      this.playingKey = key;
      this.notify();

      audio.onended = () => {
        if (!loop) {
          this.stop();
        }
      };

      await audio.play();
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  async playForTask(
    category: CategoryId,
    config: TaskMusicConfig | undefined,
    key: string,
    loop = true,
  ): Promise<void> {
    const mode = config?.mode || 'auto';
    if (mode === 'custom' && config?.customAudioId) {
      const ok = await this.playCustomAudio(config.customAudioId, key, loop);
      if (ok) return;
    }
    if (mode === 'preset' && config?.presetId) {
      const track = getTrackById(config.presetId);
      if (track) {
        await this.playTrack(track, key, loop);
        return;
      }
    }
    const autoTrack = getAutoTrackForCategory(category);
    await this.playTrack(autoTrack, key, loop);
  }
}

export const musicEngine = new MusicEngine();
