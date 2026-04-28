import { useEffect, useMemo, useRef, useState } from 'react'
import logoImage from './assets/hardline-logo.png'
import './App.css'

/* =============================================================================
   TELEGRAM BUYURTMA — SHU BLOKNI QIDIRING (token va guruh ID shu yerda)
   Agar loyiha ildizida .env bo‘lsa, u yeridagi qiymat ustun (VITE_TELEGRAM_*).
   ============================================================================= */
/* ============================================================================= */

const BOT_TOKEN = String(import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? '').trim()
const CHAT_ID = String(import.meta.env.VITE_TELEGRAM_CHAT_ID ?? '').trim()
const ORDER_API_URL = String(import.meta.env.VITE_ORDER_API_URL ?? '').trim()
const TELEGRAM_GROUP_LINK =
  import.meta.env.VITE_TELEGRAM_GROUP_LINK || 'https://t.me/'
const ADMIN_AUTH_KEY = 'hardoil_admin_auth_v1'

const LANGUAGES = ['UZ', 'RU', 'EN', 'ZH']
const SECTION_IDS = ['home', 'products', 'about', 'news', 'contact']
const STORAGE_KEY = 'hardoil_site_v1'

const ABOUT_PARTNER_BG = '/images/about-partner.jpg'

const LOCAL_PRODUCT_IMAGES = Array.from({ length: 12 }, (_, i) =>
  `/images/oil/${String(i + 1).padStart(2, '0')}.jpg`,
)
const PRODUCT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='540' viewBox='0 0 900 540'%3E%3Crect width='900' height='540' fill='%23121b2e'/%3E%3Crect x='60' y='60' width='780' height='420' rx='24' fill='%231b2945' stroke='%23384b72' stroke-width='4'/%3E%3Ccircle cx='360' cy='250' r='70' fill='%232d4166'/%3E%3Cpath d='M420 330l95-105 130 145H250l105-110z' fill='%23384f7d'/%3E%3Ctext x='450' y='430' fill='%238da6cf' font-family='Arial,sans-serif' font-size='34' text-anchor='middle'%3ERasm yuklanmagan%3C/text%3E%3C/svg%3E"

