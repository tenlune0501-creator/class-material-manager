/** Real Lesson/Markdown/AppShell in Chromium; Tutor APIs and media are deterministic mocks.
 * Requires existing local e2e/.auth/user.json. No learning records are written.
 * Run: npx playwright test --config playwright.mobile.config.ts
 */
import { test, expect } from '@playwright/test';
import { mockTutor, lesson, lessonPath as path } from './helpers/tutor-mocks';

test.beforeEach(async({page}) => mockTutor(page));

async function enter(page:any,width=390,height=844){
 await page.setViewportSize({width,height});
 await page.goto(path);
 test.skip(new URL(page.url()).pathname==='/login','Saved authentication missing/expired; refresh via existing auth setup.');
 await expect(page.getByRole('heading',{name:lesson.title,exact:true})).toBeVisible();
 await expect(page.getByRole('button', {name: /말하기 시작/}).first()).toBeVisible();
}

test('16 viewports: one controller, mobile/overlay/push boundaries, no horizontal overflow',async({page})=>{
 let starts=0;page.on('request',r=>{if(r.url().endsWith('/session/start'))starts++;});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await enter(page);
 const count=starts;
 const viewports=[[390,844],[430,932],[844,390],[768,1024],[820,1180],[899,1000],[900,1000],[901,1000],[1024,900],[1280,900],[1366,900],[1399,900],[1400,900],[1401,900],[1440,960],[1536,960]];
 for(const [width,height] of viewports){
  await page.setViewportSize({width,height});
  if(width<900){
   await expect(page.getByRole('navigation',{name:'주요 탐색'})).toBeVisible();
   await expect(page.getByRole('region',{name:'음성 Tutor'})).toBeVisible();
   await expect(page.locator('main [inert]')).toHaveCount(0);
   await expect(page.getByRole('link',{name:'수업',exact:true})).toHaveAttribute('aria-current','page');
  } else {
   await expect(page.getByRole('navigation',{name:'주요 탐색'})).toHaveCount(0);
   if(width<1400) await expect(page.getByRole('dialog',{name:'AI Tutor'})).toBeVisible();
   else {await expect(page.getByRole('dialog',{name:'AI Tutor'})).toHaveCount(0);await expect(page.locator('main [inert]')).toHaveCount(0);}
  }
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({animations:"disabled",path:`test-results/mobile/viewport-${width}x${height}.png`});
 }
 expect(starts).toBe(count);expect(errors).toEqual([]);
});

test('sheets preserve scroll, text/history and summary draft through resizing',async({page})=>{
 await enter(page);
 await page.evaluate(()=>window.scrollTo(0,1200));const scroll=await page.evaluate(()=>scrollY);
 await page.getByRole('button',{name:'더보기',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'더보기'})).toBeVisible();
 await page.screenshot({animations:"disabled",path:'test-results/mobile/more.png'});
 await page.getByRole('button',{name:'닫기',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(scroll);
 await page.getByRole('link',{name:'수업',exact:true}).click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(scroll);
 await page.getByRole('button',{name:'상세 · 입력'}).click();
 await page.getByLabel('텍스트로 질문').fill('텍스트 질문 보존');
 await page.screenshot({animations:"disabled",path:'test-results/mobile/detail.png'});
 await page.getByRole('button',{name:'접기',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(scroll);
 await page.setViewportSize({width:1440,height:960});
 await expect(page.locator('textarea').filter({visible:true}).first()).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'상세 · 입력'}).click();
 await expect(page.getByLabel('텍스트로 질문')).toHaveValue('텍스트 질문 보존');
 await page.getByRole('button',{name:'학습 종료 · 요약'}).click();
 await expect(page.getByLabel('오늘 배운 내용')).toHaveValue('시맨틱 태그를 학습했습니다.');
 await page.getByLabel('오늘 배운 내용').fill('편집한 요약을 유지합니다.');
 await page.setViewportSize({width:1440,height:960});
 await expect(page.getByLabel('오늘 배운 내용')).toHaveValue('편집한 요약을 유지합니다.');
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByLabel('오늘 배운 내용')).toHaveValue('편집한 요약을 유지합니다.');
 await page.screenshot({animations:"disabled",path:'test-results/mobile/summary.png'});
 await page.getByRole('button',{name:/저장하고/}).click();
 await expect(page.getByText('✅ 저장했습니다')).toBeVisible();
});

