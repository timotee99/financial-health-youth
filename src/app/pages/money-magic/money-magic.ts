import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { MoneyGardenComponent } from './money-garden';
import { DreamGrowComponent } from './dream-grow';
import { FormsModule } from '@angular/forms';

type Phase =
  | 'intro' | 'prediction' | 'bank-choice' | 'slider'
  | 'slow-fast' | 'garden' | 'lemon-tree' | 'inflation'
  | 'multiplier' | 'explosion' | 'capstone' | 'personality' | 'complete';

interface PennyDay {
  day: number;
  emoji: string;
  value: number;
  label: string;
}

@Component({
  selector: 'app-money-magic',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent, MoneyGardenComponent, DreamGrowComponent, FormsModule],
  template: `
    <div class="page-container">

      @if (phase === 'intro') {
        <div class="intro-phase animate-slide-up">
          <app-money-mike message="Did you know money can GROW while you wait? It's not magic — it's investing! Let me show you how!" mood="happy">
          </app-money-mike>

          <div class="big-idea card">
            <span class="bi-emoji">💡</span>
            <p><strong>Money Can Grow While You Wait.</strong> Some money grows even when you are not working for it.</p>
          </div>

          <div class="contrast card">
            <div class="ct-row">
              <span>💼</span><span><strong>Work money</strong> = you earn it by doing something now</span>
            </div>
            <div class="ct-row">
              <span>🌱</span><span><strong>Growth money</strong> = it grows because you were patient</span>
            </div>
          </div>

          <div class="magic-penny card">
            <h2>🪙 The Magic Penny Story</h2>
            <p>Money Mike found a <strong>magic penny</strong>... Each day it doubles! Let's see what happens!</p>
            <div class="penny-days">
              @for (pd of pennyDays; track pd.day) {
                <div class="penny-day" [class.animate]="pd.day <= revealedDays">
                  <span class="pd-day">Day {{ pd.day }}</span>
                  <span class="pd-emoji">{{ pd.day <= revealedDays ? pd.emoji : '❓' }}</span>
                  <span class="pd-value">{{ pd.day <= revealedDays ? pd.label : '?' }}</span>
                </div>
              }
            </div>
            @if (revealedDays < 6) {
              <button class="btn-secondary" (click)="revealNextDay()">
                Show Day {{ revealedDays + 1 }} 🔮
              </button>
            }
            @if (revealedDays >= 6) {
              <div class="penny-surprise">
                <p>🔄 It doubles every day! Day 1 penny became Day 6's <strong>32 pennies</strong>!</p>
                <p class="ps-big">Now imagine what happens by Day 20...</p>
              </div>
              <button class="btn-primary" (click)="goTo('prediction')">🔮 Make a Prediction!</button>
            }
          </div>
        </div>
      }

      @if (phase === 'prediction') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="After 20 days, how much do you think 1 penny will be worth? Type your guess!" mood="thinking">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">1 / 11</span>
            <h2>🔮 Your Prediction</h2>
          </div>

          <div class="predict-card card">
            <p class="predict-question">How much is 1 penny worth after <strong>20 days</strong> of doubling?</p>
            <div class="input-group">
              <span class="dollar-sign">$</span>
              <input type="number" [(ngModel)]="prediction" class="prediction-input"
                     placeholder="Enter your guess" min="0"
                     aria-label="Enter your prediction in dollars"
                     (keyup.enter)="checkPrediction()" />
            </div>
            <button class="btn-primary" (click)="checkPrediction()">✅ Check Answer</button>

            @if (showPredictionResult) {
              <div class="prediction-result animate-pop"
                   [class.correct]="isPredictionCorrect"
                   [class.incorrect]="!isPredictionCorrect">
                <span class="result-icon">{{ isPredictionCorrect ? '🎉' : '😮' }}</span>
                <div class="result-text">
                  <p>{{ isPredictionCorrect ? 'Amazing! You understand the power of compounding!' : 'Most people guess way too low!' }}</p>
                  <p class="result-answer">1 penny becomes <strong>$5,242.88</strong> after 20 days!</p>
                  <p class="result-explanation">By Day 30, it becomes <strong>$5,368,709.12</strong>! That is the power of compound growth!</p>
                </div>
              </div>
            }

            @if (showPredictionResult) {
              <button class="btn-primary" (click)="goTo('bank-choice')">🏦 Choose Where to Save!</button>
            }
          </div>
        </div>
      }

      @if (phase === 'bank-choice') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Where should Money Mike put his money? Each place is different!" mood="thinking">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">2 / 11</span>
            <h2>🏦 Where to Put Your Money?</h2>
          </div>

          <div class="bank-grid">
            @for (b of banks; track b.id) {
              <button class="bank-card" [class.chosen]="chosenBank === b.id"
                      (click)="pickBank(b.id)">
                <span class="bc-emoji">{{ b.emoji }}</span>
                <h3>{{ b.name }}</h3>
                <p>{{ b.desc }}</p>
                <div class="bc-result">
                  <span>After 30 days:</span>
                  <span class="bc-amount">{{ b.resultLabel }}</span>
                </div>
                <div class="bc-tag" [class.tag-good]="b.id === 'magic'"
                     [class.tag-ok]="b.id === 'bank'"
                     [class.tag-meh]="b.id === 'piggy'">
                  {{ b.tag }}
                </div>
              </button>
            }
          </div>

          @if (chosenBank) {
            <div class="bank-feedback card">
              <p>{{ bankFeedback }}</p>
            </div>
            <button class="btn-primary" (click)="goTo('slider')">⏰ Time Travel!</button>
          }
        </div>
      }

      @if (phase === 'slider') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Move the slider to see how money grows day by day!" mood="happy">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">3 / 11</span>
            <h2>⏰ Time Travel Slider</h2>
          </div>

          <div class="slider-card card">
            <div class="day-display">
              <span class="day-label">Day</span>
              <span class="day-value">{{ sliderDay }}</span>
            </div>

            <input type="range" min="1" max="30" [(ngModel)]="sliderDay"
                   class="day-slider" (input)="updateDay()"
                   aria-label="Select day to see growth" />

            <div class="value-display" aria-live="polite">
              <span class="penny-stack">{{ pennyStack }}</span>
              <span class="value-text">{{ '$' + formatMoney(currentValue) }}</span>
            </div>

            <div class="growth-message">{{ growthMessage }}</div>

            <div class="pile-visual" [style.transform]="'scale(' + pileScale + ')'">
              @for (coin of coinPile; track coin) {
                <span class="pile-coin" [style.animation-delay]="coin + 'ms'">🪙</span>
              }
            </div>
          </div>

          <button class="btn-primary" (click)="goTo('slow-fast')">⚡ Slow vs Fast Money!</button>
        </div>
      }

      @if (phase === 'slow-fast') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Which path gives more value over time — spending now or investing?" mood="thinking">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">4 / 11</span>
            <h2>⚡ Slow vs Fast Money</h2>
          </div>

          <div class="sf-game">
            <p class="sf-intro">You have <strong>$10</strong>. Two paths ahead...</p>

            <div class="sf-paths">
              <div class="sf-path spend" [class.active]="sfChoice === 'spend'">
                <span class="sfp-emoji">🍬</span>
                <h3>Path A: Spend Now</h3>
                <p>Get <strong>{{ '$' + sfSpendResult }}</strong> worth of candy today!</p>
                <div class="sfp-bar">
                  <div class="sfp-fill" [style.width.%]="sfSpendPct"></div>
                </div>
                <button class="btn-sf spend" (click)="pickSfPath('spend')">🍬 Take the Candy</button>
              </div>

              <div class="sf-path invest" [class.active]="sfChoice === 'invest'">
                <span class="sfp-emoji">📈</span>
                <h3>Path B: Invest</h3>
                <p>{{ '$10' }} → {{ '$20' }} → {{ '$40' }} → <strong>{{ '$80' }}</strong> over time!</p>
                <div class="sfp-bar">
                  <div class="sfp-fill gold" [style.width.%]="sfInvestPct"></div>
                </div>
                <button class="btn-sf invest" (click)="pickSfPath('invest')">📈 Invest for Growth</button>
              </div>
            </div>

            @if (sfChoice === 'invest') {
              <div class="sf-result card">
                <p>✨ Investing turned <strong>$10</strong> into <strong>$80</strong> over time! That is <strong>8x</strong> what you started with!</p>
                <p>Spending gives you instant happiness. Investing gives you growing happiness.</p>
              </div>
            }
            @if (sfChoice === 'spend') {
              <div class="sf-result card">
                <p>🍬 You got candy now, but your money is gone. Investing would have turned $10 into <strong>$80</strong> over time!</p>
                <p>Sometimes the best thing to do with money is wait.</p>
              </div>
            }

            @if (sfChoice) {
              <button class="btn-primary" (click)="goTo('garden')">🌱 Grow a Money Garden!</button>
            }
          </div>
        </div>
      }

      @if (phase === 'garden') {
        <div class="phase-container">
          <app-money-mike message="Think of money like seeds in a garden. Plant them, care for them, and watch them grow!" mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">5 / 11</span>
            <h2>🌱 Money Garden</h2>
          </div>

          <app-money-garden (done)="onGardenDone($event)"></app-money-garden>
        </div>
      }

      @if (phase === 'lemon-tree') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Money can grow like a seed if you give it time and care!" mood="thinking">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">6 / 11</span>
            <h2>🍋 The Lemon Tree Story</h2>
          </div>

          <div class="lemon-story card">
            <div class="ls-visual">
              <span class="ls-seed">🍋</span>
              <span class="ls-arrow">🌱</span>
              <span class="ls-tree">🌳</span>
              <span class="ls-arrow">🍋</span>
              <span class="ls-fruit">🍋🍋🍋</span>
            </div>
            <p>Money Mike plants a lemon seed. It needs <strong>time</strong> and <strong>care</strong>. Eventually, it produces fruit — over and over!</p>
            <div class="ls-compare">
              <div class="ls-choice bad">
                <span>🍋</span>
                <p><strong>Eating the seed</strong> = instant gratification, nothing left</p>
              </div>
              <div class="ls-choice good">
                <span>🌳</span>
                <p><strong>Planting the seed</strong> = future rewards again and again</p>
              </div>
            </div>
          </div>

          <div class="magic-store card">
            <h2>🏪 Magic Store Upgrades</h2>
            <p>As you save more, your money grows faster!</p>
            <div class="ms-levels">
              @for (lvl of storeLevels; track lvl.level) {
                <div class="ms-level" [class.unlocked]="lvl.level <= storeProgress">
                  <span class="msl-emoji">{{ lvl.emoji }}</span>
                  <span class="msl-name">{{ lvl.name }}</span>
                  <span class="msl-desc">{{ lvl.desc }}</span>
                  <span class="msl-req">{{ lvl.req }}</span>
                  @if (lvl.level <= storeProgress) {
                    <span class="msl-check">✅</span>
                  }
                </div>
              }
            </div>
            @if (storeProgress < 3) {
              <button class="btn-secondary" (click)="upgradeStore()">
                ⬆️ Save {{ '$' + (storeProgress + 1) + '0' }} to Level Up!
              </button>
            }
            @if (storeProgress >= 3) {
              <p class="ms-max">🎉 You unlocked all levels! You are an Investment Master!</p>
            }
          </div>

          <button class="btn-primary" (click)="goTo('inflation')">📈 Next: Inflation</button>
        </div>
      }

      @if (phase === 'inflation') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Sometimes things get more expensive over time. Did waiting always help?" mood="thinking">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">7 / 11</span>
            <h2>📈 The Inflation Twist</h2>
          </div>

          <div class="inflation-card card">
            <h3>Same Candy, Different Price</h3>
            <div class="inf-compare">
              <div class="inf-item today">
                <span>Today</span>
                <span class="inf-price">{{ '$1' }}</span>
                <span class="inf-tag">Cheap!</span>
              </div>
              <div class="inf-arrow">➡️</div>
              <div class="inf-item later">
                <span>Next Year</span>
                <span class="inf-price">{{ '$2' }}</span>
                <span class="inf-tag">More expensive</span>
              </div>
            </div>
            <p>This is called <strong>inflation</strong> — prices go up over time. That is why saving alone is not always enough. Your money needs to <strong>grow</strong> to keep up!</p>
            <p class="inf-lesson">Saving helps, but investing helps your money beat inflation!</p>
          </div>

          <div class="fomo-card card">
            <h2>😬 The Missing Out Game</h2>
            <p>Money Mike invests $10. Then he sees friends buying toys...</p>
            <div class="fomo-choice">
              @if (!fomoChosen) {
                <button class="btn-fomo stay" (click)="fomoStay()">
                  💪 Stay invested — trust the growth
                </button>
                <button class="btn-fomo cashout" (click)="fomoCashout()">
                  😰 Cash out early — buy toys now
                </button>
              }
              @if (fomoChosen) {
                <div class="fomo-result" [class.good]="fomoStayed" [class.bad]="!fomoStayed">
                  <span class="fomor-emoji">{{ fomoStayed ? '🎉' : '😅' }}</span>
                  <p>{{ fomoStayed ? 'You stayed invested! $10 became $30! Patience beats pressure!' : 'You cashed out early. Only got $12 total. Waiting would have given $30!' }}</p>
                </div>
              }
            </div>
          </div>

          <button class="btn-primary" (click)="goTo('multiplier')">🌈 Multiplier Zones!</button>
        </div>
      }

      @if (phase === 'multiplier') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Different choices give different growth! Check out these multiplier zones." mood="happy">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">8 / 11</span>
            <h2>🌈 Multiplier Zones</h2>
          </div>

          <div class="mz-grid">
            <div class="mz-zone red">
              <span class="mzz-emoji">🍬</span>
              <h3>Spend</h3>
              <span class="mzz-mult">1x</span>
              <p>No growth — money is gone</p>
            </div>
            <div class="mz-zone blue">
              <span class="mzz-emoji">🐷</span>
              <h3>Save</h3>
              <span class="mzz-mult">1.1x</span>
              <p>Safe but slow growth</p>
            </div>
            <div class="mz-zone gold">
              <span class="mzz-emoji">📈</span>
              <h3>Invest</h3>
              <span class="mzz-mult">1.5x+</span>
              <p>Grows faster over time</p>
            </div>
          </div>

          <div class="wait-chart card">
            <h3>⏳ Wait Time vs Reward</h3>
            <div class="wc-bars">
              <div class="wc-bar">
                <span class="wc-label">0 days</span>
                <div class="wc-fill" style="width: 10%"></div>
                <span class="wc-value">Small</span>
              </div>
              <div class="wc-bar">
                <span class="wc-label">7 days</span>
                <div class="wc-fill" style="width: 30%"></div>
                <span class="wc-value">Medium</span>
              </div>
              <div class="wc-bar">
                <span class="wc-label">30 days</span>
                <div class="wc-fill" style="width: 60%"></div>
                <span class="wc-value">Big</span>
              </div>
              <div class="wc-bar">
                <span class="wc-label">1 year</span>
                <div class="wc-fill" style="width: 100%"></div>
                <span class="wc-value">Huge!</span>
              </div>
            </div>
          </div>

          <button class="btn-primary" (click)="revealExplosion()">💥 See the Growth Explosion!</button>
        </div>
      }

      @if (phase === 'explosion') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Look at what happens! Most of the growth happens at the end, not the beginning!" mood="celebrate">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">9 / 11</span>
            <h2>💥 Compound Growth Explosion</h2>
          </div>

          <div class="exp-visual">
            <div class="exp-graph">
              <div class="exp-bar early" [style.height.%]="explosionPhase >= 1 ? 5 : 2">
                <span>Days 1-5</span>
                <span>1 cent</span>
              </div>
              <div class="exp-bar mid" [style.height.%]="explosionPhase >= 2 ? 15 : 2">
                <span>Days 6-10</span>
                <span>32 cents</span>
              </div>
              <div class="exp-bar late" [style.height.%]="explosionPhase >= 3 ? 40 : 2">
                <span>Days 11-15</span>
                <span>$10.24</span>
              </div>
              <div class="exp-bar boom" [style.height.%]="explosionPhase >= 4 ? 80 : 2">
                <span>Days 16-20</span>
                <span>$5,242.88</span>
              </div>
              <div class="exp-bar massive" [style.height.%]="explosionPhase >= 5 ? 100 : 2">
                <span>Days 21-30</span>
                <span>$5,368,709.12</span>
              </div>
            </div>

            @if (explosionPhase < 5) {
              <button class="btn-secondary" (click)="advanceExplosion()">
                {{ explosionPhase === 0 ? 'Start Growth ▶️' : 'Next Stage ➡️' }}
              </button>
            }
          </div>

          <div class="explosion-insight card">
            <h3>🌟 Most Growth Happens at the End</h3>
            <p>The first 10 days? Only 32 cents. But days 16-20? Over <strong>$5,000</strong>!</p>
            <p>That is the miracle of compounding — slow at first, then <strong>BOOM</strong>!</p>
            <p>The key: <strong>Give your money time to grow.</strong></p>
          </div>

          <button class="btn-primary" (click)="goTo('capstone')">🎯 Start Your Dream Challenge!</button>
        </div>
      }

      @if (phase === 'capstone') {
        <div class="phase-container">
          <app-money-mike message="Now for the big challenge! Can you grow $5 into enough to buy your dream item?" mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">10 / 11</span>
            <h2>🎯 Grow Your Dream Item</h2>
          </div>

          <app-dream-grow (done)="onCapstoneDone()" (result)="capResult = $event"></app-dream-grow>
        </div>
      }

      @if (phase === 'personality') {
        <div class="personality-page animate-slide-up">
          <app-money-mike [message]="'Here is your growth personality! Based on how you chose to grow money!'" mood="celebrate" size="small">
          </app-money-mike>

          <div class="personality-card">
            <span class="pc-emoji">{{ personalityEmoji }}</span>
            <h2>{{ personalityName }}</h2>
            <p>{{ personalityDescription }}</p>
          </div>

          <div class="personality-stats">
            <h3>📊 Your Growth Results</h3>
            @if (capResult) {
              <div class="pstat-row"><span>Started With</span><span>$5</span></div>
              <div class="pstat-row"><span>Final Balance</span><span>{{ '$' + capResult.finalBalance }}</span></div>
              <div class="pstat-row"><span>Total Invested</span><span>{{ '$' + capResult.invested }}</span></div>
              <div class="pstat-row"><span>Returns Earned</span><span>{{ '$' + capResult.returns }}</span></div>
              <div class="pstat-row"><span>Saved for Goal</span><span>{{ '$' + capResult.saved }}</span></div>
              <div class="pstat-row"><span>Goal Reached?</span><span>{{ capResult.reachedGoal ? '🎉 Yes' : '💪 Close!' }}</span></div>
            }
          </div>

          <div class="garden-results card">
            <h3>🌱 Your Money Garden</h3>
            @if (gardenResult) {
              <div class="pstat-row"><span>Trees Planted</span><span>{{ gardenResult.trees }}</span></div>
              <div class="pstat-row"><span>Total Invested</span><span>{{ '$' + gardenResult.saved }}</span></div>
              <div class="pstat-row"><span>Garden Value</span><span>{{ '$' + gardenResult.value }}</span></div>
            }
          </div>

          <div class="final-lesson card">
            <h3>📖 What You Learned</h3>
            <p>✅ Money can grow while you wait — it is called investing</p>
            <p>✅ Compound growth starts slow then EXPLODES</p>
            <p>✅ Saving is good, but investing helps money grow faster</p>
            <p>✅ Patience beats pressure — staying invested pays off</p>
            <p>✅ Different choices = different multiplier zones</p>
            <p>✅ The earlier you start, the more time your money has to grow</p>
          </div>

          <button class="btn-primary" (click)="finishLesson()">🎉 Complete Lesson</button>
        </div>
      }
    </div>

    @if (phase === 'complete') {
      <app-lesson-complete lessonTitle="Money Magic"
        message="Amazing! You discovered how money can grow over time through saving and investing. You earned the Growth Wizard badge!"
        [xpEarned]="100" [score]="finalScore"
        badge="Growth Wizard" badgeEmoji="📈"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro-phase { padding: 10px 0; }
    .big-idea { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .bi-emoji { font-size: 32px; }
    .big-idea p { font-family: 'Nunito', sans-serif; font-size: 16px; line-height: 1.5; margin: 0; }
    .contrast { background: #FFF8E1; }
    .ct-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-family: 'Nunito', sans-serif; font-size: 14px; }
    .ct-row span:first-child { font-size: 22px; }
    .magic-penny { text-align: center; }
    .magic-penny h2 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin-bottom: 6px; }
    .magic-penny > p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin-bottom: 12px; }
    .penny-days { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
    .penny-day {
      display: flex; flex-direction: column; align-items: center;
      padding: 8px 10px; border-radius: 12px; background: #F5F5F5;
      min-width: 70px; transition: all 0.4s;
    }
    .penny-day.animate { background: #FFF8E1; border: 2px solid #FFD54F; }
    .pd-day { font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700; color: #888; }
    .pd-emoji { font-size: 24px; }
    .pd-value { font-family: 'Nunito', sans-serif; font-size: 11px; color: #666; }
    .penny-surprise { margin: 12px 0; }
    .penny-surprise p { font-family: 'Nunito', sans-serif; font-size: 14px; margin: 4px 0; }
    .ps-big { font-family: 'Fredoka', sans-serif; font-size: 20px; color: #E65100; font-weight: 700; }

    .phase-container { padding: 10px 0; }
    .phase-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .ph-number { background: #FFD54F; border-radius: 20px; padding: 4px 14px; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; color: #5D4037; }
    .phase-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 0; }

    .predict-card { text-align: center; padding: 24px; }
    .predict-question { font-family: 'Nunito', sans-serif; font-size: 15px; margin-bottom: 16px; }
    .input-group { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
    .dollar-sign { font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #4CAF50; }
    .prediction-input { padding: 12px 20px; font-size: 24px; font-family: 'Fredoka', sans-serif; font-weight: 700; border: 3px solid #FFD54F; border-radius: 12px; width: 200px; text-align: center; outline: none; }
    .prediction-input:focus { border-color: #FFB300; box-shadow: 0 0 0 3px rgba(255,213,79,0.3); }
    .prediction-result { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 16px; margin-top: 16px; text-align: left; }
    .prediction-result.correct { background: #E8F5E9; }
    .prediction-result.incorrect { background: #FFF3E0; }
    .result-icon { font-size: 32px; flex-shrink: 0; }
    .result-text p { margin: 0 0 6px; font-size: 14px; }
    .result-answer { font-family: 'Fredoka', sans-serif; font-size: 20px !important; color: #E65100; }
    .result-explanation { font-size: 13px; color: #888; }

    .bank-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .bank-card { background: white; border: 3px solid #E0E0E0; border-radius: 20px; padding: 16px; cursor: pointer; text-align: center; transition: all 0.2s; }
    .bank-card:hover { transform: translateY(-3px); }
    .bank-card.chosen { border-color: #FFD54F; background: #FFF8E1; }
    .bc-emoji { font-size: 40px; display: block; margin-bottom: 4px; }
    .bank-card h3 { font-family: 'Fredoka', sans-serif; font-size: 16px; margin: 4px 0; }
    .bank-card p { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; margin: 4px 0; }
    .bc-result { margin: 8px 0; font-family: 'Nunito', sans-serif; font-size: 12px; color: #555; }
    .bc-amount { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #FF6F00; display: block; }
    .bc-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: inline-block; }
    .tag-good { background: #E8F5E9; color: #2E7D32; }
    .tag-ok { background: #E3F2FD; color: #1565C0; }
    .tag-meh { background: #FFF3E0; color: #E65100; }
    .bank-feedback p { font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.6; }

    .slider-card { text-align: center; padding: 32px; }
    .day-display { margin-bottom: 16px; }
    .day-label { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 700; color: #666; display: block; }
    .day-value { font-family: 'Fredoka', sans-serif; font-size: 48px; font-weight: 700; color: #FF6F00; }
    .day-slider { width: 100%; height: 12px; border-radius: 6px; background: linear-gradient(90deg, #C8E6C9, #4CAF50, #FFD54F, #FF9800, #F44336); -webkit-appearance: none; appearance: none; outline: none; margin: 12px 0; }
    .day-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 32px; height: 32px; border-radius: 50%; background: white; border: 4px solid #FF6F00; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .value-display { margin: 16px 0; }
    .penny-stack { font-size: 40px; display: block; }
    .value-text { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #2E7D32; display: block; margin-top: 8px; }
    .growth-message { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; font-style: italic; min-height: 20px; }
    .pile-visual { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-top: 16px; transition: transform 0.3s; min-height: 60px; }
    .pile-coin { font-size: 24px; animation: popIn 0.3s both; }
    @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .sf-game { max-width: 520px; margin: 0 auto; }
    .sf-intro { text-align: center; font-size: 16px; margin-bottom: 16px; }
    .sf-paths { display: flex; gap: 12px; margin-bottom: 16px; }
    .sf-path { flex: 1; background: white; border-radius: 20px; padding: 20px; text-align: center; border: 3px solid #E0E0E0; transition: all 0.3s; }
    .sf-path.active { transform: scale(1.03); }
    .sf-path.spend.active { border-color: #FF9800; background: #FFF3E0; }
    .sf-path.invest.active { border-color: #4CAF50; background: #E8F5E9; }
    .sfp-emoji { font-size: 36px; display: block; }
    .sf-path h3 { font-family: 'Fredoka', sans-serif; font-size: 16px; margin: 6px 0; }
    .sf-path p { font-family: 'Nunito', sans-serif; font-size: 13px; color: #555; }
    .sfp-bar { height: 10px; background: #E0E0E0; border-radius: 5px; margin: 8px 0; overflow: hidden; }
    .sfp-fill { height: 100%; background: #FF9800; border-radius: 5px; transition: width 0.5s; }
    .sfp-fill.gold { background: linear-gradient(90deg, #FFD54F, #FF9800); }
    .btn-sf { padding: 10px 16px; border-radius: 50px; border: none; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-sf.spend { background: #FFF3E0; color: #E65100; border: 2px solid #FF9800; }
    .btn-sf.invest { background: #E8F5E9; color: #2E7D32; border: 2px solid #4CAF50; }
    .btn-sf:hover { transform: translateY(-2px); }

    .lemon-story { text-align: center; }
    .ls-visual { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 32px; margin-bottom: 12px; }
    .ls-arrow { font-size: 20px; color: #4CAF50; }
    .lemon-story p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; line-height: 1.6; }
    .ls-compare { display: flex; gap: 10px; margin-top: 12px; }
    .ls-choice { flex: 1; padding: 12px; border-radius: 14px; text-align: center; }
    .ls-choice.bad { background: #FFF3E0; border: 2px solid #FF9800; }
    .ls-choice.good { background: #E8F5E9; border: 2px solid #4CAF50; }
    .ls-choice span { font-size: 28px; display: block; }
    .ls-choice p { font-family: 'Nunito', sans-serif; font-size: 12px; margin: 6px 0 0; }
    .magic-store { text-align: center; }
    .magic-store h2 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin-bottom: 4px; }
    .magic-store > p { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; margin-bottom: 12px; }
    .ms-levels { display: flex; flex-direction: column; gap: 6px; }
    .ms-level { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; background: #F5F5F5; }
    .ms-level.unlocked { background: #E8F5E9; }
    .msl-emoji { font-size: 22px; }
    .msl-name { font-family: 'Fredoka', sans-serif; font-size: 14px; flex: 1; }
    .msl-desc { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; }
    .msl-req { font-family: 'Nunito', sans-serif; font-size: 11px; color: #FF6F00; font-weight: 600; }
    .msl-check { font-size: 16px; }
    .ms-max { font-family: 'Fredoka', sans-serif; font-size: 16px; color: #2E7D32; margin-top: 8px; }

    .inflation-card { text-align: center; }
    .inflation-card h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 12px; }
    .inf-compare { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; }
    .inf-item { display: flex; flex-direction: column; align-items: center; padding: 14px; border-radius: 14px; min-width: 100px; }
    .inf-item.today { background: #E8F5E9; }
    .inf-item.later { background: #FFF3E0; }
    .inf-item span:first-child { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; }
    .inf-price { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; }
    .inf-tag { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; }
    .inf-arrow { font-size: 24px; color: #4CAF50; }
    .inflation-card > p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; line-height: 1.6; }
    .inf-lesson { font-family: 'Fredoka', sans-serif; font-size: 16px; color: #E65100; font-weight: 700; margin-top: 8px !important; }
    .fomo-card { text-align: center; }
    .fomo-card h2 { margin-bottom: 6px; }
    .fomo-card > p { font-family: 'Nunito', sans-serif; font-size: 14px; margin-bottom: 12px; }
    .fomo-choice { display: flex; flex-direction: column; gap: 8px; }
    .btn-fomo { padding: 12px 16px; border-radius: 50px; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-fomo.stay { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .btn-fomo.cashout { background: linear-gradient(135deg, #FF9800, #FFB74D); color: white; }
    .btn-fomo:hover { transform: translateY(-2px); }
    .fomo-result { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 14px; margin-top: 8px; text-align: left; }
    .fomo-result.good { background: #E8F5E9; }
    .fomo-result.bad { background: #FFF3E0; }
    .fomor-emoji { font-size: 28px; }
    .fomo-result p { margin: 0; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.5; }

    .mz-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .mz-zone { text-align: center; padding: 18px; border-radius: 20px; }
    .mz-zone.red { background: #FFF3E0; border: 3px solid #FF9800; }
    .mz-zone.blue { background: #E3F2FD; border: 3px solid #2196F3; }
    .mz-zone.gold { background: #FFF8E1; border: 3px solid #FFD54F; }
    .mzz-emoji { font-size: 36px; display: block; }
    .mz-zone h3 { font-family: 'Fredoka', sans-serif; font-size: 16px; margin: 4px 0; }
    .mzz-mult { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; display: block; }
    .mz-zone.red .mzz-mult { color: #E65100; }
    .mz-zone.blue .mzz-mult { color: #1565C0; }
    .mz-zone.gold .mzz-mult { color: #F9A825; }
    .mz-zone p { font-family: 'Nunito', sans-serif; font-size: 12px; color: #888; margin: 4px 0 0; }
    .wait-chart { text-align: center; }
    .wait-chart h3 { margin-bottom: 12px; }
    .wc-bars { display: flex; flex-direction: column; gap: 6px; }
    .wc-bar { display: flex; align-items: center; gap: 8px; }
    .wc-label { font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 600; color: #666; min-width: 60px; }
    .wc-fill { height: 20px; background: linear-gradient(90deg, #4CAF50, #8BC34A); border-radius: 10px; transition: width 0.5s; }
    .wc-value { font-family: 'Fredoka', sans-serif; font-size: 13px; color: #333; }

    .exp-visual { text-align: center; }
    .exp-graph { display: flex; align-items: flex-end; justify-content: center; gap: 8px; height: 300px; margin-bottom: 16px; }
    .exp-bar { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 60px; border-radius: 12px 12px 0 0; transition: height 1s ease; padding: 8px 4px; text-align: center; }
    .exp-bar.early { background: linear-gradient(180deg, #C8E6C9, #A5D6A7); }
    .exp-bar.mid { background: linear-gradient(180deg, #FFF9C4, #FFE082); }
    .exp-bar.late { background: linear-gradient(180deg, #FFE0B2, #FFB74D); }
    .exp-bar.boom { background: linear-gradient(180deg, #FFCCBC, #FF8A65); }
    .exp-bar.massive { background: linear-gradient(180deg, #F8BBD0, #F06292); }
    .exp-bar span:first-child { font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 600; color: #333; }
    .exp-bar span:last-child { font-family: 'Fredoka', sans-serif; font-size: 11px; color: #333; }

    .explosion-insight { text-align: center; }
    .explosion-insight h3 { margin-bottom: 8px; }
    .explosion-insight p { font-family: 'Nunito', sans-serif; font-size: 14px; margin-bottom: 6px; }

    .personality-page { padding: 10px 0; text-align: center; }
    .personality-card { background: linear-gradient(135deg, #FFF8E1, #FFE082); border-radius: 24px; padding: 28px; margin: 16px 0; }
    .pc-emoji { font-size: 64px; display: block; margin-bottom: 8px; }
    .personality-card h2 { font-family: 'Fredoka', sans-serif; font-size: 28px; color: #E65100; margin: 0; }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin: 8px 0 0; }
    .personality-stats { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin: 16px 0; text-align: left; }
    .personality-stats h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 10px; }
    .pstat-row { display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; padding: 6px 0; border-bottom: 1px solid #F0F0F0; }
    .pstat-row:last-child { border-bottom: none; }
    .garden-results { text-align: left; }
    .garden-results h3 { margin-bottom: 8px; }
    .final-lesson { text-align: left; }
    .final-lesson h3 { margin-bottom: 8px; }
    .final-lesson p { font-size: 14px; margin-bottom: 6px; padding-left: 4px; }

    @media (max-width: 480px) {
      .bank-grid { grid-template-columns: 1fr; }
      .mz-grid { grid-template-columns: 1fr; }
      .sf-paths { flex-direction: column; }
      .ls-compare { flex-direction: column; }
      .exp-graph { height: 200px; }
      .exp-bar { width: 40px; }
      .penny-days { gap: 4px; }
      .penny-day { min-width: 55px; padding: 6px 8px; }
    }
  `]
})
export class MoneyMagicComponent {
  protected phase: Phase = 'intro';

