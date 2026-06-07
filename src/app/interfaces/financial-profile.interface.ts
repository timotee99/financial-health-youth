export interface FinancialProfile {
  needsChoices: number;
  wantsChoices: number;
  savedMoney: number;
  spentMoney: number;
  donatedMoney: number;
  delayedChoices: number;
  instantChoices: number;
  earningIdeasChosen: string[];
  investmentUnderstandingScore: number;
  totalScore: number;
  completedLessons: string[];
  badges: string[];
  xp: number;
  level: number;
  soundEnabled: boolean;
}

export function createDefaultProfile(): FinancialProfile {
  return {
    needsChoices: 0,
    wantsChoices: 0,
    savedMoney: 0,
    spentMoney: 0,
    donatedMoney: 0,
    delayedChoices: 0,
    instantChoices: 0,
    earningIdeasChosen: [],
    investmentUnderstandingScore: 0,
    totalScore: 0,
    completedLessons: [],
    badges: [],
    xp: 0,
    level: 1,
    soundEnabled: true,
  };
}

export type FinancialPersonality =
  | 'Smart Saver'
  | 'Generous Giver'
  | 'Future Investor'
  | 'Entrepreneur'
  | 'Balanced Money Manager';
