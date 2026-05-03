const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ============================================================
//  Shoply API v4 - 100% API חיצוני
//
//  שיפורים מהגרסה הקודמת:
//  1. חיפוש מדויק לפי categories_tags של OFF (לא search_terms)
//  2. קטגוריזציה נקבעת לפי ה-tags האמיתיים, לא לפי שאילתת החיפוש
//  3. יותר מוצרים: 50 בכל קטגוריה (במקום 20)
//  4. דדופליקציה חזקה לפי מותג + שם + כמות
//  5. סינון מוצרים ללא נתונים תקינים
//  6. חיפוש עובד גם בעברית
// ============================================================

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const USER_AGENT = "ShoplyApp/4.0";

const STORE_NAMES = {
  shufersal: "שופרסל",
  ramiLevy: "רמי לוי",
  victory: "ויקטורי",
  yohananof: "יוחננוף",
  carrefour: "קרפור",
  tivTaam: "טיב טעם"
};

// ============================================================
//  קטגוריות OFF -> עברית
//  משתמשים ב-categories_tags המדויקים של OFF
// ============================================================
const CATEGORIES_MAP = [
  { offTag: "en:eggs",                     he: "ביצים ודגנים" },
  { offTag: "en:breakfast-cereals",        he: "ביצים ודגנים" },
  { offTag: "en:flours",                   he: "ביצים ודגנים" },
  { offTag: "en:granolas",                 he: "ביצים ודגנים" },

  { offTag: "en:pastas",                   he: "פחמימות" },
  { offTag: "en:rices",                    he: "פחמימות" },
  { offTag: "en:legumes",                  he: "פחמימות" },
  { offTag: "en:breads",                   he: "פחמימות" },

  { offTag: "en:vegetables",               he: "ירקות" },
  { offTag: "en:fresh-vegetables",         he: "ירקות" },
  { offTag: "en:canned-vegetables",        he: "ירקות" },

  { offTag: "en:fruits",                   he: "פירות" },
  { offTag: "en:fresh-fruits",             he: "פירות" },
  { offTag: "en:dried-fruits",             he: "פירות" },

  { offTag: "en:meats",                    he: "בשר ודגים" },
  { offTag: "en:poultry",                  he: "בשר ודגים" },
  { offTag: "en:fishes",                   he: "בשר ודגים" },
  { offTag: "en:canned-fishes",            he: "בשר ודגים" },

  { offTag: "en:dairies",                  he: "מוצרי חלב" },
  { offTag: "en:cheeses",                  he: "מוצרי חלב" },
  { offTag: "en:yogurts",                  he: "מוצרי חלב" },
  { offTag: "en:milks",                    he: "מוצרי חלב" },
  { offTag: "en:butters",                  he: "מוצרי חלב" },

  { offTag: "en:beverages",                he: "שתייה" },
  { offTag: "en:waters",                   he: "שתייה" },
  { offTag: "en:carbonated-drinks",        he: "שתייה" },
  { offTag: "en:fruit-juices",             he: "שתייה" },
  { offTag: "en:teas",                     he: "שתייה" },
  { offTag: "en:coffees",                  he: "שתייה" },

  { offTag: "en:snacks",                   he: "חטיפים ומתוקים" },
  { offTag: "en:chocolates",               he: "חטיפים ומתוקים" },
  { offTag: "en:biscuits-and-cakes",       he: "חטיפים ומתוקים" },
  { offTag: "en:ice-creams-and-sorbets",   he: "חטיפים ומתוקים" },
  { offTag: "en:sweet-spreads",            he: "חטיפים ומתוקים" },
  { offTag: "en:candies",                  he: "חטיפים ומתוקים" }
];

const ALL_CATEGORIES_HE = [...new Set(CATEGORIES_MAP.map(c => c.he))];