  // Penny reveal state
  protected revealedDays = 0;

  // Prediction state
  protected prediction = 0;
  protected showPredictionResult = false;
  protected isPredictionCorrect = false;

  // Bank choice
  protected chosenBank = '';

  // Slider state
  protected sliderDay = 1;

  // Slow-fast state
  protected sfChoice: 'spend' | 'invest' | null = null;

  // Garden result
  protected gardenResult: { trees: number; saved: number; value: number } | null = null;

  // Store state
  protected storeProgress = 0;

  // FOMO state
  protected fomoChosen = false;
  protected fomoStayed = false;

  // Explosion state
  protected explosionPhase = 0;

  // Capstone result
  protected capResult: {
    saved: number; spent: number; earned: number; invested: number; returns: number;
    totalJobs: number; highEffortJobs: number; reachedGoal: boolean; goalCost: number; finalBalance: number;
  } | null = null;

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  protected readonly pennyDays: PennyDay[] = [
    { day: 1, emoji: '🪙', value: 0.01, label: '1 cent' },
    { day: 2, emoji: '🪙🪙', value: 0.02, label: '2 cents' },
    { day: 3, emoji: '🪙🪙🪙🪙', value: 0.04, label: '4 cents' },
    { day: 4, emoji: '🪙'.repeat(8), value: 0.08, label: '8 cents' },
    { day: 5, emoji: '🪙'.repeat(16), value: 0.16, label: '16 cents' },
    { day: 6, emoji: '💰', value: 0.32, label: '32 cents' },
  ];

