// Категории и подкатегории магазина строительных материалов
// Данные из stroy-dom, адаптированные для новой структуры

export interface MenuCategory {
  name: string;
  shortName?: string; // Короткое название для Header
  slug: string;
  href: string;
  icon?: string;
  image?: string;
  subcategories: MenuSubcategory[];
}

export interface MenuSubcategory {
  name: string;
  slug: string;
  href: string;
  image?: string;
}

// Главное меню категорий
export const menuCategories: MenuCategory[] = [
  {
    name: "Профнастил",
    slug: "profnastil",
    href: "/catalog/profnastil",
    icon: "/icons/profnastil.svg",
    image: "/images/categories/profnastil.webp",
    subcategories: [
      { name: "МП-20", slug: "mp-20", href: "/catalog/profnastil/mp-20", image: "/images/профнастил/mp1.webp" },
      { name: "С-8", slug: "s-8", href: "/catalog/profnastil/s-8", image: "/images/профнастил/c1.webp" },
    ],
  },
  {
    name: "Сухие смеси",
    slug: "suhie-smesi",
    href: "/catalog/suhie-smesi",
    icon: "/icons/smesi.svg",
    image: "/images/categories/smesi.webp",
    subcategories: [
      { name: "Штукатурка", slug: "shtukaturka", href: "/catalog/suhie-smesi/shtukaturka" },
      { name: "Шпатлёвка", slug: "shpatlevka", href: "/catalog/suhie-smesi/shpatlevka" },
      { name: "Декоративная штукатурка", slug: "dekorativnaya-shtukaturka", href: "/catalog/suhie-smesi/dekorativnaya-shtukaturka" },
      { name: "Смеси для пола", slug: "smesi-dlya-pola", href: "/catalog/suhie-smesi/smesi-dlya-pola" },
      { name: "Плиточный клей", slug: "plitochnyy-kley", href: "/catalog/suhie-smesi/plitochnyy-kley" },
      { name: "Штукатурно-клеевая смесь", slug: "shtukaturno-kleevaya-smes", href: "/catalog/suhie-smesi/shtukaturno-kleevaya-smes" },
      { name: "Монтажный клей", slug: "montazhnyy-kley", href: "/catalog/suhie-smesi/montazhnyy-kley" },
      { name: "Клей для блоков", slug: "kley-dlya-blokov", href: "/catalog/suhie-smesi/kley-dlya-blokov" },
      { name: "Цемент", slug: "cement", href: "/catalog/suhie-smesi/cement" },
      { name: "Затирка для плитки", slug: "zatirka-dlya-plitki", href: "/catalog/suhie-smesi/zatirka-dlya-plitki" },
    ],
  },
  {
    name: "Древесные плиты",
    slug: "drevesnye-plity",
    href: "/catalog/drevesnye-plity",
    icon: "/icons/plity.svg",
    image: "/images/categories/plity.webp",
    subcategories: [
      { name: "ОСП", slug: "osp", href: "/catalog/drevesnye-plity/osp" },
      { name: "ДСП", slug: "dsp", href: "/catalog/drevesnye-plity/dsp" },
      { name: "ДВП", slug: "dvp", href: "/catalog/drevesnye-plity/dvp" },
      { name: "Фанера", slug: "fanera", href: "/catalog/drevesnye-plity/fanera" },
    ],
  },
  {
    name: "Вагонка и бруски",
    shortName: "Вагонка",
    slug: "vagonka-i-bruski",
    href: "/catalog/vagonka-i-bruski",
    icon: "/icons/brus.svg",
    image: "/images/categories/brus.webp",
    subcategories: [
      { name: "Вагонка", slug: "vagonka", href: "/catalog/vagonka-i-bruski/vagonka" },
      { name: "Бруски", slug: "bruski", href: "/catalog/vagonka-i-bruski/bruski" },
    ],
  },
  {
    name: "Гипсокартон",
    slug: "gipsokarton",
    href: "/catalog/gipsokarton",
    icon: "/icons/gkl.svg",
    image: "/images/categories/gkl.webp",
    subcategories: [
      { name: "Для сухих помещений", slug: "dlya-suhih-pomescheniy", href: "/catalog/gipsokarton/dlya-suhih-pomescheniy" },
      { name: "Влагостойкий", slug: "vlagostoykiy", href: "/catalog/gipsokarton/vlagostoykiy" },
    ],
  },
  {
    name: "Профиля и направляющие",
    shortName: "Профиля",
    slug: "profilya-i-napravlyayuschie",
    href: "/catalog/profilya-i-napravlyayuschie",
    icon: "/icons/profil.svg",
    image: "/images/categories/profil.webp",
    subcategories: [
      { name: "Стеновые", slug: "stenovye", href: "/catalog/profilya-i-napravlyayuschie/stenovye" },
      { name: "Перегородочные", slug: "peregorodochnye", href: "/catalog/profilya-i-napravlyayuschie/peregorodochnye" },
    ],
  },
  {
    name: "Маяки и перфорированные углы",
    shortName: "Маяки",
    slug: "mayaki-i-perforirovannye-ugly",
    href: "/catalog/mayaki-i-perforirovannye-ugly",
    icon: "/icons/mayak.svg",
    image: "/images/categories/mayak.webp",
    subcategories: [
      { name: "Маяки", slug: "mayaki", href: "/catalog/mayaki-i-perforirovannye-ugly/mayaki" },
      { name: "Перфорированные углы", slug: "perforirovannye-ugly", href: "/catalog/mayaki-i-perforirovannye-ugly/perforirovannye-ugly" },
    ],
  },
  {
    name: "Профтрубы и металлические углы",
    shortName: "Профтрубы",
    slug: "proftruby-i-metallicheskie-ugly",
    href: "/catalog/proftruby-i-metallicheskie-ugly",
    icon: "/icons/proftruby.svg",
    image: "/images/categories/proftruby.webp",
    subcategories: [
      { name: "Профтрубы", slug: "proftruby", href: "/catalog/proftruby-i-metallicheskie-ugly/proftruby" },
      { name: "Металлические углы", slug: "metallicheskie-ugly", href: "/catalog/proftruby-i-metallicheskie-ugly/metallicheskie-ugly" },
    ],
  },
  {
    name: "Арматура и кладочная сетка",
    shortName: "Арматура",
    slug: "armatura-i-kladochnaya-setka",
    href: "/catalog/armatura-i-kladochnaya-setka",
    icon: "/icons/armatura.svg",
    image: "/images/categories/armatura.webp",
    subcategories: [
      { name: "Стеклопластиковая арматура", slug: "stekloplastikovaya-armatura", href: "/catalog/armatura-i-kladochnaya-setka/stekloplastikovaya-armatura" },
      { name: "Кладочная сетка", slug: "kladochnaya-setka", href: "/catalog/armatura-i-kladochnaya-setka/kladochnaya-setka" },
    ],
  },
  {
    name: "Утеплители",
    slug: "utepliteli",
    href: "/catalog/utepliteli",
    icon: "/icons/utepl.svg",
    image: "/images/categories/utepl.webp",
    subcategories: [
      { name: "Пенополистирол", slug: "penopolistirol", href: "/catalog/utepliteli/penopolistirol" },
      { name: "Пенопласт", slug: "penoplast", href: "/catalog/utepliteli/penoplast" },
      { name: "Каменная и минеральная вата", slug: "kamennaya-i-mineralnaya-vata", href: "/catalog/utepliteli/kamennaya-i-mineralnaya-vata" },
    ],
  },
  {
    name: "Изоляция",
    slug: "izolyaciya",
    href: "/catalog/izolyaciya",
    icon: "/icons/izol.svg",
    image: "/images/categories/izol.webp",
    subcategories: [
      { name: "Отражающая теплоизоляция", slug: "otrazhayuschaya-teploizolyaciya", href: "/catalog/izolyaciya/otrazhayuschaya-teploizolyaciya" },
      { name: "Пароизоляция", slug: "paroizolyaciya", href: "/catalog/izolyaciya/paroizolyaciya" },
      { name: "Гидро-пароизоляция", slug: "gidro-paroizolyaciya", href: "/catalog/izolyaciya/gidro-paroizolyaciya" },
      { name: "Ветро-влагозащита", slug: "vetro-vlagozaschita", href: "/catalog/izolyaciya/vetro-vlagozaschita" },
    ],
  },
  {
    name: "Гидроизоляция",
    slug: "gidroizolyaciya",
    href: "/catalog/gidroizolyaciya",
    icon: "/icons/gidro.svg",
    image: "/images/categories/gidro.webp",
    subcategories: [
      { name: "Сухая смесь", slug: "suhaya-smes", href: "/catalog/gidroizolyaciya/suhaya-smes" },
      { name: "Жидкая гидроизоляция", slug: "zhidkaya-gidroizolyaciya", href: "/catalog/gidroizolyaciya/zhidkaya-gidroizolyaciya" },
      { name: "Лента гидроизоляционная", slug: "lenta-gidroizolyacionnaya", href: "/catalog/gidroizolyaciya/lenta-gidroizolyacionnaya" },
      { name: "Битумные рулоны", slug: "bitumnye-rulony", href: "/catalog/gidroizolyaciya/bitumnye-rulony" },
    ],
  },
  {
    name: "Крепёж",
    slug: "krepezh",
    href: "/catalog/krepezh",
    icon: "/icons/krepezh.svg",
    image: "/images/categories/krepezh.webp",
    subcategories: [
      { name: "Саморезы для гипсокартона", slug: "samorezy-dlya-gipsokartona", href: "/catalog/krepezh/samorezy-dlya-gipsokartona" },
      { name: "Кровельные саморезы", slug: "krovelnye-samorezy", href: "/catalog/krepezh/krovelnye-samorezy" },
      { name: "Гвозди", slug: "gvozdi", href: "/catalog/krepezh/gvozdi" },
      { name: "Крепёжные уголки и подвесы", slug: "krepezhnye-ugolki-i-podvesy", href: "/catalog/krepezh/krepezhnye-ugolki-i-podvesy" },
      { name: "Болты, гайки", slug: "bolty-gayki", href: "/catalog/krepezh/bolty-gayki" },
      { name: "Дюбеля", slug: "dyubelya", href: "/catalog/krepezh/dyubelya" },
      { name: "Удлинитель профилей и крабы", slug: "udlinitel-profiley-i-kraby", href: "/catalog/krepezh/udlinitel-profiley-i-kraby" },
    ],
  },
  {
    name: "Лакокрасочные материалы",
    shortName: "Краски",
    slug: "lakokrasochnye-materialy",
    href: "/catalog/lakokrasochnye-materialy",
    icon: "/icons/kraski.svg",
    image: "/images/categories/kraski.webp",
    subcategories: [
      { name: "Водоэмульсионные краски", slug: "vodoemulsionnye-kraski", href: "/catalog/lakokrasochnye-materialy/vodoemulsionnye-kraski" },
      { name: "Эмали", slug: "emali", href: "/catalog/lakokrasochnye-materialy/emali" },
      { name: "Лаки и пропитки", slug: "laki-i-propitki", href: "/catalog/lakokrasochnye-materialy/laki-i-propitki" },
    ],
  },
  {
    name: "Отделка",
    slug: "otdelka",
    href: "/catalog/otdelka",
    icon: "/icons/otdelka.svg",
    image: "/images/categories/otdelka.webp",
    subcategories: [
      { name: "Грунтовка", slug: "gruntovka", href: "/catalog/otdelka/gruntovka" },
      { name: "Бетоноконтакт", slug: "betonokontakt", href: "/catalog/otdelka/betonokontakt" },
      { name: "Готовые шпатлёвки", slug: "gotovye-shpatlevki", href: "/catalog/otdelka/gotovye-shpatlevki" },
      { name: "Монтажная пена и пена клей", slug: "montazhnaya-pena-i-pena-kley", href: "/catalog/otdelka/montazhnaya-pena-i-pena-kley" },
      { name: "Герметик", slug: "germetik", href: "/catalog/otdelka/germetik" },
      { name: "Клей", slug: "kley", href: "/catalog/otdelka/kley" },
      { name: "Стеклосетка и стеклохолст", slug: "steklosetka-i-stekloholst", href: "/catalog/otdelka/steklosetka-i-stekloholst" },
    ],
  },
  {
    name: "Инструменты и расходные материалы",
    shortName: "Инструменты",
    slug: "instrumenty-i-rashodnye-materialy",
    href: "/catalog/instrumenty-i-rashodnye-materialy",
    icon: "/icons/instrum.svg",
    image: "/images/categories/instrum.webp",
    subcategories: [
      { name: "Валики", slug: "valiki", href: "/catalog/instrumenty-i-rashodnye-materialy/valiki" },
      { name: "Шпатели", slug: "shpateli", href: "/catalog/instrumenty-i-rashodnye-materialy/shpateli" },
      { name: "Кисти", slug: "kisti", href: "/catalog/instrumenty-i-rashodnye-materialy/kisti" },
      { name: "Ленты и скотчи", slug: "lenty-i-skotchi", href: "/catalog/instrumenty-i-rashodnye-materialy/lenty-i-skotchi" },
      { name: "Монтажные пистолеты", slug: "montazhnye-pistolety", href: "/catalog/instrumenty-i-rashodnye-materialy/montazhnye-pistolety" },
      { name: "СВП", slug: "svp", href: "/catalog/instrumenty-i-rashodnye-materialy/svp" },
      { name: "Свёрла, биты и буры", slug: "sverla-bity-i-bury", href: "/catalog/instrumenty-i-rashodnye-materialy/sverla-bity-i-bury" },
      { name: "Абразивные диски", slug: "abrazivnye-diski", href: "/catalog/instrumenty-i-rashodnye-materialy/abrazivnye-diski" },
      { name: "Тара и ёмкости", slug: "tara-i-emkosti", href: "/catalog/instrumenty-i-rashodnye-materialy/tara-i-emkosti" },
      { name: "Другое", slug: "drugoe", href: "/catalog/instrumenty-i-rashodnye-materialy/drugoe" },
    ],
  },
];

// Дополнительные элементы меню
export const additionalMenuItems = [
  {
    name: "Акции",
    href: "/sales",
    icon: "/icons/percent.svg",
  },
  {
    name: "Блог",
    href: "/blog",
    icon: "/icons/blog.svg",
  },
  {
    name: "Оплата и доставка",
    href: "/payment",
    icon: "/icons/delivery.svg",
  },
  {
    name: "Контакты",
    href: "/contacts",
    icon: "/icons/contacts.svg",
  },
];

// Утилита для получения категории по slug
export function getCategoryBySlug(slug: string): MenuCategory | undefined {
  return menuCategories.find((cat) => cat.slug === slug);
}

// Утилита для получения подкатегории по slug
export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): MenuSubcategory | undefined {
  const category = getCategoryBySlug(categorySlug);
  return category?.subcategories.find((sub) => sub.slug === subcategorySlug);
}

// Получить все подкатегории flat списком
export function getAllSubcategories(): (MenuSubcategory & { categorySlug: string; categoryName: string })[] {
  return menuCategories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      ...sub,
      categorySlug: cat.slug,
      categoryName: cat.name,
    }))
  );
}
