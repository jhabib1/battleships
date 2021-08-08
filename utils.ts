const prompt = require("prompt-sync")();

export function addSpace(character: string, amount: number) {
  var result = "";

  while (amount-- > 0) result += character;

  return result;
}

export function getRandomNumber(range: number): number {
  return Math.min(Math.floor(Math.random() * range), 1);
}

export const isValidNumericInput = (input: string | number): boolean =>
  typeof input === "number" && !Number.isNaN(input);

export const userPrompt = (question: string, defaultValue = ""): number =>
  parseInt(prompt(question, defaultValue));

export const userPromptString = (question: string, defaultValue = ""): string =>
  prompt(question, defaultValue);