  protected readonly banks = [
    { id: 'piggy', name: 'Piggy Bank', emoji: '🐷', desc: 'Money stays the same — no growth', resultLabel: '$10', tag: 'Safe, no growth' },
    { id: 'bank', name: 'Regular Bank', emoji: '🏦', desc: 'Money stays safe — tiny growth', resultLabel: '$10.50', tag: 'Safe, tiny growth' },
    { id: 'magic', name: 'Magic Growth Bank', emoji: '✨', desc: 'Money grows over time!', resultLabel: '$15+', tag: 'Grows over time!' },
  ];

  protected readonly storeLevels = [
    { level: 1, name: 'Saver Apprentice', emoji: '🌱', desc: 'Money starts to grow slowly', req: 'Save $10' },
    { level: 2, name: 'Growth Wizard', emoji: '🌿', desc: 'Growth speeds up!', req: 'Save $25' },
    { level: 3, name: 'Investment Master', emoji: '🌳', desc: 'Fastest growth possible!', req: 'Save $50' },
  ];

  get currentValue(): number {
    return Math.pow(2, this.sliderDay - 1) / 100;
  }

  get pennyStack(): string {
    const count = Math.min(this.sliderDay, 20);
    return '🪙'.repeat(Math.max(1, Math.floor(count / 2)));
  }

