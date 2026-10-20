export type Locale = 'en' | 'ar';
export type Bilingual = Record<Locale, string>;
export const local = (text: Bilingual, lang: Locale) => text[lang];
export const url = (lang: Locale, page = '') => `/${lang}/${page ? `${page}/` : ''}`;

export const site = {
  name: 'Amir Alhatemi',
  arabicName: 'أمير الحاتمي',
  origin: 'https://amir-web-alpha.vercel.app',
  github: 'https://github.com/ameeralhatemi67-debug',
  linkedin: 'https://www.linkedin.com/in/ameer-alhatime-0b590a3b7/',
  // TODO(owner): Supply the public contact email. The Contact panel switches to it automatically.
  email: '',
  // TODO(owner): Supply the portrait. Place it at public/images/amir-640.webp and amir-1280.webp, then set this to 'amir'.
  portrait: '',
  headline: { en: 'App developer building Arabic-first products.', ar: 'مطوّر تطبيقات يضع العربية في صميم التجربة.' },
  intro: {
    en: 'I’m Amir, based in Al Khobar. I build apps for learning, communication and the work in between.',
    ar: 'أنا أمير، من الخبر. أبني تطبيقات للتعلّم والتواصل وتيسير العمل.'
  },
  description: {
    en: 'Amir Alhatemi is an app developer based in Al Khobar, Saudi Arabia. Explore Arabic-first apps for learning, communication, field work and departmental tools.',
    ar: 'أمير الحاتمي، مطوّر تطبيقات مقيم في الخبر بالمملكة العربية السعودية. تعرّف على تطبيقاته في التعلّم والتواصل والعمل الميداني وأدوات العمل.'
  },
  // The date every status on the board was last checked against its project files.
  statusDate: { iso: '2026-10-20', en: '20 Oct 2026', ar: '20 أكتوبر 2026' },
};

/** Where a project stands on one fixed lifecycle. */
export type Stage = 'concept' | 'building' | 'pilot' | 'launch' | 'live';
/** What a visitor can do with it today, drawn as a glyph: filled, half or ring. */
export type Reach = 'public' | 'limited' | 'private';

export const stages: { id: Stage; label: Bilingual }[] = [
  { id: 'concept', label: { en: 'Concept', ar: 'فكرة' } },
  { id: 'building', label: { en: 'Building', ar: 'قيد البناء' } },
  { id: 'pilot', label: { en: 'Pilot or alpha', ar: 'تجربة أولية' } },
  { id: 'launch', label: { en: 'Launch prep', ar: 'تجهيز للإطلاق' } },
  { id: 'live', label: { en: 'Live', ar: 'منشور' } },
];

export const reachLabel: Record<Reach, Bilingual> = {
  public: { en: 'Publicly available', ar: 'متاح للعامة' },
  limited: { en: 'Limited access', ar: 'وصول محدود' },
  private: { en: 'Private build', ar: 'نسخة خاصة' },
};

export type Fact = { value: string; label: Bilingual };
export type Step = { name: Bilingual; detail: Bilingual };

export type Project = {
  slug: string; name: Bilingual; pitch: Bilingual; category: Bilingual;
  tags: string[]; stack: string[];
  stage: Stage; reach: Reach; status: Bilingual; paused?: boolean;
  problem: Bilingual; audience: Bilingual; highlights: Bilingual[];
  facts: Fact[]; how?: { title: Bilingual; intro: Bilingual; steps: Step[] };
  boundary: Bilingual; note?: Bilingual; link?: string;
};