const translations = {
  UZ: {
    nav: ['Bosh sahifa', 'Mahsulotlar', 'Biz haqimizda', 'Yangiliklar', 'Kontakt'],
    heroTitle: 'Hard.oil - professional motor moylari markazi',
    heroText:
      "Yengil va yuk avtomobillari, sanoat texnikasi hamda yuqori yuklama ostida ishlaydigan dvigatellar uchun ishlab chiqilgan premium moylash yechimlari.",
    heroExtra:
      "10+ yillik tajriba, zamonaviy laboratoriya nazorati va barqaror ta'minot tizimi bilan hard.oil hamkorlar uchun ishonchli tanlovdir.",
    productsTitle: 'Top mahsulotlarimiz',
    pick: 'Tanlash',
    selected: 'Tanlandi',
    perUnit: '1 dona uchun',
    uzs: "so'm",
    orderTitle: 'Buyurtma berish',
    customerName: 'Ismingiz',
    phone: 'Telefon raqamingiz',
    note: "Qo'shimcha izoh",
    sendOrder: 'Buyurtma yuborish',
    orderEmpty: 'Kamida bitta mahsulot tanlang.',
    orderSuccess: 'Buyurtma yuborildi.',
    telegramSendFailed: 'Telegram orqali yuborilmadi.',
    telegramTokenInvalid:
      'Unauthorized = bot TOKEN noto‘g‘ri yoki bekor qilingan. @BotFather → botingiz → API Token → yangi token. Loyihada `.env` yarating: VITE_TELEGRAM_BOT_TOKEN=... va serverni qayta ishga tushiring.',
    aboutTitle: 'hard.oil haqida',
    aboutText:
      "hard.oil - yuqori darajadagi bazaviy moylar va zamonaviy qo'shimchalar asosida ishlab chiqariladigan professional brend. Mahsulotlarimiz ekstremal harorat, uzoq masofa va yuqori aylanish tezligida ham dvigatelni himoya qilish uchun sinovdan o'tkaziladi. Biz servis markazlari, korporativ avtoparklar va chakana mijozlar uchun mos logistika hamda texnik maslahat xizmatini yo'lga qo'yganmiz.",
    newsTitle: 'Yangiliklar va aksiyalar',
    contactTitle: 'Kontakt',
    contactDesc: "To'liq ma'lumot uchun biz bilan bog'laning:",
    adminOpen: 'A',
    adminLogin: 'Admin kirish',
    login: 'Login',
    password: 'Parol',
    enter: 'Kirish',
    logout: 'Chiqish',
    close: 'Yopish',
    wrong: "Noto'g'ri login yoki parol.",
    editPrices: 'Narxlarni tahrirlash',
    editProductsFull: 'Mahsulotlar (nom, narx, rasm)',
    applyChanges: "O'zgarishlarni saqlash",
    saveSuccess: 'Barcha o‘zgarishlar saqlandi va saytga qo‘llandi.',
    adminDraftHint:
      'Tahrirlar shu oynada. Saytda chiqishi uchun pastdagi «Saqlash» tugmasini bosing.',
    addToDraft: "Ro'yxatga qo'shish",
    addProduct: "Yangi mahsulot qo'shish",
    productName: 'Mahsulot nomi',
    productPrice: 'Mahsulot narxi',
    productImage: 'Rasm URL',
    add: "Qo'shish",
    editNews: 'Yangiliklar va aksiyalar',
    editAbout: 'Biz haqimizda matni',
    editContact: 'Kontakt ma’lumotlari',
    adminHint: 'Sayt bo‘limlarini shu yerdan boshqarasiz. Avval tilni tanlang, keyin matnni o‘zgartiring.',
    adminTabProducts: 'Mahsulotlar',
    adminTabAbout: 'Biz haqimizda',
    adminTabNews: 'Yangiliklar',
    adminTabContact: 'Kontakt',
    adminPickLang: 'Tahrir tili',
    addNewsLine: 'Yangi yangilik qo‘shish',
    removeNewsLine: 'O‘chirish',
    contactEmail: 'Email',
    contactPhone: 'Telefon',
    contactDescLabel: 'Qisqa matn (kontakt ustidagi izoh)',
    adminPriceHint: 'Har bir mahsulot uchun narxni kiriting (so‘m).',
    adminProductHint: 'Yangi mahsulot nomi, narxi va rasm havolasi (URL).',
    adminNewsHint:
      'Har bir qator alohida yangilik kartochkasi. Keraksizini o‘chiring yoki yangi qator qo‘shing.',
    adminContactHint: '«Kontakt» bo‘limi tanlangan tilda shu ma’lumotlarni ko‘rsatadi.',
    save: 'Saqlash',
    footer: 'hard.oil - Professional dvigatel himoyasi.',
    themeToLight: 'Yorug‘ mavzuga o‘tish (quyosh)',
    themeToDark: "Qorong‘u mavzuga o‘tish (oy)",
    menuOpen: 'Sayt menyusi',
    menuClose: 'Menyuni yopish',
    aboutHeroTitle: 'BIZNING MIJOZIMIZGA AYLANING',
    contactPhonesHint: 'Kontakt sahifasida chiqadigan telefonlar (1–6 ta).',
    contactHeaderPhoneHint:
      'Headerdagi telefon belgisiga hover qilganda chiqadigan raqam. Bo‘sh qoldirsangiz birinchi raqam ishlatiladi.',
    addPhoneLine: "Telefon qo'shish",
    removeProduct: 'O‘chirish',
    contactCardsTitle: 'Bog‘lanish kanallari',
    contactEmailAction: 'Email yuborish',
    contactCallAction: 'Qo‘ng‘iroq',
  },
  RU: {
    nav: ['Главная', 'Продукты', 'О нас', 'Новости', 'Контакты'],
    heroTitle: 'hard.oil - профессиональные моторные масла',
    heroText:
      'Премиальные смазочные решения для легковых, грузовых автомобилей и промышленной техники.',
    heroExtra:
      'Более 10 лет опыта, лабораторный контроль и стабильная поставка делают hard.oil надежным партнером.',
    productsTitle: 'Наши продукты',
    pick: 'Выбрать',
    selected: 'Выбрано',
    perUnit: 'за 1 шт',
    uzs: 'сум',
    orderTitle: 'Оформление заказа',
    customerName: 'Ваше имя',
    phone: 'Ваш номер телефона',
    note: 'Комментарий',
    sendOrder: 'Отправить заказ',
    orderEmpty: 'Выберите минимум один продукт.',
    orderSuccess: 'Заказ отправлен.',
    telegramSendFailed: 'Не удалось отправить в Telegram.',
    telegramTokenInvalid:
      'Unauthorized = неверный или отозванный токен бота. @BotFather → ваш бот → API Token. В корне проекта файл `.env`: VITE_TELEGRAM_BOT_TOKEN=... и перезапустите dev-сервер.',
    aboutTitle: 'О hard.oil',
    aboutText:
      'hard.oil - профессиональный бренд, созданный на базе высококачественных базовых масел и современных присадок. Продукты тестируются в сложных условиях температуры, длительных пробегах и высоких оборотах двигателя. Мы предоставляем поставки и техническое сопровождение для сервисов, автопарков и розничных клиентов.',
    newsTitle: 'Новости и акции',
    contactTitle: 'Контакты',
    contactDesc: 'Свяжитесь с нами для подробной информации:',
    adminOpen: 'A',
    adminLogin: 'Вход администратора',
    login: 'Логин',
    password: 'Пароль',
    enter: 'Войти',
    logout: 'Выйти',
    close: 'Закрыть',
    wrong: 'Неверный логин или пароль.',
    editPrices: 'Редактирование цен',
    editProductsFull: 'Товары (название, цена, фото)',
    applyChanges: 'Сохранить изменения',
    saveSuccess: 'Изменения сохранены и применены на сайте.',
    adminDraftHint: 'Правки в этом окне. Нажмите «Сохранить» внизу, чтобы применить.',
    addToDraft: 'Добавить в список',
    addProduct: 'Добавить новый товар',
    productName: 'Название товара',
    productPrice: 'Цена товара',
    productImage: 'URL изображения',
    add: 'Добавить',
    editNews: 'Новости и акции',
    editAbout: 'Текст «О нас»',
    editContact: 'Контакты',
    adminHint: 'Управляйте разделами сайта. Сначала выберите язык, затем отредактируйте текст.',
    adminTabProducts: 'Товары',
    adminTabAbout: 'О нас',
    adminTabNews: 'Новости',
    adminTabContact: 'Контакты',
    adminPickLang: 'Язык редактирования',
    addNewsLine: 'Добавить новость',
    removeNewsLine: 'Удалить',
    contactEmail: 'Email',
    contactPhone: 'Телефон',
    contactDescLabel: 'Краткий текст над контактами',
    adminPriceHint: 'Укажите цену для каждого товара (сум).',
    adminProductHint: 'Название, цена и ссылка на изображение (URL).',
    adminNewsHint:
      'Каждая строка — отдельная новость. Удалите лишнее или добавьте строку.',
    adminContactHint: 'Раздел «Контакты» покажет эти данные на выбранном языке.',
    save: 'Сохранить',
    footer: 'hard.oil - профессиональная защита двигателя.',
    themeToLight: 'Светлая тема (солнце)',
    themeToDark: 'Тёмная тема (луна)',
    menuOpen: 'Меню сайта',
    menuClose: 'Закрыть меню',
    aboutHeroTitle: 'СТАНЬТЕ НАШИМ КЛИЕНТОМ',
    contactPhonesHint: 'Телефоны на странице контактов (1–6 номеров).',
    contactHeaderPhoneHint:
      'Номер при наведении на иконку телефона в шапке. Если пусто — используется первый из списка.',
    addPhoneLine: 'Добавить телефон',
    removeProduct: 'Удалить',
    contactCardsTitle: 'Каналы связи',
    contactEmailAction: 'Написать email',
    contactCallAction: 'Позвонить',
  },
  EN: {
    nav: ['Home', 'Products', 'About', 'News', 'Contact'],
    heroTitle: 'hard.oil - professional motor oils',
    heroText:
      'Premium lubrication solutions for passenger cars, heavy vehicles, and industrial machines.',
    heroExtra:
      'With 10+ years of know-how, strict lab control, and stable supply, hard.oil is a trusted partner.',
    productsTitle: 'Featured Products',
    pick: 'Select',
    selected: 'Selected',
    perUnit: 'per unit',
    uzs: 'UZS',
    orderTitle: 'Place Order',
    customerName: 'Your name',
    phone: 'Your phone number',
    note: 'Comment',
    sendOrder: 'Send Order',
    orderEmpty: 'Choose at least one product.',
    orderSuccess: 'Order sent.',
    telegramSendFailed: 'Could not send via Telegram.',
    telegramTokenInvalid:
      'Unauthorized = invalid or revoked bot token. Get a new token from @BotFather, put it in project `.env` as VITE_TELEGRAM_BOT_TOKEN=... and restart the dev server.',
    aboutTitle: 'About hard.oil',
    aboutText:
      'hard.oil is a professional brand engineered with high-grade base oils and modern additive technology. Our products are tested for extreme temperature, long-distance operation, and high-RPM protection. We provide reliable delivery and technical support for service centers, corporate fleets, and retail customers.',
    newsTitle: 'News & Promotions',
    contactTitle: 'Contact',
    contactDesc: 'Reach us for full information:',
    adminOpen: 'A',
    adminLogin: 'Admin Login',
    login: 'Login',
    password: 'Password',
    enter: 'Sign in',
    logout: 'Sign out',
    close: 'Close',
    wrong: 'Invalid login or password.',
    editPrices: 'Edit prices',
    editProductsFull: 'Products (name, price, image)',
    applyChanges: 'Save changes',
    saveSuccess: 'All changes saved and applied to the site.',
    adminDraftHint: 'Edits stay in this panel. Press Save below to apply to the site.',
    addToDraft: 'Add to list',
    addProduct: 'Add new product',
    productName: 'Product name',
    productPrice: 'Product price',
    productImage: 'Image URL',
    add: 'Add',
    editNews: 'News & promotions',
    editAbout: 'About page text',
    editContact: 'Contact details',
    adminHint: 'Manage site sections here. Pick a language first, then edit the text.',
    adminTabProducts: 'Products',
    adminTabAbout: 'About',
    adminTabNews: 'News',
    adminTabContact: 'Contact',
    adminPickLang: 'Edit language',
    addNewsLine: 'Add news item',
    removeNewsLine: 'Remove',
    contactEmail: 'Email',
    contactPhone: 'Phone',
    contactDescLabel: 'Short intro above contacts',
    adminPriceHint: 'Set the price for each product (UZS).',
    adminProductHint: 'New product name, price, and image URL.',
    adminNewsHint: 'Each line is one news card. Remove or add lines as needed.',
    adminContactHint: 'The Contact section uses these values for the selected language.',
    save: 'Save',
    footer: 'hard.oil - Professional engine protection.',
    themeToLight: 'Switch to light theme (sun)',
    themeToDark: 'Switch to dark theme (moon)',
    menuOpen: 'Site menu',
    menuClose: 'Close menu',
    aboutHeroTitle: 'BECOME OUR CLIENT',
    contactPhonesHint: 'Phone numbers shown on the Contact page (1–6).',
    contactHeaderPhoneHint:
      'Number shown when hovering the phone icon in the header. If empty, the first list number is used.',
    addPhoneLine: 'Add phone',
    removeProduct: 'Remove',
    contactCardsTitle: 'Get in touch',
    contactEmailAction: 'Send email',
    contactCallAction: 'Call',
  },
  ZH: {
    nav: ['首页', '产品', '关于我们', '新闻', '联系我们'],
    heroTitle: 'hard.oil — 专业发动机润滑油',
    heroText: '为乘用车、重型设备与工业机械提供高品质润滑解决方案。',
    heroExtra: '十余年经验、实验室级品控与稳定供货，使 hard.oil 成为值得信赖的合作伙伴。',
    productsTitle: '精选产品',
    pick: '选择',
    selected: '已选',
    perUnit: '单价',
    uzs: 'UZS',
    orderTitle: '下单',
    customerName: '您的姓名',
    phone: '您的电话',
    note: '备注',
    sendOrder: '提交订单',
    orderEmpty: '请至少选择一件商品。',
    orderSuccess: '订单已发送。',
    telegramSendFailed: '无法通过 Telegram 发送。',
    telegramTokenInvalid:
      'Unauthorized = 机器人 token 无效或已撤销。请在 @BotFather 重新获取，在项目根目录 `.env` 写入 VITE_TELEGRAM_BOT_TOKEN=... 并重启开发服务器。',
    aboutTitle: '关于 hard.oil',
    aboutText:
      'hard.oil 基于高品质基础油与现代添加剂技术打造。产品在极端温度、长途行驶与高转速工况下均经测试验证。我们为服务中心、企业车队与零售客户提供可靠供货与技术支持。',
    newsTitle: '新闻与优惠',
    contactTitle: '联系我们',
    contactDesc: '需要更多信息，欢迎联系我们：',
    adminOpen: 'A',
    adminLogin: '管理员登录',
    login: '账号',
    password: '密码',
    enter: '登录',
    logout: '退出',
    close: '关闭',
    wrong: '账号或密码错误。',
    editPrices: '编辑价格',
    editProductsFull: '产品（名称、价格、图片）',
    applyChanges: '保存更改',
    saveSuccess: '所有更改已保存并应用到网站。',
    adminDraftHint: '编辑内容仅在此面板中。点击下方「保存」后才会在网站生效。',
    addToDraft: '加入列表',
    addProduct: '新增产品',
    productName: '产品名称',
    productPrice: '价格',
    productImage: '图片 URL',
    add: '添加',
    editNews: '新闻与促销',
    editAbout: '关于我们正文',
    editContact: '联系信息',
    adminHint: '在此管理网站各版块。先选择语言，再编辑文本。',
    adminTabProducts: '产品',
    adminTabAbout: '关于',
    adminTabNews: '新闻',
    adminTabContact: '联系',
    adminPickLang: '编辑语言',
    addNewsLine: '添加新闻',
    removeNewsLine: '删除',
    contactEmail: '电子邮箱',
    contactPhone: '电话',
    contactDescLabel: '联系区顶部简介',
    adminPriceHint: '为每件产品填写价格（UZS）。',
    adminProductHint: '填写新产品名称、价格与图片链接（URL）。',
    adminNewsHint: '每一行为一条新闻卡片。可删除或新增行。',
    adminContactHint: '「联系我们」版块将显示所选语言下的这些信息。',
    save: '保存',
    footer: 'hard.oil — 专业发动机保护。',
    themeToLight: '切换到浅色主题（太阳）',
    themeToDark: '切换到深色主题（月亮）',
    menuOpen: '网站菜单',
    menuClose: '关闭菜单',
    aboutHeroTitle: '成为我们的客户',
    contactPhonesHint: '联系页面显示的电话（1–6 个）。',
    contactHeaderPhoneHint: '鼠标悬停顶部电话图标时显示。若留空则使用列表第一个号码。',
    addPhoneLine: '添加电话',
    removeProduct: '删除',
    contactCardsTitle: '联系方式',
    contactEmailAction: '发送邮件',
    contactCallAction: '拨打电话',
  },
}

