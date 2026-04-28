/** Default site payload (server seed). About texts are short placeholders; edit in admin. */
const LOCAL_PRODUCT_IMAGES = Array.from({ length: 12 }, (_, i) =>
  `/images/oil/${String(i + 1).padStart(2, '0')}.jpg`,
)

export function getDefaultProducts() {
  return Array.from({ length: 29 }, (_, i) => ({
    id: i + 1,
    name: `hard.oil Series ${i + 1} ${i % 2 === 0 ? '5W-30' : '10W-40'}`,
    price: 50000 + i * 7000,
    image: LOCAL_PRODUCT_IMAGES[i % LOCAL_PRODUCT_IMAGES.length],
  }))
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

const DEFAULT_PUBLIC_PHONE = '+998901234567'

const PLACEHOLDER_ABOUT =
  'hard.oil — professional motor moylari. Matnni admin panel orqali tahrirlang.'

export function getDefaultSitePayload() {
  return {
    products: getDefaultProducts(),
    news: initialNews,
    aboutContent: {
      UZ: PLACEHOLDER_ABOUT,
      RU: PLACEHOLDER_ABOUT,
      EN: PLACEHOLDER_ABOUT,
      ZH: PLACEHOLDER_ABOUT,
    },
    contactData: {
      UZ: {
        desc: "To'liq ma'lumot uchun biz bilan bog'laning:",
        email: 'hardoil.official@gmail.com',
        phones: [DEFAULT_PUBLIC_PHONE],
        headerPhone: DEFAULT_PUBLIC_PHONE,
      },
      RU: {
        desc: 'Свяжитесь с нами для подробной информации:',
        email: 'hardoil.official@gmail.com',
        phones: [DEFAULT_PUBLIC_PHONE],
        headerPhone: DEFAULT_PUBLIC_PHONE,
      },
      EN: {
        desc: 'Reach us for full information:',
        email: 'hardoil.official@gmail.com',
        phones: [DEFAULT_PUBLIC_PHONE],
        headerPhone: DEFAULT_PUBLIC_PHONE,
      },
      ZH: {
        desc: '需要更多信息，欢迎联系我们：',
        email: 'hardoil.official@gmail.com',
        phones: [DEFAULT_PUBLIC_PHONE],
        headerPhone: DEFAULT_PUBLIC_PHONE,
      },
    },
  }
}
