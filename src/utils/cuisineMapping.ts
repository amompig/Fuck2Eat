export interface MacroCuisine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  subCuisines: string[];
}

export const MACRO_CUISINES: MacroCuisine[] = [
  {
    id: 'noodles_dumplings',
    name: '麵食包點',
    emoji: '🍜',
    description: '拉麵、牛肉麵、義大利麵、水煎包、小籠湯包',
    subCuisines: [
      '拉麵',
      '義大利麵',
      '米線',
      '北方麵食',
      '擔仔麵',
      '小籠包',
      '水煎包',
      '中式包點',
      '湯包',
      '牛肉麵',
    ],
  },
  {
    id: 'rice_taiwanese',
    name: '飯食小吃',
    emoji: '🍚',
    description: '便當快餐、熱炒炒飯、鹹粥米粉湯、傳統小吃',
    subCuisines: [
      '台菜',
      '小吃',
      '便當',
      '快餐',
      '炒飯',
      '滷味',
      '鹹粥',
      '米粉湯',
      '台式家常',
      '客家',
      '家常',
      '東北菜',
      '鐵鍋燉',
      '東山鴨頭',
      '豆腐',
      '鹽酥雞',
      '雞排',
      '炸物',
      '炸雞',
    ],
  },
  {
    id: 'hotpot_bbq',
    name: '鍋物燒烤',
    emoji: '🥩',
    description: '麻辣火鍋、小火鍋、炭火燒肉、串燒熱炒、薑母鴨',
    subCuisines: [
      '火鍋',
      '小火鍋',
      '麻辣',
      '薑母鴨',
      '燒肉',
      '銅盤烤肉',
      '燒烤',
      '串燒',
      '碳烤',
      '串香',
      '烤鴨',
      '肉舖',
      '羊肉',
      '牛肉',
      '海鮮',
      '熱炒',
      '吃到飽',
    ],
  },
  {
    id: 'brunch_western',
    name: '早午餐西式',
    emoji: '🍳',
    description: '精緻早午餐、漢堡披薩、手作早餐、義式燉飯',
    subCuisines: [
      '早午餐',
      '早餐',
      '漢堡',
      '披薩',
      '燉飯',
      '西式',
      '景觀',
      '餐廳',
    ],
  },
  {
    id: 'exotic_asian',
    name: '異國料理',
    emoji: '🍱',
    description: '日式拉麵定食、韓式烤肉、港式燒臘、越式料理',
    subCuisines: [
      '日式',
      '韓式',
      '義式',
      '港式',
      '燒臘',
      '越式',
      '無菜單',
      '自助餐',
      '定食',
    ],
  },
  {
    id: 'cafe_dessert',
    name: '咖啡甜品',
    emoji: '☕',
    description: '手沖咖啡、豆花甜品、冰品波士頓派、放鬆酒吧',
    subCuisines: [
      '咖啡',
      '甜品',
      '豆花',
      '冰品',
      '甜點',
      '派',
      '酒吧',
      '餐酒館',
      '餐酒',
      '小酒館',
      '便利商店',
    ],
  },
];

/**
 * Returns which macro category a restaurant belongs to (can belong to multiple)
 */
export function getRestaurantMacroCategories(cuisines: string[]): string[] {
  const matched = new Set<string>();
  cuisines.forEach((c) => {
    for (const macro of MACRO_CUISINES) {
      if (macro.subCuisines.includes(c)) {
        matched.add(macro.name);
      }
    }
  });
  if (matched.size === 0) {
    matched.add('精選美食');
  }
  return Array.from(matched);
}

/**
 * Check if restaurant matches selected macro categories
 */
export function matchesMacroCategories(restaurantCuisines: string[], selectedMacroIds: string[]): boolean {
  if (selectedMacroIds.length === 0) return true;

  const targetSubCuisines = new Set<string>();
  selectedMacroIds.forEach((id) => {
    const macro = MACRO_CUISINES.find((m) => m.id === id);
    if (macro) {
      macro.subCuisines.forEach((sc) => targetSubCuisines.add(sc));
    }
  });

  return restaurantCuisines.some((c) => targetSubCuisines.has(c));
}
