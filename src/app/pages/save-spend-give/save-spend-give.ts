import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MoneyMikeComponent } from '../../components/money-mike/money-mike';
import { LessonCompleteComponent } from '../../components/lesson-complete/lesson-complete';
import { FinancialProfileService } from '../../services/financial-profile.service';
import { AudioService } from '../../services/audio.service';
import { DreamGoalComponent } from './dream-goal';
import { TenWeekAdventureComponent } from './ten-week-adventure';

interface LifeScenario {
  title: string;
  description: string;
  emoji: string;
  choices: { label: string; emoji: string; effect: 'spend' | 'save' | 'give'; amount: number; feedback: string }[];
}

interface ThreeJarsSlot {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

type Phase =
  | 'intro' | 'jars' | 'birthday' | 'future'
  | 'giving' | 'goal' | 'life-events' | 'adventure'
  | 'personality' | 'complete';

@Component({
  selector: 'app-save-spend-give',
  standalone: true,
  imports: [
    MoneyMikeComponent,
    LessonCompleteComponent,
    DreamGoalComponent,
    TenWeekAdventureComponent,
  ],
  template: `
    <div class="page-container">
      @if (phase === 'intro') {
        <div class="intro animate-slide-up">
          <app-money-mike message="Every dollar you earn needs a job! There are three important jobs for your money." mood="happy">
          </app-money-mike>

          <div class="lesson-content card">
            <div class="big-idea">
              <span class="bi-emoji">💡</span>
              <p><strong>Money is like a team of workers.</strong> Every dollar you earn needs a job.</p>
            </div>
          </div>

          <div class="three-jobs">
            <div class="job-card spend"><span class="jc-icon">💵</span><h3>Spend</h3><p>Use now</p></div>
            <div class="job-card save"><span class="jc-icon">🏦</span><h3>Save</h3><p>Use later</p></div>
            <div class="job-card give"><span class="jc-icon">❤️</span><h3>Give</h3><p>Help others</p></div>
          </div>

          <div class="lesson-content card">
            <h2>💵 Spend = Use Now</h2>
            <p>Spending means using your money today to buy things you need or want. That could be lunch, school supplies, or a treat!</p>
          </div>

          <div class="lesson-content card">
            <h2>🏦 Save = Use Later</h2>
            <p>Saving means putting money aside for the future. You might save for a new bicycle, a gift, or even for when you grow up!</p>
          </div>

          <div class="lesson-content card">
            <h2>❤️ Give = Help Others</h2>
            <p>Giving means sharing your money to help other people or causes you care about — like helping a friend, donating to charity, or supporting your community.</p>
          </div>

          <div class="phase-nav"><button class="btn-primary" (click)="goTo('jars')">💰 Let's Sort Money!</button></div>
        </div>
      }

      @if (phase === 'jars') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Money Mike earned $50! Help him put every dollar into one of the three jars." mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">1 / 7</span>
            <h2>🏺 The Three Jars</h2>
          </div>

          <div class="jars-game">
            <div class="jars-track">
              <span class="jt-label">Remaining to allocate: {{ '$' + jarsRemaining }}</span>
              <div class="jt-bar"><div class="jt-fill" [style.width.%]="(1 - jarsRemaining / 50) * 100"></div></div>
            </div>

            <div class="jars-row">
              @for (slot of jars; track slot.id) {
                <div class="jar-card">
                  <div class="jar-visual">
                    <span class="jv-emoji">{{ slot.emoji }}</span>
                    <div class="jar-count">{{ slot.count }}</div>
                    <span class="jv-label">{{ slot.label }}</span>
                    <span class="jv-total">{{ '$' + (slot.count * 10) }}</span>
                  </div>
                  <div class="jar-buttons">
                    <button class="jar-btn" (click)="addToJar(slot.id)" [disabled]="jarsRemaining <= 0">+ $10</button>
                    <button class="jar-btn remove" (click)="removeFromJar(slot.id)" [disabled]="slot.count <= 0">−</button>
                  </div>
                </div>
              }
            </div>

            @if (jarsRemaining <= 0) {
              <div class="jars-result">
                <div class="jr-breakdown">
                  <span>🏦 Save: {{ '$' + (jarsMap['save'].count * 10) }}</span>
                  <span>💵 Spend: {{ '$' + (jarsMap['spend'].count * 10) }}</span>
                  <span>❤️ Give: {{ '$' + (jarsMap['give'].count * 10) }}</span>
                </div>
                <p class="jr-lesson">Every dollar has a job! Now let's see how these choices work in real life.</p>
                <button class="btn-primary" (click)="confirmJars()">✅ Continue</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'birthday') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="It's my birthday! I got $20 as a gift. How should I split it?" mood="happy" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">2 / 7</span>
            <h2>🎂 Birthday Money Challenge</h2>
          </div>

          <div class="birthday-game">
            <div class="birthday-total">{{ '$' + birthdayRemaining }} left to allocate</div>

            <div class="bday-row">
              <span class="bday-lbl">💵 Spend</span>
              <button class="adj-btn" (click)="adjBirthday('spend', -2)">−</button>
              <span class="bday-val">{{ '$' + birthdaySpend }}</span>
              <button class="adj-btn" (click)="adjBirthday('spend', 2)">+</button>
            </div>
            <div class="bday-row">
              <span class="bday-lbl">🏦 Save</span>
              <button class="adj-btn" (click)="adjBirthday('save', -2)">−</button>
              <span class="bday-val">{{ '$' + birthdaySave }}</span>
              <button class="adj-btn" (click)="adjBirthday('save', 2)">+</button>
            </div>
            <div class="bday-row">
              <span class="bday-lbl">❤️ Give</span>
              <button class="adj-btn" (click)="adjBirthday('give', -2)">−</button>
              <span class="bday-val">{{ '$' + birthdayGive }}</span>
              <button class="adj-btn" (click)="adjBirthday('give', 2)">+</button>
            </div>

            @if (birthdayRemaining <= 0) {
              <button class="btn-primary" (click)="confirmBirthday()">✅ Done!</button>
            }
          </div>
        </div>
      }

      @if (phase === 'future') {
        <div class="phase-container animate-slide-up">
          <app-money-mike [message]="futureMikeMessage" [mood]="futureMikeMood" size="small"></app-money-mike>

          <div class="phase-header">
            <span class="ph-number">3 / 7</span>
            <h2>🔮 One Week Later...</h2>
          </div>

          <div class="future-card">
            <span class="fc-emoji">🧸</span>
            <h3>Money Mike sees a toy he really wants!</h3>
            <p class="fc-cost">It costs <strong>$15</strong></p>

            <div class="fc-comparison">
              <div class="fc-side yours">
                <span class="fcs-label">Your savings</span>
                <span class="fcs-amount">{{ '$' + birthdaySave }}</span>
              </div>
              <div class="fc-side needed">
                <span class="fcs-label">Needed</span>
                <span class="fcs-amount">$15</span>
              </div>
            </div>

            <div class="fc-verdict" [class.success]="birthdaySave >= 15" [class.fail]="birthdaySave < 15">
              @if (birthdaySave >= 15) {
                <span>🎉 Great! You saved enough from your birthday money to buy the toy!</span>
              } @else {
                <span>😅 You saved {{ '$' + birthdaySave }} from your birthday. You do not have enough for the toy yet. Saving more earlier would help!</span>
              }
            </div>

            <p class="fc-lesson">
              @if (birthdaySave >= 15) {
                Saving money means you can afford bigger things later!
              } @else {
                If you save more of your money, you can afford bigger things in the future!
              }
            </p>

            <button class="btn-primary" (click)="goTo('giving')">Continue ➡️</button>
          </div>
        </div>
      }

      @if (phase === 'giving') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Money Mike has $10. Let's see what happens when he gives some away!" mood="thinking" size="small">
          </app-money-mike>

          <div class="phase-header">
            <span class="ph-number">4 / 7</span>
            <h2>❤️ Giving Makes a Difference</h2>
          </div>

          <div class="giving-game">
            <p class="giving-intro">Money Mike has <strong>$10</strong>. What should he do?</p>

            <div class="give-choices">
              @for (gc of giveChoices; track gc.id) {
                <button class="give-choice" [class.selected]="selectedGiving === gc.id" (click)="selectGiving(gc.id)">
                  <span class="gce-emoji">{{ gc.emoji }}</span>
                  <span class="gce-label">{{ gc.label }}</span>
                  <span class="gce-cost">{{ gc.cost }}</span>
                </button>
              }
            </div>

            @if (selectedGiving) {
              <div class="giving-impact">
                <span class="gi-emoji">{{ givingImpactEmoji }}</span>
                <p class="gi-text">{{ givingImpactText }}</p>
              </div>
              <div class="giving-result"><p>{{ givingResult }}</p></div>
              <button class="btn-primary" (click)="confirmGiving()">✅ Continue</button>
            }
          </div>
        </div>
      }

      @if (phase === 'goal') {
        <div class="phase-container">
          <app-money-mike message="Let's pick a goal and save up for it! Every week you earn money — choose to save or spend." mood="happy" size="small">
          </app-money-mike>
          <div class="phase-header">
            <span class="ph-number">5 / 7</span>
            <h2>🎯 Goal Saving Game</h2>
          </div>
          <app-dream-goal (done)="onGoalDone()" (savedAmountChange)="goalSaved = $event"></app-dream-goal>
        </div>
      }

      @if (phase === 'life-events') {
        <div class="phase-container animate-slide-up">
          <app-money-mike message="Life keeps giving us choices! What would you do in each situation?" mood="thinking" size="small">
          </app-money-mike>
          <div class="phase-header">
            <span class="ph-number">6 / 7</span>
            <h2>🎲 What Would You Do?</h2>
          </div>

          <div class="life-scenarios">
            @if (lifeScenarioIndex < lifeScenarios.length) {
              <div class="life-card">
                <span class="life-emoji">{{ currentLifeScenario.emoji }}</span>
                <h3>{{ currentLifeScenario.title }}</h3>
                <p>{{ currentLifeScenario.description }}</p>
                <div class="life-choices">
                  @for (choice of currentLifeScenario.choices; track $index) {
                    <button class="life-choice" (click)="pickLifeChoice($index)">
                      <span>{{ choice.emoji }}</span>
                      <span>{{ choice.label }}</span>
                      <span>{{ '$' + choice.amount }}</span>
                    </button>
                  }
                </div>
                @if (lifeChoiceMade) {
                  <div class="life-feedback">{{ currentLifeScenario.choices[lifeChoiceIndex].feedback }}</div>
                }
                @if (lifeChoiceMade) {
                  <button class="btn-secondary" (click)="nextLifeScenario()">
                    {{ lifeScenarioIndex >= lifeScenarios.length - 1 ? 'Done' : 'Next ➡️' }}
                  </button>
                }
              </div>
            } @else {
              <div class="life-done">
                <p>Great thinking! You faced real-life money situations and made thoughtful choices.</p>
                <button class="btn-primary" (click)="goTo('adventure')">🚀 Start the 10-Week Adventure!</button>
              </div>
            }
          </div>
        </div>
      }

      @if (phase === 'adventure') {
        <div class="phase-container">
          <app-money-mike message="Now let's put it all together! A 10-week adventure where every choice matters." mood="happy" size="small">
          </app-money-mike>
          <div class="phase-header">
            <span class="ph-number">7 / 7</span>
            <h2>🗓️ The 10-Week Adventure</h2>
          </div>
          <app-ten-week-adventure (done)="onAdventureDone()" (result)="adventureResult = $event"></app-ten-week-adventure>
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
            <div class="pstat save-stat">
              <span class="ps-label">🏦 Save</span>
              <div class="ps-bar"><div class="ps-fill save" [style.width.%]="personalityStats.save"></div></div>
              <span class="ps-val">{{ personalityStats.save }}%</span>
            </div>
            <div class="pstat spend-stat">
              <span class="ps-label">💵 Spend</span>
              <div class="ps-bar"><div class="ps-fill spend" [style.width.%]="personalityStats.spend"></div></div>
              <span class="ps-val">{{ personalityStats.spend }}%</span>
            </div>
            <div class="pstat give-stat">
              <span class="ps-label">❤️ Give</span>
              <div class="ps-bar"><div class="ps-fill give" [style.width.%]="personalityStats.give"></div></div>
              <span class="ps-val">{{ personalityStats.give }}%</span>
            </div>
          </div>

          <div class="personality-breakdown">
            <h3>📊 Your Choices at a Glance</h3>
            <div class="pb-row"><span>Three Jars Allocation</span><span>Save {{ '$' + jarsSave }} / Spend {{ '$' + jarsSpend }} / Give {{ '$' + jarsGive }}</span></div>
            <div class="pb-row"><span>Birthday Money</span><span>Spend {{ '$' + birthdaySpend }} / Save {{ '$' + birthdaySave }} / Give {{ '$' + birthdayGive }}</span></div>
            <div class="pb-row"><span>Giving Choice</span><span>{{ givingResult }}</span></div>
            <div class="pb-row"><span>Goal Saving</span><span>Saved {{ '$' + goalSaved }} toward dream item</span></div>
          </div>

          <div class="final-lesson card">
            <h3>📖 What You Learned</h3>
            <p>✅ Every dollar needs a job — Spend, Save, or Give</p>
            <p>✅ Saving helps you buy bigger things in the future</p>
            <p>✅ Giving helps others and makes a difference</p>
            <p>✅ Life creates money choices every day — think carefully!</p>
            <p>✅ There is no single right way — what matters is being thoughtful</p>
          </div>

          <button class="btn-primary" (click)="finishLesson()">🎉 Complete Lesson</button>
        </div>
      }
    </div>

    @if (phase === 'complete') {
      <app-lesson-complete lessonTitle="Save Spend Give"
        [message]="'Amazing journey! You learned how every dollar can have a job — spending, saving, or giving! You earned the Money Manager badge!'"
        [xpEarned]="100" [score]="adventureTotalScore"
        badge="Money Manager" badgeEmoji="🏦"
        (continue)="goHome()">
      </app-lesson-complete>
    }
  `,
  styles: [`
    .intro { padding: 10px 0; }
    .lesson-content { margin-bottom: 16px; text-align: left; }
    .lesson-content h2 { font-family: 'Fredoka', sans-serif; font-size: 21px; margin-bottom: 8px; }
    .lesson-content > p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 10px; }
    .big-idea { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #FFF8E1, #FFE082); border-radius: 16px; padding: 16px; }
    .bi-emoji { font-size: 32px; }
    .big-idea p { font-family: 'Nunito', sans-serif; font-size: 16px; line-height: 1.5; margin: 0; }
    .three-jobs { display: flex; gap: 12px; margin-bottom: 16px; }
    .job-card { flex: 1; border-radius: 16px; padding: 16px; text-align: center; }
    .job-card.spend { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); }
    .job-card.save { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); }
    .job-card.give { background: linear-gradient(135deg, #FCE4EC, #F8BBD0); }
    .jc-icon { font-size: 32px; display: block; }
    .job-card h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 4px 0; }
    .job-card p { font-family: 'Nunito', sans-serif; font-size: 13px; color: #666; margin: 0; }
    .phase-nav { text-align: center; padding: 20px 0; }
    .phase-container { padding: 10px 0; }
    .phase-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .ph-number { background: #FFD54F; border-radius: 20px; padding: 4px 14px; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; color: #5D4037; }
    .phase-header h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 0; }
    .jars-game { max-width: 600px; margin: 0 auto; }
    .jars-track { margin-bottom: 16px; }
    .jt-label { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #888; }
    .jt-bar { height: 10px; background: #E0E0E0; border-radius: 5px; overflow: hidden; margin-top: 4px; }
    .jt-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #66BB6A); border-radius: 5px; transition: width 0.3s; }
    .jars-row { display: flex; gap: 12px; }
    .jar-card { flex: 1; background: white; border-radius: 20px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; transition: all 0.2s; }
    .jar-card.active { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .jar-visual { margin-bottom: 10px; }
    .jv-emoji { font-size: 36px; display: block; }
    .jar-count { font-family: 'Fredoka', sans-serif; font-size: 32px; font-weight: 700; color: #333; margin: 4px 0; }
    .jv-label { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #888; display: block; }
    .jv-total { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #FF6F00; display: block; margin-top: 2px; }
    .jar-buttons { display: flex; flex-direction: column; gap: 6px; }
    .jar-btn { padding: 8px; border-radius: 10px; border: none; cursor: pointer; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; background: #4CAF50; color: white; transition: all 0.2s; }
    .jar-btn.remove { background: #F5F5F5; color: #666; }
    .jar-btn:disabled { opacity: 0.3; cursor: default; }
    .jar-btn:hover:not(:disabled) { transform: translateY(-1px); }
    .jars-result { text-align: center; margin-top: 16px; }
    .jr-breakdown { display: flex; justify-content: center; gap: 16px; font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 8px; }
    .jr-lesson { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; }
    .birthday-game { max-width: 400px; margin: 0 auto; }
    .birthday-total { text-align: center; font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #E65100; margin-bottom: 16px; }
    .bday-row { display: flex; align-items: center; gap: 12px; justify-content: center; margin-bottom: 12px; background: white; border-radius: 14px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .bday-lbl { font-family: 'Fredoka', sans-serif; font-size: 16px; min-width: 100px; }
    .adj-btn { width: 40px; height: 40px; border-radius: 50%; border: none; font-size: 20px; font-weight: 700; cursor: pointer; background: #FFF3E0; color: #E65100; }
    .adj-btn:disabled { opacity: 0.3; cursor: default; }
    .bday-val { font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: #333; min-width: 50px; text-align: center; }
    .future-card { background: white; border-radius: 24px; padding: 28px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 480px; margin: 0 auto; }
    .fc-emoji { font-size: 64px; display: block; margin-bottom: 8px; }
    .future-card h3 { font-family: 'Fredoka', sans-serif; font-size: 20px; margin: 0; }
    .fc-cost { font-family: 'Nunito', sans-serif; font-size: 16px; color: #FF6F00; }
    .fc-comparison { display: flex; gap: 12px; margin: 16px 0; }
    .fc-side { flex: 1; padding: 14px; border-radius: 14px; }
    .fc-side.yours { background: #E8F5E9; }
    .fc-side.needed { background: #FFF3E0; }
    .fcs-label { font-family: 'Nunito', sans-serif; font-size: 13px; color: #888; display: block; }
    .fcs-amount { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #333; }
    .fc-verdict { padding: 12px; border-radius: 12px; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 12px; }
    .fc-verdict.success { background: #E8F5E9; }
    .fc-verdict.fail { background: #FFF3E0; }
    .fc-lesson { font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; font-style: italic; margin: 0; }
    .giving-game { max-width: 480px; margin: 0 auto; }
    .giving-intro { text-align: center; font-family: 'Nunito', sans-serif; font-size: 16px; margin-bottom: 16px; }
    .give-choices { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .give-choice { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 14px; border: 3px solid #E0E0E0; background: white; cursor: pointer; transition: all 0.2s; }
    .give-choice:hover { border-color: #FFD54F; }
    .give-choice.selected { border-color: #E91E63; background: #FCE4EC; }
    .gce-emoji { font-size: 28px; }
    .gce-label { flex: 1; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600; text-align: left; }
    .gce-cost { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #FF6F00; }
    .giving-impact { display: flex; align-items: center; gap: 10px; background: #FFF8E1; border-radius: 14px; padding: 14px; margin-bottom: 12px; }
    .gi-emoji { font-size: 32px; }
    .gi-text { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; margin: 0; line-height: 1.5; }
    .giving-result { text-align: center; font-family: 'Nunito', sans-serif; font-size: 14px; color: #888; margin-bottom: 12px; }
    .life-card { background: white; border-radius: 24px; padding: 24px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 480px; margin: 0 auto; }
    .life-emoji { font-size: 56px; display: block; margin-bottom: 8px; }
    .life-card h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin: 4px 0; }
    .life-card > p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; margin: 6px 0 16px; }
    .life-choices { display: flex; flex-direction: column; gap: 8px; }
    .life-choice { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; border: 2px solid #E0E0E0; background: white; cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    .life-choice:hover { border-color: #FFD54F; }
    .life-choice span:last-child { margin-left: auto; color: #FF6F00; }
    .life-choice span:first-child { font-size: 22px; }
    .life-feedback { margin-top: 12px; padding: 10px 14px; border-radius: 10px; background: #E8F5E9; font-family: 'Nunito', sans-serif; font-size: 14px; }
    .life-done { text-align: center; }
    .personality-page { padding: 10px 0; text-align: center; }
    .personality-card { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-radius: 24px; padding: 28px; margin: 16px 0; }
    .pc-emoji { font-size: 64px; display: block; margin-bottom: 8px; }
    .personality-card h2 { font-family: 'Fredoka', sans-serif; font-size: 28px; color: #2E7D32; margin: 0; }
    .personality-card p { font-family: 'Nunito', sans-serif; font-size: 15px; color: #555; line-height: 1.6; margin: 8px 0 0; }
    .personality-stats { margin: 16px 0; }
    .pstat { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .ps-label { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; min-width: 80px; text-align: left; }
    .ps-bar { flex: 1; height: 14px; background: #E0E0E0; border-radius: 7px; overflow: hidden; }
    .ps-fill { height: 100%; border-radius: 7px; transition: width 0.5s; }
    .ps-fill.save { background: #4CAF50; }
    .ps-fill.spend { background: #2196F3; }
    .ps-fill.give { background: #E91E63; }
    .ps-val { font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; min-width: 40px; }
    .personality-breakdown { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin: 16px 0; text-align: left; }
    .personality-breakdown h3 { font-family: 'Fredoka', sans-serif; font-size: 18px; margin-bottom: 10px; }
    .pb-row { display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; padding: 6px 0; border-bottom: 1px solid #F0F0F0; }
    .pb-row:last-child { border-bottom: none; }
    .final-lesson { text-align: left; }
    .final-lesson h3 { margin-bottom: 8px; }
    .final-lesson p { font-size: 14px; margin-bottom: 6px; padding-left: 4px; }
    @media (max-width: 480px) {
      .three-jobs { flex-direction: column; }
      .jars-row { flex-direction: column; }
      .fc-comparison { flex-direction: column; }
      .personality-stats { flex-direction: column; }
    }
  `]
})
export class SaveSpendGiveComponent {
  protected phase: Phase = 'intro';

