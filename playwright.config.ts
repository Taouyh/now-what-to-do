import { defineConfig } from '@playwright/test';
const port = Number(process.env.BOOK_TEST_PORT || 8766);
export default defineConfig({
  testDir: './tests/e2e', timeout: 30000, fullyParallel: true, workers: 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:${port}`, channel: 'msedge', locale: 'zh-CN', viewport: { width: 1600, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve-web.cjs', port, env: { PORT: String(port) }, reuseExistingServer: false },
});
