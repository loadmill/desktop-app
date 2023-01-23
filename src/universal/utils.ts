export const textToNonEmptyLines = (text: string = ''): string[] =>
  text.split('\n').filter(l => l && l.trim());

export const toPrettyJsonString = (json: object): string => {
  return JSON.stringify(json, null, 2);
};