  get pileScale(): number {
    return Math.min(1 + this.sliderDay * 0.02, 2.5);
  }

  get coinPile(): number[] {
    const count = Math.min(this.sliderDay * 2, 30);
    return Array.from({ length: count }, (_, i) => i * 50);
  }

  get growthMessage(): string {
    const v = this.currentValue;
    if (v < 0.1) return 'Just getting started...';
    if (v < 1) return 'Growing slowly...';
    if (v < 100) return 'Now it is picking up!';
    if (v < 10000) return 'Look at it go! 🚀';
    return 'BOOM! Explosive growth! 💥';
  }

  get sfSpendResult(): number {
    return 10;
  }

  get sfSpendPct(): number {
    return 12;
  }

  get sfInvestPct(): number {
    return 100;
  }

  get personaInvestChoices(): number {
    const r = this.capResult;
    return r ? r.invested : 0;
  }

  get personaSaveChoices(): number {
    const r = this.capResult;
    return r ? r.saved : 0;
  }

  get finalScore(): number {
    const r = this.capResult;
    if (!r) return 100;
    return r.finalBalance + r.returns;
  }

  get personalityEmoji(): string {
    const r = this.capResult;
    if (!r) return '📈';
    if (r.invested >= 20) return '🌳';
    if (r.reachedGoal) return '🏆';
    if (r.saved >= 30) return '🐷';
    return '🌟';
  }

