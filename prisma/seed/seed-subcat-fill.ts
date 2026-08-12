import 'dotenv/config'
import { prisma } from '@/lib/prisma'
import { faNormalize } from '@/lib/search'
import { MEGA_MENU } from '@/lib/categories'

// ─── RNG تعیینی برای بازتولید یکسان ───
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type TermCfg = { features: string[]; brand?: boolean }
type CatCfg = {
  brands: string[]
  price: [number, number]
  images: string[]
  intro: string[]
  feature: string[]
  terms: Record<string, TermCfg>
}

const GUARANTEE = [
  'خرید این محصول شامل ضمانت اصالت کالا و ارسال سریع دیجی‌کلون است.',
  'این محصول با ضمانت اصالت و امکان بازگشت ۷ روزه از دیجی‌کلون قابل تهیه است.',
  'ارسال سریع و بسته‌بندی ایمن، این خرید را بدون نگرانی انجام می‌دهد.',
  'با خرید این محصول از خدمات پس از فروش و گارانتی معتبر بهره‌مند می‌شوید.',
  'دیجی‌کلون این محصول را با ضمانت اصالت کالا و ارسال سریع به سراسر کشور عرضه می‌کند.',
]

const CATS: Record<string, CatCfg> = {
  mobile: {
    brands: ['اپل', 'سامسونگ', 'شیائومی', 'آنر', 'گوگل'],
    price: [12000000, 70000000],
    images: ['/images/products/iphone-15.svg', '/images/products/samsung-s24.svg', '/images/products/xiaomi-14.svg', '/images/products/honor-magic-6.svg', '/images/products/pixel-8.svg', '/images/products/oneplus-12.svg', '/images/products/sony-xperia-1v.svg'],
    intro: ['با صفحه‌نمایش باکیفیت، پردازنده قدرتمند و باتری بادوام، تجربه‌ای روان و لذت‌بخش در استفاده روزانه ارائه می‌دهد.', 'با دوربین پیشرفته و طراحی مدرن، انتخابی عالی برای عکاسی و استفاده روزمره است.', 'با بدنه بادوام و سخت‌افزار به‌روز، عملکردی سریع و مطمئن در تمام شرایط فراهم می‌کند.'],
    feature: ['باتری با ظرفیت بالا امکان استفاده طولانی بدون نگرانی از شارژ را می‌دهد.', 'تراشه قدرتمند، اجرای روان بازی‌ها و برنامه‌های سنگین را تضمین می‌کند.'],
    terms: {
      'آیفون': { brand: true, features: ['۱۵ پرومکس', '۱۵', '۱۴ پرومکس', '۱۴'] },
      'سامسونگ': { brand: true, features: ['گلکسی A56', 'گلکسی S24 FE', 'گلکسی A36', 'گلکسی M35'] },
      'شیائومی': { brand: true, features: ['ردمی نوت ۱۴', 'ردمی ۱۳', 'پوکو X6', 'ردمی ۱۴ سی'] },
      'آنر': { brand: true, features: ['ماجیک ۶ پرو', 'ایکس ۸', 'ماجیک V3', 'ایکس ۷'] },
      'گوگل پیکسل': { brand: true, features: ['پیکسل ۹', 'پیکسل ۸ پرو', 'پیکسل ۹ پرو', 'پیکسل ۹ ای'] },
    },
  },
  laptop: {
    brands: ['لنوو', 'ایسوس', 'اپل', 'اچ‌پی', 'دل'],
    price: [25000000, 120000000],
    images: ['/images/products/thinkpad-x1.svg', '/images/products/asus-zenbook-14.svg', '/images/products/macbook-air-m3.svg', '/images/products/hp-pavilion-15.svg', '/images/products/dell-xps-13.svg', '/images/products/lenovo-legion-5.svg', '/images/products/surface-laptop-5.svg', '/images/products/acer-aspire-5.svg'],
    intro: ['با پردازنده قدرتمند و نمایشگر باکیفیت، انتخاب ایده‌آلی برای کار، تحصیل و سرگرمی است.', 'با طراحی باریک و سبک، حمل‌ونقل آسان و عملکرد حرفه‌ای را در کنار هم دارد.', 'با سخت‌افزار به‌روز و بدنه مقاوم، عملکردی سریع و بادوام در استفاده طولانی ارائه می‌دهد.'],
    feature: ['باتری با دوام بالا، کار طولانی بدون نیاز به شارژ مکرر را ممکن می‌سازد.', 'نمایشگر با دقت رنگ بالا برای کارهای گرافیکی و تماشای محتوا عالی است.'],
    terms: {
      'لنوو': { brand: true, features: ['ایده‌پد 5', 'لژیون 5', 'ایده‌پد گیمینگ', 'ایده‌پد اسلیم'] },
      'ایسوس': { brand: true, features: ['ویوا بوک 15', 'تی‌اف گیمینگ', 'زِن‌بوک 14', 'ویوا بوک 16'] },
      'مک‌بوک': { brand: true, features: ['ایر M3', 'پرو M3', 'ایر 15', 'پرو M4'] },
      'اچ‌پی': { brand: true, features: ['پاویلیون 15', 'اسپکتر x360', 'ویکتوس 16', 'پروبوک 450'] },
      'دل': { brand: true, features: ['ایناسپایرون 15', 'ایکس‌پی‌اس 13', 'لتیود 7450', 'گیمینگ G15'] },
    },
  },
  tablet: {
    brands: ['اپل', 'سامسونگ', 'لنوو', 'شیائومی'],
    price: [12000000, 60000000],
    images: ['/images/products/ipad-air.svg', '/images/products/galaxy-tab.svg', '/images/products/lenovo-tab-p11.svg', '/images/products/xiaomi-pad-6.svg', '/images/products/fire-hd-10.svg', '/images/products/surface-go-4.svg'],
    intro: ['با صفحه‌نمایش باکیفیت، پردازنده قدرتمند و باتری بادوام، برای تماشای ویدیو، مطالعه و کارهای روزمره انتخابی عالی است.', 'با وزن کم و بدنه باریک، حمل‌ونقل را در هر شرایطی آسان می‌کند.', 'با نمایشگر بزرگ و روشن، تجربه تماشای محتوا و مطالعه را لذت‌بخش می‌کند.'],
    feature: ['باتری با ظرفیت بالا امکان استفاده طولانی بدون نگرانی از شارژ را می‌دهد.', 'پردازنده قدرتمند، چندوظیفگی روان و تجربه کاربری سریعی را فراهم می‌کند.'],
    terms: {
      'آیپد': { brand: true, features: ['ایرد 5', 'مینی 7', 'نسل ۱۱', 'پرو 12.9'] },
      'گلکسی تب': { brand: true, features: ['S10', 'S9 FE', 'A9+', 'S10+'] },
      'لنوو تب': { brand: true, features: ['تب P12', 'تب M11', 'تب یوگا', 'تب P11 نسل ۲'] },
    },
  },
  smartwatch: {
    brands: ['اپل', 'سامسونگ', 'شیائومی', 'گارمین'],
    price: [2000000, 40000000],
    images: ['/images/products/apple-watch.svg', '/images/products/galaxy-watch.svg', '/images/products/garmin-venu-3.svg', '/images/products/qcy-smartwatch.svg', '/images/products/kids-smartwatch.svg', '/images/products/fitbit-versa-4.svg', '/images/products/amazfit-gts4.svg', '/images/products/huawei-watch-gt4.svg'],
    intro: ['با نمایشگر روشن و سنسورهای دقیق، پایش سلامت و فعالیت‌های روزانه را ساده می‌کند.', 'با طراحی شیک و بند قابل تعویض، هم‌نشین مناسبی برای استایل روزمره است.', 'با باتری بادوام و قابلیت ضدآب، همراهی مطمئن برای ورزش و استفاده روزانه است.'],
    feature: ['سنجش ضربان قلب، اکسیژن خون و کیفیت خواب به‌صورت لحظه‌ای انجام می‌شود.', 'اعلان‌های هوشمند گوشی روی مچ دست نمایش داده می‌شوند.'],
    terms: {
      'اپل واچ': { brand: true, features: ['سری 10', 'اولترا 2', 'سری 9', 'سری SE'] },
      'گلکسی واچ': { brand: true, features: ['7', '6 کلاسیک', 'FE', '7 اولترا'] },
      'گارمین': { brand: true, features: ['ونو 3', 'فنیکس 7', 'فوررنر 265', 'ونو اسکوئر'] },
    },
  },
  audio: {
    brands: ['سونی', 'انکر', 'جی‌بی‌ال', 'مارشال', 'سامسونگ'],
    price: [1000000, 40000000],
    images: ['/images/products/sony-wh1000xm5.svg', '/images/products/airpods-pro.svg', '/images/products/jbl-flip6.svg', '/images/products/tv-samsung-55.svg', '/images/products/soundbar-samsung.svg', '/images/products/marshall-emberton.svg', '/images/products/sonos-one.svg', '/images/products/razer-barracuda.svg', '/images/products/tv-lg-65.svg'],
    intro: ['با کیفیت صدای بالا و طراحی ارگونومیک، تجربه شنیداری غنی و راحتی را فراهم می‌کند.', 'با اتصال پایدار بلوتوث و باتری بادوام، همراهی مطمئن برای هر لحظه است.', 'با صدای شفاف و بیس قدرتمند، لذت شنیدن موسیقی و تماشای فیلم را چند برابر می‌کند.'],
    feature: ['کنترل لمسی و دکمه‌های کاربردی، استفاده آسان در هر شرایطی را ممکن می‌سازد.', 'قابلیت حذف نویز فعال، تمرکز شما را در محیط‌های شلوغ حفظ می‌کند.'],
    terms: {
      'هدفون': { features: ['بی‌سیم سونی', 'روگوشی بلوتوثی', 'گیمینگ', 'بی‌سیم ریزر'] },
      'اسپیکر': { features: ['بلوتوثی جی‌بی‌ال', 'بلوتوثی سونی', 'پارتی‌باکس', 'رومیزی'] },
      'تلویزیون': { features: ['55 اینچ سامسونگ', '65 اینچ ال‌جی', '50 اینچ', '75 اینچ'] },
      'ایرپادز': { brand: true, features: ['پرو 2', 'نسل 4', 'پرو 3', 'نسل 3'] },
      'ساندبار': { features: ['سامسونگ', 'ال‌جی', 'سونی', 'شیائومی'] },
    },
  },
  gpu: {
    brands: ['ان‌ویدیا', 'ای‌ام‌دی', 'ایسوس', 'ام‌اس‌آی'],
    price: [15000000, 120000000],
    images: ['/images/products/rtx-4080.svg', '/images/products/rtx4070.svg', '/images/products/rtx-4060-ti.svg', '/images/products/gtx1660.svg', '/images/products/asus-monitor-24.svg', '/images/products/rx-7800xt.svg'],
    intro: ['با عملکرد قدرتمند و پردازش سریع، تجربه‌ای حرفه‌ای در بازی و کارهای گرافیکی ارائه می‌دهد.', 'با فناوری به‌روز و کارایی بالا، انتخاب مناسبی برای گیمرها و طراحان است.', 'با کیفیت ساخت بالا و خنک‌کنندگی مناسب، عملکرد پایداری در بار سنگین دارد.'],
    feature: ['پشتیبانی از جدیدترین فناوری‌های رندرینگ و رزولوشن بالا را دارد.', 'کم‌مصرف و کم‌صدا، مناسب استفاده طولانی‌مدت است.'],
    terms: {
      'مانیتور': { features: ['گیمینگ 27', '4K 32', '144 هرتز 24', 'منحنی 34'] },
      'کنسول': { features: ['پلی‌استیشن 5', 'ایکس‌باکس سری ایکس', 'نینتندو سوییچ', 'پی‌اس 5 اسلیم'] },
      'مادربرد': { features: ['بی ۷۶۰', 'ایکس ۶۷۰', 'ز ۹۹۰', 'ای‌تی‌ای‌ایکس'] },
    },
  },
  'computer-accessories': {
    brands: ['لاجیتک', 'ریزر', 'لوژیتک', 'رپو'],
    price: [300000, 8000000],
    images: ['/images/products/mouse-g502.svg', '/images/products/logitech-mechanical-keyboard.svg', '/images/products/sandisk-flash-64gb.svg', '/images/products/seagate-hdd-1tb.svg', '/images/products/usb-hub-4port.svg', '/images/products/webcam-c920.svg', '/images/products/keyboard-redragon.svg', '/images/products/microsoft-wireless-mouse.svg', '/images/products/headset-hyperx.svg'],
    intro: ['با طراحی ارگونومیک و دقت بالا، کارایی شما در کار و بازی را افزایش می‌دهد.', 'با کیفیت ساخت مقاوم و عملکرد روان، همراهی بادوام برای هر روز است.', 'با اتصال ساده و سازگاری گسترده، نصب و استفاده آن آسان است.'],
    feature: ['طراحی جمع‌وجور و سبک، حمل‌ونقل آن را در هر شرایطی ممکن می‌سازد.', 'قطعات باکیفیت، دوام و عملکرد مطمئنی را در طولانی‌مدت تضمین می‌کند.'],
    terms: {
      'ماوس': { features: ['گیمینگ G502', 'بی‌سیم لاجیتک', 'ارگونومیک', 'راست‌دست'] },
      'کیبورد': { features: ['مکانیکال ریزر', 'بی‌سیم مایکروسافت', 'گیمینگ', 'سیمی'] },
      'فلش مموری': { features: ['64 گیگابایت', '128 گیگابایت', '32 گیگابایت', '256 گیگابایت'] },
      'هارد اکسترنال': { features: ['1 ترابایت', '2 ترابایت', 'SSD همراه', '4 ترابایت'] },
    },
  },
  'home-appliances': {
    brands: ['فیلیپس', 'پارس‌خزر', 'بوش', 'پاناسونیک'],
    price: [700000, 16000000],
    images: ['/images/products/iron.svg', '/images/products/kettle.svg', '/images/products/hairdryer.svg', '/images/products/rice-cooker.svg', '/images/products/microwave.svg', '/images/products/steam-iron-philips.svg', '/images/products/epilator-philips.svg', '/images/products/hair-styler-brush.svg'],
    intro: ['با کارایی بالا و طراحی کاربردی، بخشی ضروری از زندگی روزمره شماست.', 'با توان مناسب و عملکرد یکنواخت، کار شما را سریع و راحت انجام می‌دهد.', 'با جنس مقاوم و ایمنی بالا، انتخابی مطمئن برای استفاده طولانی‌مدت است.'],
    feature: ['تنظیمات متنوع، کنترل دقیق دما و حالت‌های مختلف را ممکن می‌سازد.', 'قابل جداسازی و تمیزکاری آسان، نگهداری آن ساده است.'],
    terms: {
      'اتو': { features: ['بخار فیلیپس', 'بخار پارس‌خزر', 'مسافرتی', 'بخار ایستاده'] },
      'کتری': { features: ['برقی بوش', 'برقی پارس‌خزر', 'برقی فیلیپس', 'شیشه‌ای'] },
      'سشوار': { features: ['فیلیپس', 'بابلیس', 'حرفه‌ای', 'موتور دی‌سی'] },
      'پلوپز': { features: ['پارس‌خزر', '6 لیتری', '3 لیتری', '10 لیتری'] },
      'مایکروویو': { features: ['سامسونگ', 'ال‌جی', '32 لیتری', '25 لیتری'] },
    },
  },
  home: {
    brands: ['سامسونگ', 'ال‌جی', 'پارس‌خزر', 'فیلیپس'],
    price: [1500000, 40000000],
    images: ['/images/products/vacuum.svg', '/images/products/blender.svg', '/images/products/air-fryer.svg', '/images/products/fridge-lg-sbs.svg', '/images/products/washer-samsung.svg', '/images/products/cordless-vacuum-xiaomi.svg', '/images/products/coffee-maker.svg', '/images/products/airfryer-parskhazar.svg'],
    intro: ['با کارایی بالا و طراحی کاربردی، بخشی ضروری از آشپزخانه مدرن شماست.', 'با کیفیت ساخت مقاوم و ظرفیت مناسب، پاسخگوی نیازهای روزانه خانواده است.', 'با فناوری به‌روز و مصرف بهینه انرژی، گزینه‌ای هوشمندانه برای منزل است.'],
    feature: ['طراحی کاربردی و نگهداری آسان، استفاده را لذت‌بخش می‌کند.', 'عملکرد قابل اعتماد، نتیجه رضایت‌بخشی در استفاده روزانه فراهم می‌کند.'],
    terms: {
      'جارو': { features: ['شارژی بی‌سیم', 'روبوت', 'باریک', 'خاکشی'] },
      'مخلوط‌کن': { features: ['فیلیپس', 'پاناسونیک', '2 لیتری', 'غذاساز'] },
      'سرخ‌کن': { features: ['بدون روغن فیلیپس', 'بدون روغن پارس‌خزر', '5 لیتری', '7 لیتری'] },
      'یخچال': { features: ['ساید بای ساید ال‌جی', 'فریزر سامسونگ', 'فریزر پایین', '12 فوت'] },
      'ماشین لباسشویی': { features: ['سامسونگ', 'ال‌جی', '7 کیلویی', '9 کیلویی'] },
    },
  },
  decor: {
    brands: ['ایکاروس', 'هوم‌دکو', 'ماریا', 'ام‌دی'],
    price: [200000, 8000000],
    images: ['/images/products/vase.svg', '/images/products/candle.svg', '/images/products/wall-clock.svg', '/images/products/led-lamp.svg', '/images/products/photo-frame.svg'],
    intro: ['با طراحی زیبا و هماهنگ با سبک‌های مختلف دکوراسیون، جلوه‌ای تازه به فضای خانه می‌بخشد.', 'با جزئیات دقیق و پرداخت باکیفیت، جلوه‌ای شیک و مدرن ایجاد می‌کند.', 'با مواد اولیه مرغوب و طراحی خلاقانه، حس گرما و آرامش را به فضا می‌آورد.'],
    feature: ['جنس بادوام و رنگ ثابت، زیبایی آن را در طول زمان حفظ می‌کند.', 'طراحی ظریف و متناسب با سلیقه‌های مختلف، به فضای خانه شخصیت می‌بخشد.'],
    terms: {
      'گلدان': { features: ['سرامیکی مدرن', 'فلزی مینیمال', 'بزرگ کف', 'آویز'] },
      'شمع': { features: ['معطر اسطوخودوس', 'استوانه‌ای', 'چای‌خوری', 'معطر وانیل'] },
      'ساعت دیواری': { features: ['مینیمال', 'کلاسیک', 'دیجیتال', 'چوبی'] },
      'رومیزی': { features: ['چوبی مدرن', 'شیشه‌ای', 'میز کار', 'چای‌خوری'] },
      'آینه': { features: ['میز آرایش', 'کلاسیک', 'تختی دیواری', 'گرد'] },
    },
  },
  clothing: {
    brands: ['هاکوپیا', 'سام', 'مهرگان', 'استوپ'],
    price: [200000, 4000000],
    images: ['/images/products/shirt-white.svg', '/images/products/jeans.svg', '/images/products/shoes.svg', '/images/products/hoodie.svg', '/images/products/shirt-casual.svg', '/images/products/chinos.svg', '/images/products/casual-shoes.svg', '/images/products/sneakers.svg', '/images/products/shorts.svg', '/images/products/tshirt.svg', '/images/products/jacket.svg', '/images/products/windbreaker.svg', '/images/products/cap-men.svg'],
    intro: ['با پارچه باکیفیت و دوخت دقیق، راحتی و استایل را در پوشش روزمره شما به ارمغان می‌آورد.', 'با طراحی ساده و کلاسیک، به‌راحتی با انواع لباس ست می‌شود.', 'با الیاف تنفس‌پذیر و دوام بالا، انتخاب ایده‌آلی برای استفاده روزانه است.'],
    feature: ['جنس لطیف و تنفس‌پذیر، راحتی مطلوبی در طول روز فراهم می‌کند.', 'دوخت باکیفیت و طراحی مدرن، دوام و استایلی ماندگار دارد.'],
    terms: {
      'مردانه': { features: ['تیشرت پنبه‌ای', 'شلوار کتان', 'کت اسپرت', 'پولوشرت'] },
      'پیراهن': { features: ['رسمی سفید', 'مجلسی مشکی', 'یقه‌دار', 'کتان'] },
      'شلوار': { features: ['جین لی', 'کتان', 'کاپری', 'اسلش'] },
      'کفش': { features: ['اسپرت نایک', 'راحتی اسکچرز', 'رانینگ', 'پیاده‌روی'] },
      'هودی': { features: ['پنبه‌ای', 'زیپ‌دار', 'طرح‌دار', 'گرمکن'] },
    },
  },
  fashion: {
    brands: ['آدیداس', 'نایک', 'پوما', 'لوییس'],
    price: [300000, 6000000],
    images: ['/images/products/leather-belt-men.svg', '/images/products/leather-handbag-women.svg', '/images/products/leather-wallet.svg', '/images/products/adidas-football.svg', '/images/products/silk-scarf.svg', '/images/products/evening-dress-women.svg', '/images/products/rayban-sunglasses.svg', '/images/products/watch-classic.svg'],
    intro: ['با متریال باکیفیت و طراحی روز، استایلی شیک و ماندگار برای شما می‌سازد.', 'با دوخت دقیق و جزئیات ظریف، ظاهری خاص و متمایز ارائه می‌دهد.', 'با کیفیت بالا و طراحی متنوع، انتخابی مناسب برای موقعیت‌های مختلف است.'],
    feature: ['طراحی هماهنگ با جدیدترین ترندهای مد، جلوهای امروزی دارد.', 'مناسب ست‌شدن با انواع لباس و اکسسوری‌ها است.'],
    terms: {
      'آدیداس': { brand: true, features: ['کفش رانینگ', 'هودی', 'شلوارک', 'تیشرت'] },
      'چرم': { features: ['کمربند چرم', 'کیف دستی چرم', 'کیف پول چرم', 'ژاکت چرم'] },
    },
  },
  beauty: {
    brands: ['فیلیپس', 'براون', 'پاناسونیک', 'لورآل'],
    price: [200000, 4000000],
    images: ['/images/products/shaver.svg', '/images/products/hairdryer.svg', '/images/products/nivea-moisturizer.svg', '/images/products/sunscreen.svg', '/images/products/shampoo.svg', '/images/products/lipstick.svg', '/images/products/loreal-mascara.svg', '/images/products/toothbrush.svg', '/images/products/hair-styler-brush.svg', '/images/products/shaver-braun.svg'],
    intro: ['با کیفیت بالا و ترکیبات ملایم، مراقبت روزانه از پوست و مو را لذت‌بخش می‌کند.', 'با فرمول تخصصی و تأثیر ماندگار، نتیجه‌ای مطمئن و قابل مشاهده ارائه می‌دهد.', 'با طراحی کاربردی و ایمنی بالا، انتخابی مناسب برای استفاده روزانه است.'],
    feature: ['مناسب انواع پوست و مو با حساسیت‌های متفاوت است.', 'تأثیرگذاری سریع و ماندگاری طولانی، رضایت شما را تضمین می‌کند.'],
    terms: {
      'فیلیپس': { brand: true, features: ['سشوار حرفه‌ای', 'اصلاح صورت', 'اصلاح بدن', 'مسواک برقی'] },
      'اصلاح': { features: ['برقی فیلیپس', 'تریمر', 'تیغ براون', 'اصلاح صورت'] },
      'مراقبت پوست': { features: ['ست سرم', 'کرم مرطوب‌کننده', 'ضد آفتاب', 'کرم ضد چروک'] },
    },
  },
  perfume: {
    brands: ['شانل', 'کریستین دیور', 'گانم', 'ورساچه'],
    price: [800000, 8000000],
    images: ['/images/products/perfume-m.svg', '/images/products/perfume-w.svg', '/images/products/perfume-unisex.svg', '/images/products/perfume.svg', '/images/products/chanel-perfume-women.svg'],
    intro: ['با رایحه ماندگار و جذاب، حضوری متمایز و خاطره‌انگیز برای شما می‌سازد.', 'با ترکیب نت‌های گرم و دلنشین، حس اعتمادبه‌نفس و شیکی را منتقل می‌کند.', 'با بطری شیک و طراحی لوکس، انتخابی مناسب برای هدیه دادن است.'],
    feature: ['رایحه این محصول ساعتی پس از استفاده بر روی پوست ماندگار می‌ماند.', 'نت‌های ابتدایی، میانی و پایانی، رایحه‌ای لایه‌لایه و خاص می‌سازند.'],
    terms: {
      'عطر مردانه': { features: ['اسنسیتال', 'لاکست', 'کوریج', 'وویاژ'] },
      'عطر زنانه': { features: ['شانل 5', 'کویو', 'لاوی', 'فرلی'] },
      'ادکلن': { features: ['مردانه', 'زنانه', 'یونیسکس', 'اسپرت'] },
      'یونیسکس': { features: ['وود', 'سیتروس', 'ماسک', 'اکوا'] },
    },
  },
  sports: {
    brands: ['سالومون', 'کلمبیا', 'دسوتری', 'توسین'],
    price: [500000, 30000000],
    images: ['/images/products/hiking-backpack.svg', '/images/products/tent.svg', '/images/products/giant-mountain-bike.svg', '/images/products/adidas-football.svg', '/images/products/yoga-mat.svg', '/images/products/camping-lantern.svg', '/images/products/sleeping-bag.svg', '/images/products/dumbbells.svg', '/images/products/treadmill-home.svg', '/images/products/suitcase.svg', '/images/products/punching-bag.svg', '/images/products/resistance-bands.svg', '/images/products/salomon-hiking-shoes.svg'],
    intro: ['با کیفیت ساخت بالا و طراحی استاندارد، همراهی مطمئن برای تمرین و سفر است.', 'با وزن کم و قابلیت حمل آسان، استفاده در هر شرایطی را ممکن می‌سازد.', 'با دوام بالا و طراحی ارگونومیک، عملکردی حرفه‌ای در فعالیت‌های ورزشی ارائه می‌دهد.'],
    feature: ['مقاوم در برابر شرایط مختلف آب‌وهوایی، مناسب استفاده بیرونی است.', 'طراحی مناسب برای کاربری طولانی و تمرینات مداوم است.'],
    terms: {
      'کوله': { features: ['مدرسه', 'کوهنوردی', 'لپ‌تاپ', 'مسافرتی'] },
      'کمپینگ': { features: ['چادر 2 نفره', 'فانوس', 'کیسه خواب', 'میز تاشو'] },
      'دوچرخه': { features: ['کوهستان', 'شهری', 'برقی', 'هیبرید'] },
      'فوتبال': { features: ['توپ', 'لباس', 'ساق‌بند', 'دستکش'] },
      'یوگا': { features: ['مت یوگا', 'تشک', 'لباس', 'کیف'] },
    },
  },
  books: {
    brands: ['نشر نی', 'نشر چشمه', 'انتشارات ققنوس', 'نشر ماهی'],
    price: [50000, 2000000],
    images: ['/images/products/book-novel.svg', '/images/products/book-child.svg', '/images/products/book-poetry.svg', '/images/products/book-selfhelp.svg', '/images/products/book-tech.svg'],
    intro: ['با ترجمه روان و صفحه‌آرایی مناسب، مطالعه‌ای لذت‌بخش و جذاب را ارائه می‌دهد.', 'با محتوای ارزشمند و چاپ باکیفیت، گزینه‌ای عالی برای علاقه‌مندان کتاب است.', 'با روایت جذاب و شخصیت‌پردازی قوی، خواننده را تا انتها همراه می‌کند.'],
    feature: ['مناسب گروه‌های سنی مختلف با سلیقه‌های گوناگون است.', 'از پرفروش‌ترین عناوین نشر در کشور است.'],
    terms: {
      'داستان': { features: ['خارجی', 'ایرانی', 'کوتاه', 'جنگی'] },
      'رمان': { features: ['معاصر', 'خارجی', 'ایرانی', 'پلیسی'] },
      'هنر': { features: ['طراحی', 'عکاسی', 'معماری', 'نقاشی'] },
    },
  },
  toys: {
    brands: ['لگو', 'بامبولو', 'ماتل', 'پلای‌گرو'],
    price: [150000, 3000000],
    images: ['/images/products/lego.svg', '/images/products/doll.svg', '/images/products/puzzle.svg', '/images/products/rc-car.svg'],
    intro: ['با طراحی جذاب و مواد ایمن، ساعتی از سرگرمی و یادگیری را برای کودکان به ارمغان می‌آورد.', 'با رنگ‌بندی شاد و جزئیات دقیق، تخیل و خلاقیت کودک را تقویت می‌کند.', 'با ساختار مقاوم و کیفیت بالا، همراهی ماندگار برای بازی‌های روزانه است.'],
    feature: ['بازی با آن به تقویت خلاقیت، تمرکز و مهارت‌های حرکتی کودک کمک می‌کند.', 'ساخته‌شده از مواد ایمن و بدون لبه‌های تیز، برای کودکان مناسب است.'],
    terms: {
      'لگو': { brand: true, features: ['شهر', 'تکنیک', 'دوستان', 'کلاسیک'] },
      'عروسک': { features: ['باربی', 'خرس عروسکی', 'نرم', 'شخصیت'] },
      'پازل': { features: ['1000 قطعه‌ای', 'سه‌بعدی', 'کودک', 'چوبی'] },
      'ماشین کنترلی': { features: ['رادیویی', 'هلیکوپتر', '4x4', 'اسپرت'] },
    },
  },
  supermarket: {
    brands: ['لادن', 'سنچل', 'گلشن', 'مازولا'],
    price: [30000, 2000000],
    images: ['/images/products/olive-oil.svg', '/images/products/tea.svg', '/images/products/coffee.svg', '/images/products/milk.svg', '/images/products/rice-tarom.svg', '/images/products/sunflower-oil-ladan.svg', '/images/products/pasta.svg', '/images/products/chocolate.svg', '/images/products/tomato-paste.svg', '/images/products/butter-kalleh.svg', '/images/products/whole-wheat-flour.svg', '/images/products/honey-chehelgiah.svg', '/images/products/eggs-local.svg'],
    intro: ['با کیفیت تضمین‌شده و بسته‌بندی بهداشتی، انتخابی مطمئن برای سفره خانواده است.', 'با تولید تازه و استاندارد، طعم و کیفیت طبیعی را حفظ می‌کند.', 'با برند معتبر و تاریخ تولید روز، تازگی محصول را تضمین می‌کند.'],
    feature: ['مناسب استفاده روزانه در آشپزخانه است.', 'ارزش غذایی بالا و کیفیت ثابت، رضایت مصرف‌کننده را به همراه دارد.'],
    terms: {
      'روغن': { features: ['آفتابگردان', 'زیتون', 'کنجد', 'سرخ‌کردنی'] },
      'چای': { features: ['سیاه', 'گیاه', 'سفید', 'سبز'] },
      'قهوه': { features: ['ترک', 'اسپرسو', 'فوری', 'ریو'] },
      'شیر': { features: ['پرچرب', 'کم‌چرب', 'بادام', 'سویا'] },
      'برنج': { features: ['طارم', 'هاشمی', 'دم سیاه', 'چینی'] },
    },
  },
  'gold-silver': {
    brands: ['آریا', 'زرین', 'سام', 'درخشان'],
    price: [1000000, 40000000],
    images: ['/images/products/gold-coin.svg', '/images/products/gold-bar.svg', '/images/products/gold-ring.svg', '/images/products/silver-chain.svg', '/images/products/gold-chain-men.svg', '/images/products/gold-bracelet.svg', '/images/products/gold-bangle.svg', '/images/products/parsian-coin.svg', '/images/products/silver-ring-men.svg', '/images/products/silver-set-women.svg'],
    intro: ['با عیار استاندارد و حک ضمانت، سرمایه‌ای مطمئن و ماندگار برای شماست.', 'با طراحی ظریف و پرداخت باکیفیت، جلوه‌ای ارزشمند و خاص دارد.', 'با اصالت تضمین‌شده و وزن دقیق، انتخابی امن برای سرمایه‌گذاری و هدیه است.'],
    feature: ['همراه با شناسنامه و گارانتی اصالت کالا عرضه می‌شود.', 'طراحی کلاسیک و ماندگار، مناسب استفاده روزمره و مجالس است.'],
    terms: {
      'سکه': { features: ['تمام بهار', 'نیم', 'ربع', 'امامی'] },
      'شمش': { features: ['1 گرمی', '5 گرمی', '10 گرمی', '50 گرمی'] },
      'انگشتر': { features: ['طلا ظریف', 'مردانه', 'نگیندار', 'نقره'] },
      'گردنبند': { features: ['طلا زنجیری', 'نقره', 'پاندورا', 'کودک'] },
    },
  },
  tools: {
    brands: ['بوش', 'ماکیتا', 'ریوبی', 'دکورا'],
    price: [200000, 15000000],
    images: ['/images/products/drill.svg', '/images/products/screwdriver-bosch.svg', '/images/products/toolbox.svg', '/images/products/laser-level.svg', '/images/products/hammer.svg', '/images/products/ladder.svg', '/images/products/rolling-toolbox.svg', '/images/products/jigsaw-makita.svg', '/images/products/glue-gun.svg', '/images/products/mini-grinder.svg', '/images/products/screwdriver-set.svg', '/images/products/laser-meter-bosch.svg', '/images/products/air-compressor-home.svg'],
    intro: ['با بدنه مقاوم و دقت بالا، برای انجام پروژه‌های خانگی و حرفه‌ای گزینه‌ای مطمئن و کاربردی است.', 'با قدرت و کارایی مناسب، انجام کارهای مختلف را سریع‌تر و آسان‌تر می‌کند.', 'با طراحی ارگونومیک و کیفیت ساخت بالا، انتخابی بادوام برای مصارف متعدد است.'],
    feature: ['دسته ارگونومیک و وزن متعادل، خستگی کمتری در استفاده طولانی ایجاد می‌کند.', 'قدرت و دقت بالا، انجام کارهای مختلف را سریع‌تر و آسان‌تر می‌کند.'],
    terms: {
      'دریل': { features: ['شارژی 18 ولت', 'شارژی 12 ولت', 'چکشی 800', 'سرعت متغیر'] },
      'پیچ‌گوشتی': { features: ['شارژی', 'ست دستی', 'برقی', 'چهارخانه'] },
      'شارژی': { features: ['دریل', 'پیچ‌گوشتی', 'اره‌موتوری', 'جارو'] },
      'جعبه ابزار': { features: ['چرخ‌دار', '90 عددی', 'کشویی', 'صنعتی'] },
      'لیزری': { features: ['متر لیزری', 'تراز لیزری', 'سطح 360', 'دوربین'] },
    },
  },
}

