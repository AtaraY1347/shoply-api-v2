const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ============================================================
//  Shoply API v2.1 - מבוסס APIs חיצוניים אמיתיים
//  שיפורים: סינון מוצרים בלי שם בעברית/אנגלית בלבד,
//           תרגום כמויות, חיפוש משופר
// ============================================================

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const PRICES_BASE_URL = "https://prices.openfoodfacts.org/api/v1";
const USER_AGENT = "ShoplyApp/2.1";

const STORE_NAMES = {
  shufersal: "שופרסל",
  ramiLevy: "רמי לוי",
  victory: "ויקטורי",
  yohananof: "יוחננוף",
  carrefour: "קרפור",
  tivTaam: "טיב טעם"
};

const STORE_MAPPING = {
  "lidl": "ramiLevy", "aldi": "ramiLevy", "netto": "ramiLevy", "dia": "ramiLevy",
  "carrefour": "carrefour", "auchan": "carrefour",
  "tesco": "shufersal", "intermarche": "shufersal", "leclerc": "shufersal",
  "casino": "victory", "monoprix": "victory", "spar": "victory",
  "asda": "yohananof", "sainsburys": "yohananof",
  "marks-and-spencer": "tivTaam", "waitrose": "tivTaam",
  "whole-foods": "tivTaam", "biocoop": "tivTaam"
};

// ============================================================
//  קטגוריות - שמות מדויקים מ-Open Food Facts
//  (חלק מהtags לא היו מדויקים בגרסה הקודמת)
// ============================================================
const CATEGORIES = [
  // ביצים ודגנים
  { tag: "en:eggs",                    he: "ביצים ודגנים" },
  { tag: "en:breakfast-cereals",       he: "ביצים ודגנים" },
  // פחמימות
  { tag: "en:pastas",                  he: "פחמימות" },
  { tag: "en:rice",                    he: "פחמימות" },
  { tag: "en:legumes",                 he: "פחמימות" },
  { tag: "en:breads",                  he: "פחמימות" },
  // ירקות ופירות
  { tag: "en:vegetables",              he: "ירקות" },
  { tag: "en:fresh-vegetables",        he: "ירקות" },
  { tag: "en:fruits",                  he: "פירות" },
  { tag: "en:fresh-fruits",            he: "פירות" },
  // בשר ודגים
  { tag: "en:meats",                   he: "בשר ודגים" },
  { tag: "en:poultry",                 he: "בשר ודגים" },
  { tag: "en:fishes",                  he: "בשר ודגים" },
  { tag: "en:canned-fishes",           he: "בשר ודגים" },
  // מוצרי חלב
  { tag: "en:dairies",                 he: "מוצרי חלב" },
  { tag: "en:cheeses",                 he: "מוצרי חלב" },
  { tag: "en:yogurts",                 he: "מוצרי חלב" },
  { tag: "en:milks",                   he: "מוצרי חלב" },
  // שתייה
  { tag: "en:beverages",               he: "שתייה" },
  { tag: "en:waters",                  he: "שתייה" },
  { tag: "en:sodas",                   he: "שתייה" },
  { tag: "en:fruit-juices",            he: "שתייה" },
  // חטיפים ומתוקים
  { tag: "en:snacks",                  he: "חטיפים ומתוקים" },
  { tag: "en:chocolates",              he: "חטיפים ומתוקים" },
  { tag: "en:biscuits",                he: "חטיפים ומתוקים" },
  { tag: "en:ice-creams",              he: "חטיפים ומתוקים" },
  { tag: "en:sweet-spreads",           he: "חטיפים ומתוקים" },
  { tag: "en:candies",                 he: "חטיפים ומתוקים" }
];

const ALL_CATEGORIES_HE = [...new Set(CATEGORIES.map(c => c.he))];