  get personalityName(): string {
    const r = this.capResult;
    if (!r) return 'Growth Wizard';
    if (r.invested >= 20) return 'Investment Master';
    if (r.reachedGoal) return 'Growth Wizard';
    if (r.saved >= 30) return 'Balanced Grower';
    return 'Instant Spender';
  }

  get personalityDescription(): string {
    const r = this.capResult;
    if (!r) return 'You are learning that money can grow over time. Keep exploring!';
    if (r.invested >= 20) return 'You are an Investment Master! You understand that investing makes your money work for you. You think far ahead and maximize growth by letting your money compound over time.';
    if (r.reachedGoal) return 'You are a Growth Wizard! You understand the long-term power of saving and investing. You balanced saving, spending, and investing to reach your goal!';
    if (r.saved >= 30) return 'You are a Balanced Grower! You sometimes spend, sometimes save, and understand that finding the right balance is smart money management.';
    return 'You are an Instant Spender who is learning! You like quick rewards, and that is okay — now you are discovering that waiting can lead to even bigger rewards!';
  }

  protected formatMoney(value: number): string {
    if (value < 1) return value.toFixed(2);
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected goTo(phase: Phase): void {
    this.phase = phase;
    this.audio.playClick();
  }

  protected revealNextDay(): void {
    this.revealedDays++;
    this.audio.playCoin();
  }

  protected checkPrediction(): void {
    const answer = 5242.88;
    const diff = Math.abs(this.prediction - answer);
    this.isPredictionCorrect = diff < answer * 0.2;
    this.showPredictionResult = true;
    if (this.isPredictionCorrect) {
      this.audio.playSuccess();
    } else {
      this.audio.playIncorrect();
    }
  }

  protected pickBank(id: string): void {
    this.chosenBank = id;
    this.audio.playClick();
  }

  protected get bankFeedback(): string {
    switch (this.chosenBank) {
      case 'piggy': return '🐷 The piggy bank keeps money safe, but it never grows. After 30 days you still have $10. Safe, but no growth!';
      case 'bank': return '🏦 A regular bank keeps money safe and gives a tiny bit of growth. After 30 days you have $10.50 — better but still slow!';
      case 'magic': return '✨ The Magic Growth Bank! Your money grows over time. After 30 days you could have $15 or more! That is the power of investing!';
      default: return '';
    }
  }

  protected updateDay(): void {
    this.audio.playCoin();
  }

  protected pickSfPath(path: 'spend' | 'invest'): void {
    this.sfChoice = path;
    this.audio.playClick();
  }

  protected onGardenDone(result: { trees: number; saved: number; value: number }): void {
    this.gardenResult = result;
    this.audio.playSuccess();
    this.goTo('lemon-tree');
  }

  protected upgradeStore(): void {
    if (this.storeProgress < 3) {
      this.storeProgress++;
      this.audio.playCoin();
    }
  }

  protected fomoStay(): void {
    this.fomoChosen = true;
    this.fomoStayed = true;
    this.audio.playSuccess();
  }

  protected fomoCashout(): void {
    this.fomoChosen = true;
    this.fomoStayed = false;
    this.audio.playIncorrect();
  }

  protected revealExplosion(): void {
    this.goTo('explosion');
    setTimeout(() => this.advanceExplosion(), 300);
  }

  protected advanceExplosion(): void {
    if (this.explosionPhase < 5) {
      this.explosionPhase++;
      this.audio.playCoin();
    }
  }

  protected onCapstoneDone(): void {
    this.audio.playSuccess();
    this.goTo('personality');
  }

  protected finishLesson(): void {
    const r = this.capResult;
    const sc = r ? r.finalBalance + r.returns : 100;
    this.profile.addScore(sc);
    this.profile.addXp(100);
    this.profile.addBadge('Growth Wizard');
    this.profile.completeLesson('money-magic');
    this.audio.playBadge();
    this.phase = 'complete';
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