function countMatches(products: { name: string; slug: string; description: string | null; category: { name: string; slug: string } }[], qn: string): number {  const tokens = qn.split(' ').filter(Boolean)
  return products.filter((p) => {
    const N = faNormalize(p.name)
    const C = faNormalize(p.category.name)
    const CS = faNormalize(p.category.slug)
    const S = faNormalize(p.slug)
    const D = faNormalize(p.description || '')
    if (N.includes(qn)) return true
    if (C === qn || CS === qn) return true
    if (C.includes(qn) || CS.includes(qn)) return true
    if (tokens.every((t) => N.includes(t) || C.includes(t) || CS.includes(t))) return true
    if (S.includes(qn)) return true
    if (qn.length >= 3 && D.includes(qn)) return true
    return false
  }).length
}

// برندهای شناخته‌شده برای حذف برند تکراری از انتهای نام
const KNOWN_BRANDS = [
  'اپل', 'سامسونگ', 'شیائومی', 'آنر', 'گوگل', 'لنوو', 'ایسوس', 'اچ‌پی', 'دل', 'گارمین',
  'سونی', 'انکر', 'جی‌بی‌ال', 'مارشال', 'ان‌ویدیا', 'ای‌ام‌دی', 'ام‌اس‌آی', 'لاجیتک',
  'ریزر', 'لوژیتک', 'رپو', 'فیلیپس', 'پارس‌خزر', 'بوش', 'پاناسونیک', 'ال‌جی', 'هاکوپیا',
  'سام', 'مهرگان', 'استوپ', 'آدیداس', 'نایک', 'پوما', 'لوییس', 'براون', 'لورآل', 'شانل',
  'دیور', 'گانم', 'ورساچه', 'سالومون', 'کلمبیا', 'دسوتری', 'توسین', 'بامبولو', 'ماتل',
  'پلای‌گرو', 'لادن', 'سنچل', 'گلشن', 'مازولا', 'آریا', 'زرین', 'درخشان', 'ماکیتا',
  'ریوبی', 'دکورا', 'بابلیس',
].map(faNormalize).filter(Boolean)