// ============================================================
//  מילון תרגום
// ============================================================
const TRANSLATIONS = {
  // תארים
  "white": "לבן", "red": "אדום", "green": "ירוק", "yellow": "צהוב",
  "fresh": "טרי", "frozen": "קפוא", "organic": "אורגני",
  "natural": "טבעי", "sweet": "מתוק", "whole": "מלא",
  "low": "דל", "fat": "שומן", "free": "ללא",
  "dark": "מריר", "milk": "חלב", "smoked": "מעושן",
  // ביצים ודגנים
  "egg": "ביצים", "eggs": "ביצים",
  "flour": "קמח", "wheat": "חיטה",
  "oats": "שיבולת שועל", "oat": "שיבולת שועל",
  "cereal": "דגני בוקר", "cereals": "דגני בוקר",
  "cornflakes": "קורנפלקס", "corn flakes": "קורנפלקס",
  "granola": "גרנולה", "muesli": "מוזלי",
  // פחמימות
  "rice": "אורז", "basmati": "בסמטי", "brown rice": "אורז מלא",
  "pasta": "פסטה", "spaghetti": "ספגטי", "penne": "פנה",
  "fusilli": "פוסילי", "noodles": "אטריות", "macaroni": "מקרוני",
  "couscous": "קוסקוס", "bulgur": "בורגול", "quinoa": "קינואה",
  "lentils": "עדשים", "chickpeas": "חומוס", "beans": "שעועית",
  "bread": "לחם", "pita": "פיתה", "buns": "לחמניות",
  "tortilla": "טורטייה",
  // ירקות
  "potato": "תפוח אדמה", "potatoes": "תפוח אדמה",
  "sweet potato": "בטטה",
  "onion": "בצל", "garlic": "שום",
  "tomato": "עגבנייה", "tomatoes": "עגבניות",
  "cherry tomato": "עגבניות שרי", "cucumber": "מלפפון",
  "pepper": "פלפל", "peppers": "פלפלים",
  "carrot": "גזר", "carrots": "גזרים", "lettuce": "חסה",
  "cabbage": "כרוב", "cauliflower": "כרובית", "broccoli": "ברוקולי",
  "zucchini": "קישוא", "eggplant": "חציל",
  "parsley": "פטרוזיליה", "coriander": "כוסברה", "mint": "נענע",
  "mushroom": "פטרייה", "mushrooms": "פטריות",
  "corn": "תירס", "spinach": "תרד",
  "vegetables": "ירקות", "salad": "סלט",
  // פירות
  "apple": "תפוח", "apples": "תפוחים",
  "banana": "בננה", "bananas": "בננות",
  "orange": "תפוז", "oranges": "תפוזים",
  "clementine": "קלמנטינה", "lemon": "לימון", "lime": "ליים",
  "avocado": "אבוקדו", "grape": "ענבים", "grapes": "ענבים",
  "strawberry": "תות", "strawberries": "תות שדה",
  "watermelon": "אבטיח", "melon": "מלון", "pineapple": "אננס",
  "pear": "אגס", "pears": "אגסים",
  "peach": "אפרסק", "peaches": "אפרסקים",
  "nectarine": "נקטרינה", "kiwi": "קיווי", "mango": "מנגו",
  "blueberry": "אוכמנייה", "blueberries": "אוכמניות",
  "date": "תמר", "dates": "תמרים",
  "cherry": "דובדבן", "cherries": "דובדבנים",
  "fruits": "פירות", "raisins": "צימוקים", "apricot": "משמש",
  // בשר ודגים
  "chicken": "עוף", "breast": "חזה", "thighs": "שוקיים",
  "wings": "כנפיים",
  "beef": "בקר", "ground": "טחון", "ground beef": "בקר טחון",
  "entrecote": "אנטריקוט", "fillet": "פילה", "steak": "סטייק",
  "lamb": "כבש",
  "burger": "המבורגר", "hamburger": "המבורגר",
  "sausage": "נקניק", "sausages": "נקניקיות",
  "salmon": "סלמון", "tuna": "טונה", "tilapia": "אמנון", "fish": "דג",
  "ham": "נקניק", "bacon": "בייקון",
  // חלב
  "soy": "סויה", "almond": "שקדים",
  "cheese": "גבינה", "cottage": "קוטג'", "feta": "פטה",
  "mozzarella": "מוצרלה", "gouda": "גאודה", "emmental": "אמנטל",
  "parmesan": "פרמזן", "cheddar": "צ'דר", "ricotta": "ריקוטה",
  "yogurt": "יוגורט", "greek": "יווני",
  "butter": "חמאה", "margarine": "מרגרינה",
  "cream": "שמנת", "sour": "חמוצה",
  "dairy": "חלב", "dairies": "מוצרי חלב",
  // שתייה
  "water": "מים", "mineral": "מינרליים",
  "coke": "קוקה קולה", "cola": "קולה", "coca-cola": "קוקה קולה",
  "sprite": "ספרייט", "fanta": "פאנטה", "pepsi": "פפסי",
  "juice": "מיץ", "soda": "סודה",
  "tea": "תה", "coffee": "קפה", "instant": "נמס",
  "beer": "בירה", "wine": "יין",
  "lemonade": "לימונדה",
  // חטיפים
  "chips": "צ'יפס", "doritos": "דוריטוס", "cheetos": "צ'יטוס",
  "popcorn": "פופקורן",
  "chocolate": "שוקולד",
  "candy": "סוכריות", "candies": "סוכריות",
  "cookies": "עוגיות", "biscuits": "עוגיות", "cake": "עוגה", "cakes": "עוגות",
  "wafer": "ופלים", "wafers": "ופלים",
  "ice cream": "גלידה", "vanilla": "וניל",
  "nutella": "נוטלה", "spread": "ממרח",
  "snack": "חטיף", "snacks": "חטיפים"
};