// You can replace this URL with your own hero video.
const HERO_VIDEO_URL = 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_25fps.mp4'
const HERO_POSTER_URL = '/images/oil/01.jpg'
const DEFAULT_MAP_QUERY =
  'Замена масло HARDT oil Moy almashtirish, Город, 000002, Termez, Surxondaryo Region, Uzbekistan'

const FOOTER_INFO = {
  desc: 'hard.oil - premium motor moylari va professional servis hamkorligi.',
  menu: ['Bosh sahifa', 'Mahsulotlar', 'Biz haqimizda', 'Yangiliklar', 'Kontakt'],
  services: ['Premium motor moylari', 'Wholesale hamkorlik', 'Servis markazlari'],
  email: 'hardoil.official@gmail.com',
  address: 'Uzbekistan, Termez',
}

function getDefaultProducts() {
  return Array.from({ length: 29 }, (_, i) => ({
    id: i + 1,
    name: `hard.oil Series ${i + 1} ${i % 2 === 0 ? '5W-30' : '10W-40'}`,
    price: 50000 + i * 7000,
    image: LOCAL_PRODUCT_IMAGES[i % LOCAL_PRODUCT_IMAGES.length],
  }))
}

function loadPersistedSite() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.products?.length) return null
    return data
  } catch {
    return null
  }
}

const initialNews = {
  UZ: [
    "Qish mavsumi uchun 5W-30 seriyasiga maxsus narxlar e'lon qilindi.",
    "Servis markazlari uchun ulgurji paketlarda qo'shimcha chegirma mavjud.",
    "Yangi partiyadagi mahsulotlar sertifikatlangan laboratoriya hisobotlari bilan taqdim etiladi.",
  ],
  RU: [
    'Для линейки 5W-30 действует специальная зимняя цена.',
    'Для сервисных центров доступны дополнительные скидки на опт.',
    'Новая партия поставляется с сертифицированными лабораторными отчетами.',
  ],
  EN: [
    'Special winter pricing is available for the 5W-30 line.',
    'Additional wholesale discounts are offered for service centers.',
    'The new stock is delivered with certified lab reports.',
  ],
  ZH: [
    '5W-30 系列现享冬季特惠价格。',
    '服务中心批发包装可提供额外折扣。',
    '新批次随附实验室认证报告一起交付。',
  ],
}

const initialAboutContent = {
  UZ: translations.UZ.aboutText,
  RU: translations.RU.aboutText,
  EN: translations.EN.aboutText,
  ZH: translations.ZH.aboutText,
}

const DEFAULT_PUBLIC_PHONE = '+998901234567'

const initialContactData = {
  UZ: {
    desc: translations.UZ.contactDesc,
    email: 'hardoil.official@gmail.com',
    phones: [DEFAULT_PUBLIC_PHONE],
    headerPhone: DEFAULT_PUBLIC_PHONE,
    mapQuery: DEFAULT_MAP_QUERY,
  },
  RU: {
    desc: translations.RU.contactDesc,
    email: 'hardoil.official@gmail.com',
    phones: [DEFAULT_PUBLIC_PHONE],
    headerPhone: DEFAULT_PUBLIC_PHONE,
    mapQuery: DEFAULT_MAP_QUERY,
  },
  EN: {
    desc: translations.EN.contactDesc,
    email: 'hardoil.official@gmail.com',
    phones: [DEFAULT_PUBLIC_PHONE],
    headerPhone: DEFAULT_PUBLIC_PHONE,
    mapQuery: DEFAULT_MAP_QUERY,
  },
  ZH: {
    desc: translations.ZH.contactDesc,
    email: 'hardoil.official@gmail.com',
    phones: [DEFAULT_PUBLIC_PHONE],
    headerPhone: DEFAULT_PUBLIC_PHONE,
    mapQuery: DEFAULT_MAP_QUERY,
  },
}

function normalizeContactEntry(entry, fallback) {
  let phones = []
  if (Array.isArray(entry?.phones)) {
    phones = entry.phones.map((p) => String(p).trim()).filter(Boolean)
  }
  if (!phones.length && entry?.phone) {
    phones = [String(entry.phone).trim()].filter(Boolean)
  }
  if (!phones.length) {
    phones = [...fallback.phones]
  }
  const trimmedHeader = String(entry?.headerPhone ?? '').trim()
  const headerPhone = trimmedHeader || phones[0] || fallback.headerPhone
  return {
    desc: entry?.desc ?? fallback.desc,
    email: entry?.email ?? fallback.email,
    phones: phones.slice(0, 6),
    headerPhone,
    mapQuery: String(entry?.mapQuery ?? fallback.mapQuery ?? DEFAULT_MAP_QUERY).trim() || DEFAULT_MAP_QUERY,
  }
}

function cleanContactEntryForSave(entry) {
  const phones = entry.phones.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
  const list = phones.length ? phones : [DEFAULT_PUBLIC_PHONE]
  const header = String(entry.headerPhone || '').trim()
  return {
    desc: entry.desc,
    email: entry.email,
    phones: list,
    headerPhone: header || list[0] || DEFAULT_PUBLIC_PHONE,
    mapQuery: String(entry.mapQuery || '').trim() || DEFAULT_MAP_QUERY,
  }
}

