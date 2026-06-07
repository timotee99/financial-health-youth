import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { DreamSimulatorComponent } from './dream-simulator';

interface ChoiceScenario {
  id: string;
  emoji: string;
  title: string;
  description: string;
  presentChoice: string;
  futureChoice: string;
  presentOutcome: string;
  futureOutcome: string;
  correctIsFuture: boolean;
}

type Phase =
  | 'intro' | 'piggy' | 'bicycle' | 'choices'
  | 'surprise' | 'simulator' | 'personality' | 'complete';

@Component({
  selector: 'app-wait-or-buy-now',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent, DreamSimulatorComponent],
  template: `
    <div class="page-container">
      @if (phase === 'intro') {
        <div class="intro animate-slide-up">
          <app-money-mike message="I found a TIME MACHINE! Let me show you what happens when you wait vs when you buy now!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <div class="big-idea">
              <span class="bi-emoji">⏰</span>
              <p><strong>The "Wait for Something Better" Superpower</strong> — Sometimes buying now feels good. Waiting can feel even better!</p>
            </div>
          </div>

          <div class="lesson-content card">
            <h2>🍬 Candy vs Giant Candy</h2>
            <p>Imagine you have a choice right now:</p>
            <div class="compare-row">
              <div class="compare-card now">
                <span class="cc-emoji">🍬</span>
                <h3>One Candy</h3>
                <p>Eat it now. It is gone in 2 minutes.</p>
              </div>
              <span class="vs-badge">VS</span>
              <div class="compare-card later">
                <span class="cc-emoji">🍫</span>
                <h3>Giant Candy Pack</h3>
                <p>Wait one week. Enjoy it for days!</p>
              </div>
            </div>
            <p class="compare-lesson">Waiting often gives you more. This is the superpower of patience!</p>
          </div>

          <div class="lesson-content card">
            <h2>⏳ The Time Machine</h2>
            <p>At every decision, Money Mike can look into the future to see:</p>
            <div class="future-peek">
              <div class="fp-now"><span>🟢</span> What happens if he buys now</div>
              <div class="fp-wait"><span>🔵</span> What happens if he waits</div>
            </div>
          </div>

          <div class="phase-nav"><button class="btn-primary" (click)="goTo('piggy')">⏰ Start the Time Machine!</button></div>
        </div>
      }

      @if (phase === 'piggy') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Let's see what happens when you save $10 instead of spending it!" mood="thinking" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">1 / 6</span>
            <h2>🏦 The Growing Piggy Bank</h2>
          </div>

          <div class="piggy-game">
            <p class="pg-intro">Money Mike has <strong>$10</strong>. He can spend it now or put it in the piggy bank.</p>

            @if (!piggyStarted) {
              <div class="pg-decision">
                <button class="pg-btn spend" (click)="piggySpend()">🛒 Spend $10 now on a small toy</button>
                <button class="pg-btn save" (click)="piggySave()">🏦 Put $10 in the piggy bank</button>
              </div>
            }

            @if (piggyStarted) {
              <div class="pg-weeks">
                @for (w of [1,2,3,4,5]; track w) {
                  <div class="pg-week" [class.active]="w <= piggyWeek">
                    <span class="pw-label">Week {{ w }}</span>
                    <div class="pw-jar">
                      @if (piggySaved) {
                        <span class="pw-amount">{{ '$' + (10 + (w - 1) * 5) }}</span>
                        <div class="pw-fill" [style.height.%]="w * 20"></div>
                      } @else {
                        <span class="pw-amount">$0</span>
                        <span class="pw-empty">Empty</span>
                      }
                    </div>
                  </div>
                }
              </div>

              @if (piggyWeek < 5) {
                <button class="btn-secondary" (click)="advancePiggyWeek()">⏩ Next Week</button>
              }

              @if (piggyWeek >= 5) {
                <div class="pg-result">
                  @if (piggySaved) {
                    <p>🎉 By waiting 5 weeks, $10 grew to <strong>$30</strong>! That is the power of saving!</p>
                  } @else {
                    <p>😅 Because you spent the $10, you have nothing left. If you saved, you would have $30 by now!</p>
                  }
                  <button class="btn-primary" (click)="goTo('bicycle')">🚲 Next Challenge</button>
                </div>
              }
            }
          </div>
        </div>
      }

      @if (phase === 'bicycle') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Money Mike wants a bicycle! Let's help him save up!" mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">2 / 6</span>
            <h2>🚲 The Dream Bicycle</h2>
          </div>

          <div class="bike-game">
            <div class="bike-goal-visual">
              <span class="bgv-emoji">🚲</span>
              <span class="bgv-label">Bicycle</span>
              <span class="bgv-cost">$100</span>
            </div>

            <div class="bike-progress">
              <div class="bk-bar"><div class="bk-fill" [style.width.%]="bikeProgressPct"></div></div>
              <span class="bk-pct">{{ '$' + bikeSaved }} / $100</span>
            </div>

            <div class="bike-week">
              <span class="bw-label">Week {{ bikeWeek }} / 10</span>
              <div class="bw-earn">You earned <strong>$10</strong></div>
              <div class="bw-wallet">Wallet: <strong>{{ '$' + bikeWallet }}</strong></div>
            </div>

            <div class="bike-decision">
              <button class="bk-btn save" (click)="bikeSave()">🏦 Save $10 for bicycle</button>
              <button class="bk-btn spend" (click)="bikeSpend()">🛒 Spend $10 on something fun</button>
            </div>

            @if (bikeWeek >= 10 || bikeSaved >= 100) {
              <div class="bike-result">
                @if (bikeSaved >= 100) {
                  <p>🎉 Goal reached! You saved $100 and got the bicycle! Because you waited week after week, you achieved something big!</p>
                } @else {
                  <p>You saved {{ '$' + bikeSaved }} out of $100. You spent {{ '$' + bikeSpentTotal }} on other things. Next time, try saving more!</p>
                }
                <button class="btn-primary" (click)="confirmBicycle()">Continue ➡️</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'choices') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Let's meet Present Mike and Future Mike! They always argue about what to do with money." mood="thinking" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">3 / 6</span>
            <h2>⚡ Future You vs Present You</h2>
          </div>

          @if (scenarioIndex < scenarios.length) {
            <div class="scenario-card">
              <div class="sc-characters">
                <div class="sc-present">
                  <span class="sc-emoji">😎</span>
                  <span class="sc-label">Present Mike</span>
                </div>
                <span class="sc-vs">VS</span>
                <div class="sc-future">
                  <span class="sc-emoji">🧠</span>
                  <span class="sc-label">Future Mike</span>
                </div>
              </div>

              <span class="sc-scenario-emoji">{{ currentScenario.emoji }}</span>
              <h3>{{ currentScenario.title }}</h3>
              <p>{{ currentScenario.description }}</p>

              <div class="sc-voices">
                <button class="sc-voice present" (click)="pickScenario(false)">
                  <span>😎 Present Mike says:</span>
                  <span>"{{ currentScenario.presentChoice }}"</span>
                </button>
                <button class="sc-voice future" (click)="pickScenario(true)">
                  <span>🧠 Future Mike says:</span>
                  <span>"{{ currentScenario.futureChoice }}"</span>
                </button>
              </div>

              @if (scenarioChosen) {
                <div class="sc-outcome">
                  <span>{{ scenarioCorrect ? '🎉' : '🤔' }}</span>
                  <p>
                    @if (!scenarioChoseFuture) {
                      {{ currentScenario.presentOutcome }}
                    } @else {
                      {{ currentScenario.futureOutcome }}
                    }
                  </p>
                </div>
              }

              @if (scenarioChosen) {
                <button class="btn-secondary" (click)="nextScenario()">
                  {{ scenarioIndex >= scenarios.length - 1 ? 'Done' : 'Next ➡️' }}
                </button>
              }
            </div>
          } @else {
            <div class="sc-done">
              <p>You listened to Future Mike {{ waitingChoices }} time(s)! Every time you choose waiting, your superpower grows!</p>
              <button class="btn-primary" (click)="goTo('surprise')">😮 Next: Surprise Events</button>
            </div>
          }
        </div>
      }

      @if (phase === 'surprise') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Life throws surprises at us! Let's see who is ready." mood="thinking" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">4 / 6</span>
            <h2>🎁 The Surprise Event Game</h2>
          </div>

          <div class="surprise-game">
            <p class="sg-intro">Something unexpected happened! Do you have savings to handle it?</p>

            <div class="surprise-card">
              <span class="surp-emoji">{{ surpriseEvent.emoji }}</span>
              <h3>{{ surpriseEvent.title }}</h3>
              <p>{{ surpriseEvent.description }}</p>
              <p class="surp-cost">Cost: <strong>{{ '$' + surpriseEvent.cost }}</strong></p>

              <div class="surp-wallet">Your savings: <strong>{{ '$' + surpriseSavings }}</strong></div>

              <div class="surp-outcome" [class.good]="surpriseSavings >= surpriseEvent.cost">
                @if (surpriseSavings >= surpriseEvent.cost) {
                  <span>✅ You have enough savings! You can handle this surprise without worry.</span>
                } @else {
                  <span>❌ You do not have enough saved! If you had waited and saved more, you could handle this easily.</span>
                }
              </div>

              <p class="surp-lesson">This is why waiting and saving gives you choices. Spending everything leaves you stuck!</p>
            </div>

            @if (surpriseIndex < surprises.length - 1) {
              <button class="btn-secondary" (click)="nextSurprise()">Next Surprise ➡️</button>
            } @else {
              <button class="btn-primary" (click)="goTo('simulator')">🚀 Start 30-Day Simulator!</button>
            }
          </div>
        </div>
      }

      @if (phase === 'simulator') {
        <div class="phase-container">
          <app-money-mike message="Now for the big challenge! A 30-day journey where every choice matters!" mood="happy" size="small">
          </app-money-mike>
          <div class="phase-header">
            <span class="ph-number">5 / 6</span>
            <h2>🗓️ 30-Day Dream Goal Simulator</h2>
          </div>
          <app-dream-simulator (done)="onSimulatorDone()" (result)="simResult = $event"></app-dream-simulator>
        </div>
      }

      @if (phase === 'personality') {
        <div class="personality-page animate-slide-up">
          <app-money-mike [message]="personalityMessage" mood="celebrate" size="small"></app-money-mike>

          <div class="waiting-meter">
            <h3>⏰ Your Waiting Superpower</h3>
            <div class="meter-stars">
              @for (s of [1,2,3,4,5]; track s) {
                <span class="meter-star" [class.filled]="s <= waitingStarLevel">{{ s <= waitingStarLevel ? '⭐' : '☆' }}</span>
              }
            </div>
            <span class="meter-title">{{ waitingTitle }}</span>
          </div>

          <div class="personality-card">
            <span class="pc-emoji">{{ personalityEmoji }}</span>
            <h2>{{ personalityName }}</h2>
            <p>{{ personalityDescription }}</p>
          </div>

          <div class="sim-stats">
            <h3>📊 Your Simulator Results</h3>
            @if (simResult) {
              <div class="ss-row"><span>Total Earned</span><span>{{ '$' + simResult.earned }}</span></div>
              <div class="ss-row"><span>Saved for Goal</span><span>{{ '$' + simResult.saved }}</span></div>
              <div class="ss-row"><span>Spent on Other Things</span><span>{{ '$' + simResult.spent }}</span></div>
              <div class="ss-row"><span>Waiting Stars Earned</span><span>⭐ {{ simResult.stars }}</span></div>
            }
          </div>

          <div class="final-lesson card">
            <h3>📖 What You Learned</h3>
            <p>✅ Waiting often gives you more than buying now</p>
            <p>✅ Saving money grows over time — even small amounts add up</p>
            <p>✅ Every choice means giving up another choice (opportunity cost)</p>
            <p>✅ Savings protect you from life's surprises</p>
            <p>✅ Sometimes buying now IS smart — for things you truly need</p>
          </div>

          <button class="btn-primary" (click)="finishLesson()">🎉 Complete Lesson</button>
        </div>
      }
    </div>

    @if (phase === 'complete') {
      <app-lesson-complete lessonTitle="Wait or Buy Now"
        [message]="'Amazing! You learned the superpower of waiting! You can now make smart choices about when to spend and when to save. You earned the Time Traveler badge!'"
        [xpEarned]="100" [score]="finalScore"
        badge="Time Traveler" badgeEmoji="⏰"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro { padding: 10px 0; }
    .lesson-content { margin-bottom: 16px; text-align: left; }
    .lesson-content h2 { font-family: 'Fredoka', sans-serif; font-size: 21px; margin-bottom: 8px; }
    .lesson-content > p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 10px; }
    .big-idea { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-radius: 16px; padding: 16px; }
    .bi-emoji { font-size: 32px; }
    .big-idea p { font-family: 'Nunito', sans-serif; font-size: 16px; line-height: 1.5; margin: 0; }
    .compare-row { display: flex; align-items: center; gap: 10px; margin: 12px 0; }
    .compare-card { flex: 1; padding: 16px; border-radius: 16px; text-align: center; }
    .compare-card.now { background: #FFF3E0; border: 3px solid #FFE0B2; }
    .compare-card.later { background: #E8F5E9; border: 3px solid #C8E6C9; }
    .cc-emoji { font-size: 40px; display: block; }
    .compare-card h3 { font-family: 'Fredoka', sans-serif; font-size: 16px; margin: 4px 0; }
    .compare-card p { font-family: 'Nunito', sans-serif; font-size: 13px; color: #666; margin: 0; }
    .vs-badge { font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #FF6F00; }
    .compare-lesson { text-align: center; font-style: italic; color: #888; font-size: 14px; }
    .future-peek { display: flex; gap: 10px; margin: 8px 0; }
    .fp-now, .fp-wait { flex: 1; padding: 10px; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; }
    .fp-now { background: #FFF3E0; }
    .fp-wait { background: #E3F2FD; }
    .phase-nav { text-align: center; padding: 20px 0; }
    .phase-container { padding: 10px 0; }
    .phase-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .ph-number { background: #FFD54F; border-radius: 20px; padding: 4px 14px; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; color: #5D4037; }
    .phase-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 0; }

    .piggy-game { max-width: 500px; margin: 0 auto; text-align: center; }
    .pg-intro { font-family: 'Nunito', sans-serif; font-size: 15px; margin-bottom: 16px; }
    .pg-decision { display: flex; flex-direction: column; gap: 10px; }
    .pg-btn { padding: 14px 20px; border-radius: 50px; font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
    .pg-btn.spend { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .pg-btn.save { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .pg-btn:hover { transform: translateY(-2px); }
    .pg-weeks { display: flex; gap: 8px; margin: 16px 0; justify-content: center; }
    .pg-week { width: 80px; text-align: center; }
    .pw-label { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; display: block; margin-bottom: 4px; }
    .pw-jar {
      height: 120px; background: #F5F5F5; border-radius: 10px;
      display: flex; flex-direction: column; align-items: center;
      justify-content: flex-end; padding: 8px; position: relative;
      overflow: hidden;
    }
    .pw-fill {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(to top, #4CAF50, #66BB6A);
      border-radius: 10px; transition: height 0.5s;
    }
    .pw-amount { font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; color: #333; z-index: 1; }
    .pw-empty { font-family: 'Nunito', sans-serif; font-size: 11px; color: #ccc; z-index: 1; }
    .pg-result { margin-top: 12px; font-family: 'Nunito', sans-serif; font-size: 15px; line-height: 1.6; }

    .bike-game { max-width: 480px; margin: 0 auto; }
    .bike-goal-visual { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 12px; }
    .bgv-emoji { font-size: 48px; }
    .bgv-label { font-family: 'Fredoka', sans-serif; font-size: 22px; }
    .bgv-cost { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 700; color: #FF6F00; }
    .bike-progress { margin-bottom: 16px; }
    .bk-bar { height: 20px; background: #E0E0E0; border-radius: 10px; overflow: hidden; margin-bottom: 4px; }
    .bk-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #66BB6A); border-radius: 10px; transition: width 0.3s; }
    .bk-pct { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #666; }
    .bike-week { text-align: center; margin-bottom: 12px; }
    .bw-label { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; display: block; }
    .bw-earn { font-family: 'Nunito', sans-serif; font-size: 15px; margin: 4px 0; }
    .bw-wallet { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #FF6F00; }
    .bike-decision { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .bk-btn { padding: 12px; border-radius: 50px; font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
    .bk-btn.save { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .bk-btn.spend { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .bk-btn:hover { transform: translateY(-2px); }
    .bike-result { text-align: center; font-family: 'Nunito', sans-serif; font-size: 15px; line-height: 1.6; }

    .scenario-card { background: white; border-radius: 24px; padding: 24px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
    .sc-characters { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; }
    .sc-present, .sc-future { display: flex; flex-direction: column; align-items: center; }
    .sc-emoji { font-size: 36px; }
    .sc-label { font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 600; color: #888; }
    .sc-vs { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #FF6F00; }
    .sc-scenario-emoji { font-size: 48px; display: block; margin-bottom: 8px; }
    .scenario-card h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 4px 0; }
    .scenario-card > p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin: 6px 0 16px; }
    .sc-voices { display: flex; flex-direction: column; gap: 8px; }
    .sc-voice {
      padding: 12px 16px; border-radius: 14px; border: 3px solid #E0E0E0;
      background: white; cursor: pointer; text-align: left;
      transition: all 0.2s;
    }
    .sc-voice:hover { border-color: #FFD54F; }
    .sc-voice span:first-child { font-family: 'Fredoka', sans-serif; font-size: 14px; display: block; margin-bottom: 4px; }
    .sc-voice span:last-child { font-family: 'Nunito', sans-serif; font-size: 15px; color: #333; }
    .sc-voice.present span:first-child { color: #E65100; }
    .sc-voice.future span:first-child { color: #1565C0; }
    .sc-outcome { margin-top: 12px; padding: 12px; border-radius: 10px; background: #FFF8E1; font-family: 'Nunito', sans-serif; font-size: 14px; }
    .sc-done { text-align: center; }

    .surprise-game { max-width: 480px; margin: 0 auto; }
    .sg-intro { text-align: center; font-family: 'Nunito', sans-serif; font-size: 15px; margin-bottom: 16px; }
    .surprise-card {
      background: white; border-radius: 24px; padding: 24px; text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); margin-bottom: 12px;
    }
    .surp-emoji { font-size: 56px; display: block; }
    .surprise-card h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 4px 0; }
    .surprise-card > p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; }
    .surp-cost { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 700; color: #D32F2F; }
    .surp-wallet { font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #FF6F00; margin: 8px 0; }
    .surp-outcome { padding: 12px; border-radius: 12px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 10px; }
    .surp-outcome.good { background: #E8F5E9; }
    .surp-outcome:not(.good) { background: #FFF3E0; }
    .surp-lesson { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; font-style: italic; }

    .personality-page { padding: 10px 0; text-align: center; }
    .waiting-meter { background: linear-gradient(135deg, #FFF8E1, #FFE082); border-radius: 20px; padding: 20px; margin: 16px 0; }
    .waiting-meter h3 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin: 0 0 10px; }
    .meter-stars { font-size: 36px; margin-bottom: 6px; }
    .meter-star { transition: all 0.3s; }
    .meter-star.filled { animation: starPop 0.3s ease; }
    @keyframes starPop { 0% { transform: scale(0.5); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
    .meter-title { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #E65100; }
    .personality-card { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-radius: 24px; padding: 28px; margin: 16px 0; }
    .pc-emoji { font-size: 64px; display: block; margin-bottom: 8px; }
    .personality-card h2 { font-family: 'Fredoka', sans-serif; font-size: 28px; color: #1565C0; margin: 0; }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin: 8px 0 0; }
    .sim-stats { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin: 16px 0; text-align: left; }
    .sim-stats h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 10px; }
    .ss-row { display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; padding: 6px 0; border-bottom: 1px solid #F0F0F0; }
    .ss-row:last-child { border-bottom: none; }
    .final-lesson { text-align: left; }
    .final-lesson h3 { margin-bottom: 8px; }
    .final-lesson p { font-size: 14px; margin-bottom: 6px; padding-left: 4px; }
    @media (max-width: 480px) {
      .compare-row { flex-direction: column; }
      .pg-weeks { flex-wrap: wrap; }
      .sc-characters { flex-direction: column; }
    }
  `]
})
export class WaitOrBuyNowComponent {
  protected phase: Phase = 'intro';

