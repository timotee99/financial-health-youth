import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { ShoppingTripComponent } from './shopping-trip';
import { SurvivalBackpackComponent } from './survival-backpack';
import { FamilyBudgetComponent } from './family-budget';
import { LightningRoundComponent } from './lightning-round';

interface SortItem {
  id: string;
  name: string;
  emoji: string;
  category: 'need' | 'sometimes' | 'want';
  explanation: string;
}

interface UpgradeItem {
  id: string;
  item: string;
  oldEmoji: string;
  newEmoji: string;
  currentSituation: string;
  upgrade: string;
  isUpgrade: boolean;
  explanation: string;
}

type Phase =
  | 'lesson'
  | 'sorting'
  | 'shopping'
  | 'survival'
  | 'upgrade'
  | 'budget'
  | 'lightning'
  | 'summary'
  | 'complete';

@Component({
  selector: 'app-needs-vs-wants',
  standalone: true,
  imports: [
    MoneyMikeComponent,
    LessonCompleteComponent,
    ShoppingTripComponent,
    SurvivalBackpackComponent,
    FamilyBudgetComponent,
    LightningRoundComponent,
  ],
  template: `
    <div class="page-container">
      <!-- LESSON PHASE -->
      @if (phase === 'lesson') {
        <div class="intro animate-slide-up">
          <app-money-mike message="Let me teach you about Needs vs Wants! We have lots of fun activities to help you learn!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <h2>💧 What is a Need?</h2>
            <p>A <strong>need</strong> is something you <em>must</em> have to survive and be healthy.</p>
            <div class="example-row">
              @for (ex of needExamples; track ex) {
                <div class="example-item"><span>{{ ex }}</span></div>
              }
            </div>
          </div>

          <div class="lesson-content card">
            <h2>🌟 What is a Want?</h2>
            <p>A <strong>want</strong> is something nice to have but you <em>can</em> live without.</p>
            <div class="example-row">
              @for (ex of wantExamples; track ex) {
                <div class="example-item want"><span>{{ ex }}</span></div>
              }
            </div>
          </div>

          <div class="lesson-content card">
            <h2>💡 Sometimes It's Both!</h2>
            <p>Some things can be a need OR a want depending on the situation. That's where thinking carefully matters!</p>
            <div class="example-row">
              <div class="example-item both"><span>🚲 Bicycle — need if it's your only transport, want if you already have one</span></div>
              <div class="example-item both"><span>📱 Cell phone — need to call parents, want if it's the newest model</span></div>
            </div>
          </div>

          <div class="lesson-content card key-points">
            <h2>🧠 Key Rule</h2>
            <div class="rule-box"><span class="rule-icon">✅</span><p><strong>Needs first, wants second.</strong> Always cover what you need before spending on what you want.</p></div>
            <div class="rule-box"><span class="rule-icon">🤔</span><p>Ask: <em>"Do I truly need this, or do I just want it?"</em></p></div>
            <div class="rule-box"><span class="rule-icon">🌍</span><p>Context matters! A winter coat is a need in Alaska but a want in Hawaii.</p></div>
          </div>

          <div class="phase-nav"><button class="btn-primary" (click)="goTo('sorting')">🎮 Start the Games!</button></div>
        </div>
      }

      <!-- SORTING GAME PHASE -->
      @if (phase === 'sorting') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Sort each item into Need, Sometimes, or Want! Think carefully!" mood="happy" size="small"></app-money-mike>

          <div class="phase-header">
            <span class="ph-number">1 / 6</span>
            <h2>🧐 Sorting Game</h2>
          </div>

          <div class="sort-progress">
            <span>Item {{ sortIndex + 1 }} of {{ sortItems.length }}</span>
            <div class="sort-track"><div class="sort-fill" [style.width.%]="((sortIndex) / sortItems.length) * 100"></div></div>
          </div>

          <div class="sort-card">
            <span class="sort-emoji">{{ currentSortItem().emoji }}</span>
            <h2>{{ currentSortItem().name }}</h2>
            <p class="sort-prompt">Is this a Need, Sometimes, or Want?</p>
            <div class="sort-buttons">
              <button class="btn-sort need" (click)="sortAnswer('need')" [disabled]="sortAnswered">
                <span>💧</span> Need
              </button>
              <button class="btn-sort sometimes" (click)="sortAnswer('sometimes')" [disabled]="sortAnswered">
                <span>🤔</span> Sometimes
              </button>
              <button class="btn-sort want" (click)="sortAnswer('want')" [disabled]="sortAnswered">
                <span>🌟</span> Want
              </button>
            </div>
            @if (sortFeedback) {
              <div class="sort-feedback" [class.correct]="sortCorrect" [class.incorrect]="!sortCorrect">
                <span>{{ sortCorrect ? '✅' : '❌' }}</span>
                <span>{{ sortFeedback }}</span>
              </div>
            }
            @if (sortAnswered) {
              <button class="btn-secondary" (click)="nextSortItem()">
                {{ sortIndex >= sortItems.length - 1 ? 'Done Sorting' : 'Next ➡️' }}
              </button>
            }
          </div>
        </div>
      }

      <!-- SHOPPING TRIP -->
      @if (phase === 'shopping') {
        <div class="phase-container">
          <app-money-mike message="Help me spend my $30 wisely! I need some things and want some things." mood="thinking" size="small"></app-money-mike>
          <div class="phase-header">
            <span class="ph-number">2 / 6</span>
            <h2>🛒 Money Mike's Shopping Trip</h2>
          </div>
          <app-shopping-trip (done)="goTo('survival')" (score)="addGameScore($event)"></app-shopping-trip>
        </div>
      }

      <!-- SURVIVAL BACKPACK -->
      @if (phase === 'survival') {
        <div class="phase-container">
          <app-money-mike message="You're going camping! Pick 5 essential items for a 3-day adventure!" mood="happy" size="small"></app-money-mike>
          <div class="phase-header">
            <span class="ph-number">3 / 6</span>
            <h2>🏕️ Survival Backpack</h2>
          </div>
          <app-survival-backpack (done)="goTo('upgrade')" (score)="addGameScore($event)"></app-survival-backpack>
        </div>
      }

      <!-- NEED OR UPGRADE -->
      @if (phase === 'upgrade') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Is it a real need, or just an upgrade? Let's find out!" mood="thinking" size="small"></app-money-mike>
          <div class="phase-header">
            <span class="ph-number">4 / 6</span>
            <h2>🔄 Need or Upgrade?</h2>
          </div>

          <div class="upgrade-progress">
            <span>Scenario {{ upgradeIndex + 1 }} of {{ upgradeItems.length }}</span>
            <div class="sort-track"><div class="sort-fill" [style.width.%]="((upgradeIndex) / upgradeItems.length) * 100"></div></div>
          </div>

          <div class="upgrade-card">
            <div class="upgrade-compare">
              <div class="upgrade-old">
                <span class="uo-emoji">{{ currentUpgrade().oldEmoji }}</span>
                <h3>Current {{ currentUpgrade().item }}</h3>
                <p>{{ currentUpgrade().currentSituation }}</p>
              </div>
              <span class="upgrade-vs">VS</span>
              <div class="upgrade-new">
                <span class="uo-emoji">{{ currentUpgrade().newEmoji }}</span>
                <h3>New {{ currentUpgrade().item }}</h3>
                <p>{{ currentUpgrade().upgrade }}</p>
              </div>
            </div>
            <p class="upgrade-question">Is getting the new one a Need or a Want?</p>
            <div class="sort-buttons">
              <button class="btn-sort need" (click)="upgradeAnswer(true)" [disabled]="upgradeAnswered">
                <span>💧</span> Need
              </button>
              <button class="btn-sort want" (click)="upgradeAnswer(false)" [disabled]="upgradeAnswered">
                <span>🌟</span> Want (Upgrade)
              </button>
            </div>
            @if (upgradeFeedback) {
              <div class="sort-feedback" [class.correct]="upgradeCorrect" [class.incorrect]="!upgradeCorrect">
                <span>{{ upgradeCorrect ? '✅' : '❌' }}</span>
                <span>{{ upgradeFeedback }}</span>
              </div>
            }
            @if (upgradeAnswered) {
              <button class="btn-secondary" (click)="nextUpgrade()">
                {{ upgradeIndex >= upgradeItems.length - 1 ? 'Done' : 'Next ➡️' }}
              </button>
            }
          </div>
        </div>
      }

      <!-- FAMILY BUDGET -->
      @if (phase === 'budget') {
        <div class="phase-container">
          <app-money-mike message="This family has $100 for the week. Help them decide what to pay for!" mood="thinking" size="small"></app-money-mike>
          <div class="phase-header">
            <span class="ph-number">5 / 6</span>
            <h2>👨‍👩‍👧‍👦 Family Budget</h2>
          </div>
          <app-family-budget (done)="goTo('lightning')" (score)="addGameScore($event)"></app-family-budget>
        </div>
      }

      <!-- LIGHTNING ROUND -->
      @if (phase === 'lightning') {
        <div class="phase-container">
          <div class="phase-header">
            <span class="ph-number">6 / 6</span>
            <h2>⚡ Lightning Round</h2>
          </div>
          <app-lightning-round (done)="showSummaryScreen()" (score)="addGameScore($event)"></app-lightning-round>
        </div>
      }

      <!-- SUMMARY -->
      @if (phase === 'summary') {
        <div class="summary-page animate-slide-up">
          <h2>🎉 Needs vs Wants Complete!</h2>
          <app-money-mike [message]="summaryMessage" mood="celebrate" size="small"></app-money-mike>

          <div class="summary-stats">
            <div class="ss-card">
              <span class="ss-icon">🧐</span>
              <span class="ss-val">{{ sortCorrectCount }}/{{ sortItems.length }}</span>
              <span class="ss-lbl">Sorting Game</span>
            </div>
            <div class="ss-card">
              <span class="ss-icon">🛒</span>
              <span class="ss-val">{{ shoppingScore }}/20</span>
              <span class="ss-lbl">Shopping Trip</span>
            </div>
            <div class="ss-card">
              <span class="ss-icon">🏕️</span>
              <span class="ss-val">{{ survivalScore }}/60</span>
              <span class="ss-lbl">Survival Pack</span>
            </div>
            <div class="ss-card">
              <span class="ss-icon">🔄</span>
              <span class="ss-val">{{ upgradeCorrectCount }}/{{ upgradeItems.length }}</span>
              <span class="ss-lbl">Need vs Upgrade</span>
            </div>
            <div class="ss-card">
              <span class="ss-icon">👨‍👩‍👧‍👦</span>
              <span class="ss-val">{{ budgetScore }}/25</span>
              <span class="ss-lbl">Family Budget</span>
            </div>
            <div class="ss-card">
              <span class="ss-icon">⚡</span>
              <span class="ss-val">{{ lightningScore }}/40</span>
              <span class="ss-lbl">Lightning Round</span>
            </div>
          </div>

          <div class="summary-total">
            <span class="st-label">Total Score</span>
            <span class="st-value">{{ totalGameScore }}/225</span>
          </div>

          <div class="summary-trait">
            <span class="stt-emoji">{{ traitEmoji }}</span>
            <h3>{{ traitName }}</h3>
            <p>{{ traitDesc }}</p>
          </div>

          <div class="final-lesson card">
            <h3>📖 What You Learned</h3>
            <p>✅ Needs are things we must have to survive — always pay for these first.</p>
            <p>✅ Wants are nice-to-haves — enjoy them after needs are covered.</p>
            <p>✅ Some items depend on context — think carefully!</p>
            <p>✅ Replacing something broken is a need; upgrading to something newer is usually a want.</p>
            <p>✅ Budgeting means choosing needs before wants with your money.</p>
          </div>

          <button class="btn-primary" (click)="finishLesson()">🎉 Complete Lesson</button>
        </div>
      }
    </div>

    @if (phase === 'complete') {
      <app-lesson-complete lessonTitle="Needs vs Wants"
        [message]="'Incredible work! You completed all 6 challenges about Needs vs Wants! You earned the Need Detective badge!'"
        [xpEarned]="100" [score]="totalGameScore"
        badge="Need Detective" badgeEmoji="🔍"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro { padding: 10px 0; }
    .lesson-content { margin-bottom: 16px; text-align: left; }
    .lesson-content h2 { font-family: 'Fredoka', sans-serif; font-size: 21px; margin-bottom: 8px; }
    .lesson-content > p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 10px; }
    .example-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .example-item {
      background: #E8F5E9; border-radius: 10px; padding: 6px 14px;
      font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #2E7D32;
    }
    .example-item.want { background: #E3F2FD; color: #1565C0; }
    .example-item.both { background: #FFF8E1; color: #E65100; width: 100%; }
    .key-points { background: #FFF8E1; }
    .rule-box { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #FFE082; }
    .rule-box:last-child { border-bottom: none; }
    .rule-icon { font-size: 24px; flex-shrink: 0; }
    .rule-box p { margin: 0; font-size: 14px; line-height: 1.5; }

    .phase-nav { text-align: center; padding: 20px 0; }
    .phase-container { padding: 10px 0; }
    .phase-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .ph-number {
      background: #FFD54F;
      border-radius: 20px;
      padding: 4px 14px;
      font-family: 'Fredoka', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #5D4037;
    }
    .phase-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 0; }

    /* Sorting game */
    .sort-progress { margin-bottom: 12px; }
    .sort-progress span { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #888; }
    .sort-track { height: 8px; background: #E0E0E0; border-radius: 4px; margin-top: 4px; overflow: hidden; }
    .sort-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #66BB6A); border-radius: 4px; transition: width 0.3s; }
    .sort-card {
      background: white; border-radius: 24px; padding: 28px; text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;
    }
    .sort-emoji { font-size: 72px; display: block; margin-bottom: 8px; }
    .sort-card h2 { font-family: 'Fredoka', sans-serif; font-size: 26px; color: #333; margin: 0; }
    .sort-prompt { font-family: 'Nunito', sans-serif; font-size: 15px; color: #888; margin: 8px 0 16px; }
    .sort-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .btn-sort {
      padding: 12px 22px; border-radius: 50px; font-family: 'Fredoka', sans-serif;
      font-size: 16px; font-weight: 700; border: none; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: all 0.2s;
    }
    .btn-sort:hover:not(:disabled) { transform: translateY(-2px); }
    .btn-sort:disabled { opacity: 0.4; cursor: default; }
    .btn-sort.need { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .btn-sort.sometimes { background: linear-gradient(135deg, #FF9800, #FFB74D); color: white; }
    .btn-sort.want { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .sort-feedback {
      margin-top: 12px; padding: 10px 14px; border-radius: 10px;
      display: flex; align-items: center; gap: 8px; font-size: 14px;
    }
    .sort-feedback.correct { background: #E8F5E9; }
    .sort-feedback.incorrect { background: #FFF3E0; }

    /* Upgrade game */
    .upgrade-progress { margin-bottom: 12px; }
    .upgrade-progress span { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #888; }
    .upgrade-card {
      background: white; border-radius: 24px; padding: 24px; text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 560px; margin: 0 auto;
    }
    .upgrade-compare { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .upgrade-old, .upgrade-new { flex: 1; padding: 14px; border-radius: 14px; }
    .upgrade-old { background: #F5F5F5; border: 3px solid #E0E0E0; }
    .upgrade-new { background: #FFF8E1; border: 3px solid #FFD54F; }
    .uo-emoji { font-size: 40px; display: block; margin-bottom: 4px; }
    .upgrade-old h3, .upgrade-new h3 { font-family: 'Fredoka', sans-serif; font-size: 16px; margin: 4px 0; }
    .upgrade-old p, .upgrade-new p { font-family: 'Nunito', sans-serif; font-size: 12px; color: #777; margin: 0; }
    .upgrade-vs { font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #FF6F00; }
    .upgrade-question { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 12px; }

    /* Summary */
    .summary-page { padding: 10px 0; text-align: center; }
    .summary-page h2 { font-family: 'Fredoka', sans-serif; font-size: 26px; margin-bottom: 12px; }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 16px 0;
    }
    .ss-card {
      background: white; border-radius: 14px; padding: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .ss-icon { font-size: 24px; display: block; }
    .ss-val { display: block; font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: #4CAF50; margin: 4px 0; }
    .ss-lbl { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; font-weight: 600; }
    .summary-total {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin: 16px 0;
      padding: 16px;
      background: linear-gradient(135deg, #FFF8E1, #FFE082);
      border-radius: 16px;
    }
    .st-label { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #5D4037; }
    .st-value { font-family: 'Fredoka', sans-serif; font-size: 32px; font-weight: 700; color: #E65100; }
    .summary-trait {
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 20px;
      padding: 20px;
      margin: 16px 0;
    }
    .stt-emoji { font-size: 48px; display: block; }
    .summary-trait h3 { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #2E7D32; margin: 4px 0; }
    .summary-trait p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin: 4px 0; }
    .final-lesson { text-align: left; }
    .final-lesson h3 { margin-bottom: 8px; }
    .final-lesson p { font-size: 14px; margin-bottom: 6px; padding-left: 4px; }

    .phase-nav button { margin-top: 16px; }

    @media (max-width: 480px) {
      .summary-stats { grid-template-columns: repeat(2, 1fr); }
      .upgrade-compare { flex-direction: column; }
      .sort-buttons { flex-direction: column; align-items: center; }
    }
  `]
})
export class NeedsVsWantsComponent {
  protected phase: Phase = 'lesson';

