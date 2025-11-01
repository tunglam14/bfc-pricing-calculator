import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Plugin để copy i18n files vào dist/i18n/
const copyI18nFiles = () => {
  return {
    name: 'copy-i18n-files',
    writeBundle() {
      const i18nDir = join(process.cwd(), 'i18n');
      const distI18nDir = join(process.cwd(), 'dist', 'i18n');
      
      if (existsSync(i18nDir)) {
        // Tạo thư mục dist/i18n nếu chưa tồn tại
        if (!existsSync(distI18nDir)) {
          mkdirSync(distI18nDir, { recursive: true });
        }
        
        // Copy tất cả file .json từ i18n/ vào dist/i18n/
        const files = readdirSync(i18nDir);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            const srcPath = join(i18nDir, file);
            const destPath = join(distI18nDir, file);
            if (statSync(srcPath).isFile()) {
              copyFileSync(srcPath, destPath);
              console.log(`Copied ${file} to dist/i18n/`);
            }
          }
        });
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyI18nFiles()
  ],
});