test('manual voice, collapse while recording, TTS stop, permission denial/pending, hidden cancellation',async({page})=>{
 let stt=0,messages=0;page.on('request',r=>{if(r.url().endsWith('/stt'))stt++;if(r.url().endsWith('/message'))messages++;});
 await enter(page);
 await page.getByRole('button',{name:'🎙 말하기 시작',exact:true}).click();
 await expect(page.getByRole('button',{name:'■ 말하기 종료',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'상세 · 입력'}).click();await page.getByRole('button',{name:'접기',exact:true}).click();
 expect(stt).toBe(0);
 await page.screenshot({animations:"disabled",path:'test-results/mobile/recording.png'});
 await page.getByRole('button',{name:'■ 말하기 종료',exact:true}).click();
 await expect(page.getByRole('button',{name:'■ AI 답변 중지'})).toBeVisible();
 expect(stt).toBe(1);expect(messages).toBe(1);
 await page.getByRole('button',{name:'■ AI 답변 중지'}).click();
 await expect(page.getByRole('button',{name:'🎙 말하기 시작',exact:true})).toBeEnabled();
 expect(await page.evaluate(()=>(window as any).__voice.recordings.length)).toBe(1);
 await page.evaluate(()=>(window as any).__voice.permission='deny');
 await page.getByRole('button',{name:'🎙 말하기 시작',exact:true}).click();
 await expect(page.getByRole('alert').filter({hasText:'권한이 거부'})).toBeVisible();
 await page.evaluate(()=>(window as any).__voice.permission='pending');
 await page.getByRole('button',{name:'🎙 말하기 시작',exact:true}).click();
 await expect(page.getByRole('button',{name:'권한 확인 중…',exact:true})).toBeDisabled();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));(window as any).__voice.allow();});
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.getByRole('button',{name:'🎙 말하기 시작',exact:true})).toBeEnabled();
 expect(await page.evaluate(()=>(window as any).__voice.recordings.length)).toBe(1);
 await page.evaluate(()=>(window as any).__voice.permission='allow');
 await page.getByRole('button',{name:'🎙 말하기 시작',exact:true}).click();
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange'))); // visible event is harmless
 await expect(page.getByRole('button',{name:'■ 말하기 종료',exact:true})).toBeVisible();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 expect(stt).toBe(1);
 await expect(page.getByRole('alert').filter({hasText:'백그라운드'})).toBeVisible();
});

test('end of Lesson clears fixed HUD/navigation; manifest and unauthenticated API contracts',async({page,playwright})=>{
 await enter(page);await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
 const last=page.getByRole('link',{name:/원문 열기/}).last();
 expect((await last.boundingBox())!.y+(await last.boundingBox())!.height).toBeLessThan((await page.getByRole('region',{name:'음성 Tutor'}).boundingBox())!.y);
 await page.screenshot({animations:"disabled",path:'test-results/mobile/lesson-end.png'});
 const request=await playwright.request.newContext({baseURL:'http://localhost:3015',storageState:{cookies:[],origins:[]}});
 const res=await request.get('/manifest.webmanifest');expect(res.status()).toBe(200);expect((await res.json()).start_url).toBe('/tutor');
 const auth=await request.post('/api/tutor/stt');expect(auth.status()).toBe(401);expect((await auth.json()).code).toBe('AUTH_REQUIRED');
 await request.dispose();
});


test('transcribing/thinking/speaking surfaces, auth expiry, text fallback and history',async({page})=>{
 await enter(page);
 let releaseStt!:()=>void,releaseMessage!:()=>void;
 await page.route('**/api/tutor/stt',async route=>{await new Promise<void>(r=>releaseStt=r);await route.fulfill({json:{text:'네'}});});
 await page.route('**/api/tutor/session/*/message',async route=>{await new Promise<void>(r=>releaseMessage=r);await route.fulfill({json:{reply:'대화 기록을 보존하는 답변입니다.'}});});
 await page.getByRole('button',{name:'🎙 말하기 시작',exact:true}).click();
 await page.getByRole('button',{name:'■ 말하기 종료',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('변환');
 await page.screenshot({animations:'disabled',path:'test-results/mobile/transcribing.png'});
 releaseStt();
 await expect(page.getByRole('status')).toContainText('생각');
 await page.screenshot({animations:'disabled',path:'test-results/mobile/thinking.png'});
 releaseMessage();
 await expect(page.getByRole('button',{name:'■ AI 답변 중지'})).toBeVisible();
 await page.screenshot({animations:'disabled',path:'test-results/mobile/speaking.png'});
 await page.evaluate(()=>{const u=(window as any).__voice.utterances.at(-1);u.onend();});
 await expect(page.getByRole('button',{name:'🎙 말하기 시작',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'상세 · 입력'}).click();
 await page.getByRole('button',{name:'대화 기록 보기'}).click();
 await expect(page.getByText('대화 기록을 보존하는 답변입니다.',{exact:true})).toBeVisible();
 await page.route('**/api/tutor/session/*/message',async route=>{await route.fulfill({status:401,json:{error:'로그인이 만료되었습니다.'}});});
 await page.getByLabel('텍스트로 질문').fill('인증 만료 확인');await page.getByRole('button',{name:'전송',exact:true}).click();
 await expect(page.getByRole('button',{name:'다시 로그인'})).toBeVisible();
 await page.screenshot({animations:'disabled',path:'test-results/mobile/auth-expired.png'});
});

test('Desktop panel close/open preserves text, controller and scroll at overlay and push widths',async({page})=>{
 let starts=0;page.on('request',r=>{if(r.url().endsWith('/session/start'))starts++;});
 await enter(page,1280,900);const initialStarts=starts;
 for(const width of [1280,1440]){
  await page.setViewportSize({width,height:900});
  const input=page.locator('textarea').filter({visible:true}).first();
  await input.fill('Desktop 대화 입력 보존');
  await page.evaluate(()=>window.scrollTo(0,800));const y=await page.evaluate(()=>scrollY);
  await page.getByRole('button',{name:'Tutor 패널 접기'}).click();
  await page.getByRole('button',{name:'🎧 AI Tutor',exact:true}).waitFor();
  // Push changes Lesson width and browser scroll anchoring follows text reflow.
  if(width<1400) await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(y);
  // The reopen button is above the viewport. Use its restored keyboard focus;
  // Playwright pointer click would intentionally scroll it into view first.
  await expect(page.getByRole('button',{name:'🎧 AI Tutor',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Desktop 대화 입력 보존');
  // Push changes Lesson width and browser scroll anchoring follows text reflow.
  if(width<1400) await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(y);
 }
 expect(starts).toBe(initialStarts);
});
