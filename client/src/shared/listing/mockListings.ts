import type { Listing, ModerationStatus, Priority } from "./ListingCard";

export type ModerationDecision = "approved" | "rejected" | "returned";

export type ModerationHistoryItem = {
  id: number;
  moderator: string;
  decision: ModerationDecision;
  dateISO: string;
  comment?: string;
};

export type Characteristic = {
  key: string;
  value: string;
};

export type SellerInfo = {
  name: string;
  rating: number;
  totalListings: number;
  registeredAt: string;
};

export type ListingWithMeta = Listing & {
  priceValue: number;
  createdOrder: number;
  priorityWeight: number;
  description: string;
  characteristics: Characteristic[];
  seller: SellerInfo;
  views: number;
  favorites: number;
  complaints: number;
  moderationHistory: ModerationHistoryItem[];
  gallery: string[];
};

export const STORAGE_KEY = "moderation-listings-v1";

const TITLES = [
  "Игровой ноутбук для учебы и работы",
  "Смартфон с отличной камерой",
  "Удобное офисное кресло",
  "Стол для работы и учебы",
  "Смарт-часы для спорта",
  "Наушники с шумоподавлением",
  "Игровая клавиатура",
  "Игровая мышь",
  "Телевизор 4K",
  "Холодильник для кухни",
  "Стиральная машина",
  "Диван раскладной",
  "Шкаф-купе",
  "Кроссовки для бега",
  "Куртка зимняя",
  "Ремонт квартир под ключ",
  "Уборка квартир",
  "Репетитор по математике",
  "Услуги грузчиков",
  "Личный водитель",
];

const CATEGORIES = ["Электроника", "Мебель", "Одежда", "Услуги"];

const SELLERS = [
  "Иван Петров",
  "Анна Смирнова",
  "Павел Иванов",
  "Екатерина Соколова",
  "Дмитрий Кузнецов",
  "Мария Орлова",
  "Алексей Волков",
  "Ольга Сергеева",
];

const MODERATORS = ["Модератор №1", "Модератор №2", "Модератор №3"];

const REJECT_REASONS = [
  "Запрещённый товар",
  "Неверная категория",
  "Некорректное описание",
  "Проблемы с фото",
  "Подозрение на мошенничество",
];

function pseudoRandom(id: number, salt: number): number {
  const x = Math.sin(id * 92821 + salt * 1337) * 100000;
  return x - Math.floor(x);
}

function pickStatus(id: number): ModerationStatus {
  const pool: ModerationStatus[] = ["pending", "approved", "rejected"];
  return pool[id % pool.length];
}

function pickPriority(id: number): Priority {
  const pool: Priority[] = ["normal", "urgent"];
  return pool[id % pool.length];
}

function buildGallery(id: number): string[] {
  return [
    `https://picsum.photos/seed/listing-${id}-0/640/400`,
    `https://picsum.photos/seed/listing-${id}-1/640/400`,
    `https://picsum.photos/seed/listing-${id}-2/640/400`,
  ];
}

function buildCharacteristics(category: string): Characteristic[] {
  switch (category) {
    case "Электроника":
      return [
        { key: "Состояние", value: "Б/у" },
        { key: "Гарантия", value: "Осталось 6 месяцев" },
        { key: "Комплектация", value: "Полный комплект" },
      ];
    case "Мебель":
      return [
        { key: "Состояние", value: "Хорошее" },
        { key: "Материал", value: "Дерево / МДФ" },
        { key: "Цвет", value: "Серый" },
      ];
    case "Одежда":
      return [
        { key: "Размер", value: "M" },
        { key: "Сезон", value: "Зима" },
        { key: "Состояние", value: "Б/у, отличное" },
      ];
    case "Услуги":
      return [
        { key: "График", value: "По договоренности" },
        { key: "Формат", value: "С выездом к клиенту" },
      ];
    default:
      return [{ key: "Состояние", value: "Не указано" }];
  }
}

