const UNITS: Record<string, number> = {
  zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

const SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
};

/**
 * Tokenizes a normalized speech string into a flat list of numeric values.
 * Handles both spoken number words ("twenty five" -> 25) and literal digits ("25").
 * Compound words like "twenty-five" or "twentyfive" are not merged across tokens;
 * only adjacent tens+units word pairs ("twenty" "five") and hundred/thousand
 * combinations are folded into a single number.
 */
export function extractNumbers(words: string[]): number[] {
  const numbers: number[] = [];
  let i = 0;

  while (i < words.length) {
    const word = words[i];

    if (/^-?\d+(\.\d+)?$/.test(word)) {
      numbers.push(Number(word));
      i += 1;
      continue;
    }

    if (word in UNITS || word in TENS) {
      let value = 0;
      let consumed = false;

      if (word in TENS) {
        value = TENS[word];
        consumed = true;
        i += 1;
        if (i < words.length && words[i] in UNITS && UNITS[words[i]] < 10) {
          value += UNITS[words[i]];
          i += 1;
        }
      } else {
        value = UNITS[word];
        consumed = true;
        i += 1;
      }

      while (i < words.length && words[i] in SCALES) {
        value *= SCALES[words[i]];
        i += 1;
        if (i < words.length && (words[i] in UNITS || words[i] in TENS)) {
          const next = extractNumbers([words[i]]);
          if (next.length) {
            value += next[0];
            i += 1;
          }
        }
      }

      if (consumed) {
        numbers.push(value);
        continue;
      }
    }

    i += 1;
  }

  return numbers;
}

export function wordToNumber(word: string): number | null {
  const result = extractNumbers([word]);
  return result.length ? result[0] : null;
}
