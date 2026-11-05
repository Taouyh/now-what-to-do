import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'layout.spec.ts',workers:1,timeout:45000,
 outputDir:'../../docs/development/book-c-2026-11-05/calendar-independent-evidence/supplemental',
 reporter:[['list'],['json',{outputFile:'docs/development/book-c-2026-11-05/calendar-independent-evidence/supplemental.json'}]],
 use:{baseURL:'http://127.0.0.1:8766',channel:'msedge',locale:'zh-CN',timezoneId:'Asia/Shanghai',viewport:{width:1531,height:715},screenshot:'only-on-failure',trace:'retain-on-failure'},
 webServer:{cwd:process.cwd(),command:'node scripts/serve-web.cjs',port:8766,env:{PORT:'8766'},reuseExistingServer:false}
});
