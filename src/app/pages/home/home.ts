import { Component, HostListener, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { XpBarComponent } from '../../components/xp-bar/xp-bar';
import { BadgeComponent } from '../../components/badge/badge';
import { FinancialProfileService } from '../../services/financial-profile.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MoneyMikeComponent, XpBarComponent, BadgeComponent],
  template: `
    <div class="page-container home-page">
      <header class="hero">
        <div class="hero-icon">💰</div>
        <h1>Money Adventure Academy</h1>
        <p class="hero-subtitle">Learn to be a money hero with Money Mike!</p>
      </header>

      <app-xp-bar [currentXp]="profile.xp()" [maxXp]="profile.xpForNextLevel()"
                  [level]="profile.level()">
      </app-xp-bar>

      <app-money-mike message="Hey there! 👋 I'm Money Mike! Ready to become a money master? Let's learn how to save, spend wisely, and make your money grow!" mood="happy" size="large">
      </app-money-mike>

      <section class="lessons-section">
        <h2>📚 Lessons</h2>
        <div class="lessons-grid">
          @for (lesson of lessons; track lesson.id) {
            <a class="lesson-card" [routerLink]="lesson.route"
               [class.completed]="isCompleted(lesson.id)"
               [attr.aria-label]="lesson.title + (isCompleted(lesson.id) ? ' (completed)' : '')">
              <div class="lesson-icon">{{ lesson.emoji }}</div>
              <div class="lesson-info">
                <h3>{{ lesson.title }}</h3>
                <p>{{ lesson.description }}</p>
              </div>
              <div class="lesson-status">
                @if (isCompleted(lesson.id)) {
                  <span class="completed-badge" aria-label="Completed">✅</span>
                } @else {
                  <span class="pending-badge">➕</span>
                }
              </div>
              <div class="lesson-xp">
                <span class="xp-icon">⭐</span>
                {{ lesson.xp }} XP
              </div>
            </a>
          }
        </div>
      </section>

      <section class="stats-section">
        <h2>🏅 Your Progress</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <span class="stat-number">{{ profile.totalScore() }}</span>
            <span class="stat-desc">Total Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <span class="stat-number">{{ profile.badges().length }}</span>
            <span class="stat-desc">Badges Earned</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📖</span>
            <span class="stat-number">{{ profile.completedLessons().length }}/6</span>
            <span class="stat-desc">Lessons Done</span>
          </div>
        </div>
      </section>

      @if (profile.badges().length > 0) {
        <section class="badges-section">
          <h2>🎖️ Your Badges</h2>
          <div class="badges-row">
            @for (badge of earnedBadges; track badge.name) {
              <app-badge [label]="badge.name" [emoji]="badge.emoji"
                         [color]="badge.color" [earned]="true">
              </app-badge>
            }
          </div>
        </section>
      }

      <div class="action-buttons">
        <a class="btn-gold" routerLink="/final-summary" aria-label="View your final summary">
          📊 View My Profile
        </a>
        <a class="btn-secondary" routerLink="/settings" aria-label="Open settings">
          ⚙️ Settings
        </a>
      </div>
    </div>
  `,
  styles: [`
    .home-page { padding-bottom: 40px; }
    .hero {
      text-align: center;
      padding: 24px 0 16px;
    }
    .hero-icon {
      font-size: 64px;
      margin-bottom: 8px;
      animation: float 3s ease-in-out infinite;
    }
    .hero h1 {
      font-family: 'Fredoka', sans-serif;
      font-size: 36px;
      background: linear-gradient(135deg, #4CAF50, #2196F3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }
    .hero-subtitle {
      font-family: 'Nunito', sans-serif;
      font-size: 18px;
      color: #666;
      margin-top: 8px;
    }
    .lessons-section, .stats-section, .badges-section {
      margin: 24px 0;
    }
    .lessons-section h2, .stats-section h2, .badges-section h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 24px;
      color: #333;
      margin-bottom: 16px;
    }
    .lessons-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .lesson-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: white;
      border-radius: 16px;
      padding: 16px 20px;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border: 3px solid transparent;
    }
    .lesson-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      border-color: #FFD54F;
    }
    .lesson-card.completed {
      border-color: #C8E6C9;
      background: #F1F8E9;
    }
    .lesson-icon {
      font-size: 40px;
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFF8E1;
      border-radius: 12px;
    }
    .lesson-info { flex: 1; }
    .lesson-info h3 {
      font-family: 'Fredoka', sans-serif;
      font-size: 18px;
      color: #333;
      margin: 0;
    }
    .lesson-info p {
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      color: #888;
      margin: 2px 0 0;
    }
    .lesson-status { flex-shrink: 0; }
    .completed-badge { font-size: 24px; }
    .pending-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #E8E8E8;
      border-radius: 50%;
      font-size: 18px;
    }
    .lesson-xp {
      position: absolute;
      top: 8px;
      right: 12px;
      font-family: 'Nunito', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #FF6F00;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .stat-icon { font-size: 32px; display: block; }
    .stat-number {
      display: block;
      font-family: 'Fredoka', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #4CAF50;
      margin: 4px 0;
    }
    .stat-desc {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      color: #888;
      font-weight: 600;
    }
    .badges-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; }
      .hero h1 { font-size: 28px; }
    }
  `]
})
export class HomeComponent {
  protected readonly profile: FinancialProfileService;

  constructor(financialProfile: FinancialProfileService) {
    this.profile = financialProfile;
  }

  lessons = [
    { id: 'needs-vs-wants', title: 'Needs vs Wants', route: '/needs-vs-wants', emoji: '🧐', description: 'Learn what you need vs what you want', xp: 100 },
    { id: 'save-spend-give', title: 'Save Spend Give', route: '/save-spend-give', emoji: '🏦', description: 'Give every dollar a purpose', xp: 100 },
    { id: 'wait-or-buy-now', title: 'Wait or Buy Now', route: '/wait-or-buy-now', emoji: '⏳', description: 'Practice waiting for better things', xp: 100 },
    { id: 'earn-money', title: 'Earn Money', route: '/earn-money', emoji: '💼', description: 'Discover ways to earn money', xp: 100 },
    { id: 'money-magic', title: 'Money Magic', route: '/money-magic', emoji: '✨', description: 'Watch your money grow', xp: 100 },
    { id: 'final-summary', title: 'Final Summary', route: '/final-summary', emoji: '🎓', description: 'See your financial personality', xp: 0 },
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
}
