import type { Bilingual, Locale } from './site';
import generated from './media.generated.json';

// Dimensions and widths come from scripts/import-project-images.mjs; provenance lives in public/images/work/provenance.json.
type Generated = { kind: 'desktop' | 'phone' | 'icon'; widths: number[]; width: number; height: number };
const dims = generated as Record<string, Generated>;

export type Shot = { id: string; alt: Bilingual; caption: Bilingual };
export type Image = Shot & Generated & { src: string; srcset: string };

const sample: Bilingual = { en: 'Sample data.', ar: 'بيانات توضيحية.' };
const shot = (id: string, alt: Bilingual, caption: Bilingual = sample): Shot => ({ id, alt, caption });

export const shots = {
  'hadayah-web-live': shot('hadayah-web-live', { en: 'Hadayah Live web build playing a live lesson, with the chat beside the video.', ar: 'نسخة الويب من هدايه تعرض درسًا مباشرًا مع المحادثة بجانب الفيديو.' }, { en: 'Web build test render. Chat and viewer count are sample data.', ar: 'عرض تجريبي لنسخة الويب. المحادثة وعدد المشاهدين بيانات توضيحية.' }),
  'hadayah-phone-discovery-en': shot('hadayah-phone-discovery-en', { en: 'Hadayah discovery screen in English, with a live lesson card and category filters.', ar: 'شاشة الاكتشاف في هدايه بالإنجليزية، مع بطاقة بث مباشر وتصنيفات.' }, { en: 'Phone test render, English. Demo channels.', ar: 'عرض تجريبي على الهاتف بالإنجليزية. قنوات توضيحية.' }),
  'hadayah-phone-discovery-ar': shot('hadayah-phone-discovery-ar', { en: 'The same discovery screen in Arabic, mirrored right to left.', ar: 'شاشة الاكتشاف نفسها بالعربية، باتجاه من اليمين إلى اليسار.' }, { en: 'Phone test render, Arabic. Demo channels.', ar: 'عرض تجريبي على الهاتف بالعربية. قنوات توضيحية.' }),
  'hadayah-phone-onboarding': shot('hadayah-phone-onboarding', { en: 'Hadayah welcome screen with sign-in options.', ar: 'شاشة الترحيب في هدايه مع خيارات الدخول.' }, { en: 'Android capture.', ar: 'لقطة من Android.' }),
  'hadayah-phone-studio': shot('hadayah-phone-studio', { en: 'Broadcaster studio choosing between encoder, phone and local publishing.', ar: 'استوديو المقدّم للاختيار بين برنامج البث والهاتف والبث المحلي.' }, { en: 'Android capture.', ar: 'لقطة من Android.' }),
  'hadayah-phone-camera': shot('hadayah-phone-camera', { en: 'Phone broadcast setup with the YouTube link, title and category.', ar: 'إعداد البث من الهاتف مع رابط YouTube والعنوان والتصنيف.' }, { en: 'Android capture.', ar: 'لقطة من Android.' }),
  'hadayah-phone-quality': shot('hadayah-phone-quality', { en: 'Stream key field and 360p, 720p and 1080p quality presets.', ar: 'حقل مفتاح البث وإعدادات الجودة 360p و720p و1080p.' }, { en: 'Android capture.', ar: 'لقطة من Android.' }),
  'hadayah-phone-watch': shot('hadayah-phone-watch', { en: 'A recorded lesson playing in the watch screen, with save and share actions.', ar: 'درس مسجّل يُعرض في شاشة المشاهدة، مع خيارات الحفظ والمشاركة.' }, { en: 'Android capture.', ar: 'لقطة من Android.' }),
  'hadayah-archive': shot('hadayah-archive', { en: 'A public organization page with its archive of educational lectures.', ar: 'صفحة جهة عامة مع أرشيف محاضراتها التعليمية.' }, { en: 'Captured from the public web app.', ar: 'لقطة من تطبيق الويب العام.' }),
  'hadayah-feature': shot('hadayah-feature', { en: 'Hadayah Live feature graphic with the Arabic and English name.', ar: 'الصورة الترويجية لمنصة هدايه بالاسمين العربي والإنجليزي.' }, { en: 'Drafted for the Google Play listing.', ar: 'مُعدّة لصفحة Google Play.' }),
  'comms-evening': shot('comms-evening', { en: 'Comms Hub home in the evening theme: decisions, campaign progress and team load.', ar: 'الرئيسية في مركز الاتصال بالمظهر الليلي: القرارات وتقدّم الحملة وحمل الفريق.' }),
  'comms-day': shot('comms-day', { en: 'The same Comms Hub home in the day theme.', ar: 'رئيسية مركز الاتصال نفسها بالمظهر النهاري.' }),
  'comms-phone-approval': shot('comms-phone-approval', { en: 'Approving version 4 of a video from a phone.', ar: 'اعتماد الإصدار الرابع من فيديو عبر الهاتف.' }),
  'comms-approval-stamp': shot('comms-approval-stamp', { en: 'The approval stamp confirming one specific version.', ar: 'ختم الاعتماد يؤكد نسخة محددة.' }),
  'comms-calendar': shot('comms-calendar', { en: 'A campaign calendar laid out by week.', ar: 'تقويم الحملة موزّعًا على الأسبوع.' }),
  'comms-film-poster': shot('comms-film-poster', { en: 'Opening frame of the Comms Hub launch film.', ar: 'الإطار الافتتاحي للفيلم التعريفي لمركز الاتصال.' }, { en: 'Rendered in code, with an original score.', ar: 'مصنوع بالبرمجة، بموسيقى أصلية.' }),
  'hayz-dusk-en': shot('hayz-dusk-en', { en: 'HAYZ home at dusk: a 3D model of a house with four numbered cameras.', ar: 'رئيسية حيّز مساءً: نموذج ثلاثي الأبعاد لمنزل بأربع كاميرات مرقّمة.' }, { en: 'Design reference, English. Illustrative property and demo prices.', ar: 'المرجع التصميمي بالإنجليزية. عقار توضيحي وأسعار تجريبية.' }),
  'hayz-dusk-ar': shot('hayz-dusk-ar', { en: 'The same HAYZ home in Arabic, mirrored, with the model unchanged.', ar: 'رئيسية حيّز نفسها بالعربية، منعكسة مع بقاء النموذج كما هو.' }, { en: 'Design reference, Arabic. Illustrative property and demo prices.', ar: 'المرجع التصميمي بالعربية. عقار توضيحي وأسعار تجريبية.' }),
  'hayz-day-en': shot('hayz-day-en', { en: 'HAYZ home in daylight lighting.', ar: 'رئيسية حيّز بإضاءة النهار.' }, { en: 'Design reference. A lighting study, not a camera feed.', ar: 'المرجع التصميمي. دراسة للإضاءة، وليست بثًا من كاميرا.' }),
  'hayz-builder': shot('hayz-builder', { en: 'The system builder with the property model, camera list and running total.', ar: 'منشئ الأنظمة مع نموذج العقار وقائمة الكاميرات والإجمالي.' }, { en: 'Design reference with demo data.', ar: 'المرجع التصميمي ببيانات توضيحية.' }),
  'hayz-progress-ar': shot('hayz-progress-ar', { en: 'Buyer order progress in Arabic, five steps from survey to handover.', ar: 'تقدّم طلب المشتري بالعربية، خمس خطوات من المعاينة حتى التسليم.' }, { en: 'Design reference with demo data.', ar: 'المرجع التصميمي ببيانات توضيحية.' }),
  'nbc-original': shot('nbc-original', { en: 'The competition website in its original identity, with the book and participation actions.', ar: 'موقع المسابقة بهويته الأولى، مع الكتاب وأزرار المشاركة.' }, { en: 'Captured from the public website.', ar: 'لقطة من الموقع العام.' }),
  'nbc-official': shot('nbc-official', { en: 'The competition website in its official blue identity.', ar: 'موقع المسابقة بالهوية الرسمية الزرقاء.' }, { en: 'Official identity review capture.', ar: 'لقطة من مراجعة الهوية الرسمية.' }),
  'nbc-phone-official': shot('nbc-phone-official', { en: 'The official identity on a phone, with register and read actions.', ar: 'الهوية الرسمية على الهاتف، مع زرّي التسجيل والقراءة.' }, { en: 'Official identity review capture.', ar: 'لقطة من مراجعة الهوية الرسمية.' }),
  'nbc-phone-exam': shot('nbc-phone-exam', { en: 'A practice question with the correct answer explained and a link to the book page.', ar: 'سؤال تجريبي مع شرح الإجابة الصحيحة ورابط إلى صفحة الكتاب.' }, { en: 'Practice mode test capture.', ar: 'لقطة من وضع التجربة.' }),
  'nbc-ceremony': shot('nbc-ceremony', { en: 'The results ceremony screen opening the book.', ar: 'شاشة حفل النتائج مع فتح الكتاب.' }, { en: 'Design lab, synthetic data.', ar: 'من مختبر التصميم، ببيانات مصطنعة.' }),
  'bookquest-landing': shot('bookquest-landing', { en: 'The public Marginalia landing page for the BookQuest alpha.', ar: 'الصفحة العامة لنسخة BookQuest الأولية باسم Marginalia.' }, { en: 'Captured from the public site.', ar: 'لقطة من الموقع العام.' }),
  'bookquest-desk': shot('bookquest-desk', { en: 'The reading desk with a shared book, progress and friends in the room.', ar: 'مكتب القراءة مع كتاب مشترك والتقدّم والأصدقاء في الغرفة.' }, { en: 'Fictional sample book and readers.', ar: 'كتاب وقرّاء متخيّلون.' }),
  'bookquest-map': shot('bookquest-map', { en: 'The reader with the book map open beside the page.', ar: 'القارئ مع خريطة الكتاب بجانب الصفحة.' }, { en: 'Fictional sample book.', ar: 'كتاب تجريبي متخيّل.' }),
  'bookquest-prediction': shot('bookquest-prediction', { en: 'A friend’s prediction opening in the margin once the reader reaches it.', ar: 'توقّع صديق يُفتح في الهامش عند وصول القارئ إليه.' }, { en: 'Fictional sample book and readers.', ar: 'كتاب وقرّاء متخيّلون.' }),
  'bookquest-phone': shot('bookquest-phone', { en: 'BookQuest home on a phone.', ar: 'رئيسية BookQuest على الهاتف.' }, { en: 'Fictional sample book.', ar: 'كتاب تجريبي متخيّل.' }),
  'tv-globe': shot('tv-globe', { en: 'Hedayah dashboard geographic scene with a globe and country totals, without names.', ar: 'المشهد الجغرافي للوحة هداية، مع الكرة الأرضية وإجماليات الدول، دون أسماء.' }, { en: 'Public dashboard. Activity ticker excluded for privacy.', ar: 'اللوحة العامة. استُبعد شريط النشاط حفاظًا على الخصوصية.' }),
  'tv-milestones': shot('tv-milestones', { en: 'The milestones scene with programme counts and a monthly chart.', ar: 'مشهد الإنجازات مع أعداد البرامج ورسم شهري.' }, { en: 'Layout check capture. Activity ticker cropped.', ar: 'لقطة من فحص التخطيط. اقتُطع شريط النشاط.' }),
  'tv-phone': shot('tv-phone', { en: 'The map scene adapted to a phone.', ar: 'مشهد الخريطة على الهاتف.' }, { en: 'Layout check capture. Activity ticker cropped.', ar: 'لقطة من فحص التخطيط. اقتُطع شريط النشاط.' }),
  'hida-workspace': shot('hida-workspace', { en: 'Hida conversation start screen with suggested starting points.', ar: 'شاشة بدء المحادثة في مساحة العمل مع نقاط بداية مقترحة.' }, { en: 'Local capture. No conversations or records.', ar: 'لقطة محلية، دون محادثات أو سجلات.' }),
  'hida-costs': shot('hida-costs', { en: 'The model cost explorer comparing monthly and cumulative estimates.', ar: 'مستكشف تكاليف النماذج يقارن التقديرات الشهرية والتراكمية.' }, { en: 'Local capture. Illustrative estimates.', ar: 'لقطة محلية. تقديرات توضيحية.' }),
  'hida-phone': shot('hida-phone', { en: 'Hida workspace on a phone.', ar: 'مساحة العمل على الهاتف.' }, { en: 'Local capture.', ar: 'لقطة محلية.' }),
  'hida-phone-ar': shot('hida-phone-ar', { en: 'The models explorer on a phone, in Arabic.', ar: 'مستكشف النماذج على الهاتف بالعربية.' }, { en: 'Local capture.', ar: 'لقطة محلية.' }),
} satisfies Record<string, Shot>;

