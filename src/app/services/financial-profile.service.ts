import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import {
  FinancialProfile,
  createDefaultProfile,
  FinancialPersonality,
} from '../interfaces/financial-profile.interface';

const STORAGE_KEY = 'money-adventure-profile';

@Injectable({ providedIn: 'root' })
export class FinancialProfileService {
  private profile!: WritableSignal<FinancialProfile>;
  readonly profile$!: Signal<FinancialProfile>;

  readonly totalScore: Signal<number>;
  readonly badges: Signal<string[]>;
  readonly completedLessons: Signal<string[]>;
  readonly xp: Signal<number>;
  readonly level: Signal<number>;
  readonly soundEnabled: Signal<boolean>;
  readonly xpForNextLevel: Signal<number>;
  readonly xpProgress: Signal<number>;
  readonly personality: Signal<FinancialPersonality>;

  constructor(private storage: LocalStorageService) {
    this.profile = signal<FinancialProfile>(this.loadProfile());
    this.profile$ = this.profile.asReadonly();

    this.totalScore = computed(() => this.profile().totalScore);
    this.badges = computed(() => this.profile().badges);
    this.completedLessons = computed(() => this.profile().completedLessons);
    this.xp = computed(() => this.profile().xp);
    this.level = computed(() => this.profile().level);
    this.soundEnabled = computed(() => this.profile().soundEnabled);

    this.xpForNextLevel = computed(() => this.profile().level * 200);
    this.xpProgress = computed(() => {
      const level = this.profile().level;
      const xpInLevel = this.profile().xp - (level - 1) * 200;
      const needed = level * 200;
      return Math.min(xpInLevel / needed, 1);
    });

    this.personality = computed<FinancialPersonality>(() => {
      const p = this.profile();
      const scores = {
        save: p.savedMoney,
        give: p.donatedMoney,
        invest: p.investmentUnderstandingScore,
        earn: p.earningIdeasChosen.length,
        balance: p.delayedChoices - p.instantChoices,
      };

      const max = Math.max(
        scores.save,
        scores.give * 5,
        scores.invest * 5,
        scores.earn * 10,
        scores.balance * 5 + 10
      );

      if (max === scores.save) return 'Smart Saver';
      if (max === scores.give * 5) return 'Generous Giver';
      if (max === scores.invest * 5) return 'Future Investor';
      if (max === scores.earn * 10) return 'Entrepreneur';
      return 'Balanced Money Manager';
    });
  }

  private loadProfile(): FinancialProfile {
    return (
      this.storage.getItem<FinancialProfile>(STORAGE_KEY) ??
      createDefaultProfile()
    );
  }

  private save(): void {
    this.storage.setItem(STORAGE_KEY, this.profile());
  }

  addXp(amount: number): void {
    this.profile.update((p) => {
      let newXp = p.xp + amount;
      let newLevel = p.level;
      while (newXp >= newLevel * 200) {
        newXp -= newLevel * 200;
        newLevel++;
      }
      return { ...p, xp: newXp, level: newLevel };
    });
    this.save();
  }

  addBadge(badge: string): void {
    this.profile.update((p) => {
      if (p.badges.includes(badge)) return p;
      return { ...p, badges: [...p.badges, badge] };
    });
    this.save();
  }

  completeLesson(lessonId: string): void {
    this.profile.update((p) => {
      if (p.completedLessons.includes(lessonId)) return p;
      return { ...p, completedLessons: [...p.completedLessons, lessonId] };
    });
    this.save();
  }

  recordNeedWantChoice(isNeed: boolean): void {
    this.profile.update((p) => ({
      ...p,
      needsChoices: isNeed ? p.needsChoices + 1 : p.needsChoices,
      wantsChoices: !isNeed ? p.wantsChoices + 1 : p.wantsChoices,
    }));
    this.save();
  }

  recordSaveSpendGive(save: number, spend: number, give: number): void {
    this.profile.update((p) => ({
      ...p,
      savedMoney: p.savedMoney + save,
      spentMoney: p.spentMoney + spend,
      donatedMoney: p.donatedMoney + give,
    }));
    this.save();
  }

  recordGratificationChoice(delayed: boolean): void {
    this.profile.update((p) => ({
      ...p,
      delayedChoices: delayed ? p.delayedChoices + 1 : p.delayedChoices,
      instantChoices: !delayed ? p.instantChoices + 1 : p.instantChoices,
    }));
    this.save();
  }

  recordEarningIdea(idea: string): void {
    this.profile.update((p) => ({
      ...p,
      earningIdeasChosen: [...p.earningIdeasChosen, idea],
    }));
    this.save();
  }

  recordInvestmentScore(score: number): void {
    this.profile.update((p) => ({
      ...p,
      investmentUnderstandingScore: score,
    }));
    this.save();
  }

  addScore(points: number): void {
    this.profile.update((p) => ({
      ...p,
      totalScore: p.totalScore + points,
    }));
    this.save();
  }

  toggleSound(): void {
    this.profile.update((p) => ({ ...p, soundEnabled: !p.soundEnabled }));
    this.save();
  }

  resetProfile(): void {
    this.profile.set(createDefaultProfile());
    this.storage.removeItem(STORAGE_KEY);
  }

  getProfileJson(): string {
    return JSON.stringify(this.profile(), null, 2);
  }

  importProfile(json: string): boolean {
    try {
      const data = JSON.parse(json) as FinancialProfile;
      this.profile.set(data);
      this.save();
      return true;
    } catch {
      return false;
    }
  }
}
