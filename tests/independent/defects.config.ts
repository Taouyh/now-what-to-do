import base from './config';
import {defineConfig} from '@playwright/test';
export default defineConfig({...base,testMatch:'defects.spec.ts',timeout:30000,
 outputDir:'../../docs/development/book-c-2026-11-05/independent-evidence/defect-results',
 reporter:[['list'],['json',{outputFile:'docs/development/book-c-2026-11-05/independent-evidence/defect-results.json'}]],
});
