export const textToNonEmptyLines = (text: string = ''): string[] =>
  text.split('\n').filter(l => l && l.trim());
