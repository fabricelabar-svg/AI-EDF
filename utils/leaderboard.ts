import type { LeaderboardScore } from '../types';

const LEADERBOARD_KEY_PREFIX = 'leaderboard_';
const USERNAME_KEY = 'leaderboard_username';
const MAX_SCORES = 10;

class LeaderboardManager {
  private getKey(game: string): string {
    return `${LEADERBOARD_KEY_PREFIX}${game}`;
  }

  public getScores(game: string): LeaderboardScore[] {
    try {
      const stored = localStorage.getItem(this.getKey(game));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error parsing leaderboard data', e);
      return [];
    }
  }

  public getUserName(): string {
    return localStorage.getItem(USERNAME_KEY) || 'Anonyme';
  }

  public setUserName(name: string): void {
    if (name && name.trim()) {
        localStorage.setItem(USERNAME_KEY, name.trim());
    }
  }

  public addScore(game: string, time: number): void {
    if (time <= 0) return;
    const scores = this.getScores(game);
    const newScore: LeaderboardScore = {
      time,
      date: new Date().toISOString(),
      name: this.getUserName(),
    };
    
    scores.push(newScore);
    // Sort by time, ascending.
    scores.sort((a, b) => a.time - b.time);
    
    const topScores = scores.slice(0, MAX_SCORES);
    
    try {
      localStorage.setItem(this.getKey(game), JSON.stringify(topScores));
    } catch (e) {
      console.error('Error saving leaderboard data', e);
    }
  }
}

export const leaderboardManager = new LeaderboardManager();
