import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type SubDef = { name: string; slug: string }

// شاخه‌های دسته‌بندی‌های اصلی
const SUBCATEGORIES: Record<string, SubDef[]> = {
  tools: [
    { name: 'دریل', slug: 'tools-drill' },
    { name: 'پیچ‌گوشتی', slug: 'tools-screwdriver' },
    { name: 'شارژی', slug: 'tools-cordless' },
    { name: 'جعبه ابزار', slug: 'tools-toolbox' },
    { name: 'لیزری', slug: 'tools-laser' },
  ],
  mobile: [
    { name: 'گوشی هوشمند', slug: 'mobile-smartphone' },
    { name: 'اکسسوری موبایل', slug: 'mobile-accessories' },
    { name: 'آیفون', slug: 'mobile-iphone' },
    { name: 'سامسونگ', slug: 'mobile-samsung' },
    { name: 'شیائومی', slug: 'mobile-xiaomi' },
  ],
  laptop: [
    { name: 'مک‌بوک', slug: 'laptop-macbook' },
    { name: 'لوازم جانبی لپ‌تاپ', slug: 'laptop-accessories' },
    { name: 'اولترابوک', slug: 'laptop-ultrabook' },
    { name: 'لپ‌تاپ گیمینگ', slug: 'laptop-gaming' },
    { name: 'لپ‌تاپ اقتصادی', slug: 'laptop-budget' },
  ],
  audio: [
    { name: 'هدفون و هدست', slug: 'audio-headphones' },
    { name: 'اسپیکر', slug: 'audio-speaker' },
    { name: 'تلویزیون', slug: 'audio-tv' },
    { name: 'ساندبار', slug: 'audio-soundbar' },
  ],
  'home-appliances': [
    { name: 'یخچال و فریزر', slug: 'homeapp-fridge' },
    { name: 'ماشین لباسشویی', slug: 'homeapp-washer' },
    { name: 'مایکروویو', slug: 'homeapp-microwave' },
    { name: 'کتری', slug: 'homeapp-kettle' },
    { name: 'اتو', slug: 'homeapp-iron' },
  ],
  home: [
    { name: 'پلوپز', slug: 'home-ricecooker' },
    { name: 'مخلوط‌کن و آبمیوه‌گیری', slug: 'home-blender' },
    { name: 'سرخ‌کن و گریل', slug: 'home-fryer' },
    { name: 'جاروبرقی', slug: 'home-vacuum' },
    { name: 'قهوه‌ساز', slug: 'home-coffeemaker' },
  ],
  beauty: [
    { name: 'آرایش', slug: 'beauty-makeup' },
    { name: 'مراقبت پوست', slug: 'beauty-skincare' },
    { name: 'مو', slug: 'beauty-hair' },
    { name: 'اصلاح', slug: 'beauty-shaving' },
    { name: 'عطر', slug: 'beauty-perfume' },
  ],
  perfume: [
    { name: 'عطر مردانه', slug: 'perfume-mens' },
    { name: 'عطر زنانه', slug: 'perfume-womens' },
    { name: 'ادکلن', slug: 'perfume-cologne' },
    { name: 'یونیسکس', slug: 'perfume-unisex' },
  ],
  sports: [
    { name: 'دوچرخه', slug: 'sports-bicycle' },
    { name: 'کمپینگ و سفر', slug: 'sports-camping' },
    { name: 'فوتبال', slug: 'sports-football' },
    { name: 'کوله و چمدان', slug: 'sports-bags' },
    { name: 'یوگا و فیتنس', slug: 'sports-fitness' },
  ],
  toys: [
    { name: 'لگو', slug: 'toys-lego' },
    { name: 'عروسک', slug: 'toys-doll' },
    { name: 'پازل و بازی فکری', slug: 'toys-puzzle' },
    { name: 'ماشین کنترلی', slug: 'toys-rc-car' },
    { name: 'رباتیک', slug: 'toys-robot' },
  ],
}