// ============================================================
//  מילון תרגום מורחב
// ============================================================
const TRANSLATIONS = {
  // תארים
  "white": "לבן", "red": "אדום", "green": "ירוק", "yellow": "צהוב",
  "fresh": "טרי", "frozen": "קפוא", "organic": "אורגני",
  "natural": "טבעי", "sweet": "מתוק", "whole": "מלא",
  "low": "דל", "fat": "שומן", "free": "ללא",
  // ביצים ודגנים
  "egg": "ביצים", "eggs": "ביצים",
  "flour": "קמח", "wheat": "חיטה",
  "oats": "שיבולת שועל", "oat": "שיבולת שועל",
  "cereal": "דגני בוקר", "cereals": "דגני בוקר",
  "cornflakes": "קורנפלקס", "corn flakes": "קורנפלקס",
  "granola": "גרנולה", "muesli": "מוזלי",
  // פחמימות
  "rice": "אורז", "basmati": "בסמטי",
  "pasta": "פסטה", "spaghetti": "ספגטי", "penne": "פנה",
  "fusilli": "פוסילי", "noodles": "אטריות", "macaroni": "מקרוני",
  "couscous": "קוסקוס", "bulgur": "בורגול", "quinoa": "קינואה",
  "lentils": "עדשים", "chickpeas": "חומוס", "beans": "שעועית",
  "bread": "לחם", "pita": "פיתה", "buns": "לחמניות", "roll": "לחמנייה",
  "tortilla": "טורטייה",
  // ירקות
  "potato": "תפוח אדמה", "potatoes": "תפוח אדמה",
  "sweet potato": "בטטה",
  "onion": "בצל", "garlic": "שום",
  "tomato": "עגבנייה", "tomatoes": "עגבניות",
  "cherry tomato": "עגבניות שרי",
  "cucumber": "מלפפון", "pepper": "פלפל", "peppers": "פלפלים",
  "carrot": "גזר", "carrots": "גזרים",
  "lettuce": "חסה",
  "cabbage": "כרוב", "cauliflower": "כרובית", "broccoli": "ברוקולי",
  "zucchini": "קישוא", "eggplant": "חציל",
  "parsley": "פטרוזיליה", "coriander": "כוסברה", "mint": "נענע",
  "mushroom": "פטרייה", "mushrooms": "פטריות",
  "corn": "תירס", "spinach": "תרד",
  // פירות
  "apple": "תפוח", "apples": "תפוחים", "banana": "בננה", "bananas": "בננות",
  "orange": "תפוז", "oranges": "תפוזים",
  "clementine": "קלמנטינה", "lemon": "לימון", "lime": "ליים",
  "avocado": "אבוקדו", "grape": "ענבים", "grapes": "ענבים",
  "strawberry": "תות", "strawberries": "תות שדה",
  "watermelon": "אבטיח", "melon": "מלון", "pineapple": "אננס",
  "pear": "אגס", "pears": "אגסים", "peach": "אפרסק", "peaches": "אפרסקים",
  "nectarine": "נקטרינה", "kiwi": "קיווי", "mango": "מנגו",
  "blueberry": "אוכמנייה", "blueberries": "אוכמניות",
  "raspberry": "פטל", "blackberry": "פטל שחור",
  "date": "תמר", "dates": "תמרים",
  "cherry": "דובדבן", "cherries": "דובדבנים",
  // בשר ודגים
  "chicken": "עוף", "breast": "חזה", "thighs": "שוקיים",
  "wings": "כנפיים",
  "beef": "בקר", "ground": "טחון", "ground beef": "בקר טחון",
  "entrecote": "אנטריקוט", "fillet": "פילה", "steak": "סטייק",
  "lamb": "כבש",
  "burger": "המבורגר", "hamburger": "המבורגר",
  "sausage": "נקניק", "sausages": "נקניקיות",
  "salmon": "סלמון", "smoked": "מעושן",
  "tuna": "טונה", "tilapia": "אמנון", "fish": "דג",
  // חלב
  "milk": "חלב", "soy": "סויה", "almond": "שקדים",
  "cheese": "גבינה",
  "cottage": "קוטג'", "feta": "פטה", "mozzarella": "מוצרלה",
  "gouda": "גאודה", "emmental": "אמנטל", "parmesan": "פרמזן",
  "cheddar": "צ'דר", "yogurt": "יוגורט", "greek": "יווני",
  "butter": "חמאה", "margarine": "מרגרינה",
  "cream": "שמנת", "sour": "חמוצה",
  // שתייה
  "water": "מים", "mineral": "מינרליים",
  "coke": "קוקה קולה", "cola": "קולה", "coca-cola": "קוקה קולה",
  "sprite": "ספרייט", "fanta": "פאנטה", "pepsi": "פפסי",
  "juice": "מיץ",
  "tea": "תה", "coffee": "קפה", "instant": "נמס",
  "beer": "בירה", "wine": "יין",
  // חטיפים
  "chips": "צ'יפס", "doritos": "דוריטוס", "cheetos": "צ'יטוס",
  "popcorn": "פופקורן",
  "chocolate": "שוקולד", "dark": "מריר",
  "candy": "סוכריות", "candies": "סוכריות",
  "cookies": "עוגיות", "biscuits": "עוגיות",
  "wafer": "ופלים", "wafers": "ופלים",
  "ice cream": "גלידה", "vanilla": "וניל",
  "nutella": "נוטלה", "spread": "ממרח"
};

