import { Component, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { XpBarComponent } from '../../components/xp-bar/xp-bar';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-money-magic',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent, FormsModule],
  template: `
    <div class="page-container">
      @if (!started) {
        <div class="intro animate-slide-up">
          <app-money-mike message="Did you know money can GROW all by itself? It's called investing, and it's like magic! Let me teach you!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <h2>🌟 What is Investing?</h2>
            <p><strong>Investing</strong> means putting your money somewhere where it can grow over time. Instead of keeping your money in a piggy bank where it stays the same, you let it work for you and make even more money!</p>
          </div>

          <div class="lesson-content card">
            <h2>🔄 The Magic of Compound Growth</h2>
            <p>Compound growth is when your money earns money, and then THAT money earns money too! It's like a snowball rolling down a hill — it gets bigger and bigger!</p>
            <div class="compound-demo">
              <div class="compound-step">
                <span class="cs-emoji">🪙</span>
                <span class="cs-label">Start with 1 penny</span>
              </div>
              <span class="cs-arrow">➡️</span>
              <div class="compound-step">
                <span class="cs-emoji">🪙🪙</span>
                <span class="cs-label">Doubles to 2 cents</span>
              </div>
              <span class="cs-arrow">➡️</span>
              <div class="compound-step">
                <span class="cs-emoji">🪙🪙🪙🪙</span>
                <span class="cs-label">Doubles to 4 cents</span>
              </div>
              <span class="cs-arrow">➡️</span>
              <div class="compound-step highlight">
                <span class="cs-emoji">💰💰💰</span>
                <span class="cs-label">Keeps growing!</span>
              </div>
            </div>
          </div>

          <div class="lesson-content card">
            <h2>⏰ Why Starting Early Matters</h2>
            <div class="early-compare">
              <div class="early-person">
                <span class="ep-emoji">👧</span>
                <h4>Starts at Age 10</h4>
                <p>Saves $10/week for 10 years</p>
                <span class="ep-result">~$10,000+</span>
              </div>
              <div class="early-person">
                <span class="ep-emoji">👩</span>
                <h4>Starts at Age 30</h4>
                <p>Saves $10/week for 10 years</p>
                <span class="ep-result">~$6,000</span>
              </div>
            </div>
            <p class="early-lesson">The earlier you start, the more time your money has to grow! Starting young is a superpower!</p>
          </div>

          <div class="lesson-content card key-points">
            <h2>Key Takeaways</h2>
            <div class="rule-box">
              <span class="rule-icon">⏰</span>
              <p><strong>Start early!</strong> The sooner you start saving and investing, the more your money can grow.</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">🔄</span>
              <p><strong>Let it compound.</strong> Don't keep withdrawing your earnings — let them stay and grow even more!</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">📈</span>
              <p><strong>Be patient.</strong> Investing is a long-term game. Small amounts add up to huge amounts over time!</p>
            </div>
          </div>

          <div class="ready-section">
            <button class="btn-primary" (click)="startGame()" aria-label="See the magic of compounding">
              ✨ Show Me the Magic!
            </button>
          </div>
        </div>
      }

      @if (started && step === 'intro') {
        <div class="step-container animate-slide-up">
          <app-money-mike message="Imagine you have a magical penny that doubles every day! Let's see what happens..." mood="thinking">
          </app-money-mike>

          <div class="penny-showcase">
            <div class="penny-large">
              <span class="penny-coin">🪙</span>
              <span class="penny-label">1 Penny</span>
            </div>
            <div class="arrow">➡️</div>
            <div class="penny-large">
              <span class="penny-coin">🪙🪙</span>
              <span class="penny-label">2 Pennies</span>
            </div>
            <div class="arrow">➡️</div>
            <div class="penny-large">
              <span class="penny-coin">🪙🪙🪙🪙</span>
              <span class="penny-label">4 Pennies</span>
            </div>
            <p class="penny-explanation">It doubles every day!</p>
          </div>

          <button class="btn-primary" (click)="step = 'slider'" aria-label="Try the slider">
            🎮 Try It!
          </button>
        </div>
      }

      @if (started && step === 'slider') {
        <div class="step-container">
          <app-money-mike message="Move the slider to see how a penny grows over 30 days!" mood="happy">
          </app-money-mike>

          <div class="slider-card card">
            <div class="day-display">
              <span class="day-label">Day</span>
              <span class="day-value">{{ sliderDay }}</span>
            </div>

            <input type="range" min="1" max="30" [(ngModel)]="sliderDay"
                   class="day-slider" (input)="updateDay()"
                   aria-label="Select day to see penny growth" />

            <div class="value-display" aria-live="polite">
              <span class="penny-stack">{{ pennyStack }}</span>
              <span class="value-text">{{ sliderDay === 1 ? '1 cent' : '$' + formatMoney(currentValue) }}</span>
            </div>

            <div class="pile-visual" [style.transform]="'scale(' + pileScale + ')'">
              @for (coin of coinPile; track coin) {
                <span class="pile-coin" [style.animation-delay]="coin + 'ms'">🪙</span>
              }
            </div>
          </div>

          <button class="btn-primary" (click)="step = 'predict'" aria-label="Make a prediction">
            🔮 Make a Prediction
          </button>
        </div>
      }

      @if (started && step === 'predict') {
        <div class="step-container animate-slide-up">
          <app-money-mike message="After 30 days, how much do you think the penny will be worth? Type your guess!" mood="thinking">
          </app-money-mike>

          <div class="predict-card card">
            <h3>🔮 Your Prediction</h3>
            <p class="predict-question">How much is 1 penny worth after 30 days of doubling?</p>

            <div class="input-group">
              <span class="dollar-sign">$</span>
              <input type="number" [(ngModel)]="prediction" class="prediction-input"
                     placeholder="Enter your guess" min="0"
                     aria-label="Enter your prediction in dollars"
                     (keyup.enter)="checkPrediction()" />
            </div>

            <button class="btn-primary" (click)="checkPrediction()" aria-label="Check your prediction">
              ✅ Check Answer
            </button>

            @if (showPredictionResult) {
              <div class="prediction-result animate-pop"
                   [class.correct]="isPredictionCorrect"
                   [class.incorrect]="!isPredictionCorrect">
                <span class="result-icon">{{ isPredictionCorrect ? '🎉' : '😮' }}</span>
                <div class="result-text">
                  <p>{{ isPredictionCorrect ? 'Amazing! You knew the power of compounding!' : 'Most people are surprised! The answer is much bigger!' }}</p>
                  <p class="result-answer">1 penny becomes <strong>$5,368,709.12</strong> after 30 days!</p>
                  <p class="result-explanation">That's over 5 million dollars from just 1 penny!</p>
                </div>
              </div>
            }
          </div>

          @if (showPredictionResult) {
            <button class="btn-primary" (click)="step = 'graph'" aria-label="See the growth graph">
              📈 Show Growth Graph
            </button>
          }
        </div>
      }

      @if (started && step === 'graph') {
        <div class="step-container animate-slide-up">
          <h2>📈 The Growth of 1 Penny</h2>

          <app-money-mike message="Look at how the penny grows! This is called COMPOUNDING - your money earning money on your money!" mood="celebrate">
          </app-money-mike>

          <div class="graph-card card">
            @for (bar of graphBars; track bar.day) {
              <div class="bar-container" [style.height.%]="bar.height">
                <div class="bar-fill" [style.background]="bar.color"
                     [style.height.%]="100"
                     [attr.aria-label]="'Day ' + bar.day + ': $' + formatMoney(bar.value)">
                </div>
                @if (bar.day % 5 === 0 || bar.day === 30 || bar.day === 1) {
                  <span class="bar-label">{{ bar.day }}</span>
                }
              </div>
            }
          </div>

          <div class="key-insight card">
            <h3>🌟 The Magic of Compounding</h3>
            <p>Starting early and letting your money grow over time is the secret to building wealth!</p>
            <p>Even a small amount can become huge if you give it time!</p>
          </div>

          <button class="btn-primary" (click)="finishLesson()" aria-label="Complete lesson">
            🎉 Complete Lesson
          </button>
        </div>
      }
    </div>

    @if (showComplete) {
      <app-lesson-complete lessonTitle="Money Magic"
        message="You discovered the amazing power of compound growth! Saving and investing early can make your money grow like magic!"
        [xpEarned]="100" [score]="score"
        badge="Future Investor" badgeEmoji="📈"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro { padding: 10px 0; }
    .lesson-content {
      margin-bottom: 16px;
      text-align: left;
    }
    .lesson-content h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 21px;
      margin-bottom: 8px;
    }
    .lesson-content > p {
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .compound-demo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 0;
      flex-wrap: wrap;
    }
    .compound-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 8px 12px;
      background: #F5F5F5;
      border-radius: 12px;
    }
    .compound-step.highlight { background: #FFF8E1; border: 2px solid #FFD54F; }
    .cs-emoji { font-size: 20px; }
    .cs-label { font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 600; color: #666; }
    .cs-arrow { font-size: 16px; color: #4CAF50; }
    .early-compare {
      display: flex;
      gap: 12px;
      margin: 10px 0;
    }
    .early-person {
      flex: 1;
      text-align: center;
      padding: 14px;
      border-radius: 14px;
    }
    .early-person:first-child { background: #E8F5E9; border: 3px solid #4CAF50; }
    .early-person:last-child { background: #FFF3E0; border: 3px solid #FF9800; }
    .ep-emoji { font-size: 36px; display: block; }
    .early-person h4 { font-family: 'Fredoka', sans-serif; font-size: 15px; margin: 4px 0; }
    .early-person p { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; margin: 4px 0; }
    .ep-result {
      display: block;
      font-family: 'Fredoka', sans-serif;
      font-size: 20px;
      font-weight: 700;
      margin-top: 6px;
    }
    .early-person:first-child .ep-result { color: #2E7D32; }
    .early-person:last-child .ep-result { color: #E65100; }
    .early-lesson {
      text-align: center;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #FF6F00;
      margin-top: 8px;
    }
    .key-points { background: #FFF8E1; }
    .rule-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #FFE082;
    }
    .rule-box:last-child { border-bottom: none; }
    .rule-icon { font-size: 24px; flex-shrink: 0; }
    .rule-box p { margin: 0; font-size: 14px; line-height: 1.5; }
    .ready-section { text-align: center; padding: 12px 0; }
    @media (max-width: 480px) {
      .compound-demo { flex-direction: column; }
      .early-compare { flex-direction: column; }
    }
    .step-container { padding: 10px 0; }
    .step-container h2 { text-align: center; margin-bottom: 16px; }
    .penny-showcase {
      background: white;
      border-radius: 24px;
      padding: 28px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      margin: 16px 0;
    }
    .penny-large { display: inline-flex; flex-direction: column; align-items: center; margin: 0 8px; }
    .penny-coin { font-size: 36px; }
    .penny-label { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; margin-top: 4px; }
    .arrow { display: inline; font-size: 28px; color: #4CAF50; }
    .penny-explanation { font-family: 'Fredoka', sans-serif; font-size: 18px; color: #FF6F00; margin-top: 16px; }
    .slider-card { text-align: center; padding: 32px; }
    .day-display { margin-bottom: 16px; }
    .day-label { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 700; color: #666; display: block; }
    .day-value { font-family: 'Fredoka', sans-serif; font-size: 48px; font-weight: 700; color: #FF6F00; }
    .day-slider {
      width: 100%;
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #C8E6C9, #4CAF50, #FFD54F, #FF9800, #F44336);
      -webkit-appearance: none;
      appearance: none;
      outline: none;
      margin: 12px 0;
    }
    .day-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      border: 4px solid #FF6F00;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .value-display { margin: 16px 0; }
    .penny-stack { font-size: 40px; display: block; }
    .value-text { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #2E7D32; display: block; margin-top: 8px; }
    .pile-visual {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
      margin-top: 16px;
      transition: transform 0.3s;
      min-height: 60px;
    }
    .pile-coin {
      font-size: 24px;
      animation: popIn 0.3s both;
    }
    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .predict-card { text-align: center; padding: 28px; }
    .predict-card h3 { margin-bottom: 8px; }
    .predict-question { font-size: 15px; margin-bottom: 16px; }
    .input-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .dollar-sign { font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #4CAF50; }
    .prediction-input {
      padding: 12px 20px;
      font-size: 24px;
      font-family: 'Fredoka', sans-serif;
      font-weight: 700;
      border: 3px solid #FFD54F;
      border-radius: 12px;
      width: 200px;
      text-align: center;
      outline: none;
    }
    .prediction-input:focus { border-color: #FFB300; box-shadow: 0 0 0 3px rgba(255,213,79,0.3); }
    .prediction-result {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      margin-top: 16px;
      text-align: left;
    }
    .prediction-result.correct { background: #E8F5E9; }
    .prediction-result.incorrect { background: #FFF3E0; }
    .result-icon { font-size: 32px; flex-shrink: 0; }
    .result-text p { margin: 0 0 6px; font-size: 14px; }
    .result-answer { font-family: 'Fredoka', sans-serif; font-size: 20px !important; color: #E65100; }
    .result-explanation { font-size: 13px; color: #888; }
    .graph-card {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 250px;
      padding: 16px 8px;
      overflow-x: auto;
    }
    .bar-container {
      flex: 1;
      min-width: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      position: relative;
    }
    .bar-fill {
      width: 100%;
      border-radius: 4px 4px 0 0;
      transition: height 0.5s ease;
      min-height: 2px;
    }
    .bar-label {
      font-family: 'Nunito', sans-serif;
      font-size: 10px;
      color: #888;
      margin-top: 4px;
      white-space: nowrap;
    }
    .key-insight { text-align: center; }
    .key-insight h3 { margin-bottom: 8px; }
    .key-insight p { margin-bottom: 6px; font-size: 15px; }
    @media (max-width: 480px) {
      .penny-coin { font-size: 24px; }
      .arrow { display: block; }
      .graph-card { height: 180px; }
    }
  `]
})
export class MoneyMagicComponent {
  protected started = false;
  protected showComplete = false;
  protected step = 'intro';
  protected sliderDay = 1;
  protected prediction = 0;
  protected showPredictionResult = false;
  protected isPredictionCorrect = false;
  protected score = 0;

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  get currentValue(): number {
    return Math.pow(2, this.sliderDay - 1) / 100;
  }

