// Imports real project captures (read-only sources) into responsive WebP sets.
// Every asset was opened and checked for personal data before being listed here.
// Excluded on purpose: Hadayah captures 03/04/56/57 and admin screens, live shots with faces,
// Hida dashboard_preview.png, runtime/artifacts and side_panel_reading_view.png, any Hedayah TV
// activity feed with names, DnFOM prototypes (realistic personal names), HAYZ staging details.
import sharp from 'sharp';
import { mkdir, writeFile, stat, rm } from 'node:fs/promises';

const STREAMER = 'C:/Users/User/Documents/Amir Ob/projects/Ideas/Current/Streamer_app';
const IDEAS = 'D:/Agents/main/projects/ideas';
const PHONE_STATUS_BAR = 96; // recorder timer sits in the Android status bar of the 1080px captures

const assets = [
  // Hadayah Live
  { id: 'hadayah-web-live', src: `${STREAMER}/brief/evidence/2026-10-19/hidayah-gold-web/web-live-video-en.png`, origin: 'Streamer_app/brief/evidence/2026-10-19/hidayah-gold-web/web-live-video-en.png', note: 'Widget-test render of the web build; chat names and viewer count are sample data.' },
  { id: 'hadayah-phone-discovery-en', kind: 'phone', src: `${STREAMER}/brief/evidence/2026-10-19/hidayah-gold-web/phone-discovery-en.png`, origin: 'Streamer_app/brief/evidence/2026-10-19/hidayah-gold-web/phone-discovery-en.png', note: 'Widget-test render, English; seeded demo channels.' },
  { id: 'hadayah-phone-discovery-ar', kind: 'phone', src: `${STREAMER}/brief/evidence/2026-10-19/hidayah-gold-web/phone-discovery-ar.png`, origin: 'Streamer_app/brief/evidence/2026-10-19/hidayah-gold-web/phone-discovery-ar.png', note: 'Widget-test render, Arabic; seeded demo channels.' },
  ...[
    ['hadayah-phone-onboarding', '66_onboarding_welcome_get_started.jpg'],
    ['hadayah-phone-studio', '17_studio_mode_picker_overview.jpg'],
    ['hadayah-phone-camera', '21_studio_phone_camera_setup.jpg'],
    ['hadayah-phone-quality', '24_studio_phone_quality_presets.jpg'],
    ['hadayah-phone-watch', '12_lecture_watch_screen_player_ready.jpg'],
  ].map(([id, file]) => ({ id, kind: 'phone', src: `${STREAMER}/doc/Design_1/phoen_view_2-10-26/${file}`, crop: { left: 0, top: PHONE_STATUS_BAR, width: 1080, height: 2340 - PHONE_STATUS_BAR }, origin: `Streamer_app/doc/Design_1/phoen_view_2-10-26/${file}`, note: 'Android phone capture, 2026-10-02; status bar cropped.' })),
  { id: 'hadayah-archive', src: '.local/project-captures/hadayah-organization.png', origin: 'https://stream-application-ten.vercel.app/#/feed', note: 'Public organization archive; educational YouTube thumbnails, no private account records.' },
  { id: 'hadayah-feature', src: `${STREAMER}/store/assets/feature_graphic_1024x500.png`, origin: 'Streamer_app/store/assets/feature_graphic_1024x500.png', note: 'Google Play feature graphic drafted for the listing.' },
  { id: 'hadayah-icon', kind: 'icon', src: `${STREAMER}/store/assets/icon_512_fullbleed.png`, origin: 'Streamer_app/store/assets/icon_512_fullbleed.png', note: 'App launcher icon.' },

  // Comms Hub (all sample data, labelled in the product)
  { id: 'comms-evening', src: `${IDEAS}/Comms_Hub/qa/artifacts/identity-screens/evening-home.png`, crop: { left: 0, top: 0, width: 1440, height: 1000 }, origin: 'Comms_Hub/qa/artifacts/identity-screens/evening-home.png', note: 'Evening theme home, labelled sample data.' },
  { id: 'comms-day', src: `${IDEAS}/Comms_Hub/qa/artifacts/identity-screens/home-1440.png`, crop: { left: 0, top: 0, width: 1440, height: 1000 }, origin: 'Comms_Hub/qa/artifacts/identity-screens/home-1440.png', note: 'Day theme home, labelled sample data.' },
  { id: 'comms-phone-approval', kind: 'phone', src: `${IDEAS}/Comms_Hub/qa/artifacts/identity-screens/phone-approval-sheet.png`, origin: 'Comms_Hub/qa/artifacts/identity-screens/phone-approval-sheet.png', note: 'Phone approval sheet, sample data.' },
  { id: 'comms-approval-stamp', src: `${IDEAS}/Comms_Hub/qa/artifacts/identity-screens/approval-stamp.png`, origin: 'Comms_Hub/qa/artifacts/identity-screens/approval-stamp.png', note: 'Version approval moment, sample data.' },
  { id: 'comms-calendar', src: `${IDEAS}/Comms_Hub/qa/artifacts/identity-screens/evening-calendar.png`, origin: 'Comms_Hub/qa/artifacts/identity-screens/evening-calendar.png', note: 'Campaign calendar, sample data.' },
  { id: 'comms-film-poster', src: `${IDEAS}/Comms_Hub/videos/comms-hub-launch/output/poster-landscape.png`, origin: 'Comms_Hub/videos/comms-hub-launch/output/poster-landscape.png', note: 'Poster frame of the code-rendered launch film.' },

  // HAYZ: design-reference prototype; review bar (top 52px) cropped, demo strip excluded
  ...[
    ['hayz-dusk-en', 'finish/home-dusk-en.png'],
    ['hayz-day-en', 'finish/home-day-en.png'],
    ['hayz-dusk-ar', 'finish/home-dusk-ar.png'],
    ['hayz-builder', 'v2/builder-3d-en.png'],
  ].map(([id, file]) => ({ id, src: `${IDEAS}/CCTV/design-reference/review/${file}`, crop: { left: 0, top: 52, width: 1440, height: 948 }, origin: `CCTV/design-reference/review/${file}`, note: 'Design-reference prototype with labelled demo data; illustrative property, not a camera feed.' })),
  { id: 'hayz-progress-ar', src: `${IDEAS}/CCTV/design-reference/review/v2/buyer-progress-ar.png`, crop: { left: 0, top: 52, width: 1440, height: 640 }, origin: 'CCTV/design-reference/review/v2/buyer-progress-ar.png', note: 'Buyer progress tracker, Arabic, demo data.' },

  // NBC
  { id: 'nbc-original', src: '.local/project-captures/nbc.png', origin: 'https://nbc-web-two.vercel.app/', note: 'Public landing page, original identity.' },
  { id: 'nbc-official', src: `${IDEAS}/NBC_web/docs/design/2026-10-01-official-identity/first-screen-1440.png`, crop: { left: 0, top: 0, width: 1440, height: 760 }, origin: 'NBC_web/docs/design/2026-10-01-official-identity/first-screen-1440.png', note: 'Official identity first screen; partner logos cropped.' },
  { id: 'nbc-phone-official', kind: 'phone', src: `${IDEAS}/NBC_web/docs/design/2026-10-01-official-identity/first-screen-390.png`, crop: { left: 0, top: 0, width: 390, height: 740 }, origin: 'NBC_web/docs/design/2026-10-01-official-identity/first-screen-390.png', note: 'Official identity on a phone; partner logos cropped.' },
  { id: 'nbc-phone-exam', kind: 'phone', src: `${IDEAS}/NBC_web/test-results/exam/exam-390.png`, origin: 'NBC_web/test-results/exam/exam-390.png', note: 'Practice question with answer feedback.' },
  { id: 'nbc-ceremony', src: `${IDEAS}/NBC_web/design-lab/gate-a/screenshots/ceremony-reveal-1920.jpg`, origin: 'NBC_web/design-lab/gate-a/screenshots/ceremony-reveal-1920.jpg', note: 'Results ceremony screen from the design lab, synthetic data.' },

  // BookQuest (fictional book and readers throughout)
  { id: 'bookquest-landing', src: '.local/project-captures/bookquest.png', origin: 'https://book-quest-ecru.vercel.app/', note: 'Public landing page, titled Marginalia.' },
  { id: 'bookquest-desk', src: `${IDEAS}/BookQuest/.local/showcase/17-home-desk.png`, origin: 'BookQuest/.local/showcase/17-home-desk.png', note: 'Home desk with a fictional sample book.' },
  { id: 'bookquest-map', src: `${IDEAS}/BookQuest/.local/showcase/10-book-map.png`, origin: 'BookQuest/.local/showcase/10-book-map.png', note: 'Reader with the book map open, fictional content.' },
  { id: 'bookquest-prediction', src: `${IDEAS}/BookQuest/.local/showcase/13-prediction-opened.png`, origin: 'BookQuest/.local/showcase/13-prediction-opened.png', note: 'A prediction note opening in the margin, fictional readers.' },
  { id: 'bookquest-phone', kind: 'phone', src: `${IDEAS}/BookQuest/.local/showcase/phone-home.png`, crop: { left: 0, top: 0, width: 390, height: 844 }, origin: 'BookQuest/.local/showcase/phone-home.png', note: 'Phone home, fictional sample book.' },

  // Hedayah TV dashboard: activity feed with names is always excluded
  { id: 'tv-globe', src: '.local/project-captures/hedayah-globe.png', origin: 'https://hedayah-dashboard.vercel.app/', note: 'Geographic scene, cropped to exclude the beneficiary activity ticker.' },
  { id: 'tv-milestones', src: `${IDEAS}/hedayah_dashboard/.layout-check/1920-1080-3.png`, crop: { left: 0, top: 0, width: 1920, height: 1030 }, origin: 'hedayah_dashboard/.layout-check/1920-1080-3.png', note: 'Milestones scene; bottom activity ticker cropped for privacy.' },
  { id: 'tv-phone', kind: 'phone', src: `${IDEAS}/hedayah_dashboard/.layout-check/390-844-2.png`, crop: { left: 0, top: 0, width: 390, height: 800 }, origin: 'hedayah_dashboard/.layout-check/390-844-2.png', note: 'Phone layout of the map scene; activity ticker cropped.' },

  // Hida (local pilot; no conversations or department records)
  { id: 'hida-workspace', src: 'D:/Agents/main/projects/hida/runtime/workspace-preview.png', crop: { left: 0, top: 0, width: 1440, height: 900 }, origin: 'hida/runtime/workspace-preview.png', note: 'Conversation start screen; test notice cropped.' },
  { id: 'hida-costs', src: 'D:/Agents/main/projects/hida/runtime/explorer-costs-en.png', origin: 'hida/runtime/explorer-costs-en.png', note: 'Model cost explorer, illustrative estimates.' },
  { id: 'hida-phone', kind: 'phone', src: 'D:/Agents/main/projects/hida/runtime/mobile-preview.png', origin: 'hida/runtime/mobile-preview.png', note: 'Phone layout of the workspace.' },
  { id: 'hida-phone-ar', kind: 'phone', src: 'D:/Agents/main/projects/hida/runtime/explorer-mobile-ar.png', origin: 'hida/runtime/explorer-mobile-ar.png', note: 'Models explorer on a phone, Arabic.' },
];