  // Sorting game state
  protected sortIndex = 0;
  protected sortAnswered = false;
  protected sortFeedback = '';
  protected sortCorrect = false;
  protected sortCorrectCount = 0;

  // Upgrade game state
  protected upgradeIndex = 0;
  protected upgradeAnswered = false;
  protected upgradeFeedback = '';
  protected upgradeCorrect = false;
  protected upgradeCorrectCount = 0;

  // Scores from sub-games
  protected shoppingScore = 0;
  protected survivalScore = 0;
  protected upgradeScore = 0;
  protected budgetScore = 0;
  protected lightningScore = 0;

  protected needExamples = [
    '💧 Water', '🏠 House', '🥦 Food', '👕 Clothes', '💊 Medicine', '✏️ School Supplies',
    '🧦 Socks', '🪥 Toothbrush', '🛌 Bed', '🧥 Jacket',
  ];
  protected wantExamples = [
    '🎮 Video Games', '🍦 Ice Cream', '🧸 Toys', '🛹 Skateboard', '🍬 Candy',
    '📱 Newest Phone', '🐉 Pet Dragon', '🎢 Theme Park', '👟 Designer Shoes',
  ];

  protected sortItems: SortItem[] = [
    { id: 's1', name: 'Water', emoji: '💧', category: 'need', explanation: 'Water is a need because our bodies need it to survive.' },
    { id: 's2', name: 'Pizza', emoji: '🍕', category: 'need', explanation: 'Pizza is food — we need food to live and grow!' },
    { id: 's3', name: 'House', emoji: '🏠', category: 'need', explanation: 'A house gives us shelter from weather. Definitely a need!' },
    { id: 's4', name: 'Medicine', emoji: '💊', category: 'need', explanation: 'Medicine keeps us healthy when we are sick — a need.' },
    { id: 's5', name: 'Shoes', emoji: '👟', category: 'need', explanation: 'Shoes protect our feet. Everyone needs at least one pair.' },
    { id: 's6', name: 'Winter Coat in Alaska', emoji: '🧥', category: 'need', explanation: 'In Alaska\'s freezing weather, a warm coat is a need to survive.' },
    { id: 's7', name: 'Bicycle', emoji: '🚲', category: 'sometimes', explanation: 'A bike can be a need if it\'s your only way to get to school, or a want if you already have transport.' },
    { id: 's8', name: 'Cell Phone', emoji: '📱', category: 'sometimes', explanation: 'A basic phone to call parents can be a need, but the newest iPhone is a want.' },
    { id: 's9', name: 'Video Game', emoji: '🎮', category: 'want', explanation: 'Video games are fun but you don\'t need them to live. Definitely a want!' },
    { id: 's10', name: 'Candy', emoji: '🍬', category: 'want', explanation: 'Candy is a treat. Tasty but not something you need.' },
    { id: 's11', name: 'Designer Shoes', emoji: '👠', category: 'want', explanation: 'Regular shoes are a need, but expensive designer shoes are a want.' },
    { id: 's12', name: 'Theme Park Ticket', emoji: '🎢', category: 'want', explanation: 'Theme parks are amazing fun, but they\'s definitely a want!' },
    { id: 's13', name: 'Newest iPhone', emoji: '📲', category: 'want', explanation: 'If your current phone works fine, getting the newest one is a want.' },
    { id: 's14', name: 'School Supplies', emoji: '✏️', category: 'need', explanation: 'You need supplies to learn at school. That\'s a need!' },
    { id: 's15', name: 'Ice Cream', emoji: '🍦', category: 'want', explanation: 'Ice cream is delicious but it\'s a treat, not a need.' },
  ];

