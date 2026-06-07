import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MoneyMikeComponent],
  template: `
    <div class="page-container settings-page">
      <h1>⚙️ Settings</h1>

      <app-money-mike message="Here you can check your progress, reset your data, or import/export your progress!" mood="happy">
      </app-money-mike>

      <section class="settings-section">
        <h2>🔊 Sound</h2>
        <div class="setting-card">
          <div class="setting-info">
            <span class="setting-icon">{{ profile.soundEnabled() ? '🔊' : '🔇' }}</span>
            <span class="setting-label">Sound Effects</span>
          </div>
          <button class="toggle-btn" [class.on]="profile.soundEnabled()"
                  (click)="toggleSound()" [attr.aria-label]="'Sound is ' + (profile.soundEnabled() ? 'on' : 'off')">
            <span class="toggle-knob"></span>
          </button>
        </div>
      </section>

      <section class="settings-section">
        <h2>📊 Progress Overview</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-emoji">🎯</span>
            <span class="stat-val">{{ profile.profile$().totalScore }}</span>
            <span class="stat-desc">Score</span>
          </div>
          <div class="stat-item">
            <span class="stat-emoji">🏆</span>
            <span class="stat-val">{{ profile.profile$().badges.length }}</span>
            <span class="stat-desc">Badges</span>
          </div>
          <div class="stat-item">
            <span class="stat-emoji">📖</span>
            <span class="stat-val">{{ profile.profile$().completedLessons.length }}/6</span>
            <span class="stat-desc">Lessons</span>
          </div>
          <div class="stat-item">
            <span class="stat-emoji">⭐</span>
            <span class="stat-val">Lv.{{ profile.profile$().level }}</span>
            <span class="stat-desc">Level</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2>📂 Data Management</h2>

        <div class="setting-card">
          <div class="setting-info">
            <span class="setting-icon">📤</span>
            <div class="setting-text">
              <span class="setting-label">Export Progress</span>
              <span class="setting-desc">Save your progress as a JSON file</span>
            </div>
          </div>
          <button class="btn-secondary small" (click)="exportProgress()" aria-label="Export progress as JSON">
            Export
          </button>
        </div>

        <div class="setting-card">
          <div class="setting-info">
            <span class="setting-icon">📥</span>
            <div class="setting-text">
              <span class="setting-label">Import Progress</span>
              <span class="setting-desc">Load progress from a JSON file</span>
            </div>
          </div>
          <button class="btn-secondary small" (click)="importInput.click()" aria-label="Import progress from JSON file">
            Import
          </button>
          <input #importInput type="file" accept=".json" (change)="importProgress($event)" class="hidden-input"
                 aria-hidden="true" />
        </div>

        @if (importMessage) {
          <div class="import-message" [class.success]="importSuccess" [class.error]="!importSuccess">
            {{ importMessage }}
          </div>
        }

        <div class="setting-card warning">
          <div class="setting-info">
            <span class="setting-icon">⚠️</span>
            <div class="setting-text">
              <span class="setting-label">Reset All Progress</span>
              <span class="setting-desc">This will erase all your data. This cannot be undone!</span>
            </div>
          </div>
          <button class="btn-danger small" (click)="showResetConfirm = true" aria-label="Reset all progress">
            Reset
          </button>
        </div>

        @if (showResetConfirm) {
          <div class="reset-confirm animate-pop">
            <p>Are you sure you want to reset ALL progress?</p>
            <div class="confirm-buttons">
              <button class="btn-danger" (click)="resetProgress()" aria-label="Confirm reset">
                Yes, Reset Everything
              </button>
              <button class="btn-secondary" (click)="showResetConfirm = false" aria-label="Cancel reset">
                Cancel
              </button>
            </div>
          </div>
        }
      </section>

      <section class="settings-section">
        <h2>🎮 Quick Links</h2>
        <div class="quick-links">
          <a class="btn-primary small" routerLink="/">🏠 Home</a>
          <a class="btn-secondary small" routerLink="/profile">👤 View Profile</a>
          <a class="btn-gold small" routerLink="/final-summary">📊 Final Summary</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .settings-page { padding-bottom: 40px; }
    h1 {
      font-family: 'Fredoka', sans-serif;
      font-size: 30px;
      text-align: center;
      margin-bottom: 16px;
    }
    .settings-section { margin: 24px 0; }
    .settings-section h2 {
      font-family: 'Fredoka', sans-serif;
      font-size: 20px;
      margin-bottom: 12px;
    }
    .setting-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .setting-card.warning { border-left: 4px solid #FF5252; }
    .setting-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .setting-icon { font-size: 28px; }
    .setting-text { display: flex; flex-direction: column; }
    .setting-label {
      font-family: 'Nunito', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #333;
    }
    .setting-desc {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      color: #888;
    }
    .btn-secondary.small, .btn-primary.small, .btn-gold.small, .btn-danger.small {
      padding: 8px 20px;
      font-size: 14px;
      text-decoration: none;
    }
    .btn-danger {
      background: #FF5252;
      color: white;
      border-radius: 50px;
      padding: 10px 24px;
      font-family: 'Fredoka', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger:hover { background: #D32F2F; transform: translateY(-1px); }
    .toggle-btn {
      width: 56px;
      height: 30px;
      border-radius: 15px;
      background: #ccc;
      border: none;
      cursor: pointer;
      position: relative;
      transition: background 0.3s;
      padding: 0;
    }
    .toggle-btn.on { background: #4CAF50; }
    .toggle-knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: left 0.3s;
    }
    .toggle-btn.on .toggle-knob { left: 29px; }
    .hidden-input { display: none; }
    .import-message {
      padding: 12px 16px;
      border-radius: 12px;
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .import-message.success { background: #E8F5E9; color: #2E7D32; }
    .import-message.error { background: #FFEBEE; color: #C62828; }
    .reset-confirm {
      background: #FFF0F0;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-top: 10px;
    }
    .reset-confirm p { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700; color: #C62828; margin-bottom: 12px; }
    .confirm-buttons { display: flex; gap: 10px; justify-content: center; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .stat-item {
      background: white;
      border-radius: 14px;
      padding: 16px 10px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .stat-emoji { font-size: 24px; display: block; }
    .stat-val {
      display: block;
      font-family: 'Fredoka', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #4CAF50;
      margin: 4px 0;
    }
    .stat-desc { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; }
    .quick-links { display: flex; gap: 10px; flex-wrap: wrap; }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .quick-links { flex-direction: column; }
    }
  `]
})
export class SettingsComponent {
  protected showResetConfirm = false;
  protected importMessage = '';
  protected importSuccess = false;

  constructor(
    protected profile: FinancialProfileService,
    private audio: AudioService,
    private router: Router
  ) {}

  toggleSound(): void {
    this.profile.toggleSound();
  }

  exportProgress(): void {
    const json = this.profile.getProfileJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'money-adventure-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    this.audio.playSuccess();
  }

  importProgress(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = this.profile.importProfile(reader.result as string);
      this.importSuccess = result;
      this.importMessage = result
        ? 'Progress imported successfully! ✅'
        : 'Failed to import. Please check the file format. ❌';
      if (result) this.audio.playSuccess();
      else this.audio.playIncorrect();
      setTimeout(() => {
        this.importMessage = '';
        if (result) this.router.navigate(['/']);
      }, 2000);
    };
    reader.readAsText(file);
  }

  resetProgress(): void {
    this.profile.resetProfile();
    this.showResetConfirm = false;
    this.audio.playComplete();
    this.router.navigate(['/']);
  }
}
