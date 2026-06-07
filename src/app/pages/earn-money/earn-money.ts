import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { EarnCapstoneComponent } from './earn-capstone';

interface Problem {
  emoji: string;
  problem: string;
  solution: string;
  correctHelp: string;
}

interface MapJob {
  id: string;
  emoji: string;
  name: string;
  effort: string;
  pay: number;
  desc: string;
}

interface Business {
  id: string;
  name: string;
  emoji: string;
  baseCustomers: number;
}

interface BizChoice {
  label: string;
  effect: string;
}

type Phase =
  | 'intro' | 'map' | 'effort' | 'business'
  | 'choices' | 'capstone' | 'personality' | 'complete';

@Component({
  selector: 'app-earn-money',
  standalone: true,
  imports: [MoneyMikeComponent, LessonCompleteComponent, EarnCapstoneComponent],
  template: `
    <div class="page-container">
      @if (phase === 'intro') {
        <div class="intro animate-slide-up">
          <app-money-mike message="Money does not just appear — it comes from helping people and solving problems!" mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <div class="big-idea">
              <span class="bi-emoji">💡</span>
              <p><strong>Money Comes From Helping People.</strong> People earn money when they solve problems or help others.</p>
            </div>
          </div>

          <div class="problem-solver">
            <h2>🧩 Job = Problem Solver</h2>
            <p>Each character has a problem. How can Money Mike help?</p>

            @if (problemIndex < problems.length) {
              <div class="problem-card">
                <span class="pc-problem">{{ currentProblem.emoji }} {{ currentProblem.problem }}</span>
                <div class="pc-choices">
                  <button class="pc-choice" (click)="answerProblem(0)">
                    {{ currentProblem.correctHelp }}
                  </button>
                  <button class="pc-choice wrong" (click)="answerProblem(1)">
                    {{ currentProblem.solution }}
                  </button>
                </div>
                @if (problemAnswered) {
                  <div class="pc-feedback" [class.good]="problemCorrect">
                    {{ problemCorrect ? '✅ Correct! Money Mike earns by solving their problem!' : '❌ Not quite! Think about what they actually need help with.' }}
                  </div>
                }
                @if (problemAnswered) {
                  <button class="btn-secondary" (click)="nextProblem()">
                    {{ problemIndex >= problems.length - 1 ? 'Done' : 'Next ➡️' }}
                  </button>
                }
              </div>
            } @else {
              <div class="problem-done">
                <p>🎉 Great! You understand that earning money is about helping and solving problems!</p>
                <button class="btn-primary" (click)="goTo('map')">🗺️ Explore the Neighborhood!</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'map') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Welcome to the neighborhood! Pick 3 jobs to earn $20!" mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">1 / 5</span>
            <h2>🗺️ Neighborhood Map</h2>
          </div>

          <div class="map-earned">Earned: {{ '$' + mapTotal }}</div>

          <div class="map-grid">
            @for (job of mapJobs; track job.id) {
              <button class="map-job" [class.picked]="mapPicked.includes(job.id)"
                      [class.disabled]="mapPicked.length >= 3 && !mapPicked.includes(job.id)"
                      (click)="pickMapJob(job)"
                      [disabled]="mapPicked.length >= 3 && !mapPicked.includes(job.id)">
                <span class="mj-emoji">{{ job.emoji }}</span>
                <span class="mj-name">{{ job.name }}</span>
                <span class="mj-pay">{{ '$' + job.pay }}</span>
                <span class="mj-effort">{{ job.effort }}</span>
                <span class="mj-desc">{{ job.desc }}</span>
              </button>
            }
          </div>

          @if (mapPicked.length === 3) {
            <div class="map-result">
              <p>You chose: {{ pickedJobNames }}</p>
              <p>You earned <strong>{{ '$' + mapTotal }}</strong>! Easy jobs pay less, harder jobs pay more.</p>
              <button class="btn-primary" (click)="confirmMap()">Continue ➡️</button>
            </div>
          }
        </div>
      }

      @if (phase === 'effort') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="More effort often means more money! Let's climb the earning ladder." mood="thinking" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">2 / 5</span>
            <h2>🪜 Effort vs Reward Ladder</h2>
          </div>

          <div class="ladder-game">
            <p class="lg-intro">Climb the ladder by choosing jobs. The higher you go, the more you earn — but it takes more effort!</p>

            <div class="ladder-visual">
              @for (rung of ladder; track rung.level; let i = $index) {
                <div class="ladder-rung" [class.active]="i <= ladderPosition" [class.current]="i === ladderPosition">
                  <span class="lr-emoji">{{ rung.emoji }}</span>
                  <span class="lr-name">{{ rung.name }}</span>
                  <span class="lr-effort">{{ rung.effortLabel }}</span>
                  <span class="lr-pay">{{ '$' + rung.pay }}</span>
                  <span class="lr-time">{{ rung.time }}</span>
                </div>
              }
            </div>

            @if (ladderPosition < ladder.length - 1) {
              <button class="bk-btn save" (click)="climbLadder()">
                ⏫ Try harder job ({{ '$' + ladder[ladderPosition + 1].pay }})
              </button>
              <button class="bk-btn spend" (click)="takeEasyJob()">
                ⏬ Stick with easy job ({{ '$' + ladder[ladderPosition].pay }})
              </button>
            }

            @if (ladderPosition >= ladder.length - 1 || ladderDone) {
              <div class="ladder-result">
                <p>You earned <strong>{{ '$' + ladderTotal }}</strong> by climbing the ladder!</p>
                <p>{{ ladderLesson }}</p>
                <button class="btn-primary" (click)="confirmLadder()">Continue ➡️</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'business') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Want to be an entrepreneur? Let's start a business!" mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">3 / 5</span>
            <h2>🏪 Entrepreneur Mode</h2>
          </div>

          <div class="biz-game">
            @if (!bizStarted) {
              <p class="biz-intro">Pick a business to start!</p>
              <div class="biz-pick">
                @for (b of businesses; track b.id) {
                  <button class="biz-choice" (click)="pickBusiness(b)">
                    <span class="bzc-emoji">{{ b.emoji }}</span>
                    <span class="bzc-name">{{ b.name }}</span>
                  </button>
                }
              </div>
            }

            @if (bizStarted && !bizDone) {
              <div class="biz-active">
                <div class="biz-header">
                  <span class="bizh-emoji">{{ currentBiz?.emoji }}</span>
                  <h3>{{ currentBiz?.name }}</h3>
                </div>

                <div class="biz-question">
                  <p>What price per item?</p>
                  <div class="biz-slider-row">
                    <button class="adj-btn" (click)="adjustBizPrice(-0.5)">−</button>
                    <span class="biz-price-val">{{ '$' + bizPrice.toFixed(1) }}</span>
                    <button class="adj-btn" (click)="adjustBizPrice(0.5)">+</button>
                  </div>
                </div>

                <div class="biz-question">
                  <p>How much effort?</p>
                  <div class="biz-slider-row">
                    <button class="adj-btn" (click)="adjustBizEffort(-1)">−</button>
                    <span class="biz-price-val">{{ bizEffortLabel }}</span>
                    <button class="adj-btn" (click)="adjustBizEffort(1)">+</button>
                  </div>
                </div>

                <button class="btn-primary" (click)="runBusiness()">🚀 Run My Business!</button>
              </div>
            }

            @if (bizDone) {
              <div class="biz-result">
                <div class="biz-r-header">
                  <span class="bizh-emoji">{{ currentBiz?.emoji }}</span>
                  <h3>{{ currentBiz?.name }} — Results!</h3>
                </div>
                <div class="biz-metrics">
                  <div class="biz-metric"><span>Price</span><span>{{ '$' + bizPrice.toFixed(1) }}</span></div>
                  <div class="biz-metric"><span>Customers</span><span>{{ bizCustomers }}</span></div>
                  <div class="biz-metric"><span>Total Revenue</span><span>{{ '$' + bizRevenue }}</span></div>
                  <div class="biz-metric"><span>Customer Rating</span><span>{{ bizRating }}/5 ⭐</span></div>
                </div>
                <p class="biz-lesson">{{ bizLesson }}</p>
                <button class="btn-primary" (click)="confirmBusiness()">Continue ➡️</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'choices') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="You have limited time! Choose your jobs wisely!" mood="thinking" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">4 / 5</span>
            <h2>⏰ Opportunity Choice</h2>
          </div>

          <div class="opp-game">
            <p class="opp-intro">You have <strong>1 hour</strong>. Which job do you take?</p>

            @if (oppIndex < opportunities.length) {
              <div class="opp-card">
                <span class="opp-emoji">{{ currentOpp.emoji }}</span>
                <h3>{{ currentOpp.title }}</h3>
                <p>{{ currentOpp.desc }}</p>
                <div class="opp-choices">
                  @for (c of currentOpp.choices; track $index) {
                    <button class="opp-btn" (click)="pickOpp($index)">
                      <span>{{ c.emoji }}</span>
                      <span>{{ c.label }}</span>
                      <span>{{ '$' + c.amount }}</span>
                    </button>
                  }
                </div>
                @if (oppChosen) {
                  <div class="opp-feedback">{{ currentOpp.feedback }}</div>
                }
                @if (oppChosen) {
                  <button class="btn-secondary" (click)="nextOpp()">
                    {{ oppIndex >= opportunities.length - 1 ? 'Done' : 'Next ➡️' }}
                  </button>
                }
              </div>
            } @else {
              <div class="opp-done">
                <p>You earned <strong>{{ '$' + oppTotal }}</strong> by choosing your opportunities wisely!</p>
                <button class="btn-primary" (click)="goTo('capstone')">🚀 Start Capstone Challenge!</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'capstone') {
        <div class="phase-container">
          <app-money-mike message="Now for the big challenge! Earn your dream goal in 10 days!" mood="happy" size="small">
          </app-money-mike>
          <div class="phase-header">
            <span class="ph-number">5 / 5</span>
            <h2>🎯 Earn Your Dream Goal</h2>
          </div>
          <app-earn-capstone (done)="onCapstoneDone()" (result)="capResult = $event"></app-earn-capstone>
        </div>
      }

      @if (phase === 'personality') {
        <div class="personality-page animate-slide-up">
          <app-money-mike [message]="personalityMessage" mood="celebrate" size="small"></app-money-mike>

          <div class="personality-card">
            <span class="pc-emoji">{{ personalityEmoji }}</span>
            <h2>{{ personalityName }}</h2>
            <p>{{ personalityDescription }}</p>
          </div>

          <div class="personality-stats">
            <h3>📊 Your Earning Results</h3>
            @if (capResult) {
              <div class="pstat-row"><span>Total Earned</span><span>{{ '$' + capResult.earned }}</span></div>
              <div class="pstat-row"><span>Saved for Goal</span><span>{{ '$' + capResult.saved }}</span></div>
              <div class="pstat-row"><span>Jobs Completed</span><span>{{ capResult.totalJobs }}</span></div>
              <div class="pstat-row"><span>Hard Jobs Chosen</span><span>{{ capResult.highEffortJobs }}</span></div>
              <div class="pstat-row"><span>Goal Reached?</span><span>{{ capResult.reachedGoal ? '🎉 Yes' : '💪 Close!' }}</span></div>
            }
          </div>

          <div class="real-world card">
            <h3>🌍 Real-World Connection</h3>
            <p>All jobs — from doctor to teacher to engineer — solve problems and help people.</p>
            <p>What problems would YOU like to solve when you grow up?</p>
          </div>

          <div class="final-lesson card">
            <h3>📖 What You Learned</h3>
            <p>✅ Money comes from helping people and solving problems</p>
            <p>✅ More effort often means more reward</p>
            <p>✅ Being an entrepreneur means creating value for others</p>
            <p>✅ Skills and quality work lead to more opportunities</p>
            <p>✅ Earning is the first step — what you do next matters too</p>
          </div>

          <button class="btn-primary" (click)="finishLesson()">🎉 Complete Lesson</button>
        </div>
      }
    </div>

    @if (phase === 'complete') {
      <app-lesson-complete lessonTitle="Earn Money"
        [message]="'Incredible! You learned that money comes from helping people and solving problems. You earned the Earn Star badge!'"
        [xpEarned]="100" [score]="finalScore"
        badge="Earn Star" badgeEmoji="⭐"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro { padding: 10px 0; }
    .lesson-content { margin-bottom: 16px; text-align: left; }
    .lesson-content h2 { font-family: 'Fredoka', sans-serif; font-size: 21px; margin-bottom: 8px; }
    .lesson-content > p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 10px; }
    .big-idea { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-radius: 16px; padding: 16px; }
    .bi-emoji { font-size: 32px; }
    .big-idea p { font-family: 'Nunito', sans-serif; font-size: 16px; line-height: 1.5; margin: 0; }
    .problem-solver { margin: 16px 0; }
    .problem-solver h2 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin-bottom: 4px; }
    .problem-solver > p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; margin-bottom: 12px; }
    .problem-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; }
    .pc-problem { font-family: 'Fredoka', sans-serif; font-size: 20px; display: block; margin-bottom: 16px; }
    .pc-choices { display: flex; flex-direction: column; gap: 8px; }
    .pc-choice { padding: 12px 16px; border-radius: 12px; border: 3px solid #4CAF50; background: #E8F5E9; cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    .pc-choice.wrong { border-color: #E0E0E0; background: white; }
    .pc-choice:hover { transform: translateY(-2px); }
    .pc-feedback { margin-top: 12px; padding: 10px; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; }
    .pc-feedback.good { background: #E8F5E9; }
    .pc-feedback:not(.good) { background: #FFF3E0; }
    .problem-done { text-align: center; }
    .phase-nav { text-align: center; padding: 20px 0; }
    .phase-container { padding: 10px 0; }
    .phase-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .ph-number { background: #FFD54F; border-radius: 20px; padding: 4px 14px; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; color: #5D4037; }
    .phase-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 0; }

    .map-earned { text-align: center; font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #FF6F00; margin-bottom: 12px; }
    .map-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .map-job { background: white; border: 3px solid #E0E0E0; border-radius: 16px; padding: 14px; cursor: pointer; text-align: center; transition: all 0.2s; }
    .map-job:hover:not(:disabled) { border-color: #FFD54F; transform: translateY(-2px); }
    .map-job.picked { border-color: #4CAF50; background: #F1F8E9; }
    .map-job.disabled { opacity: 0.4; cursor: not-allowed; }
    .mj-emoji { font-size: 32px; display: block; }
    .mj-name { font-family: 'Fredoka', sans-serif; font-size: 14px; display: block; }
    .mj-pay { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #FF6F00; display: block; }
    .mj-effort { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; display: block; text-transform: capitalize; }
    .mj-desc { font-family: 'Nunito', sans-serif; font-size: 11px; color: #aaa; display: block; margin-top: 2px; }
    .map-result { text-align: center; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.6; }

    .ladder-game { max-width: 480px; margin: 0 auto; }
    .lg-intro { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; margin-bottom: 16px; }
    .ladder-visual { margin-bottom: 16px; }
    .ladder-rung { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; margin-bottom: 6px; background: #F5F5F5; transition: all 0.3s; }
    .ladder-rung.active { background: #E8F5E9; }
    .ladder-rung.current { background: #FFF8E1; border: 2px solid #FFD54F; transform: scale(1.02); }
    .lr-emoji { font-size: 24px; }
    .lr-name { font-family: 'Fredoka', sans-serif; font-size: 14px; flex: 1; }
    .lr-effort { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; }
    .lr-pay { font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #FF6F00; min-width: 30px; text-align: right; }
    .lr-time { font-family: 'Nunito', sans-serif; font-size: 11px; color: #aaa; min-width: 50px; text-align: right; }
    .bk-btn { display: block; width: 100%; padding: 12px; border-radius: 50px; font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700; border: none; cursor: pointer; margin-bottom: 8px; transition: all 0.2s; }
    .bk-btn.save { background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; }
    .bk-btn.spend { background: linear-gradient(135deg, #2196F3, #42A5F5); color: white; }
    .bk-btn:hover { transform: translateY(-2px); }
    .ladder-result { text-align: center; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.6; }

    .biz-game { max-width: 480px; margin: 0 auto; }
    .biz-intro { text-align: center; font-family: 'Nunito', sans-serif; font-size: 15px; margin-bottom: 12px; }
    .biz-pick { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .biz-choice { padding: 16px 20px; border-radius: 16px; border: 3px solid #E0E0E0; background: white; cursor: pointer; text-align: center; transition: all 0.2s; min-width: 100px; }
    .biz-choice:hover { border-color: #FFD54F; transform: translateY(-2px); }
    .bzc-emoji { font-size: 32px; display: block; }
    .bzc-name { font-family: 'Fredoka', sans-serif; font-size: 14px; display: block; margin-top: 4px; }
    .biz-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .bizh-emoji { font-size: 36px; }
    .biz-header h3 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin: 0; }
    .biz-question { margin-bottom: 16px; text-align: center; }
    .biz-question p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin-bottom: 8px; }
    .biz-slider-row { display: flex; align-items: center; gap: 12px; justify-content: center; }
    .adj-btn { width: 40px; height: 40px; border-radius: 50%; border: none; font-size: 20px; font-weight: 700; cursor: pointer; background: #FFF3E0; color: #E65100; }
    .biz-price-val { font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: #333; min-width: 70px; text-align: center; }
    .biz-result { text-align: center; }
    .biz-metrics { background: white; border-radius: 14px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin: 12px 0; }
    .biz-metric { display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; padding: 6px 0; border-bottom: 1px solid #F0F0F0; }
    .biz-metric:last-child { border-bottom: none; }
    .biz-lesson { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; font-style: italic; }

    .opp-game { max-width: 480px; margin: 0 auto; }
    .opp-intro { text-align: center; font-family: 'Nunito', sans-serif; font-size: 15px; margin-bottom: 16px; }
    .opp-card { background: white; border-radius: 24px; padding: 24px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .opp-emoji { font-size: 48px; display: block; }
    .opp-card h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 4px 0; }
    .opp-card > p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; margin: 6px 0 16px; }
    .opp-choices { display: flex; flex-direction: column; gap: 8px; }
    .opp-btn { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; border: 2px solid #E0E0E0; background: white; cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    .opp-btn:hover { border-color: #FFD54F; }
    .opp-btn span:last-child { margin-left: auto; color: #FF6F00; }
    .opp-btn span:first-child { font-size: 22px; }
    .opp-feedback { margin-top: 12px; padding: 10px 14px; border-radius: 10px; background: #E8F5E9; font-family: 'Nunito', sans-serif; font-size: 14px; }
    .opp-done { text-align: center; font-family: 'Nunito', sans-serif; font-size: 15px; }

    .personality-page { padding: 10px 0; text-align: center; }
    .personality-card { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-radius: 24px; padding: 28px; margin: 16px 0; }
    .pc-emoji { font-size: 64px; display: block; margin-bottom: 8px; }
    .personality-card h2 { font-family: 'Fredoka', sans-serif; font-size: 28px; color: #E65100; margin: 0; }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin: 8px 0 0; }
    .personality-stats { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin: 16px 0; text-align: left; }
    .personality-stats h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 10px; }
    .pstat-row { display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; padding: 6px 0; border-bottom: 1px solid #F0F0F0; }
    .pstat-row:last-child { border-bottom: none; }
    .real-world { text-align: left; }
    .real-world h3 { margin-bottom: 8px; }
    .real-world p { font-size: 14px; margin-bottom: 6px; }
    .final-lesson { text-align: left; }
    .final-lesson h3 { margin-bottom: 8px; }
    .final-lesson p { font-size: 14px; margin-bottom: 6px; padding-left: 4px; }
    @media (max-width: 480px) {
      .map-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class EarnMoneyComponent {
  protected phase: Phase = 'intro';

  // Problem solver state
  protected problemIndex = 0;
  protected problemAnswered = false;
  protected problemCorrect = false;

  // Map state
  protected mapPicked: string[] = [];
  protected mapTotal = 0;

  // Ladder state
  protected ladderPosition = 0;
  protected ladderTotal = 0;
  protected ladderDone = false;

  // Business state
  protected bizStarted = false;
  protected bizDone = false;
  protected currentBiz: Business | null = null;
  protected bizPrice = 2;
  protected bizEffort = 2;
  protected bizCustomers = 0;
  protected bizRevenue = 0;
  protected bizRating = 3;

  // Opportunity state
  protected oppIndex = 0;
  protected oppChosen = false;
  protected oppTotal = 0;

  // Capstone result
  protected capResult: {
    saved: number; spent: number; earned: number;
    totalJobs: number; highEffortJobs: number;
    reachedGoal: boolean; goalCost: number;
  } | null = null;

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  protected problems: Problem[] = [
    { emoji: '🐶', problem: 'Dog is lonely and needs a walk', solution: 'Buy the dog a new toy', correctHelp: 'Walk the dog and play with it' },
    { emoji: '🌿', problem: 'Yard is messy with leaves everywhere', solution: 'Wait for the wind to blow them away', correctHelp: 'Rake the leaves and clean the yard' },
    { emoji: '🧺', problem: 'Laundry is piled up and needs sorting', solution: 'Leave it for tomorrow', correctHelp: 'Fold and organize the laundry' },
    { emoji: '📚', problem: 'Younger kid needs help with math homework', solution: 'Do the homework for them', correctHelp: 'Tutor them and explain the answers' },
    { emoji: '🍋', problem: 'Neighbors are hot and want something cold', solution: 'Tell them to turn on the AC', correctHelp: 'Set up a lemonade stand and sell them cups' },
  ];

  protected mapJobs: MapJob[] = [
    { id: 'dog', emoji: '🐕', name: 'Walk Dog', effort: 'easy', pay: 5, desc: '15 min walk' },
    { id: 'yard', emoji: '🌿', name: 'Rake Leaves', effort: 'medium', pay: 8, desc: '30 min work' },
    { id: 'car', emoji: '🧽', name: 'Wash Car', effort: 'medium', pay: 10, desc: '45 min wash' },
    { id: 'bake', emoji: '🍪', name: 'Bake Sale', effort: 'hard', pay: 12, desc: '1 hour bake' },
    { id: 'lemonade', emoji: '🍋', name: 'Lemonade Stand', effort: 'hard', pay: 15, desc: '2 hours' },
    { id: 'tutor', emoji: '📚', name: 'Tutoring', effort: 'hard', pay: 12, desc: '1 hour help' },
  ];

  protected ladder = [
    { level: 1, name: 'Pick Up Toys', emoji: '🧸', effortLabel: 'Very Easy', pay: 2, time: '5 min' },
    { level: 2, name: 'Walk Dog', emoji: '🐕', effortLabel: 'Easy', pay: 5, time: '15 min' },
    { level: 3, name: 'Wash Car', emoji: '🧽', effortLabel: 'Medium', pay: 8, time: '30 min' },
    { level: 4, name: 'Mow Lawn', emoji: '🌿', effortLabel: 'Hard', pay: 10, time: '45 min' },
    { level: 5, name: 'Lemonade Stand', emoji: '🍋', effortLabel: 'Very Hard', pay: 15, time: '2 hours' },
  ];

  protected businesses: Business[] = [
    { id: 'lemonade', name: 'Lemonade Stand', emoji: '🍋', baseCustomers: 15 },
    { id: 'dogwalk', name: 'Dog Walking', emoji: '🐕', baseCustomers: 8 },
    { id: 'carwash', name: 'Car Wash', emoji: '🧽', baseCustomers: 6 },
    { id: 'bake', name: 'Bake Sale', emoji: '🍪', baseCustomers: 20 },
  ];

  protected bizEffortLabels = ['Minimal', 'Light', 'Moderate', 'High', 'Very High'];

  protected opportunities = [
    {
      emoji: '💵', title: 'Quick Cash or Big Project?',
      desc: 'You have 1 hour to earn money. What do you choose?',
      choices: [
        { emoji: '🐕', label: 'Walk a neighbor\'s dog (easy, quick)', amount: 5 },
        { emoji: '🌿', label: 'Clean a yard (harder, more pay)', amount: 12 },
        { emoji: '🤝', label: 'Help elderly neighbor for free', amount: 0 },
      ],
      feedback: 'Every choice has a tradeoff! Quick jobs earn less but take less time. Harder jobs pay more. Helping for free builds a good reputation!',
    },
    {
      emoji: '🚨', title: 'Emergency! Need $15 Fast!',
      desc: 'Money Mike needs $15 for a school trip. He has 2 hours. What should he do?',
      choices: [
        { emoji: '🙏', label: 'Ask parents for the money', amount: 0 },
        { emoji: '🍋', label: 'Run a lemonade stand (2 hours)', amount: 15 },
        { emoji: '🧹', label: 'Do neighbor chores (1 hour)', amount: 8 },
      ],
      feedback: 'Earning is better than just asking! When you earn, you learn skills AND get money. Plus, it feels great to earn it yourself!',
    },
    {
      emoji: '📋', title: 'Build Your Reputation',
      desc: 'A neighbor offers you a job. If you do well, more jobs will come!',
      choices: [
        { emoji: '⭐', label: 'Do an excellent job (extra effort)', amount: 10 },
        { emoji: '⚡', label: 'Do a quick passable job', amount: 6 },
        { emoji: '📢', label: 'Refer a friend instead', amount: 3 },
      ],
      feedback: 'Doing excellent work means more opportunities later! People remember good service and will recommend you to others.',
    },
  ];

  get currentProblem(): Problem {
    return this.problems[this.problemIndex];
  }

  get currentOpp(): typeof this.opportunities[0] {
    return this.opportunities[this.oppIndex];
  }

  get pickedJobNames(): string {
    return this.mapPicked.map((id) => this.mapJobs.find((j) => j.id === id)?.name).join(', ');
  }

  get bizEffortLabel(): string {
    return this.bizEffortLabels[this.bizEffort - 1] || 'Moderate';
  }

  get ladderLesson(): string {
    if (this.ladderPosition >= 4) return 'You climbed to the top! Hard work really pays off — you earned more by taking on bigger challenges!';
    if (this.ladderTotal > 20) return 'You did a mix of easy and hard jobs. Finding the right balance is smart!';
    return 'You chose easier jobs. They pay less, but that is okay — everyone starts somewhere!';
  }

  get personalityEmoji(): string {
    const r = this.capResult;
    if (!r) return '🌟';
    if (r.highEffortJobs >= 4) return '💪';
    if (r.totalJobs >= 7) return '📋';
    if (r.reachedGoal) return '🏆';
    return '🧠';
  }

  get personalityName(): string {
    const r = this.capResult;
    if (!r) return 'Hard Worker';
    if (r.highEffortJobs >= 4) return 'Hustler Helper';
    if (r.totalJobs >= 7) return 'Steady Earner';
    if (r.reachedGoal) return 'Goal Crusher';
    return 'Explorer Entrepreneur';
  }

  get personalityDescription(): string {
    const r = this.capResult;
    if (!r) return 'You are learning that earning takes effort and consistency. Keep going!';
    if (r.highEffortJobs >= 4) return 'You are a Hustler Helper! You look for opportunities and are not afraid of hard work. You know that bigger effort brings bigger rewards.';
    if (r.totalJobs >= 7) return 'You are a Steady Earner! You consistently complete tasks and keep at it. Reliability is one of the most valuable skills!';
    if (r.reachedGoal) return 'You are a Goal Crusher! You set a goal and earned your way there. This determination will help you achieve anything!';
    return 'You are an Explorer Entrepreneur! You try different ways to earn and are not afraid to experiment. Creativity is a superpower!';
  }

  get personalityMessage(): string {
    return 'Here is your earning personality! Based on how you chose to earn money during your journey.';
  }

  get finalScore(): number {
    const r = this.capResult;
    if (!r) return 100;
    return r.earned + (r.highEffortJobs * 5);
  }

  protected goTo(phase: Phase): void {
    this.phase = phase;
    this.audio.playClick();
  }

  protected answerProblem(choice: number): void {
    if (this.problemAnswered) return;
    this.problemAnswered = true;
    this.problemCorrect = choice === 0;
    if (this.problemCorrect) this.audio.playSuccess();
    else this.audio.playIncorrect();
  }

  protected nextProblem(): void {
    this.problemAnswered = false;
    this.problemIndex++;
  }

  protected pickMapJob(job: MapJob): void {
    if (this.mapPicked.includes(job.id)) return;
    if (this.mapPicked.length >= 3) return;
    this.mapPicked.push(job.id);
    this.mapTotal += job.pay;
    this.audio.playCoin();
  }

  protected confirmMap(): void {
    this.audio.playSuccess();
    this.goTo('effort');
  }

  protected climbLadder(): void {
    this.ladderPosition++;
    this.ladderTotal += this.ladder[this.ladderPosition].pay;
    this.audio.playCoin();
    if (this.ladderPosition >= this.ladder.length - 1) {
      this.ladderDone = true;
    }
  }

  protected takeEasyJob(): void {
    this.ladderTotal += this.ladder[this.ladderPosition].pay;
    this.ladderDone = true;
    this.audio.playClick();
  }

  protected confirmLadder(): void {
    this.audio.playSuccess();
    this.goTo('business');
  }

  protected pickBusiness(b: Business): void {
    this.currentBiz = b;
    this.bizStarted = true;
    this.audio.playClick();
  }

  protected adjustBizPrice(delta: number): void {
    this.bizPrice = Math.max(0.5, Math.min(10, this.bizPrice + delta));
  }

  protected adjustBizEffort(delta: number): void {
    this.bizEffort = Math.max(1, Math.min(5, this.bizEffort + delta));
  }

  protected runBusiness(): void {
    if (!this.currentBiz) return;
    const cust = this.currentBiz.baseCustomers + (this.bizEffort * 3) - Math.round(this.bizPrice * 2);
    this.bizCustomers = Math.max(2, cust);
    this.bizRevenue = Math.round(this.bizCustomers * this.bizPrice);
    this.bizRating = Math.min(5, Math.max(1, Math.round((this.bizEffort / 5) * 3 + (this.bizPrice <= 3 ? 2 : this.bizPrice <= 5 ? 1 : 0))));
    this.bizDone = true;
    this.audio.playSuccess();
  }

  get bizLesson(): string {
    if (this.bizRevenue >= 50) return 'Amazing! Your business did great! Good prices and high effort brought lots of customers and revenue!';
    if (this.bizRevenue >= 25) return 'Solid start! Your business earned decent money. Try adjusting your price or effort to earn more.';
    return 'Tough start! Low price or low effort means fewer customers. Raising quality can boost your earnings!';
  }

  protected confirmBusiness(): void {
    this.audio.playSuccess();
    this.goTo('choices');
  }

  protected pickOpp(choice: number): void {
    if (this.oppChosen) return;
    this.oppChosen = true;
    this.oppTotal += this.opportunities[this.oppIndex].choices[choice].amount;
    this.audio.playClick();
  }

  protected nextOpp(): void {
    this.oppChosen = false;
    this.oppIndex++;
  }

  protected onCapstoneDone(): void {
    this.audio.playSuccess();
    this.goTo('personality');
  }

  protected finishLesson(): void {
    const r = this.capResult;
    const sc = r ? r.earned + (r.highEffortJobs * 5) : 100;
    this.profile.addScore(sc);
    this.profile.addXp(100);
    this.profile.addBadge('Earn Star');
    this.profile.completeLesson('earn-money');
    this.audio.playBadge();
    this.phase = 'complete';
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