  protected upgradeItems: UpgradeItem[] = [
    { id: 'u1', item: 'Backpack', oldEmoji: '🎒', newEmoji: '🦸', currentSituation: 'Current backpack works fine, just a bit old.', upgrade: 'New superhero backpack with cool design', isUpgrade: true, explanation: 'If your backpack works fine, getting a new one just for looks is a want! Replace it only if it breaks.' },
    { id: 'u2', item: 'Phone', oldEmoji: '📱', newEmoji: '📲', currentSituation: 'Phone screen is cracked and battery dies fast.', upgrade: 'New phone that works properly', isUpgrade: false, explanation: 'Your phone is broken and doesn\'t work well. Replacing a broken item is a need!' },
    { id: 'u3', item: 'Shoes', oldEmoji: '👟', newEmoji: '👟✨', currentSituation: 'Shoes have holes in them and hurt your feet.', upgrade: 'New pair of shoes that fit', isUpgrade: false, explanation: 'Shoes with holes don\'t protect your feet. Replacing broken shoes is a need!' },
    { id: 'u4', item: 'Tablet', oldEmoji: '📟', newEmoji: '💻', currentSituation: 'Current tablet works fine for homework.', upgrade: 'Latest model with bigger screen', isUpgrade: true, explanation: 'Your tablet still works fine! Upgrading to a newer model is a want.' },
    { id: 'u5', item: 'Bicycle', oldEmoji: '🚲', newEmoji: '🚵', currentSituation: 'Bike is rusty but still rideable.', upgrade: 'Brand new mountain bike with gears', isUpgrade: true, explanation: 'If the old bike still works, a new one is a want. Replace it only if it\'s unsafe.' },
    { id: 'u6', item: 'Winter Coat', oldEmoji: '🧥', newEmoji: '🧥🔥', currentSituation: 'Coat is torn and doesn\'t keep you warm.', upgrade: 'New warm winter coat', isUpgrade: false, explanation: 'A torn coat that can\'t keep you warm in winter needs replacing. That\'s a need!' },
  ];

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  get currentSortItem() {
    return computed(() => this.sortItems[this.sortIndex]);
  }