// ============================================================
//  תרגום יחידות מידה (g, ml, kg וכו')
// ============================================================
function translateQuantity(quantity) {
  if (!quantity) return "יחידה";

  let translated = String(quantity);

  // מ-l ראשון (ארוך לפני קצר!)
  translated = translated.replace(/(\d+\.?\d*)\s*ml\b/gi, "$1 מ\"ל");
  translated = translated.replace(/(\d+\.?\d*)\s*kg\b/gi, "$1 ק\"ג");
  translated = translated.replace(/(\d+\.?\d*)\s*g\b/gi, "$1 גרם");
  translated = translated.replace(/(\d+\.?\d*)\s*l\b/gi, "$1 ליטר");
  translated = translated.replace(/(\d+\.?\d*)\s*oz\b/gi, "$1 אונקיות");
  translated = translated.replace(/(\d+\.?\d*)\s*lb\b/gi, "$1 פאונד");

  // יחידות
  translated = translated.replace(/\bunits?\b/gi, "יח'");
  translated = translated.replace(/\bpieces?\b/gi, "יח'");
  translated = translated.replace(/\bpcs?\b/gi, "יח'");
  translated = translated.replace(/\bpack\b/gi, "מארז");

  return translated.trim();
}

const CURRENCY_TO_ILS = { "EUR": 4.0, "USD": 3.7, "GBP": 4.7, "ILS": 1.0, "CHF": 4.2 };

function convertToILS(price, currency) {
  const rate = CURRENCY_TO_ILS[currency?.toUpperCase()] || 4.0;
  return price * rate;
}

const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL });
}

// ============================================================
//  בדיקה שהשם הוא באנגלית בלבד (לא סינית/יפנית/ערבית/עברית)
//  אם יש תווים שאינם אנגלית - מסננים את המוצר
// ============================================================
function isEnglishOnly(text) {
  if (!text || text.length < 2) return false;
  // מסננים אם יש תווים אסיאתיים, ערבית, עברית, רוסית
  const nonLatinPattern = /[\u4e00-\u9fff\u3040-\u30ff\u0590-\u05ff\u0600-\u06ff\u0400-\u04ff]/;
  if (nonLatinPattern.test(text)) return false;
  // לפחות צריכה להיות אות אנגלית אחת
  return /[a-zA-Z]/.test(text);
}

// ============================================================
//  פונקציית תרגום משופרת
// ============================================================
function translateToHebrew(text) {
  if (!text) return "";
  const lower = text.toLowerCase().trim();

  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];

  const words = lower.split(/[\s,.\-_/()]+/).filter(Boolean);

  // התאמה לצירופי 2-3 מילים
  for (let len = Math.min(3, words.length); len >= 2; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(" ");
      if (TRANSLATIONS[phrase]) {
        const before = words.slice(0, i).map(w => TRANSLATIONS[w] || "").filter(Boolean);
        const after = words.slice(i + len).map(w => TRANSLATIONS[w] || "").filter(Boolean);
        return [TRANSLATIONS[phrase], ...after, ...before].join(" ").trim();
      }
    }
  }

  // תרגום מילה-מילה
  const translated = words.map(w => TRANSLATIONS[w] || "").filter(Boolean);
  if (translated.length === 0) return "";
  if (translated.length === 1) return translated[0];

  return [translated[translated.length - 1], ...translated.slice(0, -1)].join(" ");
}