function normalizeContactData(raw) {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(initialContactData))
  }
  const out = {}
  for (const lang of LANGUAGES) {
    out[lang] = normalizeContactEntry(raw[lang], initialContactData[lang])
  }
  return out
}

function normalizeNewsData(raw) {
  const base = JSON.parse(JSON.stringify(initialNews))
  if (!raw || typeof raw !== 'object') return base
  for (const lang of LANGUAGES) {
    if (Array.isArray(raw[lang]) && raw[lang].length) {
      base[lang] = raw[lang].map((x) => String(x))
    }
  }
  return base
}

function normalizeAboutContent(raw) {
  const base = { ...initialAboutContent }
  if (!raw || typeof raw !== 'object') return base
  for (const lang of LANGUAGES) {
    if (raw[lang] != null && String(raw[lang]).trim()) {
      base[lang] = String(raw[lang])
    }
  }
  return base
}

function loadAdminCredentials() {
  const fallback = { username: 'admin', password: 'hardoil2026' }
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const username = String(parsed?.username ?? '').trim()
    const password = String(parsed?.password ?? '')
    if (!username || !password) return fallback
    return { username, password }
  } catch {
    return fallback
  }
}

function persistAdminCredentials(next) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

function isHeicLikeFile(file) {
  const type = String(file?.type || '').toLowerCase()
  const name = String(file?.name || '').toLowerCase()
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')
}

async function normalizeImageFile(file) {
  if (!file || !isHeicLikeFile(file)) return file
  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  })
  const blob = Array.isArray(converted) ? converted[0] : converted
  if (!(blob instanceof Blob)) return file
  const baseName = String(file.name || 'upload').replace(/\.[^/.]+$/, '')
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
}

async function resizeImageFile(file, options = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82, mimeType = 'image/webp' } = options
  const normalizedFile = await normalizeImageFile(file)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height)
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context unavailable'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL(mimeType, quality))
      }
      img.onerror = () => reject(new Error('Image decode failed'))
      img.src = String(reader.result || '')
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(normalizedFile)
  })
}

async function readFileAsDataUrl(file) {
  const normalizedFile = await normalizeImageFile(file)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(normalizedFile)
  })
}

const SITE_BOOTSTRAP = loadPersistedSite()

const langLabel = (code) => {
  if (code === 'UZ') return 'UZ'
  if (code === 'ZH') return '中文'
  return code
}

const langLongLabel = (code) => {
  if (code === 'UZ') return "O'zbek"
  if (code === 'RU') return 'Русский'
  if (code === 'EN') return 'English'
  if (code === 'ZH') return '中文'
  return code
}

