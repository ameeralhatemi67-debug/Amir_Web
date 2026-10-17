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
  // TODO(owner): Supply a public support/contact email. Never substitute a personal inbox.
  email: '',
  headline: { en: 'App developer building Arabic-first products.', ar: 'مطوّر تطبيقات يضع العربية في صميم التجربة.' },
  description: {
    en: 'Amir Alhatemi is an app developer based in Al Khobar, Saudi Arabia. Explore Arabic-first apps for learning, communication, and departmental work.',
    ar: 'أمير الحاتمي، مطوّر تطبيقات مقيم في الخبر بالمملكة العربية السعودية. تعرّف على مشاريعي في التعلّم والتواصل وأدوات العمل.'
  },
};

export type Project = {
  slug: string; name: Bilingual; pitch: Bilingual; category: Bilingual;
  tags: string[]; stack: string[]; status: Bilingual;
  problem: Bilingual; audience: Bilingual; highlights: Bilingual[];
  boundary: Bilingual; link?: string;
};

// Project descriptions are based on the owner's six local repositories, read-only.
// No project source code, credentials, or private records are copied. Screenshots come from the supplied public sites and inspected source-project assets.
export const projects: Project[] = [
  {
    slug: 'hadayah-live',
    name: { en: 'Hadayah Live', ar: 'منصة هدايه' },
    pitch: { en: 'A place to discover live lessons and the people sharing them.', ar: 'مكان يجمع البث المباشر للدروس، ويقرّبك من أهل العلم.' },
    category: { en: 'Learning & live streaming', ar: 'التعلّم والبث المباشر' },
    tags: ['mobile', 'web', 'learning'],
    stack: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'YouTube', 'RTMP'],
    status: { en: 'Preparing for Google Play', ar: 'قيد التجهيز للنشر على Google Play' },
    problem: { en: 'Educational and religious broadcasts are spread across channels. Finding a relevant lesson, its schedule, or its physical venue can take several separate searches. Hadayah brings discovery, playback, and location into one experience.', ar: 'تتوزع الدروس والمحاضرات بين قنوات متعددة، وقد يحتاج الوصول إلى البث وموعده ومكان إقامته إلى أكثر من بحث. تجمع هدايه اكتشاف الدروس ومشاهدتها ومواقعها في تجربة واحدة.' },
    audience: { en: 'People following educational and religious lessons, alongside approved broadcasters and organizations managing their own channels.', ar: 'متابعو الدروس والمحاضرات، والمقدّمون المعتمدون، والجهات التي تدير قنواتها ومحتواها.' },
    highlights: [
      { en: 'Arabic and English discovery, with native RTL layouts and an Eastern Province map.', ar: 'اكتشاف المحتوى بالعربية والإنجليزية، مع دعم أصيل لاتجاه العربية وخريطة للمنطقة الشرقية.' },
      { en: 'YouTube live and recorded playback, with bookmarks for recordings and upcoming lessons.', ar: 'مشاهدة البث والتسجيلات عبر YouTube، وحفظ التسجيلات والدروس القادمة للرجوع إليها.' },
      { en: 'Android camera and microphone publishing through an RTMP bridge.', ar: 'بث الكاميرا والميكروفون من Android عبر تكامل RTMP.' },
      { en: 'Live chat, reporting, moderation tools, and database-enforced administration roles.', ar: 'محادثة مباشرة وإبلاغ عن المخالفات وأدوات إشراف وصلاحيات إدارية تفرضها قاعدة البيانات.' },
      { en: 'Account data export and a guarded account-deletion flow.', ar: 'تصدير بيانات الحساب ومسار لحذفه مع معالجة الحالات التي تحتاج إلى إجراء مسبق.' },
    ],
    boundary: { en: 'The Android app is preparing for Google Play. Release configuration and acceptance checks remain. Push-reminder delivery is not claimed as complete.', ar: 'تطبيق Android قيد التجهيز للنشر على Google Play. ما زالت هناك إعدادات وفحوص قبول قبل الإصدار، ولم يكتمل التحقق من وصول تذكيرات الإشعارات.' },
    link: 'https://stream-application-ten.vercel.app/#/feed',
    // TODO(owner): Provide approved Hadayah privacy-policy and account-deletion URLs.
  },
  {
    slug: 'comms-hub',
    name: { en: 'Comms Hub', ar: 'مركز الاتصال المؤسسي' },
    pitch: { en: 'One workspace for the work behind institutional communication.', ar: 'مساحة واحدة لتنظيم العمل خلف كل رسالة مؤسسية.' },
    category: { en: 'Communication workflow', ar: 'إدارة أعمال الاتصال' },
    tags: ['web', 'workflow'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL'],
    status: { en: 'In development', ar: 'قيد التطوير' },
    problem: { en: 'Communication work passes between writers, designers, reviewers, and publishers. Comms Hub keeps the work, its versions, and the approval of each version connected, so a later edit does not inherit an earlier approval.', ar: 'ينتقل عمل الاتصال بين الكاتب والمصمّم والمراجع ومسؤول النشر. يربط المركز العمل بنسخه واعتماد كل نسخة، حتى لا يُعامل التعديل الجديد على أنه معتمد مسبقًا.' },
    audience: { en: 'Institutional communication teams coordinating content, media, review, and publishing responsibilities.', ar: 'فرق الاتصال المؤسسي التي تنسّق المحتوى والإنتاج الإعلامي والمراجعة ومسؤوليات النشر.' },
    highlights: [
      { en: 'Version-bound approvals, review cycles, and a shared work history.', ar: 'اعتمادات مرتبطة بنسخة محددة، ودورات مراجعة، وسجل مشترك للعمل.' },
      { en: 'Media library, internal mail, team messaging, and planning tools.', ar: 'مكتبة إعلامية وبريد داخلي ومراسلة للفريق وأدوات للتخطيط.' },
      { en: 'Role and capability rules enforced in PostgreSQL.', ar: 'أدوار وصلاحيات تفرضها PostgreSQL.' },
      { en: 'Storage-provider configuration, verified-copy workflows, and manual backup tools.', ar: 'إعداد مزوّدي التخزين، والتحقق من نسخ الملفات، وأدوات نسخ احتياطي يدوية.' },
    ],
    boundary: { en: 'Social publishing is simulated. Several external connections and storage flows still require real-account acceptance testing.', ar: 'النشر على المنصات محاكاة حاليًا. بعض الاتصالات الخارجية ومسارات التخزين تحتاج إلى اختبار قبول بحسابات فعلية.' },
    link: 'https://comms-hub-three.vercel.app/',
    // TODO(owner): Confirm contribution scope and any naming/disclosure restrictions for Comms Hub.
  },
  {
    slug: 'bookquest',
    name: { en: 'BookQuest', ar: 'BookQuest' },
    pitch: { en: 'Read at your pace. Meet your friends in the margins.', ar: 'اقرأ على مهل، والتقِ بأصدقائك بين الهوامش.' },
    category: { en: 'Shared reading', ar: 'القراءة المشتركة' },
    tags: ['web', 'learning'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'EPUB.js', 'PDF.js'],
    status: { en: 'Closed web alpha', ar: 'نسخة ألفا مغلقة للويب' },
    problem: { en: 'Reading together should not require everyone to stay on the same page. BookQuest lets a group share a book while keeping later notes and media hidden until each reader reaches them.', ar: 'القراءة مع الأصدقاء لا تعني أن يتقدّم الجميع بالسرعة نفسها. يتيح BookQuest مشاركة الكتاب، مع إخفاء الملاحظات والوسائط اللاحقة حتى يصل القارئ إلى موضعها.' },
    audience: { en: 'Friends and small reading groups sharing an EPUB or PDF in a private room.', ar: 'الأصدقاء ومجموعات القراءة الصغيرة التي تتشارك كتاب EPUB أو PDF داخل غرفة خاصة.' },
    highlights: [
      { en: 'EPUB and PDF readers with saved progress and adjustable reading layouts.', ar: 'قارئ EPUB وPDF مع حفظ التقدّم وخيارات لضبط تجربة القراءة.' },
      { en: 'Spoiler-gated notes, replies, reactions, and private attachments.', ar: 'ملاحظات وردود وتفاعلات ومرفقات خاصة، تظهر بحسب تقدّم القارئ.' },
      { en: 'Private rooms, invitations, reader presence, and audience controls for notes.', ar: 'غرف خاصة ودعوات وحضور القرّاء وتحديد من يرى كل ملاحظة.' },
      { en: 'Shared soundtracks and optional audio cues tied to a place in the book.', ar: 'قوائم صوتية مشتركة ومقاطع اختيارية مرتبطة بمواضع في الكتاب.' },
    ],
    boundary: { en: 'The public site currently presents a closed web alpha under the name Marginalia. Full offline startup is not supported.', ar: 'يعرض الموقع العام حاليًا نسخة ألفا مغلقة باسم Marginalia. لا يُدعم بدء التطبيق كاملًا دون اتصال.' },
    link: 'https://book-quest-ecru.vercel.app/',
    // TODO(owner): Choose BookQuest or Marginalia as the final portfolio project name.
  },
  {
    slug: 'nbc',
    name: { en: 'NBC competition platform', ar: 'مسابقة الانتماء واللحمة الوطنية' },
    pitch: { en: 'A book-based competition, from reading to final submission.', ar: 'رحلة مسابقة تبدأ بالقراءة وتنتهي بمشاركة معتمدة.' },
    category: { en: 'Reading & participation', ar: 'القراءة والمشاركة' },
    tags: ['web', 'learning', 'workflow'],
    stack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'PDF.js'],
    status: { en: 'In development', ar: 'قيد التطوير' },
    problem: { en: 'A book-based competition needs a clear participant journey and controlled content review. This platform connects the book, education-stage questions, saved answers, and final submission with a separate committee workflow.', ar: 'تحتاج المسابقة المعتمدة على كتاب إلى رحلة واضحة للمشارك ومراجعة منضبطة للمحتوى. تربط المنصة الكتاب بأسئلة المرحلة التعليمية وحفظ الإجابات وتسليمها النهائي، مع مسار مستقل للجنة.' },
    audience: { en: 'Participants in different education stages and the staff reviewing competition content and operations.', ar: 'المشاركون في المراحل التعليمية المختلفة، والفريق المسؤول عن مراجعة محتوى المسابقة وتشغيلها.' },
    highlights: [
      { en: 'An integrated PDF reader and education-stage question sets.', ar: 'قارئ PDF مدمج ومجموعات أسئلة بحسب المرحلة التعليمية.' },
      { en: 'Answers can be revised until the participant confirms final submission.', ar: 'إمكانية تعديل الإجابات حتى تأكيد التسليم النهائي.' },
      { en: 'Durable answer synchronization and isolated administrator test runs.', ar: 'مزامنة مستمرة للإجابات وتجارب إدارية معزولة عن المشاركات الفعلية.' },
      { en: 'Content approval, campaign lifecycle, and participant-verification controls.', ar: 'اعتماد المحتوى وإدارة مراحل المسابقة وضوابط التحقق من المشاركين.' },
    ],
    boundary: { en: 'Content approval, privacy decisions, SMS readiness, and operational acceptance remain launch dependencies. No launched campaign or client endorsement is claimed.', ar: 'ما زال الإطلاق يعتمد على اعتماد المحتوى وقرارات الخصوصية وجاهزية الرسائل النصية والقبول التشغيلي. لا يُدّعى هنا إطلاق المسابقة أو وجود تزكية من جهة.' },
    link: 'https://nbc-web-two.vercel.app/',
    // TODO(owner): Confirm exact contribution, approved public naming and project-launch status for NBC.
  },
  {
    slug: 'hedayah-dashboard',
    name: { en: 'Hedayah TV dashboard', ar: 'لوحة هداية للشاشات' },
    pitch: { en: 'Turn operational data into a clear, shared picture.', ar: 'بيانات العمل في صورة واضحة يراها الجميع.' },
    category: { en: 'Data & display systems', ar: 'البيانات وأنظمة العرض' },
    tags: ['web', 'data'],
    stack: ['React', 'TypeScript', 'Vite', 'D3', 'Vercel Functions', 'Vercel Blob'],
    status: { en: 'Deployed dashboard', ar: 'لوحة منشورة' },
    problem: { en: 'Spreadsheet activity is difficult to follow from across a room. This dashboard turns selected operational data into rotating television-ready scenes, while separating public display fields from sensitive source records.', ar: 'يصعب متابعة تفاصيل جداول البيانات على شاشة بعيدة. تحوّل اللوحة بيانات مختارة إلى مشاهد متتابعة مناسبة لشاشات العرض، مع فصل الحقول العامة عن السجلات الحساسة.' },
    audience: { en: 'Office teams viewing high-level activity on shared televisions and web displays.', ar: 'فرق العمل التي تتابع النشاط العام عبر شاشات المكتب وصفحات العرض.' },
    highlights: [
      { en: 'Television-oriented scenes, geographic views, and readable activity summaries.', ar: 'مشاهد مهيأة للتلفاز وعرض جغرافي وملخصات نشاط واضحة.' },
      { en: 'Server-side transformation of spreadsheet sources into selected public fields.', ar: 'تحويل مصادر الجداول في الخادم إلى حقول مختارة للعرض العام.' },
      { en: 'Private last-known-good backups and source-health endpoints.', ar: 'نسخ احتياطية خاصة لآخر بيانات سليمة ونقاط لفحص حالة المصادر.' },
      { en: 'Responsive layouts and a separate visual experimentation sandbox.', ar: 'تخطيطات متجاوبة ومساحة مستقلة لتجربة الأفكار البصرية.' },
    ],
    boundary: { en: 'The public dashboard is reachable. Source health still needs rechecking; the project status records an unresolved monthly-report source.', ar: 'لوحة العرض العامة متاحة. ما زالت حالة المصادر تحتاج إلى إعادة فحص، إذ يسجّل توثيق المشروع مشكلة غير محلولة في مصدر التقارير الشهرية.' },
    link: 'https://hedayah-dashboard.vercel.app/',
    // TODO(owner): Recheck dashboard source health and confirm contribution scope.
  },
  {
    slug: 'hida',
    name: { en: 'Hida workspace', ar: 'مساحة عمل هداية' },
    pitch: { en: 'A local assistant connected to the documents behind the work.', ar: 'مساعد محلي يستند إلى المستندات التي يعتمد عليها العمل.' },
    category: { en: 'AI & departmental tools', ar: 'الذكاء الاصطناعي وأدوات العمل' },
    tags: ['ai', 'workflow'],
    stack: ['Python', 'FastAPI', 'SQLite', 'Ollama', 'JavaScript', 'Node.js'],
    status: { en: 'Local department pilot', ar: 'تجربة محلية لقسم عمل' },
    problem: { en: 'Department knowledge is spread across documents, spreadsheets, and repeated requests. Hida connects a local assistant to approved sources and separates personal conversations, shared knowledge, and governed requests for new capabilities.', ar: 'تتوزع معرفة القسم بين المستندات والجداول والطلبات المتكررة. يربط هداية مساعدًا محليًا بالمصادر المعتمدة، ويفصل المحادثات الشخصية عن المعرفة المشتركة وطلبات القدرات الجديدة الخاضعة للمراجعة.' },
    audience: { en: 'A small department pilot, with distinct member, manager, and administrator responsibilities.', ar: 'فريق صغير في تجربة قسمية، مع مسؤوليات مستقلة للعضو والمدير والمشرف.' },
    highlights: [
      { en: 'Arabic and English conversations grounded in approved local documents.', ar: 'محادثات بالعربية والإنجليزية تستند إلى مستندات محلية معتمدة.' },
      { en: 'Local model routing, optional cloud providers, and visible model choices.', ar: 'توجيه بين النماذج المحلية ومزوّدو سحابة اختياريون مع اختيار واضح للنموذج.' },
      { en: 'Report exports, file management, private/shared memory, and source references.', ar: 'تصدير التقارير وإدارة الملفات وذاكرة خاصة أو مشتركة وإحالات إلى المصادر.' },
      { en: 'Governed capability requests and a bounded WhatsApp Web bridge.', ar: 'طلبات قدرات تخضع للمراجعة وتكامل محدود مع WhatsApp Web.' },
    ],
    boundary: { en: 'This is a local pilot, not an organization-wide service. General tool building and remote access remain unfinished. Model quality still needs evaluation with department users.', ar: 'هذا مشروع تجريبي محلي ولم يُعتمد خدمةً على مستوى المؤسسة. بناء الأدوات العامة والوصول عن بُعد لم يكتملا، وجودة الإجابات تحتاج إلى تقييم مع مستخدمي القسم.' },
    // TODO(owner): Confirm exact contribution and any departmental disclosure restrictions for Hida.
  },
];

