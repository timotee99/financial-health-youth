import { Component, Output, EventEmitter, signal, computed } from '@angular/core';

interface DreamGoal {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

interface DayEvent {
  type: 'normal' | 'bonus' | 'sale' | 'surprise' | 'repair';
  label: string;
  emoji: string;
  effect: string;
}

interface Decision {
  label: string;
  emoji: string;
  effect: string;
}

@Component({
  selector: 'app-dream-grow',
  standalone: true,
  template: `
    <div class="dream-grow animate-slide-up">
      @if (!goalChosen) {
        <div class="dg-pick">
          <h2>🎯 Grow Your Dream Item</h2>
          <p>Start with <strong>$5</strong>. Use daily decisions to grow your money into something bigger!</p>
          <p class="dg-hint">If you invest wisely, your $5 can grow all the way to <strong>$78</strong>!</p>
          <div class="dg-goals">
            @for (g of goals; track g.id) {
              <button class="dg-goal" (click)="pickGoal(g)">
                <span class="dgg-emoji">{{ g.emoji }}</span>
                <span class="dgg-name">{{ g.name }}</span>
                <span class="dgg-cost">{{ '$' + g.cost }}</span>
              </button>
            }
          </div>
        </div>
      }

      @if (goalChosen && !isComplete) {
        <div class="dg-active">
          <div class="dg-header">
            <div class="dg-h-left">
              <span class="dgh-emoji">{{ chosenGoal()?.emoji }}</span>
              <div>
                <h3>{{ chosenGoal()?.name }}</h3>
                <span class="dgh-cost">{{ '$' + chosenGoal()?.cost }} goal</span>
              </div>
            </div>
            <div class="dg-h-right">
              <span class="dgh-balance">{{ '$' + balance() }}</span>
              <span class="dgh-label">Your Money</span>
            </div>
          </div>

          <div class="dg-progress">
            <div class="dg-bar">
              <div class="dg-fill" [style.width.%]="progressPct()"></div>
            </div>
            <span class="dg-pct">{{ progressPct() }}%</span>
          </div>

          <div class="dg-event">
            <span class="dge-emoji">{{ currentEvent.emoji }}</span>
            <span class="dge-label">{{ currentEvent.label }}</span>
            <span class="dge-effect">{{ currentEvent.effect }}</span>
          </div>

          <div class="dg-question">
            <p>What do you do with your money today?</p>
          </div>

          <div class="dg-choices">
            @for (d of decisions; track d.label) {
              <button class="dg-choice" (click)="makeChoice(d)">
                <span class="dgc-emoji">{{ d.emoji }}</span>
                <span class="dgc-label">{{ d.label }}</span>
                <span class="dgc-effect">{{ d.effect }}</span>
              </button>
            }
          </div>

          <div class="dg-counter">
            Day {{ day }} / {{ maxDays }} | Balance: {{ '$' + balance() }}
            @if (investedAmount() > 0) {
              | Investing: {{ '$' + investedAmount() }}
            }
          </div>
        </div>
      }

      @if (isComplete) {
        <div class="dg-result">
          <span class="dgr-emoji">{{ reachedGoal ? '🎉' : '💪' }}</span>
          <h2>{{ reachedGoal ? 'You Did It!' : 'Great Try!' }}</h2>

          <div class="dgr-money-tree">
            <span class="dgr-start">$5</span>
            <span class="dgr-arrow">→</span>
            <span class="dgr-end">{{ '$' + totalEnd }}</span>
          </div>

          <div class="dgr-story">
            <p>You started with <strong>$5</strong> and it grew to <strong>{{ '$' + totalEnd }}</strong>!</p>
            <p>You saved <strong>{{ '$' + savedAmount() }}</strong> toward your {{ chosenGoal()?.name }}.</p>
            <p>You spent <strong>{{ '$' + totalSpent }}</strong> on other things.</p>
            <p>You invested <strong>{{ '$' + totalInvested }}</strong> which earned <strong>{{ '$' + totalReturns }}</strong> in returns!</p>
            @if (reachedGoal) {
              <p>🎉 Your money grew enough to reach your goal! Saving and investing made it possible!</p>
            } @else {
              <p>Almost there! With a few more days of smart choices, you would have reached your goal.</p>
            }
          </div>

          <div class="dgr-insight">
            <span class="dgri-emoji">{{ insightEmoji }}</span>
            <p>{{ insightText }}</p>
          </div>

          <button class="btn-primary" (click)="finish()">See Your Growth Personality ➡️</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .dream-grow { margin: 16px 0; }
    .dg-pick { text-align: center; }
    .dg-pick h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin-bottom: 6px; }
    .dg-pick p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #888; margin-bottom: 4px; }
    .dg-hint { font-family: 'Fredoka', sans-serif; font-size: 18px; color: #FF6F00; font-weight: 700; margin-bottom: 16px !important; }
    .dg-goals { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .dg-goal {
      background: white; border: 3px solid #E0E0E0; border-radius: 20px;
      padding: 18px 22px; cursor: pointer; text-align: center;
      transition: all 0.2s; min-width: 110px;
    }
    .dg-goal:hover { border-color: #FFD54F; transform: translateY(-3px); }
    .dgg-emoji { font-size: 40px; display: block; margin-bottom: 4px; }
    .dgg-name { font-family: 'Fredoka', sans-serif; font-size: 15px; display: block; }
    .dgg-cost { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #FF6F00; display: block; margin-top: 4px; }
    .dg-active { max-width: 520px; margin: 0 auto; }
    .dg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .dg-h-left { display: flex; align-items: center; gap: 10px; }
    .dgh-emoji { font-size: 36px; }
    .dg-h-left h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 0; }
    .dgh-cost { font-family: 'Nunito', sans-serif; font-size: 12px; color: #FF6F00; font-weight: 600; }
    .dg-h-right { text-align: center; }
    .dgh-balance { font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #2E7D32; display: block; }
    .dgh-label { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; }
    .dg-progress { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .dg-bar { flex: 1; height: 14px; background: #E0E0E0; border-radius: 7px; overflow: hidden; }
    .dg-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A, #CDDC39); border-radius: 7px; transition: width 0.4s; }
    .dg-pct { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #666; }
    .dg-event {
      display: flex; align-items: center; gap: 8px;
      background: #FFF8E1; border-radius: 12px;
      padding: 10px 14px; margin-bottom: 12px;
    }
    .dge-emoji { font-size: 24px; }
    .dge-label { font-family: 'Fredoka', sans-serif; font-size: 14px; }
    .dge-effect { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; margin-left: auto; }
    .dg-question p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #333; font-weight: 600; margin-bottom: 10px; }
    .dg-choices { display: flex; flex-direction: column; gap: 8px; }
    .dg-choice {
      display: flex; align-items: center; gap: 10px;
      background: white; border: 3px solid #E0E0E0; border-radius: 14px;
      padding: 12px 16px; cursor: pointer; transition: all 0.2s;
      width: 100%; text-align: left;
    }
    .dg-choice:hover { border-color: #FFD54F; transform: translateY(-2px); }
    .dgc-emoji { font-size: 28px; }
    .dgc-label { font-family: 'Fredoka', sans-serif; font-size: 15px; flex: 1; }
    .dgc-effect { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; }
    .dg-counter { text-align: center; font-family: 'Nunito', sans-serif; font-size: 13px; color: #999; margin-top: 12px; }
    .dg-result { text-align: center; }
    .dgr-emoji { font-size: 64px; display: block; }
    .dg-result h2 { font-family: 'Fredoka', sans-serif; font-size: 24px; margin-bottom: 16px; }
    .dgr-money-tree { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; }
    .dgr-start { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #E65100; }
    .dgr-arrow { font-size: 28px; color: #4CAF50; }
    .dgr-end { font-family: 'Fredoka', sans-serif; font-size: 36px; font-weight: 700; color: #2E7D32; }
    .dgr-story { background: #E8F5E9; border-radius: 16px; padding: 16px; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.8; margin-bottom: 12px; text-align: left; }
    .dgr-story p { margin: 4px 0; }
    .dgr-insight { display: flex; align-items: center; gap: 10px; background: #FFF8E1; border-radius: 14px; padding: 14px; margin-bottom: 16px; }
    .dgri-emoji { font-size: 28px; }
    .dgr-insight p { margin: 0; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.5; }
  `]
})
export class DreamGrowComponent {
  @Output() done = new EventEmitter<void>();
  @Output() result = new EventEmitter<{
    saved: number; spent: number; earned: number; invested: number; returns: number;
    totalJobs: number; highEffortJobs: number; reachedGoal: boolean; goalCost: number; finalBalance: number;
  }>();

