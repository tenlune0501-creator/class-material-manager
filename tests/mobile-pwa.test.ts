import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { desktopDestination, mobileDestination, mobileLessonHref } from '../viewer/lib/navigation.ts';
import { recordingFilename, recordingMime, MAX_STT_AUDIO_BYTES } from '../viewer/lib/tutor/recording.ts';
import { readTutorResponse } from '../viewer/lib/tutor/response.ts';

describe('mobile route and upload contracts',()=>{
 it('preserves desktop lesson semantics and mobile selection without creating a new route',()=>{
  for(const path of ['/lesson/web/html','/lesson/%ED%95%9C%EA%B8%80']){
   assert.equal(desktopDestination(path),'curriculum');assert.equal(mobileDestination(path),'lesson');assert.equal(mobileLessonHref(path),path);
  }
  assert.equal(mobileLessonHref('/curriculum'),'/tutor');assert.equal(mobileDestination('/tutor'),'lesson');
  assert.equal(desktopDestination('/unit/project/unit'),'projects');
  assert.equal(mobileDestination('/projects/a'),'more');assert.equal(mobileDestination('/curriculum/a'),'curriculum');
 });
 it('negotiates supported recorder format and uses matching upload extensions',()=>{
  assert.equal(recordingMime(t=>t==='audio/mp4'),'audio/mp4');assert.equal(recordingMime(()=>false),undefined);
  for(const [mime,name] of [['audio/webm;codecs=opus','recording.webm'],['audio/mp4','recording.m4a'],['audio/ogg;codecs=opus','recording.ogg']])assert.equal(recordingFilename(mime),name);
  assert.ok(MAX_STT_AUDIO_BYTES < 4_500_000);
 });
 it('API expiry and non-JSON responses have meaningful errors',async()=>{
  await assert.rejects(readTutorResponse(new Response('<html>login</html>',{status:401})),/로그인/);
  await assert.rejects(readTutorResponse(new Response('too large',{status:413})),/너무 큽니다/);
  assert.deepEqual(await readTutorResponse(Response.json({text:'네'})),{text:'네'});
 });
});

describe('service worker update isolation',()=>{
 it('only caches same-origin build assets, bypasses HTML/API/manifest/icons without reload',async()=>{
  const script=await readFile('viewer/public/sw.js','utf8');
  const handlers:Record<string,Function>={};const deleted:string[]=[];
  const self={location:{origin:'https://cmm.example'},addEventListener:(name:string,fn:Function)=>handlers[name]=fn,skipWaiting:()=>{},clients:{claim:async()=>{}}};
  const caches={keys:async()=>['cmm-tutor-static-v1','cmm-tutor-static-v2','other-app'],delete:async(key:string)=>{deleted.push(key);},open:async()=>({match:async()=>null,put:()=>{}})};
  const cacheable=runInNewContext(script+'\nisCacheableStaticAsset',{self,caches,URL,fetch:async()=>new Response('asset')});
  for(const url of ['/lesson/a','/api/tutor/stt','/manifest.webmanifest','/icon-192.png'])assert.equal(cacheable(new URL(url,self.location.origin)),false);
  assert.equal(cacheable(new URL('/_next/static/hash.js',self.location.origin)),true);
  assert.equal(cacheable(new URL('https://external.example/_next/static/hash.js')),false);
  for(const [method,mode,url] of [['POST','cors','/api/tutor/stt'],['GET','navigate','/_next/static/fake'],['GET','cors','/manifest.webmanifest']])handlers.fetch({request:{method,mode,url:self.location.origin+url},respondWith:()=>assert.fail('must bypass')});
  await new Promise(resolve=>handlers.activate({waitUntil:(p:Promise<void>)=>p.then(resolve)}));
  assert.deepEqual(deleted,['cmm-tutor-static-v1']);assert.ok(!script.includes('reload('));
 });
});
