import { Component, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';

interface WeekEvent {
  type: 'earn' | 'spend' | 'save' | 'give' | 'repair';
  description: string;
}

@Component({
  selector: 'app-ten-week-adventure',
  standalone: true,
  template: `
    <div class="adventure-game animate-slide-up">
      @if (!isComplete) {
        <div class="adventure-header">
          <span class="ah-emoji">🗓️</span>
          <h2>10-Week Adventure</h2>
          <p>Week {{ week }} of 10</p>
          <div class="week-track">
            @for (w of [1,2,3,4,5,6,7,8,9,10]; track w) {
              <div class="week-dot" [class.active]="w === week" [class.done]="w < week"></div>
            }
          </div>
        </div>

        <div class="wallet-display">
          <span>💰 Wallet: {{ '$' + wallet() }}</span>
        </div>

        <div class="totals-row">
          <div class="total-badge spend-badge"><span>🛒</span> {{ '$' + totalSpend }}</div>
          <div class="total-badge save-badge"><span>🏦</span> {{ '$' + totalSave }}</div>
          <div class="total-badge give-badge"><span>❤️</span> {{ '$' + totalGive }}</div>
        </div>

        <div class="week-card animate-pop">
          <span class="wc-emoji">{{ eventEmoji }}</span>
          <p class="wc-desc">{{ currentEvent?.description }}</p>

          @if (eventType === 'earn') {
            <div class="wc-action">
              <p>How much do you save?</p>
              <div class="slider-row">
                <button class="btn-minus" (click)="adjustSave(-5)">−</button>
                <span class="slider-val">Save {{ '$' + saveThisRound }}</span>
                <button class="btn-plus" (click)="adjustSave(5)">+</button>
              </div>
              <div class="save-range">
                <span>Spend {{ '$' + (earnAmount - saveThisRound) }}</span>
              </div>
              <button class="btn-primary" (click)="confirmEarn()">✅ Confirm</button>
            </div>
          }

          @if (eventType === 'spend') {
            <div class="wc-action">
              <p>What do you do?</p>
              <button class="choice-btn spend" (click)="chooseSpend()">🛒 Buy it ({{ '$' + eventCost }})</button>
              <button class="choice-btn save" (click)="chooseSkip()">🏦 Skip it (save {{ '$' + eventCost }})</button>
            </div>
          }

          @if (eventType === 'give') {
            <div class="wc-action">
              <p>Do you want to give {{ '$' + eventCost }}?</p>
              <button class="choice-btn give" (click)="chooseGive()">❤️ Yes, give {{ '$' + eventCost }}</button>
              <button class="choice-btn save" (click)="chooseSkip()">🏦 Keep it</button>
            </div>
          }

          @if (eventType === 'repair') {
            <div class="wc-action">
              <p>Repair costs {{ '$' + eventCost }}. Pay for it?</p>
              <button class="choice-btn spend" (click)="chooseRepair()">🔧 Pay {{ '$' + eventCost }}</button>
              <button class="choice-btn save" (click)="chooseSkipRepair()">Skip (save {{ '$' + eventCost }})</button>
            </div>
          }

          @if (eventType === 'save') {
            <div class="wc-action">
              <p>You found {{ '$' + eventCost }}! What do you do?</p>
              <button class="choice-btn save" (click)="chooseAddToSave()">🏦 Add to savings</button>
              <button class="choice-btn spend" (click)="chooseAddToSpend()">🛒 Spend it</button>
            </div>
          }
        </div>
      }

      @if (isComplete) {
        <div class="adventure-final">
          <h2>🎉 Adventure Complete!</h2>

          <div class="final-story">
            <p>Over 10 weeks, you earned <strong>{{ '$' + totalEarned }}</strong>.</p>
            <p>You spent <strong>{{ '$' + totalSpend }}</strong> on things along the way.</p>
            <p>You saved <strong>{{ '$' + totalSave }}</strong> for your future.</p>
            <p>You gave <strong>{{ '$' + totalGive }}</strong> to help others.</p>
          </div>

          <div class="final-bars">
            <div class="fb-row">
              <span>🛒 Spend</span>
              <div class="fb-track"><div class="fb-fill spend" [style.width.%]="spendPct"></div></div>
              <span>{{ '$' + totalSpend }}</span>
            </div>
            <div class="fb-row">
              <span>🏦 Save</span>
              <div class="fb-track"><div class="fb-fill save" [style.width.%]="savePct"></div></div>
              <span>{{ '$' + totalSave }}</span>
            </div>
            <div class="fb-row">
              <span>❤️ Give</span>
              <div class="fb-track"><div class="fb-fill give" [style.width.%]="givePct"></div></div>
              <span>{{ '$' + totalGive }}</span>
            </div>
          </div>

          <div class="final-reflection">
            @if (savePct >= 40) {
              <p>🌟 You are a dedicated saver! Your future self will thank you.</p>
            } @else if (givePct >= 25) {
              <p>❤️ You have a generous spirit! Giving makes the world better.</p>
            } @else if (spendPct >= 60) {
              <p>🛒 You enjoy spending on experiences and treats. Just try to save a little too!</p>
            } @else {
              <p>⚖️ You found a balanced approach to money. Well done!</p>
            }
          </div>

          <button class="btn-primary" (click)="done.emit()">See My Personality ➡️</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .adventure-game { margin: 16px 0; }
    .adventure-header { text-align: center; margin-bottom: 16px; }
    .ah-emoji { font-size: 40px; display: block; }
    .adventure-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 4px 0; }
    .adventure-header p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; }
    .week-track { display: flex; gap: 6px; justify-content: center; margin-top: 8px; }
    .week-dot {
      width: 20px; height: 20px; border-radius: 50%;
      background: #E0E0E0; transition: all 0.3s;
    }
    .week-dot.active { background: #FFD54F; transform: scale(1.3); }
    .week-dot.done { background: #4CAF50; }
    .wallet-display {
      text-align: center; font-family: 'Fredoka', sans-serif; font-size: 24px;
      font-weight: 700; color: #FF6F00; margin-bottom: 8px;
    }
    .totals-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; }
    .total-badge {
      font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700;
      padding: 6px 12px; border-radius: 20px; background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    .spend-badge { color: #1565C0; }
    .save-badge { color: #2E7D32; }
    .give-badge { color: #C62828; }
    .week-card {
      background: white; border-radius: 24px; padding: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 480px; margin: 0 auto;
      text-align: center;
    }
    .wc-emoji { font-size: 56px; display: block; margin-bottom: 8px; }
    .wc-desc { font-family: 'Nunito', sans-serif; font-size: 16px; color: #333; font-weight: 600; margin-bottom: 16px; }
    .wc-action p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; margin-bottom: 12px; }
    .slider-row {
      display: flex; align-items: center; gap: 12px; justify-content: center; margin-bottom: 8px;
    }
    .btn-minus, .btn-plus {
      width: 40px; height: 40px; border-radius: 50%; border: none;
      font-size: 20px; font-weight: 700; cursor: pointer;
      background: #F5F5F5; color: #333;
    }
    .slider-val { font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #2E7D32; min-width: 100px; }
    .save-range { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; margin-bottom: 12px; }
    .choice-btn {
      display: block; width: 100%; padding: 14px; border-radius: 50px;
      font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700;
      border: none; cursor: pointer; margin-bottom: 8px; transition: all 0.2s;
    }
    .choice-btn:hover { transform: translateY(-2px); }
    .choice-btn.spend { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .choice-btn.save { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .choice-btn.give { background: linear-gradient(135deg, #E91E63, #F06292); color: white; }
    .adventure-final { text-align: center; }
    .adventure-final h2 { font-family: 'Fredoka', sans-serif; font-size: 26px; margin-bottom: 16px; }
    .final-story {
      background: #FFF8E1; border-radius: 16px; padding: 16px;
      font-family: 'Nunito', sans-serif; font-size: 15px; line-height: 1.8;
      margin-bottom: 16px;
    }
    .final-story p { margin: 4px 0; }
    .final-bars { margin-bottom: 16px; }
    .fb-row {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600;
    }
    .fb-row span:first-child { min-width: 50px; }
    .fb-row span:last-child { min-width: 40px; text-align: right; }
    .fb-track { flex: 1; height: 14px; background: #E0E0E0; border-radius: 7px; overflow: hidden; }
    .fb-fill { height: 100%; border-radius: 7px; transition: width 0.5s; }
    .fb-fill.spend { background: #2196F3; }
    .fb-fill.save { background: #4CAF50; }
    .fb-fill.give { background: #E91E63; }
    .final-reflection {
      background: #E8F5E9; border-radius: 16px; padding: 16px;
      font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600;
      margin-bottom: 16px;
    }
  `]
})
export class TenWeekAdventureComponent implements OnInit {
  @Output() done = new EventEmitter<void>();
  @Output() result = new EventEmitter<{ totalSpend: number; totalSave: number; totalGive: number; totalEarned: number }>();