  protected jars: ThreeJarsSlot[] = [
    { id: 'save', label: 'Save', emoji: '🏦', count: 0 },
    { id: 'spend', label: 'Spend', emoji: '💵', count: 0 },
    { id: 'give', label: 'Give', emoji: '❤️', count: 0 },
  ];
  protected jarsMap: Record<string, ThreeJarsSlot> = {
    save: this.jars[0], spend: this.jars[1], give: this.jars[2],
  };
  protected jarsRemaining = 50;

  protected birthdaySpend = 4;
  protected birthdaySave = 4;
  protected birthdayGive = 2;
  protected birthdayRemaining = 10;

  protected selectedGiving = '';
  protected givingResult = '';
  protected givingImpactEmoji = '';
  protected givingImpactText = '';

  protected goalSaved = 0;

  protected lifeScenarioIndex = 0;
  protected lifeChoiceMade = false;
  protected lifeChoiceIndex = 0;

  protected adventureResult: { totalSpend: number; totalSave: number; totalGive: number; totalEarned: number } | null = null;

  constructor(
    private router: Router,
    private profile: FinancialProfileService,
    private audio: AudioService
  ) {}

  protected get currentLifeScenario(): LifeScenario {
    return this.lifeScenarios[this.lifeScenarioIndex];
  }

