import { existsSync } from 'node:fs';
import {
  copyFile,
  mkdir,
  readFile,
  rm,
  unlink,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';

const dirs = ['.vscode'];
const files = [
  'eslint.config.js',
  '.prettierrc.cjs',
  'tsconfig.json',
  '.vscode/settings.json',
  '.vscode/extensions.json',
];
const overridableFiles: [string, (content: string) => boolean][] = [];
const legacyFiles = ['.prettierrc', '.prettierrc.json', '.eslintrc.json'];

export async function prepare() {
  await rm('template', { recursive: true, force: true });
  await mkdir('template');
  await Promise.all(
    dirs.map((dir) => mkdir(join('template', dir), { recursive: true }))
  );
  await Promise.all(
    [...files, ...overridableFiles.map((f) => f[0])].map((file) =>
      copyFile(file, join('template', file))
    )
  );
  await writeFile(
    'template/gitignore',
    [
      '.DS_Store',
      '.idea/',
      '.vscode/',
      'node_modules/',
      '*.js',
      '*.js.map',
      '*.d.ts',
      '.timestamps.json',
      'test/results/',
      '!.prettierrc.cjs',
      '!eslint.config.js',
    ].join('\n')
  );
}

export async function setup(targetDir: string) {
  await Promise.all(
    legacyFiles.map((file) => ensureUnlinked(join(targetDir, file)))
  );
  await Promise.all(
    dirs.map((dir) => mkdir(join(targetDir, dir), { recursive: true }))
  );
  await Promise.all(
    files.map((file) => {
      const dest = join(targetDir, file);
      if (!existsSync(dest)) {
        copyFile(join('template', file), dest);
      }
    })
  );
  if (!targetDir.endsWith(join('riddance', 'node-env'))) {
    await copyFile('template/gitignore', join(targetDir, '.gitignore'));
  }
  for (const [file, belongsHere] of overridableFiles) {
    try {
      const existing = await readFile(join(targetDir, file), 'utf-8');
      if (!belongsHere(existing)) {
        continue;
      }
    } catch (e) {
      if (!isFileNotFound(e)) {
        throw e;
      }
    }
    await copyFile(join('template', file), join(targetDir, file));
  }
}

export async function update(targetDir: string) {
  await ensureUnlinked(join(targetDir, '.timestamps.json'));
}

async function ensureUnlinked(path: string) {
  try {
    await unlink(path);
  } catch (e) {
    if (isFileNotFound(e)) {
      return;
    }
    throw e;
  }
}

function isFileNotFound(e: unknown) {
  return (e as { code?: string }).code === 'ENOENT';
}