function buildSeller(id: number): SellerInfo {
  const name = SELLERS[id % SELLERS.length];
  const rating = 3 + pseudoRandom(id, 1) * 2; // 3–5
  const totalListings = 5 + Math.floor(pseudoRandom(id, 2) * 200);
  const yearsAgo = 1 + Math.floor(pseudoRandom(id, 3) * 3);
  const registeredYear = new Date().getFullYear() - yearsAgo;
  return {
    name,
    rating: Number(rating.toFixed(1)),
    totalListings,
    registeredAt: `${registeredYear} г.`,
  };
}

function buildModerationHistory(
  id: number,
  status: ModerationStatus,
  createdISO: string
): ModerationHistoryItem[] {
  const history: ModerationHistoryItem[] = [];
  const createdDate = new Date(createdISO);

  history.push({
    id: 1,
    moderator: "Система",
    decision: "returned",
    dateISO: createdISO,
    comment: "Объявление создано и отправлено на модерацию.",
  });

  // немного сдвигаем во времени
  const second = new Date(createdDate.getTime() + 1000 * 60 * 30); // +30 минут

  if (status === "pending") {
    return history;
  }

  if (status === "approved") {
    history.push({
      id: 2,
      moderator: MODERATORS[id % MODERATORS.length],
      decision: "approved",
      dateISO: second.toISOString(),
      comment: "Объявление соответствует правилам площадки.",
    });
    return history;
  }

  // rejected
  const reason = REJECT_REASONS[id % REJECT_REASONS.length];
  history.push({
    id: 2,
    moderator: MODERATORS[id % MODERATORS.length],
    decision: "rejected",
    dateISO: second.toISOString(),
    comment: `Отклонено: ${reason}.`,
  });
  return history;
}

function buildListing(id: number): ListingWithMeta {
  const title = TITLES[id % TITLES.length];
  const category = CATEGORIES[id % CATEGORIES.length];
  const status = pickStatus(id);
  const priority = pickPriority(id);

  const basePrice = 5000 + Math.floor(pseudoRandom(id, 4) * 150000);
  const priceValue = Math.round(basePrice / 100) * 100;
  const price = `${priceValue.toLocaleString("ru-RU")} ₽`;

  const now = new Date();
  const daysAgo = Math.floor(pseudoRandom(id, 5) * 30); // в пределах месяца
  const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const createdAt = createdDate.toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const views = 20 + Math.floor(pseudoRandom(id, 6) * 980);
  const favorites = Math.floor(pseudoRandom(id, 7) * 80);
  const complaints = Math.floor(pseudoRandom(id, 8) * 5);

  const gallery = buildGallery(id);
  const seller = buildSeller(id);
  const characteristics = buildCharacteristics(category);
  const moderationHistory = buildModerationHistory(
    id,
    status,
    createdDate.toISOString()
  );

  return {
    id,
    title,
    price,
    category,
    status,
    priority,
    createdAt,
    image: gallery[0],

    priceValue,
    createdOrder: id,
    priorityWeight: priority === "urgent" ? 2 : 1,

    description: `${title} в категории "${category}". Это моковые данные для стенда модерации: описание, характеристики, продавец, история модерации и статистика.`,
    characteristics,
    seller,
    views,
    favorites,
    complaints,
    moderationHistory,
    gallery,
  };
}

export const mockListings: ListingWithMeta[] = Array.from(
  { length: 50 },
  (_, i) => buildListing(i + 1)
);

// ==== LocalStorage ====

export function getInitialListings(): ListingWithMeta[] {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return mockListings;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockListings;
    const parsed = JSON.parse(raw) as ListingWithMeta[];
    if (!Array.isArray(parsed) || parsed.length === 0) return mockListings;
    return parsed;
  } catch {
    return mockListings;
  }
}

export function saveListingsState(list: ListingWithMeta[]): void {
  if (typeof window === "undefined" || !("localStorage" in window)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // забиваем, если что-то пошло не так
  }
}
