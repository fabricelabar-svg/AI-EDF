import type { Verb, VerbUserData } from '../types';
import { verbList } from '../data/verbs';
import { recordGameEvent } from './gamification';

const STORAGE_KEY = 'dutchVerbsUserData';

// Spacing intervals in days for each mastery level
const MASTERY_LEVEL_INTERVALS: { [level: number]: number } = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
  6: 60,
  7: 120,
};
const MAX_MASTERY_LEVEL = 7;

class SrsManager {
  private getAllUserData(): VerbUserData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Could not parse user data from localStorage", error);
      return {};
    }
  }

  private saveAllUserData(data: VerbUserData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      recordGameEvent('srs_data_updated', data);
    } catch (error) {
      console.error("Could not save user data to localStorage", error);
    }
  }

  public getVerbUserData(infinitive: string) {
    const allUserData = this.getAllUserData();
    return allUserData[infinitive] || { masteryLevel: 0, nextReview: new Date().toISOString() };
  }

  public updateVerbUserData(infinitive: string, isCorrect: boolean): void {
    const allUserData = this.getAllUserData();
    const currentData = allUserData[infinitive] || { masteryLevel: 0 };

    let newMasteryLevel = currentData.masteryLevel;

    if (isCorrect) {
      newMasteryLevel = Math.min(newMasteryLevel + 1, MAX_MASTERY_LEVEL);
    } else {
      // Be forgiving: only drop one level, or reset if it's already low
      newMasteryLevel = newMasteryLevel > 2 ? newMasteryLevel -1 : 1;
    }

    const intervalDays = MASTERY_LEVEL_INTERVALS[newMasteryLevel] || 1;
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
    
    // Set time to the beginning of the day for consistent daily reviews
    nextReviewDate.setHours(0, 0, 0, 0);

    allUserData[infinitive] = {
      masteryLevel: newMasteryLevel,
      nextReview: nextReviewDate.toISOString(),
    };
    
    this.saveAllUserData(allUserData);
  }

  public getVerbsForReview(sourceVerbs: Verb[] = verbList): Verb[] {
    const allUserData = this.getAllUserData();
    const now = new Date();

    const verbsToReview = sourceVerbs.filter(verb => {
      const userData = allUserData[verb.nl.infinitive];
      if (!userData) {
        // New verbs are always available for review
        return true;
      }
      const nextReviewDate = new Date(userData.nextReview);
      return now >= nextReviewDate;
    });
    
    // Prioritize verbs with lower mastery level
    verbsToReview.sort((a, b) => {
        const masteryA = allUserData[a.nl.infinitive]?.masteryLevel ?? 0;
        const masteryB = allUserData[b.nl.infinitive]?.masteryLevel ?? 0;
        return masteryA - masteryB;
    });
    
    return verbsToReview;
  }
}

export const srsManager = new SrsManager();
