import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-save-spend-give',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent, DragDropModule],
  template: `
    <div class="page-container">
      @if (!started) {
        <div class="intro animate-slide-up">
          <app-money-mike message="Every dollar has a purpose! Let me show you three smart things you can do with your money!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <h2>🏦 Save</h2>
            <p>Saving means putting money aside for later. You might save for something big like a bicycle, or save for emergencies, or save for your future!</p>
            <div class="example-row">
              <div class="save-example"><span>🎯</span> Saving for a new bike</div>
              <div class="save-example"><span>🏫</span> Saving for college</div>
              <div class="save-example"><span>🚨</span> Emergency fund</div>
            </div>
          </div>

          <div class="lesson-content card">
            <h2>🛒 Spend</h2>
            <p>Spending is using money to buy things you need or want. The key is to spend <em>wisely</em> — compare prices and think about whether it's worth it!</p>
            <div class="example-row">
              <div class="spend-example"><span>🛍️</span> Buying school supplies</div>
              <div class="spend-example"><span>🎬</span> Going to the movies</div>
              <div class="spend-example"><span>🍕</span> Buying a treat</div>
            </div>
          </div>

          <div class="lesson-content card">
            <h2>❤️ Give</h2>
            <p>Giving means sharing your money with others who need it. You can donate to charity, help a friend, or support a cause you care about!</p>
            <div class="example-row">
              <div class="give-example"><span>🏥</span> Donate to a hospital</div>
              <div class="give-example"><span>🐾</span> Help animal shelter</div>
              <div class="give-example"><span>🎁</span> Buy a gift for someone</div>
            </div>
          </div>

          <div class="lesson-content card key-points">
            <h2>Smart Money Rule</h2>
            <div class="rule-box">
              <span class="rule-icon">💡</span>
              <p><strong>A good goal is to save some, spend some, and give some.</strong> Even putting a little in each jar makes a big difference!</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">⚖️</span>
              <p>There is no single "right" way to split your money. What matters is that you think carefully about each choice.</p>
            </div>
            <div class="rule-box">
              <span class="rule-icon">🌟</span>
              <p>Try to <strong>save at least 20%</strong> of any money you receive. Your future self will thank you!</p>
            </div>
          </div>

          <div class="ready-section">
            <button class="btn-primary" (click)="startGame()" aria-label="Practice what you learned">
              🎂 Help Money Mike Spend!
            </button>
          </div>
        </div>
      }

      @if (started && !showSummary && !showComplete) {
        <div class="game-area">
          <app-money-mike message="Drag the $10 bills into the three jars to decide how to split the $50!" mood="thinking">
          </app-money-mike>

          <div class="total-money" aria-live="polite">
            <span class="total-label">Total Money to Allocate:</span>
            <span class="total-amount">$50</span>
          </div>

          <div class="allocation-status">
            <span class="status-text" [class.done]="remaining() === 0">
              {{ remaining() > 0 ? remaining() + ' bills to allocate' : 'All allocated!' }}
            </span>
          </div>

          <div class="money-pool">
            <h3>💰 Available Money</h3>
            <div cdkDropList #billsList="cdkDropList" [cdkDropListData]="bills()"
                 [cdkDropListConnectedTo]="[saveList, spendList, giveList]"
                 (cdkDropListDropped)="drop($event)" class="bills-container"
                 cdkDropListOrientation="mixed"
                 role="list" aria-label="Available money bills">
              @for (bill of bills(); track bill) {
                <div class="bill" cdkDrag [cdkDragData]="bill" role="listitem">
                  <div class="bill-inner">
                    <span class="bill-emoji">🪙</span>
                    <span class="bill-text">$10</span>
                  </div>
                </div>
              }
            </div>
            @if (bills().length === 0) {
              <p class="empty-pool">All bills have been sorted! 🎉</p>
            }
          </div>

          <div class="jars-container">
            <div class="jar save-jar">
              <h3>🏦 Save</h3>
              <div cdkDropList #saveList="cdkDropList" [cdkDropListData]="saveBills()"
                   [cdkDropListConnectedTo]="[billsList, spendList, giveList]"
                   (cdkDropListDropped)="drop($event)" class="jar-drop-zone"
                   [class.has-items]="saveBills().length > 0"
                   role="list" aria-label="Save jar">
                @for (bill of saveBills(); track bill) {
                  <div class="bill small" cdkDrag [cdkDragData]="bill" role="listitem">
                    <span>$10</span>
                  </div>
                }
                @if (saveBills().length === 0) {
                  <p class="drop-hint">Drop here</p>
                }
              </div>
              <div class="jar-total">{{ '$' + (saveBills().length * 10) }}</div>
            </div>

            <div class="jar spend-jar">
              <h3>🛒 Spend</h3>
              <div cdkDropList #spendList="cdkDropList" [cdkDropListData]="spendBills()"
                   [cdkDropListConnectedTo]="[billsList, saveList, giveList]"
                   (cdkDropListDropped)="drop($event)" class="jar-drop-zone"
                   [class.has-items]="spendBills().length > 0"
                   role="list" aria-label="Spend jar">
                @for (bill of spendBills(); track bill) {
                  <div class="bill small" cdkDrag [cdkDragData]="bill" role="listitem">
                    <span>$10</span>
                  </div>
                }
                @if (spendBills().length === 0) {
                  <p class="drop-hint">Drop here</p>
                }
              </div>
              <div class="jar-total">{{ '$' + (spendBills().length * 10) }}</div>
            </div>

            <div class="jar give-jar">
              <h3>❤️ Give</h3>
              <div cdkDropList #giveList="cdkDropList" [cdkDropListData]="giveBills()"
                   [cdkDropListConnectedTo]="[billsList, saveList, spendList]"
                   (cdkDropListDropped)="drop($event)" class="jar-drop-zone"
                   [class.has-items]="giveBills().length > 0"
                   role="list" aria-label="Give jar">
                @for (bill of giveBills(); track bill) {
                  <div class="bill small" cdkDrag [cdkDragData]="bill" role="listitem">
                    <span>$10</span>
                  </div>
                }
                @if (giveBills().length === 0) {
                  <p class="drop-hint">Drop here</p>
                }
              </div>
              <div class="jar-total">{{ '$' + (giveBills().length * 10) }}</div>
            </div>
          </div>

          @if (remaining() === 0) {
            <button class="btn-primary submit-btn" (click)="submitAllocation()" aria-label="Submit your choices">
              ✅ Submit My Choices
            </button>
          }
        </div>
      }

      @if (showSummary) {
        <div class="summary animate-slide-up">
          <h2>📊 Your Money Plan</h2>

          <app-money-mike [message]="feedbackMessage" mood="happy"></app-money-mike>

          <div class="pie-chart-container" role="img" [attr.aria-label]="'Pie chart showing ' + savePercent + '% saved, ' + spendPercent + '% spent, ' + givePercent + '% given'">
            <div class="pie-chart">
              <div class="pie-segment save-seg" [style.--pct]="savePercent"></div>
              <div class="pie-segment spend-seg" [style.--pct]="spendPercent" [style.--offset]="savePercent"></div>
              <div class="pie-segment give-seg" [style.--pct]="givePercent" [style.--offset]="savePercent + spendPercent"></div>
              <div class="pie-center">$50</div>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item"><span class="dot save"></span> Save: {{ '$' + saveAmount }} ({{ savePercent }}%)</div>
            <div class="legend-item"><span class="dot spend"></span> Spend: {{ '$' + spendAmount }} ({{ spendPercent }}%)</div>
            <div class="legend-item"><span class="dot give"></span> Give: {{ '$' + giveAmount }} ({{ givePercent }}%)</div>
          </div>

          <button class="btn-primary" (click)="finishLesson()" aria-label="Complete lesson">
            🎉 Complete Lesson
          </button>
        </div>
      }
    </div>

    @if (showComplete) {
      <app-lesson-complete lessonTitle="Save Spend Give"
        [message]="completeMessage"
        [xpEarned]="100" [score]="50"
        [badge]="earnedBadge" [badgeEmoji]="earnedBadgeEmoji"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro { padding: 10px 0; }
    .lesson-content {
      margin-bottom: 16px;
      text-align: left;
    }
    .lesson-content h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 21px;
      margin-bottom: 8px;
    }
    .lesson-content > p {
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .example-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .save-example, .spend-example, .give-example {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 12px;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 600;
    }
    .save-example { background: #E8F5E9; color: #2E7D32; }
    .spend-example { background: #E3F2FD; color: #1565C0; }
    .give-example { background: #FCE4EC; color: #C62828; }
    .key-points { background: #FFF8E1; }
    .rule-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #FFE082;
    }
    .rule-box:last-child { border-bottom: none; }
    .rule-icon { font-size: 24px; flex-shrink: 0; }
    .rule-box p { margin: 0; font-size: 14px; line-height: 1.5; }
    .ready-section { text-align: center; padding: 12px 0; }
    .game-area { padding: 10px 0; }
    .total-money {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: linear-gradient(135deg, #FFF8E1, #FFE082);
      border-radius: 16px;
      padding: 16px;
      margin: 12px 0;
    }
    .total-label { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #5D4037; }
    .total-amount { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #E65100; }
    .allocation-status { text-align: center; margin: 8px 0; }
    .status-text {
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #FF6F00;
    }
    .status-text.done { color: #4CAF50; }
    .money-pool {
      background: white;
      border-radius: 16px;
      padding: 16px;
      margin: 12px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .money-pool h3, .jar h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 8px; }
    .bills-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      min-height: 80px;
      padding: 8px;
      background: #F5F5F5;
      border-radius: 12px;
    }
    .bill {
      width: 90px;
      height: 56px;
      cursor: grab;
    }
    .bill-inner {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #81C784, #A5D6A7);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      border: 2px solid #4CAF50;
    }
    .bill-emoji { font-size: 20px; }
    .bill-text { font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #1B5E20; }
    .bill.small {
      width: 60px;
      height: 36px;
    }
    .bill.small span {
      font-family: 'Fredoka', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #1B5E20;
    }
    .empty-pool { color: #888; font-family: 'Nunito', sans-serif; text-align: center; padding: 20px; }
    .jars-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 12px 0;
    }
    .jar {
      background: white;
      border-radius: 16px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
    }
    .jar-drop-zone {
      min-height: 100px;
      border: 3px dashed #ddd;
      border-radius: 12px;
      padding: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      align-content: flex-start;
      transition: all 0.2s;
    }
    .jar-drop-zone.has-items { border-color: #4CAF50; background: #F1F8E9; }
    .drop-hint {
      color: #bbb;
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      align-self: center;
    }
    .jar-total {
      font-family: 'Fredoka', sans-serif;
      font-size: 22px;
      font-weight: 700;
      margin-top: 8px;
    }
    .save-jar .jar-total { color: #4CAF50; }
    .spend-jar .jar-total { color: #2196F3; }
    .give-jar .jar-total { color: #E91E63; }
    .submit-btn { display: block; margin: 20px auto; }
    .summary { text-align: center; padding: 20px 0; }
    .summary h2 { font-family: 'Fredoka', sans-serif; font-size: 28px; }
    .pie-chart-container { display: flex; justify-content: center; margin: 20px 0; }
    .pie-chart {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      position: relative;
      background: #f0f0f0;
      overflow: hidden;
    }
    .pie-segment {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      clip-path: polygon(50% 50%, 50% 0%, calc(50% + 50% * var(--pct) / 100) 0%);
      transition: all 0.5s;
    }
    .save-seg { background: #4CAF50; }
    .spend-seg { background: #2196F3; }
    .give-seg { background: #E91E63; }
    .pie-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Fredoka', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }
    .legend { margin: 16px 0; }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #555;
      margin: 4px 0;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot.save { background: #4CAF50; }
    .dot.spend { background: #2196F3; }
    .dot.give { background: #E91E63; }
    @media (max-width: 600px) {
      .jars-container { grid-template-columns: 1fr; }
    }
  `]
})
export class SaveSpendGiveComponent {
  protected started = false;
  protected showSummary = false;
  protected showComplete = false;

