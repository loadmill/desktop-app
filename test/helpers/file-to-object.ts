import fs from 'fs';
import path from 'path';

export const importJSONResource = <T>(relativePath: string): T => {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname, relativePath),
    ).toString(),
  );
};
