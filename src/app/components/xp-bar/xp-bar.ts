import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-xp-bar',
  standalone: true,
  template: `
    <div class="xp-container" role="progressbar" [attr.aria-valuenow]="currentXp"
         [attr.aria-valuemin]="0" [attr.aria-valuemax]="maxXp"
         [attr.aria-label]="'Experience: Level ' + level">
      <div class="xp-info">
        <span class="level-badge">
          <span class="level-icon">⭐</span>
          Level {{ level }}
        </span>
        <span class="xp-text">{{ currentXp }} / {{ maxXp }} XP</span>
      </div>
      <div class="xp-track">
        <div class="xp-fill" [style.width.%]="progress">
          <div class="xp-glow"></div>
        </div>
      </div>
      <div class="level-title">{{ levelName }}</div>
    </div>
  `,
  styles: [`
    .xp-container {
      background: white;
      border-radius: 16px;
      padding: 12px 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin: 8px 0;
    }
    .xp-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .level-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Fredoka', sans-serif;
      font-weight: 600;
      font-size: 18px;
      color: #FF6F00;
    }
    .level-icon { font-size: 22px; }
    .xp-text {
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #666;
    }
    .xp-track {
      height: 16px;
      background: #E8E8E8;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }
    .xp-fill {
      height: 100%;
      background: linear-gradient(90deg, #FFD54F, #FFB300);
      border-radius: 10px;
      transition: width 0.5s ease;
      position: relative;
      overflow: hidden;
    }
    .xp-glow {
      position: absolute;
      top: 0;
      left: -30%;
      width: 30%;
      height: 100%;
      background: rgba(255,255,255,0.4);
      transform: skewX(-20deg);
      animation: shimmer 2s infinite;
    }
    .level-title {
      text-align: center;
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      margin-top: 6px;
    }
    @keyframes shimmer {
      0% { left: -30%; }
      100% { left: 110%; }
    }
  `]
})
export class XpBarComponent {
  @Input() currentXp = 0;
  @Input() maxXp = 200;
  @Input() level = 1;

  get progress(): number {
    return Math.min((this.currentXp / this.maxXp) * 100, 100);
  }

  get levelName(): string {
    const names: Record<number, string> = {
      1: 'Coin Collector',
      2: 'Money Explorer',
      3: 'Budget Builder',
      4: 'Saving Superstar',
      5: 'Money Master',
    };
    return names[this.level] || 'Money Legend';
  }
}
