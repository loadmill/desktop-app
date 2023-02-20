export const downloadFile = (textContents: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = 'data:text/html,' + textContents;
  link.download = fileName;
  link.click();
};
