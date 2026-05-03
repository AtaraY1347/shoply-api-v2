const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ============================================================
//  Shoply API v3 - גישה חכמה:
//  1. טעינה ברקע של מוצרים מ-OFF (ראשית בלי לחסום)
//  2. מחירים מ-Open Prices רק לפי בקשה
//  3. דדופליקציה לפי שם המוצר (לא רק לפי id)
//  4. Rate limiting פנימי - בקשה אחת בשנייה
// ============================================================

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const PRICES_BASE_URL = "https://prices.openfoodfacts.org/api/v1";
const USER_AGENT = "ShoplyApp/3.0";

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
//  קטגוריות - גישה אחרת: search_terms במקום categories_tags
//  זה נותן יותר תוצאות ופחות נכשל
// ============================================================
const CATEGORIES = [
  { search: "eggs",        en: "Eggs",                 he: "ביצים ודגנים" },
  { search: "cereal",      en: "Breakfast cereals",    he: "ביצים ודגנים" },
  { search: "rice",        en: "Rice",                 he: "פחמימות" },
  { search: "pasta",       en: "Pasta",                he: "פחמימות" },
  { search: "bread",       en: "Bread",                he: "פחמימות" },
  { search: "lentils",     en: "Legumes",              he: "פחמימות" },
  { search: "vegetables",  en: "Vegetables",           he: "ירקות" },
  { search: "tomato",      en: "Tomatoes",             he: "ירקות" },
  { search: "fruits",      en: "Fruits",               he: "פירות" },
  { search: "apple",       en: "Apples",               he: "פירות" },
  { search: "chicken",     en: "Chicken",              he: "בשר ודגים" },
  { search: "beef",        en: "Beef",                 he: "בשר ודגים" },
  { search: "salmon",      en: "Salmon",               he: "בשר ודגים" },
  { search: "tuna",        en: "Tuna",                 he: "בשר ודגים" },
  { search: "milk",        en: "Milk",                 he: "מוצרי חלב" },
  { search: "cheese",      en: "Cheese",               he: "מוצרי חלב" },
  { search: "yogurt",      en: "Yogurt",               he: "מוצרי חלב" },
  { search: "butter",      en: "Butter",               he: "מוצרי חלב" },
  { search: "water",       en: "Water",                he: "שתייה" },
  { search: "juice",       en: "Juice",                he: "שתייה" },
  { search: "soda",        en: "Soda",                 he: "שתייה" },
  { search: "tea",         en: "Tea",                  he: "שתייה" },
  { search: "coffee",      en: "Coffee",               he: "שתייה" },
  { search: "chips",       en: "Chips",                he: "חטיפים ומתוקים" },
  { search: "chocolate",   en: "Chocolate",            he: "חטיפים ומתוקים" },
  { search: "cookies",     en: "Cookies",              he: "חטיפים ומתוקים" },
  { search: "ice cream",   en: "Ice cream",            he: "חטיפים ומתוקים" }
];

const ALL_CATEGORIES_HE = [...new Set(CATEGORIES.map(c => c.he))];

// ============================================================
//  מילון תרגום
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
  "fusilli": "פוסילי", "noodles": "אטריות",
  "couscous": "קוסקוס", "bulgur": "בורגול", "quinoa": "קינואה",
  "lentils": "עדשים", "chickpeas": "חומוס", "beans": "שעועית",
  "bread": "לחם", "pita": "פיתה", "buns": "לחמניות",
  // ירקות
  "potato": "תפוח אדמה", "potatoes": "תפוח אדמה",
  "sweet potato": "בטטה", "onion": "בצל", "garlic": "שום",
  "tomato": "עגבנייה", "tomatoes": "עגבניות",
  "cherry tomato": "עגבניות שרי", "cucumber": "מלפפון",
  "pepper": "פלפל", "peppers": "פלפלים",
  "carrot": "גזר", "carrots": "גזרים", "lettuce": "חסה",
  "cabbage": "כרוב", "cauliflower": "כרובית", "broccoli": "ברוקולי",
  "zucchini": "קישוא", "eggplant": "חציל",
  "parsley": "פטרוזיליה", "coriander": "כוסברה", "mint": "נענע",
  "mushroom": "פטרייה", "mushrooms": "פטריות",
  "corn": "תירס", "spinach": "תרד",
  "vegetables": "ירקות",
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
  "fruits": "פירות",
  // בשר ודגים
  "chicken": "עוף", "breast": "חזה", "thighs": "שוקיים",
  "wings": "כנפיים",
  "beef": "בקר", "ground": "טחון", "ground beef": "בקר טחון",
  "entrecote": "אנטריקוט", "fillet": "פילה", "steak": "סטייק",
  "lamb": "כבש", "burger": "המבורגר", "hamburger": "המבורגר",
  "sausage": "נקניק", "sausages": "נקניקיות",
  "salmon": "סלמון", "smoked": "מעושן",
  "tuna": "טונה", "tilapia": "אמנון", "fish": "דג",
  // חלב
  "milk": "חלב", "soy": "סויה", "almond": "שקדים",
  "cheese": "גבינה", "cottage": "קוטג'", "feta": "פטה",
  "mozzarella": "מוצרלה", "gouda": "גאודה", "emmental": "אמנטל",
  "parmesan": "פרמזן", "cheddar": "צ'דר",
  "yogurt": "יוגורט", "greek": "יווני",
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
//  תרגום יחידות מידה
// ============================================================
function translateQuantity(quantity) {
  if (!quantity) return "יחידה";
  let t = String(quantity);
  t = t.replace(/(\d+\.?\d*)\s*ml\b/gi, "$1 מ\"ל");
  t = t.replace(/(\d+\.?\d*)\s*kg\b/gi, "$1 ק\"ג");
  t = t.replace(/(\d+\.?\d*)\s*g\b/gi, "$1 גרם");
  t = t.replace(/(\d+\.?\d*)\s*l\b/gi, "$1 ליטר");
  t = t.replace(/\bunits?\b/gi, "יח'");
  t = t.replace(/\bpieces?\b/gi, "יח'");
  t = t.replace(/\bpack\b/gi, "מארז");
  return t.trim();
}

