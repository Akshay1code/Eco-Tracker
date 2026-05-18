import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFileFromPath(envPath) {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());
    process.env[key] = value;
  }

  return true;
}

function loadLocalEnvFile() {
  const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
  const candidateFiles = ['.env', ',env'];

  for (const fileName of candidateFiles) {
    const didLoad = loadEnvFileFromPath(path.join(backendDirectory, fileName));
    if (didLoad) {
      return;
    }
  }
}

loadLocalEnvFile();
