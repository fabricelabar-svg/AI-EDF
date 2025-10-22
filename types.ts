export interface Verb {
  fr: string;
  nl: {
    infinitive: string;
    preterite: string;
    participle: string;
  };
}

export interface QuizQuestion {
  prompt: string;
  answer: string;
  verb: Verb;
}

export interface GeminiFeedback {
  isCorrect: boolean;
  feedback: string;
}

export interface ExampleSentence {
  nl_sentence: string;
  fr_sentence: string;
}

export interface VerbUserData {
  [infinitive: string]: {
    masteryLevel: number;
    nextReview: string; // ISO string date
  };
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
}