  // Piggy bank state
  protected piggyStarted = false;
  protected piggySaved = false;
  protected piggyWeek = 0;

  // Bicycle state
  protected bikeWeek = 0;
  protected bikeSaved = 0;
  protected bikeSpentTotal = 0;
  protected bikeWallet = 0;

  // Choices state
  protected scenarioIndex = 0;
  protected scenarioChosen = false;
  protected scenarioChoseFuture = false;
  protected scenarioCorrect = false;
  protected waitingChoices = 0;

  // Surprise state
  protected surpriseIndex = 0;
  protected surpriseSavings = 0;

  // Simulator result
  protected simResult: { saved: number; spent: number; earned: number; stars: number } | null = null;

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  protected scenarios: ChoiceScenario[] = [
    {
      id: 'candy', emoji: '🍬', title: 'Candy at the Checkout',
      description: 'You are at the store and see candy right by the register. It costs $2.',
      presentChoice: 'Buy the candy! It looks so good right now!',
      futureChoice: 'Skip it. Save that $2 for something bigger later!',
      presentOutcome: 'You ate the candy in 30 seconds. Now it is gone and you have $2 less.',
      futureOutcome: 'You skipped the candy. That $2 stays in your pocket for something more meaningful!',
      correctIsFuture: true,
    },
    {
      id: 'toy', emoji: '🧸', title: 'The New Toy',
      description: 'A friend just got a cool new toy. You really want one too. It costs $8.',
      presentChoice: 'Buy it now! Everyone has one and you do not want to be left out!',
      futureChoice: 'Wait and think. Do you really want it, or is it just FOMO?',
      presentOutcome: 'You bought the toy. After a week, you barely play with it. Money gone.',
      futureOutcome: 'You waited a week. Now you realize you did not really want it. You saved $8!',
      correctIsFuture: true,
    },
    {
      id: 'game', emoji: '🎮', title: 'Game or Goal?',
      description: 'A new mobile game costs $5. You are also saving for a $50 Lego set.',
      presentChoice: 'Buy the game! It looks super fun to play right now!',
      futureChoice: 'Skip the game. Every $5 gets you closer to that Lego set!',
      presentOutcome: 'The game was fun for a few days. Now you are $5 further from your Lego goal.',
      futureOutcome: 'Every time you skip a small purchase, your Lego goal gets closer. Keep going!',
      correctIsFuture: true,
    },
  ];