  get pennyStack(): string {
    const count = Math.min(this.sliderDay, 20);
    return '🪙'.repeat(Math.max(1, Math.floor(count / 2)));
  }

  get pileScale(): number {
    return Math.min(1 + this.sliderDay * 0.02, 2.5);
  }

  get coinPile(): number[] {
    const count = Math.min(this.sliderDay * 2, 30);
    return Array.from({ length: count }, (_, i) => i * 50);
  }

  get graphBars(): { day: number; value: number; height: number; color: string }[] {
    const maxVal = 5368709.12;
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const value = Math.pow(2, day - 1) / 100;
      const height = Math.max((value / maxVal) * 100, 1);
      const hue = Math.min(120 - (day / 30) * 120, 120);
      return { day, value, height, color: `hsl(${hue}, 70%, 50%)` };
    });
  }

  formatMoney(value: number): string {
    if (value < 1) return value.toFixed(2);
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  startGame(): void {
    this.started = true;
    this.audio.playClick();
  }

  updateDay(): void {
    this.audio.playCoin();
  }

  checkPrediction(): void {
    const answer = 5368709.12;
    const diff = Math.abs(this.prediction - answer);
    this.isPredictionCorrect = diff < answer * 0.2;
    this.showPredictionResult = true;

    if (this.isPredictionCorrect) {
      this.score = 50;
      this.profile.recordInvestmentScore(100);
      this.audio.playSuccess();
    } else {
      this.score = 25;
      this.profile.recordInvestmentScore(50);
      this.audio.playIncorrect();
    }
  }

  finishLesson(): void {
    this.profile.addScore(this.score);
    this.profile.addXp(100);
    this.profile.addBadge('Future Investor');
    this.profile.completeLesson('money-magic');
    this.audio.playBadge();
    this.showComplete = true;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