  get currentUpgrade() {
    return computed(() => this.upgradeItems[this.upgradeIndex]);
  }

  get totalGameScore(): number {
    return this.sortCorrectCount * 2 + this.shoppingScore + this.survivalScore +
           this.upgradeCorrectCount * 3 + this.budgetScore + this.lightningScore;
  }

  get sortCorrectCount_display(): number {
    return this.sortCorrectCount;
  }

  get summaryMessage(): string {
    const pct = this.sortCorrectCount / this.sortItems.length;
    if (pct >= 0.9) return 'Outstanding! You truly understand the difference between needs and wants! You\'re a money genius! 🌟';
    if (pct >= 0.7) return 'Great job! You have a solid understanding of needs vs wants. Keep thinking carefully! 👏';
    return 'Good effort! Remember: needs are things we must have to live. Keep practicing! 💪';
  }

  get traitEmoji(): string {
    const pct = this.totalGameScore / 225;
    if (pct >= 0.85) return '🏆';
    if (pct >= 0.7) return '🌟';
    if (pct >= 0.5) return '👍';
    return '💪';
  }

  get traitName(): string {
    const pct = this.totalGameScore / 225;
    if (pct >= 0.85) return 'Smart Decision Maker';
    if (pct >= 0.7) return 'Thoughtful Spender';
    if (pct >= 0.5) return 'Learning Adventurer';
    return 'Money Explorer';
  }