  protected surprises = [
    { emoji: '🚲', title: 'Bike Tire Popped!', description: 'Your bike tire has a hole and needs to be fixed.', cost: 15 },
    { emoji: '📚', title: 'School Project Supplies', description: 'You need to buy materials for a big school project.', cost: 10 },
    { emoji: '🎂', title: 'Friend Birthday Party', description: 'Your best friend is having a birthday party and you want to get them a gift.', cost: 12 },
  ];

  get bikeProgressPct(): number {
    return Math.min(100, (this.bikeSaved / 100) * 100);
  }

  get currentScenario(): ChoiceScenario {
    return this.scenarios[this.scenarioIndex];
  }

  get surpriseEvent(): { emoji: string; title: string; description: string; cost: number } {
    return this.surprises[this.surpriseIndex % this.surprises.length];
  }

  get waitingStarLevel(): number {
    const r = this.simResult;
    const simStars = r?.stars ?? 0;
    const total = simStars + this.waitingChoices + (this.bikeSaved >= 100 ? 2 : this.bikeSaved >= 50 ? 1 : 0);
    if (total >= 12) return 5;
    if (total >= 9) return 4;
    if (total >= 6) return 3;
    if (total >= 3) return 2;
    return 1;
  }

  get waitingTitle(): string {
    const lvl = this.waitingStarLevel;
    if (lvl === 5) return 'Waiting Master';
    if (lvl === 4) return 'Future Thinker';
    if (lvl === 3) return 'Patient Planner';
    if (lvl === 2) return 'Beginner Waiter';
    return 'Just Started';
  }