const CURRENCY_TO_ILS = { "EUR": 4.0, "USD": 3.7, "GBP": 4.7, "ILS": 1.0, "CHF": 4.2 };

function convertToILS(price, currency) {
  return price * (CURRENCY_TO_ILS[currency?.toUpperCase()] || 4.0);
}

// ============================================================
//  Cache - שני סוגים: מוצרים (ארוך) ומחירים (קצר)
// ============================================================
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

// ============================================================
//  בדיקת אנגלית בלבד
// ============================================================
function isEnglishOnly(text) {
  if (!text || text.length < 2) return false;
  const nonLatin = /[\u4e00-\u9fff\u3040-\u30ff\u0590-\u05ff\u0600-\u06ff\u0400-\u04ff]/;
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
//  Fetch בסיסי
// ============================================================
async function fetchJson(url) {
  const cached = getCached(url);
  if (cached) return cached;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000)  // 15 שניות timeout
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  const data = await response.json();
  setCached(url, data);
  return data;
}

// ============================================================
//  hash code לחישוב מחירים עקביים
// ============================================================
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// ============================================================
//  מחיר בסיס לפי קטגוריה
// ============================================================
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

// ============================================================
//  בניית מחירי סופרים - בלי לפנות ל-Open Prices
//  (זה היה איטי מדי וחסם את הקטגוריות האחרות)
//  במקום זה - מחיר בסיס לפי קטגוריה + וריאציה
// ============================================================
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
//  המרת מוצר - ללא בקשת מחירים (סינכרוני, מהיר)
// ============================================================
function offToProduct(offProduct, categoryHe) {
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

  const translatedTitle = translateToHebrew(englishName).trim().slice(0, 60);
  if (!translatedTitle) return null;

  const quantity = translateQuantity(offProduct.quantity);
  const id = String(offProduct.code || hashCode(englishName));

  const prices = buildPrices(id, categoryHe);

  return { id, title: translatedTitle, category: categoryHe, quantity, prices };
}

// ============================================================
//  שליפת מוצרים לקטגוריה - עם sleep בין בקשות (rate limiting)
// ============================================================
async function fetchByCategory(categoryDef) {
  const fields = "code,product_name,product_name_en,generic_name,generic_name_en,quantity";
  // משתמשים בחיפוש פשוט במקום categories_tags - יותר עמיד
  const url = `${OFF_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(categoryDef.search)}` +
              `&search_simple=1&action=process&json=1&page_size=20&fields=${fields}`;

  try {
    const data = await fetchJson(url);
    const items = (data.products || [])
      .map(p => offToProduct(p, categoryDef.he))
      .filter(p => p !== null);
    return items;
  } catch (err) {
    console.error(`Failed [${categoryDef.search}]:`, err.message);
    return [];
  }
}

// ============================================================
//  השהיה
// ============================================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
//  שליפת כל המוצרים - עם rate limiting
// ============================================================
async function fetchAllProducts() {
  const cached = getCached("ALL");
  if (cached) return cached;

  const all = [];
  const seenTitles = new Set(); // דדופליקציה לפי כותרת בעברית
  const seenIds = new Set();

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const products = await fetchByCategory(cat);

    for (const p of products) {
      // דדופליקציה לפי כותרת + לפי id
      const titleKey = p.title.toLowerCase().trim();
      if (!seenTitles.has(titleKey) && !seenIds.has(p.id)) {
        seenTitles.add(titleKey);
        seenIds.add(p.id);
        all.push(p);
      }
    }

    // השהיה בין בקשות - 7 לדקה כדי להישאר תחת המגבלה של 10/דקה
    if (i < CATEGORIES.length - 1) {
      await sleep(8500); // 8.5 שניות בין בקשות = ~7/דקה
    }
  }

  console.log(`✓ Loaded ${all.length} unique products`);
  setCached("ALL", all);
  return all;
}

// ============================================================
//  טעינה ברקע - מתחיל ברגע שהשרת עולה
// ============================================================
let initialLoadPromise = null;

function startInitialLoad() {
  if (!initialLoadPromise) {
    console.log("→ Starting background load...");
    initialLoadPromise = fetchAllProducts().catch(err => {
      console.error("Background load failed:", err.message);
      initialLoadPromise = null;
    });
  }
  return initialLoadPromise;
}

// ============================================================
//  המרה לפורמט שהאפליקציה מצפה
// ============================================================
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
//  Endpoints
// ============================================================

app.get("/", (req, res) => {
  res.json({
    name: "Shoply API",
    version: "3.0.0",
    description: "Powered by Open Food Facts",
    sources: { products: "https://world.openfoodfacts.org/" },
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

    // סינון לפי קטגוריה
    if (req.query.category) {
      products = products.filter(p => p.category === req.query.category);
    }

    // חיפוש - בעברית או אנגלית, גם בכותרת וגם בקטגוריה
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
  console.log(`✓ Shoply API v3 running on port ${PORT}`);
  console.log(`✓ Powered by Open Food Facts`);
  // התחל לטעון מוצרים ברקע - כך שהבקשה הראשונה תהיה מהירה
  startInitialLoad();
});
