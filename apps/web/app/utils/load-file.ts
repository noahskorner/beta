import fs from 'fs/promises';
import path from 'path';

export async function loadFile(filename: string) {
  const filePath = path.join(process.cwd(), 'content', filename);
  return await fs.readFile(filePath, 'utf8');
}