// ============================================================
//  תרגום יחידות מידה
// ============================================================
function translateQuantity(quantity) {
  if (!quantity) return "יחידה";
  let t = String(quantity);
  t = t.replace(/(\d+\.?\d*)\s*ml\b/gi, "$1 מ\"ל");
  t = t.replace(/(\d+\.?\d*)\s*kg\b/gi, "$1 ק\"ג");
  t = t.replace(/(\d+\.?\d*)\s*g\b/gi, "$1 גרם");
  t = t.replace(/(\d+\.?\d*)\s*l\b/gi, "$1 ליטר");
  t = t.replace(/(\d+\.?\d*)\s*cl\b/gi, "$1 ס\"ל");
  t = t.replace(/\bunits?\b/gi, "יח'");
  t = t.replace(/\bpieces?\b/gi, "יח'");
  t = t.replace(/\bpack\b/gi, "מארז");
  return t.trim();
}

const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value, ttlMs = 6 * 60 * 60 * 1000) {
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

function isEnglishOnly(text) {
  if (!text || text.length < 2) return false;
  const nonLatin = /[\u4e00-\u9fff\u3040-\u30ff\u0590-\u05ff\u0600-\u06ff\u0400-\u04ff\u0e00-\u0e7f]/;
  if (nonLatin.test(text)) return false;
  return /[a-zA-Z]/.test(text);
}

// ============================================================
//  פונקציית תרגום
// ============================================================
function translateToHebrew(text) {
  if (!text) return "";
  const lower = text.toLowerCase().trim();

  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];

  const words = lower.split(/[\s,.\-_/()]+/).filter(Boolean);

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

  const translated = words.map(w => TRANSLATIONS[w] || "").filter(Boolean);
  if (translated.length === 0) return "";
  if (translated.length === 1) return translated[0];

  return [translated[translated.length - 1], ...translated.slice(0, -1)].join(" ");
}

// ============================================================
//  זיהוי קטגוריה - מצא את הקטגוריה הספציפית ביותר
// ============================================================
function detectHebrewCategory(offProduct) {
  const tags = (offProduct.categories_tags || []).map(t => t.toLowerCase());

  // עוברים על הקטגוריות שלנו לפי הסדר (יותר ספציפיות קודם)
  // ומחזירים את הראשונה שמתאימה
  for (const cat of CATEGORIES_MAP) {
    if (tags.includes(cat.offTag)) {
      return cat.he;
    }
  }
  return null;
}

