import { allTrophies } from '../data/trophies';
import type { VerbUserData, Trophy } from '../types';

const STREAK_KEY = 'gamification_streak';
const TROPHIES_KEY = 'gamification_trophies';
const VIEWS_KEY = 'gamification_views';

interface StreakData {
  lastVisit: string; // ISO date string (yyyy-mm-dd)
  count: number;
}

class GamificationManager {
  constructor() {
    this.updateStreak();
    window.addEventListener('gamificationUpdate', this.handleEvent.bind(this) as EventListener);
  }

  // --- STREAK LOGIC ---
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  public getStreak(): number {
    const data = this.getStreakData();
    return data.count;
  }

  private getStreakData(): StreakData {
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) { console.error('Error parsing streak data', e); }
    return { lastVisit: this.getTodayString(), count: 1 };
  }

  private saveStreakData(data: StreakData): void {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  }
  
  public updateStreak(): void {
    const today = this.getTodayString();
    const data = this.getStreakData();
    
    if (data.lastVisit === today) return; // Already visited today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (data.lastVisit === yesterdayString) {
      // Consecutive day
      data.count += 1;
    } else {
      // Missed a day
      data.count = 1;
    }
    
    data.lastVisit = today;
    this.saveStreakData(data);
    this.checkStreakTrophies(data.count);
  }

  // --- TROPHY LOGIC ---
  public getUnlockedTrophies(): Set<string> {
    try {
      const stored = localStorage.getItem(TROPHIES_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) { console.error('Error parsing trophies data', e); }
    return new Set();
  }

  private unlockTrophy(trophyId: string): void {
    const unlocked = this.getUnlockedTrophies();
    if (unlocked.has(trophyId)) return; // Already unlocked

    unlocked.add(trophyId);
    localStorage.setItem(TROPHIES_KEY, JSON.stringify([...unlocked]));

    const trophy = allTrophies.find(t => t.id === trophyId);
    if (trophy) {
      // Dispatch event for UI to show notification
      window.dispatchEvent(new CustomEvent('trophyUnlocked', { detail: trophy }));
    }
  }
  
  // --- VIEW TRACKING for Explorer Trophy ---
  public recordView(view: string): void {
    try {
      // We only care about exercise views for the explorer trophy
      const exerciseViews = ['flashcards', 'quiz', 'sentences', 'hangman', 'srs'];
      if (!exerciseViews.includes(view)) return;

      const stored = localStorage.getItem(VIEWS_KEY);
      const views = stored ? new Set(JSON.parse(stored)) : new Set();
      views.add(view);
      localStorage.setItem(VIEWS_KEY, JSON.stringify([...views]));
      
      if(views.size >= 5) {
          this.unlockTrophy('explorer');
      }
    } catch (e) { console.error('Error recording view', e); }
  }


  // --- EVENT HANDLING ---
  private handleEvent(event: CustomEvent): void {
    const { type, detail } = event.detail;
    switch(type) {
      case 'quiz_completed':
        this.checkQuizTrophies(detail);
        break;
      case 'hangman_won':
        this.checkHangmanTrophies(detail);
        break;
      case 'srs_data_updated':
        this.checkSrsTrophies(detail);
        break;
    }
  }
  
  private checkStreakTrophies(count: number): void {
      if (count >= 7) this.unlockTrophy('streak_7');
      if (count >= 30) this.unlockTrophy('streak_30');
  }

  private checkQuizTrophies(data: { score: number, total: number, level: number, isSrs: boolean }): void {
    this.unlockTrophy('first_quiz');
    
    if (data.isSrs && data.total >= 30) {
      this.unlockTrophy('marathon_runner');
    }
    
    const isPerfect = data.score === data.total;
    if (isPerfect && data.level >= 2) {
      this.unlockTrophy('perfect_score');
    }
  }
  
  private checkHangmanTrophies(data: { errors: number }): void {
    if (data.errors < 4) {
      this.unlockTrophy('hangman_ace');
    }
  }
  
  private checkSrsTrophies(data: VerbUserData): void {
    const masteryLevels = Object.values(data).map(v => v.masteryLevel);
    const level3Count = masteryLevels.filter(l => l >= 3).length;
    const level5Count = masteryLevels.filter(l => l >= 5).length;
    
    if (level3Count >= 10) this.unlockTrophy('mastery_apprentice');
    if (level5Count >= 25) this.unlockTrophy('mastery_master');
  }
}

export const gamificationManager = new GamificationManager();

// Helper to dispatch events from components
export const recordGameEvent = (type: string, detail: any) => {
  window.dispatchEvent(new CustomEvent('gamificationUpdate', { detail: { type, detail } }));
};
