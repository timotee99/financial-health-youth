import { Component, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';

interface Goal {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

interface EarningRound {
  earned: number;
  savedForGoal: number;
  spent: number;
}

@Component({
  selector: 'app-dream-goal',
  standalone: true,
  template: `
    <div class="dream-game animate-slide-up">
      @if (!goalChosen) {
        <div class="goal-pick">
          <h2>🎯 Pick Your Dream Item</h2>
          <p>Choose something you want to save up for!</p>
          <div class="goals-grid">
            @for (g of goals; track g.id) {
              <button class="goal-card" (click)="pickGoal(g)">
                <span class="gc-emoji">{{ g.emoji }}</span>
                <span class="gc-name">{{ g.name }}</span>
                <span class="gc-cost">{{ '$' + g.cost }}</span>
              </button>
            }
          </div>
        </div>
      }

      @if (goalChosen && !isComplete) {
        <div class="goal-track">
          <div class="goal-header">
            <span class="gh-emoji">{{ chosenGoal()?.emoji }}</span>
            <div>
              <h3>{{ chosenGoal()?.name }}</h3>
              <p>{{ '$' + chosenGoal()?.cost }}</p>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercent()"></div>
            </div>
            <span class="progress-text">{{ '$' + savedAmount() }} / {{ '$' + chosenGoal()?.cost }}</span>
          </div>

          <div class="earn-card">
            <span class="ec-emoji">💰</span>
            <span class="ec-text">You earned <strong>{{ '$' + currentEarnings }}</strong> this round!</span>
          </div>

          <div class="decision-buttons">
            <button class="btn-save-money" (click)="saveForGoal()">
              <span>🏦</span> Save {{ '$' + currentEarnings }} for {{ chosenGoal()?.name }}
            </button>
            <button class="btn-spend-money" (click)="spendNow()">
              <span>🛒</span> Spend {{ '$' + currentEarnings }} on something fun
            </button>
          </div>

          <div class="round-counter">Round {{ round }} / {{ maxRounds }}</div>
        </div>
      }

      @if (isComplete) {
        <div class="goal-result">
          <h3>{{ reachedGoal ? '🎉 Goal Reached!' : '😅 Keep Trying!' }}</h3>
          <div class="result-visual">
            <span class="rv-emoji">{{ reachedGoal ? (chosenGoal()?.emoji ?? '🎯') : '💪' }}</span>
            <div class="progress-bar large">
              <div class="progress-fill" [style.width.%]="progressPercent()"></div>
            </div>
            <span>{{ '$' + savedAmount() }} / {{ '$' + chosenGoal()?.cost }}</span>
          </div>

          @if (reachedGoal) {
            <p class="result-msg">Amazing! You saved consistently and reached your goal! Saving a little each time adds up!</p>
          } @else {
            <p class="result-msg">You saved {{ '$' + savedAmount() }} toward {{ chosenGoal()?.name }}. With a few more rounds of saving, you will get there!</p>
          }

          <div class="result-stats2">
            <div class="rs2-item"><span>Total Saved for Goal</span><span class="green">{{ '$' + savedAmount() }}</span></div>
            <div class="rs2-item"><span>Total Spent on Fun</span><span class="blue">{{ '$' + totalSpent }}</span></div>
          </div>

          <button class="btn-primary" (click)="done.emit()">Continue ➡️</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .dream-game { margin: 16px 0; }
    .goal-pick { text-align: center; }
    .goal-pick h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin-bottom: 6px; }
    .goal-pick p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #888; margin-bottom: 16px; }
    .goals-grid { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .goal-card {
      background: white; border: 3px solid #E0E0E0; border-radius: 20px;
      padding: 20px 24px; cursor: pointer; text-align: center;
      transition: all 0.2s; min-width: 130px;
    }
    .goal-card:hover { border-color: #FFD54F; transform: translateY(-3px); }
    .gc-emoji { font-size: 48px; display: block; margin-bottom: 6px; }
    .gc-name { font-family: 'Fredoka', sans-serif; font-size: 18px; display: block; }
    .gc-cost { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700; color: #FF6F00; display: block; margin-top: 4px; }
    .goal-track { max-width: 480px; margin: 0 auto; }
    .goal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .gh-emoji { font-size: 48px; }
    .goal-header h3 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 0; }
    .goal-header p { font-family: 'Nunito', sans-serif; font-size: 16px; color: #FF6F00; font-weight: 700; margin: 0; }
    .progress-section { margin-bottom: 20px; }
    .progress-bar {
      height: 20px; background: #E0E0E0; border-radius: 10px;
      overflow: hidden; margin-bottom: 6px;
    }
    .progress-fill {
      height: 100%; background: linear-gradient(90deg, #4CAF50, #66BB6A);
      border-radius: 10px; transition: width 0.4s;
    }
    .progress-bar.large { height: 28px; border-radius: 14px; }
    .progress-text { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #666; }
    .earn-card {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #FFF8E1, #FFE082);
      border-radius: 14px; padding: 14px 18px; margin-bottom: 16px;
    }
    .ec-emoji { font-size: 28px; }
    .ec-text { font-family: 'Nunito', sans-serif; font-size: 16px; }
    .decision-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
    .btn-save-money, .btn-spend-money {
      padding: 14px 20px; border-radius: 50px; font-family: 'Fredoka', sans-serif;
      font-size: 16px; font-weight: 700; border: none; cursor: pointer;
      display: flex; align-items: center; gap: 8px; justify-content: center;
      transition: all 0.2s;
    }
    .btn-save-money { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .btn-spend-money { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .btn-save-money:hover, .btn-spend-money:hover { transform: translateY(-2px); }
    .round-counter { text-align: center; font-family: 'Nunito', sans-serif; font-size: 13px; color: #999; }
    .goal-result { text-align: center; }
    .goal-result h3 { font-family: 'Fredoka', sans-serif; font-size: 24px; margin-bottom: 16px; }
    .result-visual { margin-bottom: 16px; }
    .rv-emoji { font-size: 64px; display: block; margin-bottom: 8px; }
    .result-msg { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; max-width: 400px; margin: 0 auto 16px; }
    .result-stats2 {
      background: white; border-radius: 14px; padding: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px;
    }
    .rs2-item {
      display: flex; justify-content: space-between;
      font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600;
      padding: 6px 0;
    }
    .rs2-item .green { color: #2E7D32; }
    .rs2-item .blue { color: #1565C0; }
  `]
})
export class DreamGoalComponent {
  @Output() done = new EventEmitter<void>();
  @Output() savedAmountChange = new EventEmitter<number>();

  protected goals: Goal[] = [
    { id: 'lego', name: 'Lego Set', emoji: '🧱', cost: 50 },
    { id: 'bike', name: 'Bicycle', emoji: '🚲', cost: 100 },
    { id: 'tablet', name: 'Tablet', emoji: '📱', cost: 150 },
  ];

  protected goalChosen = false;
  protected chosenGoalId = signal<string | null>(null);
  protected chosenGoal = computed(() => this.goals.find((g) => g.id === this.chosenGoalId()));
  protected savedAmount = signal(0);
  protected totalSpent = 0;
  protected round = 0;
  protected maxRounds = 8;
  protected isComplete = false;
  protected reachedGoal = false;
  protected currentEarnings = 0;

  protected progressPercent = computed(() => {
    const goal = this.chosenGoal();
    if (!goal) return 0;
    return Math.min(100, (this.savedAmount() / goal.cost) * 100);
  });

  protected pickGoal(g: Goal): void {
    this.chosenGoalId.set(g.id);
    this.goalChosen = true;
    this.nextEarning();
  }

  protected nextEarning(): void {
    this.round++;
    this.currentEarnings = 5 + Math.floor(Math.random() * 6);
  }

  protected saveForGoal(): void {
    this.savedAmount.update((v) => v + this.currentEarnings);
    this.advance();
  }

  protected spendNow(): void {
    this.totalSpent += this.currentEarnings;
    this.advance();
  }

  private advance(): void {
    const goal = this.chosenGoal();
    if (this.savedAmount() >= (goal?.cost ?? Infinity)) {
      this.reachedGoal = true;
      this.isComplete = true;
      this.savedAmountChange.emit(this.savedAmount());
      return;
    }
    if (this.round >= this.maxRounds) {
      this.isComplete = true;
      this.savedAmountChange.emit(this.savedAmount());
      return;
    }
    this.nextEarning();
  }
}
