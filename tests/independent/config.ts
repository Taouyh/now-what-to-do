import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: 'acceptance.spec.ts', timeout: 120000, workers: 1,
  outputDir: '../../docs/development/book-c-2026-11-05/independent-evidence/results',
  reporter: [['list'], ['json', { outputFile: 'docs/development/book-c-2026-11-05/independent-evidence/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:8766', channel: 'msedge', locale: 'zh-CN', timezoneId: 'Asia/Shanghai', viewport: {width:1600,height:1000}, screenshot:'only-on-failure', trace:'retain-on-failure' },
  webServer: {cwd:process.cwd(),command:'node scripts/serve-web.cjs',port:8766,env:{PORT:'8766'},reuseExistingServer:false},
});