export const role: Bilingual = { en: 'Project contribution; exact responsibilities to be confirmed.', ar: 'مساهمة في المشروع؛ تفاصيل المسؤوليات تحتاج إلى تأكيد.' };
// TODO(owner): Confirm individual or team work and exact role on EACH of the six projects.
// TODO(owner): Supply the personal origin story, motivations, and working principles in your own words.
// TODO(owner): Confirm personal skill proficiency; the site currently describes tools found in project files.
// TODO(owner): Supply an approved portrait if desired. The About page currently uses a labeled photo placeholder.

export const copy = {
  en: {
    nav: ['Work', 'About', 'Contact'], skip: 'Skip to content', home: 'Home', theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark',
    work: 'Selected work', allWork: 'Explore all projects', seeWork: 'See my work', contact: 'Contact', caseStudy: 'Explore the case study',
    intro: 'Apps for learning, communication, and the work in between. Built with Arabic at the heart of the experience.',
    featured: 'Featured project', moreWork: 'Other projects', readProject: 'View project',
    workIntro: 'Six projects across mobile, web, and practical AI tools. Each has a different problem to solve.',
    filters: { all: 'All projects', mobile: 'Mobile', web: 'Web', learning: 'Learning', workflow: 'Workflow', data: 'Data', ai: 'AI' },
    about: 'A little about me', aboutTitle: 'Amir, based in Al Khobar.',
    bio: 'I’m Amir Alhatemi, an app developer based in Al Khobar in Saudi Arabia’s Eastern Province. My projects explore educational streaming, shared reading, communication workflows, and local AI tools. Arabic and English are part of how these products are built.',
    personalPending: 'A more personal story is still to come.', photo: 'Portrait to come', tools: 'Tools in these projects', languages: 'Languages', native: 'Arabic, native', english: 'English, B2–C1',
    approach: 'How I approach the work', approachIntro: 'The choices reflected in these projects.',
    principles: [ ['Start with the actual task.', 'A reading room, a broadcast, an approval. The product should help someone finish what they came to do.'], ['Treat Arabic as a starting point.', 'Right-to-left layouts and readable Arabic belong in the structure of the experience.'], ['Make boundaries clear.', 'Permissions, private data, and unfinished features should have visible, understandable limits.'], ['Check what people will use.', 'Build in small steps, then check the flows, failure states, and different screen sizes.'] ],
    contactTitle: 'Let’s talk about the work.', contactIntro: 'For project questions or professional conversations, you can find me on GitHub and LinkedIn.',
    emailPending: 'A public support email will be added here.', emailAction: 'Send an email', noForm: 'No contact form. No tracking cookies.',
    privacy: 'Privacy', privacyTitle: 'A small site. A clear privacy policy.', privacyIntro: 'This policy covers this portfolio website only. Each featured application has its own data practices.',
    privacySections: [ ['What this site collects', 'This site has no contact form, user accounts, analytics, advertising, or tracking cookies. It does not ask you to submit personal information.'], ['Your preferences', 'If you change the theme, your browser stores that choice locally. The language switch opens the equivalent English or Arabic page. These preferences are not sent to a database.'], ['Hosting and external links', 'When published, the hosting provider may process ordinary request information, such as IP addresses and server logs, to serve and protect the website. GitHub, LinkedIn, and linked project sites have their own privacy policies.'], ['Fonts and images', 'Fonts and images are served with this site. No third-party video, social feed, or font service is embedded. Project images are screenshots from the public sites or inspected source-project captures. The Comms Hub design review contains labeled sample data.'], ['Questions', 'Use the professional profile links on the Contact page until a dedicated public support address is supplied.'] ],
    projects: 'Projects', problem: 'The problem', audience: 'Who it is for', highlights: 'What is implemented', stack: 'Built with', role: 'My contribution', status: 'Current status', currentBoundary: 'Where it stands',
    architecture: 'How Hadayah fits together', architectureIntro: 'The app connects discovery and account data with a separate video delivery and publishing path.',
    safety: 'Privacy and safety', safetyText: 'Moderation includes reporting, chat controls, and role checks enforced in the database. Settings include account-data export and deletion. Deletion can require resolving an active broadcast, organization ownership, or uploaded files first.',
    policyPending: 'Approved app privacy-policy and account-deletion links will be added before launch.',
    next: 'Next project', back: 'All projects', visit: 'Open project website', mockup: 'Real project screenshot.',
    notFound: 'This page isn’t here.', notFoundText: 'The address may have changed. You can return home or explore the projects.', returnHome: 'Return home',
    footer: 'Amir Alhatemi', footerLine: 'Apps with Arabic at the heart.', result: 'projects shown',
  },
  ar: {
    nav: ['الأعمال', 'عنّي', 'تواصل'], skip: 'تجاوز إلى المحتوى', home: 'الرئيسية', theme: 'المظهر', system: 'النظام', light: 'فاتح', dark: 'داكن',
    work: 'أعمال مختارة', allWork: 'تصفّح جميع المشاريع', seeWork: 'شاهد أعمالي', contact: 'تواصل معي', caseStudy: 'تعرّف على المشروع',
    intro: 'تطبيقات للتعلّم والتواصل وتيسير العمل. والعربية في صميم تجربتها.',
    featured: 'المشروع الرئيسي', moreWork: 'مشاريع أخرى', readProject: 'تفاصيل المشروع',
    workIntro: 'ستة مشاريع بين تطبيقات الهاتف والويب وأدوات الذكاء الاصطناعي، ولكل منها حاجة يعالجها.',
    filters: { all: 'كل المشاريع', mobile: 'الهاتف', web: 'الويب', learning: 'التعلّم', workflow: 'سير العمل', data: 'البيانات', ai: 'الذكاء الاصطناعي' },
    about: 'نبذة عنّي', aboutTitle: 'أمير، من الخبر.',
    bio: 'أنا أمير الحاتمي، مطوّر تطبيقات مقيم في الخبر بالمنطقة الشرقية من المملكة العربية السعودية. تشمل مشاريعي البث التعليمي والقراءة المشتركة وإدارة أعمال الاتصال وأدوات الذكاء الاصطناعي المحلية. وترافق العربية والإنجليزية بناء هذه المنتجات من بدايتها.',
    personalPending: 'سأضيف قصتي الشخصية هنا لاحقًا.', photo: 'الصورة الشخصية لاحقًا', tools: 'أدوات مستخدمة في المشاريع', languages: 'اللغات', native: 'العربية، اللغة الأم', english: 'الإنجليزية، B2–C1',
    approach: 'كيف أتعامل مع العمل', approachIntro: 'اختيارات تنعكس في هذه المشاريع.',
    principles: [ ['ابدأ بالحاجة الفعلية.', 'غرفة قراءة أو بث أو اعتماد محتوى؛ قيمة المنتج في مساعدة المستخدم على إنجاز ما جاء من أجله.'], ['اجعل العربية نقطة البداية.', 'اتجاه الكتابة ووضوح الخط العربي جزء من بنية التجربة.'], ['وضّح حدود التجربة.', 'الصلاحيات والبيانات الخاصة وما لم يكتمل بعد، كلها تحتاج إلى حدود ظاهرة ومفهومة.'], ['اختبر ما سيستخدمه الناس.', 'خطوات صغيرة، يتبعها فحص للمسارات وحالات التعثّر وأحجام الشاشات المختلفة.'] ],
    contactTitle: 'لنتحدّث عن العمل.', contactIntro: 'للاستفسار عن المشاريع أو التواصل المهني، تجدني على GitHub وLinkedIn.',
    emailPending: 'سأضيف عنوان بريد مخصّصًا للتواصل والدعم هنا.', emailAction: 'أرسل بريدًا', noForm: 'دون نموذج تواصل أو ملفات تتبّع.',
    privacy: 'الخصوصية', privacyTitle: 'موقع بسيط، وسياسة خصوصية واضحة.', privacyIntro: 'تخص هذه السياسة موقع الأعمال هذا فقط. ولكل تطبيق معروض ممارساته الخاصة في التعامل مع البيانات.',
    privacySections: [ ['ما يجمعه الموقع', 'لا يحتوي الموقع على نموذج تواصل أو حسابات مستخدمين أو تحليلات أو إعلانات أو ملفات تعريف ارتباط للتتبّع، ولا يطلب منك تقديم بيانات شخصية.'], ['تفضيلاتك', 'إذا غيّرت المظهر، يحفظ المتصفّح اختيارك محليًا. وينقلك زر اللغة إلى الصفحة المقابلة بالعربية أو الإنجليزية. لا تُرسل هذه التفضيلات إلى قاعدة بيانات.'], ['الاستضافة والروابط الخارجية', 'عند نشر الموقع، قد يعالج مزوّد الاستضافة معلومات الطلب المعتادة، مثل عنوان IP وسجلات الخادم، لتقديم الموقع وحمايته. ولمواقع GitHub وLinkedIn والمشاريع المرتبطة سياسات خصوصية مستقلة.'], ['الخطوط والصور', 'تُحمّل الخطوط والصور من الموقع نفسه. لا توجد مقاطع فيديو أو خلاصات اجتماعية أو خدمات خطوط خارجية مضمّنة. صور المشاريع لقطات من المواقع العامة أو من ملفات المشروع التي فُحصت. تحتوي مراجعة تصميم مركز الاتصال على بيانات توضيحية معرّفة بذلك.'], ['الاستفسارات', 'يمكن استخدام روابط الحسابات المهنية في صفحة التواصل إلى حين إضافة عنوان بريد عام مخصّص للدعم.'] ],
    projects: 'المشاريع', problem: 'المشكلة', audience: 'لمن صُمّم؟', highlights: 'ما يتضمّنه المشروع', stack: 'التقنيات المستخدمة', role: 'مساهمتي', status: 'الحالة الحالية', currentBoundary: 'أين وصل المشروع؟',
    architecture: 'كيف تعمل هدايه؟', architectureIntro: 'يربط التطبيق اكتشاف المحتوى وبيانات الحساب بمسار مستقل للمشاهدة والبث.',
    safety: 'الخصوصية والسلامة', safetyText: 'يشمل الإشراف الإبلاغ وضوابط المحادثة والتحقق من الأدوار داخل قاعدة البيانات. وتتيح الإعدادات تصدير بيانات الحساب وحذفه. قد يتطلب الحذف إنهاء بث قائم أو معالجة ملكية جهة أو إزالة ملفات مرفوعة أولًا.',
    policyPending: 'ستُضاف الروابط المعتمدة لخصوصية التطبيق وحذف الحساب قبل الإطلاق.',
    next: 'المشروع التالي', back: 'كل المشاريع', visit: 'زيارة موقع المشروع', mockup: 'لقطة من المشروع الفعلي.',
    notFound: 'هذه الصفحة غير موجودة.', notFoundText: 'ربما تغيّر الرابط. يمكنك العودة إلى الرئيسية أو تصفّح المشاريع.', returnHome: 'العودة إلى الرئيسية',
    footer: 'أمير الحاتمي', footerLine: 'تطبيقات تضع العربية في صميمها.', result: 'مشاريع معروضة',
  },
};
