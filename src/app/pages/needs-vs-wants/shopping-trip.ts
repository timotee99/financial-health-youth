import { Component, Output, EventEmitter } from '@angular/core';

export interface PurchaseItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  isNeed: boolean;
}

@Component({
  selector: 'app-shopping-trip',
  standalone: true,
  template: `
    <div class="shopping-game animate-slide-up">
      <div class="wallet-bar">
        <span class="wallet-label">Money Mike's Wallet:</span>
        <span class="wallet-amount" [class.danger]="remaining < 5">{{ '$' + remaining }}</span>
      </div>

      <p class="shopping-intro">Money Mike has <strong>$30</strong>. He needs lunch and school supplies. He also wants candy and a toy robot. What should he buy?</p>

      <div class="shop-items">
        @for (item of items; track item.id) {
          <button class="shop-item" [class.bought]="boughtItems.includes(item.id)"
                  [class.disabled]="item.price > remaining || boughtItems.includes(item.id)"
                  (click)="buy(item)" [disabled]="item.price > remaining || boughtItems.includes(item.id)">
            <span class="si-emoji">{{ item.emoji }}</span>
            <span class="si-name">{{ item.name }}</span>
            <span class="si-price">{{ '$' + item.price }}</span>
            @if (item.isNeed) {
              <span class="si-tag need-tag">Need</span>
            } @else {
              <span class="si-tag want-tag">Want</span>
            }
            @if (boughtItems.includes(item.id)) {
              <span class="bought-check">✅</span>
            }
          </button>
        }
      </div>

      <div class="cart-summary">
        <h3>Shopping Cart</h3>
        @if (boughtItems.length === 0) {
          <p class="empty-cart">Click items to buy them</p>
        } @else {
          <div class="cart-items">
            @for (id of boughtItems; track id) {
              <div class="cart-item">
                <span>{{ getItem(id)?.emoji }}</span>
                <span>{{ getItem(id)?.name }}</span>
                <span>{{ '$' + (getItem(id)?.price ?? 0) }}</span>
              </div>
            }
          </div>
        }
        <div class="cart-total">
          <span>Spent: {{ '$' + spent }}</span>
          <span>Left: {{ '$' + remaining }}</span>
        </div>
      </div>

      @if (showResult) {
      <div class="consequences">
        <div class="consequence-card" [class.good]="boughtNeedsFirst">
          <span class="con-emoji">{{ boughtNeedsFirst ? '🎉' : '😮' }}</span>
          <div class="con-text">
            @if (boughtNeedsFirst) {
              <p><strong>Great choices!</strong> Money Mike got his lunch and school supplies first. He can enjoy his treats knowing his needs are covered!</p>
            } @else {
              <p><strong>Oh no!</strong> Money Mike bought candy and toys but did not have enough for school supplies. Needs should always come first!</p>
            }
          </div>
        </div>
        <button class="btn-primary" (click)="done.emit()">Continue ➡️</button>
      </div>
      }

      @if (!showResult && boughtItems.length > 0) {
        <button class="btn-primary" (click)="checkout()">✅ Done Shopping</button>
      }
    </div>
  `,
  styles: [`
    .shopping-game { margin: 16px 0; }
    .wallet-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #FFF8E1, #FFE082);
      border-radius: 16px;
      padding: 14px 20px;
      margin-bottom: 16px;
    }
    .wallet-label { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #5D4037; }
    .wallet-amount { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #2E7D32; }
    .wallet-amount.danger { color: #D32F2F; }
    .shopping-intro {
      text-align: center;
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .shop-items {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .shop-item {
      background: white;
      border: 3px solid #E0E0E0;
      border-radius: 16px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      text-align: center;
    }
    .shop-item:hover:not(:disabled) { border-color: #FFD54F; transform: translateY(-2px); }
    .shop-item.bought { border-color: #4CAF50; background: #F1F8E9; }
    .shop-item.disabled { opacity: 0.5; cursor: not-allowed; }
    .si-emoji { font-size: 32px; display: block; }
    .si-name { font-family: 'Fredoka', sans-serif; font-size: 15px; display: block; margin: 4px 0; }
    .si-price { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #FF6F00; display: block; }
    .si-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: 4px;
    }
    .need-tag { background: #E8F5E9; color: #2E7D32; }
    .want-tag { background: #FFF3E0; color: #E65100; }
    .bought-check { position: absolute; top: 4px; right: 8px; font-size: 18px; }
    .cart-summary {
      background: white;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .cart-summary h3 { font-family: 'Fredoka', sans-serif; font-size: 16px; margin-bottom: 8px; }
    .empty-cart { font-family: 'Nunito', sans-serif; font-size: 14px; color: #999; text-align: center; padding: 12px; }
    .cart-items { display: flex; flex-direction: column; gap: 4px; }
    .cart-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      padding: 4px 0;
    }
    .cart-item span:last-child { margin-left: auto; font-weight: 700; color: #FF6F00; }
    .cart-total {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 2px solid #E0E0E0;
      font-family: 'Fredoka', sans-serif;
      font-weight: 700;
      font-size: 16px;
    }
    .consequences { margin-top: 12px; }
    .consequence-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      margin-bottom: 12px;
    }
    .consequence-card.good { background: #E8F5E9; }
    .consequence-card:not(.good) { background: #FFF3E0; }
    .con-emoji { font-size: 32px; flex-shrink: 0; }
    .con-text p { margin: 0; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.5; }
    @media (max-width: 480px) {
      .shop-items { grid-template-columns: 1fr; }
    }
  `]
})
export class ShoppingTripComponent {
  @Output() done = new EventEmitter<void>();
  @Output() score = new EventEmitter<number>();

  items: PurchaseItem[] = [
    { id: 'lunch', name: 'Lunch', emoji: '🥪', price: 8, isNeed: true },
    { id: 'supplies', name: 'School Supplies', emoji: '✏️', price: 10, isNeed: true },
    { id: 'candy', name: 'Candy', emoji: '🍬', price: 5, isNeed: false },
    { id: 'robot', name: 'Toy Robot', emoji: '🤖', price: 15, isNeed: false },
  ];

  boughtItems: string[] = [];
  showResult = false;
  boughtNeedsFirst = false;

  get remaining(): number {
    const spent = this.boughtItems.reduce((sum, id) => sum + (this.getItem(id)?.price ?? 0), 0);
    return 30 - spent;
  }

  get spent(): number {
    return this.boughtItems.reduce((sum, id) => sum + (this.getItem(id)?.price ?? 0), 0);
  }

  getItem(id: string): PurchaseItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  buy(item: PurchaseItem): void {
    if (this.boughtItems.includes(item.id)) return;
    if (this.remaining < item.price) return;
    this.boughtItems.push(item.id);
    this.boughtItems = [...this.boughtItems];
  }

  checkout(): void {
    const needsBought = this.items
      .filter((i) => i.isNeed)
      .every((n) => this.boughtItems.includes(n.id));
    this.boughtNeedsFirst = needsBought;
    this.showResult = true;
    this.score.emit(needsBought ? 20 : 5);
  }
}