  get traitDesc(): string {
    const pct = this.totalGameScore / 225;
    if (pct >= 0.85) return 'You consistently make smart choices about needs and wants. You think carefully before spending and understand the difference between replacing what\'s broken and upgrading for fun. You\'re ready to manage real money!';
    if (pct >= 0.7) return 'You have a good understanding of needs vs wants. You usually make thoughtful decisions. Keep practicing and you\'ll be a money master in no time!';
    if (pct >= 0.5) return 'You\'re learning the difference between needs and wants. Every time you practice, you get better at making smart money choices!';
    return 'You\'ve started your money journey! With more practice, you\'ll get better at telling needs apart from wants. Keep going!';
  }

  goTo(phase: Phase): void {
    this.phase = phase;
    this.audio.playClick();
  }

  // Sorting game methods
  sortAnswer(category: string): void {
    if (this.sortAnswered) return;
    this.sortAnswered = true;
    const item = this.sortItems[this.sortIndex];
    this.sortCorrect = category === item.category;
    this.sortFeedback = item.explanation;
    if (this.sortCorrect) {
      this.sortCorrectCount++;
      this.audio.playSuccess();
    } else {
      this.audio.playIncorrect();
    }
  }

  nextSortItem(): void {
    this.sortAnswered = false;
    this.sortFeedback = '';
    if (this.sortIndex >= this.sortItems.length - 1) {
      this.goTo('shopping');
    } else {
      this.sortIndex++;
    }
  }