  protected bills = signal<number[]>([1, 2, 3, 4, 5]);
  protected saveBills = signal<number[]>([]);
  protected spendBills = signal<number[]>([]);
  protected giveBills = signal<number[]>([]);

  protected remaining = computed(() => this.bills().length);

  protected saveAmount = 0;
  protected spendAmount = 0;
  protected giveAmount = 0;
  protected savePercent = 0;
  protected spendPercent = 0;
  protected givePercent = 0;
  protected earnedBadge = '';
  protected earnedBadgeEmoji = '';

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  get feedbackMessage(): string {
    if (this.savePercent >= 50) return 'Wow! You saved 50% or more of your money! That\'s amazing forward thinking! 🌟';
    if (this.givePercent >= 40) return 'You have such a generous heart! Giving to others is a wonderful thing! ❤️';
    if (this.spendPercent >= 60) return 'You like to enjoy your money! That\'s okay, just remember to save for the future too! 😊';
    return 'Great balance! You thought carefully about where to put your money! 👏';
  }

  get completeMessage(): string {
    if (this.savePercent >= 40) return 'You\'re a saving superstar! Setting money aside for the future is so smart!';
    if (this.givePercent >= 30) return 'What a kind heart! Sharing with others is a wonderful way to use money!';
    return 'Great job thinking about how to use your money wisely!';
  }