  protected goals: DreamGoal[] = [
    { id: 'bike', name: 'Bicycle', emoji: '🚲', cost: 78 },
    { id: 'game', name: 'Game Console', emoji: '🎮', cost: 60 },
    { id: 'headphones', name: 'Headphones', emoji: '🎧', cost: 40 },
  ];

  protected events: DayEvent[] = [
    { type: 'normal', label: 'Normal Day', emoji: '☀️', effect: 'No special events' },
    { type: 'bonus', label: 'Bonus Day!', emoji: '🎉', effect: 'Extra $3 income' },
    { type: 'sale', label: 'Big Sale!', emoji: '🏷️', effect: 'Items cost less today' },
    { type: 'surprise', label: 'Grandma Visits', emoji: '👵', effect: 'She gives you $5!' },
    { type: 'repair', label: 'Oops! Bike Broken', emoji: '🔧', effect: 'Must spend $2 to fix' },
  ];

  protected decisions: Decision[] = [
    { label: 'Spend', emoji: '🍬', effect: 'Enjoy $3 now' },
    { label: 'Save', emoji: '🐷', effect: 'Keep $5 safe' },
    { label: 'Invest', emoji: '📈', effect: 'Grow $5 into more over time' },
  ];

  protected goalChosen = false;
  protected chosenGoalId = signal<string | null>(null);
  protected chosenGoal = computed(() => this.goals.find((g) => g.id === this.chosenGoalId()));
  protected balance = signal(5);
  protected savedAmount = signal(0);
  protected investedAmount = signal(0);
  protected totalSpent = 0;
  protected totalInvested = 0;
  protected totalReturns = 0;
  protected totalEnd = 5;
  protected day = 0;
  protected maxDays = 10;
  protected isComplete = false;
  protected reachedGoal = false;

