import { Component, Output, EventEmitter, signal, computed, OnInit, OnDestroy } from '@angular/core';

interface LightningItem {
  id: string;
  name: string;
  emoji: string;
  isNeed: boolean;
}

@Component({
  selector: 'app-lightning-round',
  standalone: true,
  template: `
    <div class="lightning-game animate-slide-up">
      <div class="lightning-header">
        <span class="lh-emoji">⚡</span>
        <h2>Lightning Round!</h2>
        <p>Answer as fast as you can! You have <strong>30 seconds</strong>!</p>
      </div>

      <div class="timer-bar">
        <div class="timer-fill" [style.width.%]="timerPercent()" [class.urgent]="timeLeft() <= 10"></div>
        <span class="timer-text">{{ timeLeft() }}s</span>
      </div>

      <div class="score-display">
        <span>✅ Correct: {{ correctCount }}</span>
        <span>❌ Wrong: {{ wrongCount }}</span>
      </div>

      @if (currentItem) {
        <div class="lightning-card animate-pop">
          <span class="lc-emoji">{{ currentItem.emoji }}</span>
          <h2 class="lc-name">{{ currentItem.name }}</h2>
          <p class="lc-prompt">Need or Want?</p>
          <div class="lc-buttons">
            <button class="btn-need" (click)="answer(true)" aria-label="Need">
              <span>💧</span> Need
            </button>
            <button class="btn-want" (click)="answer(false)" aria-label="Want">
              <span>🌟</span> Want
            </button>
          </div>
        </div>
      }

      @if (isFinished) {
        <div class="lightning-result">
          <h3>⏱️ Time's Up!</h3>
          <div class="result-stats">
            <div class="r-stat correct"><span class="rs-val">{{ correctCount }}</span><span>Correct</span></div>
            <div class="r-stat wrong"><span class="rs-val">{{ wrongCount }}</span><span>Wrong</span></div>
            <div class="r-stat total"><span class="rs-val">{{ correctCount + wrongCount }}</span><span>Total</span></div>
          </div>
          <div class="r-message">
            @if (correctCount >= 8) {
              <p>⚡ Lightning fast AND accurate! Amazing!</p>
            } @else if (correctCount >= 5) {
              <p>👍 Great job! You know your needs from wants!</p>
            } @else {
              <p>💪 Good effort! Practice makes perfect!</p>
            }
          </div>
          <button class="btn-primary" (click)="done.emit()">Continue ➡️</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .lightning-game { margin: 16px 0; }
    .lightning-header {
      text-align: center;
      background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .lh-emoji { font-size: 40px; display: block; animation: lightningFlash 1s infinite; }
    @keyframes lightningFlash {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    .lightning-header h2 { font-family: 'Fredoka', sans-serif; font-size: 24px; color: #E65100; margin: 4px 0; }
    .lightning-header p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #666; margin: 4px 0 0; }
    .timer-bar {
      position: relative;
      height: 24px;
      background: #E0E0E0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .timer-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #FFD54F);
      border-radius: 12px;
      transition: width 1s linear;
    }
    .timer-fill.urgent { background: linear-gradient(90deg, #F44336, #FF9800); }
    .timer-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Fredoka', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .score-display {
      display: flex;
      justify-content: space-between;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
      padding: 0 4px;
    }
    .score-display span:first-child { color: #2E7D32; }
    .score-display span:last-child { color: #C62828; }
    .lightning-card {
      background: white;
      border-radius: 24px;
      padding: 28px;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 0 auto;
    }
    .lc-emoji { font-size: 72px; display: block; margin-bottom: 8px; }
    .lc-name { font-family: 'Fredoka', sans-serif; font-size: 26px; color: #333; margin: 0; }
    .lc-prompt { font-family: 'Nunito', sans-serif; font-size: 16px; color: #888; margin: 8px 0 16px; }
    .lc-buttons { display: flex; gap: 12px; justify-content: center; }
    .btn-need, .btn-want {
      padding: 14px 28px;
      border-radius: 50px;
      font-family: 'Fredoka', sans-serif;
      font-size: 18px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn-need { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .btn-want { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .btn-need:hover, .btn-want:hover { transform: translateY(-2px); }
    .lightning-result { text-align: center; padding: 12px 0; }
    .lightning-result h3 { font-family: 'Fredoka', sans-serif; font-size: 24px; }
    .result-stats {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin: 12px 0;
    }
    .r-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 20px;
      border-radius: 14px;
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 600;
    }
    .r-stat.correct { background: #E8F5E9; color: #2E7D32; }
    .r-stat.wrong { background: #FFEBEE; color: #C62828; }
    .r-stat.total { background: #E3F2FD; color: #1565C0; }
    .rs-val { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; }
    .r-message { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700; padding: 10px; }
  `]
})
export class LightningRoundComponent implements OnInit, OnDestroy {
  @Output() done = new EventEmitter<void>();
  @Output() score = new EventEmitter<number>();

  items: LightningItem[] = [
    { id: 't1', name: 'Toothbrush', emoji: '🪥', isNeed: true },
    { id: 't2', name: 'Candy', emoji: '🍬', isNeed: false },
    { id: 't3', name: 'Socks', emoji: '🧦', isNeed: true },
    { id: 't4', name: 'Air Conditioner', emoji: '❄️', isNeed: true },
    { id: 't5', name: 'Pet Dragon', emoji: '🐉', isNeed: false },
    { id: 't6', name: 'Bicycle', emoji: '🚲', isNeed: false },
    { id: 't7', name: 'Medicine', emoji: '💊', isNeed: true },
    { id: 't8', name: 'Chocolate Milk', emoji: '🥛', isNeed: false },
    { id: 't9', name: 'Shoes', emoji: '👟', isNeed: true },
    { id: 't10', name: 'Video Game', emoji: '🎮', isNeed: false },
    { id: 't11', name: 'Water', emoji: '💧', isNeed: true },
    { id: 't12', name: 'Toy Car', emoji: '🚗', isNeed: false },
    { id: 't13', name: 'Pillow', emoji: '🛏️', isNeed: true },
    { id: 't14', name: 'Lollipop', emoji: '🍭', isNeed: false },
    { id: 't15', name: 'Jacket', emoji: '🧥', isNeed: true },
    { id: 't16', name: 'Sunglasses', emoji: '🕶️', isNeed: false },
    { id: 't17', name: 'Soap', emoji: '🧼', isNeed: true },
    { id: 't18', name: 'Ice Cream', emoji: '🍦', isNeed: false },
    { id: 't19', name: 'Milk', emoji: '🥛', isNeed: true },
    { id: 't20', name: 'Comic Book', emoji: '📘', isNeed: false },
  ];

  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  isFinished = false;
  timeLeft = signal(30);
  timerPercent = computed(() => (this.timeLeft() / 30) * 100);

  private timerId: ReturnType<typeof setInterval> | null = null;

  get currentItem(): LightningItem | null {
    if (this.isFinished || this.currentIndex >= this.items.length) return null;
    return this.items[this.currentIndex];
  }

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.timeLeft.update((t) => {
        if (t <= 1) {
          this.endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  answer(isNeed: boolean): void {
    if (this.isFinished || !this.currentItem) return;
    if (this.currentItem.isNeed === isNeed) {
      this.correctCount++;
    } else {
      this.wrongCount++;
    }
    this.currentIndex++;
    if (this.currentIndex >= this.items.length) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.isFinished = true;
    if (this.timerId) clearInterval(this.timerId);
    this.score.emit(this.correctCount * 2);
  }
}
