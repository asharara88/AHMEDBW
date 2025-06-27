import fs from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve('src');

function walk(dir: string, files: string[] = []): string[] {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function relativeImportPath(from: string): string {
  const relativePath = path.relative(path.dirname(from), path.join(SRC_ROOT, 'utils', 'logger'));
  const formatted = relativePath.startsWith('.') ? relativePath : './' + relativePath;
  return formatted.replace(/\\/g, '/');
}

const files = walk(SRC_ROOT);

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('console.error')) return;

  let updatedContent = content.replace(/console\.error/g, 'logError');

  const alreadyHasImport = /import\s+{\s*(?:[^{}]*,\s*)?logError(?:\s*,[^{}]*)?}\s+from/.test(updatedContent);
  if (!alreadyHasImport && updatedContent.includes('logError')) {
    const importPath = relativeImportPath(file);
    const importStatement = `import { logError } from '${importPath}';\n`;
    updatedContent = importStatement + updatedContent;
  }

  fs.writeFileSync(file, updatedContent, 'utf8');
  console.log(`✔ Updated ${file}`);
});

console.log('Finished replacing console.error with logError in all TypeScript files');