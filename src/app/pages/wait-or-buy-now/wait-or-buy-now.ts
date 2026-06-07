import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { Scenario } from '../../interfaces/lesson.interface';

@Component({
  selector: 'app-wait-or-buy-now',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent],
  template: `
    <div class="page-container">
      @if (!started) {
        <div class="intro animate-slide-up">
          <app-money-mike message="Sometimes it's really hard to wait! But did you know that waiting can actually get you something BETTER? Let me explain!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <h2>⏳ What is Delayed Gratification?</h2>
            <p><strong>Delayed gratification</strong> means waiting to get something so you can get something better later. It's like choosing a small treat now OR a bigger, better treat if you wait!</p>
            <div class="compare-row">
              <div class="compare-box instant">
                <span class="compare-emoji">⚡</span>
                <h3>Buy Now</h3>
                <p>Get a small candy today</p>
                <span class="compare-label">Small reward NOW</span>
              </div>
              <span class="vs">VS</span>
              <div class="compare-box delayed">
                <span class="compare-emoji">⏳</span>
                <h3>Wait</h3>
                <p>Get a large candy pack next week</p>
                <span class="compare-label">Bigger reward LATER</span>
              </div>
            </div>
          </div>

          <div class="lesson-content card">
            <h2>Why Waiting is Powerful</h2>
            <div class="benefit-row">
              <div class="benefit">
                <span class="benefit-icon">🎁</span>
                <h4>Better Rewards</h4>
                <p>Waiting often means you can afford something bigger or better!</p>
              </div>
              <div class="benefit">
                <span class="benefit-icon">🧠</span>
                <h4>Smart Thinking</h4>
                <p>Taking time to decide helps you avoid impulse buys you might regret.</p>
              </div>
              <div class="benefit">
                <span class="benefit-icon">💰</span>
                <h4>Save Money</h4>
                <p>Waiting gives you time to compare prices and find better deals!</p>
              </div>
            </div>
          </div>

          <div class="lesson-content card key-points">
            <h2>Tips for Waiting</h2>
            <div class="rule-box">
              <span class="rule-icon">📝</span>
              <p><strong>Make a list.</strong> Write down what you want and wait 24 hours before buying. If you still want it tomorrow, it might be worth it!</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">🎯</span>
              <p><strong>Set a goal.</strong> Saving for something special feels amazing when you finally reach your goal!</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">🤔</span>
              <p>Ask yourself: <em>"Will I still be excited about this in a week?"</em> If not, it might not be worth buying.</p>
            </div>
          </div>

          <div class="ready-section">
            <button class="btn-primary" (click)="startGame()" aria-label="Practice waiting">
              🎮 Let's Practice Waiting!
            </button>
          </div>
        </div>
      }

      @if (started && !showSummary && !showComplete) {
        <div class="game-area">
          <div class="round-indicator">Round {{ currentRound + 1 }} of {{ scenarios.length }}</div>

          <div class="scenario-card animate-pop">
            <div class="scenario-header">
              <span class="scenario-emoji">{{ currentScenario.emoji }}</span>
              <h2>{{ currentScenario.title }}</h2>
            </div>
            <p class="scenario-desc">{{ currentScenario.description }}</p>

            <div class="choices">
              <button class="choice-btn instant" (click)="chooseInstant()" [disabled]="answered"
                      aria-label="Choose instant option">
                <span class="choice-emoji">⚡</span>
                <div class="choice-content">
                  <span class="choice-title">Buy Now</span>
                  <span class="choice-desc">{{ currentScenario.instantChoice }}</span>
                </div>
              </button>

              <button class="choice-btn delayed" (click)="chooseDelayed()" [disabled]="answered"
                      aria-label="Choose delayed option">
                <span class="choice-emoji">⏳</span>
                <div class="choice-content">
                  <span class="choice-title">Wait</span>
                  <span class="choice-desc">{{ currentScenario.delayedChoice }}</span>
                </div>
              </button>
            </div>

            @if (showFeedback) {
              <div class="feedback animate-pop" [class.good]="choseDelayed">
                <div class="feedback-icon">{{ choseDelayed ? '🎉' : '💭' }}</div>
                <div class="feedback-text">
                  <p>{{ choseDelayed ? currentScenario.delayedResult : currentScenario.instantResult }}</p>
                </div>
              </div>
            }

            @if (answered) {
              <button class="btn-secondary next-btn" (click)="nextRound()">
                {{ currentRound === scenarios.length - 1 ? 'See Results' : 'Next Round ➡️' }}
              </button>
            }
          </div>
        </div>
      }

      @if (showSummary) {
        <div class="summary animate-slide-up">
          <h2>⏳ Your Waiting Style</h2>

          <app-money-mike [message]="personalityMessage" [mood]="personalityMood"></app-money-mike>

          <div class="personality-card">
            <div class="personality-icon">{{ personalityIcon }}</div>
            <h3>{{ personalityTitle }}</h3>
            <p>{{ personalityDesc }}</p>
          </div>

          <div class="stats-row">
            <div class="stat"><span class="stat-value">{{ delayedCount }}</span><span class="stat-label">Times You Waited</span></div>
            <div class="stat"><span class="stat-value">{{ instantCount }}</span><span class="stat-label">Times You Chose Now</span></div>
          </div>

          <button class="btn-primary" (click)="finishLesson()" aria-label="Complete lesson">
            🎉 Complete Lesson
          </button>
        </div>
      }
    </div>

    @if (showComplete) {
      <app-lesson-complete lessonTitle="Wait or Buy Now"
        [message]="completeMessage"
        [xpEarned]="100" [score]="score"
        [badge]="earnedBadge" [badgeEmoji]="earnedBadgeEmoji"
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
    .compare-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 12px;
    }
    .compare-box {
      flex: 1;
      max-width: 200px;
      padding: 16px;
      border-radius: 16px;
      text-align: center;
    }
    .compare-box.instant { background: #FFF3E0; border: 3px solid #FF9800; }
    .compare-box.delayed { background: #E8F5E9; border: 3px solid #4CAF50; }
    .compare-emoji { font-size: 32px; display: block; margin-bottom: 4px; }
    .compare-box h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 0; }
    .compare-box.instant h3 { color: #E65100; }
    .compare-box.delayed h3 { color: #2E7D32; }
    .compare-box p { font-family: 'Nunito', sans-serif; font-size: 13px; color: #666; margin: 4px 0; }
    .compare-label {
      display: block;
      font-family: 'Nunito', sans-serif;
      font-size: 12px;
      font-weight: 700;
      margin-top: 8px;
    }
    .compare-box.instant .compare-label { color: #FF9800; }
    .compare-box.delayed .compare-label { color: #4CAF50; }
    .vs {
      font-family: 'Fredoka', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #999;
    }
    .benefit-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .benefit {
      text-align: center;
      padding: 12px;
      background: #F5F5F5;
      border-radius: 12px;
    }
    .benefit-icon { font-size: 28px; display: block; }
    .benefit h4 { font-family: 'Fredoka', sans-serif; font-size: 14px; color: #333; margin: 4px 0; }
    .benefit p { font-family: 'Nunito', sans-serif; font-size: 12px; color: #777; margin: 0; line-height: 1.4; }
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
      .compare-row { flex-direction: column; }
      .benefit-row { grid-template-columns: 1fr; }
    }
    .game-area { padding: 10px 0; }
    .round-indicator {
      text-align: center;
      font-family: 'Nunito', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #666;
      margin-bottom: 16px;
    }
    .scenario-card {
      background: white;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      max-width: 560px;
      margin: 0 auto;
    }
    .scenario-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .scenario-emoji { font-size: 40px; }
    .scenario-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #333; margin: 0; }
    .scenario-desc {
      font-family: 'Nunito', sans-serif;
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .choices { display: flex; flex-direction: column; gap: 12px; }
    .choice-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 16px;
      border: 3px solid transparent;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .choice-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .choice-btn:disabled { opacity: 0.5; cursor: default; }
    .choice-btn.instant { border-color: #FF9800; }
    .choice-btn.instant:hover:not(:disabled) { background: #FFF3E0; }
    .choice-btn.delayed { border-color: #4CAF50; }
    .choice-btn.delayed:hover:not(:disabled) { background: #E8F5E9; }
    .choice-emoji { font-size: 32px; flex-shrink: 0; }
    .choice-content { display: flex; flex-direction: column; }
    .choice-title { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #333; }
    .choice-desc { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; }
    .feedback {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 16px;
      padding: 14px;
      border-radius: 12px;
    }
    .feedback.good { background: #E8F5E9; border-left: 4px solid #4CAF50; }
    .feedback:not(.good) { background: #FFF3E0; border-left: 4px solid #FF9800; }
    .feedback-icon { font-size: 24px; flex-shrink: 0; }
    .feedback-text p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin: 0; line-height: 1.5; }
    .next-btn { margin-top: 16px; }
    .summary { text-align: center; padding: 20px 0; }
    .summary h2 { font-family: 'Fredoka', sans-serif; font-size: 28px; }
    .personality-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin: 16px 0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .personality-icon { font-size: 56px; margin-bottom: 8px; }
    .personality-card h3 { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #333; }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #666; margin-top: 8px; }
    .stats-row {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0;
    }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #FF6F00; }
    .stat-label { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; font-weight: 600; }
  `]
})
export class WaitOrBuyNowComponent {
  protected started = false;
  protected showSummary = false;
  protected showComplete = false;
  protected answered = false;
  protected showFeedback = false;
  protected choseDelayed = false;
  protected currentRound = 0;
  protected delayedCount = 0;
  protected instantCount = 0;
  protected score = 0;

