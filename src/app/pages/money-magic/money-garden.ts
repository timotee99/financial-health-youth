import { Component, Output, EventEmitter } from '@angular/core';

interface GardenTree {
  id: number;
  dayPlanted: number;
  size: number;
  fruits: number;
}

@Component({
  selector: 'app-money-garden',
  standalone: true,
  template: `
    <div class="garden animate-slide-up">
      <h2>🌱 Money Garden Simulator</h2>
      <p class="garden-intro">Every dollar saved is like planting a seed. Watch your garden grow over time!</p>

      @if (!started) {
        <div class="garden-start">
          <div class="garden-visual">
            <div class="plot empty">
              <span class="plot-ground">🟫</span>
              <span class="plot-label">Empty Soil</span>
            </div>
            <div class="garden-arrow">➡️</div>
            <div class="plot full">
              <span class="plot-tree">🌳</span>
              <span class="plot-label">Growing Trees</span>
            </div>
          </div>
          <p>Plant your first seed by saving <strong>$5</strong>!</p>
          <button class="btn-primary" (click)="startGarden()">🌱 Plant First Seed!</button>
        </div>
      }

      @if (started && day <= maxDays) {
        <div class="garden-active">
          <div class="garden-header">
            <span class="gh-day">Day {{ day }} / {{ maxDays }}</span>
            <span class="gh-saved">Saved: {{ '$' + totalSaved }}</span>
            <span class="gh-value">Value: {{ '$' + gardenValue }}</span>
          </div>

          <div class="garden-plot" [style.gridTemplateColumns]="'repeat(' + cols + ', 1fr)'">
            @for (tree of trees; track tree.id) {
              <div class="garden-tree" [style.transform]="'scale(' + (0.5 + tree.size * 0.5) + ')'">
                <span class="gt-tree">{{ tree.size >= 3 ? '🌳' : tree.size >= 2 ? '🌿' : '🌱' }}</span>
                @if (tree.fruits > 0) {
                  <div class="gt-fruits">
                    @for (f of fruitsArray(tree.fruits); track f) {
                      <span class="gt-fruit">🪙</span>
                    }
                  </div>
                }
                <span class="gt-day">Day {{ tree.dayPlanted }}</span>
              </div>
            }
            @for (e of emptySlots; track e) {
              <div class="plot-slot empty">
                <span>🟫</span>
              </div>
            }
          </div>

          <div class="garden-actions">
            @if (canPlant) {
              <button class="btn-secondary" (click)="plantSeed()">
                🌱 Plant Seed ({{ '$5' }})
              </button>
            }
            @if (canWater) {
              <button class="btn-secondary" (click)="waterGarden()">
                💧 Water Garden (+1 growth)
              </button>
            }
            <button class="btn-primary" (click)="nextDay()">
              {{ day < maxDays ? 'Next Day ➡️' : 'Harvest! 🧺' }}
            </button>
          </div>

          <div class="garden-log">
            @for (entry of log.slice(-3); track entry) {
              <p class="log-entry">{{ entry }}</p>
            }
          </div>
        </div>
      }

      @if (day > maxDays) {
        <div class="garden-result">
          <span class="gr-emoji">🌳</span>
          <h3>Your Money Garden!</h3>
          <p>You planted <strong>{{ trees.length }}</strong> seeds and grew a garden worth <strong>{{ '$' + gardenValue }}</strong>!</p>
          <p>Your {{ '$' + totalSaved }} saved became worth {{ '$' + gardenValue }} — that's the power of letting your money grow!</p>
          <div class="gr-metrics">
            <div class="gr-item"><span>{{ trees.length }}</span><span>Trees</span></div>
            <div class="gr-item"><span>{{ '$' + totalSaved }}</span><span>Invested</span></div>
            <div class="gr-item"><span>{{ '$' + gardenValue }}</span><span>Final Value</span></div>
            <div class="gr-item"><span>{{ profitPct }}%</span><span>Growth</span></div>
          </div>
          <button class="btn-primary" (click)="done.emit({ trees: trees.length, saved: totalSaved, value: gardenValue })">
            Continue ➡️
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .garden { margin: 16px 0; text-align: center; }
    .garden h2 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin-bottom: 4px; }
    .garden-intro { font-family: 'Nunito', sans-serif; font-size: 15px; color: #888; margin-bottom: 16px; }
    .garden-start { max-width: 400px; margin: 0 auto; }
    .garden-visual { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; }
    .plot { display: flex; flex-direction: column; align-items: center; padding: 12px; border-radius: 14px; background: white; }
    .plot.empty { border: 3px dashed #E0E0E0; }
    .plot.full { background: #E8F5E9; border: 3px solid #4CAF50; }
    .plot-ground { font-size: 48px; }
    .plot-tree { font-size: 48px; }
    .plot-label { font-family: 'Nunito', sans-serif; font-size: 12px; color: #666; margin-top: 4px; }
    .garden-arrow { font-size: 24px; color: #4CAF50; }
    .garden-header { display: flex; justify-content: space-around; margin-bottom: 12px; }
    .gh-day { font-family: 'Fredoka', sans-serif; font-size: 16px; color: #333; }
    .gh-saved { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #FF6F00; }
    .gh-value { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #2E7D32; }
    .garden-plot {
      display: grid;
      gap: 8px;
      padding: 16px;
      background: #FFF8E1;
      border-radius: 20px;
      min-height: 200px;
      margin-bottom: 12px;
    }
    .garden-tree { display: flex; flex-direction: column; align-items: center; position: relative; transition: transform 0.3s; }
    .gt-tree { font-size: 36px; }
    .gt-fruits { display: flex; gap: 2px; margin-top: 2px; }
    .gt-fruit { font-size: 12px; }
    .gt-day { font-family: 'Nunito', sans-serif; font-size: 10px; color: #888; }
    .plot-slot { display: flex; align-items: center; justify-content: center; }
    .plot-slot span { font-size: 32px; opacity: 0.4; }
    .garden-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
    .garden-log { text-align: left; max-width: 400px; margin: 0 auto; }
    .log-entry { font-family: 'Nunito', sans-serif; font-size: 13px; color: #666; margin: 2px 0; padding: 4px 8px; background: #F5F5F5; border-radius: 6px; }
    .garden-result { text-align: center; }
    .gr-emoji { font-size: 64px; display: block; }
    .garden-result h3 { font-family: 'Fredoka', sans-serif; font-size: 22px; margin: 8px 0; }
    .garden-result p { font-family: 'Nunito', sans-serif; font-size: 14px; color: #555; line-height: 1.6; }
    .gr-metrics { display: flex; gap: 8px; justify-content: center; margin: 16px 0; }
    .gr-item { background: white; border-radius: 14px; padding: 10px 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    .gr-item span:first-child { font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #FF6F00; display: block; }
    .gr-item span:last-child { font-family: 'Nunito', sans-serif; font-size: 11px; color: #888; }
  `]
})
export class MoneyGardenComponent {
  @Output() done = new EventEmitter<{ trees: number; saved: number; value: number }>();

