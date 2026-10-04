import {test, expect} from '@playwright/test';
import {mockTutor, lessonPath} from './helpers/tutor-mocks';
import {semanticReply} from '../tests/fixtures/tts-semantic-reply';
import {chunkTextForSpeech} from '../viewer/lib/tutor/tts-chunking';

for (const fail of [false, true]) {
 test(`Melo speech copy and ordered queue: ${fail ? 'middle 502' : 'complete reply'}`, async ({page}) => {
  await mockTutor(page);
  await page.addInitScript(() => {
   Object.defineProperty(window, 'Audio', {value:class {
    onended: null | (()=>void) = null; onerror = null;
    play(){setTimeout(()=>this.onended?.(),10);return Promise.resolve();}
    pause(){} removeAttribute(){} load(){}
   }});
  });
  const requests:string[]=[];
  await page.route('**/synthesize', async route => {
   requests.push(route.request().postDataJSON().text);
   await route.fulfill(fail && requests.length===3
    ? {status:502,json:{detail:'TTS 합성 실패'}}
    : {contentType:'audio/wav',body:Buffer.from('mock audio')});
  });
  await page.route('**/api/tutor/session/*/message', route=>route.fulfill({json:{reply:semanticReply}}));
  await page.setViewportSize({width:1440,height:960});
  await page.goto(lessonPath);
  await page.getByRole('switch',{name:'음성 대화',exact:true}).check();
  await expect(page.getByRole('button',{name:'말하기 시작',exact:true})).toBeEnabled();
  requests.length=0;
  await page.getByLabel('텍스트로 질문').fill('시맨틱 태그 설명');
  await page.getByRole('button',{name:'전송',exact:true}).click();
  await expect.poll(()=>requests.length).toBe(fail?3:6);
  await expect(page.getByRole('button',{name:'말하기 시작',exact:true})).toBeEnabled();
  expect(requests).toEqual(chunkTextForSpeech(semanticReply).slice(0,fail?3:6));
  await expect(page.getByRole('button',{name:'대화 기록 보기'})).toHaveAttribute('aria-expanded','false');
  if(fail) await expect(page.getByText('MeloTTS 합성 실패 (502)',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'대화 기록 보기'}).click();
  const history=page.getByRole('region',{name:'대화 기록',exact:true});
  await expect(history).toContainText('디아이브이+id');
  await expect(history).not.toContainText('플러스 아이디');
 });
}
