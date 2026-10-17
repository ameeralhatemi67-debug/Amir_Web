import sharp from 'sharp';
import {mkdir,writeFile,stat} from 'node:fs/promises';
const assets=[
 ['hadayah-live','.local/project-captures/hadayah-organization.png','https://stream-application-ten.vercel.app/#/feed','Public organization archive; educational YouTube thumbnails, no private account records.'],
 ['comms-hub','D:/Agents/main/projects/ideas/Comms_Hub/design-review/screenshots/C-work-1440.png','Comms_Hub/design-review/screenshots/C-work-1440.png','Source-project design review with explicitly labeled sample data; not a signed-in production capture.'],
 ['nbc','.local/project-captures/nbc.png','https://nbc-web-two.vercel.app/','Public landing page.'],
 ['bookquest','.local/project-captures/bookquest.png','https://book-quest-ecru.vercel.app/','Public Marginalia closed-alpha landing page.'],
 ['hedayah-dashboard','.local/project-captures/hedayah-globe.png','https://hedayah-dashboard.vercel.app/','Geographic scene, cropped to exclude beneficiary activity ticker.'],
 ['hida','D:/Agents/main/projects/hida/web/assets/hida_preview.png','hida/web/assets/hida_preview.png','Existing source-project preview; no conversations or personal records.'],
 ['comms-hub-login','.local/project-captures/comms-hub.png','https://comms-hub-three.vercel.app/','Public sign-in page with empty inputs.'],
];
await mkdir('public/images/projects',{recursive:true});
const manifest=[];
for(const [slug,path,origin,note] of assets){
 const meta=await sharp(path).metadata();
 const width=Math.min(meta.width,1600);
 for(const [suffix,size] of [['',width],['-small',640]]){
  const output=`public/images/projects/${slug}${suffix}.webp`;
  await sharp(path).resize({width:size,withoutEnlargement:true}).webp({quality:83}).toFile(output);
  if((await stat(output)).size>=300_000)throw Error(`${output} exceeds image budget`);
 }
 manifest.push({asset:`${slug}.webp`,origin,note,width,height:Math.round(meta.height*width/meta.width),AI_generated:false});
}
await writeFile('public/images/projects/provenance.json',JSON.stringify(manifest,null,2));
console.log(`Imported ${assets.length} real project images, each with a 640px responsive variant.`);
