/* Imp OS core: words, icons, tiles, routes and the HTML of every window and of the desktop itself.
   Pure string building with no DOM access, so the same code renders the static pages at build time
   (src/pages, through Astro) and the live desktop in the browser (app.js). Content lives in content.json. */
import A from './content.json';

export { A };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* the browser fills these in at start-up; the build uses the defaults */
export const env = { mac: false, rm: false };
export const mod = () => env.mac ? '⌘' : 'Ctrl';

/* language: one live binding shared by every importer; set it only through useLang */
export let lang = 'en';
export const useLang = l => { lang = l === 'ar' ? 'ar' : 'en'; };
export const T = o => (o && typeof o === 'object') ? (o[lang] ?? o.en ?? '') : (o ?? '');
export const rtl = () => lang === 'ar';
export const other = () => rtl() ? 'en' : 'ar';

export const U = {
  work: ['Work', 'الأعمال'], lab: ['Lab', 'المختبر'], films: ['Films', 'الأفلام'], about: ['About', 'نبذة'], contact: ['Contact', 'تواصل'],
  window: ['Window', 'النافذة'], help: ['Help', 'مساعدة'], settings: ['Settings', 'الإعدادات'], terminal: ['Terminal', 'الطرفية'],
  aboutOS: ['About AmirOS', 'عن AmirOS'], start: ['Start here', 'ابدأ من هنا'], aboutAmir: ['About Amir', 'عن أمير'],
  closeAll: ['Close all windows', 'إغلاق كل النوافذ'], cascade: ['Cascade windows', 'ترتيب متتالٍ'], tileAll: ['Tile all windows', 'تجانب كل النوافذ'],
  arrange: ['Arrange windows', 'ترتيب النوافذ'], showDesktop: ['Show desktop', 'إظهار سطح المكتب'], restart: ['Restart', 'إعادة التشغيل'],
  minimize: ['Minimize', 'تصغير'], zoom: ['Zoom', 'تكبير'], close: ['Close', 'إغلاق'], snapLeft: ['Snap to the left', 'محاذاة لليسار'], snapRight: ['Snap to the right', 'محاذاة لليمين'],
  restore: ['Restore', 'استعادة'], noWindows: ['No open windows', 'لا توجد نوافذ مفتوحة'], openWindows: ['Open windows', 'النوافذ المفتوحة'],
  shortcuts: ['Keyboard shortcuts', 'اختصارات لوحة المفاتيح'], search: ['Search', 'بحث'], searchPh: ['Search projects, films, actions…', 'ابحث في المشاريع والأفلام والأوامر…'],
  searchHint: ['↑ ↓ to move · Enter to open · Esc to close', '↑ ↓ للتنقل · Enter للفتح · Esc للإغلاق'], noResults: ['Nothing matches. Try “films”, “Hatan” or “email”.', 'لا توجد نتائج. جرّب «أفلام» أو «هتّان» أو «البريد».'],
  app: ['App', 'تطبيق'], project: ['Project', 'مشروع'], action: ['Action', 'أمر'], film: ['Film', 'فيلم'], labItem: ['Lab', 'المختبر'],
  openWork: ['Open my work', 'افتح أعمالي'], allProjects: ['All projects', 'كل المشاريع'], nowShipping: ['Now shipping', 'قيد العمل الآن'],
  reachAmir: ['Reach Amir', 'تواصل مع أمير'], edu: ['Education', 'التعليم'], impName: ['Imp', 'إمب'],
  impIntro: ['The little one walking on these windows is Imp, this desktop’s resident pet. Poke him, drag him, right-click him, or let him flip the lights.', 'الصغير الذي يتجوّل فوق النوافذ هو «إمب»، الحيوان الأليف لهذا المكتب. المسه أو اسحبه أو انقر عليه بالزر الأيمن، أو دعه يقلب الإضاءة.'],
  impLine: ['Lives on this desktop. Drag him, throw him, poke him.', 'يعيش على هذا المكتب. اسحبه أو ارمه أو المسه.'],
  impOnDesk: ['Imp on the desktop', 'إمب على سطح المكتب'], flip: ['Flip the lights', 'اقلب الإضاءة'], laugh: ['Make him laugh', 'أضحِكه'], hideImp: ['Hide Imp', 'إخفاء إمب'],
  grow: ['Grow', 'كبّره'], shrink: ['Shrink', 'صغّره'], impSize: ['Imp’s size', 'حجم إمب'], porch: ['Imp’s porch · poke him, drag him', 'شرفة إمب · المسه أو اسحبه'],
  overview: ['Overview', 'نظرة عامة'], screens: ['Screens', 'الشاشات'], facts: ['Facts', 'الأرقام'], tools: ['Tools', 'الأدوات'], all: ['All', 'الكل'],
  featured: ['Highlights', 'أبرز ما فيه'], moreLike: ['More like this', 'مشاريع مشابهة'], seeScreens: ['See all screens', 'كل الشاشات'], watchFilms: ['Watch the films', 'شاهد الأفلام'],
  meetTools: ['Meet the three tools', 'تعرّف على الأدوات الثلاث'], playsOnHover: ['Plays on hover', 'يعمل عند التمرير'],
  prev: ['Previous', 'السابق'], next: ['Next', 'التالي'], play: ['Play', 'تشغيل'], pause: ['Pause', 'إيقاف مؤقت'], soundOn: ['Sound on', 'تشغيل الصوت'], soundOff: ['Mute', 'كتم الصوت'], seek: ['Seek', 'التقديم'],
  waking: ['Waking up Imp…', 'نوقظ إمب…'], restarting: ['Restarting AmirOS…', 'نعيد تشغيل AmirOS…'], skip: ['Click or press any key to skip', 'انقر أو اضغط أي مفتاح للتخطي'], khobar: ['Al Khobar', 'الخبر'],
  projects: ['projects', 'مشروعًا'], filmsN: ['films', 'أفلام'], toDark: ['Switch to dusk', 'التبديل إلى الغسق'], toLight: ['Switch to morning', 'التبديل إلى الصباح'],
  toLang: ['Switch to Arabic', 'التبديل إلى الإنجليزية'], role: ['Role', 'الدور'], based: ['Based in', 'المدينة'], speaks: ['Speaks', 'اللغات'],
  localTime: ['Local time in Al Khobar', 'التوقيت المحلي في الخبر'], menuBar: ['Menu bar', 'شريط القوائم'], dock: ['Dock', 'شريط التطبيقات'],
  desktop: ['Desktop', 'سطح المكتب'], home: ['Home screen', 'الشاشة الرئيسية'], minimized: ['Minimized', 'مصغّرة'], email: ['Email', 'البريد'], swipe: ['Drag down to close', 'اسحب للأسفل للإغلاق'],
  appearance: ['Appearance', 'المظهر'], themeL: ['Theme', 'السمة'], auto: ['Auto', 'تلقائي'], lightL: ['Morning', 'صباح'], darkL: ['Dusk', 'غسق'], accent: ['Accent colour', 'لون التمييز'],
  wallpaper: ['Wallpaper', 'الخلفية'], languageL: ['Language', 'اللغة'], motion: ['Motion', 'الحركة'], reduceMotion: ['Reduce motion', 'تقليل الحركة'],
  reduceNote: ['Stops drifting wallpapers, previews and the boot screen. Your system setting is respected too.', 'يوقف حركة الخلفيات والمعاينات وشاشة البدء، ويحترم إعداد نظامك أيضًا.'],
  systemReduces: ['Your system already asks for less motion.', 'نظامك يطلب حركة أقل بالفعل.'], deskL: ['Desktop', 'سطح المكتب'], iconOrder: ['Icon order', 'ترتيب الأيقونات'],
  byDefault: ['Default', 'الافتراضي'], byName: ['By name', 'حسب الاسم'], byStage: ['By stage', 'حسب المرحلة'], showWidgets: ['Show widgets', 'إظهار الأدوات المصغّرة'], reset: ['Reset settings', 'استعادة الإعدادات'],
  arrangeIcons: ['Arrange icons', 'ترتيب الأيقونات'], changeWall: ['Change wallpaper', 'تغيير الخلفية'], settingsDots: ['Settings…', 'الإعدادات…'],
  W_corniche: ['Corniche', 'الكورنيش'], W_aurora: ['Aurora', 'شفق'], W_dunes: ['Dunes', 'كثبان'], W_pixel: ['Pixel sun', 'شمس بكسلية'],
  A_amber: ['Amber', 'كهرماني'], A_coral: ['Coral', 'مرجاني'], A_teal: ['Teal', 'فيروزي'], A_sky: ['Sky', 'سماوي'], A_lime: ['Lime', 'ليموني'],
  t_copied: ['Email copied', 'تم نسخ البريد'], t_theme: ['Lights flipped', 'تم قلب الإضاءة'], t_wall: ['Wallpaper changed', 'تم تغيير الخلفية'], t_accent: ['Accent changed', 'تم تغيير اللون'],
  t_tiled: ['Windows tiled', 'تم تجانب النوافذ'], t_cascaded: ['Windows cascaded', 'تم ترتيب النوافذ'], t_snapped: ['Snapped', 'تمت المحاذاة'], t_desktop: ['Desktop shown', 'ظهر سطح المكتب'],
  t_grow: ['Imp grew', 'كبر إمب'], t_shrink: ['Imp shrank', 'صغر إمب'], t_limit: ['That is as far as he goes', 'هذا أقصى حد'], t_reset: ['Settings reset', 'تمت استعادة الإعدادات'], t_gear5: ['Gear 5!', 'الترس الخامس!'],
  t_motion: ['Motion updated', 'تم تحديث الحركة'], t_lang: ['Now in English', 'الآن بالعربية'],
  assist: ['Choose a window for this space', 'اختر نافذة لهذه المساحة'], snapLayouts: ['Snap layouts', 'تخطيطات المحاذاة'],
  sc_search: ['Search everything', 'البحث في كل شيء'], sc_settings: ['Settings', 'الإعدادات'], sc_close: ['Close the top window or overlay', 'إغلاق النافذة العلوية أو الطبقة'],
  sc_snapLR: ['Snap the front window left or right', 'محاذاة النافذة الأمامية يسارًا أو يمينًا'], sc_up: ['Maximize (from a half: top quarter)', 'تكبير (ومن النصف: الربع العلوي)'],
  sc_down: ['Restore, then minimize', 'استعادة ثم تصغير'], sc_desk: ['Show desktop', 'إظهار سطح المكتب'], sc_tile: ['Tile all windows', 'تجانب كل النوافذ'],
  sc_term: ['Open the terminal', 'فتح الطرفية'], sc_help: ['These shortcuts', 'هذه الاختصارات'], sc_lb: ['Previous or next screen in the viewer', 'الشاشة السابقة أو التالية في العارض'],
  mouseTips: ['With the mouse', 'بالفأرة'], tip1: ['Drag a window to the left or right edge to fill half the screen; to a corner for a quarter; to the top to maximize.', 'اسحب نافذة إلى الحافة اليسرى أو اليمنى لتملأ نصف الشاشة، وإلى الزاوية لربعها، وإلى الأعلى لتكبيرها.'],
  tip2: ['Hover the green button on any window for snap layouts.', 'مرّر على الزر الأخضر في أي نافذة لتظهر تخطيطات المحاذاة.'],
  tip3: ['Drag any edge or corner to resize. Double-click a title bar to maximize.', 'اسحب أي حافة أو زاوية لتغيير الحجم، وانقر مرتين على شريط العنوان للتكبير.'],
  tip4: ['Right-click the desktop for icons and wallpapers; right-click Imp for his menu.', 'انقر بالزر الأيمن على سطح المكتب للأيقونات والخلفيات، وعلى إمب لقائمته.'],
  osTag: ['A portfolio that behaves like a desktop.', 'معرض أعمال يتصرّف كسطح مكتب.'], builtWith: ['Built with', 'صُنع باستخدام'], mascot: ['Mascot', 'التميمة'],
  mascotLine: ['Pixel imp, designed by Amir.', 'إمب البكسلي، من تصميم أمير.'], madeIn: ['Made in Al Khobar.', 'صُنع في الخبر.'], screensN: ['screens', 'شاشة'],
  termHello: ['AmirOS terminal. Type “help” to see what it understands.', 'طرفية AmirOS. اكتب «help» لترى الأوامر.'], termUnknown: ['Unknown command. Type “help”.', 'أمر غير معروف. اكتب «help».'],
  phoneSearch: ['Search projects, films, contact…', 'ابحث في المشاريع والأفلام والتواصل…'], wip: ['Work in progress', 'قيد التطوير'], version: ['Version', 'الإصدار'],
  privacy: ['Privacy', 'الخصوصية'], nfShort: ['Not found', 'غير موجودة'], nfEyebrow: ['Error 404', 'خطأ 404'],
  nfTitle: ['This page isn’t here.', 'هذه الصفحة غير موجودة.'], nfText: ['The address may have changed. You can return home or explore the projects.', 'ربما تغيّر الرابط. يمكنك العودة إلى الرئيسية أو تصفّح المشاريع.'],
  returnHome: ['Return home', 'العودة إلى الرئيسية']
};
/* round 6: tabs, All windows, Control Center, notifications, Notes, toys, project views and stacks, search */
Object.assign(U, {
  views: ['Views', 'الواجهات'], stack: ['Tech stack', 'التقنيات'], seeViews: ['See every view', 'كل الواجهات'], architecture: ['How it is built', 'كيف بُني'], platforms: ['Runs on', 'يعمل على'],
  builtWithP: ['Under the hood', 'ما تحت الغطاء'], seeStack: ['See the full stack', 'كل التقنيات'], pagesN: ['pages', 'صفحة'], openL: ['Open', 'افتح'],
  techOnly: ['Built with', 'مبنية بـ'], clearFilter: ['Show all', 'عرض الكل'],
  newTab: ['New tab', 'علامة تبويب جديدة'], closeTab: ['Close tab', 'إغلاق علامة التبويب'], closeWin: ['Close window', 'إغلاق النافذة'],
  moveTabNew: ['Move tab to a new window', 'نقل علامة التبويب إلى نافذة جديدة'], mergeAll: ['Merge all windows', 'دمج كل النوافذ في نافذة'],
  pinTop: ['Keep on top', 'إبقاؤها في الأعلى'], dropTab: ['Drop to add as a tab', 'أفلِت لإضافتها كعلامة تبويب'], openInTab: ['Open in a new tab', 'فتح في علامة تبويب جديدة'],
  t_merged: ['Windows merged into tabs', 'دُمجت النوافذ في علامات تبويب'], t_shake: ['Shook the other windows away', 'أبعدتَ النوافذ الأخرى بالهز'], t_unshake: ['Windows are back', 'عادت النوافذ'],
  t_pinned: ['Kept on top', 'ستبقى في الأعلى'], t_unpinned: ['No longer on top', 'لم تعد في الأعلى'], t_tornOff: ['Tab moved to its own window', 'نُقلت علامة التبويب إلى نافذة مستقلة'],
  taskView: ['All windows', 'كل النوافذ'], tvEmpty: ['No windows are open. Pick something from the dock.', 'لا توجد نوافذ مفتوحة. اختر شيئًا من شريط التطبيقات.'],
  tabsN: ['tabs', 'علامات تبويب'], windowsN: ['windows', 'نوافذ'], tvHint: ['Click a window to go to it · Delete closes it · Esc goes back', 'انقر نافذة للانتقال إليها · Delete يغلقها · Esc للرجوع'],
  sc_tasks: ['All windows', 'عرض كل النوافذ'], sc_tabs: ['Next or previous tab', 'علامة التبويب التالية أو السابقة'], sc_closeTab: ['Close the current tab', 'إغلاق علامة التبويب الحالية'],
  sc_newTab: ['Open a search result in a new tab', 'فتح نتيجة البحث في علامة تبويب جديدة'], sc_cc: ['Control Center', 'مركز التحكم'],
  tip5: ['Drag a window by its title onto another window’s title bar to join them as tabs; drag a tab down to pull it out again.', 'اسحب نافذة من عنوانها إلى شريط عنوان نافذة أخرى لتجمعهما في علامات تبويب، واسحب علامة التبويب للأسفل لفصلها.'],
  tip6: ['Shake a window by its title bar to tuck every other window away. Shake it again to bring them back.', 'هزّ نافذة من شريط عنوانها لإخفاء بقية النوافذ، وهزّها مرة أخرى لإعادتها.'],
  tip7: ['Throw the ball at Imp, or drag a treat onto him.', 'ارمِ الكرة على إمب، أو اسحب له حلوى.'],
  controlCenter: ['Control Center', 'مركز التحكم'], notifications: ['Notifications', 'الإشعارات'], noNotifs: ['Nothing new. Things you do here show up as they happen.', 'لا جديد. ستظهر هنا الأشياء التي تفعلها.'],
  clearAll: ['Clear', 'مسح'], ncLabel: ['Calendar and notifications', 'التقويم والإشعارات'], justNow: ['just now', 'الآن'], minAgo: ['min ago', 'د'],
  soundL: ['Film sound', 'صوت الأفلام'], on: ['On', 'تشغيل'], off: ['Off', 'إيقاف'], toys: ['Toys', 'الألعاب'], ball: ['Ball', 'الكرة'],
  treat: ['Treat', 'حلوى'], giveTreat: ['Give Imp a treat', 'أعطِ إمب حلوى'], throwBall: ['Throw the ball', 'ارمِ الكرة'], ballOn: ['Ball on the desktop', 'الكرة على سطح المكتب'],
  dragTreat: ['Drag the treat onto Imp', 'اسحب الحلوى إلى إمب'], ballLabel: ['Imp’s ball. Drag and throw it.', 'كرة إمب. اسحبها وارمِها.'], treatLabel: ['A treat for Imp. Drag it onto him.', 'حلوى لإمب. اسحبها إليه.'],
  notes: ['Notes', 'ملاحظات'], notesPh: ['Write something. Imp reads over your shoulder.', 'اكتب شيئًا. إمب يقرأ من فوق كتفك.'], notesSaved: ['Saved on this device only', 'محفوظة على هذا الجهاز فقط'],
  notesWords: ['words', 'كلمة'], newNote: ['New note', 'ملاحظة جديدة'], notesFind: ['Search notes', 'ابحث في الملاحظات'], notesSave: ['Save', 'حفظ'],
  notesDownload: ['Download', 'تنزيل'], notesDelete: ['Delete note', 'احذف الملاحظة'], notesTxt: ['Plain text', 'نص عادي'], notesMd: ['Markdown', 'ماركداون'], notesBody: ['Note text', 'نص الملاحظة'],
  notesSaving: ['Saving…', 'جارٍ الحفظ…'], notesSavedAt: ['Saved', 'حُفظت'], notesEmpty: ['New note', 'ملاحظة جديدة'], notesNone: ['No notes match.', 'لا ملاحظات مطابقة.'], notesCount: ['notes', 'ملاحظات'], notesOne: ['note', 'ملاحظة'], wordOne: ['word', 'كلمة'],
  notesDeleted: ['Note deleted', 'حُذفت الملاحظة'], undo: ['Undo', 'تراجع'], notesDownloaded: ['Downloaded', 'نُزّلت'], notesNothing: ['Write something first, then download it.', 'اكتب شيئًا أولًا ثم نزّله.'],
  notesFail: ['Not saved: this browser is blocking storage.', 'لم تُحفظ: المتصفّح يمنع التخزين.'],
  trash: ['Trash', 'سلة المهملات'], toDesk: ['Put on desktop', 'ضعها على سطح المكتب'], toHome: ['Add to home screen', 'أضِفها إلى الشاشة الرئيسية'],
  offDesk: ['Move back to Notes', 'أعِدها إلى الملاحظات'], offHome: ['Remove from home screen', 'أزِلها من الشاشة الرئيسية'], onDesk: ['On desktop', 'على سطح المكتب'], onHome: ['On home screen', 'على الشاشة الرئيسية'],
  fileOpen: ['Open in Notes', 'افتح في الملاحظات'], fileRename: ['Rename', 'إعادة تسمية'], fileToTrash: ['Move to Trash', 'انقلها إلى المهملات'], movedTrash: ['Moved to Trash', 'نُقلت إلى المهملات'],
  fileBack: ['Back in Notes', 'عادت إلى الملاحظات'], fileOnDesk: ['Now on the desktop', 'صارت على سطح المكتب'], fileOnHome: ['Now on the home screen', 'صارت على الشاشة الرئيسية'],
  fileNote: ['Note', 'ملاحظة'], files: ['Files', 'الملفات'], deskFiles: ['Files on the desktop', 'الملفات على سطح المكتب'], quickLook: ['Quick Look', 'نظرة سريعة'], openTb: ['Open in File Toolbox', 'افتح في صندوق الملفات'],
  dragHint: ['Drop it on the desktop. Tap Shift for File Toolbox.', 'أفلتها على سطح المكتب. اضغط Shift لصندوق الملفات.'], dropHint: ['Tap Shift for File Toolbox, or drop it anywhere.', 'اضغط Shift لصندوق الملفات، أو أفلته في أي مكان.'],
  trashEmpty: ['The Trash is empty.', 'سلة المهملات فارغة.'], trashRestore: ['Restore', 'استعادة'], trashDelete: ['Delete forever', 'احذف نهائيًا'], trashEmptyAll: ['Empty Trash', 'أفرغ السلة'],
  trashSure: ['Delete these notes for good? This cannot be undone.', 'حذف هذه الملاحظات نهائيًا؟ لا يمكن التراجع عن ذلك.'], trashNote: ['Notes in the Trash are deleted for good after 30 days.', 'تُحذف الملاحظات في السلة نهائيًا بعد 30 يومًا.'],
  restored: ['Restored', 'استُعيدت'], deletedOn: ['Deleted', 'حُذفت'], cancel: ['Cancel', 'إلغاء'], gone: ['Deleted for good', 'حُذفت نهائيًا'],
  toolbox: ['File Toolbox', 'صندوق الملفات'], tbConvert: ['Convert', 'تحويل'], tbTools: ['Tools', 'أدوات'], tbShare: ['Share', 'مشاركة'], tbConvertTo: ['Convert to', 'حوّل إلى'],
  tbPick: ['Choose an image', 'اختر صورة'], tbUseNote: ['Use a note', 'استخدم ملاحظة'], tbSample: ['Use a sample image', 'استخدم صورة مثال'], tbLocal: ['Everything happens in your browser. Nothing is uploaded.', 'كل شيء يحدث في متصفّحك. لا يُرفع أي شيء.'],
  tbHint: ['Drag a file, tap Shift, drop it on the wheel.', 'اسحب ملفًا، اضغط Shift، أفلته على العجلة.'], tbPages: ['Tap Shift again for the next page.', 'اضغط Shift مرة أخرى للصفحة التالية.'], tbDrop: ['Drop a file here', 'أفلت ملفًا هنا'],
  tbNotImage: ['That file is not an image this browser can read.', 'هذا الملف ليس صورة يستطيع المتصفّح قراءتها.'], tbTooBig: ['Images up to 40 MB, please.', 'الصور حتى 40 ميغابايت من فضلك.'], tbSaved: ['Saved', 'حُفظ'], tbCopied: ['Copied', 'نُسخ'],
  tbNoCopy: ['This browser would not copy that.', 'لم يسمح المتصفّح بالنسخ.'], tbNoteMade: ['Made a note from', 'أُنشئت ملاحظة من'], tbWords: ['words', 'كلمة'],
  tRotate: ['Rotate', 'تدوير'], tFlip: ['Flip', 'قلب'], tGray: ['Black and white', 'أبيض وأسود'], tHalf: ['Half size', 'نصف الحجم'], tSmall: ['Compress', 'ضغط'], tClean: ['No metadata', 'بلا بيانات وصفية'],
  tCopy: ['Copy text', 'انسخ النص'], tDup: ['Duplicate', 'نسخة مكررة'], tCount: ['Count words', 'عدّ الكلمات'], tCopyImg: ['Copy image', 'انسخ الصورة'], tShareOS: ['Share…', 'مشاركة…'],
  tDownload: ['Download', 'تنزيل'], tEmail: ['Email', 'بريد'], tCopyMd: ['Copy as Markdown', 'انسخ كماركداون'], dupOf: ['copy', 'نسخة'],
  longshot: ['Longshot', 'لونق شوت'], lsExtend: ['Extend', 'تمديد'], lsAuto: ['Auto', 'تلقائي'], lsFollow: ['Follow', 'تتبّع'], lsUndo: ['Undo', 'تراجع'], lsDone: ['Done', 'تم'], lsReset: ['Start again', 'ابدأ من جديد'],
  lsParts: ['parts', 'أجزاء'], lsPart: ['part', 'جزء'], lsAdded: ['Added', 'أُضيف'], lsEnd: ['That is the whole page.', 'هذه الصفحة كلها.'],
  lsHelp: ['Esc stops Auto and Follow. Follow adds a part as you scroll the note.', 'Esc يوقف التلقائي والتتبّع. التتبّع يضيف جزءًا كلما مرّرت الملاحظة.'],
  lsDemo: ['Demo: the real Longshot captures any window. Here it stacks this project’s screens.', 'عرض توضيحي: لونق شوت الحقيقي يلتقط أي نافذة. هنا يكدّس شاشات هذا المشروع.'],
  pulse: ['Pulse', 'بلس'], pRealApp: ['What it shows in Amir Lap', 'ما تعرضه في Amir Lap'],
  pClaudeTxt: ['On your PC this card shows your Claude session and weekly limits and Claude Code’s status, read from Claude Code itself. A website cannot read them, so this is the real card.', 'على جهازك تعرض هذه البطاقة حدود جلسة Claude والحدود الأسبوعية وحالة Claude Code، مقروءة من Claude Code نفسه. لا يستطيع موقع قراءتها، لذا هذه صورة البطاقة الحقيقية.'],
  pCodexTxt: ['On your PC this card shows Codex’s five-hour and weekly limits. A website cannot read them, so this is the real card.', 'على جهازك تعرض هذه البطاقة حدود Codex لخمس ساعات وللأسبوع. لا يستطيع موقع قراءتها، لذا هذه صورة البطاقة الحقيقية.'],
  pShortcuts: ['Shortcuts', 'اختصارات'], pImpCard: ['Imp right now', 'إمب الآن'], pImpG5: ['Gear 5, seconds left:', 'الجير 5، الثواني المتبقية:'], pImpBase: ['Himself', 'على طبيعته'], pImpHidden: ['Hidden', 'مختبئ'],
  pMove: ['Drag the grip to move Pulse to another edge.', 'اسحب المقبض لنقل بلس إلى حافة أخرى.'], pHide: ['Hide Pulse', 'أخفِ بلس'], pOnEdge: ['Pulse is on the edge of the screen.', 'بلس على حافة الشاشة.'], pGrip: ['Move Pulse', 'انقل بلس'],
  tryIt: ['Try it', 'جرّبها'], notesUntitled: ['note', 'ملاحظة'], notesList: ['Your notes', 'ملاحظاتك'], pip: ['Picture in picture', 'صورة داخل صورة'],
  say_ow: ['Ow!', 'آخ!'], say_hey: ['Hey!', 'هيه!'], say_yum: ['Yum!', 'لذيذ!'], say_mine: ['Mine!', 'لي!'], say_whoa: ['Whoa!', 'واو!'], say_nothing: ['Nothing by that name. I looked.', 'لا شيء بهذا الاسم. بحثت.'],
  say_tabs: ['Tabs! Tidy.', 'علامات تبويب! مرتّب.'], say_today: ['That’s today.', 'هذا اليوم.']
});
Object.assign(U, {
  s_top: ['Top hit', 'أفضل نتيجة'], s_apps: ['Apps', 'التطبيقات'], s_projects: ['Projects', 'المشاريع'], s_details: ['Inside projects', 'داخل المشاريع'],
  s_screens: ['Screens', 'الشاشات'], s_tech: ['Tech', 'التقنيات'], s_films: ['Films', 'الأفلام'], s_lab: ['Lab', 'المختبر'], s_actions: ['Actions', 'الأوامر'],
  s_all: ['All', 'الكل'], s_recent: ['Recent', 'الأخيرة'], s_suggest: ['Try', 'جرّب'], usedIn: ['Used in', 'مستخدمة في'], s_calc: ['Calculator · Enter copies it', 'الآلة الحاسبة · Enter ينسخ الناتج'],
  t_calc: ['Result copied', 'تم نسخ الناتج'], searchHint: ['↑ ↓ move · Enter open · Ctrl+Enter new tab · Tab filters', '↑ ↓ للتنقل · Enter للفتح · Ctrl+Enter علامة تبويب جديدة · Tab للتصفية'],
  inHighlights: ['Highlight', 'من أبرز ما فيه'], inFacts: ['Figure', 'رقم'], inViews: ['View', 'واجهة'], inTools: ['Tool', 'أداة'], inProblem: ['The problem', 'المشكلة'],
  projectsN: ['projects', 'مشاريع'], noResults: ['Nothing matches. Try “Flutter”, “admin”, “Hatan” or “email”.', 'لا توجد نتائج. جرّب «Flutter» أو «الإدارة» أو «هتّان» أو «البريد».']
});
export const u = k => (U[k] || [k, k])[rtl() ? 1 : 0];
export const TAGS = { mobile: ['Mobile', 'الجوال'], web: ['Web', 'الويب'], desktop: ['Desktop', 'سطح المكتب'], learning: ['Learning', 'التعلّم'], workflow: ['Workflow', 'سير العمل'], data: ['Data', 'البيانات'], ai: ['AI', 'الذكاء الاصطناعي'] };
export const FILM = {
  launch: ['Launch film', 'فيلم الإطلاق'], teaser: ['Teaser', 'الإعلان التشويقي'], promo: ['Promo, draft cut', 'العرض الترويجي، نسخة أولية'],
  forget: ['You will forget this', 'ستنسى هذا'], scratch: ['Scratch it', 'اخدشها'], make24: ['Make 24', 'اصنع 24'],
  homescreen: ['On your home screen', 'على شاشتك الرئيسية'], exits: ['Deck swipes', 'سحب المجموعات'], flip: ['The page flip', 'تقليب الصفحة'], locker: ['3D locker room', 'غرفة الملابس ثلاثية الأبعاد']
};
export const filmTitle = v => (FILM[v.name] || [v.name, v.name])[rtl() ? 1 : 0];