  protected lifeScenarios: LifeScenario[] = [
    {
      title: 'Candy or Tire?', description: 'You have $10. You want candy, but your bike tire is flat.', emoji: '🍬',
      choices: [
        { label: 'Buy candy', emoji: '🍭', effect: 'spend', amount: 10, feedback: 'Candy is fun, but a flat tire means you cannot ride your bike. Needs come first!' },
        { label: 'Fix the tire', emoji: '🔧', effect: 'save', amount: 10, feedback: 'Smart choice! Fixing your bike means you can keep riding it. Taking care of what you have is important!' },
        { label: 'Save the money', emoji: '🏦', effect: 'save', amount: 10, feedback: 'Saving is always a good option! You can decide later what to do with your money.' },
      ],
    },
    {
      title: 'Pizza with Friends', description: 'Your friends are ordering pizza and ask you to chip in $5. You have $8.', emoji: '🍕',
      choices: [
        { label: 'Join and pay $5', emoji: '🍕', effect: 'spend', amount: 5, feedback: 'Spending time with friends is great! Just make sure you still have money for what you need.' },
        { label: 'Politely pass', emoji: '💪', effect: 'save', amount: 0, feedback: 'It is okay to say no sometimes! Saving your money is a smart choice too.' },
        { label: 'Treat a friend', emoji: '❤️', effect: 'give', amount: 5, feedback: 'How generous! Treating a friend feels good and strengthens your friendships.' },
      ],
    },
    {
      title: 'Found $5', description: 'You find $5 on the sidewalk. No one is around.', emoji: '🪙',
      choices: [
        { label: 'Keep and spend', emoji: '🛒', effect: 'spend', amount: 5, feedback: 'It is yours now! Spending found money can feel like a bonus treat.' },
        { label: 'Keep and save', emoji: '🏦', effect: 'save', amount: 5, feedback: 'Great idea! Adding found money to your savings helps you reach your goals faster.' },
        { label: 'Donate it', emoji: '❤️', effect: 'give', amount: 5, feedback: 'What a kind heart! Donating found money is a beautiful way to share unexpected good fortune.' },
      ],
    },
    {
      title: 'Toy on Sale', description: 'A toy you wanted is on sale for $12, down from $20. You have $15.', emoji: '🧸',
      choices: [
        { label: 'Buy the toy', emoji: '🎮', effect: 'spend', amount: 12, feedback: 'You got a great deal! Buying on sale is a smart spending habit.' },
        { label: 'Keep saving', emoji: '🏦', effect: 'save', amount: 15, feedback: 'Saving instead of spending shows discipline. Your future goal will thank you!' },
        { label: 'Buy it for a friend', emoji: '🎁', effect: 'give', amount: 12, feedback: 'Wow! Buying a gift for a friend is incredibly generous. You are a great friend!' },
      ],
    },
  ];