  protected earnedBadge = '';
  protected earnedBadgeEmoji = '';

  scenarios: (Scenario & { emoji: string })[] = [
    {
      id: 'candy', title: 'The Candy Choice', emoji: '🍬',
      description: 'You have $5. You can buy a small candy bar today, or wait one week and get a LARGE candy pack with more pieces!',
      instantChoice: 'Small candy bar today',
      delayedChoice: 'Wait a week for large candy pack',
      instantResult: 'The small candy was good, but it was gone in 2 minutes! Maybe waiting would have been better?',
      delayedResult: 'You waited a week and got a big candy pack! It lasted much longer and you shared with friends!',
    },
    {
      id: 'toy', title: 'The Toy Decision', emoji: '🧸',
      description: 'You see a small toy car for $10 at the store. But if you save your allowance for 2 more weeks, you can buy the deluxe racing set for $25!',
      instantChoice: 'Small toy car today',
      delayedChoice: 'Save for 2 weeks for deluxe racing set',
      instantResult: 'The toy car is fun, but now you don\'t have enough for the racing set.',
      delayedResult: 'You saved for 2 weeks and got the deluxe racing set! It has so many cool features!',
    },
    {
      id: 'game', title: 'The Game Dilemma', emoji: '🎮',
      description: 'A new video game costs $40. You have $20. You could buy a cheaper game today for $15, or save for 3 more weeks to buy the one you really want!',
      instantChoice: 'Cheap game today',
      delayedChoice: 'Save 3 weeks for the game you want',
      instantResult: 'The cheap game was okay, but you still wish you had the cool one.',
      delayedResult: 'You saved patiently and got the game you really wanted! It was worth the wait!',
    },
    {
      id: 'bike', title: 'The Bike Choice', emoji: '🚲',
      description: 'Your neighbor is selling an old bike for $30. But if you save for 2 months, you can get a brand new bike with cool accessories for $80!',
      instantChoice: 'Buy used bike today',
      delayedChoice: 'Save 2 months for new bike',
      instantResult: 'The used bike works, but it\'s a bit rusty and the bell doesn\'t work.',
      delayedResult: 'You saved for 2 months and got an awesome new bike with a bell, basket, and shiny paint!',
    },
  ];

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  get currentScenario() {
    return this.scenarios[this.currentRound];
  }