/* the privacy policy for this site (the old site's policy, updated for the desktop's settings and contact routes) */
export const PRIVACY = {
  en: {
    title: 'A small site. A clear privacy policy.',
    intro: 'This policy covers this portfolio website only. Each featured application has its own data practices.',
    sections: [
      ['What this site collects', 'This site has no contact form, user accounts, analytics, advertising, or tracking cookies. It does not ask you to submit personal information.'],
      ['Your preferences', 'Settings you change on the desktop (theme, accent colour, wallpaper, motion, icon order and widgets) and the notes you write in Notes are stored in your browser’s local storage. Images and files you give File Toolbox are converted inside your browser and never uploaded. Imp’s size and position, and whether you have seen the start-up screen, are kept only for the current browser session. None of this is sent anywhere.'],
      ['Hosting and external links', 'The hosting provider may process ordinary request information, such as IP addresses and server logs, to serve and protect the website. GitHub, LinkedIn, WhatsApp and the linked project sites have their own privacy policies.'],
      ['Fonts, images and video', 'Fonts, images and the short videos are served with this site. No third-party video player, social feed, or font service is embedded. Project images are screenshots from public sites or captures from the project files. Captures with sample data are labelled.'],
      ['Questions', 'Use the email address or phone number in the Contact window.']
    ]
  },
  ar: {
    title: 'موقع بسيط، وسياسة خصوصية واضحة.',
    intro: 'تخص هذه السياسة موقع الأعمال هذا فقط. ولكل تطبيق معروض ممارساته الخاصة في التعامل مع البيانات.',
    sections: [
      ['ما يجمعه الموقع', 'لا يحتوي الموقع على نموذج تواصل أو حسابات مستخدمين أو تحليلات أو إعلانات أو ملفات تعريف ارتباط للتتبّع، ولا يطلب منك تقديم بيانات شخصية.'],
      ['تفضيلاتك', 'يحفظ متصفّحك محليًا الإعدادات التي تغيّرها على سطح المكتب: السمة ولون التمييز والخلفية والحركة وترتيب الأيقونات والأدوات المصغّرة، والملاحظات التي تكتبها في تطبيق الملاحظات. والصور والملفات التي تعطيها لصندوق الملفات تُحوَّل داخل متصفّحك ولا تُرفع أبدًا. أما حجم إمب وموضعه، وظهور شاشة البدء، فتُحفظ لجلسة التصفّح الحالية فقط. لا يُرسل شيء من ذلك إلى أي جهة.'],
      ['الاستضافة والروابط الخارجية', 'قد يعالج مزوّد الاستضافة معلومات الطلب المعتادة، مثل عنوان IP وسجلات الخادم، لتقديم الموقع وحمايته. ولمواقع GitHub وLinkedIn وواتساب والمشاريع المرتبطة سياسات خصوصية مستقلة.'],
      ['الخطوط والصور والفيديو', 'تُحمّل الخطوط والصور والمقاطع القصيرة من الموقع نفسه. لا يوجد مشغّل فيديو خارجي أو خلاصات اجتماعية أو خدمات خطوط خارجية مضمّنة. صور المشاريع لقطات من المواقع العامة أو من ملفات المشاريع، مع الإشارة إلى البيانات التوضيحية.'],
      ['الاستفسارات', 'استخدم البريد الإلكتروني أو رقم الهاتف في نافذة التواصل.']
    ]
  }
};