  get personalityEmoji(): string {
    const lvl = this.waitingStarLevel;
    if (lvl >= 5) return '🏆';
    if (lvl >= 4) return '🧠';
    if (lvl >= 2) return '⚖️';
    return '🚀';
  }

  get personalityName(): string {
    const lvl = this.waitingStarLevel;
    if (lvl >= 5) return 'Goal Crusher';
    if (lvl >= 4) return 'Future Planner';
    if (lvl >= 2) return 'Balanced Thinker';
    return 'Instant Explorer';
  }

  get personalityDescription(): string {
    const lvl = this.waitingStarLevel;
    if (lvl >= 5) return 'You are a Goal Crusher! You stay focused on what matters and can resist small temptations to achieve big things. This superpower will help you in school, sports, and life!';
    if (lvl >= 4) return 'You are a Future Planner! You often think ahead and make choices that help you tomorrow. Keep practicing and you will become a Waiting Master!';
    if (lvl >= 2) return 'You are a Balanced Thinker! Sometimes you wait, sometimes you act now. That is totally okay — the key is thinking before you decide.';
    return 'You are an Instant Explorer! You enjoy fun right away, and that is okay. Try waiting a little longer next time — the reward might surprise you!';
  }

  get personalityMessage(): string {
    const lvl = this.waitingStarLevel;
    if (lvl >= 4) return 'You are becoming a master of waiting! Your future self is grateful for your smart choices today!';
    if (lvl >= 2) return 'Great job thinking through your choices! Every time you practice waiting, your superpower grows stronger!';
    return 'Good effort! Remember: waiting can unlock bigger and better things. Keep practicing!';
  }

