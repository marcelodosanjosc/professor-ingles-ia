export interface Sm2Card {
  easiness: number;
  interval: number;
  repetitions: number;
}

export interface Sm2Result {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

/**
 * Algoritmo SuperMemo 2 (SM-2) para repetição espaçada.
 * @param card Estado atual do card (easiness, interval, repetitions)
 * @param quality Avaliação da lembrança pelo aluno (0 a 5)
 */
export function calculateSm2(card: Sm2Card, quality: number): Sm2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let repetitions = card.repetitions;
  let interval = card.interval;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * card.easiness);
      if (interval < 1) {
        interval = 1;
      }
    }
  }

  // Fator de facilidade (EF)
  const easinessDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const easiness = Math.max(1.3, Number((card.easiness + easinessDelta).toFixed(3)));

  // Próxima revisão somando interval dias à data atual
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  if (interval >= 1) {
    nextReview.setHours(4, 0, 0, 0);
  }

  return {
    easiness,
    interval,
    repetitions,
    nextReview,
  };
}
