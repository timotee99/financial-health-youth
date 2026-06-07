import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { XpBarComponent } from '../../components/xp-bar/xp-bar';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { JobOpportunity } from '../../interfaces/lesson.interface';

@Component({
  selector: 'app-earn-money',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent, XpBarComponent],
  template: `
    <div class="page-container">
      @if (!started) {
        <div class="intro animate-slide-up">
          <app-money-mike message="Money doesn't grow on trees! You earn it by helping others and solving problems. Let me show you how!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <h2>💡 How Do People Earn Money?</h2>
            <p>People earn money by providing value to others. When you help someone solve a problem or do something they can't do themselves, they pay you for your help!</p>
          </div>

          <div class="lesson-content card">
            <h2>🔑 The Secret Formula</h2>
            <div class="formula-row">
              <div class="formula-step">
                <span class="step-num">1</span>
                <span class="step-text">Find a problem</span>
              </div>
              <span class="formula-arrow">➡️</span>
              <div class="formula-step">
                <span class="step-num">2</span>
                <span class="step-text">Offer to help</span>
              </div>
              <span class="formula-arrow">➡️</span>
              <div class="formula-step">
                <span class="step-num">3</span>
                <span class="step-text">Get paid!</span>
              </div>
            </div>
          </div>

          <div class="lesson-content card">
            <h2>💰 Ways Kids Can Earn Money</h2>
            <div class="earn-ideas-grid">
              <div class="earn-idea"><span class="ei-icon">🐕</span><span>Dog Walking</span></div>
              <div class="earn-idea"><span class="ei-icon">🌿</span><span>Yard Work</span></div>
              <div class="earn-idea"><span class="ei-icon">🍋</span><span>Lemonade Stand</span></div>
              <div class="earn-idea"><span class="ei-icon">🧹</span><span>Cleaning</span></div>
              <div class="earn-idea"><span class="ei-icon">📚</span><span>Tutoring</span></div>
              <div class="earn-idea"><span class="ei-icon">👶</span><span>Babysitting</span></div>
              <div class="earn-idea"><span class="ei-icon">🎨</span><span>Sell Art</span></div>
              <div class="earn-idea"><span class="ei-icon">♻️</span><span>Recycle</span></div>
            </div>
          </div>

          <div class="lesson-content card key-points">
            <h2>Remember This</h2>
            <div class="rule-box">
              <span class="rule-icon">💪</span>
              <p><strong>The more value you provide, the more you can earn.</strong> Think about what skills you have and how you can help others!</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">🌟</span>
              <p><strong>Always do your best work.</strong> Happy customers will recommend you to others!</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">🛡️</span>
              <p><strong>Safety first!</strong> Always check with your parents before starting any job, and never talk to strangers alone.</p>
            </div>
          </div>

          <div class="ready-section">
            <button class="btn-primary" (click)="startGame()" aria-label="Explore jobs in the city">
              🗺️ Explore the City!
            </button>
          </div>
        </div>
      }

      @if (started && !showSummary && !showComplete) {
        <div class="game-area">
          <app-xp-bar [currentXp]="0" [maxXp]="200" [level]="1"></app-xp-bar>

          <div class="wallet-display" aria-live="polite">
            <span class="wallet-icon">👛</span>
            <span class="wallet-label">Your Wallet:</span>
            <span class="wallet-amount">{{ '$' + totalEarned }}</span>
            <span class="wallet-target">Goal: $20</span>
          </div>

          <app-money-mike message="Click on a job to learn more. Choose jobs to earn $20!" mood="thinking">
          </app-money-mike>

          <div class="city-map" role="region" aria-label="Interactive city map with job opportunities">
            @for (job of jobs; track job.id) {
              <button class="job-card" [class.selected]="selectedJobs().includes(job.id)"
                      [class.disabled]="totalEarned >= 20"
                      (click)="selectJob(job)" [disabled]="totalEarned >= 20"
                      [attr.aria-label]="job.title + ': Earn $' + job.earnings">
                <div class="job-emoji">{{ job.emoji }}</div>
                <div class="job-info">
                  <h3>{{ job.title }}</h3>
                  <p class="job-problem">{{ job.problem }}</p>
                  <p class="job-work">💪 {{ job.work }}</p>
                </div>
                <div class="job-earnings">
                  <span class="earn-icon">💰</span>
                  <span class="earn-amount">{{ '+$' + job.earnings }}</span>
                </div>
                @if (selectedJobs().includes(job.id)) {
                  <div class="check-mark">✅</div>
                }
              </button>
            }
          </div>

          @if (totalEarned >= 20) {
            <div class="goal-reached animate-pop">
              <span class="goal-emoji">🎯</span>
              <p>Goal reached! You earned {{ '$' + totalEarned }}!</p>
              <button class="btn-primary" (click)="finishWork()" aria-label="Finish and see summary">
                ✅ Finish Working
              </button>
            </div>
          }
        </div>
      }

      @if (showSummary) {
        <div class="summary animate-slide-up">
          <h2>💼 Your Earning Adventure</h2>

          <app-money-mike [message]="summaryMessage" mood="celebrate"></app-money-mike>

          <div class="wallet-growth">
            <div class="wallet-before">$0</div>
            <div class="growth-arrow">➡️</div>
            <div class="wallet-after">{{ '$' + totalEarned }}</div>
          </div>

          <div class="jobs-completed card">
            <h3>📋 Jobs You Did</h3>
            @for (jobId of selectedJobs(); track jobId) {
              <div class="job-result">
                <span>{{ getJob(jobId)?.emoji }}</span>
                <span>{{ getJob(jobId)?.title }} - {{ '$' + (getJob(jobId)?.earnings ?? 0) }}</span>
              </div>
            }
            <div class="total-row">
              <span>Total Earned:</span>
              <span class="total-amount">{{ '$' + totalEarned }}</span>
            </div>
          </div>

          <div class="lesson-learned card">
            <h3>💡 What We Learned</h3>
            <p>Money is earned by helping others! When you solve problems for people, they pay you for your help.</p>
            <p>Ideas for earning money:</p>
            <ul>
              <li>Help neighbors with yard work</li>
              <li>Walk dogs or pet sit</li>
              <li>Set up a lemonade stand</li>
              <li>Help with cleaning or organizing</li>
              <li>Babysit younger children</li>
            </ul>
          </div>

          <button class="btn-primary" (click)="finishLesson()" aria-label="Complete lesson">
            🎉 Complete Lesson
          </button>
        </div>
      }
    </div>

    @if (showComplete) {
      <app-lesson-complete lessonTitle="Earn Money"
        [message]="completeMsg"
        [xpEarned]="100" [score]="totalEarned * 2"
        badge="Young Entrepreneur" badgeEmoji="💼"
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
    .formula-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 10px 0;
    }
    .formula-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .step-num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #4CAF50;
      color: white;
      border-radius: 50%;
      font-family: 'Fredoka', sans-serif;
      font-size: 18px;
      font-weight: 700;
    }
    .step-text {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #555;
    }
    .formula-arrow { font-size: 20px; color: #FFD54F; }
    .earn-ideas-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 10px;
    }
    .earn-idea {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #E8F5E9;
      border-radius: 12px;
      padding: 8px 12px;
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #2E7D32;
    }
    .ei-icon { font-size: 18px; }
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
      .formula-row { flex-direction: column; }
      .earn-ideas-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .game-area { padding: 10px 0; }
    .wallet-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 16px;
      padding: 14px 20px;
      margin: 12px 0;
    }
    .wallet-icon { font-size: 28px; }
    .wallet-label { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600; color: #2E7D32; }
    .wallet-amount { font-family: 'Fredoka', sans-serif; font-size: 26px; font-weight: 700; color: #1B5E20; }
    .wallet-target { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #888; margin-left: 8px; }
    .city-map { display: flex; flex-direction: column; gap: 12px; margin: 12px 0; }
    .job-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: all 0.2s;
      border: 3px solid transparent;
      text-align: left;
      width: 100%;
      font-family: inherit;
      position: relative;
    }
    .job-card:hover:not(:disabled) {
      transform: translateX(4px);
      border-color: #FFD54F;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .job-card.selected {
      border-color: #4CAF50;
      background: #F1F8E9;
    }
    .job-card.disabled {
      opacity: 0.5;
      cursor: default;
    }
    .job-emoji { font-size: 40px; flex-shrink: 0; width: 50px; text-align: center; }
    .job-info { flex: 1; }
    .job-info h3 {
      font-family: 'Fredoka', sans-serif;
      font-size: 18px;
      color: #333;
      margin: 0;
    }
    .job-problem {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      color: #888;
      margin: 2px 0;
    }
    .job-work {
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      color: #555;
      font-weight: 600;
      margin: 2px 0 0;
    }
    .job-earnings {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .earn-icon { font-size: 20px; }
    .earn-amount {
      font-family: 'Fredoka', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #4CAF50;
    }
    .check-mark {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 20px;
    }
    .goal-reached {
      text-align: center;
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 20px;
      padding: 24px;
      margin: 16px 0;
    }
    .goal-emoji { font-size: 48px; display: block; margin-bottom: 8px; }
    .goal-reached p { font-family: 'Fredoka', sans-serif; font-size: 20px; color: #2E7D32; margin-bottom: 12px; }
    .summary { text-align: center; padding: 20px 0; }
    .wallet-growth {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 16px 0;
    }
    .wallet-before, .wallet-after {
      font-family: 'Fredoka', sans-serif;
      font-size: 28px;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 12px;
    }
    .wallet-before { background: #F5F5F5; color: #999; }
    .wallet-after { background: linear-gradient(135deg, #FFD54F, #FFB300); color: #5D4037; }
    .growth-arrow { font-size: 24px; }
    .jobs-completed { text-align: left; }
    .jobs-completed h3 { margin-bottom: 8px; }
    .job-result {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      color: #555;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 2px solid #E8E8E8;
      font-family: 'Fredoka', sans-serif;
      font-size: 18px;
      font-weight: 700;
    }
    .total-amount { color: #4CAF50; }
    .lesson-learned { text-align: left; }
    .lesson-learned h3 { margin-bottom: 8px; }
    .lesson-learned p { margin-bottom: 6px; font-size: 14px; }
    .lesson-learned ul { margin-left: 20px; }
    .lesson-learned li { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin: 4px 0; }
  `]
})
export class EarnMoneyComponent {
  protected started = false;
  protected showSummary = false;
  protected showComplete = false;

