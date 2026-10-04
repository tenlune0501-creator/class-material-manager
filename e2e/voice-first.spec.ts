import { test, expect, type Page } from '@playwright/test';
import { mockTutor, lessonPath } from './helpers/tutor-mocks';

const longReply = Array.from({length: 25}, (_, i) => `문단 ${i}: 긴 설명과 여러 문장을 읽으며 과거 대화를 확인합니다.\n\n- 목록 항목 하나\n- 목록 항목 둘`).join('\n\n')
  + '\n\nhttps://example.com/' + 'identifier'.repeat(40)
  + '\n\n```typescript\nconst ' + 'longIdentifier'.repeat(40) + ' = 1;\n```\n\n최신 답변 끝';

async function visibleControl(page: Page) {
  const control = page.getByRole('button', {name: /말하기 시작/}).first();
  await expect(control).toBeInViewport({ratio: 1});
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const [width, height] of [[390,844],[430,932],[768,1024],[820,1180],[1280,900],[1366,900],[1400,960],[1440,960]]) {
  test(`Voice-first history: ${width}px, long turns, scroll follow and state preservation`, async ({page}) => {
    await mockTutor(page);
    let starts = 0, sent = 0;
    page.on('request', r => { if (r.url().endsWith('/session/start')) starts++; });
    await page.route('**/api/tutor/session/*/message', route => route.fulfill({json:{reply: `${++sent}번째 답변\n\n${longReply}`}}));
    await page.setViewportSize({width,height});
    await page.goto(lessonPath);
    await visibleControl(page);
    const initialStarts = starts;
    if (width < 900) {
      await expect(page.getByRole('region', {name:'음성 Tutor'})).toBeInViewport({ratio:1});
      await page.getByRole('button', {name:'상세 · 입력'}).click();
      await page.getByRole('switch', {name:'AI 음성 응답'}).uncheck();
    }
    const toggle = page.getByRole('button', {name:'대화 기록 보기'});
    const history = page.getByRole('region', {name:'대화 기록', exact:true});
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(history).toHaveCount(0);
    const send = async (text:string) => {
      await page.getByLabel('텍스트로 질문').fill(text);
      await page.getByRole('button',{name:'전송',exact:true}).click();
      await expect(page.getByRole('button',{name:'전송',exact:true})).toBeDisabled();
      await expect(page.getByRole('button',{name:/말하기 시작/}).first()).toBeEnabled();
    };
    await send('첫 질문');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await visibleControl(page);
    await page.getByLabel('텍스트로 질문').fill('보존할 초안');
    await toggle.click();
    await expect(history).toBeVisible();
    await expect.poll(() => history.evaluate(e => e.scrollHeight > e.clientHeight * 2)).toBe(true);
    const gap = () => history.evaluate(e => e.scrollHeight - e.clientHeight - e.scrollTop);
    await expect.poll(gap).toBeLessThan(2);
    await expect(page.getByLabel('텍스트로 질문')).toHaveValue('보존할 초안');
    await visibleControl(page);
    await expect.poll(() => history.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
    await expect.poll(() => history.locator('pre').first().evaluate(e => e.scrollWidth > e.clientWidth)).toBe(true);
    await page.screenshot({path:`test-results/mobile/voice-first-${width}.png`,animations:'disabled'});
    await send('최신에서 둘째 질문');
    await expect.poll(gap).toBeLessThan(2);
    await history.evaluate(e => { e.scrollTop = 20; e.dispatchEvent(new Event('scroll')); });
    await history.focus();
    await expect(history).toBeFocused();
    const older = await history.evaluate(e => e.scrollTop);
    await send('과거 읽는 중 셋째 질문');
    await expect.poll(() => history.evaluate(e => e.scrollTop)).toBe(older);
    await page.getByRole('button',{name:'대화 기록 닫기'}).click();
    await expect(history).toHaveCount(0);
    await page.getByRole('button',{name:'대화 기록 보기'}).click();
    await expect(history).toContainText('첫 질문');
    await expect(history).toContainText('3번째 답변');
    await expect.poll(() => history.evaluate(e => e.scrollTop)).toBe(older);
    await visibleControl(page);
    await expect(page.getByRole('button',{name:/^학습 종료/})).toBeInViewport({ratio:1});
    expect(starts).toBe(initialStarts);
    if (width >= 900 && width < 1400) await expect(page.getByRole('dialog',{name:'AI Tutor'})).toBeVisible();
    if (width >= 1400) expect((await page.locator('[aria-label="AI Tutor"]').boundingBox())!.width).toBe(380);
  });
}

test('history toggle never cancels manual recording, transcribing, thinking or speaking', async ({page}) => {
  await mockTutor(page);
  let stt = 0, messages = 0, releaseStt!:()=>void, releaseReply!:()=>void;
  await page.route('**/api/tutor/stt', async route => {
    stt++; await new Promise<void>(resolve => releaseStt = resolve); await route.fulfill({json:{text:'한 번만 보내기'}});
  });
  await page.route('**/api/tutor/session/*/message', async route => {
    messages++; await new Promise<void>(resolve => releaseReply = resolve); await route.fulfill({json:{reply:longReply}});
  });
  await page.setViewportSize({width:390,height:844}); await page.goto(lessonPath);
  await page.getByRole('button',{name:'상세 · 입력'}).click();
  const toggleTwice = async () => {
    const toggle = async () => {
      await page.getByRole('button',{name:'대화 기록 보기'}).click();
      await page.getByRole('button',{name:'대화 기록 닫기'}).click();
    };
    await toggle();
    for (const width of [1280,1440]) {
      await page.setViewportSize({width,height:900});
      await toggle();
      if (await page.getByRole('button',{name:'음성 중지',exact:true}).count()) {
        await expect(page.getByRole('button',{name:'말하기 시작',exact:true})).toBeDisabled();
        await expect(page.getByRole('button',{name:'음성 중지',exact:true})).toBeInViewport({ratio:1});
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'상세 · 입력'}).click();
  };
  await page.getByRole('button',{name:'🎙 말하기 시작',exact:true}).click();
  await toggleTwice();
  expect(stt).toBe(0);
  expect(await page.evaluate(() => (window as any).__voice.recordings[0].state)).toBe('recording');
  await page.getByRole('button',{name:'■ 말하기 종료'}).click();
  await expect(page.getByRole('status')).toContainText('변환'); await toggleTwice(); releaseStt();
  await expect(page.getByRole('status')).toContainText('생각'); await toggleTwice(); releaseReply();
  await expect(page.getByRole('button',{name:'■ AI 답변 중지'})).toBeInViewport({ratio:1});
  await toggleTwice();
  await expect(page.getByRole('button',{name:'■ AI 답변 중지'})).toBeVisible();
  await expect(page.getByRole('button',{name:/말하기 시작/})).toHaveCount(0);
  await page.getByRole('button',{name:'■ AI 답변 중지'}).click();
  await expect(page.getByRole('button',{name:'🎙 말하기 시작',exact:true})).toBeEnabled();
  expect(stt).toBe(1); expect(messages).toBe(1);
  expect(await page.evaluate(() => (window as any).__voice.recordings.length)).toBe(1);
});
