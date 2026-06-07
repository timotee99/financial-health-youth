import { Component, Output, EventEmitter, signal, computed } from '@angular/core';

interface PackItem {
  id: string;
  name: string;
  emoji: string;
  isUseful: boolean;
  explanation: string;
}

@Component({
  selector: 'app-survival-backpack',
  standalone: true,
  template: `
    <div class="survival-game animate-slide-up">
      <div class="scenario-box">
        <span class="scenario-emoji">🏕️</span>
        <h2>Survival Adventure!</h2>
        <p>You're going on a <strong>3-day camping trip</strong>! You can only bring <strong>5 items</strong>. Choose wisely!</p>
      </div>

      <div class="pack-counter">
        <span>Items selected: {{ selectedCount() }} / 5</span>
        <div class="counter-track">
          <div class="counter-fill" [style.width.%]="(selectedCount() / 5) * 100"></div>
        </div>
      </div>

      <div class="items-grid">
        @for (item of items; track item.id) {
          <button class="pack-item" [class.selected]="selectedIds().includes(item.id)"
                  [class.disabled]="selectedCount() >= 5 && !selectedIds().includes(item.id)"
                  (click)="toggleItem(item)" [disabled]="selectedCount() >= 5 && !selectedIds().includes(item.id)">
            <span class="pi-emoji">{{ item.emoji }}</span>
            <span class="pi-name">{{ item.name }}</span>
          </button>
        }
      </div>

      @if (showResult) {
        <div class="survival-result">
          <h3>Survival Report</h3>
          @for (item of items; track item.id) {
            <div class="eval-row" [class.good]="item.isUseful && selectedIds().includes(item.id)"
                 [class.bad]="!item.isUseful && selectedIds().includes(item.id)">
              <span class="eval-emoji">{{ item.emoji }}</span>
              <span class="eval-name">{{ item.name }}</span>
              <span class="eval-status">
                @if (selectedIds().includes(item.id)) {
                  {{ item.isUseful ? '✅ Smart pick!' : '❌ Not useful' }}
                } @else {
                  {{ item.isUseful ? '❌ You left this behind' : '✅ Smart to leave' }}
                }
              </span>
            </div>
            <p class="eval-explain">{{ item.explanation }}</p>
          }

          <div class="eval-total">
            @if (usefulPicked() >= 4) {
              <p>🏆 You are a survival expert! Great prioritization!</p>
            } @else if (usefulPicked() >= 2) {
              <p>👍 Good start! Remember to focus on what you truly need to survive.</p>
            } @else {
              <p>😅 Next time, think about what helps you survive vs what is just fun!</p>
            }
          </div>

          <button class="btn-primary" (click)="done.emit()">Continue ➡️</button>
        </div>
      }

      @if (!showResult && selectedCount() === 5) {
        <button class="btn-primary" (click)="evaluate()">✅ Check My Pack</button>
      }
    </div>
  `,
  styles: [`
    .survival-game { margin: 16px 0; }
    .scenario-box {
      text-align: center;
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .scenario-emoji { font-size: 48px; display: block; margin-bottom: 8px; }
    .scenario-box h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #2E7D32; margin: 0; }
    .scenario-box p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; margin-top: 6px; }
    .pack-counter { text-align: center; margin-bottom: 12px; }
    .pack-counter span { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #666; }
    .counter-track {
      height: 8px;
      background: #E0E0E0;
      border-radius: 4px;
      margin-top: 6px;
      overflow: hidden;
    }
    .counter-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #66BB6A);
      border-radius: 4px;
      transition: width 0.3s;
    }
    .items-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .pack-item {
      background: white;
      border: 3px solid #E0E0E0;
      border-radius: 14px;
      padding: 12px 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .pack-item:hover:not(:disabled) { border-color: #FFD54F; transform: translateY(-2px); }
    .pack-item.selected { border-color: #4CAF50; background: #F1F8E9; }
    .pack-item.disabled { opacity: 0.4; cursor: not-allowed; }
    .pi-emoji { font-size: 28px; display: block; }
    .pi-name { font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 600; color: #333; display: block; margin-top: 4px; }
    .survival-result { margin-top: 12px; }
    .survival-result h3 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin-bottom: 10px; }
    .eval-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 10px;
      margin-bottom: 2px;
    }
    .eval-row.good { background: #E8F5E9; }
    .eval-row.bad { background: #FFF3E0; }
    .eval-emoji { font-size: 20px; }
    .eval-name { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; flex: 1; }
    .eval-status { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; }
    .eval-explain {
      font-family: 'Nunito', sans-serif;
      font-size: 12px;
      color: #888;
      margin: 0 0 8px 12px;
      padding-left: 12px;
      border-left: 2px solid #E0E0E0;
    }
    .eval-total {
      text-align: center;
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      font-weight: 700;
      padding: 12px;
      margin: 10px 0;
      background: #FFF8E1;
      border-radius: 12px;
    }
    .eval-total p { margin: 0; }
    @media (max-width: 480px) {
      .items-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class SurvivalBackpackComponent {
  @Output() done = new EventEmitter<void>();
  @Output() score = new EventEmitter<number>();

  items: PackItem[] = [
    { id: 'water', name: 'Water', emoji: '💧', isUseful: true, explanation: 'You need water to survive. This is the most important item!' },
    { id: 'candy', name: 'Candy', emoji: '🍬', isUseful: false, explanation: 'Candy is tasty but does not help you survive. Better to pack food that lasts.' },
    { id: 'blanket', name: 'Blanket', emoji: '🛌', isUseful: true, explanation: 'A blanket keeps you warm at night. Staying warm is a need!' },
    { id: 'flashlight', name: 'Flashlight', emoji: '🔦', isUseful: true, explanation: 'A flashlight helps you see in the dark and can signal for help.' },
    { id: 'toy', name: 'Toy Dinosaur', emoji: '🦕', isUseful: false, explanation: 'Toys are fun but will not help you on a camping trip. Wants vs needs!' },
    { id: 'firstaid', name: 'First Aid Kit', emoji: '🩹', isUseful: true, explanation: 'A first aid kit is essential for emergencies. Definitely a need!' },
    { id: 'cookies', name: 'Cookies', emoji: '🍪', isUseful: false, explanation: 'Cookies are a treat but not the best survival food. Pack nutritious food first.' },
    { id: 'jacket', name: 'Jacket', emoji: '🧥', isUseful: true, explanation: 'A jacket protects you from cold and rain. You need it to stay safe.' },
    { id: 'tablet', name: 'Tablet', emoji: '📱', isUseful: false, explanation: 'A tablet is fun but will not help you survive. It might even get damaged!' },
    { id: 'food', name: 'Trail Mix', emoji: '🥜', isUseful: true, explanation: 'Trail mix gives you energy. Nutritious food is definitely a need!' },
    { id: 'book', name: 'Book', emoji: '📚', isUseful: false, explanation: 'A book is entertainment, not survival. Fun but not essential.' },
    { id: 'whistle', name: 'Whistle', emoji: '📯', isUseful: true, explanation: 'A whistle can signal for help if you get lost. Smart survival tool!' },
  ];

  selectedIds = signal<string[]>([]);
  showResult = false;

  selectedCount = computed(() => this.selectedIds().length);

  usefulPicked = computed(() =>
    this.items.filter((i) => i.isUseful && this.selectedIds().includes(i.id)).length
  );

  toggleItem(item: PackItem): void {
    if (this.showResult) return;
    this.selectedIds.update((ids) => {
      if (ids.includes(item.id)) return ids.filter((id) => id !== item.id);
      if (ids.length >= 5) return ids;
      return [...ids, item.id];
    });
  }

  evaluate(): void {
    this.showResult = true;
    this.score.emit(this.usefulPicked() * 5);
  }
}
