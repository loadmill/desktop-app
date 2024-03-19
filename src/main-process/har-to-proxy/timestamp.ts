export const toTimestamp = (startedDateTime: string): number => {
  try {
    const newDate = new Date(startedDateTime);
    if (newDate.toString() === 'Invalid Date') {
      return Date.now();
    }
    return newDate.getTime();
  } catch (error) {
    return Date.now();
  }
};