  // Upgrade game methods
  upgradeAnswer(isNeed: boolean): void {
    if (this.upgradeAnswered) return;
    this.upgradeAnswered = true;
    const item = this.upgradeItems[this.upgradeIndex];
    const correct = isNeed !== item.isUpgrade;
    this.upgradeCorrect = correct;
    this.upgradeFeedback = item.explanation;
    if (correct) {
      this.upgradeCorrectCount++;
      this.audio.playSuccess();
    } else {
      this.audio.playIncorrect();
    }
  }

  nextUpgrade(): void {
    this.upgradeAnswered = false;
    this.upgradeFeedback = '';
    if (this.upgradeIndex >= this.upgradeItems.length - 1) {
      this.goTo('budget');
    } else {
      this.upgradeIndex++;
    }
  }

  // Sub-game score handlers
  addGameScore(score: number): void {
    // Determine which score to add based on current phase
    if (this.phase === 'shopping') this.shoppingScore = score;
    else if (this.phase === 'survival') this.survivalScore = score;
    else if (this.phase === 'budget') this.budgetScore = score;
    else if (this.phase === 'lightning') this.lightningScore = score;
  }

  showSummaryScreen(): void {
    this.phase = 'summary';
    this.audio.playSuccess();
  }

  finishLesson(): void {
    this.profile.addScore(this.totalGameScore);
    this.profile.addXp(100);
    this.profile.addBadge('Need Detective');
    this.profile.completeLesson('needs-vs-wants');
    this.audio.playBadge();
    this.phase = 'complete';
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