function App() {
  const [language, setLanguage] = useState('UZ')
  const [isLightMode, setIsLightMode] = useState(false)
  const [homeHeroKey, setHomeHeroKey] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [products, setProducts] = useState(
    () => SITE_BOOTSTRAP?.products ?? getDefaultProducts(),
  )
  const [news, setNews] = useState(() => normalizeNewsData(SITE_BOOTSTRAP?.news))
  const [aboutContent, setAboutContent] = useState(() =>
    normalizeAboutContent(SITE_BOOTSTRAP?.aboutContent),
  )
  const [contactData, setContactData] = useState(() =>
    normalizeContactData(SITE_BOOTSTRAP?.contactData),
  )
  const [cart, setCart] = useState({})

  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langDropdownRef = useRef(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isHeaderSolid, setIsHeaderSolid] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState(() => loadAdminCredentials())
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [credentialNotice, setCredentialNotice] = useState('')
  const [credentialForm, setCredentialForm] = useState({
    currentPassword: '',
    nextUsername: '',
    nextPassword: '',
    confirmPassword: '',
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [isNewImageProcessing, setIsNewImageProcessing] = useState(false)
  const [showCredentialPasswords, setShowCredentialPasswords] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
  })

  const [adminTab, setAdminTab] = useState('products')
  const [adminEditLang, setAdminEditLang] = useState('UZ')
  const [adminDraft, setAdminDraft] = useState(null)
  const [saveNotice, setSaveNotice] = useState('')

  const [orderForm, setOrderForm] = useState({ name: '', phone: '', note: '' })
  const t = useMemo(
    () => ({
      ...translations[language],
      aboutText: aboutContent[language],
      contactDesc: contactData[language].desc,
    }),
    [language, aboutContent, contactData],
  )

  useEffect(() => {
    if (!langMenuOpen) return
    const onDocClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [langMenuOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const onScroll = () => {
      setIsHeaderSolid(window.scrollY > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goToSection = (sectionId) => {
    if (sectionId === 'home' && activeSection !== 'home') {
      setHomeHeroKey((prev) => prev + 1)
    }
    setActiveSection(sectionId)
    setMobileNavOpen(false)
  }

  const selectedItems = products.filter((p) => cart[p.id])
  const totalPrice = selectedItems.reduce((acc, p) => acc + p.price * cart[p.id], 0)

  const createAdminDraftSnapshot = () => ({
    products: JSON.parse(JSON.stringify(products)),
    news: JSON.parse(JSON.stringify(news)),
    aboutContent: JSON.parse(JSON.stringify(aboutContent)),
    contactData: JSON.parse(JSON.stringify(contactData)),
  })

  const formatPrice = (price) => {
    const locale = language === 'EN' ? 'en-US' : language === 'ZH' ? 'zh-CN' : 'uz-UZ'
    return new Intl.NumberFormat(locale).format(price)
  }

  const headerPhoneDisplay = (contactData[language].headerPhone || '').trim()
  const headerPhoneFallback = (contactData[language].phones?.[0] || '').trim()
  const headerPhoneTooltip = headerPhoneDisplay || headerPhoneFallback
  const headerPhoneHref = headerPhoneTooltip.replace(/[^\d+]/g, '')
  const mapQuery = String(contactData[language].mapQuery || DEFAULT_MAP_QUERY).trim()
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`

  const toggleSelection = (id) => {
    setCart((prev) => {
      const qty = prev[id] || 0
      return { ...prev, [id]: qty === 0 ? 1 : 0 }
    })
  }

  const updateQuantity = (id, nextQty) => {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, nextQty) }))
  }

  const handleLogin = (event) => {
    event.preventDefault()
    if (
      loginData.username === adminCredentials.username &&
      loginData.password === adminCredentials.password
    ) {
      setIsAdmin(true)
      setAdminDraft(createAdminDraftSnapshot())
      setLoginError('')
      return
    }
    setLoginError(t.wrong)
  }

  const openCredentialModal = () => {
    setCredentialNotice('')
    setShowCredentialPasswords(false)
    setCredentialForm({
      currentPassword: '',
      nextUsername: adminCredentials.username,
      nextPassword: '',
      confirmPassword: '',
    })
    setShowCredentialModal(true)
  }

  const saveCredentialChanges = (event) => {
    event.preventDefault()
    const nextUsername = credentialForm.nextUsername.trim()
    const nextPassword = credentialForm.nextPassword
    if (nextUsername.length < 3) {
      setCredentialNotice('Yangi login kamida 3 ta belgidan iborat bo‘lsin.')
      return
    }
    if (nextPassword.length < 8 || !/[A-Za-z]/.test(nextPassword) || !/\d/.test(nextPassword)) {
      setCredentialNotice('Yangi parol kamida 8 ta, harf va raqam bo‘lsin.')
      return
    }
    if (nextPassword !== credentialForm.confirmPassword) {
      setCredentialNotice('Parol tasdiqlashi mos emas.')
      return
    }
    if (credentialForm.currentPassword !== adminCredentials.password) {
      setCredentialNotice('Joriy parol noto‘g‘ri.')
      return
    }
    const next = { username: nextUsername, password: nextPassword }
    setAdminCredentials(next)
    persistAdminCredentials(next)
    setShowCredentialModal(false)
    setCredentialNotice('Login/parol yangilandi.')
  }

  const applyAdminDraftToSite = () => {
    if (!adminDraft) return
    const nextContact = {}
    for (const lang of LANGUAGES) {
      nextContact[lang] = cleanContactEntryForSave(adminDraft.contactData[lang])
    }
    setProducts(adminDraft.products)
    setNews(adminDraft.news)
    setAboutContent(adminDraft.aboutContent)
    setContactData(nextContact)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products: adminDraft.products,
          news: adminDraft.news,
          aboutContent: adminDraft.aboutContent,
          contactData: nextContact,
        }),
      )
    } catch {
      /* ignore quota */
    }
    setSaveNotice(`✓ ${translations[language].saveSuccess}`)
    window.setTimeout(() => setSaveNotice(''), 3500)
  }

  const handleAdminLogout = () => {
    setIsAdmin(false)
    setShowAdmin(false)
    setShowLoginPassword(false)
    setLoginData({ username: '', password: '' })
  }

  const updateDraftProduct = (id, field, rawValue) => {
    setAdminDraft((d) => {
      if (!d) return d
      const value =
        field === 'price'
          ? (Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0)
          : rawValue
      return {
        ...d,
        products: d.products.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      }
    })
  }

  const uploadImageToDraftProduct = async (id, file) => {
    if (!file) return
    try {
      const dataUrl = await resizeImageFile(file)
      updateDraftProduct(id, 'image', dataUrl)
      setStatusMessage('Rasm tanlandi va optimizatsiya qilindi.')
    } catch {
      try {
        const fallbackDataUrl = await readFileAsDataUrl(file)
        updateDraftProduct(id, 'image', fallbackDataUrl)
        setStatusMessage('Rasm original holatda qo‘shildi.')
      } catch {
        setStatusMessage('Rasmni qayta ishlashda xatolik yuz berdi.')
      }
    }
  }

  const addProductToDraft = (event) => {
    event.preventDefault()
    if (!adminDraft) return
    if (isNewImageProcessing) return
    const img = newProduct.image.trim() || PRODUCT_FALLBACK_IMAGE
    if (!newProduct.name.trim() || newProduct.price === '') return
    const nextId =
      adminDraft.products.length > 0
        ? Math.max(...adminDraft.products.map((p) => p.id)) + 1
        : 1
    setAdminDraft({
      ...adminDraft,
      products: [
        ...adminDraft.products,
        {
          id: nextId,
          name: newProduct.name.trim(),
          price: Number(newProduct.price) || 0,
          image: img,
        },
      ],
    })
    setNewProduct({ name: '', price: '', image: '' })
  }

  const handleNewProductImageFile = async (file) => {
    if (!file) return
    setIsNewImageProcessing(true)
    try {
      const dataUrl = await resizeImageFile(file)
      setNewProduct((prev) => ({ ...prev, image: dataUrl }))
      setStatusMessage('Yangi mahsulot rasmi tanlandi.')
    } catch {
      try {
        const fallbackDataUrl = await readFileAsDataUrl(file)
        setNewProduct((prev) => ({ ...prev, image: fallbackDataUrl }))
        setStatusMessage('Rasm original holatda qo‘shildi.')
      } catch {
        setStatusMessage('Rasmni yuklashda xatolik yuz berdi.')
      }
    } finally {
      setIsNewImageProcessing(false)
    }
  }

  const removeDraftProduct = (id) => {
    setAdminDraft((d) => {
      if (!d) return d
      return { ...d, products: d.products.filter((p) => p.id !== id) }
    })
  }

  const updateDraftContactPhones = (lang, index, value) => {
    setAdminDraft((d) => {
      if (!d) return d
      const row = d.contactData[lang]
      const next = [...row.phones]
      next[index] = value
      return {
        ...d,
        contactData: {
          ...d.contactData,
          [lang]: { ...row, phones: next },
        },
      }
    })
  }

  const addDraftContactPhone = (lang) => {
    setAdminDraft((d) => {
      if (!d) return d
      const row = d.contactData[lang]
      if (row.phones.length >= 6) return d
      return {
        ...d,
        contactData: {
          ...d.contactData,
          [lang]: { ...row, phones: [...row.phones, ''] },
        },
      }
    })
  }

  const removeDraftContactPhone = (lang, index) => {
    setAdminDraft((d) => {
      if (!d) return d
      const row = d.contactData[lang]
      const next = row.phones.filter((_, i) => i !== index)
      const phones = next.length ? next : ['']
      return {
        ...d,
        contactData: {
          ...d.contactData,
          [lang]: { ...row, phones },
        },
      }
    })
  }

  const updateDraftNewsLine = (lang, index, value) => {
    setAdminDraft((d) => {
      if (!d) return d
      return {
        ...d,
        news: {
          ...d.news,
          [lang]: d.news[lang].map((item, i) => (i === index ? value : item)),
        },
      }
    })
  }

  const addDraftNewsLine = (lang) => {
    setAdminDraft((d) => {
      if (!d) return d
      return {
        ...d,
        news: { ...d.news, [lang]: [...d.news[lang], ''] },
      }
    })
  }

  const removeDraftNewsLine = (lang, index) => {
    setAdminDraft((d) => {
      if (!d) return d
      return {
        ...d,
        news: {
          ...d.news,
          [lang]: d.news[lang].filter((_, i) => i !== index),
        },
      }
    })
  }

  const sendToTelegram = async (message) => {
    if (ORDER_API_URL.trim()) {
      const response = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) {
        throw new Error(data.description || data.error || `HTTP ${response.status}`)
      }
      return
    }

    if (BOT_TOKEN && CHAT_ID) {
      const chatId =
        /^-?\d+$/.test(CHAT_ID) ? Number(CHAT_ID) : CHAT_ID
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) {
        throw new Error(data.description || `HTTP ${response.status}`)
      }
      return
    }

    const fallback = `${TELEGRAM_GROUP_LINK}?text=${encodeURIComponent(message)}`
    window.open(fallback, '_blank', 'noopener,noreferrer')
  }

  const handleOrderSubmit = async (event) => {
    event.preventDefault()
    if (selectedItems.length === 0) {
      setStatusMessage(t.orderEmpty)
      return
    }

    const lines = selectedItems.map(
      (item) => `- ${item.name} x${cart[item.id]} = ${item.price * cart[item.id]}`,
    )
    const message = [
      'Yangi buyurtma',
      `Mijoz: ${orderForm.name}`,
      `Telefon: ${orderForm.phone}`,
      `Izoh: ${orderForm.note || '-'}`,
      ...lines,
      `Jami: ${totalPrice}`,
    ].join('\n')

    try {
      await sendToTelegram(message)
      setStatusMessage(t.orderSuccess)
      setOrderForm({ name: '', phone: '', note: '' })
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      if (/unauthorized/i.test(detail)) {
        setStatusMessage(t.telegramTokenInvalid)
      } else {
        setStatusMessage(`${t.telegramSendFailed}${detail ? ` (${detail})` : ''}`)
      }
    }
  }

  const renderProductsAndOrder = () => (
    <>
      <section className="section">
        <h2>{t.productsTitle}</h2>
        <div className="products">
          {products.map((product) => {
            const isSelected = Boolean(cart[product.id])
            return (
              <article className="card" key={product.id}>
                <img src={product.image || PRODUCT_FALLBACK_IMAGE} alt={product.name} />
                <h3>{product.name}</h3>
                <p>
                  {formatPrice(product.price)} {t.uzs}
                </p>
                <small>{t.perUnit}</small>
                <button
                  className={isSelected ? 'active' : ''}
                  onClick={() => toggleSelection(product.id)}
                >
                  {isSelected ? t.selected : t.pick}
                </button>
                {isSelected && (
                  <div className="qty">
                    <button onClick={() => updateQuantity(product.id, cart[product.id] - 1)}>
                      -
                    </button>
                    <span>{cart[product.id]}</span>
                    <button onClick={() => updateQuantity(product.id, cart[product.id] + 1)}>
                      +
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="section order">
        <h2>{t.orderTitle}</h2>
        <div className="order-layout">
          <div className="selected-list">
            {selectedItems.map((item) => (
              <div key={item.id}>
                {item.name} x{cart[item.id]} - {formatPrice(item.price * cart[item.id])} {t.uzs}
              </div>
            ))}
            <strong>
              Jami: {formatPrice(totalPrice)} {t.uzs}
            </strong>
          </div>
          <form onSubmit={handleOrderSubmit} className="order-form">
            <input
              required
              placeholder={t.customerName}
              value={orderForm.name}
              onChange={(e) => setOrderForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              required
              placeholder={t.phone}
              value={orderForm.phone}
              onChange={(e) => setOrderForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <textarea
              rows={3}
              placeholder={t.note}
              value={orderForm.note}
              onChange={(e) => setOrderForm((prev) => ({ ...prev, note: e.target.value }))}
            />
            <button type="submit">{t.sendOrder}</button>
            <p className="status">{statusMessage}</p>
          </form>
        </div>
      </section>
    </>
  )

  return (
    <div className={`app ${isLightMode ? 'light-mode' : ''}`}>
      <header className={`header ${isHeaderSolid ? 'scrolled' : ''}`}>
        <button className="logo-wrap" type="button" onClick={() => goToSection('home')}>
          <img className="header-brand-logo" src={logoImage} alt="Hard Line logo" />
        </button>

        <nav className="nav-menu nav-menu-desktop" aria-label="Main navigation">
          {SECTION_IDS.map((sectionId, index) => (
            <button
              key={sectionId}
              type="button"
              className={activeSection === sectionId ? 'active' : ''}
              onClick={() => goToSection(sectionId)}
            >
              {t.nav[index]}
            </button>
          ))}
        </nav>

        <div className="header-toolbar">
          <div className="social-links social-links-desktop" aria-label="Social links">
            <a href="https://instagram.com/_odiljon7" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm9 1.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
              </svg>
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
              <svg viewBox="0 0 24 24">
                <path d="M21.5 4.5 3.9 11.3c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.8 5.8c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.9.5 1.5.2 1.7-.8l3-14.1c.3-1.2-.4-1.7-1.5-1.2Zm-12.6 9.3 9-5.7c.4-.2.7-.1.4.2l-7.2 6.5-.3 3.3-1.9-4.3Z" />
              </svg>
            </a>
            <a href={`mailto:${contactData[language].email}`} aria-label="Gmail">
              <svg viewBox="0 0 24 24">
                <path d="M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5Zm.4 2.1v9.8h16.2V7.1L12 13 3.9 7.1Zm14.4-.2H5.7L12 11.6l6.3-4.7Z" />
              </svg>
            </a>
            {headerPhoneTooltip ? (
              <div className="header-phone-wrap">
                <a
                  href={`tel:${headerPhoneHref}`}
                  className="header-phone-trigger"
                  aria-label={t.contactCallAction}
                  title={headerPhoneTooltip}
                >
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M6.6 2.8c-.5 0-.9.2-1.2.5L3.7 5c-.8.8-.7 2.1.1 3.9 1 2.2 2.6 4.5 4.8 6.6 2.1 2.1 4.4 3.7 6.6 4.8 1 .5 1.8.7 2.5.7.7 0 1.2-.2 1.5-.6l2.1-2.1c.3-.3.5-.7.5-1.2s-.2-.9-.5-1.2l-3-2.1c-.5-.4-1.2-.4-1.7 0l-1.3 1c-.4.3-.9.2-1.2-.1-1-1.1-1.9-2.2-2.7-3.3-.2-.4-.2-.9.1-1.2l1-1.3c.4-.5.4-1.2 0-1.7l-2.1-3c-.3-.4-.7-.6-1.2-.6Z" />
                  </svg>
                </a>
                <span className="header-phone-tooltip">{headerPhoneTooltip}</span>
              </div>
            ) : null}
          </div>

          <div ref={langDropdownRef} className={`lang-dropdown ${langMenuOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="lang-trigger"
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
              onClick={(e) => {
                e.stopPropagation()
                setLangMenuOpen((open) => !open)
              }}
            >
              <span className="lang-trigger-globe" aria-hidden>
                🌐
              </span>
              <span className="lang-trigger-text">{langLabel(language)}</span>
              <span className="lang-chevron" aria-hidden>
                ▾
              </span>
            </button>
            <div className="lang-list" role="listbox">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  role="option"
                  className={lang === language ? 'active' : ''}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLanguage(lang)
                    setLangMenuOpen(false)
                  }}
                >
                  <span>{langLabel(lang)}</span>
                  <span>{langLongLabel(lang)}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsLightMode((prev) => !prev)}
            aria-label={isLightMode ? t.themeToDark : t.themeToLight}
            title={isLightMode ? t.themeToDark : t.themeToLight}
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>

          <button
            type="button"
            className={`nav-burger ${mobileNavOpen ? 'open' : ''}`}
            aria-label={t.menuOpen}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="mobile-nav-root" role="dialog" aria-modal="true" aria-label={t.menuOpen}>
          <button
            type="button"
            className="mobile-nav-scrim"
            aria-label={t.menuClose}
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="mobile-nav-panel">
            <div className="mobile-nav-top">
              <span className="mobile-nav-title">hard.oil</span>
              <button type="button" className="mobile-nav-close" aria-label={t.menuClose} onClick={() => setMobileNavOpen(false)}>
                ×
              </button>
            </div>
            <nav className="mobile-nav-links" aria-label="Mobile navigation">
              {SECTION_IDS.map((sectionId, index) => (
                <button
                  key={sectionId}
                  type="button"
                  className={activeSection === sectionId ? 'active' : ''}
                  onClick={() => goToSection(sectionId)}
                >
                  {t.nav[index]}
                </button>
              ))}
            </nav>
            <div className="social-links mobile-nav-social">
              <a href="https://instagram.com/_odiljon7" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm9 1.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
                </svg>
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
                <svg viewBox="0 0 24 24">
                  <path d="M21.5 4.5 3.9 11.3c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.8 5.8c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.9.5 1.5.2 1.7-.8l3-14.1c.3-1.2-.4-1.7-1.5-1.2Zm-12.6 9.3 9-5.7c.4-.2.7-.1.4.2l-7.2 6.5-.3 3.3-1.9-4.3Z" />
                </svg>
              </a>
              <a href={`mailto:${contactData[language].email}`} aria-label="Gmail">
                <svg viewBox="0 0 24 24">
                  <path d="M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5Zm.4 2.1v9.8h16.2V7.1L12 13 3.9 7.1Zm14.4-.2H5.7L12 11.6l6.3-4.7Z" />
                </svg>
              </a>
              {headerPhoneTooltip ? (
                <a
                  href={`tel:${headerPhoneHref}`}
                  aria-label={t.contactCallAction}
                  className="mobile-nav-phone-link"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 2.8c-.5 0-.9.2-1.2.5L3.7 5c-.8.8-.7 2.1.1 3.9 1 2.2 2.6 4.5 4.8 6.6 2.1 2.1 4.4 3.7 6.6 4.8 1 .5 1.8.7 2.5.7.7 0 1.2-.2 1.5-.6l2.1-2.1c.3-.3.5-.7.5-1.2s-.2-.9-.5-1.2l-3-2.1c-.5-.4-1.2-.4-1.7 0l-1.3 1c-.4.3-.9.2-1.2-.1-1-1.1-1.9-2.2-2.7-3.3-.2-.4-.2-.9.1-1.2l1-1.3c.4-.5.4-1.2 0-1.7l-2.1-3c-.3-.4-.7-.6-1.2-.6Z" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'home' && (
        <>
          <section className="hero hero-video" key={homeHeroKey}>
            <video
              className="hero-video-bg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_POSTER_URL}
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
            <div className="hero-video-overlay" />
            <div className="hero-text hero-text-animated">
              <h1>{t.heroTitle}</h1>
              <p>{t.heroText}</p>
              <p>{t.heroExtra}</p>
            </div>
          </section>
          {renderProductsAndOrder()}
        </>
      )}

      {activeSection === 'products' && renderProductsAndOrder()}

      {activeSection === 'about' && (
        <>
          <section
            className="about-hero"
            style={{ backgroundImage: `url(${ABOUT_PARTNER_BG})` }}
          >
            <div className="about-hero-overlay" />
            <div className="about-hero-inner">
              <p className="about-hero-title">{t.aboutHeroTitle}</p>
            </div>
          </section>
          <section className="section about about-body">
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutText}</p>
          </section>
        </>
      )}

      {activeSection === 'news' && (
        <section className="section news">
          <h2>{t.newsTitle}</h2>
          <div className="news-grid">
            {news[language].map((item, index) => (
              <article
                className={`news-card news-card-tone-${index % 4}`}
                key={`news-${language}-${index + 1}`}
              >
                <span className="news-card-mark" aria-hidden />
                <p className="news-card-text">{item}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'contact' && (
        <section className="section contact contact-page">
          <div className="contact-shell">
            <div className="contact-intro-block">
              <h2>{t.contactTitle}</h2>
              <p>{t.contactDesc}</p>
            </div>
            <div className="contact-map-wrap">
              <iframe
                src={mapsEmbed}
                title="HARDT oil map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a className="contact-map-address" href={mapsLink} target="_blank" rel="noreferrer">
                📍 {mapQuery}
              </a>
            </div>
            <div className="contact-cards-grid">
              <a
                className="contact-card"
                href={`mailto:${contactData[language].email}`}
              >
                <span className="contact-card-icon contact-card-icon-mail" aria-hidden>
                  <svg viewBox="0 0 24 24">
                    <path d="M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5Zm.4 2.1v9.8h16.2V7.1L12 13 3.9 7.1Zm14.4-.2H5.7L12 11.6l6.3-4.7Z" />
                  </svg>
                </span>
                <span className="contact-card-eyebrow">{t.contactEmailAction}</span>
                <span className="contact-card-value">{contactData[language].email}</span>
              </a>
              {contactData[language].phones
                .filter((p) => String(p).trim())
                .map((phone, phoneIdx) => (
                  <a
                    key={`phone-${language}-${phoneIdx}-${phone}`}
                    className="contact-card"
                    href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  >
                    <span className="contact-card-icon contact-card-icon-phone" aria-hidden>
                      <svg viewBox="0 0 24 24">
                        <path d="M6.6 2.8c-.5 0-.9.2-1.2.5L3.7 5c-.8.8-.7 2.1.1 3.9 1 2.2 2.6 4.5 4.8 6.6 2.1 2.1 4.4 3.7 6.6 4.8 1 .5 1.8.7 2.5.7.7 0 1.2-.2 1.5-.6l2.1-2.1c.3-.3.5-.7.5-1.2s-.2-.9-.5-1.2l-3-2.1c-.5-.4-1.2-.4-1.7 0l-1.3 1c-.4.3-.9.2-1.2-.1-1-1.1-1.9-2.2-2.7-3.3-.2-.4-.2-.9.1-1.2l1-1.3c.4-.5.4-1.2 0-1.7l-2.1-3c-.3-.4-.7-.6-1.2-.6Z" />
                      </svg>
                    </span>
                    <span className="contact-card-eyebrow">{t.contactCallAction}</span>
                    <span className="contact-card-value">{phone}</span>
                  </a>
                ))}
            </div>
          </div>
        </section>
      )}

      <button
        className="admin-fab"
        onClick={() => {
          setShowAdmin(true)
          if (isAdmin) setAdminDraft(createAdminDraftSnapshot())
          setAdminEditLang(language)
        }}
      >
        {t.adminOpen}
      </button>

      {showAdmin && (
        <div className="admin-overlay">
          <div className="admin-box">
            {!isAdmin ? (
              <form onSubmit={handleLogin} className="admin-login">
                <h3>{t.adminLogin}</h3>
                <input
                  placeholder={t.login}
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
                <div className="password-input-wrap">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder={t.password}
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={showLoginPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                    title={showLoginPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                  >
                    {showLoginPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <button type="submit">{t.enter}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdmin(false)
                    setShowLoginPassword(false)
                    setLoginData({ username: '', password: '' })
                  }}
                >
                  {t.close}
                </button>
                {loginError && <p className="error">{loginError}</p>}
              </form>
            ) : (
              <div className="admin-panel">
                <div className="admin-top">
                  <h3>{t.adminLogin}</h3>
                  <div className="admin-top-actions">
                    <button
                      type="button"
                      className="admin-lock-btn"
                      title="Login/parolni almashtirish"
                      aria-label="Login/parolni almashtirish"
                      onClick={openCredentialModal}
                    >
                      🔒
                    </button>
                    <button type="button" onClick={handleAdminLogout}>
                      {t.logout}
                    </button>
                  </div>
                </div>
                <p className="admin-hint">{t.adminHint}</p>
                <p className="admin-draft-hint">{t.adminDraftHint}</p>
                {saveNotice && (
                  <p className="admin-save-notice" role="status" aria-live="polite">
                    <span className="admin-save-check" aria-hidden>
                      ✔
                    </span>
                    <span>{saveNotice}</span>
                  </p>
                )}

                <div className="admin-tabs" role="tablist">
                  {[
                    ['products', t.adminTabProducts],
                    ['about', t.adminTabAbout],
                    ['news', t.adminTabNews],
                    ['contact', t.adminTabContact],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      className={adminTab === id ? 'active' : ''}
                      onClick={() => setAdminTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {adminTab === 'products' && adminDraft && (
                  <div className="admin-tab-body admin-grid-two">
                    <div className="admin-card-block">
                      <h4>{t.editProductsFull}</h4>
                      <p className="admin-section-desc">{t.adminPriceHint}</p>
                      <div className="admin-list admin-product-rows">
                        {adminDraft.products.map((item, rowIndex) => (
                          <div className="admin-product-row" key={item.id}>
                            <div className="admin-product-index-wrap">
                              <span className="admin-product-index" title={`#${rowIndex + 1}`}>
                                {rowIndex + 1}
                              </span>
                            </div>
                            <div className="admin-product-fields">
                              <label>
                                {t.productName}
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    updateDraftProduct(item.id, 'name', e.target.value)
                                  }
                                />
                              </label>
                              <label>
                                {t.productPrice}
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateDraftProduct(item.id, 'price', e.target.value)
                                  }
                                />
                              </label>
                              <label>
                                {t.productImage}
                                <input
                                  type="text"
                                  value={item.image}
                                  placeholder="/images/oil/01.jpg"
                                  onChange={(e) =>
                                    updateDraftProduct(item.id, 'image', e.target.value)
                                  }
                                />
                              </label>
                              <div className="admin-image-preview-wrap">
                                <span className="admin-image-preview-label">Tanlangan rasm</span>
                                <img
                                  className="admin-image-preview"
                                  src={item.image || PRODUCT_FALLBACK_IMAGE}
                                  alt={item.name}
                                  loading="lazy"
                                />
                              </div>
                              <label>
                                Rasm fayli
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    uploadImageToDraftProduct(item.id, e.target.files?.[0])
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                className="btn-remove-product"
                                onClick={() => removeDraftProduct(item.id)}
                              >
                                {t.removeProduct}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="admin-card-block">
                      <h4>{t.addProduct}</h4>
                      <p className="admin-section-desc">{t.adminProductHint}</p>
                      <form className="admin-add-form" onSubmit={addProductToDraft}>
                        <input
                          placeholder={t.productName}
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                        <input
                          type="number"
                          placeholder={t.productPrice}
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                          }
                        />
                        <input
                          placeholder={t.productImage}
                          value={newProduct.image}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, image: e.target.value }))
                          }
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleNewProductImageFile(e.target.files?.[0])}
                        />
                        {newProduct.image ? (
                          <div className="admin-image-preview-wrap">
                            <span className="admin-image-preview-label">Yangi mahsulot rasmi</span>
                            <img
                              className="admin-image-preview"
                              src={newProduct.image || PRODUCT_FALLBACK_IMAGE}
                              alt="Yangi mahsulot preview"
                              loading="lazy"
                            />
                          </div>
                        ) : null}
                        <button type="submit" disabled={isNewImageProcessing}>
                          {isNewImageProcessing ? 'Rasm tayyorlanmoqda...' : t.addToDraft}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {adminTab === 'products' && !adminDraft && (
                  <p className="admin-loading">…</p>
                )}

                {adminTab === 'about' && adminDraft && (
                  <div className="admin-tab-body">
                    <div className="admin-lang-row">
                      <span className="admin-lang-label">{t.adminPickLang}:</span>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={adminEditLang === lang ? 'active' : ''}
                          onClick={() => setAdminEditLang(lang)}
                        >
                          {langLabel(lang)}
                        </button>
                      ))}
                    </div>
                    <label className="admin-field-label">{t.editAbout}</label>
                    <textarea
                      className="admin-textarea-large"
                      rows={10}
                      value={adminDraft.aboutContent[adminEditLang]}
                      onChange={(e) =>
                        setAdminDraft((d) =>
                          d
                            ? {
                                ...d,
                                aboutContent: {
                                  ...d.aboutContent,
                                  [adminEditLang]: e.target.value,
                                },
                              }
                            : d,
                        )
                      }
                    />
                  </div>
                )}

                {adminTab === 'news' && adminDraft && (
                  <div className="admin-tab-body">
                    <div className="admin-lang-row">
                      <span className="admin-lang-label">{t.adminPickLang}:</span>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={adminEditLang === lang ? 'active' : ''}
                          onClick={() => setAdminEditLang(lang)}
                        >
                          {langLabel(lang)}
                        </button>
                      ))}
                    </div>
                    <h4 className="admin-subtitle">{t.editNews}</h4>
                    <p className="admin-section-desc">{t.adminNewsHint}</p>
                    <div className="admin-news-list">
                      {adminDraft.news[adminEditLang].map((item, index) => (
                        <div className="admin-news-row" key={`${adminEditLang}-${index}`}>
                          <textarea
                            rows={3}
                            value={item}
                            onChange={(e) =>
                              updateDraftNewsLine(adminEditLang, index, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="btn-remove-line"
                            onClick={() => removeDraftNewsLine(adminEditLang, index)}
                          >
                            {t.removeNewsLine}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn-add-line"
                      onClick={() => addDraftNewsLine(adminEditLang)}
                    >
                      + {t.addNewsLine}
                    </button>
                  </div>
                )}

                {adminTab === 'contact' && adminDraft && (
                  <div className="admin-tab-body">
                    <div className="admin-lang-row">
                      <span className="admin-lang-label">{t.adminPickLang}:</span>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={adminEditLang === lang ? 'active' : ''}
                          onClick={() => setAdminEditLang(lang)}
                        >
                          {langLabel(lang)}
                        </button>
                      ))}
                    </div>
                    <p className="admin-section-desc">{t.adminContactHint}</p>
                    <label className="admin-field-label">{t.contactDescLabel}</label>
                    <textarea
                      rows={3}
                      value={adminDraft.contactData[adminEditLang].desc}
                      onChange={(e) =>
                        setAdminDraft((d) =>
                          d
                            ? {
                                ...d,
                                contactData: {
                                  ...d.contactData,
                                  [adminEditLang]: {
                                    ...d.contactData[adminEditLang],
                                    desc: e.target.value,
                                  },
                                },
                              }
                            : d,
                        )
                      }
                    />
                    <label className="admin-field-label">{t.contactEmail}</label>
                    <input
                      type="email"
                      value={adminDraft.contactData[adminEditLang].email}
                      onChange={(e) =>
                        setAdminDraft((d) =>
                          d
                            ? {
                                ...d,
                                contactData: {
                                  ...d.contactData,
                                  [adminEditLang]: {
                                    ...d.contactData[adminEditLang],
                                    email: e.target.value,
                                  },
                                },
                              }
                            : d,
                        )
                      }
                    />
                    <p className="admin-section-desc">{t.contactHeaderPhoneHint}</p>
                    <label className="admin-field-label">{t.contactPhone} (header)</label>
                    <input
                      type="text"
                      value={adminDraft.contactData[adminEditLang].headerPhone}
                      onChange={(e) =>
                        setAdminDraft((d) =>
                          d
                            ? {
                                ...d,
                                contactData: {
                                  ...d.contactData,
                                  [adminEditLang]: {
                                    ...d.contactData[adminEditLang],
                                    headerPhone: e.target.value,
                                  },
                                },
                              }
                            : d,
                        )
                      }
                    />
                    <label className="admin-field-label">Google Maps manzili</label>
                    <input
                      type="text"
                      placeholder="Google Maps qidiruv manzili"
                      value={adminDraft.contactData[adminEditLang].mapQuery || ''}
                      onChange={(e) =>
                        setAdminDraft((d) =>
                          d
                            ? {
                                ...d,
                                contactData: {
                                  ...d.contactData,
                                  [adminEditLang]: {
                                    ...d.contactData[adminEditLang],
                                    mapQuery: e.target.value,
                                  },
                                },
                              }
                            : d,
                        )
                      }
                    />
                    <p className="admin-section-desc">{t.contactPhonesHint}</p>
                    <div className="admin-phone-list">
                      {adminDraft.contactData[adminEditLang].phones.map((ph, idx) => (
                        <div className="admin-phone-row" key={`ph-${adminEditLang}-${idx}`}>
                          <input
                            type="text"
                            value={ph}
                            placeholder="+998..."
                            onChange={(e) =>
                              updateDraftContactPhones(adminEditLang, idx, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="btn-remove-line"
                            onClick={() => removeDraftContactPhone(adminEditLang, idx)}
                            disabled={adminDraft.contactData[adminEditLang].phones.length <= 1}
                          >
                            {t.removeNewsLine}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn-add-line"
                      onClick={() => addDraftContactPhone(adminEditLang)}
                      disabled={adminDraft.contactData[adminEditLang].phones.length >= 6}
                    >
                      + {t.addPhoneLine}
                    </button>
                  </div>
                )}

                <div className="admin-actions">
                  <button
                    type="button"
                    className={`btn-apply-changes ${saveNotice ? 'saved' : ''}`}
                    disabled={!adminDraft}
                    onClick={applyAdminDraftToSite}
                  >
                    {t.applyChanges}
                  </button>
                  <button
                    type="button"
                    className="close-admin secondary"
                    onClick={() => setShowAdmin(false)}
                  >
                    {t.close}
                  </button>
                </div>
                {showCredentialModal && (
                  <div className="credential-modal-overlay">
                    <form className="credential-modal" onSubmit={saveCredentialChanges}>
                      <h4>Login/parolni almashtirish</h4>
                      <input
                        type={showCredentialPasswords ? 'text' : 'password'}
                        placeholder="Joriy parol"
                        value={credentialForm.currentPassword}
                        onChange={(e) =>
                          setCredentialForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="text"
                        placeholder="Yangi login"
                        value={credentialForm.nextUsername}
                        onChange={(e) =>
                          setCredentialForm((prev) => ({
                            ...prev,
                            nextUsername: e.target.value,
                          }))
                        }
                      />
                      <input
                        type={showCredentialPasswords ? 'text' : 'password'}
                        placeholder="Yangi parol"
                        value={credentialForm.nextPassword}
                        onChange={(e) =>
                          setCredentialForm((prev) => ({
                            ...prev,
                            nextPassword: e.target.value,
                          }))
                        }
                      />
                      <input
                        type={showCredentialPasswords ? 'text' : 'password'}
                        placeholder="Yangi parolni tasdiqlang"
                        value={credentialForm.confirmPassword}
                        onChange={(e) =>
                          setCredentialForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                      />
                      {credentialNotice ? <p className="status">{credentialNotice}</p> : null}
                      <button
                        type="button"
                        className="password-toggle-inline"
                        onClick={() => setShowCredentialPasswords((v) => !v)}
                      >
                        {showCredentialPasswords ? 'Parollarni yashirish' : 'Parollarni ko‘rsatish'}
                      </button>
                      <div className="credential-modal-actions">
                        <button type="submit">Saqlash</button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => setShowCredentialModal(false)}
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="footer footer-pro">
        <div className="footer-columns">
          <div>
            <h3>HARD.OIL</h3>
            <p>{FOOTER_INFO.desc}</p>
          </div>
          <div>
            <h4>Menu</h4>
            <ul>
              {FOOTER_INFO.menu.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              {FOOTER_INFO.services.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>{FOOTER_INFO.email}</li>
              {contactData[language].phones.filter(Boolean).map((phone) => (
                <li key={phone}>{phone}</li>
              ))}
              <li>{FOOTER_INFO.address}</li>
            </ul>
          </div>
        </div>
        <p>© 2026 hard.oil. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
