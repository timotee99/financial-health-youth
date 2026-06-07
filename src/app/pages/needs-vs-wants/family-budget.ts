import { Component, Output, EventEmitter, signal, computed } from '@angular/core';

interface BudgetItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  isNeed: boolean;
}

@Component({
  selector: 'app-family-budget',
  standalone: true,
  template: `
    <div class="budget-game animate-slide-up">
      <div class="budget-header">
        <span class="bh-emoji">👨‍👩‍👧‍👦</span>
        <h2>Family Budget Challenge</h2>
        <p>The family has <strong>$100</strong> to spend this week. Choose what to pay for!</p>
      </div>

      <div class="budget-bar">
        <span>💰 {{ '$' + remaining() }} remaining</span>
        <div class="budget-track">
          <div class="budget-fill" [style.width.%]="spentPercent()"></div>
        </div>
      </div>

      <div class="budget-items">
        @for (item of items; track item.id) {
          <button class="budget-choice" [class.paid]="paidIds().includes(item.id)"
                  (click)="toggleItem(item)" [disabled]="!paidIds().includes(item.id) && item.cost > remaining()">
            <span class="bc-emoji">{{ item.emoji }}</span>
            <div class="bc-info">
              <span class="bc-name">{{ item.name }}</span>
              <span class="bc-cost">{{ '$' + item.cost }}</span>
            </div>
            @if (item.isNeed) {
              <span class="bc-tag need">Need</span>
            } @else {
              <span class="bc-tag want">Want</span>
            }
            @if (paidIds().includes(item.id)) {
              <span class="bc-paid">✅</span>
            }
          </button>
        }
      </div>

      <div class="spending-summary">
        <div class="summary-row need-row">
          <span>Needs covered:</span>
          <span>{{ needsPaid() }} / {{ totalNeeds }}</span>
        </div>
        <div class="summary-row want-row">
          <span>Wants covered:</span>
          <span>{{ wantsPaid() }} / {{ totalWants }}</span>
        </div>
      </div>

      @if (showResult) {
        <div class="budget-result">
          @if (needsPaid() === totalNeeds) {
            <div class="result-card good">
              <span>🎉</span>
              <p><strong>Excellent!</strong> You covered all the family's needs first! The family has food, shelter, electricity, and water. Now they can enjoy any remaining wants!</p>
            </div>
          } @else {
            <div class="result-card bad">
              <span>😬</span>
              <p><strong>Oh no!</strong> The family is missing some needs! Food, housing, electricity, and water must come first. Try again!</p>
            </div>
          }
          <button class="btn-primary" (click)="done.emit()">Continue ➡️</button>
        </div>
      }

      @if (!showResult && remaining() < 10 && !allPaid()) {
        <button class="btn-primary" (click)="finishBudget()">✅ Done Planning</button>
      }
    </div>
  `,
  styles: [`
    .budget-game { margin: 16px 0; }
    .budget-header {
      text-align: center;
      background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .bh-emoji { font-size: 40px; display: block; }
    .budget-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #1565C0; margin: 4px 0; }
    .budget-header p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; margin: 4px 0 0; }
    .budget-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      font-family: 'Fredoka', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #FF6F00;
    }
    .budget-track {
      flex: 1;
      height: 12px;
      background: #E0E0E0;
      border-radius: 6px;
      overflow: hidden;
    }
    .budget-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #FF9800, #F44336);
      border-radius: 6px;
      transition: width 0.3s;
    }
    .budget-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .budget-choice {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      border: 3px solid #E0E0E0;
      border-radius: 14px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      text-align: left;
    }
    .budget-choice:hover:not(:disabled) { border-color: #FFD54F; }
    .budget-choice.paid { border-color: #4CAF50; background: #F1F8E9; }
    .budget-choice:disabled:not(.paid) { opacity: 0.5; cursor: not-allowed; }
    .bc-emoji { font-size: 28px; }
    .bc-info { flex: 1; }
    .bc-name { font-family: 'Fredoka', sans-serif; font-size: 16px; display: block; }
    .bc-cost { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; }
    .bc-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 10px;
    }
    .bc-tag.need { background: #E8F5E9; color: #2E7D32; }
    .bc-tag.want { background: #FFF3E0; color: #E65100; }
    .bc-paid { font-size: 20px; }
    .spending-summary {
      background: white;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 600;
      padding: 4px 0;
    }
    .summary-row.need-row { color: #2E7D32; }
    .summary-row.want-row { color: #E65100; }
    .budget-result { margin-top: 12px; }
    .result-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 16px;
      border-radius: 16px;
      margin-bottom: 12px;
    }
    .result-card.good { background: #E8F5E9; }
    .result-card.bad { background: #FFF3E0; }
    .result-card span { font-size: 28px; }
    .result-card p { margin: 0; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.5; }
  `]
})
export class FamilyBudgetComponent {
  @Output() done = new EventEmitter<void>();
  @Output() score = new EventEmitter<number>();

  items: BudgetItem[] = [
    { id: 'food', name: 'Food & Groceries', emoji: '🛒', cost: 30, isNeed: true },
    { id: 'rent', name: 'Housing', emoji: '🏠', cost: 25, isNeed: true },
    { id: 'electricity', name: 'Electricity', emoji: '💡', cost: 15, isNeed: true },
    { id: 'water', name: 'Water Bill', emoji: '🚰', cost: 10, isNeed: true },
    { id: 'toys', name: 'New Toys', emoji: '🧸', cost: 20, isNeed: false },
    { id: 'vacation', name: 'Vacation Fun', emoji: '🏖️', cost: 25, isNeed: false },
    { id: 'games', name: 'Video Games', emoji: '🎮', cost: 15, isNeed: false },
    { id: 'movies', name: 'Movie Night', emoji: '🎬', cost: 10, isNeed: false },
  ];

  paidIds = signal<string[]>([]);
  showResult = false;

  totalNeeds = this.items.filter((i) => i.isNeed).length;
  totalWants = this.items.filter((i) => !i.isNeed).length;

  remaining = computed(() => {
    const spent = this.items
      .filter((i) => this.paidIds().includes(i.id))
      .reduce((sum, i) => sum + i.cost, 0);
    return 100 - spent;
  });

  spentPercent = computed(() => {
    const spent = this.items
      .filter((i) => this.paidIds().includes(i.id))
      .reduce((sum, i) => sum + i.cost, 0);
    return (spent / 100) * 100;
  });

  needsPaid = computed(() =>
    this.items.filter((i) => i.isNeed && this.paidIds().includes(i.id)).length
  );
  wantsPaid = computed(() =>
    this.items.filter((i) => !i.isNeed && this.paidIds().includes(i.id)).length
  );

  allPaid = computed(() => this.paidIds().length === this.items.length);

  toggleItem(item: BudgetItem): void {
    this.paidIds.update((ids) => {
      if (ids.includes(item.id)) return ids.filter((id) => id !== item.id);
      if (this.remaining() < item.cost) return ids;
      return [...ids, item.id];
    });
  }

  finishBudget(): void {
    this.showResult = true;
    const needsAll = this.needsPaid() === this.totalNeeds;
    this.score.emit(needsAll ? 25 : 5);
  }
}