  protected giveChoices = [
    { id: 'keep', label: 'Keep all $10', emoji: '💰', cost: '$0', impactEmoji: '😐', impactText: 'Money Mike keeps everything for himself.', result: 'Keeping all your money is okay sometimes, but giving even a little can make a big difference for someone else.' },
    { id: 'give1', label: 'Give $1 to help buy food', emoji: '🥫', cost: '$1', impactEmoji: '🍲', impactText: 'Your $1 combines with others to buy a warm meal for someone who is hungry.', result: 'Even $1 can help! When lots of people give a little, it adds up to a lot of help.' },
    { id: 'give2', label: 'Give $2 to help animal shelter', emoji: '🐾', cost: '$2', impactEmoji: '🐕', impactText: 'Your $2 helps feed and care for dogs and cats waiting for a home.', result: 'Animals need food, medicine, and love. Your $2 makes a real difference for them!' },
  ];

  get futureMikeMessage(): string {
    return this.birthdaySave >= 15
      ? 'Look at that! Saving your birthday money really paid off!'
      : 'Oh well! If you save more next time, you will have enough for things you really want!';
  }

  get futureMikeMood(): 'neutral' | 'happy' | 'thinking' | 'celebrate' {
    return this.birthdaySave >= 15 ? 'celebrate' : 'thinking';
  }

