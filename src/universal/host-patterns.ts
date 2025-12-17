const BYPASS_ENTRY_REGEX = /^(<local>|(\*?[\w.-]+)(:\d+)?|\d{1,3}(\.\d{1,3}|\.\*){3}(:\d+)?)$/;

export const validateBypassPatterns = (list: string): boolean => {
  try {
    if (!list) {
      return true;
    }
    const entries = parseBypassPatterns(list);
    for (const entry of entries) {
      const isValid = BYPASS_ENTRY_REGEX.test(entry);
      if (!isValid) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

export const parseBypassPatterns = (list: string = ''): string[] =>
  list
    .split(';')
    .map(e => e.trim())
    .filter(Boolean);
