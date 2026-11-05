import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 30000, fullyParallel: true, workers: 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:8766', channel: 'msedge', locale: 'zh-CN', viewport: { width: 1600, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve-web.cjs', port: 8766, env: { PORT: '8766' }, reuseExistingServer: false },
});