  protected week = 1;
  protected wallet = signal(20);
  protected totalEarned = 20;
  protected totalSpend = 0;
  protected totalSave = 0;
  protected totalGive = 0;

  protected currentEvent: WeekEvent | null = null;
  protected eventType: string = '';
  protected eventCost = 0;
  protected earnAmount = 0;
  protected saveThisRound = 0;
  protected isComplete = false;

  protected spendPct = 0;
  protected savePct = 0;
  protected givePct = 0;

  private events: WeekEvent[] = [
    { type: 'earn', description: 'You earned money from your lemonade stand!' },
    { type: 'spend', description: 'There is a big ice cream sale at the corner store!' },
    { type: 'give', description: 'A friend is raising money for the animal shelter.' },
    { type: 'earn', description: 'You helped a neighbor with yard work and they paid you!' },
    { type: 'repair', description: 'Oh no! Your bike has a flat tire and needs repair.' },
    { type: 'save', description: 'You found some money in an old jacket pocket!' },
    { type: 'spend', description: 'A new video game you wanted is on sale!' },
    { type: 'give', description: 'Your school is collecting donations for food bank.' },
    { type: 'earn', description: 'Grandma gave you money for helping her garden!' },
    { type: 'spend', description: 'Your friends are going to the movies and invite you!' },
  ];

