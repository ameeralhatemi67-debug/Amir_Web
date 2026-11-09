import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Mobile Lighthouse on every indexable page in both languages (npm run preview must be running).
await mkdir('qa/lighthouse',{recursive:true});
await mkdir('.local',{recursive:true});
const content = JSON.parse(await readFile('src/os/content.json','utf8'));
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7);
// Fresh logs prevent chrome-launcher from reading a prior run's debugging port.
const profile = await mkdtemp(resolve('.local/lighthouse-'));
const chrome = await chromeLauncher.launch({ chromePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', userDataDir:profile, chromeFlags:['--headless','--no-first-run','--disable-dev-shm-usage','--no-sandbox'] });
const slugs=['','projects/','films/','lab/','about/','contact/','privacy/',...content.projects.map(p=>`projects/${p.slug}/`)].filter(path => !only || path.includes(only));
const results=[];
try {
  for(const lang of ['en','ar']) for(const path of slugs) {
    const url=`http://127.0.0.1:4321/${lang}/${path}`;
    const result=await lighthouse(url,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1,disabled:false},chromeFlags:['--headless']});
    const scores=Object.fromEntries(Object.entries(result.lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)]));
    const metrics=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id=>[id,result.lhr.audits[id]?.displayValue]));
    const failed=Object.entries(result.lhr.audits).filter(([,value])=>value.score !== null && value.score < 1 && value.scoreDisplayMode !== 'informative' && value.scoreDisplayMode !== 'manual').map(([id,value])=>({id,title:value.title,score:value.score,display:value.displayValue}));
    results.push({url,scores,metrics,failed});
    await writeFile(`qa/lighthouse/${lang}-${path.replaceAll('/','-') || 'home'}.json`,result.report);
    if (!only) await writeFile('qa/lighthouse-summary.json',JSON.stringify(results,null,2));
    console.log(`${lang}/${path || 'home'} ${JSON.stringify(scores)} ${JSON.stringify(metrics)}`);
  }
  const below=results.filter(item=>Object.values(item.scores).some(score=>score<95));
  console.log(`${results.length} mobile pages audited; ${below.length} below 95 in any category.`);
  if(below.length)process.exitCode=1;
} finally { chrome.kill(); }