const CATEGORY_IMAGE: Record<string, string> = {
  audio: '/images/categories/audio.svg',
  beauty: '/images/categories/beauty.svg',
  books: '/images/categories/books.svg',
  camera: '/images/categories/camera.svg',
  clothing: '/images/categories/clothing.svg',
  decor: '/images/categories/decor.svg',
  fashion: '/images/categories/fashion.svg',
  'gold-silver': '/images/categories/gold-silver.svg',
  gpu: '/images/categories/gpu.svg',
  home: '/images/categories/home.svg',
  'home-appliances': '/images/categories/home-appliances.svg',
  laptop: '/images/categories/laptop.svg',
  mobile: '/images/categories/mobile.svg',
  perfume: '/images/categories/perfume.svg',
  smartwatch: '/images/categories/smartwatch.svg',
  sports: '/images/categories/sports.svg',
  supermarket: '/images/categories/supermarket.svg',
  tablet: '/images/categories/tablet.svg',
  tools: '/images/categories/tools.svg',
  toys: '/images/categories/toys.svg',
}

// کلیدواژه‌های تطبیق محصول به شاخه (اسلاگ انگلیسی + نام فارسی)
const KEYWORDS: Record<string, string[]> = {
  'tools-drill': ['drill', 'دریل', 'درج'],
  'tools-screwdriver': ['screwdriver', 'پیچ گوشتی', 'پیچ‌گوشتی'],
  'tools-cordless': ['cordless', 'شارژی', 'impact'],
  'tools-toolbox': ['toolbox', 'جعبه ابزار', 'toolset', 'tool-set', 'کمربند ابزار'],
  'tools-laser': ['laser', 'لیزر', 'لیزری', 'تراز'],
  'mobile-accessories': ['powerbank', 'power-bank', 'پاوربانک', 'شارژر', 'charger', 'کاور', 'گلس', 'محافظ', 'cable', 'کابل', 'پایه', 'استند', 'کاسه شارژ'],
  'mobile-iphone': ['iphone', 'آیفون', 'apple'],
  'mobile-samsung': ['samsung', 'galaxy', 'گلکسی'],
  'mobile-xiaomi': ['xiaomi', 'poco', 'redmi', 'شیائومی'],
  'laptop-accessories': ['keyboard', 'کیبورد', 'mouse', 'موس', 'ram', 'ssd', 'هارد', 'باتری', 'adapter', 'کیف لپ', 'cooling', 'پد خنک', 'webcam'],
  'laptop-macbook': ['macbook', 'مک بوک', 'مک‌بوک'],
  'laptop-gaming': ['gaming', 'گیمینگ', 'rog', 'legion', 'predator', 'nitro'],
  'laptop-ultrabook': ['ultrabook', 'thinkpad', 'carbon', 'اولترابوک'],
  'laptop-budget': ['aspire', 'vivobook', 'ideapad', 'اقتصادی', 'entry'],
  'audio-headphones': ['headphone', 'headset', 'earbud', 'earphone', 'airpods', 'هدفون', 'ایرپاد', 'هدست', 'gaming-headset', 'buds', 'بادز'],
  'audio-speaker': ['speaker', 'boombox', 'partybox', 'soundcore', 'flip', 'charge 5', 'clip', 'اسپیکر', 'باند', 'جی بی ال', 'jbl-', 'homepod', 'هوم‌پاد'],
  'audio-tv': ['tv', 'television', 'تلویزیون', 'oled', 'led-'],
  'audio-soundbar': ['soundbar', 'ساندبار', 'sounder'],
  'homeapp-fridge': ['fridge', 'refrigerator', 'یخچال', 'ساید بای ساید', 'فریزر'],
  'homeapp-washer': ['washer', 'washing', 'لباسشویی', 'ماشین لباس'],
  'homeapp-microwave': ['microwave', 'مایکروویو'],
  'homeapp-kettle': ['kettle', 'کتری', 'چای ساز', 'پارچ'],
  'homeapp-iron': ['iron', 'اتو', 'بخار'],
  'home-ricecooker': ['rice', 'پلوپز', 'دستی'],
  'home-blender': ['blender', 'مخلوط', 'آبمیوه', 'juicer', 'میکسر'],
  'home-fryer': ['fryer', 'سرخ کن', 'ساندویچ', 'grill', 'گریل', 'کباب پز', 'tenderizer'],
  'home-vacuum': ['vacuum', 'جارو', 'جاروبرقی'],
  'home-coffeemaker': ['coffee', 'قهوه', 'کافی'],
  'beauty-perfume': ['perfume', 'عطر', 'ادکلن', 'خوشبو'],
  'beauty-makeup': ['lipstick', 'رژ لب', 'آرایش', 'makeup', 'کرم پودر'],
  'beauty-skincare': ['کرم', 'serum', 'سرم', 'شوینده', 'مراقبت', 'ماسک صورت', 'ضد آفتاب', 'اسکراب'],
  'beauty-hair': ['سشوار', 'hairdryer', 'dryer', 'مو', 'شامپو', 'babyliss', 'حالت دهنده', 'برس'],
  'beauty-shaving': ['اصلاح', 'تیغ', 'شیو', 'trimmer', 'دستگاه اصلاح', 'shave'],
  'perfume-mens': ['مردانه', 'men', 'عود', 'ساواج', 'sauvage', 'وان میل', 'one million', 'bleu', 'invictus', 'dior'],
  'perfume-womens': ['زنانه', 'women', 'شنل', 'chanel', 'لا وی', 'la vie', 'یاس', 'jasmine', 'گل یاس', 'good girl', 'black orchid'],
  'perfume-cologne': ['ادکلن', 'cologne', 'باس', 'bass'],
  'perfume-unisex': ['یونیسکس', 'unisex', 'اسپری بدن', 'آدیداس', 'neroli'],
  'sports-bicycle': ['bicycle', 'bike', 'دوچرخه'],
  'sports-camping': ['camping', 'کمپینگ', 'چادر', 'tent', 'خواب', 'sleeping', 'صندلی'],
  'sports-football': ['football', 'فوتبال', 'soccer', 'توپ'],
  'sports-bags': ['backpack', 'کوله', 'چمدان', 'suitcase', 'bag', 'کیف', 'ساک'],
  'sports-fitness': ['dumbbell', 'دمبل', 'yoga', 'یوگا', 'fitness', 'فیتنس', 'مت', 'کتل', 'حلقه', 'طناب'],
  'toys-robot': ['robot', 'ربات', 'robotic'],
  'toys-lego': ['lego', 'لگو', 'block', 'construction'],
  'toys-doll': ['barbie', 'باربی', 'عروسک', 'doll', 'teddy', 'خرسی'],
  'toys-puzzle': ['puzzle', 'پازل', 'board', 'مونوپولی', 'شطرنج', 'memory', 'بازی فکری', 'monopoly'],
  'toys-rc-car': ['rc-car', 'کنترلی', 'police-car', 'helicopter', 'ماشین بازی', 'ماشین اسباب'],
}