// اصلاح نام‌های تکراری: حذف برند اضافه از انتها و تکرار کلمه اول
function fixName(name: string, allTerms: string[]): string {
  let n = name
  const termsNorm = allTerms.map(faNormalize).filter(Boolean).sort((a, b) => b.length - a.length)
  for (let round = 0; round < 3; round++) {
    let changed = false
    const nNorm = faNormalize(n)
    for (const t of termsNorm) {
      if (t && nNorm.startsWith(`${t} `) && nNorm.slice(t.length).includes(t)) {
        n = n.slice(t.length).trimStart()
        changed = true
        break
      }
    }
    const tokens = n.split(' ')
    const m = tokens.indexOf('مدل')
    if (m > 1) {
      const lastNorm = faNormalize(tokens[m - 1])
      if (KNOWN_BRANDS.includes(lastNorm)) {
        const earlierHasBrand = tokens.slice(0, m - 1).some((tok) => KNOWN_BRANDS.includes(faNormalize(tok)))
        if (earlierHasBrand) {
          tokens.splice(m - 1, 1)
          n = tokens.join(' ')
          changed = true
        }
      }
    }
    if (!changed) break
  }
  return n
}

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } })

  const terms: { term: string; cat: string; cfg: TermCfg }[] = []
  const seen = new Set<string>()
  for (const section of MEGA_MENU) {
    const cat = CATS[section.slug]
    if (!cat) continue
    for (const term of section.subcategories) {
      if (seen.has(term)) continue
      seen.add(term)
      const cfg = cat.terms[term]
      if (!cfg) continue
      terms.push({ term, cat: section.slug, cfg })
    }
  }

  const rng = mulberry32(20260808)
  let added = 0
  let addedCount = 0

  for (const { term, cat, cfg } of terms) {
    const qn = faNormalize(term)
    const current = countMatches(products, qn)
    if (current >= 12) continue
    const need = 12 - current
    const catCfg = CATS[cat]
    const brandPool = catCfg.brands
    const featurePool = cfg.features
    const imagePool = catCfg.images
    for (let i = 0; i < need; i++) {
      const feature = featurePool[i % featurePool.length]
      const featNorm = faNormalize(feature)
      let brand = cfg.brand ? '' : brandPool[Math.floor(rng() * brandPool.length)]
      if (brand && brandPool.some((b) => b && faNormalize(b) && featNorm.includes(faNormalize(b)))) brand = ''
      const code = `M-${String(1000 + added).padStart(4, '0')}`
      const name = cfg.brand ? `${feature} ${term} مدل ${code}` : `${term} ${feature}${brand ? ` ${brand}` : ''} مدل ${code}`
      if (!faNormalize(name).includes(qn)) {
        console.warn(`⚠️ name does not match term: ${term} -> ${name}`)
      }
      const slug = `sf-${String(added + 1).padStart(4, '0')}`
      const [min, max] = catCfg.price
      const price = Math.round((min + rng() * (max - min)) / 1000) * 1000
      const descIntro = catCfg.intro[added % catCfg.intro.length]
      const descFeature = catCfg.feature[added % catCfg.feature.length]
      const descGuarantee = GUARANTEE[added % GUARANTEE.length]
      const description = `«${name}» ${descIntro} ${descFeature} ${descGuarantee}`
      const catRow = await prisma.category.findUnique({ where: { slug: cat } })
      if (!catRow) continue
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          description,
          price,
          stock: 5 + Math.floor(rng() * 60),
          imageUrl: imagePool[i % imagePool.length],
          discountPercent: rng() < 0.5 ? Math.floor(rng() * 15) : 0,
          rating: Math.round((3.5 + rng() * 1.4) * 10) / 10,
          ratingCount: 20 + Math.floor(rng() * 280),
          salesCount: 10 + Math.floor(rng() * 190),
          categoryId: catRow.id,
        },
      })
      products.push({
        name,
        slug,
        description,
        category: { name: catRow.name, slug: catRow.slug },
      } as (typeof products)[number])
      added++
      addedCount++
    }
  }

  // تعمیر نام‌های تکراری روی محصولات تولیدشده (مثل «یوگا مت یوگا» یا برند تکراری)
  const allTermNames = terms.map((t) => t.term)
  const generated = await prisma.product.findMany({ where: { slug: { startsWith: 'sf-' } } })
  let fixed = 0
  for (const p of generated) {
    const fixedName = fixName(p.name, allTermNames)
    if (fixedName !== p.name) {
      await prisma.product.update({ where: { slug: p.slug }, data: { name: fixedName } })
      p.name = fixedName
      fixed++
    }
  }
  if (fixed) console.log(`Repair names ✅ fixed ${fixed}`)

  const below: string[] = []
  for (const { term } of terms) {
    const c = countMatches(products, faNormalize(term))
    if (c < 12) below.push(`${term}:${c}`)
  }

  console.log(`Subcat fill ✅ added ${addedCount} products; total: ${await prisma.product.count()}`)
  if (below.length) {
    console.log('❌ still below 12:', below.join(', '))
    process.exitCode = 1
  } else {
    console.log('✅ all subcategory branches >= 12 products')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
