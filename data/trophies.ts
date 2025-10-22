import type { Trophy } from '../types';

export const allTrophies: Trophy[] = [
  {
    id: 'first_quiz',
    name: "L'Initié",
    description: 'Termine ton premier quiz.',
    icon: '🎓',
  },
  {
    id: 'explorer',
    name: "L'Explorateur",
    description: "Essaie chaque type d'exercice.",
    icon: '🧭',
  },
  {
    id: 'perfect_score',
    name: 'Score Parfait',
    description: 'Obtiens 100% à un quiz de niveau 2 ou 3.',
    icon: '⭐',
  },
  {
    id: 'hangman_ace',
    name: 'As du Pendu',
    description: 'Gagne au Pendu avec moins de 4 erreurs.',
    icon: '🧠',
  },
  {
    id: 'mastery_apprentice',
    name: 'Apprenti Maître',
    description: 'Atteins le niveau de maîtrise 3 pour 10 verbes.',
    icon: '💪',
  },
  {
    id: 'mastery_master',
    name: 'Maître des Verbes',
    description: 'Atteins le niveau de maîtrise 5 pour 25 verbes.',
    icon: '👑',
  },
  {
    id: 'marathon_runner',
    name: 'Le Marathonien',
    description: "Termine une session d'Évaluation de 30 verbes ou plus.",
    icon: '🏃‍♂️',
  },
  {
    id: 'streak_7',
    name: 'Série de Feu',
    description: 'Maintiens une série de pratique de 7 jours.',
    icon: '🔥',
  },
  {
    id: 'streak_30',
    name: 'Série Infernale',
    description: 'Maintiens une série de 30 jours.',
    icon: '🌋',
  },
];