  get personalityMessage(): string {
    return 'Here is your financial personality! This shows your money style based on all your choices.';
  }

  get personalityEmoji(): string {
    const s = this.personalityStats;
    if (s.save >= 45) return '🏆';
    if (s.give >= 30) return '🌟';
    if (s.spend >= 50) return '🛒';
    return '⚖️';
  }

  get personalityName(): string {
    const s = this.personalityStats;
    if (s.save >= 45) return 'Saver Sam';
    if (s.give >= 30) return 'Generous Grace';
    if (s.spend >= 50) return 'Smart Spender';
    return 'Balanced Money Manager';
  }

  get personalityDescription(): string {
    const s = this.personalityStats;
    if (s.save >= 45) return 'You love planning ahead! You know that saving today means more options tomorrow. Your future self will thank you for being so thoughtful with your money.';
    if (s.give >= 30) return 'You have the biggest heart! Giving to others brings you joy, and you understand that money can be a powerful tool for helping people. The world needs more people like you!';
    if (s.spend >= 50) return 'You enjoy your money and know how to treat yourself! You like experiences and things that make you happy. Just remember to save a little for later too!';
    return 'You found a healthy balance between spending, saving, and giving. You think carefully about each choice and know that different situations call for different approaches. Perfect!';
  }

  get personalityStats(): { save: number; spend: number; give: number } {
    const r = this.adventureResult;
    if (!r) return { save: 33, spend: 33, give: 34 };
    const t = r.totalSave + r.totalSpend + r.totalGive;
    if (t === 0) return { save: 33, spend: 33, give: 34 };
    return {
      save: Math.round((r.totalSave / t) * 100),
      spend: Math.round((r.totalSpend / t) * 100),
      give: Math.round((r.totalGive / t) * 100),
    };
  }