// Project descriptions come from the owner's local repositories, read-only. Every figure below was
// checked against the named source file on 2026-10-20. No source code, credentials or private records are copied.
export const projects: Project[] = [
  {
    slug: 'hadayah-live',
    name: { en: 'Hadayah Live', ar: 'منصة هدايه' },
    pitch: { en: 'A place to discover live lessons and the people sharing them.', ar: 'مكان يجمع البث المباشر للدروس، ويقرّبك من أهل العلم.' },
    category: { en: 'Learning & live streaming', ar: 'التعلّم والبث المباشر' },
    tags: ['mobile', 'web', 'learning'],
    stack: ['Flutter', 'Dart', 'Kotlin', 'Supabase', 'PostgreSQL', 'YouTube', 'RTMP'],
    stage: 'launch', reach: 'limited',
    status: { en: 'Preparing for Google Play', ar: 'قيد التجهيز للنشر على Google Play' },
    problem: { en: 'Educational and religious broadcasts are spread across channels. Finding a relevant lesson, its schedule, or its physical venue can take several separate searches. Hadayah brings discovery, playback, and location into one experience.', ar: 'تتوزع الدروس والمحاضرات بين قنوات متعددة، وقد يحتاج الوصول إلى البث وموعده ومكان إقامته إلى أكثر من بحث. تجمع هدايه اكتشاف الدروس ومشاهدتها ومواقعها في تجربة واحدة.' },
    audience: { en: 'People following educational and religious lessons, alongside approved broadcasters and organizations managing their own channels.', ar: 'متابعو الدروس والمحاضرات، والمقدّمون المعتمدون، والجهات التي تدير قنواتها ومحتواها.' },
    highlights: [
      { en: 'Arabic and English discovery, with native right-to-left layouts and an offline map of Al Khobar, Dhahran and Dammam.', ar: 'اكتشاف المحتوى بالعربية والإنجليزية، مع دعم أصيل لاتجاه العربية وخريطة تعمل دون اتصال للخبر والظهران والدمام.' },
      { en: 'A broadcaster’s phone streams straight to their own YouTube channel through a native Android bridge.', ar: 'يبث هاتف المقدّم مباشرة إلى قناته على YouTube عبر تكامل أصلي في Android.' },
      { en: 'YouTube live and recorded playback, with bookmarks for recordings and upcoming lessons.', ar: 'مشاهدة البث والتسجيلات عبر YouTube، وحفظ التسجيلات والدروس القادمة للرجوع إليها.' },
      { en: 'Live chat, reporting, moderation tools, and administration roles enforced by the database.', ar: 'محادثة مباشرة وإبلاغ عن المخالفات وأدوات إشراف وصلاحيات إدارية تفرضها قاعدة البيانات.' },
      { en: 'Account data export and a guarded account-deletion flow.', ar: 'تصدير بيانات الحساب ومسار لحذفه مع معالجة الحالات التي تحتاج إلى إجراء مسبق.' },
    ],
    facts: [
      { value: '1,547', label: { en: 'Flutter tests passing', ar: 'اختبار Flutter ناجح' } }, // Core_files/PALETTE_RESUME.md
      { value: '91', label: { en: 'Database migrations', ar: 'ترحيلًا لقاعدة البيانات' } }, // supabase/migrations
      { value: '76', label: { en: 'Contrast checks across both languages and palettes', ar: 'فحص تباين في اللغتين ولوحتي الألوان' } }, // Core_files/STATUS.md
      { value: '3', label: { en: 'Cities in the bundled offline map', ar: 'مدن في الخريطة المضمّنة دون اتصال' } }, // project/assets/maps/tricity
    ],
    how: {
      title: { en: 'How Hadayah fits together', ar: 'كيف تعمل هدايه؟' },
      intro: { en: 'Discovery and account data travel one path. Video delivery and phone publishing travel another.', ar: 'يسلك اكتشاف المحتوى وبيانات الحساب مسارًا، وتسلك المشاهدة والبث من الهاتف مسارًا آخر.' },
      steps: [
        { name: { en: 'Flutter app', ar: 'تطبيق Flutter' }, detail: { en: 'Discovery, map, playback', ar: 'الاكتشاف والخريطة والمشاهدة' } },
        { name: { en: 'Supabase and PostgreSQL', ar: 'Supabase وPostgreSQL' }, detail: { en: 'Accounts, data, permissions, chat', ar: 'الحسابات والبيانات والصلاحيات والمحادثة' } },
        { name: { en: 'Android to RTMP', ar: 'من Android عبر RTMP' }, detail: { en: 'Camera and microphone publishing', ar: 'بث الكاميرا والميكروفون' } },
        { name: { en: 'YouTube', ar: 'YouTube' }, detail: { en: 'Live and recorded delivery', ar: 'تقديم البث والتسجيلات' } },
      ],
    },
    boundary: { en: 'The Android app is preparing for Google Play. Release configuration and acceptance checks remain, and push-reminder delivery is not claimed as complete. The web build is public.', ar: 'تطبيق Android قيد التجهيز للنشر على Google Play. ما زالت هناك إعدادات وفحوص قبول قبل الإصدار، ولم يكتمل التحقق من وصول تذكيرات الإشعارات. نسخة الويب متاحة للعامة.' },
    link: 'https://stream-application-ten.vercel.app/#/feed',
    // TODO(owner): Provide approved Hadayah privacy-policy and account-deletion URLs.
  },
  {
    slug: 'comms-hub',
    name: { en: 'Comms Hub', ar: 'مركز الاتصال المؤسسي' },
    pitch: { en: 'One workspace for the work behind institutional communication.', ar: 'مساحة واحدة لتنظيم العمل خلف كل رسالة مؤسسية.' },
    category: { en: 'Communication workflow', ar: 'إدارة أعمال الاتصال' },
    tags: ['web', 'workflow'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Canvas'],
    stage: 'building', reach: 'limited',
    status: { en: 'In development', ar: 'قيد التطوير' },
    problem: { en: 'Communication work passes between writers, designers, reviewers, and publishers. Comms Hub keeps the work, its versions, and the approval of each version connected, so a later edit never inherits an earlier approval.', ar: 'ينتقل عمل الاتصال بين الكاتب والمصمّم والمراجع ومسؤول النشر. يربط المركز العمل بنسخه واعتماد كل نسخة، حتى لا يُعامل التعديل الجديد على أنه معتمد مسبقًا.' },
    audience: { en: 'Institutional communication teams coordinating content, media, review, and publishing responsibilities.', ar: 'فرق الاتصال المؤسسي التي تنسّق المحتوى والإنتاج الإعلامي والمراجعة ومسؤوليات النشر.' },
    highlights: [
      { en: 'Version-bound approvals, review cycles, and a shared work history.', ar: 'اعتمادات مرتبطة بنسخة محددة، ودورات مراجعة، وسجل مشترك للعمل.' },
      { en: 'A built-in studio for video and photo, where one canvas engine draws both the preview and the export.', ar: 'استوديو مدمج للفيديو والصور، يرسم فيه محرك واحد المعاينة والملف المصدَّر.' },
      { en: 'Media library, internal mail, team messaging, and planning tools.', ar: 'مكتبة إعلامية وبريد داخلي ومراسلة للفريق وأدوات للتخطيط.' },
      { en: 'Role and capability rules enforced in PostgreSQL.', ar: 'أدوار وصلاحيات تفرضها PostgreSQL.' },
    ],
    facts: [
      { value: '49', label: { en: 'Database migrations', ar: 'ترحيلًا لقاعدة البيانات' } }, // supabase/migrations
      { value: '26', label: { en: 'Arabic motion templates', ar: 'قالب حركة عربيًا' } }, // Status.md, the studio
      { value: '38.4s', label: { en: 'Launch film, rendered entirely in code', ar: 'فيلم تعريفي مصنوع بالبرمجة بالكامل' } }, // videos/comms-hub-launch/README.txt
    ],
    boundary: { en: 'Social publishing is simulated. Several external connections and storage flows still need acceptance testing with real accounts. Screens show labelled sample data.', ar: 'النشر على المنصات محاكاة حاليًا. بعض الاتصالات الخارجية ومسارات التخزين تحتاج إلى اختبار قبول بحسابات فعلية. تعرض الشاشات بيانات توضيحية معرّفة بذلك.' },
    link: 'https://comms-hub-three.vercel.app/',
    // TODO(owner): Confirm contribution scope and any naming/disclosure restrictions for Comms Hub.
  },
  {
    slug: 'hayz',
    name: { en: 'HAYZ', ar: 'حيّز' },
    pitch: { en: 'CCTV for homes and small businesses, from choosing cameras to the handover.', ar: 'كاميرات مراقبة للمنازل والأعمال الصغيرة، من اختيار المعدّات حتى التسليم.' },
    category: { en: 'Commerce & field service', ar: 'التجارة والخدمات الميدانية' },
    tags: ['web', 'workflow'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Three.js'],
    stage: 'building', reach: 'private', paused: true,
    status: { en: 'Paused private build', ar: 'نسخة خاصة متوقفة مؤقتًا' },
    problem: { en: 'Buying CCTV usually starts with guessing at equipment, then chasing an installer. HAYZ lets a buyer see coverage on a model of their property, build a system with a running total, and follow the order through survey, quotation, packing, installation and handover.', ar: 'يبدأ شراء كاميرات المراقبة غالبًا بتخمين المعدّات ثم البحث عن فنّي للتركيب. يتيح حيّز للمشتري رؤية تغطية الكاميرات على نموذج لعقاره، وبناء نظامه مع إجمالي يتحدّث فورًا، ثم متابعة الطلب من المعاينة والتسعير حتى التغليف والتركيب والتسليم.' },
    audience: { en: 'Households and small businesses in Al Khobar, with separate workspaces for suppliers, technicians and an administrator.', ar: 'المنازل والأعمال الصغيرة في الخبر، مع مساحات عمل مستقلة للموردين والفنيين والمشرف.' },
    highlights: [
      { en: 'A generated 3D model of the property, with numbered cameras and each camera’s field of view.', ar: 'نموذج ثلاثي الأبعاد للعقار، مع كاميرات مرقّمة ومجال رؤية كل كاميرا.' },
      { en: 'A system builder with a running SAR total and a printable brief in Arabic or English.', ar: 'منشئ أنظمة بإجمالي يتحدّث بالريال، وملخص قابل للطباعة بالعربية أو الإنجليزية.' },
      { en: 'An order path from survey to quotation, payment, packing, installation and handover, with an equipment passport of serial numbers.', ar: 'مسار للطلب من المعاينة إلى التسعير والدفع والتغليف والتركيب والتسليم، مع جواز للمعدّات بأرقامها التسلسلية.' },
      { en: 'Four workspaces: buyer, supplier, technician and administrator, mirrored for Arabic while serials and the 3D model keep their real orientation.', ar: 'أربع مساحات عمل للمشتري والمورّد والفنّي والمشرف، تنعكس للعربية مع بقاء الأرقام التسلسلية والنموذج بالاتجاه الصحيح.' },
    ],
    facts: [
      { value: '148', label: { en: 'Core database scenarios', ar: 'سيناريو أساسي لقاعدة البيانات' } }, // web/README.md
      { value: '116', label: { en: 'Unit tests', ar: 'اختبار وحدة' } }, // web/README.md
      { value: '4', label: { en: 'Role workspaces', ar: 'مساحات عمل للأدوار' } }, // PRODUCT.md
    ],
    boundary: { en: 'Development is paused. There is no public deployment, payments are switched off, and HAYZ is a provisional concept name that has not been cleared. Screens come from the design reference and use demo data.', ar: 'التطوير متوقف مؤقتًا. لا توجد نسخة منشورة للعامة، والدفع غير مفعّل، و«حيّز» اسم مبدئي للهوية لم يُعتمد بعد. الشاشات من المرجع التصميمي وببيانات توضيحية.' },
  },
  {
    slug: 'nbc',
    name: { en: 'NBC competition platform', ar: 'مسابقة الانتماء واللحمة الوطنية' },
    pitch: { en: 'A book-based competition, from reading to final submission.', ar: 'رحلة مسابقة تبدأ بالقراءة وتنتهي بمشاركة معتمدة.' },
    category: { en: 'Reading & participation', ar: 'القراءة والمشاركة' },
    tags: ['web', 'learning', 'workflow'],
    stack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'PDF.js', 'Three.js'],
    stage: 'launch', reach: 'limited',
    status: { en: 'Awaiting launch approvals', ar: 'بانتظار اعتمادات الإطلاق' },
    problem: { en: 'A book-based competition needs a clear participant journey and controlled content review. This platform connects the book, education-stage questions, saved answers, and final submission with a separate committee workflow.', ar: 'تحتاج المسابقة المعتمدة على كتاب إلى رحلة واضحة للمشارك ومراجعة منضبطة للمحتوى. تربط المنصة الكتاب بأسئلة المرحلة التعليمية وحفظ الإجابات وتسليمها النهائي، مع مسار مستقل للجنة.' },
    audience: { en: 'Participants in different education stages and the staff reviewing competition content and operations.', ar: 'المشاركون في المراحل التعليمية المختلفة، والفريق المسؤول عن مراجعة محتوى المسابقة وتشغيلها.' },
    highlights: [
      { en: 'An integrated PDF reader, with the book verified against a fixed fingerprint before it renders.', ar: 'قارئ PDF مدمج، مع التحقق من بصمة الكتاب قبل عرضه.' },
      { en: 'Answers survive a dropped connection and can be revised until the participant confirms final submission.', ar: 'تبقى الإجابات محفوظة عند انقطاع الاتصال، ويمكن تعديلها حتى تأكيد التسليم النهائي.' },
      { en: 'Separate question sets for each education stage, and isolated administrator test runs.', ar: 'مجموعات أسئلة لكل مرحلة تعليمية، وتجارب إدارية معزولة عن المشاركات الفعلية.' },
      { en: 'Content approval, campaign lifecycle, and participant-verification controls.', ar: 'اعتماد المحتوى وإدارة مراحل المسابقة وضوابط التحقق من المشاركين.' },
    ],
    facts: [
      { value: '124', label: { en: 'Regression tests at the last checkpoint', ar: 'اختبار انحدار في آخر نقطة تحقق' } }, // Status.md
      { value: '16', label: { en: 'Ordered database migrations', ar: 'ترحيلًا مرتّبًا لقاعدة البيانات' } }, // src/lib/migrations.ts
      { value: '20/25/30', label: { en: 'Questions per education stage', ar: 'سؤالًا لكل مرحلة تعليمية' } }, // Status.md
    ],
    boundary: { en: 'Content approval, privacy decisions, SMS readiness, and operational acceptance remain launch dependencies. No launched campaign or client endorsement is claimed.', ar: 'ما زال الإطلاق يعتمد على اعتماد المحتوى وقرارات الخصوصية وجاهزية الرسائل النصية والقبول التشغيلي. لا يُدّعى هنا إطلاق المسابقة أو وجود تزكية من جهة.' },
    link: 'https://nbc-web-two.vercel.app/',
    // TODO(owner): Confirm exact contribution, approved public naming and project-launch status for NBC.
  },
  {
    slug: 'bookquest',
    name: { en: 'BookQuest', ar: 'BookQuest' },
    pitch: { en: 'Read at your pace. Meet your friends in the margins.', ar: 'اقرأ على مهل، والتقِ بأصدقائك بين الهوامش.' },
    category: { en: 'Shared reading', ar: 'القراءة المشتركة' },
    tags: ['web', 'learning'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'EPUB.js', 'PDF.js'],
    stage: 'pilot', reach: 'limited',
    status: { en: 'Code-gated alpha', ar: 'نسخة ألفا برمز دعوة' },
    problem: { en: 'Reading together should not require everyone to stay on the same page. BookQuest lets a group share a book while keeping later notes and media hidden until each reader reaches them.', ar: 'القراءة مع الأصدقاء لا تعني أن يتقدّم الجميع بالسرعة نفسها. يتيح BookQuest مشاركة الكتاب، مع إخفاء الملاحظات والوسائط اللاحقة حتى يصل القارئ إلى موضعها.' },
    audience: { en: 'Friends and small reading groups sharing an EPUB or PDF in a private room.', ar: 'الأصدقاء ومجموعات القراءة الصغيرة التي تتشارك كتاب EPUB أو PDF داخل غرفة خاصة.' },
    highlights: [
      { en: 'Spoiler gating enforced by the database: a note’s text, replies and attachments stay locked until your furthest page reaches it.', ar: 'حجب يفرضه مستوى قاعدة البيانات: يبقى نص الملاحظة وردودها ومرفقاتها مقفلًا حتى تصل صفحتك إليها.' },
      { en: 'EPUB and PDF readers with saved progress, a page flip, a book map and adjustable layouts.', ar: 'قارئ EPUB وPDF مع حفظ التقدّم وتقليب الصفحات وخريطة للكتاب وخيارات للعرض.' },
      { en: 'Private rooms, invitations, predictions, polls and five levels of note attention.', ar: 'غرف خاصة ودعوات وتوقعات واستطلاعات وخمسة مستويات للفت الانتباه إلى الملاحظات.' },
      { en: 'Shared soundtracks and audio cues tied to a place in the book.', ar: 'قوائم صوتية مشتركة ومقاطع مرتبطة بمواضع في الكتاب.' },
    ],
    facts: [
      { value: '188', label: { en: 'Unit, database and integration tests', ar: 'اختبارًا للوحدات وقاعدة البيانات والتكامل' } }, // STATUS.md
      { value: '75', label: { en: 'Alpha seats', ar: 'مقعدًا في النسخة الأولية' } }, // STATUS.md
      { value: '14', label: { en: 'Database migrations', ar: 'ترحيلًا لقاعدة البيانات' } }, // supabase/migrations
    ],
    boundary: { en: 'The public site presents the alpha under the name Marginalia. Full offline startup is not supported. Screens use a fictional sample book.', ar: 'يعرض الموقع العام النسخة الأولية باسم Marginalia. لا يُدعم بدء التطبيق كاملًا دون اتصال. تستخدم الشاشات كتابًا تجريبيًا متخيّلًا.' },
    link: 'https://book-quest-ecru.vercel.app/',
    // TODO(owner): Choose BookQuest or Marginalia as the final portfolio project name.
  },
  {
    slug: 'hedayah-dashboard',
    name: { en: 'Hedayah TV dashboard', ar: 'لوحة هداية للشاشات' },
    pitch: { en: 'Turn operational data into a clear, shared picture.', ar: 'بيانات العمل في صورة واضحة يراها الجميع.' },
    category: { en: 'Data & display systems', ar: 'البيانات وأنظمة العرض' },
    tags: ['web', 'data'],
    stack: ['React', 'TypeScript', 'Vite', 'D3', 'Vercel Functions', 'Vercel Blob'],
    stage: 'live', reach: 'public',
    status: { en: 'Deployed dashboard', ar: 'لوحة منشورة' },
    problem: { en: 'Spreadsheet activity is hard to follow from across a room. This dashboard turns selected operational data into rotating television-ready scenes, while separating public display fields from sensitive source records.', ar: 'يصعب متابعة تفاصيل جداول البيانات على شاشة بعيدة. تحوّل اللوحة بيانات مختارة إلى مشاهد متتابعة مناسبة لشاشات العرض، مع فصل الحقول العامة عن السجلات الحساسة.' },
    audience: { en: 'Office teams viewing high-level activity on shared televisions and web displays.', ar: 'فرق العمل التي تتابع النشاط العام عبر شاشات المكتب وصفحات العرض.' },
    highlights: [
      { en: 'Three scenes rotate on their own: a command centre, a global map and milestones.', ar: 'ثلاثة مشاهد تتناوب تلقائيًا: لوحة المؤشرات والخريطة العالمية والإنجازات.' },
      { en: 'The browser never reads the spreadsheets; a server function sends only whitelisted fields.', ar: 'لا يصل المتصفح إلى الجداول مباشرة، بل ترسل دالة في الخادم الحقول المسموح بها فقط.' },
      { en: 'Private last-known-good backups and an hourly source-health check.', ar: 'نسخ احتياطية خاصة لآخر بيانات سليمة وفحص لحالة المصادر كل ساعة.' },
      { en: 'Layouts tested from a 320px phone to a 4K television, including portrait screens.', ar: 'تخطيطات مختبرة من هاتف بعرض 320 بكسل حتى تلفاز 4K، بما فيها الشاشات العمودية.' },
    ],
    facts: [
      { value: '3', label: { en: 'Rotating scenes, 18s, 18s and 12s', ar: 'مشاهد متناوبة: 18 و18 و12 ثانية' } }, // src/hooks/useSceneRotator.ts
      { value: '12', label: { en: 'Screen sizes in the layout check', ar: 'مقاسًا للشاشة في فحص التخطيط' } }, // .layout-check
      { value: '1h', label: { en: 'Source health check interval', ar: 'الفاصل بين فحوص حالة المصادر' } }, // .github/workflows/health-sync.yml
    ],
    boundary: { en: 'The public dashboard is reachable. Source health still needs rechecking; the project records an unresolved monthly-report source. Captures exclude the activity feed, which shows personal names.', ar: 'لوحة العرض العامة متاحة. ما زالت حالة المصادر تحتاج إلى إعادة فحص، إذ يسجّل المشروع مشكلة غير محلولة في مصدر التقارير الشهرية. استُبعد شريط النشاط من اللقطات لأنه يعرض أسماء أشخاص.' },
    link: 'https://hedayah-dashboard.vercel.app/',
    // TODO(owner): Recheck dashboard source health and confirm contribution scope.
  },
  {
    slug: 'hida',
    name: { en: 'Hida workspace', ar: 'مساحة عمل هداية' },
    pitch: { en: 'A local assistant connected to the documents behind the work.', ar: 'مساعد محلي يستند إلى المستندات التي يعتمد عليها العمل.' },
    category: { en: 'AI & departmental tools', ar: 'الذكاء الاصطناعي وأدوات العمل' },
    tags: ['ai', 'workflow'],
    stack: ['Python', 'FastAPI', 'SQLite', 'Ollama', 'Docker', 'Node.js'],
    stage: 'pilot', reach: 'private',
    status: { en: 'Local department pilot', ar: 'تجربة محلية لقسم عمل' },
    problem: { en: 'Department knowledge is spread across documents, spreadsheets, and repeated requests. Hida connects a local assistant to approved sources and separates personal conversations, shared knowledge, and governed requests for new capabilities.', ar: 'تتوزع معرفة القسم بين المستندات والجداول والطلبات المتكررة. يربط هداية مساعدًا محليًا بالمصادر المعتمدة، ويفصل المحادثات الشخصية عن المعرفة المشتركة وطلبات القدرات الجديدة الخاضعة للمراجعة.' },
    audience: { en: 'A small department pilot, with distinct member, manager, and administrator responsibilities.', ar: 'فريق صغير في تجربة قسمية، مع مسؤوليات مستقلة للعضو والمدير والمشرف.' },
    highlights: [
      { en: 'Arabic and English conversations grounded in approved local documents, with source references.', ar: 'محادثات بالعربية والإنجليزية تستند إلى مستندات محلية معتمدة، مع الإحالة إلى المصادر.' },
      { en: 'Local model routing through Ollama, optional cloud providers, and visible model choices.', ar: 'توجيه بين النماذج المحلية عبر Ollama، ومزوّدو سحابة اختياريون مع اختيار واضح للنموذج.' },
      { en: 'Generated Python runs only inside a locked-down container: no network, read-only, never on the host.', ar: 'لا يعمل كود Python المولَّد إلا داخل حاوية مقيّدة: دون شبكة، وللقراءة فقط، وليس على الجهاز نفسه أبدًا.' },
      { en: 'Governed capability requests and a bounded WhatsApp Web bridge with expiring pairing codes.', ar: 'طلبات قدرات تخضع للمراجعة، وتكامل محدود مع WhatsApp Web برموز ربط تنتهي صلاحيتها.' },
    ],
    facts: [
      { value: '434', label: { en: 'Python checks passing', ar: 'فحصًا ناجحًا في Python' } }, // Status.md, 2026-09-16
      { value: '127.0.0.1', label: { en: 'Where it listens: this computer only', ar: 'لا يستمع إلا على هذا الجهاز' } }, // README.md
    ],
    note: { en: 'Not to be confused with Hadayah Live. Hida is a separate tool that runs on a single computer.', ar: 'لا علاقة له بمنصة هدايه للبث؛ هداية أداة مستقلة تعمل على جهاز واحد.' },
    boundary: { en: 'This is a local pilot, not an organization-wide service. General tool building and remote access remain unfinished. Model quality still needs evaluation with department users.', ar: 'هذا مشروع تجريبي محلي ولم يُعتمد خدمةً على مستوى المؤسسة. بناء الأدوات العامة والوصول عن بُعد لم يكتملا، وجودة الإجابات تحتاج إلى تقييم مع مستخدمي القسم.' },
    // TODO(owner): Confirm exact contribution and any departmental disclosure restrictions for Hida.
  },
  {
    slug: 'dnfom',
    name: { en: 'DnFOM field operations', ar: 'نظام مهام الدعاة الميدانيين' },
    pitch: { en: 'Planning, field reports and review for an outreach organization’s daily work.', ar: 'تخطيط وتقارير ميدانية ومراجعة للعمل اليومي في جهة دعوية.' },
    category: { en: 'Operations & field work', ar: 'التشغيل والعمل الميداني' },
    tags: ['web', 'mobile', 'workflow'],
    stack: ['Next.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'IndexedDB'],
    stage: 'building', reach: 'private',
    status: { en: 'MVP for a client', ar: 'نسخة أولية لجهة عميلة' },
    problem: { en: 'Field programs were coordinated through scattered WhatsApp messages and paper sheets. DnFOM turns an annual plan into scheduled tasks, collects field reports from phones even without a connection, and routes them to supervisors for review.', ar: 'كانت البرامج الميدانية تُنسَّق عبر رسائل WhatsApp متفرقة وأوراق مطبوعة. يحوّل النظام الخطة السنوية إلى مهام مجدولة، ويستقبل التقارير الميدانية من الهاتف ولو دون اتصال، ثم يحيلها إلى المشرفين للمراجعة.' },
    audience: { en: 'An outreach charity’s field staff, supervisors and management, working in Arabic from right to left.', ar: 'الدعاة الميدانيون والمشرفون والإدارة في جهة خيرية دعوية، بواجهة عربية كاملة.' },
    highlights: [
      { en: 'Recurring programs timed to a prayer or to a fixed clock time, generated 60 days ahead.', ar: 'برامج متكررة تُضبط على وقت صلاة أو ساعة محددة، وتُولَّد قبل موعدها بستين يومًا.' },
      { en: 'An installable field app with GPS check-in and photo, voice and document reports that queue offline.', ar: 'تطبيق ميداني قابل للتثبيت، مع تسجيل حضور بالموقع وتقارير بالصور والصوت والمستندات تنتظر حتى عودة الاتصال.' },
      { en: 'Supervisor review with approve, revise or reject, recorded in an audit log.', ar: 'مراجعة المشرف بالاعتماد أو طلب التعديل أو الرفض، مع سجل للتدقيق.' },
      { en: 'Monthly evaluation that blends a supervisor rubric with automatic indicators, plus Arabic Excel and Word exports.', ar: 'تقييم شهري يجمع تقدير المشرف والمؤشرات الآلية، مع تصدير التقارير إلى Excel وWord بالعربية.' },
    ],
    facts: [
      { value: '203', label: { en: 'Automated checks passing', ar: 'فحصًا آليًا ناجحًا' } }, // docs/Backend_Progress.md
      { value: '60', label: { en: 'Days of tasks generated ahead', ar: 'يومًا من المهام تُولَّد مسبقًا' } }, // CLAUDE.md, recurrence generator
    ],
    how: {
      title: { en: 'From plan to evaluation', ar: 'من الخطة إلى التقييم' },
      intro: { en: 'The client’s screens and records stay private, so the flow is shown here instead of screenshots.', ar: 'تبقى شاشات الجهة وسجلاتها خاصة، لذلك يظهر هنا مسار العمل بدل اللقطات.' },
      steps: [
        { name: { en: 'Annual plan', ar: 'الخطة السنوية' }, detail: { en: 'Goals and programs for the year', ar: 'أهداف العام وبرامجه' } },
        { name: { en: 'Scheduling engine', ar: 'محرك الجدولة' }, detail: { en: 'Prayer-relative or clock time, 60 days ahead', ar: 'بحسب الصلاة أو الساعة، قبل 60 يومًا' } },
        { name: { en: 'Field app', ar: 'التطبيق الميداني' }, detail: { en: 'Check-in and reports, offline queue', ar: 'الحضور والتقارير، مع انتظار دون اتصال' } },
        { name: { en: 'Supervisor review', ar: 'مراجعة المشرف' }, detail: { en: 'Approve, revise or reject', ar: 'اعتماد أو تعديل أو رفض' } },
        { name: { en: 'Monthly evaluation', ar: 'التقييم الشهري' }, detail: { en: 'Rubric plus automatic indicators', ar: 'تقدير المشرف مع المؤشرات الآلية' } },
      ],
    },
    boundary: { en: 'Built against a client’s written requirements. The deployed version has not been verified, outgoing WhatsApp messages are not connected, and the client is not named here.', ar: 'بُني وفق متطلبات مكتوبة من الجهة العميلة. لم يُتحقق بعد من النسخة المنشورة، ولم تُربط رسائل WhatsApp الصادرة، ولا يُذكر اسم الجهة هنا.' },
    // TODO(owner): Confirm the client agrees to any naming before adding it.
  },
];

export type LabItem = { name: string; line: Bilingual; reach: Reach; link?: string };
// Smaller work, one line each. Sources: each project's README in D:/Agents/main/projects/ideas.
export const lab: LabItem[] = [
  { name: 'Event Gatekeeper', line: { en: 'Invite-only event sign-up with seat countdowns and capacity locks.', ar: 'تسجيل للفعاليات بالدعوة فقط، مع عدّ تنازلي للمقاعد وإغلاق عند اكتمالها.' }, reach: 'public', link: 'https://whatsapp-invite-lime.vercel.app/' },
  { name: 'Kinetics', line: { en: 'A personal studio of 48 working UI components and animations.', ar: 'استوديو شخصي يضم 48 مكوّنًا وحركة للواجهات.' }, reach: 'private' },
  { name: 'Companion', line: { en: 'A desktop media player for music, video and ambient sound, in four window forms.', ar: 'مشغّل وسائط لسطح المكتب للموسيقى والفيديو والأصوات المحيطة، بأربعة أشكال للنافذة.' }, reach: 'private' },
  { name: 'Memory Card', line: { en: 'A spaced-repetition lab built around the FSRS-5 scheduler.', ar: 'مختبر للمراجعة المتباعدة مبني على جدولة FSRS-5.' }, reach: 'private' },
  { name: 'Zero-G Energy', line: { en: 'A browser camera toy: liquid light tethered to your fingertip.', ar: 'تجربة كاميرا في المتصفح: ضوء سائل يتبع طرف إصبعك.' }, reach: 'private' },
];

export const role: Bilingual = { en: 'To be confirmed', ar: 'بانتظار التأكيد' };
// TODO(owner): Confirm individual or team work and exact role on EACH project.
// TODO(owner): Supply the personal origin story, motivations, and working principles in your own words.
// TODO(owner): Confirm personal skill proficiency; the site currently describes tools found in project files.

export const ticker: Bilingual[] = [
  { en: 'Hadayah Live: release hardening before Google Play', ar: 'منصة هدايه: تجهيز الإصدار قبل Google Play' },
  { en: 'Comms Hub: built-in video and photo studio added', ar: 'مركز الاتصال: إضافة استوديو مدمج للفيديو والصور' },
  { en: 'BookQuest: 75-seat alpha open by invitation', ar: 'BookQuest: نسخة أولية بخمسة وسبعين مقعدًا بالدعوة' },
  { en: 'Hedayah TV: three scenes rotating on office screens', ar: 'لوحة هداية: ثلاثة مشاهد تتناوب على شاشات المكتب' },
  { en: 'NBC: waiting on content and SMS approvals', ar: 'مسابقة الانتماء: بانتظار اعتماد المحتوى والرسائل النصية' },
  { en: 'HAYZ: paused', ar: 'حيّز: متوقف مؤقتًا' },
];

export const copy = {
  en: {
    nav: ['Work', 'About', 'Contact'], skip: 'Skip to content', home: 'Home', theme: 'Theme', system: 'Auto', light: 'Print', dark: 'Lit',
    themeHelp: { system: 'Follow the device setting', light: 'Light theme', dark: 'Dark theme' },
    work: 'Selected work', allWork: 'All projects', contact: 'Contact', caseStudy: 'Explore the case study',
    boardLabel: 'Projects and their status', project: 'Project', status: 'Status',
    statusesAsOf: 'Statuses as of', pauseTicker: 'Pause updates', playTicker: 'Play updates',
    flagshipTitle: 'Hadayah Live, on the phone', flagshipLink: 'Read the Hadayah case study',
    screensTitle: 'Screens from the work', screensIntro: 'Real captures from the projects. Sample data is labelled where it appears.',
    labTitle: 'Smaller things', labIntro: 'Side projects and experiments, one line each.',
    workIntro: 'Eight projects across mobile, web, field work and practical AI tools. Each one has a different problem to solve.',
    filters: { all: 'All', mobile: 'Mobile', web: 'Web', learning: 'Learning', workflow: 'Workflow', data: 'Data', ai: 'AI' },
    about: 'About', aboutTitle: 'Amir, based in Al Khobar.',
    bio: 'I’m Amir Alhatemi, an app developer based in Al Khobar in Saudi Arabia’s Eastern Province. My projects explore educational streaming, shared reading, communication workflows, field operations and local AI tools. Arabic and English are part of how these products are built.',
    moreAbout: 'More about me',
    personalPending: 'A more personal story is still to come.', photo: 'Portrait to come', tools: 'Tools in these projects', toolsIntro: 'These technologies appear in the featured projects.', languages: 'Languages', native: 'Arabic, native', english: 'English, B2-C1',
    approach: 'How I approach the work',
    principles: [ ['Start with the actual task.', 'A reading room, a broadcast, an approval. The product should help someone finish what they came to do.'], ['Treat Arabic as a starting point.', 'Right-to-left layouts and readable Arabic belong in the structure of the experience.'], ['Make boundaries clear.', 'Permissions, private data, and unfinished features should have visible, understandable limits.'], ['Check what people will use.', 'Build in small steps, then check the flows, failure states, and different screen sizes.'] ],
    contactTitle: 'Let’s talk about the work.', contactIntro: 'For project questions or professional conversations.',
    emailPending: 'A public email address will be added here.', emailAction: 'Email', noForm: 'No contact form. No tracking cookies.',
    privacy: 'Privacy', privacyTitle: 'A small site. A clear privacy policy.', privacyIntro: 'This policy covers this portfolio website only. Each featured application has its own data practices.',
    privacySections: [ ['What this site collects', 'This site has no contact form, user accounts, analytics, advertising, or tracking cookies. It does not ask you to submit personal information.'], ['Your preferences', 'If you change the theme, your browser stores that choice locally. The language switch opens the equivalent English or Arabic page. These preferences are not sent anywhere.'], ['Hosting and external links', 'The hosting provider may process ordinary request information, such as IP addresses and server logs, to serve and protect the website. GitHub, LinkedIn, and linked project sites have their own privacy policies.'], ['Fonts, images and video', 'Fonts, images and the two short videos are served with this site. No third-party video player, social feed, or font service is embedded. Project images are screenshots from public sites or captures from the project files. Captures with sample data are labelled.'], ['Questions', 'Use the profile links on the Contact page until a dedicated public address is supplied.'] ],
    projects: 'Projects', problem: 'The problem', audience: 'Who it is for', highlights: 'What is implemented', stack: 'Built with', role: 'My contribution', currentBoundary: 'Where it stands', figures: 'By the numbers', stage: 'Stage', reach: 'Access',
    views: 'Views', viewA: 'A', viewB: 'B', arabic: 'العربية', englishView: 'English', phone: 'Phone', desktop: 'Desktop', day: 'Daylight', dusk: 'Dusk', evening: 'Evening', original: 'Original identity', official: 'Official identity',
    gallery: 'More screens', film: 'Launch film', playFilm: 'Play the launch film', flip: 'Page flip',
    next: 'Next project', back: 'All projects', visit: 'Open the project site', toConfirm: 'to be confirmed',
    notFound: 'This page isn’t here.', notFoundText: 'The address may have changed. You can return home or explore the projects.', returnHome: 'Return home',
    footer: 'Amir Alhatemi', footerLine: 'Apps with Arabic at the heart.', result: 'projects shown', portraitAlt: 'Portrait of Amir Alhatemi',
  },
  ar: {
    nav: ['الأعمال', 'عنّي', 'تواصل'], skip: 'تجاوز إلى المحتوى', home: 'الرئيسية', theme: 'المظهر', system: 'تلقائي', light: 'مطبوع', dark: 'مضاء',
    themeHelp: { system: 'اتّباع إعداد الجهاز', light: 'المظهر الفاتح', dark: 'المظهر الداكن' },
    work: 'أعمال مختارة', allWork: 'كل المشاريع', contact: 'تواصل', caseStudy: 'تعرّف على المشروع',
    boardLabel: 'المشاريع وحالتها', project: 'المشروع', status: 'الحالة',
    statusesAsOf: 'الحالات محدّثة في', pauseTicker: 'إيقاف التحديثات', playTicker: 'تشغيل التحديثات',
    flagshipTitle: 'منصة هدايه على الهاتف', flagshipLink: 'تفاصيل مشروع هدايه',
    screensTitle: 'شاشات من الأعمال', screensIntro: 'لقطات حقيقية من المشاريع، مع الإشارة إلى البيانات التوضيحية حيث وُجدت.',
    labTitle: 'أعمال أصغر', labIntro: 'مشاريع جانبية وتجارب، بسطر واحد لكل منها.',
    workIntro: 'ثمانية مشاريع بين تطبيقات الهاتف والويب والعمل الميداني وأدوات الذكاء الاصطناعي، ولكل منها حاجة يعالجها.',
    filters: { all: 'الكل', mobile: 'الهاتف', web: 'الويب', learning: 'التعلّم', workflow: 'سير العمل', data: 'البيانات', ai: 'الذكاء الاصطناعي' },
    about: 'عنّي', aboutTitle: 'أمير، من الخبر.',
    bio: 'أنا أمير الحاتمي، مطوّر تطبيقات مقيم في الخبر بالمنطقة الشرقية من المملكة العربية السعودية. تشمل مشاريعي البث التعليمي والقراءة المشتركة وإدارة أعمال الاتصال والعمل الميداني وأدوات الذكاء الاصطناعي المحلية. وترافق العربية والإنجليزية بناء هذه المنتجات من بدايتها.',
    moreAbout: 'المزيد عنّي',
    personalPending: 'سأضيف قصتي الشخصية هنا لاحقًا.', photo: 'الصورة الشخصية لاحقًا', tools: 'أدوات مستخدمة في المشاريع', toolsIntro: 'هذه التقنيات موجودة في المشاريع المعروضة.', languages: 'اللغات', native: 'العربية، اللغة الأم', english: 'الإنجليزية، B2-C1',
    approach: 'كيف أتعامل مع العمل',
    principles: [ ['ابدأ بالحاجة الفعلية.', 'غرفة قراءة أو بث أو اعتماد محتوى؛ قيمة المنتج في مساعدة المستخدم على إنجاز ما جاء من أجله.'], ['اجعل العربية نقطة البداية.', 'اتجاه الكتابة ووضوح الخط العربي جزء من بنية التجربة.'], ['وضّح حدود التجربة.', 'الصلاحيات والبيانات الخاصة وما لم يكتمل بعد، كلها تحتاج إلى حدود ظاهرة ومفهومة.'], ['اختبر ما سيستخدمه الناس.', 'خطوات صغيرة، يتبعها فحص للمسارات وحالات التعثّر وأحجام الشاشات المختلفة.'] ],
    contactTitle: 'لنتحدّث عن العمل.', contactIntro: 'للاستفسار عن المشاريع أو للتواصل المهني.',
    emailPending: 'سأضيف عنوان بريد عامًا هنا.', emailAction: 'البريد', noForm: 'دون نموذج تواصل أو ملفات تتبّع.',
    privacy: 'الخصوصية', privacyTitle: 'موقع بسيط، وسياسة خصوصية واضحة.', privacyIntro: 'تخص هذه السياسة موقع الأعمال هذا فقط. ولكل تطبيق معروض ممارساته الخاصة في التعامل مع البيانات.',
    privacySections: [ ['ما يجمعه الموقع', 'لا يحتوي الموقع على نموذج تواصل أو حسابات مستخدمين أو تحليلات أو إعلانات أو ملفات تعريف ارتباط للتتبّع، ولا يطلب منك تقديم بيانات شخصية.'], ['تفضيلاتك', 'إذا غيّرت المظهر، يحفظ المتصفّح اختيارك محليًا. وينقلك زر اللغة إلى الصفحة المقابلة بالعربية أو الإنجليزية. لا تُرسل هذه التفضيلات إلى أي جهة.'], ['الاستضافة والروابط الخارجية', 'قد يعالج مزوّد الاستضافة معلومات الطلب المعتادة، مثل عنوان IP وسجلات الخادم، لتقديم الموقع وحمايته. ولمواقع GitHub وLinkedIn والمشاريع المرتبطة سياسات خصوصية مستقلة.'], ['الخطوط والصور والفيديو', 'تُحمّل الخطوط والصور والمقطعان القصيران من الموقع نفسه. لا يوجد مشغّل فيديو خارجي أو خلاصات اجتماعية أو خدمات خطوط خارجية مضمّنة. صور المشاريع لقطات من المواقع العامة أو من ملفات المشاريع، مع الإشارة إلى البيانات التوضيحية.'], ['الاستفسارات', 'يمكن استخدام روابط الحسابات المهنية في صفحة التواصل إلى حين إضافة عنوان بريد عام.'] ],
    projects: 'المشاريع', problem: 'المشكلة', audience: 'لمن صُمّم؟', highlights: 'ما يتضمّنه المشروع', stack: 'التقنيات المستخدمة', role: 'مساهمتي', currentBoundary: 'أين وصل المشروع؟', figures: 'بالأرقام', stage: 'المرحلة', reach: 'الوصول',
    views: 'العرض', viewA: 'أ', viewB: 'ب', arabic: 'العربية', englishView: 'English', phone: 'الهاتف', desktop: 'سطح المكتب', day: 'نهارًا', dusk: 'مساءً', evening: 'المظهر الليلي', original: 'الهوية الأولى', official: 'الهوية الرسمية',
    gallery: 'شاشات أخرى', film: 'الفيلم التعريفي', playFilm: 'تشغيل الفيلم التعريفي', flip: 'تقليب الصفحة',
    next: 'المشروع التالي', back: 'كل المشاريع', visit: 'زيارة موقع المشروع', toConfirm: 'بانتظار التأكيد',
    notFound: 'هذه الصفحة غير موجودة.', notFoundText: 'ربما تغيّر الرابط. يمكنك العودة إلى الرئيسية أو تصفّح المشاريع.', returnHome: 'العودة إلى الرئيسية',
    footer: 'أمير الحاتمي', footerLine: 'تطبيقات تضع العربية في صميمها.', result: 'مشاريع معروضة', portraitAlt: 'صورة أمير الحاتمي',
  },
};