  private eventIndex = 0;

  ngOnInit(): void {
    this.nextEvent();
  }

  get eventEmoji(): string {
    const map: Record<string, string> = {
      earn: '💰', spend: '🛒', give: '❤️', save: '🎁', repair: '🔧',
    };
    return map[this.eventType] || '📌';
  }

  private nextEvent(): void {
    const ev = this.events[this.eventIndex % this.events.length];
    this.currentEvent = ev;
    this.eventType = ev.type;
    this.eventIndex++;

    if (ev.type === 'earn') {
      this.earnAmount = 5 + Math.floor(Math.random() * 11);
      this.saveThisRound = Math.min(this.earnAmount, 5);
    } else if (ev.type === 'spend' || ev.type === 'give' || ev.type === 'repair') {
      this.eventCost = 5 + Math.floor(Math.random() * 11);
    } else if (ev.type === 'save') {
      this.eventCost = 5 + Math.floor(Math.random() * 6);
    }
  }

  protected adjustSave(delta: number): void {
    this.saveThisRound = Math.max(0, Math.min(this.earnAmount, this.saveThisRound + delta));
  }

  protected confirmEarn(): void {
    const spendNow = this.earnAmount - this.saveThisRound;
    this.wallet.update((w) => w + this.earnAmount);
    this.totalEarned += this.earnAmount;
    this.totalSave += this.saveThisRound;
    this.totalSpend += spendNow;
    this.wallet.update((w) => w - spendNow);
    this.advanceWeek();
  }

  protected chooseSpend(): void {
    if (this.wallet() >= this.eventCost) {
      this.wallet.update((w) => w - this.eventCost);
      this.totalSpend += this.eventCost;
    }
    this.advanceWeek();
  }

  protected chooseGive(): void {
    if (this.wallet() >= this.eventCost) {
      this.wallet.update((w) => w - this.eventCost);
      this.totalGive += this.eventCost;
    }
    this.advanceWeek();
  }

  protected chooseRepair(): void {
    if (this.wallet() >= this.eventCost) {
      this.wallet.update((w) => w - this.eventCost);
      this.totalSpend += this.eventCost;
    }
    this.advanceWeek();
  }

  protected chooseSkip(): void {
    this.advanceWeek();
  }

  protected chooseSkipRepair(): void {
    this.advanceWeek();
  }

  protected chooseAddToSave(): void {
    this.wallet.update((w) => w + this.eventCost);
    this.totalEarned += this.eventCost;
    this.totalSave += this.eventCost;
    this.advanceWeek();
  }

  protected chooseAddToSpend(): void {
    this.wallet.update((w) => w + this.eventCost);
    this.totalEarned += this.eventCost;
    this.totalSpend += this.eventCost;
    this.advanceWeek();
  }

  private advanceWeek(): void {
    if (this.week >= 10) {
      this.finish();
    } else {
      this.week++;
      this.nextEvent();
    }
  }

  private finish(): void {
    const total = this.totalSpend + this.totalSave + this.totalGive;
    this.spendPct = total > 0 ? (this.totalSpend / total) * 100 : 0;
    this.savePct = total > 0 ? (this.totalSave / total) * 100 : 0;
    this.givePct = total > 0 ? (this.totalGive / total) * 100 : 0;
    this.isComplete = true;
    this.result.emit({
      totalSpend: this.totalSpend,
      totalSave: this.totalSave,
      totalGive: this.totalGive,
      totalEarned: this.totalEarned,
    });
  }
}