// اصلاح دسته‌بندی‌های اشتباه: اسلاگ محصول -> (دسته جدید، شاخه جدید)
const OVERRIDES: Record<string, { cat: string; sub: string | null }> = {
  'sony-a7': { cat: 'camera', sub: null },
  'samsung-monitor': { cat: 'gpu', sub: null },
  'asus-router': { cat: 'computer-accessories', sub: null },
  'lenovo-keyboard': { cat: 'computer-accessories', sub: null },
  'lenovo-mouse': { cat: 'computer-accessories', sub: null },
  'mac-mini-m2': { cat: 'computer-accessories', sub: null },
  'gaming-mouse': { cat: 'computer-accessories', sub: null },
  'gaming-case': { cat: 'computer-accessories', sub: null },
  'asus-motherboard': { cat: 'computer-accessories', sub: null },
  'gaming-headset': { cat: 'audio', sub: 'audio-headphones' },
  'jbl-quantum': { cat: 'audio', sub: 'audio-headphones' },
  'samsung-dryer': { cat: 'beauty', sub: 'beauty-hair' },
  'panasonic-hairdryer': { cat: 'beauty', sub: 'beauty-hair' },
  'tefal-pan': { cat: 'home', sub: null },
  'tefal-pot': { cat: 'home', sub: null },
  'tefal-grill': { cat: 'home', sub: 'home-fryer' },
  'dyson-vacuum': { cat: 'home', sub: 'home-vacuum' },
  'bosch-vacuum': { cat: 'home', sub: 'home-vacuum' },
  'coffee-maker-delonghi': { cat: 'home', sub: 'home-coffeemaker' },
  'panasonic-rice-cooker': { cat: 'home', sub: 'home-ricecooker' },
  'sunbeam-blender': { cat: 'home', sub: 'home-blender' },
  'juicer-panasonic': { cat: 'home', sub: 'home-blender' },
  'sandwich-maker': { cat: 'home', sub: 'home-fryer' },
  'electric-tenderizer': { cat: 'home', sub: 'home-fryer' },
}