  protected currentEvent: DayEvent = this.events[0];
  protected growthMultiplier = 1.5;

  protected progressPct = computed(() => {
    const g = this.chosenGoal();
    if (!g) return 0;
    return Math.min(100, Math.round((this.savedAmount() / g.cost) * 100));
  });

  protected get insightEmoji(): string {
    if (this.totalInvested >= 20) return '📈';
    if (this.savedAmount() >= 30) return '🐷';
    if (this.reachedGoal) return '🏆';
    return '🌟';
  }

  protected get insightText(): string {
    if (this.totalInvested >= 20) return 'You are an Investment Master! You understood that investing makes your money grow over time.';
    if (this.savedAmount() >= 30) return 'You are a Super Saver! You know that saving money is the first step to building wealth.';
    if (this.reachedGoal) return 'You reached your goal by making smart choices with your money. Balanced decisions pay off!';
    return 'You learned that money can grow if you give it time. Every choice you make shapes your financial future!';
  }

  pickGoal(g: DreamGoal): void {
    this.chosenGoalId.set(g.id);
    this.goalChosen = true;
    this.day = 1;
    this.pickEvent();
  }

  private pickEvent(): void {
    this.currentEvent = this.events[Math.floor(Math.random() * this.events.length)];
  }

  makeChoice(d: Decision): void {
    let amount = 5;

    if (this.currentEvent.type === 'bonus') amount += 3;
    if (this.currentEvent.type === 'surprise') amount += 5;
    if (this.currentEvent.type === 'repair') {
      this.balance.update((b) => Math.max(0, b - 2));
      this.totalSpent += 2;
    }
    if (this.currentEvent.type === 'sale') amount = Math.round(amount * 0.7);

    if (d.label === 'Spend') {
      const spendNow = Math.round(amount * 0.4);
      this.totalSpent += spendNow;
      this.balance.update((b) => b + amount - spendNow);
    } else if (d.label === 'Save') {
      this.balance.update((b) => b + amount);
      this.savedAmount.update((s) => s + amount);
    } else if (d.label === 'Invest') {
      const investAmt = amount;
      this.totalInvested += investAmt;
      const returns = Math.round(investAmt * this.growthMultiplier);
      this.totalReturns += returns;
      this.investedAmount.update((i) => i + investAmt);
      this.balance.update((b) => b + investAmt + returns);
      this.growthMultiplier += 0.1;
    }

    const g = this.chosenGoal();
    if (this.balance() >= (g?.cost ?? Infinity)) {
      this.reachedGoal = true;
      this.finish();
      return;
    }

    this.day++;
    if (this.day > this.maxDays) {
      this.finish();
      return;
    }
    this.pickEvent();
  }

  protected finish(): void {
    this.isComplete = true;
    this.totalEnd = this.balance();
    this.result.emit({
      saved: this.savedAmount(),
      spent: this.totalSpent,
      earned: this.balance() + this.totalSpent - 5,
      invested: this.totalInvested,
      returns: this.totalReturns,
      totalJobs: this.maxDays,
      highEffortJobs: Math.round(this.totalInvested / 5),
      reachedGoal: this.reachedGoal,
      goalCost: this.chosenGoal()?.cost ?? 78,
      finalBalance: this.totalEnd,
    });
  }
}