/* icons */
const sv = (d, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
export const I = {
  x: sv('<path d="M6 6l12 12M18 6L6 18"/>'), minus: sv('<path d="M5 12h14"/>'), expand: sv('<path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/>'),
  sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: sv('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  mail: sv('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>'),
  phone: sv('<path d="M5 4h3.5l2 5-2.4 1.5a11 11 0 0 0 5.4 5.4L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  chat: sv('<path d="M4 20l1.3-3.8A8.2 8.2 0 1 1 8.2 19z"/><path d="M9 10.5c.3 1.6 1.9 3.3 3.6 3.8l1.2-1 1.7.8"/>'),
  gh: `<svg class="i fill" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`,
  li: `<svg class="i fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM3.2 9.3h3.6V21H3.2zM9.3 9.3h3.4v1.6h.05c.48-.9 1.65-1.85 3.4-1.85 3.63 0 4.3 2.4 4.3 5.5V21h-3.6v-5.6c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95V21H9.3z"/></svg>`,
  copy: sv('<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'), check: sv('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  play: `<svg class="i fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>`,
  pause: `<svg class="i fill" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`,
  vol: sv('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  mute: sv('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  left: sv('<path d="M15 5l-7 7 7 7"/>'), right: sv('<path d="M9 5l7 7-7 7"/>'), out: sv('<path d="M7 17L17 7M9 7h8v8"/>'), arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>', 'flip-rtl'),
  folder: sv('<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.2h7.5A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><path d="M3 10h18"/>'),
  film: sv('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/>'),
  // an Erlenmeyer flask: a rim, a straight neck, a cone with rounded feet, and a filled liquid level with a wave
  flask: sv('<path d="M9.2 3h5.6"/><path d="M10.3 3.4v5.1L5.6 16.6a2.4 2.4 0 0 0 2.1 3.6h8.6a2.4 2.4 0 0 0 2.1-3.6L13.7 8.5V3.4"/><path d="M7.6 13.2Q9.8 12.3 12 13.2T16.4 13.2L18.4 16.6a2.4 2.4 0 0 1-2.1 3.6H7.7a2.4 2.4 0 0 1-2.1-3.6z" fill="currentColor" stroke="none" opacity=".92"/><circle cx="12.6" cy="10.4" r=".9" fill="currentColor" stroke="none"/>'),
  pin: sv('<path d="M12 21s-7-6.1-7-11.2a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>'),
  cap: sv('<path d="M2 9.5l10-5 10 5-10 5z"/><path d="M6 11.5v4.8c3.3 2.2 8.7 2.2 12 0v-4.8M21.5 9.5v5"/>'),
  paw: `<svg class="i fill" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="4.6" ry="3.8"/><circle cx="6" cy="10.5" r="2"/><circle cx="9.5" cy="6.8" r="2.1"/><circle cx="14.5" cy="6.8" r="2.1"/><circle cx="18" cy="10.5" r="2"/></svg>`,
  globe: sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>'),
  sparkle: sv('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  search: sv('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  gear: sv('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 6.5l2 1.2M17.8 16.3l2 1.2M4.2 17.5l2-1.2M17.8 7.7l2-1.2M2.8 12h2.4M18.8 12h2.4"/><circle cx="12" cy="12" r="7"/>'),
  help: sv('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6"/><circle cx="12" cy="16.9" r=".6" fill="currentColor"/>'),
  term: sv('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 10l3 2.5L7 15M12.5 15.5h4.5"/>'),
  grid: sv('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  stack: sv('<rect x="6" y="3.5" width="14" height="10" rx="2"/><rect x="4" y="7" width="14" height="10" rx="2"/><rect x="2.5" y="10.5" width="14" height="10" rx="2"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>'), wand: sv('<path d="M4 20L15 9M14 4v2M18 6l-1.4 1.4M20 10h-2M12 6l1 1"/>'),
  restart: sv('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.8h3.8"/>'), image: sv('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  sort: sv('<path d="M7 4v16M4 17l3 3 3-3M14 6h7M14 11h5M14 16h3"/>'), eye: sv('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  shield: sv('<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>')
};
const ICON2 = {
  tasks: sv('<rect x="3" y="4" width="8" height="7" rx="1.6"/><rect x="13" y="4" width="8" height="7" rx="1.6"/><rect x="3" y="13" width="8" height="7" rx="1.6"/><rect x="13" y="13" width="8" height="7" rx="1.6"/>'),
  sliders: sv('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>'),
  pip: sv('<rect x="3" y="5" width="18" height="14" rx="2.5"/><rect x="12" y="11" width="7" height="6" rx="1.2" fill="currentColor"/>'),
  pen: sv('<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>'),
  pinI: sv('<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>'),
  ballI: sv('<circle cx="12" cy="12" r="8.5"/><path d="M5 8.5c4 1 9 1 14 0M4.5 14c5 1.5 10 1.5 15 0M12 3.5c-2.5 3-2.5 14 0 17"/>'),
  fileI: sv('<path d="M6.5 3.5h7.5l4 4v12a1 1 0 0 1-1 1h-10.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>'),
  wheelI: sv('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5v5.5M12 15v5.5M3.5 12H9M15 12h5.5"/>'),
  longI: sv('<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M9 7h6M9 10.5h6M9 14h6M12 17v3M10 19l2 2 2-2"/>'),
  pulseI: sv('<path d="M3 12h4l2.5-6 4 12 2.5-6h5"/>'),
  claudeI: sv('<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>'),
  codexI: sv('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'),
  boxI: sv('<rect x="3.5" y="8" width="17" height="11.5" rx="2"/><path d="M9 8V5.5h6V8M3.5 12.5h17M10.5 12.5v2h3v-2"/>'),
  grip: sv('<circle cx="9" cy="7" r=".9" fill="currentColor"/><circle cx="15" cy="7" r=".9" fill="currentColor"/><circle cx="9" cy="12" r=".9" fill="currentColor"/><circle cx="15" cy="12" r=".9" fill="currentColor"/><circle cx="9" cy="17" r=".9" fill="currentColor"/><circle cx="15" cy="17" r=".9" fill="currentColor"/>'),
  download: sv('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>'),
  trash: sv('<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7M10.2 11v6M13.8 11v6"/>'),
  treatI: sv('<path d="M5 15c4 4 11 3 14-6 .5-1.5 0-3-1-4-1 3-4 8-12 8z"/><path d="M18 5l1.5-1.5"/>')
};
Object.assign(I, ICON2);


/* data */
export const P = Object.fromEntries(A.projects.map(p => [p.slug, p]));
export const FLAG = A.projects.slice(0, 5);
const FILM_ORDER = ['launch', 'locker', 'promo', 'forget', 'scratch', 'make24', 'homescreen', 'exits', 'teaser', 'flip'];
export const ALLFILMS = A.projects.flatMap(p => p.videos.map(v => ({ ...v, p }))).sort((a, b) => FILM_ORDER.indexOf(a.name) - FILM_ORDER.indexOf(b.name));
export const STAGE_ORDER = ['live', 'launch', 'pilot', 'building', 'concept'];
export const stageLabel = s => T(A.stages.find(x => x.id === s)?.label);
export const stageIdx = s => A.stages.findIndex(x => x.id === s);
export const stageChip = p => `<span class="chip stg"><span class="dot" style="--sc:var(--s-${p.stage})"></span>${esc(stageLabel(p.stage))}</span>`;
export const reachChip = r => `<span class="chip">${esc(T(A.reach[r]))}</span>`;
const langRank = m => { const k = (m.name || '').match(/(?:^|-)(en|ar)$/)?.[1]; return !k ? 1 : k === lang ? 0 : 2; };
const ord = list => list.map((m, i) => [m, i]).sort((a, b) => langRank(a[0]) - langRank(b[0]) || a[1] - b[1]).map(x => x[0]);
export const shotsOf = p => ord(p.shots), phonesOf = p => ord(p.phones);
export const pretty = n => String(n || '').replace(/-/g, ' ').replace(/\b(en|ar)\b/g, s => s.toUpperCase());
// screenshots 1200 px or wider also come as an 800 px copy (scripts/media-variants.mjs), so phones fetch the smaller one
const WIDE = (m, sizes) => m.w >= 1200 && /\.webp$/.test(m.src) ? ` srcset="${m.src.replace(/\.webp$/, '-800.webp')} 800w, ${m.src} ${m.w}w" sizes="${sizes}"` : '';
export const img = (m, alt, cls = '', eager = false, sizes = '(max-width: 759px) 100vw, 960px') => `<img class="${cls}" src="${m.src}"${WIDE(m, sizes)} width="${m.w}" height="${m.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false">`;
const SM = '(max-width: 759px) 100vw, 460px', XS = '(max-width: 759px) 100vw, 330px';
// the role strip's small screens also come as a 400 px copy (scripts/media-variants.mjs): three across on a phone, 330 px on a laptop
const thumb = m => img(m, '', '', false, '(max-width: 759px) 31vw, 330px').replace(' srcset="', ` srcset="${m.src.replace(/\.webp$/, '-400.webp')} 400w, `);

/* routes: the windows that have their own address (the rest open from menus) */
export const ROUTE = { start: '', work: 'projects', films: 'films', lab: 'lab', about: 'about', contact: 'contact', privacy: 'privacy' };
A.projects.forEach(p => { ROUTE['p:' + p.slug] = 'projects/' + p.slug; });
export const href = (id, l = lang) => { const p = ROUTE[id]; return p === undefined ? null : `/${l}/${p ? p + '/' : ''}`; };
export const appForPath = path => Object.keys(ROUTE).find(k => ROUTE[k] === path) ?? null;
// a link when the window has an address (open in a new tab works, and the page works without JavaScript), else a button
export const opener = (id, cls, inner, attrs = '') => {
  const h = href(id);
  return h ? `<a class="${cls}" href="${h}" data-open="${id}" ${attrs}>${inner}</a>` : `<button type="button" class="${cls}" data-open="${id}" ${attrs}>${inner}</button>`;
};

/* app icons: the products' own square icons, full-bleed in the squircle */
const INSET = new Set(['amir-lap', 'companion']);
const iconKey = p => p.slug || (p.icon || '').split('/').pop().replace(/\.png$/, '');
export const tileFor = (p, extra = '') => {
  const src = p.brand?.icon || p.icon, rib = p.ribbon ? '<i class="rib-mini" aria-hidden="true"></i>' : '';
  // lazy: of the many icon copies (desktop, home grid, dock, menus), only the ones on screen load
  if (src) return `<span class="tile ic ${INSET.has(iconKey(p)) ? 'inset' : ''} ${extra}"><img src="${src}" alt="" width="52" height="52" loading="lazy" decoding="async" draggable="false">${rib}</span>`;
  const b = p.brand || p;
  return `<span class="tile glyph ${extra}" style="--tc:${b.color || '#5B7A3A'}" aria-hidden="true">${esc(b.glyph || (p.name?.en || p.name || '?').slice(0, 2))}${rib}</span>`;
};
export const SYS = {
  start: () => `<span class="tile mark-tile" aria-hidden="true">a</span>`,
  aboutos: () => `<span class="tile mark-tile alt" aria-hidden="true">a</span>`,
  work: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#58D2BC,#1F7A7A)">${I.folder}</span>`,
  films: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#FFA27A,#D9483A)">${I.film}</span>`,
  lab: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#F5BE6E,#BF6A24)">${I.flask}</span>`,
  about: () => `<span class="tile face"><img src="${A.person.portrait.replace(/\.webp$/, '-160.webp')}" alt="" width="52" height="65" loading="lazy" decoding="async" draggable="false"></span>`,
  contact: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#79C6D6,#2C6E85)">${I.mail}</span>`,
  settings: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#A9B7BE,#4D5E66)">${I.gear}</span>`,
  help: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#8FD3C8,#2E6F78)">${I.help}</span>`,
  terminal: () => `<span class="tile sys term" style="--tg:linear-gradient(150deg,#2B3A40,#0B1418)">${I.term}</span>`,
  privacy: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#9FB8A8,#3E5F55)">${I.shield}</span>`,
  notes: () => `<span class="tile sys" style="--tg:linear-gradient(150deg,#FFE08A,#E3A21A)">${I.pen}</span>`,
  trash: () => `<span class="tile sys trash-tile" style="--tg:linear-gradient(150deg,#D5DEE2,#7C8C95)">${I.trash}<i class="trash-dot" aria-hidden="true"></i></span>`,
  notfound: () => `<span class="tile mark-tile alt" aria-hidden="true">?</span>`
};
export const appTile = id => id.startsWith('p:') ? tileFor(P[id.slice(2)]) : (SYS[id] ? SYS[id]() : '');
export const appTitle = id => id.startsWith('p:') ? T(P[id.slice(2)].name) : ({ trash: u('trash'), start: u('start'), work: u('work'), films: u('films'), lab: u('lab'), about: u('aboutAmir'), contact: u('contact'), settings: u('settings'), help: u('shortcuts'), terminal: u('terminal'), aboutos: u('aboutOS'), privacy: u('privacy'), notfound: u('nfShort'), notes: u('notes') })[id] || id;

/* page titles and descriptions, the same at build time and after the address changes */
export const siteName = () => T(A.person.name);
export const titleFor = id => !id || id === 'start' ? (rtl() ? 'AmirOS · أمير الحاتمي' : 'Imp OS · Amir Alhatemi') : `${id === 'work' ? u('allProjects') : appTitle(id)} · ${siteName()}`;
export const describe = id => {
  const n = A.projects.length;
  if (id?.startsWith('p:')) return T(P[id.slice(2)].pitch);
  return ({
    work: T(A.ui.workIntro), about: T(A.person.bio), contact: `${T(A.contact.title)} ${T(A.contact.intro)}`, lab: T(A.ui.labIntro), privacy: PRIVACY[lang].intro, notfound: u('nfText'),
    films: rtl() ? `${ALLFILMS.length} أفلام قصيرة من مشاريع أمير: أفلام إطلاق وعروض ترويجية وتسجيلات للشاشات.` : `${ALLFILMS.length} short films from Amir’s projects: launch films, promos and screen recordings.`
  })[id] || (rtl() ? `أمير الحاتمي، مطوّر تطبيقات في الخبر: ${n} مشروعًا بين الجوال والويب وسطح المكتب، معروضة كنظام تشغيل صغير لسطح المكتب.` : `Amir Alhatemi, app developer in Al Khobar: ${n} projects across mobile, web and desktop, presented as a small desktop operating system.`);
};

/* clock: Al Khobar time. Saudi Arabia keeps UTC+3 all year (no daylight saving), so this is plain arithmetic.
   A time-zone Intl formatter would load the browser's time-zone data on first use: about 25 ms inside the
   desktop's start-up task on a phone. The calendar (app.js) still uses Intl, once someone opens it. */
const pad2 = n => String(n).padStart(2, '0');
export const clockNow = () => { const d = new Date(Date.now() + 3 * 3600e3); return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`; };
export const clockHTML = () => { const [h, m] = clockNow().split(':'); return `${h}<span class="colon">:</span>${m}`; };


/* ===== wallpapers: four coded scenes, each with a Dusk (dark) and a Morning (light) look =====
   Corniche, Dunes and Pixel sun are one SVG drawing each. Its colours are CSS custom properties (--k0 to --k15, set per
   scene and theme in style.css) and --night fades what only shows after dark (stars, lit windows, the setting sun), so
   the theme switch blends one drawing from dusk to morning instead of carrying two. Aurora is soft colour fields.
   `only` picks which scenes to draw (the build draws the default one; the others are drawn when chosen). Each scene has
   its own seeded randomness, so it comes out the same whichever others are drawn with it. */
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const n1 = v => +v.toFixed(1), n0 = Math.round;
const wsvg = (inner, vb = '0 0 1600 1000', extra = '') => `<svg class="wsvg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"${extra}>${inner}</svg>`;
const grad = (id, stops, attrs = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${attrs}>${stops.map(([o, k, op]) => `<stop offset="${o}" class="s${k}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
const rgrad = (id, stops) => `<radialGradient id="${id}">${stops.map(([o, k, op]) => `<stop offset="${o}" class="s${k}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
// a palm: a gently curved trunk and eight arching fronds that droop at the tips
const palmPath = (x, base, h, lean = 0, s = 1) => {
  const tx = x + lean, ty = base - h, w = 2.6 * s;
  let d = `M${n1(x - w)} ${base}Q${n1(x + lean * .35 - w * .7)} ${n1(base - h * .5)} ${n1(tx - w * .45)} ${n1(ty)}h${n1(w * .9)}Q${n1(x + lean * .35 + w * .7)} ${n1(base - h * .5)} ${n1(x + w)} ${base}Z`;
  [[-172, 1], [-146, 1.05], [-118, .9], [-72, .9], [-40, 1.05], [-10, 1], [158, .8], [24, .8]].forEach(([deg, k]) => {
    const a = deg * Math.PI / 180, L = h * .5 * k * s ** .2, ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L + L * .42;
    d += `M${n1(tx)} ${n1(ty)}Q${n1(tx + Math.cos(a) * L * .5)} ${n1(ty + Math.sin(a) * L * .5 - L * .3)} ${n1(ex)} ${n1(ey)}Q${n1(tx + Math.cos(a) * L * .55)} ${n1(ty + Math.sin(a) * L * .5 - L * .12)} ${n1(tx)} ${n1(ty + 2.2 * s)}Z`;
  });
  return d;
};
const starField = (rnd, n, top, w = 1600) => [0, 1, 2].map(g => `<g class="tw tw${g}">${Array.from({ length: n }, () => `<circle cx="${n0(rnd() * w)}" cy="${n0(rnd() * top)}" r="${n1(.7 + rnd() * 1.1)}"/>`).join('')}</g>`).join('');

// Corniche: Al Khobar from the water at the two ends of the day. The skyline with its lit windows, the water tower,
// a minaret and dome, the causeway on the horizon, palms and lamps along the promenade, a dhow, and the sun on the water.
const cornicheSVG = () => {
  const r = seeded(11), H = 618;
  let city = `M-10 ${H}`, x = -10;
  while (x < 1610) {
    const core = Math.exp(-(((x - 820) / 300) ** 2)), w = 16 + r() * 30, h = 12 + r() * 34 + core * (36 + r() * 120), t = H - h, k = r();
    if (k < .14 && h > 60) city += `V${n1(t)}h${n1(w * .38)}v${n1(-h * .16)}h${n1(w * .24)}v${n1(h * .16)}h${n1(w * .38)}`;
    else if (k < .3) city += `V${n1(t + h * .22)}h${n1(w * .22)}V${n1(t)}h${n1(w * .56)}V${n1(t + h * .22)}h${n1(w * .22)}`;
    else if (k < .38 && h > 48) city += `V${n1(t + w / 2)}a${n1(w / 2)} ${n1(w / 2)} 0 0 1 ${n1(w)} 0`;
    else city += `V${n1(t)}h${n1(w)}`;
    x += w; city += `V${H}`; const gap = r() * 7; x += gap; city += `h${n1(gap)}`;
  }
  city += `V${H + 4}H-10Z`;
  // the near shore: minaret and dome on the left, the water tower right of the sun
  const mosque = 'M196 618V470h14v148zM191 488h24v6h-24zM193 470l10-26 10 26zM202 444v-12h2v12zM226 618v-28a40 40 0 0 1 80 0v28zM264 552v-14h2v14zM300 618v-42h10v42z';
  const tower = 'M1287 618V352h12v266zM1248 352h90l-30 34h-30zM1293 290a21 21 0 1 1 0 42a21 21 0 1 1 0-42zM1292 252h2v40h-2z';
  const cause = `M0 ${H - 5}h430v2.4H0zM168 ${H - 5}v-26h3v26zM186 ${H - 5}v-26h3v26zM160 ${H - 34}h36v4h-36zM172 ${H - 52}h12v18h-12z` + Array.from({ length: 22 }, (_, i) => `M${4 + i * 19.5} ${H - 3}v3h1.6v-3z`).join('');
  // promenade: a low wall, lamps and palms
  let lamps = '', glows = '';
  for (let lx = 40; lx < 1600; lx += 86) { lamps += `M${lx} ${H}v-30h1.6v30zM${lx - 3} ${H - 32}h7.6v3h-7.6z`; glows += `<circle cx="${lx + .8}" cy="${H - 30}" r="11"/>`; }
  const palms = [[110, 52, 4], [362, 64, -6], [470, 48, 3], [690, 58, 5], [930, 50, -4], [1130, 62, 6], [1390, 54, -3], [1520, 66, 4]].map(([px, ph, ln]) => palmPath(px, H + 2, ph, ln, .8)).join('');
  // the sun's path on the water: dashes that widen and scatter towards you; two sets that take turns, so it glitters
  const glitter = (cx, n, seed) => { const q = seeded(seed); let d = ''; for (let i = 0; i < n; i++) { const t = (i / n) ** 1.35, y = H + 6 + t * 370, w = 6 + t * 90 * (.4 + q()), xx = cx + (q() - .5) * (24 + t * 300); const W = n0(w); d += `M${n0(xx - w / 2)} ${n0(y)}h${W}v${n0(1.4 + t * 3)}h${-W}z`; } return d; };
  let ripples = ''; for (let i = 0; i < 20; i++) { const t = (i / 20) ** 1.7, y = H + 10 + t * 380; for (let j = 0; j < 3; j++) { const w = n0(30 + r() * 160 * (.4 + t)), xx = r() * 1600; ripples += `M${n0(xx)} ${n0(y)}h${w}v${n0(1 + t * 1.5)}h${-w}z`; } }
  const birds = [[1010, 410, 1], [1046, 392, .8], [1074, 420, .7], [610, 300, .9]].map(([bx, by, s]) => `M${bx} ${by}q${n1(6 * s)} ${n1(-6 * s)} ${n1(12 * s)} 0q${n1(6 * s)} ${n1(-6 * s)} ${n1(12 * s)} 0`).join('');
  const dhow = 'M448 708q74 6 156-6q-10 22-46 28l-78 1q-22-5-32-23zM546 704l1-118h2.6l-1 118zM470 652q66-34 136-64l3 4q-48 30-54 106q-46-12-85-46z';
  const clouds = [[180, 520, 360], [470, 548, 220], [1180, 506, 300], [1390, 540, 240], [820, 470, 180]].map(([cx, cy, w]) => `<rect x="${cx}" y="${cy}" width="${w}" height="7" rx="3.5"/><rect x="${cx + w * .18}" y="${cy - 8}" width="${n1(w * .5)}" height="6" rx="3"/>`).join('');
  return wsvg(`<defs>${grad('wcSky', [[0, 0], [.52, 1], [.9, 2], [1, 2]])}${grad('wcSea', [[0, 7], [1, 8]])}${grad('wcGlowSea', [[0, 2, .42], [1, 2, 0]])}
    ${rgrad('wcSun', [[0, 3], [.62, 3], [1, 4]])}${rgrad('wcGlow', [[0, 4, .7], [.4, 4, .22], [1, 4, 0]])}${rgrad('wcLamp', [[0, 11, .9], [1, 11, 0]])}
    <pattern id="wcWin" width="46" height="40" patternUnits="userSpaceOnUse"><g class="f11"><rect x="4" y="6" width="4" height="5"/><rect x="18" y="6" width="4" height="5"/><rect x="32" y="20" width="4" height="5"/><rect x="11" y="27" width="4" height="5"/><rect x="25" y="13" width="4" height="5"/><rect x="39" y="33" width="4" height="5"/></g></pattern></defs>
    <rect width="1600" height="${H + 2}" fill="url(#wcSky)"/>
    <g class="night f15">${starField(r, 14, 360)}</g>
    <g class="day"><circle cx="1214" cy="226" r="250" fill="url(#wcGlow)"/><circle cx="1214" cy="226" r="56" fill="url(#wcSun)"/></g>
    <g class="night"><circle cx="1036" cy="602" r="330" fill="url(#wcGlow)"/><circle cx="1036" cy="606" r="80" fill="url(#wcSun)"/></g>
    <g class="f13">${clouds}</g>
    <path class="f5" opacity=".75" d="${cause}"/>
    <path class="f5" d="${city}"/>
    <path class="night" fill="url(#wcWin)" opacity=".8" d="${city}"/>
    <path class="f12" d="${tower}"/><circle class="night f11" cx="1293" cy="250" r="2.4"/>
    <path class="f6" d="${mosque}M-10 ${H - 4}h1620v8h-1620z${lamps}"/>
    <g class="night">${glows.replace(/<circle /g, '<circle fill="url(#wcLamp)" ')}</g>
    <path class="f10" d="${palms}"/>
    <rect y="${H + 3}" width="1600" height="${1000 - H}" fill="url(#wcSea)"/>
    <rect y="${H + 3}" width="1600" height="170" fill="url(#wcGlowSea)"/>
    <path class="f5" opacity=".35" d="${ripples}"/>
    <g class="night f9"><path class="gl ga" d="${glitter(1036, 38, 5)}"/><path class="gl gb" d="${glitter(1036, 38, 9)}"/></g>
    <g class="day f9"><path class="gl ga" d="${glitter(1214, 24, 21)}" opacity=".7"/><path class="gl gb" d="${glitter(1214, 24, 23)}" opacity=".7"/></g>
    <g class="dhow"><path class="f10" d="${dhow.split('z')[0]}z${dhow.split('z')[1]}z"/><path class="f14" d="${dhow.split('z')[2]}z"/></g>
    <path class="f10" fill="none" stroke-width="2" stroke-linecap="round" style="stroke:var(--k10);fill:none" d="${birds}"/>
    <path class="f10" d="${palmPath(70, 1010, 380, 34, 2.4)}"/>`);
};

// Dunes: the sand sea at the ends of the day. Each dune is lit on one face and shadowed on the other, split by a sharp
// crest; far dunes fade into the haze. A camel caravan crests a ridge; wind ripples cross the near dune.
const dunesSVG = () => {
  const r = seeded(23);
  const layer = (peaks, ty) => {
    // silhouette through troughs and peaks; returns the outline, the shadowed faces and a sampler for the ridge height
    const T = [[-140, ty]]; peaks.forEach((p, i) => { const nx = i < peaks.length - 1 ? (p[0] + peaks[i + 1][0]) / 2 : 1760; T.push(p, [nx, ty + (r() - .5) * 18]); });
    let d = `M-140 1010V${ty}`, sh = '', line = [[-140, ty]];
    const cub = (a, c1, c2, b) => { for (let i = 1; i <= 24; i++) { const t = i / 24, u = 1 - t; line.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]); } };
    for (let i = 0; i + 2 < T.length; i += 2) {
      const L = T[i], P = T[i + 1], N = T[i + 2];
      const c1 = [L[0] + (P[0] - L[0]) * .55, L[1]], c2 = [P[0] - (P[0] - L[0]) * .2, P[1] + 1], c3 = [P[0] + (N[0] - P[0]) * .1, P[1] + (N[1] - P[1]) * .06], c4 = [P[0] + (N[0] - P[0]) * .42, N[1]];
      d += `C${n1(c1[0])} ${n1(c1[1])} ${n1(c2[0])} ${n1(c2[1])} ${n1(P[0])} ${n1(P[1])}C${n1(c3[0])} ${n1(c3[1])} ${n1(c4[0])} ${n1(c4[1])} ${n1(N[0])} ${n1(N[1])}`;
      cub(L, c1, c2, P); cub(P, c3, c4, N);
      // the shadowed windward face: the rising slope, then the crest sweeping down towards you
      const w = P[0] - L[0];
      sh += `M${n1(L[0] - w * 1.1)} 1010Q${n1(L[0] - w * .12)} ${n1(L[1] + 70)} ${n1(L[0])} ${n1(L[1])}C${n1(c1[0])} ${n1(c1[1])} ${n1(c2[0])} ${n1(c2[1])} ${n1(P[0])} ${n1(P[1])}C${n1(P[0] - w * .1)} ${n1(P[1] + (L[1] - P[1]) * .7)} ${n1(P[0] - w * .42)} ${n1(L[1] + 30)} ${n1(P[0] - w * .58)} 1010Z`;
    }
    d += 'V1010Z';
    const yAt = x => { for (let i = 1; i < line.length; i++) if (line[i][0] >= x) { const a = line[i - 1], b = line[i], t = (x - a[0]) / ((b[0] - a[0]) || 1); return a[1] + (b[1] - a[1]) * t; } return ty; };
    return { d, sh, yAt };
  };
  const far = layer([[150, 566], [470, 574], [800, 560], [1120, 572], [1450, 566]], 606);
  const mid = layer([[260, 618], [720, 604], [1200, 630], [1600, 612]], 690);
  const near = layer([[-30, 706], [520, 690], [1010, 720], [1420, 700]], 800);
  const front = layer([[360, 800], [1360, 826]], 960);
  // a camel walking right, feet at 0,0 (about 30 by 24)
  const camel = (cx, cy, s, rider) => { const p = (x, y) => `${n1(cx + x * s)} ${n1(cy + y * s)}`;
    return `M${p(-10, -9)}Q${p(-12, -13)} ${p(-9, -15)}Q${p(-5, -16)} ${p(-3, -21)}Q${p(0, -23)} ${p(2, -17)}Q${p(5, -15)} ${p(8, -15)}Q${p(10, -16)} ${p(11, -21)}L${p(15, -22)}Q${p(18, -21)} ${p(17.5, -19)}L${p(13.5, -18)}Q${p(12, -12)} ${p(7, -9)}Z`
      + [-8.5, -5.6, 3.4, 6].map((lx, i) => `M${p(lx, -10)}L${p(lx + (i % 2 ? .8 : -.8), 0)}h${n1(1.5 * s)}L${p(lx + 1.4, -10)}Z`).join('')
      + (rider ? `M${p(-3.4, -21)}h${n1(3 * s)}v${n1(-5 * s)}h${n1(-3 * s)}zM${p(-1.9, -29.5)}a${n1(1.9 * s)} ${n1(1.9 * s)} 0 1 1 0 .1z` : ''); };
  const caravan = [[600, 1, 1], [636, .95, 0], [672, .95, 1], [708, .9, 0], [744, .9, 0]].map(([cx, s, rd]) => camel(cx, mid.yAt(cx) + 1, s * 1.15, rd)).join('');
  // wind ripples across the near dune's lit face
  let rip = ''; for (let i = 0; i < 16; i++) { const y0 = 850 + i * 11 + r() * 4, x0 = 520 + i * 24 + r() * 30, w = 160 + r() * 140; rip += `M${n1(x0)} ${n1(y0)}q${n1(w * .5)} ${n1(-10 - r() * 6)} ${n1(w)} ${n1(4 + r() * 6)}`; }
  for (let i = 0; i < 10; i++) { const y0 = 905 + i * 9, x0 = 1440 + i * 10, w = 120 + r() * 80; rip += `M${n1(x0)} ${n1(y0)}q${n1(w * .5)} ${n1(-8)} ${n1(w)} 4`; }
  return wsvg(`<defs>${grad('wdSky', [[0, 0], [.4, 1], [.6, 2]])}${rgrad('wdSun', [[0, 3], [.6, 3], [1, 4]])}${rgrad('wdGlow', [[0, 4, .75], [.45, 4, .2], [1, 4, 0]])}${grad('wdHaze', [[0, 2, 0], [.5, 2, .55], [1, 2, 0]])}
    <mask id="wdMoon"><rect width="1600" height="1000" fill="#000"/><circle cx="330" cy="200" r="34" fill="#fff"/><circle cx="346" cy="188" r="30" fill="#000"/></mask></defs>
    <rect width="1600" height="1000" fill="url(#wdSky)"/>
    <g class="night"><g class="f15">${starField(r, 22, 460)}</g><rect class="f3" width="1600" height="1000" mask="url(#wdMoon)"/></g>
    <g class="night"><circle cx="1250" cy="586" r="320" fill="url(#wdGlow)"/><circle cx="1250" cy="586" r="62" fill="url(#wdSun)"/></g>
    <g class="day"><circle cx="1190" cy="196" r="260" fill="url(#wdGlow)"/><circle cx="1190" cy="196" r="50" fill="url(#wdSun)"/></g>
    <path class="f5" d="${far.d}"/><path class="f6" d="${far.sh}"/>
    <rect y="520" width="1600" height="120" fill="url(#wdHaze)"/>
    <path class="f7" d="${mid.d}"/><path class="f8" d="${mid.sh}"/><path class="f14" d="${caravan}"/>
    <path class="f9" d="${near.d}"/><path class="f10" d="${near.sh}"/>
    <path class="f11" d="${front.d}"/><path class="f12" d="${front.sh}"/>
    <path fill="none" stroke-width="1.6" stroke-linecap="round" style="stroke:var(--k13);fill:none" d="${rip}"/>`);
};

// Pixel sun: a seascape on a 200 by 125 pixel grid. A dithered sky, a striped sun, its broken reflection, a dhow, a
// palm island and slow pixel clouds. Each colour is one path of pixel runs; --k0 to --k15 colour them.
const pixelSVG = () => {
  const W = 200, Hh = 125, HZ = 78, g = Array.from({ length: Hh }, () => new Array(W).fill(0)), r = seeded(41);
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < Hh) g[y][x] = c; };
  // sky: five bands, dithered into each other
  for (let y = 0; y < HZ; y++) { const f = y / HZ * 4, b = Math.min(3, Math.floor(f)), t = Math.min(1, Math.max(0, (f - b - .3) / .55)); for (let x = 0; x < W; x++) set(x, y, t * 16 > BAY[y % 4][x % 4] ? b + 1 : b); }
  // the sun, cut by widening stripes in its lower half
  const SX = 132, SY = 58, SR = 23;
  for (let y = SY - SR; y <= SY + SR; y++) for (let x = SX - SR; x <= SX + SR; x++) {
    const dx = x - SX, dy = y - SY; if (dx * dx + dy * dy > SR * SR + 6 || y >= HZ) continue;
    const k = y - SY; if (k > 2 && (k % 6) < Math.min(5, 1 + Math.floor(k / 5))) continue;
    set(x, y, Math.min(1, Math.max(0, (y - SY + 4) / 9)) * 16 > BAY[y % 4][x % 4] ? 6 : 5);
  }
  // sea: three bands, dithered
  for (let y = HZ; y < Hh; y++) { const f = (y - HZ) / (Hh - HZ) * 2, b = Math.min(1, Math.floor(f)), t = Math.min(1, Math.max(0, (f - b - .3) / .55)); for (let x = 0; x < W; x++) set(x, y, 7 + (t * 16 > BAY[y % 4][x % 4] ? b + 1 : b)); }
  // the horizon line, a shade lighter
  for (let x = 0; x < W; x++) set(x, HZ, 4);
  // the dhow: hull, mast, lateen sail
  const DX = 46, DY = 92;
  for (let x = -14; x <= 14; x++) { const top = DY - (Math.abs(x) > 10 ? Math.abs(x) - 10 : 0), bot = DY + 3 - (Math.abs(x) > 8 ? 1 : 0) - (Math.abs(x) > 11 ? 1 : 0); for (let y = top; y <= bot; y++) set(DX + x, y, 11); }
  for (let y = DY - 28; y < DY; y++) set(DX - 1, y, 11);
  for (let y = DY - 27; y < DY - 2; y++) { const t = (y - (DY - 27)) / 24, x1 = DX + Math.round(t * 17); for (let x = DX; x <= x1; x++) set(x, y, 14); }
  // the island and two palms, bottom left
  for (let y = 112; y < Hh; y++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - ((y - 125) / 13) ** 2)) * 30); for (let x = 22 - half; x <= 22 + half; x++) set(x, y, y === 112 || (y === 113 && Math.abs(x - 22) > half - 3) ? 12 : 12); }
  const palm = (bx, h, lean) => {
    for (let i = 0; i < h; i++) { const x = bx + Math.round(lean * (i / h) ** 1.6); set(x, 112 - i, 11); set(x + 1, 112 - i, 11); }
    const cx = bx + lean, cy = 112 - h;
    [[-9, 2], [-8, -2], [-4, -4], [4, -4], [8, -2], [9, 2], [-5, 4], [6, 4]].forEach(([fx, fy]) => { const n = Math.max(Math.abs(fx), Math.abs(fy)); for (let i = 0; i <= n; i++) { const x = cx + Math.round(fx * i / n), y = cy + Math.round(fy * i / n + (i / n) ** 2 * 3); set(x, y, 13); set(x, y + 1, 13); } });
  };
  palm(12, 22, 4); palm(30, 15, -3);
  // stars and birds
  const stars = []; for (let i = 0; i < 46; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * 44); if (g[y][x] < 2) stars.push([x, y]); }
  [[84, 30], [90, 27], [96, 32]].forEach(([bx, by]) => { set(bx, by, 11); set(bx + 1, by - 1, 11); set(bx + 2, by, 11); set(bx + 3, by - 1, 11); set(bx + 4, by, 11); });
  // runs of one colour become one path each
  const runs = Array.from({ length: 16 }, () => '');
  for (let y = 0; y < Hh; y++) { let x = 0; while (x < W) { const c = g[y][x]; let e = x; while (e < W && g[y][e] === c) e++; runs[c] += `M${x} ${y}h${e - x}v1h${x - e}z`; x = e; } }
  // the sun's reflection: broken dashes under the sun, in two sets that take turns
  const refl = seed => { const q = seeded(seed); let d = ''; for (let y = HZ + 2; y < Hh - 2; y += 2) { const t = (y - HZ) / (Hh - HZ), w = Math.round(3 + (1 - t) * 14 * q() + 2), x = Math.round(SX - w / 2 + (q() - .5) * (6 + t * 18)); if (x > 52) d += `M${x} ${y}h${w}v1h${-w}z`; } return d; };
  const cloud = (cls, w) => `<svg class="pxcloud ${cls}" viewBox="0 0 ${w} 6" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true"><path class="f15" d="M3 0h${w - 9}v2h3v2h3v2H0V4h1V2h2z"/></svg>`;
  return `<div class="pxwrap">${wsvg(runs.map((d, c) => d ? `<path class="f${c}" d="${d}"/>` : '').join('')
    + `<path class="night f10 tw tw1" d="${stars.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}"/>`
    + `<path class="f10 gl ga" d="${refl(3)}"/><path class="f10 gl gb" d="${refl(7)}"/>`, `0 0 ${W} ${Hh}`, ' shape-rendering="crispEdges"')}${cloud('c1', 30)}${cloud('c2', 22)}${cloud('c3', 38)}</div>`;
};

export const wallHTML = (only = ['corniche', 'aurora', 'dunes', 'pixel'], grain = true) => {
  const scenes = {
    corniche: () => `<div class="wp tod" data-wp="corniche"><div class="scene">${cornicheSVG()}</div></div>`,
    aurora: () => `
    <div class="wp" data-wp="aurora">
      <div class="scene dusk"><div class="blob a1"></div><div class="blob a2"></div><div class="blob a3"></div><div class="blob a4"></div><div class="veil"></div></div>
      <div class="scene morning"><div class="blob a1"></div><div class="blob a2"></div><div class="blob a3"></div><div class="blob a4"></div><div class="veil"></div></div>
    </div>`,
    dunes: () => `<div class="wp tod" data-wp="dunes"><div class="scene">${dunesSVG()}</div></div>`,
    pixel: () => `<div class="wp tod" data-wp="pixel"><div class="scene">${pixelSVG()}</div></div>`
  };
  return only.map(k => scenes[k] ? scenes[k]() : '').join('') + (grain ? `
    <svg class="grain" aria-hidden="true"><filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#grainf)"/></svg>` : '');
};


/* ===== apps: what each window (laptop) or sheet (phone) shows ===== */
// the lightbox lists for every gallery, built in the reader's language
export const lbLists = () => {
  const LB = {};
  A.projects.forEach(p => { LB['p:' + p.slug] = [...shotsOf(p), ...phonesOf(p)].map(m => ({ ...m, cap: `${T(p.name)} · ${pretty(m.name)}` })); });
  LB.lab = A.lab.map(l => ({ ...l.shot, cap: l.name }));
  const lap = P['amir-lap']; if (lap?.tools) LB['tools:amir-lap'] = lap.tools.flatMap(t => t.shots.map(m => ({ ...m, cap: `${T(t.name)} · ${pretty(m.name)}` })));
  A.projects.forEach(p => (p.roles || []).forEach(r => { LB[`role:${p.slug}:${r.id}`] = r.shots.map(m => ({ ...m, cap: `${T(p.name)} · ${T(r.name)} · ${T(m.caption) || pretty(m.name)}` })); }));
  const hat = P.hatan; if (hat?.features) LB['feat:hatan'] = hat.features.map((f, i) => ({ ...featImg(hat, i), cap: `${T(hat.name)} · ${T(f.title)}` }));
  return LB;
};
// the feature still in the reader's language when the project has one
export const featImg = (p, i) => { const f = p.features[i], base = f.img.name.replace(/-(en|ar)$/, ''), alt = p.shots.find(s => s.name === `${base}-${lang}`); return alt || f.img; };
const frameBtn = (m, group, i, alt, cls = '', eager = false, sizes = SM) => `<button type="button" class="frame ${m.kind === 'phone' ? 'phone' : ''} ${m.kind === 'square' ? 'square' : ''} ${cls}" data-lb="${group}" data-i="${i}" aria-label="${esc(alt)}">${img(m, alt, '', eager, sizes)}<span class="cap" aria-hidden="true">${esc(pretty(m.name || ''))}</span></button>`;

export const startHTML = () => {
  const ps = A.person;
  return `<div class="app start"><div class="scroller" data-imp-scroll><div class="pad">
    <span class="eyebrow">AmirOS 1.0 · ${esc(u('khobar'))} · ${esc(T(A.statusDate))}</span>
    <h2 class="h-display hang-title">${esc(T(ps.name))}</h2>
    <p class="lede">${esc(T(ps.headline))}</p>
    <p class="muted">${esc(T(ps.intro))}</p>
    <span class="city">${I.pin}${esc(T(ps.city))} · ${esc(T(ps.role))}</span>
    <div class="cta row">${opener('work', 'btn primary', `${esc(u('openWork'))} ${I.arrow}`)}${opener('contact', 'btn', `${I.mail}${esc(u('contact'))}`)}${opener('about', 'btn', esc(u('aboutAmir')))}</div>
    <div class="imp-note"><span class="paw">${I.paw}</span><span>${esc(u('impIntro'))}</span><button type="button" class="btn sm" data-act="lights">${I.sparkle}${esc(u('flip'))}</button></div>
  </div></div></div>`;
};

const ribbonHTML = p => p.ribbon ? `<span class="ribbon" aria-hidden="true"><span>${esc(T(p.ribbon))}</span></span>` : '';
const coverOf = (p, first) => {
  if (p.ribbon && !p.shots.length && !p.phones.length) return `<span class="wip-art" style="--tc:${p.brand.color}">${tileFor(p, 'big')}</span>`;
  if (p.shots[0]) return img(shotsOf(p)[0], '', '', first, XS);
  if (p.phones[0]) return img(phonesOf(p)[0], '', 'contain', first, XS);
  return `<span class="wip-art" style="--tc:${p.brand.color}"></span>`;
};
export const workHTML = () => {
  const tags = Object.keys(TAGS).filter(t => A.projects.some(p => p.tags.includes(t)));
  return `<div class="app work">
    <div class="toolbar"><div><b class="h3" style="margin:0">${esc(T(A.ui.allWork))}</b> <span class="muted small">${A.projects.length} ${esc(u('projects'))}</span></div><span class="grow"></span>
      <div class="filters js-only" role="group" aria-label="${esc(u('work'))}"><button type="button" data-filter="all" aria-pressed="true">${esc(u('all'))}</button>${tags.map(t => `<button type="button" data-filter="${t}" aria-pressed="false">${esc(TAGS[t][rtl() ? 1 : 0])}</button>`).join('')}</div></div>
    <div class="tech-filter" hidden></div><div class="scroller" data-imp-scroll><p class="muted small intro">${esc(T(A.ui.workIntro))}</p><div class="tiles">${A.projects.map((p, i) => opener('p:' + p.slug, 'ptile', `
        <span class="cover">${coverOf(p, i === 0)}${tileFor(p)}${ribbonHTML(p)}</span>
        <span class="body"><b>${esc(T(p.name))}</b><span class="cat">${esc(T(p.category))}</span><span class="row">${stageChip(p)}${reachChip(p.reach)}</span><span class="st">${esc(T(p.status))}</span></span>`,
      `data-tags="${p.tags.join(' ')}" ${p.videos[0] ? `data-vid="${p.videos[0].src}"` : ''} data-imp="point" style="--cv:${p.brand.ink}"`)).join('')}</div></div></div>`;
};

/* project windows: Overview, project-specific tabs, Screens, Films, Facts */
const projectTabs = p => ['overview', ...(p.roles?.length ? ['views'] : []), ...(p.tools ? ['tools'] : []), ...((p.shots.length + p.phones.length) ? ['screens'] : []), ...(p.videos.length ? ['films'] : []), ...(p.under ? ['stack'] : []), 'facts'];
// every technology a project names, for search and the Work filter
export const techsOf = p => [...new Set([...(p.stack || []), ...(p.under?.layers || []).flatMap(l => l.items.map(i => i.name))])];
export const normKey = s => String(s || '').toLowerCase().replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const roleShot = (p, r, m, i) => `<figure class="role-shot ${m.kind === 'phone' ? 'ph' : ''}">${frameBtn({ ...m, name: '' }, `role:${p.slug}:${r.id}`, i, T(m.caption) || pretty(m.name), '', false, m.kind === 'phone' ? XS : SM)}<figcaption>${esc(T(m.caption))}</figcaption></figure>`;
const viewsHTML = p => `<div class="roles"><p class="muted m0 roles-intro">${esc(T(p.rolesIntro) || '')}</p><div class="seg role-seg js-only" role="tablist" aria-label="${esc(u('views'))}">${p.roles.map((r, i) => `<button type="button" role="tab" data-role="${r.id}" aria-selected="${i === 0}">${esc(T(r.name))}</button>`).join('')}</div>
  ${p.roles.map((r, i) => `<section class="role-panel" data-role-panel="${r.id}" data-find="role-${r.id}" ${i ? 'hidden' : ''}>
    <div class="role-head"><div><h3 class="h2 hang-title">${esc(T(r.name))}</h3><p class="muted m0">${esc(T(r.line))}</p></div>${r.pages ? `<div class="fact mini"><b dir="ltr">${esc(r.pages)}</b><span>${esc(u('pagesN'))}</span></div>` : ''}</div>
    ${r.chips?.length ? `<div class="stack role-chips">${r.chips.map(c => `<span class="chip">${esc(T(c))}</span>`).join('')}</div>` : ''}
    <div class="role-shots">${r.shots.map((m, k) => m.kind === 'phone' ? '' : roleShot(p, r, m, k)).join('')}</div>
    ${r.shots.some(m => m.kind === 'phone') ? `<div class="role-shots phones">${r.shots.map((m, k) => m.kind === 'phone' ? roleShot(p, r, m, k) : '').join('')}</div>` : ''}</section>`).join('')}</div>`;
const stackHTML = p => { const un = p.under; return `<div class="under">
  <div class="card arch"><h3 class="h3">${esc(u('architecture'))}</h3><p class="m0">${esc(T(un.arch))}</p>${un.platforms?.length ? `<div class="stack plat"><span class="muted small">${esc(u('platforms'))}</span>${un.platforms.map(x => `<span class="chip">${esc(T(x))}</span>`).join('')}</div>` : ''}</div>
  ${un.numbers?.length ? `<div class="facts sect">${un.numbers.map(f => `<div class="fact"><b dir="ltr">${esc(f.value)}</b><span>${esc(T(f.label))}</span></div>`).join('')}</div>` : ''}
  <div class="layers sect">${un.layers.map((L, li) => `<section class="layer"><h4 class="layer-h"><span class="ln" dir="ltr">0${li + 1}</span>${esc(T(L.layer))}</h4><div class="layer-items">${L.items.map(it => `<div class="tech" data-imp="point" data-find="tech-${esc(normKey(it.name))}"><b dir="ltr">${esc(it.name)}${it.version ? ` <span class="ver">${esc(it.version)}</span>` : ''}</b><small>${esc(T(it.why))}</small></div>`).join('')}</div></section>`).join('')}</div></div>`; };
const related = p => A.projects.filter(q => q !== p).map(q => [q, q.tags.filter(t => p.tags.includes(t)).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
export const projectHTML = (p0, tab = 'overview', hostId = '') => {
  const g = 'p:' + p0.slug, p = { ...p0, shots: shotsOf(p0), phones: phonesOf(p0) }, all = [...p.shots, ...p.phones], tabs = projectTabs(p0);
  if (!tabs.includes(tab)) tab = 'overview';
  const alt = m => `${T(p.name)}: ${pretty(m.name)}`;
  let hero;
  if (p.features) {
    hero = `<section class="feat"><h3 class="h3">${esc(u('featured'))}</h3><div class="feat-grid">${p.features.map((f, i) => `<article class="feat-card" data-find="feat-${i}">
      ${f.video ? `<div class="feat-media vid"><video class="preview" data-autoview muted loop playsinline preload="none" data-poster="${featImg(p0, i).src}" src="${f.video}" width="${f.img.w}" height="${f.img.h}" aria-label="${esc(T(f.title))}"></video><noscript><img src="${featImg(p0, i).src}" width="${f.img.w}" height="${f.img.h}" alt="" loading="lazy"></noscript><button type="button" class="feat-zoom" data-lb="feat:${p.slug}" data-i="${i}" aria-label="${esc(T(f.title))}">${I.expand}</button><span class="feat-tag">${I.play}${esc(u('playsOnHover'))}</span></div>`
        : `<button type="button" class="frame feat-media" data-lb="feat:${p.slug}" data-i="${i}" aria-label="${esc(T(f.title))}">${img(featImg(p0, i), T(f.title), '', i === 0, SM)}</button>`}
      <div class="feat-body"><span class="feat-n">0${i + 1}</span><b>${esc(T(f.title))}</b><p>${esc(T(f.line))}</p></div></article>`).join('')}</div></section>`;
  } else if (p.ribbon && !all.length) {
    hero = `<div class="wip-card" style="--tc:${p.brand.color}">${tileFor(p0, 'big')}<div><span class="wip-flag">${esc(T(p.ribbon))}</span><p>${esc(T(p.ribbonNote))}</p></div></div>`;
  } else if (p.shots[0]) hero = `<div class="hero-shot">${frameBtn(p.shots[0], g, 0, alt(p.shots[0]), '', true, '(max-width: 759px) 100vw, 960px')}</div>`;
  else if (p.phones.length) hero = `<div class="hero-shot phones">${p.phones.slice(0, 3).map((m, i) => frameBtn(m, g, p.shots.length + i, alt(m), '', i === 0)).join('')}</div>`;
  else hero = '';
  const toolsStrip = p.tools ? `<section class="sect"><div class="row" style="justify-content:space-between"><h3 class="h3" style="margin:0">${esc(u('tools'))}</h3><button type="button" class="btn sm js-only" data-tab="tools">${esc(u('meetTools'))} ${I.arrow}</button></div>
      <div class="tool-strip">${p.tools.map(t => `<button type="button" class="tool-mini" data-tab="tools"><span class="tm-img">${img(t.shots[0], '', '', false, XS)}</span><span><b>${esc(T(t.name))}</b><small>${esc(T(t.line))}</small></span></button>`).join('')}</div></section>` : '';
  const viewsStrip = p.roles?.length ? `<section class="sect"><div class="row" style="justify-content:space-between"><h3 class="h3" style="margin:0">${esc(T(p.rolesTitle) || u('views'))}</h3><button type="button" class="btn sm js-only" data-tab="views">${esc(u('seeViews'))} ${I.arrow}</button></div>
      <div class="tool-strip role-strip">${p.roles.map(r => `<button type="button" class="tool-mini" data-tab="views" data-role-go="${r.id}"><span class="tm-img">${thumb(r.shots.find(m => m.kind !== 'phone') || r.shots[0])}</span><span><b>${esc(T(r.name))}</b><small>${esc(T(r.line))}</small></span></button>`).join('')}</div></section>` : '';
  const builtStrip = p.under ? `<section class="sect"><div class="row" style="justify-content:space-between"><h3 class="h3" style="margin:0">${esc(u('builtWithP'))}</h3><button type="button" class="btn sm js-only" data-tab="stack">${esc(u('seeStack'))} ${I.arrow}</button></div><p class="muted small" style="margin:6px 0 10px">${esc(T(p.under.arch))}</p><div class="stack">${p.under.layers.flatMap(l => l.items).slice(0, 10).map(it => `<button type="button" class="chip mono" data-tab="stack" data-find-go="tech-${esc(normKey(it.name))}">${esc(it.name)}</button>`).join('')}</div></section>` : '';
  const rel = related(p0);
  const links = [p.link ? `<a class="btn primary" href="${p.link}" target="_blank" rel="noopener">${esc(T(p.linkLabel) || T(A.ui.visit))} ${I.out}</a>` : '',
    p.videos.length ? `<button type="button" class="btn js-only" data-tab="films">${I.film}${esc(u('watchFilms'))}</button>` : '',
    all.length > 1 ? `<button type="button" class="btn js-only" data-tab="screens">${I.image}${esc(u('seeScreens'))}</button>` : ''].join('');
  let ti = 0;
  const panels = {
    overview: `${hero}${viewsStrip}${toolsStrip}
      <div class="grid2 sect"><div class="card"><h3 class="h3">${esc(T(A.ui.problem))}</h3><p class="muted m0">${esc(T(p.problem))}</p></div><div class="card"><h3 class="h3">${esc(T(A.ui.audience))}</h3><p class="muted m0">${esc(T(p.audience))}</p></div></div>
      <div class="card sect"><h3 class="h3">${esc(T(A.ui.highlights))}</h3><ul class="hl">${p.highlights.map((h, i) => `<li data-find="hl-${i}">${esc(T(h))}</li>`).join('')}</ul></div>
      ${builtStrip}
      <div class="card sect boundary"><h3 class="h3">${esc(T(A.ui.currentBoundary))}</h3><p class="muted m0">${esc(T(p.boundary))}</p>${p.note ? `<p class="muted small" style="margin:8px 0 0">${esc(T(p.note))}</p>` : ''}</div>
      ${links ? `<div class="row sect">${links}</div>` : ''}
      ${rel.length ? `<section class="sect"><h3 class="h3">${esc(u('moreLike'))}</h3><div class="rel">${rel.map(q => opener('p:' + q.slug, 'rel-item', `${tileFor(q)}<span><b>${esc(T(q.name))}</b><small>${esc(T(q.category))}</small></span>`, 'data-imp="point"')).join('')}</div></section>` : ''}`,
    tools: p.tools ? `<div class="tools">${p.tools.map((t, k) => `<section class="tool card" data-find="tool-${k}">
        <header><span class="tool-n">0${k + 1}</span><div><h3 class="h2 hang-title">${esc(T(t.name))}</h3><p class="muted m0">${esc(T(t.line))}</p></div>${TRY[t.name.en] ? `<button type="button" class="btn sm primary js-only try-btn" data-try="${TRY[t.name.en]}">${I.sparkle}${esc(u('tryIt'))}</button>` : ''}</header>
        <div class="tool-shots ${t.shots.every(m => m.kind === 'square') ? 'squares' : ''}">${t.shots.map(m => frameBtn(m, 'tools:' + p.slug, ti++, `${T(t.name)}: ${pretty(m.name)}`)).join('')}</div></section>`).join('')}</div>` : '',
    screens: all.length ? `${p.shots.length ? `<div class="shots">${p.shots.map((m, i) => frameBtn(m, g, i, alt(m))).join('')}</div>` : ''}
      ${p.phones.length ? `<div class="shots ph">${p.phones.map((m, i) => frameBtn(m, g, p.shots.length + i, alt(m))).join('')}</div>` : ''}<p class="muted small" style="margin-top:14px">${esc(T(A.ui.sample))}</p>` : '',
    films: p.videos.length ? playerHTML(filmsOf(p0), true, 'pl-p-' + p0.slug) : '',
    views: p.roles?.length ? viewsHTML(p0) : '',
    stack: p.under ? stackHTML(p0) : '',
    facts: `<h3 class="h3">${esc(T(A.ui.figures))}</h3><div class="facts">${p.facts.map((f, i) => `<div class="fact" data-find="fact-${i}"><b dir="ltr">${esc(f.value)}</b><span>${esc(T(f.label))}</span></div>`).join('')}</div>
      <div class="card sect"><h3 class="h3">${esc(T(A.ui.stage))}</h3><div class="track">${A.stages.map((s, i) => `<span class="${i < stageIdx(p.stage) ? 'done' : i === stageIdx(p.stage) ? 'now' : ''}">${esc(T(s.label))}</span>`).join('')}</div>
        <p class="muted small" style="margin:12px 0 0"><b>${esc(T(A.ui.reach))}:</b> ${esc(T(A.reach[p.reach]))} · ${esc(T(p.status))}</p></div>
      <div class="card sect"><div class="row" style="justify-content:space-between"><h3 class="h3" style="margin:0">${esc(T(A.ui.stack))}</h3>${p.under ? `<button type="button" class="btn sm js-only" data-tab="stack">${esc(u('seeStack'))} ${I.arrow}</button>` : ''}</div><div class="stack" style="margin-top:10px">${p.stack.map(s => `<span class="chip mono">${esc(s)}</span>`).join('')}</div></div>`
  };
  // tabs and panels are tied together for assistive tech; hostId keeps the ids unique when the same project is drawn twice
  const tid = t => `${hostId || 'p'}-${p.slug}-${t}`;
  return `<div class="app project" style="--pc:${p.brand.color}" data-slug="${p.slug}">
    <header class="p-head">${tileFor(p0)}<div class="p-name"><h2 class="h2 hang-title">${esc(T(p.name))}</h2><p class="pitch">${esc(T(p.pitch))}</p></div>
      <div class="meta"><span class="row">${stageChip(p)}${reachChip(p.reach)}</span><span class="status-line">${esc(T(p.status))}</span></div></header>${ribbonHTML(p)}
    <div class="tabs" role="tablist" aria-label="${esc(T(p.name))}">${tabs.map(t => `<button type="button" role="tab" id="${tid(t)}-tab" aria-controls="${tid(t)}" data-tab="${t}" aria-selected="${t === tab}">${esc(u(t))}</button>`).join('')}</div>
    <div class="scroller" data-imp-scroll>${tabs.map(t => `<div class="panel" role="tabpanel" id="${tid(t)}" aria-labelledby="${tid(t)}-tab" data-panel="${t}" ${t === tab ? '' : 'hidden'}><h3 class="vh panel-h">${esc(u(t))}</h3>${panels[t]}</div>`).join('')}</div></div>`;
};

export const labHTML = () => `<div class="app lab"><div class="scroller" data-imp-scroll><div class="pad">
    <span class="eyebrow">${esc(u('lab'))}</span><h2 class="h2 hang-title" style="margin:6px 0 6px">${esc(T(A.ui.labTitle))}</h2><p class="muted" style="margin:0 0 18px">${esc(T(A.ui.labIntro))}</p>
    <div class="lab-grid">${A.lab.map((l, i) => `<article class="lab-card" data-imp="point">${frameBtn({ ...l.shot, name: '' }, 'lab', i, l.name)}
      <div class="body">${tileFor(l)}<b>${esc(l.name)}</b>${reachChip(l.reach)}<p>${esc(T(l.line))}</p>${l.under ? `<span class="stack lab-stack">${l.under.layers.flatMap(x => x.items).slice(0, 5).map(it => `<span class="chip mono">${esc(it.name)}</span>`).join('')}</span>` : ''}${l.link ? `<span class="row"><a class="btn sm" href="${l.link}" target="_blank" rel="noopener">${esc(T(A.ui.visit))}<span class="vh"> · ${esc(l.name)}</span> ${I.out}</a></span>` : ''}</div></article>`).join('')}</div>
  </div></div></div>`;

export const aboutHTML = () => {
  const ps = A.person, e = ps.education, stack = [...new Set(A.projects.flatMap(p => p.stack))];
  return `<div class="app about"><div class="scroller" data-imp-scroll><div class="pad">
    <div class="about-top"><div class="portrait"><img src="${ps.portrait.replace(/\.webp$/, '-640.webp')}" srcset="${ps.portrait.replace(/\.webp$/, '-640.webp')} 640w, ${ps.portrait} 1280w" sizes="170px" width="1280" height="1600" alt="${esc(T(ps.name))}" decoding="async" fetchpriority="high"></div>
      <div><span class="eyebrow">AmirOS 1.0</span><h2 class="h-display hang-title about-name">${esc(T(ps.name))}</h2>
        <dl class="spec"><dt>${esc(u('role'))}</dt><dd>${esc(T(ps.role))}</dd><dt>${esc(u('based'))}</dt><dd>${esc(T(ps.city))}</dd><dt>${esc(u('speaks'))}</dt><dd>${ps.languages.map(l => esc(T(l))).join(' · ')}</dd><dt>${esc(u('edu'))}</dt><dd>${esc(T(e.school))}</dd></dl></div></div>
    <p class="bio sect">${esc(T(ps.bio))}</p>
    <div class="sect"><div class="edu"><span class="tile mmu"><img src="${e.logo}" alt="Multimedia University logo" width="76" height="76" decoding="async"></span><div><span class="eyebrow">${I.cap} ${esc(u('edu'))}</span><b>${esc(T(e.school))}</b><span class="campus">${I.pin}${esc(T(e.campus))}</span><div class="muted small">${esc(T(e.line))}</div><div class="deg">${esc(T(e.degree))}</div></div></div></div>
    <div class="sect"><h3 class="h3">${esc(T(A.ui.approach))}</h3><div class="princ">${ps.principles[rtl() ? 'ar' : 'en'].map(([t, d]) => `<div class="card"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</div></div>
    <div class="sect"><h3 class="h3">${esc(T(A.ui.tools))}</h3><div class="stack">${stack.map(s => `<span class="chip mono">${esc(s)}</span>`).join('')}</div></div>
  </div></div></div>`;
};

export const contactHTML = () => {
  const c = A.contact;
  const row = (href, icon, label, value, end, bg, col, ext) => `<a class="c-row" href="${href}" ${ext ? 'target="_blank" rel="noopener"' : ''} style="--cb:${bg};--cc:${col}"><span class="ci">${icon}</span><span><b>${esc(label)}</b><small>${esc(value)}</small></span>${end}</a>`;
  return `<div class="app contact"><div class="scroller" data-imp-scroll><div class="pad">
    <span class="eyebrow">${esc(u('contact'))}</span><h2 class="h-display hang-title contact-title">${esc(T(c.title))}</h2><p class="muted m0">${esc(T(c.intro))}</p>
    <div class="rows">
      <div class="c-row"><span class="ci">${I.mail}</span><span><b>${esc(u('email'))}</b><small>${esc(c.email)}</small></span><span class="row nowrap"><button type="button" class="btn sm copy-btn js-only" data-copy="email">${I.copy}<span>${esc(T(A.ui.copy))}</span></button><a class="btn sm primary" href="mailto:${c.email}">${esc(T(A.ui.emailAction))}</a></span></div>
      ${row('tel:' + c.phone, I.phone, T(A.ui.call), c.phoneDisplay, I.arrow, 'rgba(60,195,168,.16)', '#3CC3A8')}
      ${row(c.whatsapp, I.chat, T(A.ui.whatsapp), c.phoneDisplay, I.out, 'rgba(37,211,102,.16)', '#25D366', true)}
      ${row(c.github, I.gh, 'GitHub', c.github.replace('https://', ''), I.out, 'rgba(127,127,127,.14)', 'currentColor', true)}
      ${row(c.linkedin, I.li, 'LinkedIn', 'linkedin.com/in/ameer-alhatime', I.out, 'rgba(10,102,194,.18)', '#4A9BE8', true)}
    </div>
    <p class="localtime js-only">${esc(u('localTime'))}: <span data-clock="time"></span> (UTC+3)</p>
    <p class="fine">${opener('privacy', 'txt-link', esc(u('privacy')))}</p>
  </div></div></div>`;
};

/* film player */
export const PL = {}; let plN = 0;
const filmsOf = p => p.videos.map(v => ({ ...v, p }));
// the films behind a player, also for players that came with the page
export const playerFilms = key => PL[key] || (key === 'pl-all' ? ALLFILMS : key?.startsWith('pl-p-') && P[key.slice(5)] ? filmsOf(P[key.slice(5)]) : null);
export const sound = { on: false };
export const dur = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export const filmTitleHTML = f => `${tileFor(f.p)}<div><b>${esc(filmTitle(f))}</b><small>${esc(T(f.p.name))} · ${dur(f.dur)}</small></div>`;
// narrow players sit in a project's Films tab, closed at first, so their poster waits until the tab is shown (app.js)
export const playerHTML = (films, narrow, key) => {
  const id = key || 'pl' + (++plN); PL[id] = films; const f = films[0], on = sound.on;
  return `<div class="player ${narrow ? 'narrow' : ''}" data-player="${id}" data-cur="0"><div>
    <div class="stage"><div class="backdrop" style="background-image:url('${f.poster}')"></div>
      ${narrow ? `<noscript><img class="nojs-poster" src="${f.poster}" width="${f.w}" height="${f.h}" alt="" loading="lazy"></noscript>` : ''}<video preload="none" playsinline loop controls ${on ? '' : 'muted'} ${narrow ? 'data-poster' : 'poster'}="${f.poster}" src="${f.src}" width="${f.w}" height="${f.h}" aria-label="${esc(filmTitle(f))}"></video>
      <button type="button" class="big-play js-only" data-pc="toggle" aria-label="${esc(u('play'))}">${I.play}</button>
      <div class="controls js-only"><button type="button" data-pc="toggle" aria-label="${esc(u('play'))}">${I.play}</button><input type="range" min="0" max="1000" value="0" data-pc="seek" aria-label="${esc(u('seek'))}"><time>0:00 / ${dur(f.dur)}</time>
        <button type="button" data-pc="sound" aria-pressed="${on}" aria-label="${esc(on ? u('soundOff') : u('soundOn'))}">${on ? I.vol : I.mute}</button><button type="button" data-pc="pip" aria-label="${esc(u('pip'))}" title="${esc(u('pip'))}">${I.pip}</button></div></div>
    <div class="film-title">${filmTitleHTML(f)}</div></div>
    <div class="reel js-only" role="list">${films.length > 1 ? films.map((v, i) => `<div role="listitem"><button type="button" data-film="${i}" aria-current="${i === 0}"><span class="th"><img src="${v.poster.replace(/\.webp$/, '-th.webp')}" alt="" width="74" height="52" loading="lazy" decoding="async"><em>${dur(v.dur)}</em></span><span><b>${esc(filmTitle(v))}</b><small>${esc(T(v.p.name))}</small></span></button></div>`).join('') : ''}</div></div>`;
};
export const filmsHTML = () => `<div class="app films-app"><div class="toolbar"><div><b class="h3" style="margin:0">${esc(u('films'))}</b> <span class="muted small">${ALLFILMS.length} ${esc(u('filmsN'))}</span></div></div><div class="scroller" data-imp-scroll>${playerHTML(ALLFILMS, false, 'pl-all')}</div></div>`;

/* settings */
export const ACCENTS = { amber: ['#FFC66A', '#FF8A5B', '#2A1405'], coral: ['#FF9A84', '#E5484D', '#2B0A08'], teal: ['#6BDDC6', '#1F9C8C', '#04201B'], sky: ['#8ECBFF', '#3D63F2', '#061232'], lime: ['#D6EA80', '#7DB343', '#152006'] };
export const WALLS = ['corniche', 'aurora', 'dunes', 'pixel'];
const seg = (key, opts) => `<div class="seg" role="radiogroup" aria-label="${esc(u(key === 'theme' ? 'themeL' : key === 'lang' ? 'languageL' : 'iconOrder'))}">${opts.map(([v, l]) => `<button type="button" role="radio" data-set="${key}" data-val="${v}" aria-checked="false">${esc(l)}</button>`).join('')}</div>`;
const sw = (key, label, note = '') => `<button type="button" class="sw-row" role="switch" data-set="${key}" aria-checked="false"><span><b>${esc(label)}</b>${note ? `<small>${esc(note)}</small>` : ''}</span><span class="switch" aria-hidden="true"></span></button>`;
export const settingsHTML = () => `<div class="app settings"><div class="scroller" data-imp-scroll><div class="pad">
    <span class="eyebrow">AmirOS 1.0</span><h2 class="h2 hang-title" style="margin:6px 0 16px">${esc(u('settings'))}</h2>
    <section class="card set"><h3 class="h3">${esc(u('appearance'))}</h3>
      <div class="set-row"><span>${esc(u('themeL'))}</span>${seg('theme', [['auto', u('auto')], ['light', u('lightL')], ['dark', u('darkL')]])}</div>
      <div class="set-row"><span>${esc(u('accent'))}</span><div class="swatches" role="radiogroup" aria-label="${esc(u('accent'))}">${Object.entries(ACCENTS).map(([k, c]) => `<button type="button" role="radio" data-set="accent" data-val="${k}" aria-checked="false" aria-label="${esc(u('A_' + k))}" title="${esc(u('A_' + k))}" style="--sw1:${c[0]};--sw2:${c[1]}"></button>`).join('')}</div></div>
      <div class="set-col"><span>${esc(u('wallpaper'))}</span><div class="walls" role="radiogroup" aria-label="${esc(u('wallpaper'))}">${WALLS.map(k => `<button type="button" role="radio" data-set="wall" data-val="${k}" aria-checked="false"><span class="wthumb wt-${k}"></span><span>${esc(u('W_' + k))}</span></button>`).join('')}</div></div>
    </section>
    <section class="card set"><h3 class="h3">${esc(u('impName'))}</h3>
      <div class="set-row"><span>${esc(u('impSize'))}</span><div class="sizer"><button type="button" class="btn sm" data-act="imp-shrink" data-imp-size="shrink">${I.minus}${esc(u('shrink'))}</button><output data-imp-size-readout>100%</output><button type="button" class="btn sm" data-act="imp-grow" data-imp-size="grow">${I.plus}${esc(u('grow'))}</button></div></div>
      ${sw('imp', u('impOnDesk'))}
      <div class="row" style="margin-top:10px"><button type="button" class="btn sm" data-act="lights">${I.sparkle}${esc(u('flip'))}</button><button type="button" class="btn sm" data-act="laugh">${esc(u('laugh'))}</button></div>
    </section>
    <section class="card set"><h3 class="h3">${esc(u('languageL'))}</h3><div class="set-row"><span>${esc(u('languageL'))}</span>${seg('lang', [['en', 'English'], ['ar', 'العربية']])}</div></section>
    <section class="card set"><h3 class="h3">${esc(u('motion'))}</h3>${sw('motion', u('reduceMotion'), env.rm ? u('systemReduces') : u('reduceNote'))}</section>
    <section class="card set desk-only"><h3 class="h3">${esc(u('deskL'))}</h3>
      <div class="set-row"><span>${esc(u('iconOrder'))}</span>${seg('icons', [['default', u('byDefault')], ['name', u('byName')], ['stage', u('byStage')]])}</div>
      ${sw('widgets', u('showWidgets'))}${sw('ball', u('ballOn'))}</section>
    <div class="row"><button type="button" class="btn sm" data-act="reset">${I.restart}${esc(u('reset'))}</button></div>
  </div></div></div>`;

/* help */
const kbd = s => s.split('+').map(k => `<kbd>${esc(k)}</kbd>`).join('<span class="plus">+</span>');
export const helpHTML = () => {
  const rows = [[`${mod()}+K`, 'sc_search'], [`${mod()}+Enter`, 'sc_newTab'], ['F3 / Ctrl+Alt+A', 'sc_tasks'], ['Alt+Shift+← / →', 'sc_tabs'], ['Ctrl+Alt+W', 'sc_closeTab'], ['Ctrl+Alt+C', 'sc_cc'], [`${mod()}+,`, 'sc_settings'], ['Esc', 'sc_close'], ['Ctrl+Alt+← / →', 'sc_snapLR'], ['Ctrl+Alt+↑', 'sc_up'], ['Ctrl+Alt+↓', 'sc_down'], ['Ctrl+Alt+D', 'sc_desk'], ['Ctrl+Alt+G', 'sc_tile'], ['Ctrl+Alt+T', 'sc_term'], ['?', 'sc_help'], ['← / →', 'sc_lb']];
  return `<div class="app help"><div class="scroller" data-imp-scroll><div class="pad">
    <span class="eyebrow">${esc(u('help'))}</span><h2 class="h2 hang-title" style="margin:6px 0 16px">${esc(u('shortcuts'))}</h2>
    <div class="card"><table class="keys"><tbody>${rows.map(([k, d]) => `<tr><td dir="ltr">${k.split(' / ').map(kbd).join(' <span class="or">/</span> ')}</td><td>${esc(u(d))}</td></tr>`).join('')}</tbody></table></div>
    <div class="card sect"><h3 class="h3">${esc(u('mouseTips'))}</h3><ul class="hl">${['tip1', 'tip2', 'tip3', 'tip5', 'tip6', 'tip4', 'tip7'].map(t => `<li>${esc(u(t))}</li>`).join('')}</ul></div>
    <div class="row sect"><button type="button" class="btn sm" data-act="search">${I.search}${esc(u('search'))}</button>${opener('terminal', 'btn sm', `${I.term}${esc(u('terminal'))}`)}${opener('aboutos', 'btn sm', esc(u('aboutOS')))}</div>
  </div></div></div>`;
};
export const aboutOSHTML = () => {
  const screens = A.projects.reduce((n, p) => n + p.shots.length + p.phones.length, 0);
  return `<div class="app aboutos"><div class="scroller" data-imp-scroll><div class="pad center">
    <span class="tile mark-tile big" aria-hidden="true">a</span>
    <h2 class="h2 hang-title" style="margin:14px 0 4px">AmirOS</h2><p class="muted m0">${esc(u('version'))} 1.0 · ${esc(u('osTag'))}</p>
    <dl class="spec os-spec"><dt>${esc(u('work'))}</dt><dd>${A.projects.length} ${esc(u('projects'))} · ${A.lab.length} ${esc(u('lab'))}</dd><dt>${esc(u('films'))}</dt><dd>${ALLFILMS.length} ${esc(u('filmsN'))} · ${screens} ${esc(u('screensN'))}</dd>
      <dt>${esc(u('builtWith'))}</dt><dd>Astro · HTML · CSS · JavaScript · Bricolage Grotesque · Onest · Alexandria</dd><dt>${esc(u('mascot'))}</dt><dd>${esc(u('mascotLine'))}</dd></dl>
    <p class="muted small">${esc(u('madeIn'))} ${opener('privacy', 'txt-link', esc(u('privacy')))}</p>
    <div class="row" style="justify-content:center">${opener('settings', 'btn sm', `${I.gear}${esc(u('settings'))}`)}<button type="button" class="btn sm" data-act="restart">${I.restart}${esc(u('restart'))}</button></div>
  </div></div></div>`;
};

export const privacyHTML = () => {
  const p = PRIVACY[lang];
  return `<div class="app privacy"><div class="scroller" data-imp-scroll><div class="pad">
    <span class="eyebrow">${esc(u('privacy'))}</span><h2 class="h2 hang-title" style="margin:6px 0 8px">${esc(p.title)}</h2><p class="muted" style="margin:0 0 4px">${esc(p.intro)}</p>
    ${p.sections.map(([h, t]) => `<section class="card sect"><h3 class="h3">${esc(h)}</h3><p class="muted m0">${esc(t)}</p></section>`).join('')}
  </div></div></div>`;
};
export const notFoundHTML = () => `<div class="app notfound"><div class="scroller" data-imp-scroll><div class="pad center">
    <span class="tile mark-tile big" aria-hidden="true">?</span>
    <span class="eyebrow" style="margin-top:16px">${esc(u('nfEyebrow'))}</span>
    <h2 class="h2 hang-title" style="margin:8px 0 6px">${esc(u('nfTitle'))}</h2><p class="muted m0">${esc(u('nfText'))}</p>
    <div class="row" style="justify-content:center;margin-top:18px">${opener('start', 'btn primary', esc(u('returnHome')))}${opener('work', 'btn', esc(u('allProjects')))}</div>
  </div></div></div>`;

/* notes: as many notes as you like, kept in this browser. The list sits beside the editor; app.js fills both. */
export const notesHTML = () => `<div class="app notes"><div class="nt-grid">
  <aside class="nt-side">
    <div class="nt-top"><b class="nt-h">${esc(u('notes'))}</b><button type="button" class="btn sm nt-new" data-nt="new" title="${esc(u('newNote'))} (Alt+N)">${I.plus}<span>${esc(u('newNote'))}</span></button></div>
    <label class="nt-find">${I.search}<input type="search" data-nt="find" placeholder="${esc(u('notesFind'))}" aria-label="${esc(u('notesFind'))}" autocomplete="off"></label>
    <ul class="nt-list" aria-label="${esc(u('notesList'))}"></ul>
    <button type="button" class="nt-trash" data-open="trash">${I.trash}<span>${esc(u('trash'))}</span><small class="nt-trash-n"></small></button>
  </aside>
  <section class="nt-main">
    <div class="nt-bar">
      <span class="nt-status muted small" role="status" aria-live="polite"></span>
      <span class="nt-acts">
        <button type="button" class="btn sm" data-nt="save" aria-label="${esc(u('notesSave'))}" title="${esc(u('notesSave'))} (${mod()}+S)">${I.check}<span>${esc(u('notesSave'))}</span></button>
        <span class="nt-dlw"><button type="button" class="btn sm" data-nt="dl" aria-label="${esc(u('notesDownload'))}" aria-haspopup="menu" aria-expanded="false">${I.download}<span>${esc(u('notesDownload'))}</span></button>
          <span class="nt-dl glass" role="menu" hidden><button type="button" role="menuitem" data-nt="dl-txt"><b>${esc(u('notesTxt'))}</b><small dir="ltr">.txt</small></button><button type="button" role="menuitem" data-nt="dl-md"><b>${esc(u('notesMd'))}</b><small dir="ltr">.md</small></button></span></span>
        <button type="button" class="btn sm nt-desk" data-nt="desk" aria-pressed="false">${I.fileI}<span class="nt-desk-l"></span></button>
        <button type="button" class="btn sm nt-del" data-nt="del" aria-label="${esc(u('notesDelete'))}" title="${esc(u('notesDelete'))}">${I.trash}</button>
      </span>
    </div>
    <textarea class="note-ta" spellcheck="true" placeholder="${esc(u('notesPh'))}" aria-label="${esc(u('notesBody'))}"></textarea>
    <p class="note-foot muted small"><span>${esc(u('notesSaved'))}</span><span class="note-n" dir="ltr"></span></p>
  </section></div></div>`;

/* terminal */
export const TERM = { lines: [], hist: [], hi: 0 };
export const terminalHTML = () => `<div class="app terminal" dir="ltr"><div class="scroller term-out" data-imp-scroll aria-live="polite">${TERM.lines.join('')}</div>
  <form class="term-in"><label class="prompt" for="term-input">amir@amiros ~ %</label><input id="term-input" autocomplete="off" autocapitalize="off" spellcheck="false"></form></div>`;

const TRY = { 'File Toolbox': 'toolbox', Longshot: 'longshot', Pulse: 'pulse' };
export const appMeta = id => {
  if (id.startsWith('p:')) { const p = P[id.slice(2)]; return p ? { size: [960, 700], min: [420, 300], html: s => projectHTML(p, s?.tab, s?.key) } : null; }
  return ({
    start: { size: [620, 0], min: [420, 300], html: startHTML }, work: { size: [1000, 690], min: [420, 320], html: workHTML }, films: { size: [1060, 650], min: [480, 340], html: filmsHTML },
    lab: { size: [900, 650], min: [420, 320], html: labHTML }, about: { size: [880, 690], min: [420, 320], html: aboutHTML }, contact: { size: [620, 640], min: [400, 320], html: contactHTML },
    settings: { size: [680, 690], min: [420, 320], html: settingsHTML }, help: { size: [660, 640], min: [420, 300], html: helpHTML }, aboutos: { size: [520, 540], min: [400, 300], html: aboutOSHTML },
    terminal: { size: [720, 460], min: [420, 260], html: terminalHTML }, privacy: { size: [680, 660], min: [420, 320], html: privacyHTML }, notes: { size: [780, 580], min: [420, 340], html: () => notesHTML() }, trash: { size: [600, 520], min: [380, 300], html: () => `<div class="app trash"><div class="pad"></div></div>` }, notfound: { size: [520, 440], min: [400, 300], html: notFoundHTML }
  })[id] || null;
};
// a sheet (phone) as it is drawn; the build draws the page's own window this way so the page reads without JavaScript
export const sheetHTML = (id, attrs = '', cls = '') => {
  const tid = 'st-' + id.replace(/[^a-z0-9]/gi, '-');
  return `<section class="sheet glass ${cls}" role="dialog" aria-modal="true" aria-labelledby="${tid}" tabindex="-1" data-app="${id}" ${attrs}><div class="sheet-bar" title="${esc(u('swipe'))}"><span class="grab" aria-hidden="true"></span><h2 id="${tid}">${appTile(id)}<span>${esc(appTitle(id))}</span></h2><button type="button" class="sheet-close js-only" data-sc aria-label="${esc(u('close'))}">${I.x}</button></div><div class="sheet-main" data-imp-scroll>${appMeta(id).html({ tab: 'overview', key: 'st' })}</div></section>`;
};


/* ===== the desktop itself: menu bar, icons, widgets, phone home screen, dock ===== */
export const topbarHTML = ({ hidden = false, langHref = href('start', other()) } = {}) => `
    <a class="tb-btn strong nojs-only" href="${href('start')}"><span class="mark" aria-hidden="true">a</span>AmirOS</a>
    <button type="button" class="tb-btn strong desk-only js-only" data-menu="os" aria-haspopup="menu" aria-expanded="false"><span class="mark" aria-hidden="true">a</span>AmirOS</button>
    <button type="button" class="tb-btn desk-only js-only" data-menu="work" aria-haspopup="menu" aria-expanded="false">${esc(u('work'))}</button>
    ${opener('lab', 'tb-btn desk-only', esc(u('lab')))}
    ${opener('films', 'tb-btn desk-only', esc(u('films')))}
    ${opener('about', 'tb-btn desk-only', esc(u('about')))}
    ${opener('contact', 'tb-btn desk-only', esc(u('contact')))}
    <button type="button" class="tb-btn desk-only js-only" data-menu="window" aria-haspopup="menu" aria-expanded="false">${esc(u('window'))}</button>
    <button type="button" class="tb-btn desk-only js-only" data-menu="help" aria-haspopup="menu" aria-expanded="false">${esc(u('help'))}</button>
    <time class="clock phone-only js-only" data-clock="time"></time>
    <span class="grow"></span>
    <button type="button" class="tb-btn icon-only desk-only js-only" id="tvBtn" data-act="tasks" aria-label="${esc(u('taskView'))} (F3)" title="${esc(u('taskView'))} (F3)">${I.tasks}</button>
    <button type="button" class="tb-btn icon-only js-only" id="searchBtn" data-act="search" aria-label="${esc(u('search'))} (${mod()}+K)" title="${esc(u('search'))} (${mod()}+K)">${I.search}</button>
    <a class="tb-btn lang-btn" id="langBtn" href="${langHref}" hreflang="${other()}" data-imp="lang">${I.globe}<span lang="${other()}">${esc(T(A.ui.language))}</span><span class="vh"> (${esc(u('toLang'))})</span></a>
    <button type="button" class="tb-btn theme-btn js-only" id="themeBtn" aria-label="${esc(u('flip'))}">${I.moon}</button>
    <button type="button" class="tb-btn icon-only js-only" id="ccBtn" data-cc-open aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(u('controlCenter'))}" title="${esc(u('controlCenter'))}">${I.sliders}</button>
    <button type="button" class="tb-btn js-only ${hidden ? 'imp-off' : ''}" id="impBtn" data-menu="imp" aria-haspopup="menu" aria-expanded="false"><span class="imp-dot" aria-hidden="true"></span>${esc(u('impName'))}</button>
    <button type="button" class="tb-btn clock-btn desk-only js-only" data-nc aria-haspopup="dialog" aria-expanded="false"><time class="clock" data-clock="label"></time><span class="vh">, ${esc(u('ncLabel'))}</span><span class="nc-dot" hidden></span></button>`;

const shipRows = () => FLAG.map(p => opener('p:' + p.slug, 'ship-row', `${tileFor(p)}<span><b>${esc(T(p.name))}</b><small>${esc(T(p.status))}</small></span><span class="dot" style="--sc:var(--s-${p.stage})" title="${esc(stageLabel(p.stage))}"></span>`, 'data-imp="point"')).join('');
const eduInner = () => { const e = A.person.education; return `<span class="tile mmu"><img src="${e.logo}" alt="MMU" width="56" height="56" loading="lazy" decoding="async"></span><span><span class="w-eyebrow">${esc(u('edu'))}</span><b>${esc(T(e.school))}</b><small>${esc(T(e.campus))}</small></span>`; };
const reachInner = () => {
  const c = A.contact;
  return `<div class="w-eyebrow">${esc(u('reachAmir'))}</div><div class="rows">
    <a class="reach-row" href="mailto:${c.email}" data-copy="email">${I.mail}<span class="grow" dir="ltr">${esc(c.email)}</span><span class="end js-only">${I.copy}<span class="vh">${esc(T(A.ui.copy))}</span></span></a>
    <a class="reach-row" href="tel:${c.phone}">${I.phone}<span class="grow" dir="ltr">${esc(c.phoneDisplay)}</span><span class="end">${esc(T(A.ui.call))}</span></a>
    <a class="reach-row" href="${c.whatsapp}" target="_blank" rel="noopener">${I.chat}<span class="grow">${esc(T(A.ui.whatsapp))}</span><span class="end">${I.out}</span></a></div>`;
};
export const iconOrder = (by = 'default') => {
  const list = [...A.projects];
  if (by === 'name') list.sort((a, b) => T(a.name).localeCompare(T(b.name), lang));
  if (by === 'stage') list.sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));
  return list;
};
export const iconsHTML = (by = 'default') => iconOrder(by).map(p => opener('p:' + p.slug, 'icon', `${tileFor(p)}<span>${esc(T(p.name))}</span>`, 'data-imp="point"')).join('') +
  opener('lab', 'icon', `${SYS.lab()}<span>${esc(u('lab'))}</span>`, 'data-imp="point"');
export const widgetsHTML = () => `<section class="widget glass" id="w-ship" data-imp="ledge" aria-label="${esc(u('nowShipping'))}"><div class="w-eyebrow">${esc(u('nowShipping'))}</div>${shipRows()}</section>
    <section class="widget glass" id="w-edu" data-imp="ledge" aria-label="${esc(u('edu'))}">${opener('about', 'edu-w', eduInner())}</section>
    <section class="widget glass reach-w" id="w-reach" data-imp="ledge" aria-label="${esc(u('reachAmir'))}">${reachInner()}</section>`;
const PHONE_APPS = () => [...A.projects.map(p => 'p:' + p.slug), 'work', 'lab', 'films', 'about', 'contact', 'notes', 'settings'];
export const homeHTML = () => {
  const ps = A.person;
  return `
    <button type="button" class="search-pill glass js-only" data-act="search">${I.search}<span>${esc(u('phoneSearch'))}</span></button>
    <section class="widget glass hero-w" aria-labelledby="hero-name"><span class="eyebrow">AmirOS · ${esc(u('khobar'))}</span><h1 class="h-display hero-name" id="hero-name">${esc(T(ps.name))}</h1><p class="lede">${esc(T(ps.headline))}</p><p>${esc(T(ps.intro))}</p>
      <div class="cta row">${opener('work', 'btn primary', esc(u('openWork')))}${opener('contact', 'btn', esc(u('contact')))}</div></section>
    <div class="porch-wrap js-only"><div class="porch" data-imp="ledge"><span>${I.paw}${esc(u('porch'))}</span></div></div>
    <section class="widget glass" data-imp="ledge" aria-label="${esc(u('nowShipping'))}"><div class="w-eyebrow">${esc(u('nowShipping'))}</div>${shipRows()}</section>
    <section class="files-home js-only" aria-label="${esc(u('files'))}" hidden></section>
    <nav class="apps" aria-label="${esc(u('home'))}">${PHONE_APPS().map(id => opener(id, `app-icon ${href(id) ? '' : 'js-only'}`, `${appTile(id)}<span>${esc(appTitle(id))}</span>`, 'data-imp="point"')).join('')}</nav>
    <section class="widget glass" data-imp="ledge" aria-label="${esc(u('edu'))}">${opener('about', 'edu-w', eduInner())}</section>
    <section class="widget glass reach-w" data-imp="ledge" aria-label="${esc(u('reachAmir'))}">${reachInner()}</section>
    <p class="imp-note js-only"><span class="paw">${I.paw}</span><span>${esc(u('impIntro'))}</span></p>
    <p class="home-foot">${opener('privacy', 'txt-link', esc(u('privacy')))}</p>`;
};
export const DOCK_DESK = () => ['start', 'work', ...FLAG.map(p => 'p:' + p.slug), '|', 'films', 'lab', 'about', 'contact', 'notes', 'settings'];
export const DOCK_PHONE = ['work', 'films', 'about', 'contact'];
// one dock for both form factors: the phone keeps four items, the rest are desk-only
export const dockHTML = (mins = []) => {
  const item = (id, n) => opener(id, `dock-item ${id.startsWith('p:') ? 'dock-flag' : ''} ${DOCK_PHONE.includes(id) ? '' : 'desk-only'}`, `${appTile(id)}<span class="tip" aria-hidden="true">${esc(appTitle(id))}</span>`, `data-dock="${id}" data-imp="point" style="--n:${n}" aria-label="${esc(appTitle(id))}"`);
  return DOCK_DESK().map((id, n) => id === '|' ? '<span class="dock-sep desk-only" aria-hidden="true"></span>' : item(id, n)).join('') +
    '<span class="dock-sep desk-only trash-sep" aria-hidden="true"></span>' + item('trash', 0) +
    (mins.length ? '<span class="dock-sep desk-only" aria-hidden="true"></span>' + mins.map((w, n) => `<button type="button" class="dock-item running desk-only" data-restore="${w.key}" data-dock="min:${w.key}" style="--n:${n}" aria-label="${esc(u('minimized'))}: ${esc(appTitle(w.id))}">${appTile(w.id)}<span class="tip" aria-hidden="true">${esc(appTitle(w.id))}</span></button>`).join('') : '');
};

/* the boot screen; the build draws it on the home page so it is there from the first paint */
// the waving Imp here is a two-frame sprite rendered from the owner's own wave clip (scripts/boot-sprite.mjs), so the boot screen never waits for the runtime
export const bootHTML = (force = false) => `<div class="bi"><span class="boot-imp" aria-hidden="true"></span><div class="bt"><span class="mark" aria-hidden="true">a</span>AmirOS</div><div class="bar"><i></i></div><p>${esc(u(force ? 'restarting' : 'waking'))}</p><p>${esc(u('skip'))}</p></div>`;