  startGame(): void {
    this.started = true;
    this.audio.playClick();
  }

  drop(event: CdkDragDrop<number[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.bills.update(v => [...v]);
    this.saveBills.update(v => [...v]);
    this.spendBills.update(v => [...v]);
    this.giveBills.update(v => [...v]);
    this.audio.playCoin();
  }

  submitAllocation(): void {
    this.saveAmount = this.saveBills().length * 10;
    this.spendAmount = this.spendBills().length * 10;
    this.giveAmount = this.giveBills().length * 10;
    const total = this.saveAmount + this.spendAmount + this.giveAmount;
    this.savePercent = Math.round((this.saveAmount / 50) * 100);
    this.spendPercent = Math.round((this.spendAmount / 50) * 100);
    this.givePercent = Math.round((this.giveAmount / 50) * 100);

    this.profile.recordSaveSpendGive(this.saveAmount, this.spendAmount, this.giveAmount);
    this.audio.playSuccess();

    if (this.savePercent >= 40) {
      this.earnedBadge = 'Save Star';
      this.earnedBadgeEmoji = '⭐';
    } else if (this.givePercent >= 30) {
      this.earnedBadge = 'Give Heart';
      this.earnedBadgeEmoji = '❤️';
    } else {
      this.earnedBadge = 'Spend Smart';
      this.earnedBadgeEmoji = '🛒';
    }

    this.showSummary = true;
  }

  finishLesson(): void {
    this.profile.addScore(50);
    this.profile.addXp(100);
    this.profile.addBadge(this.earnedBadge);
    this.profile.completeLesson('save-spend-give');
    this.audio.playBadge();
    this.showComplete = true;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
