import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'needs-vs-wants',
    loadComponent: () =>
      import('./pages/needs-vs-wants/needs-vs-wants').then(
        (m) => m.NeedsVsWantsComponent
      ),
  },
  {
    path: 'save-spend-give',
    loadComponent: () =>
      import('./pages/save-spend-give/save-spend-give').then(
        (m) => m.SaveSpendGiveComponent
      ),
  },
  {
    path: 'wait-or-buy-now',
    loadComponent: () =>
      import('./pages/wait-or-buy-now/wait-or-buy-now').then(
        (m) => m.WaitOrBuyNowComponent
      ),
  },
  {
    path: 'earn-money',
    loadComponent: () =>
      import('./pages/earn-money/earn-money').then(
        (m) => m.EarnMoneyComponent
      ),
  },
  {
    path: 'money-magic',
    loadComponent: () =>
      import('./pages/money-magic/money-magic').then(
        (m) => m.MoneyMagicComponent
      ),
  },
  {
    path: 'final-summary',
    loadComponent: () =>
      import('./pages/final-summary/final-summary').then(
        (m) => m.FinalSummaryComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings').then((m) => m.SettingsComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