  get personalityMessage(): string {
    if (this.delayedCount >= 3) return 'You are a Super Saver! You know that waiting leads to better things! 🌟';
    if (this.delayedCount >= 2) return 'You\'re a Balanced Thinker! You know when to wait and when to enjoy now! ⚖️';
    return 'You like getting things right away sometimes. That\'s okay! Try practicing waiting for something special! 💪';
  }

  get personalityMood(): 'happy' | 'thinking' | 'celebrate' {
    if (this.delayedCount >= 3) return 'celebrate';
    if (this.delayedCount >= 2) return 'happy';
    return 'thinking';
  }

  get personalityTitle(): string {
    if (this.delayedCount >= 3) return 'Super Saver 🦸';
    if (this.delayedCount >= 2) return 'Balanced Thinker ⚖️';
    return 'Quick Spender ⚡';
  }

  get personalityDesc(): string {
    if (this.delayedCount >= 3) return 'You have incredible patience! You understand that waiting can lead to bigger and better rewards. Keep up the great self-control!';
    if (this.delayedCount >= 2) return 'You have a good balance! Sometimes you wait for better things, and sometimes you enjoy now. That\'s a smart approach!';
    return 'You enjoy getting things right away, and that\'s okay! Try to practice waiting a little bit longer next time - the reward might be even better!';
  }

  get personalityIcon(): string {
    if (this.delayedCount >= 3) return '🦸';
    if (this.delayedCount >= 2) return '⚖️';
    return '⚡';
  }

  get completeMessage(): string {
    if (this.delayedCount >= 3) return 'You chose to wait most of the time! That shows amazing self-control. Waiting can lead to better rewards!';
    if (this.delayedCount >= 2) return 'You found a great balance between waiting and enjoying now. Smart thinking!';
    return 'Remember, sometimes waiting a little bit can get you something even better. Keep practicing!';
  }

  startGame(): void {
    this.started = true;
    this.audio.playClick();
  }

  chooseInstant(): void {
    if (this.answered) return;
    this.answered = true;
    this.showFeedback = true;
    this.choseDelayed = false;
    this.instantCount++;
    this.audio.playClick();
    this.profile.recordGratificationChoice(false);
  }

  chooseDelayed(): void {
    if (this.answered) return;
    this.answered = true;
    this.showFeedback = true;
    this.choseDelayed = true;
    this.delayedCount++;
    this.score += 10;
    this.audio.playSuccess();
    this.profile.recordGratificationChoice(true);
  }

  nextRound(): void {
    if (this.currentRound >= this.scenarios.length - 1) {
      this.showSummary = true;
    } else {
      this.currentRound++;
      this.answered = false;
      this.showFeedback = false;
    }
  }

  finishLesson(): void {
    const badge = this.delayedCount >= 3 ? 'Super Saver' :
                  this.delayedCount >= 2 ? 'Balanced Thinker' : 'Quick Spender';
    this.earnedBadge = badge;
    this.earnedBadgeEmoji = this.delayedCount >= 3 ? '🦸' :
                           this.delayedCount >= 2 ? '⚖️' : '⚡';

    this.profile.addScore(this.score);
    this.profile.addXp(100);
    this.profile.addBadge(badge);
    this.profile.completeLesson('wait-or-buy-now');
    this.audio.playBadge();
    this.showComplete = true;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
