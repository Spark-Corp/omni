import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('x-user-id header removal', () => {
  const srcDir = join(process.cwd(), 'src');

  it('should not contain x-user-id header in vendor/settings/page.jsx', () => {
    const filePath = join(srcDir, 'app/vendor/settings/page.jsx');
    const content = readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('x-user-id');
  });

  it('should not contain x-user-id header in vendor/products/page.jsx', () => {
    const filePath = join(srcDir, 'app/vendor/products/page.jsx');
    const content = readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('x-user-id');
  });

  it('should not contain x-user-id header in any source file', () => {
    const { readdirSync, readFileSync: read } = require('fs');
    const { join: j } = require('path');

    function walkDir(dir) {
      const files = [];
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = j(dir, entry.name);
        if (entry.isDirectory()) files.push(...walkDir(full));
        else if (/\.(jsx|tsx|js|ts)$/.test(entry.name)) files.push(full);
      }
      return files;
    }

    const allFiles = walkDir(srcDir);
    for (const file of allFiles) {
      const content = read(file, 'utf-8');
      expect(content).not.toContain('x-user-id');
    }
  });
});
