import { fork, ForkOptions } from 'child_process';

export const forkAsync = (
  modulePath: string,
  args: string[],
  options?: ForkOptions,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = fork(modulePath, args, options);
    let stderr = '';
    let stdout = '';

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const errorMsg = [
          `Process exited with code ${code}`,
          stderr && `stderr: ${stderr.trim()}`,
          stdout && `stdout: ${stdout.trim()}`,
        ].filter(Boolean).join('\n');
        reject(new Error(errorMsg));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};
