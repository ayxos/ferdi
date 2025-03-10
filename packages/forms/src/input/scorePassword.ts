interface ILetters {
  [key: string]: number;
}

interface IVariations {
  [index: string]: boolean;
  digits: boolean;
  lower: boolean;
  nonWords: boolean;
  upper: boolean;
}

export function scorePasswordFunc(password: string): number {
  let score = 0;
  if (!password) {
    return score;
  }

  // award every unique letter until 5 repetitions
  const letters: ILetters = {};
  for (let i = 0; i < password.length; i += 1) {
    letters[password[i]] = (letters[password[i]] || 0) + 1;
    score += 5.0 / letters[password[i]];
  }

  // bonus points for mixing it up
  const variations: IVariations = {
    digits: /\d/.test(password),
    lower: /[a-z]/.test(password),
    nonWords: /\W/.test(password),
    upper: /[A-Z]/.test(password),
  };

  let variationCount = 0;
  Object.keys(variations).forEach(key => {
    variationCount += variations[key] === true ? 1 : 0;
  });

  score += (variationCount - 1) * 10;

  return Math.round(score);
}