  protected started = false;
  protected day = 1;
  protected maxDays = 10;
  protected totalSaved = 0;
  protected gardenValue = 0;
  protected trees: GardenTree[] = [];
  protected cols = 4;
  protected log: string[] = [];
  protected wateredToday = false;

  protected get canPlant(): boolean {
    return this.totalSaved >= 5 && this.trees.length < 8;
  }

  protected get canWater(): boolean {
    return !this.wateredToday && this.trees.length > 0;
  }

  protected get emptySlots(): number[] {
    const count = Math.max(0, this.cols * 2 - this.trees.length);
    return Array.from({ length: count }, (_, i) => i);
  }

  protected fruitsArray(count: number): number[] {
    return Array.from({ length: Math.min(count, 5) }, (_, i) => i);
  }

  protected get profitPct(): number {
    if (this.totalSaved === 0) return 0;
    return Math.round((this.gardenValue / this.totalSaved) * 100);
  }

  startGarden(): void {
    this.started = true;
    this.plantSeed();
  }

  plantSeed(): void {
    if (this.totalSaved < 5) return;
    this.totalSaved -= 5;
    const tree: GardenTree = {
      id: this.trees.length,
      dayPlanted: this.day,
      size: 1,
      fruits: 0,
    };
    this.trees.push(tree);
    this.log.push(`🌱 Planted a seed on Day ${this.day}!`);
  }

  waterGarden(): void {
    this.wateredToday = true;
    let grownCount = 0;
    for (const tree of this.trees) {
      if (tree.size < 3) {
        tree.size++;
        grownCount++;
      }
    }
    this.log.push(`💧 Watered the garden! ${grownCount} trees grew!`);
  }

  nextDay(): void {
    this.day++;
    this.wateredToday = false;

    this.totalSaved += 2;

    for (const tree of this.trees) {
      if (tree.size >= 2) {
        if (Math.random() < 0.3) {
          tree.fruits++;
          this.gardenValue += 3;
        }
      }
    }

    if (this.day === 5) {
      this.log.push(`🌟 Boom! Your trees are producing fruits!`);
    }

    if (this.day === 8) {
      this.cols = 4;
    }

    if (this.day > this.maxDays) {
      this.gardenValue += this.totalSaved;
    }
  }
}
