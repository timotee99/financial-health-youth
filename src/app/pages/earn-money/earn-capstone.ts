import { Component, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';

interface EarnGoal {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

interface JobOption {
  id: string;
  name: string;
  emoji: string;
  effort: 'low' | 'medium' | 'high';
  pay: number;
  description: string;
}

interface RoundEvent {
  type: 'normal' | 'bonus' | 'slow' | 'opportunity';
  label: string;
  emoji: string;
  multiplier?: number;
}

@Component({
  selector: 'app-earn-capstone',
  standalone: true,
  template: `
    <div class="capstone animate-slide-up">
      @if (!goalChosen) {
        <div class="cp-pick">
          <h2>🎯 Pick Your Dream Goal</h2>
          <p>You start with <strong>$0</strong>. Choose a goal and earn your way there!</p>
          <div class="cp-goals">
            @for (g of goals; track g.id) {
              <button class="cp-goal" (click)="pickGoal(g)">
                <span class="cpg-emoji">{{ g.emoji }}</span>
                <span class="cpg-name">{{ g.name }}</span>
                <span class="cpg-cost">{{ '$' + g.cost }}</span>
              </button>
            }
          </div>
        </div>
      }

      @if (goalChosen && !isComplete) {
        <div class="cp-active">
          <div class="cp-header">
            <span class="cph-emoji">{{ chosenGoal()?.emoji }}</span>
            <div><h3>{{ chosenGoal()?.name }}</h3><span class="cph-cost">{{ '$' + chosenGoal()?.cost }} goal</span></div>
            <div class="cph-earned"><span>{{ '$' + totalEarned }}</span>earned total</div>
          </div>

          <div class="cp-progress">
            <div class="cp-bar"><div class="cp-fill" [style.width.%]="progressPct()"></div></div>
            <span class="cp-pct">{{ '$' + savedAmount() }} / {{ '$' + chosenGoal()?.cost }}</span>
          </div>

          <div class="round-badge">{{ currentEvent.label }} {{ currentEvent.emoji }}</div>

          <div class="cp-jobs">
            <p class="cp-prompt">Choose a job for this round:</p>
            @for (job of jobs; track job.id) {
              <button class="cp-job" (click)="chooseJob(job)">
                <span class="cpj-emoji">{{ job.emoji }}</span>
                <div class="cpj-info">
                  <span class="cpj-name">{{ job.name }}</span>
                  <span class="cpj-desc">{{ job.description }}</span>
                </div>
                <div class="cpj-reward">
                  <span class="cpj-effort effort-{{ job.effort }}">{{ job.effort }}</span>
                  <span class="cpj-pay">+{{ '$' + jobPay(job) }}</span>
                </div>
              </button>
            }
          </div>

          <div class="round-counter">Day {{ round }} / {{ maxRounds }}</div>
        </div>
      }

      @if (isComplete) {
        <div class="cp-result">
          <span class="cpr-emoji">{{ reachedGoal ? '🎉' : '💪' }}</span>
          <h2>{{ reachedGoal ? 'Goal Reached!' : 'Keep Going!' }}</h2>

          <div class="cpr-story">
            <p>Over 10 days, you earned <strong>{{ '$' + totalEarned }}</strong>.</p>
            <p>You saved <strong>{{ '$' + savedAmount() }}</strong> toward your {{ chosenGoal()?.name }}.</p>
            <p>You spent <strong>{{ '$' + totalSpent }}</strong> on other things.</p>
            @if (reachedGoal) {
              <p>🎉 You reached your goal! Every job you did, every time you chose to save — it all added up!</p>
            } @else {
              <p>You almost made it! With a few more days of earning and saving, you would reach your goal for sure.</p>
            }
          </div>

          <div class="cpr-insight">
            <span class="cpri-emoji">{{ insightEmoji }}</span>
            <p>{{ insightText }}</p>
          </div>

          <div class="cpr-stats">
            <div class="cprs-item"><span class="cprs-val">{{ '$' + totalEarned }}</span><span>Total Earned</span></div>
            <div class="cprs-item"><span class="cprs-val">{{ '$' + savedAmount() }}</span><span>Saved for Goal</span></div>
            <div class="cprs-item"><span class="cprs-val">{{ totalJobs }} jobs</span><span>Jobs Done</span></div>
          </div>

          <button class="btn-primary" (click)="done.emit()">See My Earning Personality ➡️</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .capstone { margin: 16px 0; }
    .cp-pick { text-align: center; }
    .cp-pick h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin-bottom: 6px; }
    .cp-pick p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #888; margin-bottom: 16px; }
    .cp-goals { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .cp-goal {
      background: white; border: 3px solid #E0E0E0; border-radius: 20px;
      padding: 18px 22px; cursor: pointer; text-align: center;
      transition: all 0.2s; min-width: 110px;
    }
    .cp-goal:hover { border-color: #FFD54F; transform: translateY(-3px); }
    .cpg-emoji { font-size: 40px; display: block; margin-bottom: 4px; }
    .cpg-name { font-family: 'Fredoka', sans-serif; font-size: 15px; display: block; }
    .cpg-cost { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #FF6F00; display: block; margin-top: 4px; }
    .cp-active { max-width: 520px; margin: 0 auto; }
    .cp-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cph-emoji { font-size: 36px; }
    .cp-header h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 0; }
    .cph-cost { font-family: 'Nunito', sans-serif; font-size: 12px; color: #FF6F00; font-weight: 600; }
    .cph-earned { margin-left: auto; text-align: center; }
    .cph-earned span { font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #2E7D32; display: block; }
    .cph-earned { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; }
    .cp-progress { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cp-bar { flex: 1; height: 14px; background: #E0E0E0; border-radius: 7px; overflow: hidden; }
    .cp-fill { height: 100%; background: linear-gradient(90deg, #FF9800, #FFB74D); border-radius: 7px; transition: width 0.4s; }
    .cp-pct { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #666; }
    .round-badge { text-align: center; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #888; margin-bottom: 10px; }
    .cp-prompt { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin-bottom: 10px; }
    .cp-jobs { display: flex; flex-direction: column; gap: 8px; }
    .cp-job {
      display: flex; align-items: center; gap: 10px;
      background: white; border: 3px solid #E0E0E0; border-radius: 16px;
      padding: 12px 16px; cursor: pointer; transition: all 0.2s;
      width: 100%; text-align: left;
    }
    .cp-job:hover { border-color: #FFD54F; }
    .cpj-emoji { font-size: 28px; }
    .cpj-info { flex: 1; }
    .cpj-name { font-family: 'Fredoka', sans-serif; font-size: 15px; display: block; }
    .cpj-desc { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; }
    .cpj-reward { text-align: center; }
    .cpj-effort {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      padding: 2px 8px; border-radius: 8px; display: block;
      margin-bottom: 2px;
    }
    .effort-low { background: #E8F5E9; color: #2E7D32; }
    .effort-medium { background: #FFF8E1; color: #E65100; }
    .effort-high { background: #FFEBEE; color: #C62828; }
    .cpj-pay { font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #FF6F00; }
    .round-counter { text-align: center; font-family: 'Nunito', sans-serif; font-size: 13px; color: #999; margin-top: 12px; }
    .cp-result { text-align: center; }
    .cp-result h2 { font-family: 'Fredoka', sans-serif; font-size: 24px; margin-bottom: 16px; }
    .cpr-emoji { font-size: 64px; display: block; }
    .cpr-story { background: #FFF8E1; border-radius: 16px; padding: 16px; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.8; margin-bottom: 12px; text-align: left; }
    .cpr-story p { margin: 4px 0; }
    .cpr-insight { display: flex; align-items: center; gap: 10px; background: #E8F5E9; border-radius: 14px; padding: 14px; margin-bottom: 12px; }
    .cpri-emoji { font-size: 28px; }
    .cpr-insight p { margin: 0; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.5; }
    .cpr-stats { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; }
    .cprs-item { background: white; border-radius: 14px; padding: 12px 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    .cprs-val { font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: #FF6F00; display: block; }
    .cprs-item span:last-child { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; font-weight: 600; }
  `]
})
export class EarnCapstoneComponent implements OnInit {
  @Output() done = new EventEmitter<void>();
  @Output() result = new EventEmitter<{
    saved: number; spent: number; earned: number;
    totalJobs: number; highEffortJobs: number;
    reachedGoal: boolean; goalCost: number;
  }>();

  protected goals: EarnGoal[] = [
    { id: 'bike', name: 'Bicycle', emoji: '🚲', cost: 100 },
    { id: 'game', name: 'Video Game', emoji: '🎮', cost: 60 },
    { id: 'headphones', name: 'Headphones', emoji: '🎧', cost: 40 },
  ];

  protected jobs: JobOption[] = [
    { id: 'dog', name: 'Walk a Dog', emoji: '🐕', effort: 'low', pay: 5, description: 'Quick 15-minute walk around the block' },
    { id: 'yard', name: 'Yard Cleanup', emoji: '🌿', effort: 'medium', pay: 8, description: 'Rake leaves and pull weeds for 30 min' },
    { id: 'car', name: 'Wash a Car', emoji: '🧽', effort: 'medium', pay: 10, description: 'Wash and dry a neighbor\'s car' },
    { id: 'bake', name: 'Bake Sale', emoji: '🍪', effort: 'high', pay: 12, description: 'Bake and sell cookies at a stand' },
    { id: 'lemonade', name: 'Lemonade Stand', emoji: '🍋', effort: 'high', pay: 15, description: 'Set up and run a lemonade stand all afternoon' },
  ];

  protected events: RoundEvent[] = [
    { type: 'normal', label: 'Regular Day', emoji: '☀️' },
    { type: 'bonus', label: 'Bonus Day!', emoji: '🎉', multiplier: 1.5 },
    { type: 'slow', label: 'Slow Day', emoji: '☁️', multiplier: 0.5 },
    { type: 'opportunity', label: 'Extra Opportunity!', emoji: '🌟', multiplier: 2 },
  ];

  protected goalChosen = false;
  protected chosenGoalId = signal<string | null>(null);
  protected chosenGoal = computed(() => this.goals.find((g) => g.id === this.chosenGoalId()));
  protected savedAmount = signal(0);
  protected totalEarned = 0;
  protected totalSpent = 0;
  protected totalJobs = 0;
  protected highEffortJobs = 0;
  protected round = 0;
  protected maxRounds = 8;
  protected isComplete = false;
  protected reachedGoal = false;

  protected currentEvent: RoundEvent = this.events[0];

  protected progressPct = computed(() => {
    const g = this.chosenGoal();
    if (!g) return 0;
    return Math.min(100, Math.round((this.savedAmount() / g.cost) * 100));
  });

  ngOnInit(): void {
    this.pickRandomEvent();
  }

  protected pickGoal(g: EarnGoal): void {
    this.chosenGoalId.set(g.id);
    this.goalChosen = true;
    this.round = 1;
  }

  private pickRandomEvent(): void {
    this.currentEvent = this.events[Math.floor(Math.random() * this.events.length)];
  }

  protected jobPay(job: JobOption): number {
    const mult = this.currentEvent.multiplier ?? 1;
    return Math.round(job.pay * mult);
  }

  protected chooseJob(job: JobOption): void {
    const pay = this.jobPay(job);
    this.totalEarned += pay;
    this.totalJobs++;
    if (job.effort === 'high') this.highEffortJobs++;

    // Player can choose to spend some or save all
    // For simplicity: 70% chance they save, 30% they spend some
    const saveAmount = Math.random() < 0.7 ? pay : Math.round(pay * 0.4);
    const spendAmount = pay - saveAmount;
    this.savedAmount.update((v) => v + saveAmount);
    this.totalSpent += spendAmount;

    const g = this.chosenGoal();
    if (this.savedAmount() >= (g?.cost ?? Infinity)) {
      this.reachedGoal = true;
      this.finish();
      return;
    }

    this.round++;
    if (this.round > this.maxRounds) {
      this.finish();
      return;
    }
    this.pickRandomEvent();
  }

  protected get insightEmoji(): string {
    if (this.highEffortJobs >= 4) return '💪';
    if (this.totalJobs >= 6) return '📋';
    return '🧠';
  }

  protected get insightText(): string {
    if (this.highEffortJobs >= 4) return 'You chose harder jobs and earned more per task! Hard work really does pay off.';
    if (this.totalJobs >= 6) return 'You did a lot of jobs! Staying busy and consistent is a great way to earn money.';
    return 'You picked a mix of jobs — some easy, some harder. Finding the right balance is smart!';
  }

  private finish(): void {
    this.isComplete = true;
    this.result.emit({
      saved: this.savedAmount(),
      spent: this.totalSpent,
      earned: this.totalEarned,
      totalJobs: this.totalJobs,
      highEffortJobs: this.highEffortJobs,
      reachedGoal: this.reachedGoal,
      goalCost: this.chosenGoal()?.cost ?? 100,
    });
  }
}
