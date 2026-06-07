import { Component, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';

interface SimGoal {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

interface DayEvent {
  day: string;
  description: string;
  emoji: string;
  type: 'earn' | 'temptation' | 'bonus' | 'give';
  amount?: number;
  item?: string;
  itemCost?: number;
}

interface RoomTier {
  threshold: number;
  emoji: string;
  description: string;
}

@Component({
  selector: 'app-dream-simulator',
  standalone: true,
  template: `
    <div class="simulator animate-slide-up">
      @if (!goalChosen) {
        <div class="sim-pick-goal">
          <h2>🎯 Choose Your Dream Goal</h2>
          <p>Pick something you want to save for! You start with <strong>$20</strong>.</p>
          <div class="sim-goals">
            @for (g of goals; track g.id) {
              <button class="sim-goal-card" (click)="pickGoal(g)">
                <span class="sgc-emoji">{{ g.emoji }}</span>
                <span class="sgc-name">{{ g.name }}</span>
                <span class="sgc-cost">{{ '$' + g.cost }}</span>
              </button>
            }
          </div>
        </div>
      }

      @if (goalChosen && !isComplete) {
        <div class="sim-active">
          <div class="sim-header">
            <span class="sim-emoji">{{ chosenGoal()?.emoji }}</span>
            <div>
              <h3>{{ chosenGoal()?.name }}</h3>
              <span class="sim-cost">{{ '$' + chosenGoal()?.cost }} goal</span>
            </div>
            <div class="sim-saved"><span>{{ '$' + savedAmount() }}</span> saved</div>
          </div>

          <div class="sim-progress">
            <div class="sim-bar"><div class="sim-fill" [style.width.%]="progressPct()"></div></div>
            <span class="sim-pct">{{ progressPct() }}%</span>
          </div>

          <!-- Dream Room -->
          <div class="dream-room">
            <span class="dr-title">🏠 Your Dream Room</span>
            <div class="dr-visual">{{ currentRoomEmoji }}</div>
            <span class="dr-desc">{{ currentRoomDesc }}</span>
          </div>

          <div class="day-display">{{ currentEvent?.day }}</div>

          <div class="event-card">
            <span class="ec-emoji">{{ currentEvent?.emoji }}</span>
            <p class="ec-desc">{{ currentEvent?.description }}</p>

            @if (eventType === 'earn') {
              <div class="ec-action">
                <p>You earned <strong>{{ '$' + (currentEvent?.amount ?? 0) }}</strong>!</p>
                <button class="sim-btn save" (click)="saveEarnings()">🏦 Save it for {{ chosenGoal()?.name }}</button>
                <button class="sim-btn spend" (click)="spendEarnings()">🛒 Spend it on something fun</button>
              </div>
            }

            @if (eventType === 'temptation') {
              <div class="ec-action">
                <p>Buy <strong>{{ currentEvent?.item }}</strong> for <strong>{{ '$' + (currentEvent?.itemCost ?? 0) }}</strong>?</p>
                <button class="sim-btn save" (click)="resistTemptation()">🏦 Skip it, save instead</button>
                <button class="sim-btn spend" (click)="giveInToTemptation()">🛒 Buy it!</button>
              </div>
            }

            @if (eventType === 'bonus') {
              <div class="ec-action">
                <p>You received <strong>{{ '$' + (currentEvent?.amount ?? 0) }}</strong>!</p>
                <button class="sim-btn save" (click)="saveBonus()">🏦 Add it to your goal savings</button>
                <button class="sim-btn spend" (click)="spendBonus()">🛒 Spend it right away</button>
              </div>
            }

            @if (eventType === 'give') {
              <div class="ec-action">
                <p>{{ currentEvent?.description }}</p>
                <button class="sim-btn give" (click)="giveMoney()">❤️ Give {{ '$' + (currentEvent?.amount ?? 0) }}</button>
                <button class="sim-btn save" (click)="skipGive()">🏦 Keep it for your goal</button>
              </div>
            }
          </div>

          <div class="day-track">
            @for (d of dayDots; track d) {
              <div class="day-dot" [class.past]="d <= dayIndex" [class.current]="d === dayIndex + 1"></div>
            }
          </div>
        </div>
      }

      @if (isComplete) {
        <div class="sim-result">
          <span class="sr-emoji">{{ reachedGoal ? '🎉' : '😅' }}</span>
          <h2>{{ reachedGoal ? 'Goal Reached!' : 'Keep Trying!' }}</h2>

          <div class="sr-story">
            <p>Over 30 days, you earned <strong>{{ '$' + totalEarned }}</strong>.</p>
            <p>You saved <strong>{{ '$' + savedAmount() }}</strong> toward your {{ chosenGoal()?.name }}.</p>
            <p>You spent <strong>{{ '$' + totalSpent }}</strong> on other things.</p>
            @if (reachedGoal) {
              <p>You reached your goal! Because you waited and saved, you achieved something bigger than any small purchase along the way.</p>
            } @else {
              <p>You did not quite reach your goal this time. With a few more days of saving, you would get there!</p>
            }
          </div>

          <div class="sr-room">
            <span class="sr-room-emoji">{{ finalRoomEmoji }}</span>
            <p>{{ finalRoomDesc }}</p>
          </div>

          <div class="sr-stats">
            <div class="sr-stat"><span class="sr-stat-val">⭐ {{ waitingStars }}</span><span>Waiting Stars</span></div>
            <div class="sr-stat"><span class="sr-stat-val">{{ '$' + savedAmount() }}</span><span>Total Saved</span></div>
            <div class="sr-stat"><span class="sr-stat-val">{{ '$' + totalSpent }}</span><span>Total Spent</span></div>
          </div>

          <button class="btn-primary" (click)="done.emit()">See My Personality ➡️</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .simulator { margin: 16px 0; }
    .sim-pick-goal { text-align: center; }
    .sim-pick-goal h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin-bottom: 6px; }
    .sim-pick-goal p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #888; margin-bottom: 16px; }
    .sim-goals { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .sim-goal-card {
      background: white; border: 3px solid #E0E0E0; border-radius: 20px;
      padding: 18px 22px; cursor: pointer; text-align: center;
      transition: all 0.2s; min-width: 120px;
    }
    .sim-goal-card:hover { border-color: #FFD54F; transform: translateY(-3px); }
    .sgc-emoji { font-size: 44px; display: block; margin-bottom: 4px; }
    .sgc-name { font-family: 'Fredoka', sans-serif; font-size: 16px; display: block; }
    .sgc-cost { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #FF6F00; display: block; margin-top: 4px; }
    .sim-active { max-width: 520px; margin: 0 auto; }
    .sim-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .sim-emoji { font-size: 40px; }
    .sim-header h3 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin: 0; }
    .sim-cost { font-family: 'Nunito', sans-serif; font-size: 13px; color: #FF6F00; font-weight: 600; }
    .sim-saved { margin-left: auto; text-align: center; }
    .sim-saved span { font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: #2E7D32; display: block; }
    .sim-progress { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .sim-bar { flex: 1; height: 16px; background: #E0E0E0; border-radius: 8px; overflow: hidden; }
    .sim-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #66BB6A); border-radius: 8px; transition: width 0.4s; }
    .sim-pct { font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #666; min-width: 40px; }
    .dream-room {
      text-align: center; background: #FFF8E1; border-radius: 16px;
      padding: 12px; margin-bottom: 12px;
    }
    .dr-title { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #888; }
    .dr-visual { font-size: 40px; margin: 4px 0; }
    .dr-desc { font-family: 'Nunito', sans-serif; font-size: 13px; color: #666; display: block; }
    .day-display { text-align: center; font-family: 'Fredoka', sans-serif; font-size: 16px; color: #888; margin-bottom: 10px; }
    .event-card {
      background: white; border-radius: 24px; padding: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); text-align: center;
    }
    .ec-emoji { font-size: 52px; display: block; margin-bottom: 8px; }
    .ec-desc { font-family: 'Nunito', sans-serif; font-size: 15px; color: #333; font-weight: 600; margin-bottom: 16px; }
    .ec-action p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; margin-bottom: 12px; }
    .sim-btn {
      display: block; width: 100%; padding: 12px; border-radius: 50px;
      font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700;
      border: none; cursor: pointer; margin-bottom: 8px; transition: all 0.2s;
    }
    .sim-btn:hover { transform: translateY(-2px); }
    .sim-btn.save { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .sim-btn.spend { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .sim-btn.give { background: linear-gradient(135deg, #E91E63, #F06292); color: white; }
    .day-track { display: flex; gap: 4px; justify-content: center; margin-top: 12px; }
    .day-dot {
      width: 16px; height: 16px; border-radius: 50%;
      background: #E0E0E0; transition: all 0.3s;
    }
    .day-dot.past { background: #4CAF50; }
    .day-dot.current { background: #FFD54F; transform: scale(1.3); }
    .sim-result { text-align: center; }
    .sim-result h2 { font-family: 'Fredoka', sans-serif; font-size: 24px; margin-bottom: 16px; }
    .sr-emoji { font-size: 64px; display: block; }
    .sr-story {
      background: #FFF8E1; border-radius: 16px; padding: 16px;
      font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.8;
      margin-bottom: 12px; text-align: left;
    }
    .sr-story p { margin: 4px 0; }
    .sr-room {
      background: #E8F5E9; border-radius: 16px; padding: 14px;
      margin-bottom: 12px;
    }
    .sr-room-emoji { font-size: 48px; display: block; }
    .sr-room p { font-family: 'Nunito', sans-serif; font-size: 13px; color: #555; margin: 6px 0 0; }
    .sr-stats { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; }
    .sr-stat {
      background: white; border-radius: 14px; padding: 12px 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .sr-stat-val { font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #FF6F00; display: block; }
    .sr-stat span:last-child { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; font-weight: 600; }
  `]
})
export class DreamSimulatorComponent implements OnInit {
  @Output() done = new EventEmitter<void>();
  @Output() result = new EventEmitter<{ saved: number; spent: number; earned: number; stars: number }>();

  protected goals: SimGoal[] = [
    { id: 'bike', name: 'Bicycle', emoji: '🚲', cost: 100 },
    { id: 'lego', name: 'Lego Set', emoji: '🧱', cost: 80 },
    { id: 'tablet', name: 'Tablet', emoji: '📱', cost: 150 },
    { id: 'sports', name: 'Sports Gear', emoji: '⚽', cost: 60 },
  ];

  protected roomTiers: RoomTier[] = [
    { threshold: 0, emoji: '🛏️📦', description: 'Basic room with a plain bed and an empty desk.' },
    { threshold: 25, emoji: '🛏️🪴', description: 'You added a plant to your desk! The room feels cozier.' },
    { threshold: 50, emoji: '🛏️📚🪴', description: 'A bookshelf appeared! Your room is starting to look great.' },
    { threshold: 75, emoji: '🛏️📚🎮🪴', description: 'You unlocked a gaming setup! Your dream room is coming together!' },
    { threshold: 100, emoji: '🛏️📚🎮📺🪴🚲', description: 'Your dream room is complete! Bed, books, games, TV, and your goal item!' },
  ];

  protected goalChosen = false;
  protected chosenGoalId = signal<string | null>(null);
  protected chosenGoal = computed(() => this.goals.find((g) => g.id === this.chosenGoalId()));
  protected savedAmount = signal(20);
  protected totalSpent = 0;
  protected totalEarned = 20;
  protected waitingStars = 0;
  protected dayIndex = 0;
  protected isComplete = false;
  protected reachedGoal = false;

  protected currentEvent: DayEvent | null = null;
  protected eventType = '';
  protected dayDots = [1, 2, 3, 4, 5, 6, 7, 8];

  protected progressPct = computed(() => {
    const g = this.chosenGoal();
    if (!g) return 0;
    return Math.min(100, Math.round((this.savedAmount() / g.cost) * 100));
  });

  protected get currentRoomEmoji(): string {
    const sv = this.savedAmount();
    let tier = this.roomTiers[0];
    for (const t of this.roomTiers) {
      if (sv >= t.threshold) tier = t;
    }
    return tier.emoji;
  }

  protected get currentRoomDesc(): string {
    const sv = this.savedAmount();
    let tier = this.roomTiers[0];
    for (const t of this.roomTiers) {
      if (sv >= t.threshold) tier = t;
    }
    return tier.description;
  }

  protected get finalRoomEmoji(): string {
    return this.reachedGoal ? '🛏️📚🎮📺🪴🚲' : this.currentRoomEmoji;
  }

  protected get finalRoomDesc(): string {
    return this.reachedGoal
      ? 'Your dream room is complete! Because you waited and saved, you transformed your space!'
      : this.currentRoomDesc;
  }

  private events: DayEvent[] = [
    { day: 'Day 1-3', description: 'You set up a lemonade stand and earned money!', emoji: '🍋', type: 'earn', amount: 8 },
    { day: 'Day 4-6', description: 'Your friend invites you to buy ice cream together.', emoji: '🍦', type: 'temptation', item: 'ice cream', itemCost: 5 },
    { day: 'Day 7-9', description: 'Grandma sends you birthday money!', emoji: '🎁', type: 'bonus', amount: 10 },
    { day: 'Day 10-12', description: 'You see a cool toy at the store. It is on sale!', emoji: '🧸', type: 'temptation', item: 'toy', itemCost: 6 },
    { day: 'Day 13-15', description: 'You walk a neighbor\'s dog and they pay you.', emoji: '🐕', type: 'earn', amount: 12 },
    { day: 'Day 16-18', description: 'Your friend is raising money for a good cause.', emoji: '🤝', type: 'give', amount: 3 },
    { day: 'Day 19-21', description: 'You find money in an old coat pocket!', emoji: '🪙', type: 'bonus', amount: 5 },
    { day: 'Day 22-30', description: 'Final stretch! You earned extra by doing chores.', emoji: '🧹', type: 'earn', amount: 15 },
  ];

  ngOnInit(): void {
    this.nextDay();
  }

  protected pickGoal(g: SimGoal): void {
    this.chosenGoalId.set(g.id);
    this.goalChosen = true;
  }

  private nextDay(): void {
    if (this.dayIndex >= this.events.length) {
      this.finish();
      return;
    }
    this.currentEvent = this.events[this.dayIndex];
    this.eventType = this.currentEvent.type;
  }

  protected saveEarnings(): void {
    this.savedAmount.update((v) => v + (this.currentEvent?.amount ?? 0));
    this.waitingStars++;
    this.totalEarned += this.currentEvent?.amount ?? 0;
    this.advance();
  }

  protected spendEarnings(): void {
    this.totalSpent += this.currentEvent?.amount ?? 0;
    this.totalEarned += this.currentEvent?.amount ?? 0;
    this.advance();
  }

  protected resistTemptation(): void {
    this.waitingStars++;
    this.advance();
  }

  protected giveInToTemptation(): void {
    const cost = this.currentEvent?.itemCost ?? 0;
    this.totalSpent += cost;
    this.advance();
  }

  protected saveBonus(): void {
    this.savedAmount.update((v) => v + (this.currentEvent?.amount ?? 0));
    this.waitingStars++;
    this.totalEarned += this.currentEvent?.amount ?? 0;
    this.advance();
  }

  protected spendBonus(): void {
    this.totalSpent += this.currentEvent?.amount ?? 0;
    this.totalEarned += this.currentEvent?.amount ?? 0;
    this.advance();
  }

  protected giveMoney(): void {
    const amt = this.currentEvent?.amount ?? 0;
    this.totalSpent += amt;
    this.totalEarned += amt;
    this.waitingStars++;
    this.advance();
  }

  protected skipGive(): void {
    this.advance();
  }

  private advance(): void {
    this.dayIndex++;
    const g = this.chosenGoal();
    if (this.savedAmount() >= (g?.cost ?? Infinity)) {
      this.reachedGoal = true;
      this.finish();
      return;
    }
    this.nextDay();
  }

  private finish(): void {
    this.isComplete = true;
    this.result.emit({
      saved: this.savedAmount(),
      spent: this.totalSpent,
      earned: this.totalEarned,
      stars: this.waitingStars,
    });
  }
}
