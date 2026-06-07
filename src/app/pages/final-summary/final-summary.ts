import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { BadgeComponent } from '../../components/badge/badge';
import { XpBarComponent } from '../../components/xp-bar/xp-bar';
import { FinancialProfileService } from '../../services/financial-profile.service';

@Component({
  selector: 'app-final-summary',
  standalone: true,
  imports: [RouterLink, MoneyMikeComponent, BadgeComponent, XpBarComponent],
  template: `
    <div class="page-container summary-page">
      <header class="summary-header">
        <span class="grad-icon">🎓</span>
        <h1>Your Financial Personality</h1>
      </header>

      <app-xp-bar [currentXp]="profile.xp()" [maxXp]="profile.xpForNextLevel()"
                  [level]="profile.level()">
      </app-xp-bar>

      <div class="personality-card animate-pop">
        <div class="personality-icon">{{ personalityEmoji }}</div>
        <h2>{{ profile.personality() }}</h2>
        <p>{{ personalityDescription }}</p>
      </div>

      <app-money-mike [message]="mikeMessage" mood="celebrate"></app-money-mike>

      <section class="scores-section">
        <h2>Your Scores</h2>
        <div class="score-grid">
          <div class="score-item">
            <span class="score-emoji">🎯</span>
            <span class="score-val">{{ profile.totalScore() }}</span>
            <span class="score-lbl">Total Score</span>
          </div>
          <div class="score-item">
            <span class="score-emoji">📖</span>
            <span class="score-val">{{ profile.completedLessons().length }}/6</span>
            <span class="score-lbl">Lessons</span>
          </div>
          <div class="score-item">
            <span class="score-emoji">🏆</span>
            <span class="score-val">{{ profile.badges().length }}</span>
            <span class="score-lbl">Badges</span>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2>Financial Habits</h2>
        <div class="habits-grid">
          <div class="habit">
            <span class="habit-icon">💧</span>
            <span class="habit-lbl">Needs Chosen</span>
            <span class="habit-val green">{{ profile.profile$().needsChoices }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">🌟</span>
            <span class="habit-lbl">Wants Chosen</span>
            <span class="habit-val blue">{{ profile.profile$().wantsChoices }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">🏦</span>
            <span class="habit-lbl">Saved</span>
            <span class="habit-val green">{{ '$' + profile.profile$().savedMoney }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">🛒</span>
            <span class="habit-lbl">Spent</span>
            <span class="habit-val blue">{{ '$' + profile.profile$().spentMoney }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">❤️</span>
            <span class="habit-lbl">Donated</span>
            <span class="habit-val pink">{{ '$' + profile.profile$().donatedMoney }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">⏳</span>
            <span class="habit-lbl">Delayed Choices</span>
            <span class="habit-val green">{{ profile.profile$().delayedChoices }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">⚡</span>
            <span class="habit-lbl">Instant Choices</span>
            <span class="habit-val orange">{{ profile.profile$().instantChoices }}</span>
          </div>
          <div class="habit">
            <span class="habit-icon">💼</span>
            <span class="habit-lbl">Earning Ideas</span>
            <span class="habit-val purple">{{ profile.profile$().earningIdeasChosen.length }}</span>
          </div>
        </div>
      </section>

      @if (profile.badges().length > 0) {
        <section class="badges-section">
          <h2>Badges Earned</h2>
          <div class="badges-row">
            @for (badge of earnedBadges; track badge.name) {
              <app-badge [label]="badge.name" [emoji]="badge.emoji"
                         [color]="badge.color" [earned]="true">
              </app-badge>
            }
          </div>
        </section>
      }

      <section class="certificate-section">
        <div class="certificate" id="certificate">
          <div class="cert-border">
            <div class="cert-header">
              <span class="cert-seal">🎓</span>
              <h2>Money Adventure Academy</h2>
              <h3>Certificate of Graduation</h3>
            </div>
            <div class="cert-body">
              <p class="cert-awarded">This certificate is proudly awarded to</p>
              <p class="cert-name">Money Adventurer</p>
              <p class="cert-date">{{ today }}</p>
              <p class="cert-personality">Financial Personality: <strong>{{ profile.personality() }}</strong></p>
              <div class="cert-badges">
                @for (badge of profile.badges(); track badge) {
                  <span class="cert-badge">{{ badge }}</span>
                }
              </div>
            </div>
            <div class="cert-footer">
              <span class="cert-signature">Money Mike</span>
              <span class="cert-title">Financial Guide</span>
            </div>
          </div>
        </div>
        <button class="btn-gold print-btn" (click)="printCertificate()" aria-label="Print certificate">
          🖨️ Print Certificate
        </button>
      </section>

      <div class="action-buttons">
        <a class="btn-primary" routerLink="/" aria-label="Back to home">
          🏠 Back to Home
        </a>
      </div>
    </div>
  `,
  styles: [`
    .summary-page { padding-bottom: 40px; }
    .summary-header { text-align: center; padding: 20px 0; }
    .summary-header h1 {
      font-family: 'Fredoka', sans-serif;
      font-size: 30px;
      background: linear-gradient(135deg, #4CAF50, #2196F3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .grad-icon { font-size: 56px; display: block; margin-bottom: 8px; }
    .personality-card {
      background: linear-gradient(135deg, #FFF8E1, #FFE082);
      border-radius: 24px;
      padding: 28px;
      text-align: center;
      margin: 16px 0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .personality-icon { font-size: 64px; margin-bottom: 8px; }
    .personality-card h2 { font-family: 'Fredoka', sans-serif; font-size: 26px; color: #E65100; }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #5D4037; margin-top: 8px; }
    .scores-section, .detail-section, .badges-section { margin: 24px 0; }
    h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #333; margin-bottom: 12px; }
    .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .score-item {
      background: white; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .score-emoji { font-size: 28px; display: block; }
    .score-val { display: block; font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #4CAF50; margin: 4px 0; }
    .score-lbl { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; }
    .habits-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .habit {
      background: white; border-radius: 14px; padding: 14px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .habit-icon { font-size: 24px; display: block; }
    .habit-lbl { display: block; font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; margin: 4px 0; font-weight: 600; }
    .habit-val { display: block; font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; }
    .habit-val.green { color: #4CAF50; }
    .habit-val.blue { color: #2196F3; }
    .habit-val.pink { color: #E91E63; }
    .habit-val.orange { color: #FF9800; }
    .habit-val.purple { color: #9C27B0; }
    .badges-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
    .certificate-section { margin: 24px 0; text-align: center; }
    .certificate { background: white; border-radius: 20px; padding: 24px; margin: 16px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
    .cert-border { border: 4px solid #FFD54F; border-radius: 16px; padding: 32px 24px; }
    .cert-header { text-align: center; margin-bottom: 16px; }
    .cert-seal { font-size: 48px; display: block; margin-bottom: 8px; }
    .cert-header h2 { font-family: 'Fredoka', sans-serif; font-size: 24px; color: #4CAF50; margin: 0; }
    .cert-header h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; color: #FF6F00; margin: 4px 0; }
    .cert-body { text-align: center; }
    .cert-awarded { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; }
    .cert-name { font-family: 'Fredoka', sans-serif; font-size: 28px; color: #333; margin: 8px 0; }
    .cert-date { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; }
    .cert-personality { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; margin: 8px 0; }
    .cert-badges { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
    .cert-badge { background: #FFF8E1; border: 2px solid #FFD54F; border-radius: 20px; padding: 4px 14px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #E65100; }
    .cert-footer { display: flex; flex-direction: column; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 2px dashed #E0E0E0; }
    .cert-signature { font-family: 'Fredoka', sans-serif; font-size: 20px; color: #2196F3; }
    .cert-title { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; }
    .print-btn { margin-top: 12px; }
    .action-buttons { text-align: center; margin-top: 24px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
    @media (max-width: 600px) {
      .habits-grid { grid-template-columns: repeat(2, 1fr); }
      .score-grid { grid-template-columns: 1fr; }
      .cert-name { font-size: 22px; }
    }
  `]
})
export class FinalSummaryComponent {
  protected readonly profile: FinancialProfileService;
  protected today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  constructor(profile: FinancialProfileService) {
    this.profile = profile;
  }

