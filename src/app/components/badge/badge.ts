import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <div class="badge-container" [class.earned]="earned" [class.animate]="animate">
      <div class="badge-icon" [style.background]="earned ? color : '#e0e0e0'">
        <span class="badge-emoji">{{ earned ? emoji : '🔒' }}</span>
      </div>
      @if (showLabel) {
        <div class="badge-label">{{ label }}</div>
      }
    </div>
  `,
  styles: [`
    .badge-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100px;
    }
    .badge-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
      border: 4px solid #FFD54F;
    }
    .badge-icon:not(.earned) {
      border-color: #ccc;
      opacity: 0.6;
    }
    .badge-emoji {
      font-size: 36px;
      line-height: 1;
    }
    .badge-label {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #555;
      text-align: center;
      line-height: 1.3;
    }
    .badge-container.animate .badge-icon {
      animation: earnBadge 0.6s ease-out;
    }
    @keyframes earnBadge {
      0% { transform: scale(0) rotate(-180deg); }
      50% { transform: scale(1.3) rotate(10deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
  `]
})
export class BadgeComponent {
  @Input() label = '';
  @Input() emoji = '';
  @Input() color = '#4CAF50';
  @Input() earned = false;
  @Input() showLabel = true;
  @Input() animate = false;
}
