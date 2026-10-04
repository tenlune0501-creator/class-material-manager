import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
 testDir:'./e2e', testMatch:['mobile-pwa.spec.ts','lesson-first.spec.ts','viewer.spec.ts','voice-first.spec.ts','tts-speech.spec.ts'], workers:1, timeout:90000,
 expect:{timeout:30000}, reporter:[['list']],
 use:{baseURL:'http://localhost:3015',storageState:existsSync('e2e/.auth/user.json')?'e2e/.auth/user.json':undefined,trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --port 3015',cwd:'viewer',port:3015,reuseExistingServer:true,timeout:120000,env:{SUPABASE_SERVICE_ROLE_KEY:'',GH_DISPATCH_TOKEN:''}}
});
