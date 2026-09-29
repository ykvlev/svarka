/** Shared content for the landing page. Text lives here, icons live in components. */

export const SITE = {
  brand: "Кантователь",
  city: "Великий Новгород",
  owner: "Сергей",
  ownerInstrumental: "Сергеем",
  price: 19000,
  phone: "+79062036089",
  phoneDisplay: "+7 906 203-60-89",
  telegram: "https://t.me/meqa921",
  telegramHandle: "meqa921",
  vk: "https://vk.ru/sergey_yakovlev76",
  delivery: "Доставка СДЭК по России",
} as const;

export const COLORS = {
  gray: { label: "Серый", hex: "#9699a4" },
  black: { label: "Чёрный", hex: "#33343c" },
} as const;

export type ColorKey = keyof typeof COLORS;

export const SIZES = ["1200 × 300 мм", "1300 × 300 мм", "Индивидуальный размер"] as const;
export const CONTACT_METHODS = ["Звонок", "Telegram", "ВКонтакте"] as const;

export const SPECS = [
  { label: "Размеры", value: "1200 / 1300 × 300 мм" },
  { label: "Покрытие", value: "Порошковая окраска" },
  { label: "Под заказ", value: "Индивидуальные размеры" },
] as const;

export const FEATURES = [
  {
    icon: "wrench",
    title: "Очистка и обслуживание",
    description: "Для удаления травы, замены ножей и мелкого ремонта",
  },
  {
    icon: "rotate",
    title: "Ручная лебёдка",
    description: "Подъём вращением рукоятки, без подключения к электричеству",
  },
  {
    icon: "paint",
    title: "Порошковая окраска",
    description: "Чёрный и серый в стандартном исполнении, другие цвета под заказ",
  },
] as const;

export const GALLERY = [
  { file: "caiman.jpg", title: "Caiman", description: "Жёлтая окраска" },
  { file: "yardfox.jpg", title: "Yard Fox", description: "Индивидуальный цвет" },
  { file: "stihl.jpg", title: "STIHL", description: "Обслуживание в гараже" },
] as const;

export const INCLUDED = [
  "Размеры 1200 × 300 или 1300 × 300 мм",
  "Изготовление под ваш райдер",
  "Доставка СДЭК включена в стоимость",
] as const;

export const NAV_LINKS = [
  { href: "#about", label: "Конструкция" },
  { href: "#photos", label: "В работе" },
  { href: "#order", label: "Комплектация" },
] as const;
