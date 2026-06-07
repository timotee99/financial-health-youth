import { Injectable } from '@angular/core';
import { FinancialProfileService } from './financial-profile.service';

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private profile: FinancialProfileService) {}

  private get isEnabled(): boolean {
    return this.profile.soundEnabled();
  }

  playSuccess(): void {
    if (!this.isEnabled) return;
    this.play(520, 0.15, 'sine', 0.3);
    setTimeout(() => this.play(660, 0.15, 'sine', 0.3), 100);
    setTimeout(() => this.play(780, 0.2, 'sine', 0.3), 200);
  }

  playIncorrect(): void {
    if (!this.isEnabled) return;
    this.play(300, 0.2, 'square', 0.2);
    setTimeout(() => this.play(250, 0.3, 'square', 0.2), 150);
  }

  playBadge(): void {
    if (!this.isEnabled) return;
    this.play(523, 0.15, 'sine', 0.3);
    setTimeout(() => this.play(659, 0.15, 'sine', 0.3), 120);
    setTimeout(() => this.play(784, 0.15, 'sine', 0.3), 240);
    setTimeout(() => this.play(1047, 0.3, 'sine', 0.3), 360);
  }

  playClick(): void {
    if (!this.isEnabled) return;
    this.play(800, 0.05, 'sine', 0.15);
  }

  playCoin(): void {
    if (!this.isEnabled) return;
    this.play(1200, 0.1, 'triangle', 0.2);
    setTimeout(() => this.play(1400, 0.1, 'triangle', 0.2), 80);
  }

  playComplete(): void {
    if (!this.isEnabled) return;
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.12, 'sine', 0.25), i * 80);
    });
  }

  private play(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch {
      // Audio not available
    }
  }
}