  protected selectedJobs = signal<string[]>([]);
  protected totalEarned = 0;

  jobs: JobOpportunity[] = [
    { id: 'dog', title: 'Dog Walking', emoji: '🐕', problem: 'Mrs. Smith hurt her ankle and can\'t walk her dog, Max.', work: 'Walk Max for 30 minutes every day after school', earnings: 5 },
    { id: 'yard', title: 'Yard Work', emoji: '🌿', problem: 'Mr. Johnson\'s yard is overgrown with weeds.', work: 'Pull weeds and water the garden', earnings: 7 },
    { id: 'lemonade', title: 'Lemonade Stand', emoji: '🍋', problem: 'It\'s a hot summer day and people are thirsty!', work: 'Set up a stand and sell lemonade to neighbors', earnings: 6 },
    { id: 'garage', title: 'Garage Cleanup', emoji: '🏠', problem: 'The Garcia family\'s garage is too cluttered to park their car.', work: 'Help organize boxes, sweep, and sort items', earnings: 8 },
    { id: 'babysit', title: 'Babysitting Helper', emoji: '👶', problem: 'Ms. Lee needs help watching her 6-year-old twins for 2 hours.', work: 'Play games, read stories, and make snacks', earnings: 6 },
  ];

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  get summaryMessage(): string {
    if (this.totalEarned >= 25) return 'Wow! You earned way more than your goal! You\'re a natural entrepreneur! 🌟';
    return 'Great job helping your community! You earned money while making people happy! 👏';
  }

  getJob(id: string): JobOpportunity | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  startGame(): void {
    this.started = true;
    this.audio.playClick();
  }

  selectJob(job: JobOpportunity): void {
    if (this.totalEarned >= 20) return;
    if (this.selectedJobs().includes(job.id)) return;

    this.selectedJobs.update((prev) => [...prev, job.id]);
    this.totalEarned += job.earnings;
    this.profile.recordEarningIdea(job.title);
    this.audio.playCoin();
  }

  get completeMsg(): string {
    return `You earned $${this.totalEarned} by helping others! That's what being a Young Entrepreneur is all about!`;
  }

  finishWork(): void {
    this.showSummary = true;
    this.audio.playSuccess();
  }

  finishLesson(): void {
    this.profile.addScore(this.totalEarned * 2);
    this.profile.addXp(100);
    this.profile.addBadge('Young Entrepreneur');
    this.profile.completeLesson('earn-money');
    this.audio.playBadge();
    this.showComplete = true;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