export type ShotId = keyof typeof shots;

export const image = (id: ShotId): Image => {
  const d = dims[id];
  return { ...shots[id], ...d, src: `/images/work/${id}-${d.width}.webp`, srcset: d.widths.map(w => `/images/work/${id}-${w}.webp ${w}w`).join(', ') };
};

export type ViewSet = { name: Bilingual; options: { label: Bilingual; letter?: boolean; id: ShotId }[] };
export type Video = { src: string; poster: string; label: Bilingual; caption: Bilingual; ambient?: boolean; width: number; height: number };
export type ProjectMedia = {
  /** What lights up on the board's screen: a desktop capture, a phone capture, or both. Phone may differ per language. */
  screen?: { desktop?: ShotId; phone?: ShotId | Record<Locale, ShotId> };
  views?: ViewSet[];
  phones?: ShotId[];
  gallery?: ShotId[];
  video?: Video;
};

const L = (en: string, ar: string): Bilingual => ({ en, ar });

export const media: Record<string, ProjectMedia> = {
  'hadayah-live': {
    screen: { desktop: 'hadayah-web-live', phone: { en: 'hadayah-phone-discovery-en', ar: 'hadayah-phone-discovery-ar' } },
    views: [{ name: L('Language', 'اللغة'), options: [{ label: L('العربية', 'العربية'), letter: true, id: 'hadayah-phone-discovery-ar' }, { label: L('English', 'English'), letter: true, id: 'hadayah-phone-discovery-en' }] }],
    phones: ['hadayah-phone-onboarding', 'hadayah-phone-studio', 'hadayah-phone-camera', 'hadayah-phone-watch'],
    gallery: ['hadayah-archive', 'hadayah-feature'],
  },
  'comms-hub': {
    screen: { desktop: 'comms-evening', phone: 'comms-phone-approval' },
    views: [{ name: L('Theme', 'المظهر'), options: [{ label: L('Evening', 'ليلي'), id: 'comms-evening' }, { label: L('Day', 'نهاري'), id: 'comms-day' }] }],
    phones: ['comms-phone-approval'],
    gallery: ['comms-approval-stamp', 'comms-calendar'],
    video: { src: '/media/comms-film.mp4', poster: '/images/work/comms-film-poster-1600.webp', label: L('Launch film', 'الفيلم التعريفي'), caption: L('A 38.4-second launch film rendered in code with an original score. Sound on.', 'فيلم تعريفي مدته 38.4 ثانية، مصنوع بالبرمجة بموسيقى أصلية. يتضمّن صوتًا.'), width: 960, height: 540 },
  },
  hayz: {
    screen: { desktop: 'hayz-dusk-en' },
    views: [
      { name: L('Language', 'اللغة'), options: [{ label: L('العربية', 'العربية'), letter: true, id: 'hayz-dusk-ar' }, { label: L('English', 'English'), letter: true, id: 'hayz-dusk-en' }] },
      { name: L('Lighting', 'الإضاءة'), options: [{ label: L('Dusk', 'مساءً'), id: 'hayz-dusk-en' }, { label: L('Daylight', 'نهارًا'), id: 'hayz-day-en' }] },
    ],
    gallery: ['hayz-builder', 'hayz-progress-ar'],
  },
  nbc: {
    screen: { desktop: 'nbc-official', phone: 'nbc-phone-exam' },
    views: [{ name: L('Identity', 'الهوية'), options: [{ label: L('Official', 'الرسمية'), id: 'nbc-official' }, { label: L('Original', 'الأولى'), id: 'nbc-original' }] }],
    phones: ['nbc-phone-official', 'nbc-phone-exam'],
    gallery: ['nbc-ceremony'],
  },
  bookquest: {
    screen: { desktop: 'bookquest-desk', phone: 'bookquest-phone' },
    phones: ['bookquest-phone'],
    gallery: ['bookquest-map', 'bookquest-prediction', 'bookquest-landing'],
    video: { src: '/media/bookquest-flip.mp4', poster: '/media/bookquest-flip-poster.webp', label: L('Page flip', 'تقليب الصفحة'), caption: L('The page flip, recorded from the reader.', 'تقليب الصفحة كما يظهر في القارئ.'), ambient: true, width: 600, height: 530 },
  },
  'hedayah-dashboard': {
    screen: { desktop: 'tv-globe', phone: 'tv-phone' },
    phones: ['tv-phone'],
    gallery: ['tv-milestones'],
  },
  hida: {
    screen: { desktop: 'hida-workspace', phone: 'hida-phone' },
    phones: ['hida-phone', 'hida-phone-ar'],
    gallery: ['hida-costs'],
  },
  dnfom: {},
};

export const phoneFor = (m: ProjectMedia, lang: Locale): ShotId | undefined =>
  !m.screen?.phone ? undefined : typeof m.screen.phone === 'string' ? m.screen.phone : m.screen.phone[lang];

// The home page's wall of screens: mixed shapes across projects, each linking to its case study.
// Rows of the twelve-column wall: desktop (6) + phone (3) + phone (3), desktop + desktop, phone + phone + desktop.
export const wall: { project: string; id: ShotId }[] = [
  { project: 'hayz', id: 'hayz-dusk-en' },
  { project: 'hadayah-live', id: 'hadayah-phone-discovery-ar' },
  { project: 'nbc', id: 'nbc-phone-exam' },
  { project: 'comms-hub', id: 'comms-evening' },
  { project: 'bookquest', id: 'bookquest-prediction' },
  { project: 'hida', id: 'hida-phone-ar' },
  { project: 'hedayah-dashboard', id: 'tv-phone' },
  { project: 'nbc', id: 'nbc-ceremony' },
];
