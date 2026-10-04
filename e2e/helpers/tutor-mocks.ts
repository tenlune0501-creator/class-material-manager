import type { Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
export const lessonPath = '/lesson/web-foundations/html-structure/semantic-tags';
export const lesson={id:'web-foundations/html-structure/semantic-tags',title:'HTML5 시맨틱 태그',trackTitle:'웹 기초',chapterTitle:'HTML 구조'};
export async function mockTutor(page: Page) {
 await mkdir('test-results/mobile',{recursive:true});
 await page.addInitScript(()=>{
  const voice:any={ utterances:[], tracks:0, permission:'allow', recordings:[], deferSTT:false };
  (window as any).__voice=voice;
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'ko-KR',localService:true,default:true}],addEventListener(){},removeEventListener(){},speak(u:any){voice.utterances.push(u);},cancel(){}}});
  Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class { constructor(public text:string){} }});
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{
   if(voice.permission==='deny') throw new DOMException('denied','NotAllowedError');
   if(voice.permission==='pending') await new Promise(r=>voice.allow=r);
   return {getTracks:()=>[{stop(){voice.tracks++;}}]};
  }});
  Object.defineProperty(window,'MediaRecorder',{value:class {
   static isTypeSupported(t:string){return t==='audio/webm;codecs=opus';}
   state='inactive'; mimeType='audio/webm;codecs=opus'; ondataavailable:any; onstop:any; onerror:any;
   constructor(){voice.recordings.push(this);}
   start(){this.state='recording';}
   stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['audio'],{type:this.mimeType})});this.onstop?.();});}
  }});
 });
 await page.route('**/api/tutor/**', async route=>{
  const url=new URL(route.request().url()).pathname;
  let data:any={};
  if(url.endsWith('/resume')) data={lastSession:null,inProgressLesson:lesson,nextLesson:lesson,dueReviewCount:0,dueReviewItems:[],allLessons:[lesson],lessonProgress:[]};
  if(url.endsWith('/start')) data={session:{id:'mock-session'},lesson,resumed:false};
  if(url.endsWith('/message')) data={reply:'시맨틱 태그는 콘텐츠의 의미를 나타냅니다. header와 main을 사용해 구조를 표현해 보세요.'};
  if(url.endsWith('/stt')) data={text:'네'};
  if(url.endsWith('/summarize')) data={draft:{completionStatus:'learning',todaySummary:'시맨틱 태그를 학습했습니다.',confusingPoints:[],reviewCandidates:[],nextStartNote:'다음 예제',suggestedNextLesson:null}};
  await route.fulfill({json:data});
 });

}