  get personalityEmoji(): string {
    const emojis: Record<string, string> = {
      'Smart Saver': '🏦',
      'Generous Giver': '❤️',
      'Future Investor': '📈',
      'Entrepreneur': '💼',
      'Balanced Money Manager': '⚖️',
    };
    return emojis[this.profile.personality()] || '🎓';
  }

  get personalityDescription(): string {
    const descs: Record<string, string> = {
      'Smart Saver': 'You have strong savings habits! You know the importance of putting money aside for the future. Keep it up!',
      'Generous Giver': 'You have a generous heart! Giving to others and sharing your resources makes the world a better place.',
      'Future Investor': 'You understand how money can grow over time! You\'re thinking ahead and that\'s a superpower!',
      'Entrepreneur': 'You have a strong earning mindset! You see opportunities everywhere and know how to create value.',
      'Balanced Money Manager': 'You make well-rounded financial decisions! You know how to save, spend, and give wisely.',
    };
    return descs[this.profile.personality()] || 'You are on your way to becoming a money master!';
  }

  get mikeMessage(): string {
    return `Congratulations! You've completed the Money Adventure Academy! You're a ${this.profile.personality()}! Keep learning and growing your money skills! 🌟`;
  }

  get earnedBadges() {
    const allBadges: Record<string, { name: string; emoji: string; color: string }> = {
      'Need Detective': { name: 'Need Detective', emoji: '🔍', color: '#2196F3' },
      'Save Star': { name: 'Save Star', emoji: '⭐', color: '#4CAF50' },
      'Spend Smart': { name: 'Spend Smart', emoji: '🛒', color: '#FF9800' },
      'Give Heart': { name: 'Give Heart', emoji: '❤️', color: '#E91E63' },
      'Super Saver': { name: 'Super Saver', emoji: '🦸', color: '#9C27B0' },
      'Balanced Thinker': { name: 'Balanced Thinker', emoji: '⚖️', color: '#607D8B' },
      'Quick Spender': { name: 'Quick Spender', emoji: '⚡', color: '#FF5722' },
      'Young Entrepreneur': { name: 'Young Entrepreneur', emoji: '💼', color: '#795548' },
      'Future Investor': { name: 'Future Investor', emoji: '📈', color: '#009688' },
    };
    return this.profile.badges().map((b) => allBadges[b]).filter(Boolean);
  }

  printCertificate(): void {
    window.print();
  }
}
