import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-money-mike',
  standalone: true,
  template: `
    <div class="money-mike" [class.small]="size === 'small'" [class.large]="size === 'large'">
      <div class="mike-character" [class.talking]="talking" [class.happy]="mood === 'happy'"
           [class.thinking]="mood === 'thinking'" [class.celebrating]="mood === 'celebrate'"
           [attr.aria-label]="'Money Mike the financial guide'">
        <div class="mike-body">
          <div class="mike-head">
            <div class="mike-hair"></div>
            <div class="mike-face">
              <div class="mike-eyes">
                <div class="eye left"></div>
                <div class="eye right"></div>
              </div>
              <div class="mike-smile"></div>
            </div>
            <div class="mike-cap">
              <span class="dollar-sign">$</span>
            </div>
          </div>
          <div class="mike-outfit">
            <div class="shirt">
              <span class="shirt-text">$</span>
            </div>
          </div>
        </div>
      </div>
      @if (message) {
        <div class="speech-bubble" role="status" aria-live="polite">
          <p>{{ message }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .money-mike {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 16px 0;
    }
    .money-mike.small { transform: scale(0.7); transform-origin: left center; }
    .money-mike.large { transform: scale(1.2); transform-origin: left center; }
    .mike-character {
      flex-shrink: 0;
      position: relative;
      width: 100px;
      height: 140px;
    }
    .mike-body { position: relative; width: 100%; height: 100%; }
    .mike-head {
      width: 70px;
      height: 70px;
      background: #FFDAB9;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 15px;
      z-index: 2;
      overflow: hidden;
    }
    .mike-hair {
      position: absolute;
      top: -5px;
      left: -5px;
      width: 80px;
      height: 40px;
      background: #5D4037;
      border-radius: 50% 50% 0 0;
    }
    .mike-face { position: relative; top: 25px; }
    .mike-eyes { display: flex; justify-content: center; gap: 12px; }
    .eye {
      width: 8px;
      height: 8px;
      background: #333;
      border-radius: 50%;
      transition: all 0.3s;
    }
    .mike-character.happy .eye { height: 5px; border-radius: 0 0 8px 8px; }
    .mike-character.celebrating .eye { animation: bounce 0.5s infinite; }
    .mike-smile {
      width: 20px;
      height: 10px;
      border-bottom: 3px solid #333;
      border-radius: 0 0 20px 20px;
      margin: 6px auto 0;
      transition: all 0.3s;
    }
    .mike-character.happy .mike-smile { width: 28px; height: 14px; }
    .mike-character.celebrating .mike-smile { animation: bounce 0.5s infinite; }
    .mike-cap {
      position: absolute;
      top: -8px;
      left: -2px;
      width: 74px;
      height: 20px;
      background: #4CAF50;
      border-radius: 10px 10px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }
    .mike-cap .dollar-sign {
      color: #FFD54F;
      font-weight: bold;
      font-size: 18px;
      font-family: 'Fredoka', sans-serif;
    }
    .mike-outfit {
      position: absolute;
      bottom: 0;
      left: 5px;
      width: 90px;
      height: 60px;
      background: #2196F3;
      border-radius: 10px 10px 20px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .shirt-text {
      color: #FFD54F;
      font-size: 24px;
      font-weight: bold;
      font-family: 'Fredoka', sans-serif;
    }
    .speech-bubble {
      background: white;
      border: 3px solid #FFD54F;
      border-radius: 20px;
      padding: 16px 20px;
      position: relative;
      flex: 1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .speech-bubble::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      border: 12px solid transparent;
      border-right-color: white;
      z-index: 1;
    }
    .speech-bubble::after {
      content: '';
      position: absolute;
      left: -16px;
      top: 50%;
      transform: translateY(-50%);
      border: 13px solid transparent;
      border-right-color: #FFD54F;
      z-index: 0;
    }
    .speech-bubble p {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #333;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .mike-character.thinking .eye { animation: think 1s infinite; }
    @keyframes think {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(3px); }
    }
    .mike-character.talking .mike-smile { animation: talk 0.3s infinite; }
    @keyframes talk {
      0%, 100% { height: 10px; }
      50% { height: 6px; width: 24px; }
    }
  `]
})
export class MoneyMikeComponent {
  @Input() message = '';
  @Input() mood: 'neutral' | 'happy' | 'thinking' | 'celebrate' = 'neutral';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() talking = false;
}