const FALLBACK_SUB: Record<string, string> = {
  mobile: 'mobile-smartphone',
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\u200c/g, ' ').replace(/\s+/g, ' ').trim()
}

function matchSub(catSlug: string, slug: string, name: string): string | null {
  const defs = SUBCATEGORIES[catSlug]
  if (!defs) return null
  const hay = norm(slug) + ' ' + norm(name)
  for (const def of defs) {
    const terms = KEYWORDS[def.slug]
    if (!terms) continue
    for (const t of terms) {
      if (hay.includes(norm(t))) return def.slug
    }
  }
  return FALLBACK_SUB[catSlug] ?? null
}

async function main() {
  // دسته جدید «دوربین و تصویر»
  await prisma.category.upsert({
    where: { slug: 'camera' },
    update: { name: 'دوربین و تصویر' },
    create: { name: 'دوربین و تصویر', slug: 'camera' },
  })

  // ساخت شاخه‌ها
  const subMap: Record<string, number> = {}
  for (const [catSlug, defs] of Object.entries(SUBCATEGORIES)) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
    if (!cat) continue
    for (const d of defs) {
      const created = await prisma.subcategory.upsert({
        where: { slug: d.slug },
        update: { name: d.name, categoryId: cat.id, imageUrl: `/images/subcategories/${d.slug}.svg` },
        create: { name: d.name, slug: d.slug, categoryId: cat.id, imageUrl: `/images/subcategories/${d.slug}.svg` },
      })
      subMap[d.slug] = created.id
    }
  }

  // تخصیص محصولات به شاخه‌ها + اصلاح دسته‌های اشتباه
  const products = await prisma.product.findMany({ include: { category: true } })
  const catIdCache: Record<string, number> = {}
  const getCatId = async (slug: string): Promise<number | null> => {
    if (catIdCache[slug]) return catIdCache[slug]
    const c = await prisma.category.findUnique({ where: { slug } })
    if (c) catIdCache[slug] = c.id
    return c?.id ?? null
  }

  let assigned = 0
  let moved = 0
  for (const p of products) {
    const ov = OVERRIDES[p.slug]
    const curCat = p.category?.slug ?? ''
    const catSlug = ov ? ov.cat : curCat
    const subSlug = ov ? ov.sub : matchSub(curCat, p.slug, p.name ?? '')
    if (subSlug && !SUBCATEGORIES[catSlug]) continue

    const subId = subSlug ? subMap[subSlug] ?? null : null
    const catId = ov ? await getCatId(ov.cat) : p.categoryId
    if (ov && (!catId || catId === p.categoryId)) continue

    const imageUrl = ov ? CATEGORY_IMAGE[ov.cat] ?? p.imageUrl : p.imageUrl
    const data: Record<string, unknown> = { subcategoryId: subId }
    if (ov && catId && catId !== p.categoryId) {
      data.categoryId = catId
      data.imageUrl = imageUrl
      moved++
    } else if (subSlug && subId !== p.subcategoryId) {
      assigned++
    } else {
      continue
    }

    await prisma.product.update({ where: { id: p.id }, data })
  }

  const count = await prisma.product.count()
  console.log(`Subcategories done: ${assigned} assigned, ${moved} moved; ${count} products total`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
