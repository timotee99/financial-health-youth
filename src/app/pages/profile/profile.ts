import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { XpBarComponent } from '../../components/xp-bar/xp-bar';
import { BadgeComponent } from '../../components/badge/badge';
import { FinancialProfileService } from '../../services/financial-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, MoneyMikeComponent, XpBarComponent, BadgeComponent],
  template: `
    <div class="page-container profile-page">
      <h1>👤 My Profile</h1>

      <app-money-mike message="Here's a detailed look at your financial journey!" mood="happy">
      </app-money-mike>

      <app-xp-bar [currentXp]="profile.xp()" [maxXp]="profile.xpForNextLevel()"
                  [level]="profile.level()">
      </app-xp-bar>

      <section class="personality-section">
        <div class="personality-card">
          <span class="personality-emoji">{{ personalityEmoji }}</span>
          <h2>{{ profile.personality() }}</h2>
          <p>{{ profile.profile$().totalScore >= 100 ? 'Experienced' : 'Beginner' }} Money Manager</p>
        </div>
      </section>

      <section>
        <h2>📊 Detailed Stats</h2>
        <div class="stats-table card">
          @for (stat of stats; track stat.label) {
            <div class="stat-row">
              <span class="stat-label">{{ stat.label }}</span>
              <div class="stat-bar-track">
                <div class="stat-bar-fill" [style.width.%]="stat.percent" [style.background]="stat.color"></div>
              </div>
              <span class="stat-value">{{ stat.value }}</span>
            </div>
          }
        </div>
      </section>

      <section>
        <h2>📚 Completed Lessons</h2>
        <div class="lessons-list">
          @for (lesson of allLessons; track lesson.id) {
            <div class="lesson-row" [class.completed]="isCompleted(lesson.id)">
              <span class="lesson-emoji">{{ lesson.emoji }}</span>
              <span class="lesson-name">{{ lesson.name }}</span>
              <span class="lesson-status">{{ isCompleted(lesson.id) ? '✅' : '⏳' }}</span>
            </div>
          }
        </div>
      </section>

      @if (profile.badges().length > 0) {
        <section>
          <h2>🏆 Badges</h2>
          <div class="badges-grid">
            @for (badge of earnedBadges; track badge.name) {
              <app-badge [label]="badge.name" [emoji]="badge.emoji"
                         [color]="badge.color" [earned]="true">
              </app-badge>
            }
          </div>
        </section>
      }

      <section>
        <h2>💡 Earning Ideas</h2>
        <div class="ideas-list">
          @if (profile.profile$().earningIdeasChosen.length === 0) {
            <p class="no-data">No earning ideas chosen yet. Complete the Earn Money lesson!</p>
          }
          @for (idea of profile.profile$().earningIdeasChosen; track idea) {
            <div class="idea-chip">
              <span>💼</span> {{ idea }}
            </div>
          }
        </div>
      </section>

      <div class="action-buttons">
        <a class="btn-primary" routerLink="/" aria-label="Back to home">🏠 Home</a>
        <a class="btn-secondary" routerLink="/settings" aria-label="Go to settings">⚙️ Settings</a>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding-bottom: 40px; }
    h1 {
      font-family: 'Fredoka', sans-serif;
      font-size: 30px;
      text-align: center;
      margin-bottom: 16px;
    }
    h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 20px;
      margin: 16px 0 10px;
    }
    .personality-section { margin: 12px 0; }
    .personality-card {
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 20px;
      padding: 24px;
      text-align: center;
    }
    .personality-emoji { font-size: 48px; display: block; margin-bottom: 8px; }
    .personality-card h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 24px;
      color: #2E7D32;
      margin: 0;
    }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #666; margin-top: 4px; }
    .stats-table { padding: 16px; }
    .stat-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .stat-label {
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #555;
      min-width: 100px;
    }
    .stat-bar-track {
      flex: 1;
      height: 10px;
      background: #eee;
      border-radius: 6px;
      overflow: hidden;
    }
    .stat-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
    }
    .stat-value {
      font-family: 'Fredoka', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #333;
      min-width: 40px;
      text-align: right;
    }
    .lessons-list { display: flex; flex-direction: column; gap: 8px; }
    .lesson-row {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .lesson-row.completed { background: #F1F8E9; }
    .lesson-emoji { font-size: 24px; }
    .lesson-name {
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }
    .lesson-status { font-size: 20px; }
    .badges-grid {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .ideas-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .no-data { font-family: 'Nunito', sans-serif; font-size: 14px; color: #999; }
    .idea-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #E8F5E9;
      border-radius: 20px;
      padding: 8px 16px;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #2E7D32;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
      flex-wrap: wrap;
    }
  `]
})
export class ProfileComponent {
  constructor(protected profile: FinancialProfileService) {}

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

  allLessons = [
    { id: 'needs-vs-wants', name: 'Needs vs Wants', emoji: '🧐' },
    { id: 'save-spend-give', name: 'Save Spend Give', emoji: '🏦' },
    { id: 'wait-or-buy-now', name: 'Wait or Buy Now', emoji: '⏳' },
    { id: 'earn-money', name: 'Earn Money', emoji: '💼' },
    { id: 'money-magic', name: 'Money Magic', emoji: '✨' },
  ];

  isCompleted(id: string): boolean {
    return this.profile.completedLessons().includes(id);
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

  get stats() {
    const p = this.profile.profile$();
    const maxScore = 500;
    const maxItems = 10;
    return [
      {
        label: 'Total Score',
        value: p.totalScore,
        percent: Math.min((p.totalScore / maxScore) * 100, 100),
        color: '#4CAF50',
      },
      {
        label: 'Needs Identified',
        value: p.needsChoices,
        percent: Math.min((p.needsChoices / maxItems) * 100, 100),
        color: '#2196F3',
      },
      {
        label: 'Money Saved',
        value: '$' + p.savedMoney,
        percent: Math.min((p.savedMoney / 50) * 100, 100),
        color: '#4CAF50',
      },
      {
        label: 'Delayed Choices',
        value: p.delayedChoices,
        percent: Math.min((p.delayedChoices / 5) * 100, 100),
        color: '#FF9800',
      },
      {
        label: 'Earning Ideas',
        value: p.earningIdeasChosen.length,
        percent: Math.min((p.earningIdeasChosen.length / 5) * 100, 100),
        color: '#9C27B0',
      },
      {
        label: 'Investment Understanding',
        value: p.investmentUnderstandingScore + '%',
        percent: p.investmentUnderstandingScore,
        color: '#009688',
      },
    ];
  }
}