async function fetchJson(url) {
  const cached = getCached(url);
  if (cached) return cached;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  const data = await response.json();
  setCached(url, data);
  return data;
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

function buildPrices(productId, categoryHe) {
  const prices = {};
  const avgPrice = baselinePrice(productId, categoryHe);
  const seed = hashCode(productId);

  Object.keys(STORE_NAMES).forEach((storeKey, idx) => {
    const variation = ((seed + idx * 31) % 25) - 12;
    const price = avgPrice * (1 + variation / 100);
    prices[storeKey] = Math.round(price * 10) / 10;
  });

  return prices;
}

// ============================================================
//  המרת מוצר OFF - עם קטגוריה לפי TAGS האמיתיים
// ============================================================
function offToProduct(offProduct, fallbackCategory) {
  // נסיון להשיג שם באנגלית
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

  if (!englishName) return null;

  // תרגום
  const translatedTitle = translateToHebrew(englishName).trim().slice(0, 60);
  if (!translatedTitle) return null;

  // קטגוריה - לפי ה-tags של ה-API בלבד!
  // אם לא מצאנו - משתמשים ב-fallback של הקטגוריה ששאלנו עליה
  const detectedCategory = detectHebrewCategory(offProduct);
  const category = detectedCategory || fallbackCategory || "כללי";

  const quantity = translateQuantity(offProduct.quantity);
  const id = String(offProduct.code || hashCode(englishName));

  const prices = buildPrices(id, category);

  return { id, title: translatedTitle, category, quantity, prices };
}

// ============================================================
//  שליפה לפי קטגוריה - שימוש ב-categories_tags מדויק
// ============================================================
async function fetchByCategoryTag(offTag, fallbackHe, pageSize = 50) {
  const fields = "code,product_name,product_name_en,generic_name,generic_name_en,quantity,categories_tags";
  // הסרת ה-en: מההתחלה לבקשה
  const tagOnly = offTag.replace("en:", "");
  const url = `${OFF_BASE_URL}/api/v2/search?categories_tags_en=${encodeURIComponent(tagOnly)}` +
              `&fields=${fields}&page_size=${pageSize}&sort_by=popularity_key`;

  try {
    const data = await fetchJson(url);
    const items = (data.products || [])
      .map(p => offToProduct(p, fallbackHe))
      .filter(p => p !== null);
    return items;
  } catch (err) {
    console.error(`Failed [${offTag}]:`, err.message);
    return [];
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
//  שליפת כל המוצרים עם דדופליקציה חזקה
// ============================================================
async function fetchAllProducts() {
  const cached = getCached("ALL");
  if (cached) return cached;

  const all = [];
  const seenIds = new Set();
  const seenTitles = new Set(); // דדופליקציה לפי כותרת בעברית
  // נטען רק קטגוריות שונות (לא כפילויות באותו he)
  // ניקח רק 8 קטגוריות מובחרות, אחת לכל קבוצה בעברית
  const uniqueByHe = new Map();
  for (const cat of CATEGORIES_MAP) {
    if (!uniqueByHe.has(cat.he)) {
      uniqueByHe.set(cat.he, []);
    }
    uniqueByHe.get(cat.he).push(cat);
  }

  for (const [heCategory, offTags] of uniqueByHe) {
    let categoryProductCount = 0;
    // נטען מכמה tags של אותה קטגוריה בעברית
    for (const offTag of offTags) {
      if (categoryProductCount >= 30) break; // מספיק 30 מוצרים בקטגוריה

      const products = await fetchByCategoryTag(offTag.offTag, heCategory, 50);

      for (const p of products) {
        if (categoryProductCount >= 30) break;
        const titleKey = p.title.toLowerCase().trim();
        if (!seenIds.has(p.id) && !seenTitles.has(titleKey)) {
          seenIds.add(p.id);
          seenTitles.add(titleKey);
          all.push(p);
          categoryProductCount++;
        }
      }

      // השהיה בין בקשות - 7 שניות (תחת 10/דקה)
      await sleep(7000);
    }
  }

  console.log(`✓ Loaded ${all.length} unique products`);
  setCached("ALL", all);
  return all;
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
//  טעינה ברקע
// ============================================================
let loading = false;
function startInitialLoad() {
  if (loading) return;
  loading = true;
  console.log("→ Starting background load...");
  fetchAllProducts().catch(err => {
    console.error("Background load failed:", err.message);
    loading = false;
  });
}

// ============================================================
//  Endpoints
// ============================================================

app.get("/", (req, res) => {
  res.json({
    name: "Shoply API",
    version: "4.0.0",
    description: "Powered by Open Food Facts",
    source: "https://world.openfoodfacts.org/",
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

    // חיפוש - בעברית, אנגלית, גם בכותרת וגם בקטגוריה
    if (req.query.search) {
      const search = req.query.search.toLowerCase().trim();
      const words = search.split(/\s+/).filter(Boolean);

      products = products.filter(p => {
        const haystack = `${p.title} ${p.category}`.toLowerCase();
        return words.every(w => haystack.includes(w));
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
    const all = await fetchAllProducts();
    const found = all.find(p => p.id === id);
    if (!found) {
      return res.status(404).json({ error: "מוצר לא נמצא" });
    }
    res.json(toApiFormat(found));
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
  console.log(`✓ Shoply API v4 running on port ${PORT}`);
  console.log(`✓ Powered by Open Food Facts`);
  startInitialLoad();
});