function detectHebrewCategory(offProduct) {
  const tags = (offProduct.categories_tags || []).map(t => t.toLowerCase());
  for (const cat of CATEGORIES) {
    if (tags.includes(cat.tag)) {
      return cat.he;
    }
  }
  // נסיון שני - חיפוש חלקי
  for (const cat of CATEGORIES) {
    const tagShort = cat.tag.replace("en:", "").replace(/-/g, "");
    if (tags.some(t => t.replace("en:", "").replace(/-/g, "").includes(tagShort))) {
      return cat.he;
    }
  }
  return "כללי";
}

async function fetchJson(url) {
  const cached = getCached(url);
  if (cached) return cached;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT }
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  setCached(url, data);
  return data;
}

async function fetchRealPrices(barcode) {
  if (!barcode) return [];
  try {
    const url = `${PRICES_BASE_URL}/prices?product_code=${encodeURIComponent(barcode)}&size=20`;
    const data = await fetchJson(url);

    return (data.items || []).map(p => ({
      storeName: extractStoreName(p),
      priceILS: convertToILS(parseFloat(p.price) || 0, p.currency)
    })).filter(p => p.priceILS > 0);
  } catch (err) {
    return [];
  }
}

function extractStoreName(priceObj) {
  const loc = priceObj.location;
  if (loc?.osm_brand) return loc.osm_brand.toLowerCase();
  if (loc?.osm_name) return loc.osm_name.toLowerCase();
  return "";
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function baselinePrice(productId, categoryHe) {
  const seed = hashCode(productId);
  switch (categoryHe) {
    case "בשר ודגים":      return 35 + (seed % 80);
    case "מוצרי חלב":      return 8 + (seed % 25);
    case "פירות":          return 7 + (seed % 18);
    case "ירקות":          return 5 + (seed % 15);
    case "שתייה":          return 6 + (seed % 30);
    case "חטיפים ומתוקים": return 5 + (seed % 20);
    case "פחמימות":        return 7 + (seed % 18);
    case "ביצים ודגנים":   return 8 + (seed % 22);
    default:               return 10 + (seed % 25);
  }
}

function buildPrices(realPrices, productId, categoryHe) {
  const prices = {};

  for (const real of realPrices) {
    for (const [foreign, israeliKey] of Object.entries(STORE_MAPPING)) {
      if (real.storeName.includes(foreign) && !prices[israeliKey]) {
        prices[israeliKey] = Math.round(real.priceILS * 10) / 10;
        break;
      }
    }
  }

  let avgPrice;
  if (realPrices.length > 0) {
    avgPrice = realPrices.reduce((s, p) => s + p.priceILS, 0) / realPrices.length;
  } else {
    avgPrice = baselinePrice(productId, categoryHe);
  }

  const seed = hashCode(productId);
  Object.keys(STORE_NAMES).forEach((storeKey, idx) => {
    if (!prices[storeKey]) {
      const variation = ((seed + idx * 31) % 25) - 12;
      const price = avgPrice * (1 + variation / 100);
      prices[storeKey] = Math.round(price * 10) / 10;
    }
  });

  return prices;
}

// ============================================================
//  המרת מוצר OFF -> פורמט פנימי
//  שיפור: סינון מוצרים שלא הצלחנו לתרגם / יש בהם סינית
// ============================================================
async function offToProduct(offProduct) {
  // נסיון להשיג שם באנגלית בלבד
  let englishName = "";
  const candidates = [
    offProduct.product_name_en,
    offProduct.product_name,
    offProduct.generic_name_en,
    offProduct.generic_name
  ];
  for (const name of candidates) {
    if (name && isEnglishOnly(name)) {
      englishName = name;
      break;
    }
  }

  // אם לא מצאנו שם באנגלית - מדלגים על המוצר
  if (!englishName) return null;

  // תרגום
  const translatedTitle = translateToHebrew(englishName).trim().slice(0, 60);

  // אם התרגום לא הצליח - מדלגים (לא רוצים אנגלית באפליקציה)
  if (!translatedTitle) return null;

  const category = detectHebrewCategory(offProduct);
  const quantity = translateQuantity(offProduct.quantity);
  const id = String(offProduct.code || hashCode(englishName));

  const realPrices = await fetchRealPrices(id);
  const prices = buildPrices(realPrices, id, category);

  return { id, title: translatedTitle, category, quantity, prices };
}

function toApiFormat(product) {
  return {
    id: product.id,
    title: product.title,
    description: "",
    category: product.category,
    imageRes: 0,
    videoUrl: "",
    quantity: product.quantity,
    isChecked: false,
    addedBy: "api",
    timestamp: Date.now(),
    isSelected: false,
    isPurchased: false,
    storePrices: Object.entries(product.prices).map(([key, price]) => ({
      storeName: STORE_NAMES[key],
      price: price
    }))
  };
}

// ============================================================
//  שליפה לפי קטגוריה - גדול יותר כדי לקבל מספיק מוצרים אחרי סינון
// ============================================================
async function fetchByCategory(offCategoryTag, pageSize = 30) {
  const fields = "code,product_name,product_name_en,generic_name,generic_name_en,quantity,categories_tags";
  // משתמשים ב-tag שמתחיל ב-en: לדיוק
  const tagOnly = offCategoryTag.replace("en:", "");
  const url = `${OFF_BASE_URL}/api/v2/search?categories_tags_en=${encodeURIComponent(tagOnly)}` +
              `&fields=${fields}&page_size=${pageSize}&sort_by=popularity_key`;
  const data = await fetchJson(url);

  const items = await Promise.all(
    (data.products || []).map(p => offToProduct(p).catch(() => null))
  );

  return items.filter(p => p !== null);
}

async function fetchAllProducts() {
  const cached = getCached("ALL");
  if (cached) return cached;

  const all = [];
  const seen = new Set();

  for (const cat of CATEGORIES) {
    try {
      const products = await fetchByCategory(cat.tag, 25);
      for (const p of products) {
        if (!seen.has(p.id) && p.title) {
          seen.add(p.id);
          if (p.category === "כללי") p.category = cat.he;
          all.push(p);
        }
      }
    } catch (err) {
      console.error(`Failed: ${cat.tag}:`, err.message);
    }
  }

  setCached("ALL", all);
  return all;
}

// ============================================================
//  Endpoints
// ============================================================

app.get("/", (req, res) => {
  res.json({
    name: "Shoply API",
    version: "2.1.0",
    description: "Powered by Open Food Facts + Open Prices",
    sources: {
      products: "https://world.openfoodfacts.org/",
      prices: "https://prices.openfoodfacts.org/"
    },
    endpoints: [
      "GET /products",
      "GET /products?category=<קטגוריה>",
      "GET /products?search=<חיפוש>",
      "GET /products/:id",
      "GET /categories"
    ]
  });
});

app.get("/products", async (req, res) => {
  try {
    let products = await fetchAllProducts();

    if (req.query.category) {
      products = products.filter(p => p.category === req.query.category);
    }

    // ============================================================
    //  חיפוש משופר - בעברית ובאנגלית
    //  מחפשים גם בכותרת וגם בקטגוריה, וגם תמיכה בכמה מילים
    // ============================================================
    if (req.query.search) {
      const search = req.query.search.toLowerCase().trim();
      const searchWords = search.split(/\s+/);

      products = products.filter(p => {
        const title = (p.title || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        // התאמה אם כל מילה בחיפוש מופיעה בכותרת או בקטגוריה
        return searchWords.every(w => title.includes(w) || category.includes(w));
      });
    }

    res.json(products.map(toApiFormat));
  } catch (err) {
    console.error("Error /products:", err);
    res.status(500).json({ error: "שגיאה בקבלת המוצרים" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const fields = "code,product_name,product_name_en,generic_name,generic_name_en,quantity,categories_tags";
    const url = `${OFF_BASE_URL}/api/v2/product/${encodeURIComponent(id)}?fields=${fields}`;
    const data = await fetchJson(url);

    if (data.status !== 1 || !data.product) {
      const all = await fetchAllProducts();
      const found = all.find(p => p.id === id);
      if (found) return res.json(toApiFormat(found));
      return res.status(404).json({ error: "מוצר לא נמצא" });
    }

    const product = await offToProduct(data.product);
    if (!product) {
      return res.status(404).json({ error: "מוצר לא נמצא" });
    }
    res.json(toApiFormat(product));
  } catch (err) {
    console.error("Error /products/:id:", err);
    res.status(500).json({ error: "שגיאה בקבלת המוצר" });
  }
});

app.get("/categories", (req, res) => {
  res.json(ALL_CATEGORIES_HE);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Shoply API v2.1 running on port ${PORT}`);
  console.log(`✓ Powered by Open Food Facts + Open Prices`);
});
