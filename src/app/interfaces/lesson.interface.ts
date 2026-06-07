export interface Lesson {
  id: string;
  title: string;
  route: string;
  description: string;
  xpAvailable: number;
  icon: string;
}

export interface NeedWantItem {
  id: string;
  name: string;
  emoji: string;
  isNeed: boolean;
  explanation: string;
}

export interface SaveSpendGiveAllocation {
  save: number;
  spend: number;
  give: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  instantChoice: string;
  delayedChoice: string;
  instantResult: string;
  delayedResult: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  problem: string;
  work: string;
  earnings: number;
  emoji: string;
}

export interface DayGrowth {
  day: number;
  value: number;
  display: string;
}