  get jarsSave(): number { return this.jarsMap['save'].count * 10; }
  get jarsSpend(): number { return this.jarsMap['spend'].count * 10; }
  get jarsGive(): number { return this.jarsMap['give'].count * 10; }

  get adventureTotalScore(): number {
    const r = this.adventureResult;
    if (!r) return 100;
    const t = r.totalSave + r.totalSpend + r.totalGive;
    return t > 0 ? t : 100;
  }

  protected goTo(phase: Phase): void {
    this.phase = phase;
    this.audio.playClick();
  }

  protected addToJar(id: string): void {
    if (this.jarsRemaining <= 0) return;
    const slot = this.jarsMap[id];
    if (!slot) return;
    slot.count++;
    this.jarsRemaining -= 10;
    this.audio.playCoin();
  }

  protected removeFromJar(id: string): void {
    const slot = this.jarsMap[id];
    if (!slot || slot.count <= 0) return;
    slot.count--;
    this.jarsRemaining += 10;
  }

  protected confirmJars(): void {
    this.audio.playSuccess();
    this.goTo('birthday');
  }

  protected adjBirthday(cat: 'spend' | 'save' | 'give', delta: number): void {
    if (delta > 0 && this.birthdayRemaining < delta) return;
    let target = cat === 'spend' ? this.birthdaySpend : cat === 'save' ? this.birthdaySave : this.birthdayGive;
    if (target + delta < 0) return;
    if (cat === 'spend') this.birthdaySpend += delta;
    else if (cat === 'save') this.birthdaySave += delta;
    else this.birthdayGive += delta;
    this.birthdayRemaining -= delta;
  }

