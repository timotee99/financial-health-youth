import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MoneyMikeComponent } from '../money-mike/money-mike';

@Component({
  selector: 'app-lesson-complete',
  standalone: true,
  imports: [MoneyMikeComponent],
  template: `
    <div class="overlay" (click)="continue.emit()" role="dialog" aria-modal="true"
         [attr.aria-label]="'Lesson complete!'">
      <div class="completion-card" (click)="$event.stopPropagation()">
        <div class="confetti-burst">
          @for (c of confetti; track c) {
            <span class="confetti-piece" [style.--i]="c"
                  [style.background]="colors[c % colors.length]"></span>
          }
        </div>

        <div class="completion-header">
          <span class="trophy">🏆</span>
          <h2>{{ lessonTitle }}</h2>
          <p class="subtitle">Lesson Complete!</p>
        </div>

        <app-money-mike [message]="message" mood="celebrate" size="small"></app-money-mike>

        <div class="stats-row">
          <div class="stat">
            <span class="stat-value">{{ xpEarned }}</span>
            <span class="stat-label">XP Earned</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ score }}</span>
            <span class="stat-label">Score</span>
          </div>
        </div>

        @if (badge) {
          <div class="badge-earned animate">
            <span class="badge-emoji">{{ badgeEmoji }}</span>
            <span class="badge-text">Badge Earned: {{ badge }}</span>
          </div>
        }

        <button class="continue-btn" (click)="continue.emit()" mat-ripple>
          Continue
        </button>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    .completion-card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.4s ease;
    }
    .confetti-burst { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .confetti-piece {
      position: absolute;
      top: -10px;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      animation: confettiFall 2s ease-out forwards;
      left: calc(var(--i) * 10%);
      animation-delay: calc(var(--i) * 0.1s);
      opacity: 0.8;
    }
    @keyframes confettiFall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
    }
    .completion-header { margin-bottom: 20px; }
    .trophy { font-size: 48px; display: block; margin-bottom: 8px; }
    h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 24px;
      color: #333;
      margin: 0;
    }
    .subtitle {
      font-family: 'Nunito', sans-serif;
      font-size: 16px;
      color: #4CAF50;
      font-weight: 700;
      margin: 4px 0 0;
    }
    .stats-row {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-value {
      font-family: 'Fredoka', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #FF6F00;
    }
    .stat-label {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      color: #888;
      font-weight: 600;
    }
    .badge-earned {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #FFF8E1, #FFE082);
      border-radius: 12px;
      padding: 10px 16px;
      margin: 12px 0;
    }
    .badge-emoji { font-size: 28px; }
    .badge-text {
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #E65100;
    }
    .continue-btn {
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 14px 48px;
      font-family: 'Fredoka', sans-serif;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 16px;
      box-shadow: 0 4px 12px rgba(76,175,80,0.4);
    }
    .continue-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(76,175,80,0.5);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class LessonCompleteComponent {
  @Input() lessonTitle = '';
  @Input() message = '';
  @Input() xpEarned = 0;
  @Input() score = 0;
  @Input() badge = '';
  @Input() badgeEmoji = '🎖️';
  @Output() continue = new EventEmitter<void>();

  colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#FF8C94', '#A8E6CF'];
  confetti = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
}