const OUT = 'public/images/work';
const WIDTHS = { desktop: [800, 1600], phone: [360, 720], icon: [96, 192] };
const BUDGET = 300_000;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const provenance = [];
const manifest = {};
for (const asset of assets) {
  const kind = asset.kind ?? 'desktop';
  const base = () => (asset.crop ? sharp(asset.src).extract(asset.crop) : sharp(asset.src));
  const { width: srcW, height: srcH } = asset.crop ?? (await sharp(asset.src).metadata());
  const widths = [...new Set(WIDTHS[kind].map(w => Math.min(w, srcW)))];
  for (const w of widths) {
    const file = `${OUT}/${asset.id}-${w}.webp`;
    await base().resize({ width: w, withoutEnlargement: true }).webp({ quality: kind === 'phone' ? 80 : 78 }).toFile(file);
    if ((await stat(file)).size >= BUDGET) throw Error(`${file} exceeds the image budget`);
  }
  const height = Math.round(srcH * widths.at(-1) / srcW);
  manifest[asset.id] = { kind, widths, width: widths.at(-1), height };
  provenance.push({ asset: asset.id, origin: asset.origin, note: asset.note, width: widths.at(-1), height, AI_generated: false });
}
// Videos in public/media are re-encoded with ffmpeg (see README); their provenance travels with the images.
provenance.push(
  { asset: 'media/comms-film.mp4', origin: 'Comms_Hub/videos/comms-hub-launch/output/comms-hub-landscape.mp4', note: 'Code-rendered launch film with an original score, re-encoded to 960x540, 30 fps.', width: 960, height: 540, AI_generated: false },
  { asset: 'media/bookquest-flip.mp4', origin: 'BookQuest/.local/motion/flip.gif', note: 'Recorded page flip from the reader with a fictional sample book, re-encoded to MP4.', width: 600, height: 530, AI_generated: false },
  { asset: 'media/bookquest-flip-poster.webp', origin: 'BookQuest/.local/motion/flip.gif (first frame)', note: 'Poster frame of the page-flip recording.', width: 600, height: 530, AI_generated: false },
);
await writeFile(`${OUT}/provenance.json`, JSON.stringify(provenance, null, 2));
await writeFile('src/data/media.generated.json', JSON.stringify(manifest, null, 2));
console.log(`Imported ${assets.length} real project captures.`);