  protected confirmBirthday(): void {
    this.audio.playSuccess();
    this.goTo('future');
  }

  protected selectGiving(id: string): void {
    this.selectedGiving = id;
    const c = this.giveChoices.find((x) => x.id === id);
    if (c) {
      this.givingImpactEmoji = c.impactEmoji;
      this.givingImpactText = c.impactText;
      this.givingResult = c.result;
      this.audio.playClick();
    }
  }

  protected confirmGiving(): void {
    this.audio.playSuccess();
    this.goTo('goal');
  }

  protected onGoalDone(): void {
    this.goTo('life-events');
  }

  protected pickLifeChoice(index: number): void {
    if (this.lifeChoiceMade) return;
    this.lifeChoiceMade = true;
    this.lifeChoiceIndex = index;
  }

  protected nextLifeScenario(): void {
    this.lifeChoiceMade = false;
    this.lifeScenarioIndex++;
  }

  protected onAdventureDone(): void {
    this.goTo('personality');
  }

  protected finishLesson(): void {
    const r = this.adventureResult;
    const sc = r ? r.totalSave + r.totalSpend + r.totalGive : 100;
    this.profile.addScore(sc);
    this.profile.addXp(100);
    this.profile.addBadge('Money Manager');
    this.profile.completeLesson('save-spend-give');
    this.audio.playBadge();
    this.phase = 'complete';
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