  get finalScore(): number {
    const r = this.simResult;
    if (!r) return 100;
    return r.earned + (this.waitingStarLevel * 10);
  }

  protected goTo(phase: Phase): void {
    this.phase = phase;
    this.audio.playClick();
  }

  protected piggySpend(): void {
    this.piggySaved = false;
    this.piggyStarted = true;
    this.piggyWeek = 5;
    this.audio.playClick();
  }

  protected piggySave(): void {
    this.piggySaved = true;
    this.piggyStarted = true;
    this.piggyWeek = 1;
    this.waitingChoices++;
    this.audio.playCoin();
  }

  protected advancePiggyWeek(): void {
    this.piggyWeek++;
    this.audio.playClick();
  }

  protected bikeSave(): void {
    this.bikeWallet += 10;
    this.bikeSaved += 10;
    this.bikeWeek++;
    this.waitingChoices++;
    this.audio.playCoin();
    if (this.bikeWeek >= 10 || this.bikeSaved >= 100) {
      this.audio.playSuccess();
    }
  }

  protected bikeSpend(): void {
    this.bikeWallet += 10;
    this.bikeSpentTotal += 10;
    this.bikeWeek++;
    this.audio.playClick();
    if (this.bikeWeek >= 10 || this.bikeSaved >= 100) {
      this.audio.playSuccess();
    }
  }

  protected confirmBicycle(): void {
    this.goTo('choices');
  }

  protected pickScenario(choseFuture: boolean): void {
    if (this.scenarioChosen) return;
    this.scenarioChosen = true;
    this.scenarioChoseFuture = choseFuture;
    this.scenarioCorrect = choseFuture === this.currentScenario.correctIsFuture;
    if (choseFuture) this.waitingChoices++;
    if (this.scenarioCorrect) this.audio.playSuccess();
    else this.audio.playIncorrect();
  }

  protected nextScenario(): void {
    this.scenarioChosen = false;
    this.scenarioIndex++;
  }

  protected nextSurprise(): void {
    this.surpriseIndex++;
    this.audio.playClick();
  }

  protected onSimulatorDone(): void {
    this.audio.playSuccess();
    this.goTo('personality');
  }

  protected finishLesson(): void {
    const r = this.simResult;
    const sc = r ? r.earned + (this.waitingStarLevel * 10) : 100;
    this.profile.addScore(sc);
    this.profile.addXp(100);
    this.profile.addBadge('Time Traveler');
    this.profile.completeLesson('wait-or-buy-now');
    this.audio.playBadge();
    this.phase = 'complete';
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
