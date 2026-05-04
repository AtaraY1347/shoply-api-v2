/*const express = require("express");
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
    { offTag: "en:eggs", he: "ביצים ודגנים" },
    { offTag: "en:breakfast-cereals", he: "ביצים ודגנים" },
    { offTag: "en:flours", he: "ביצים ודגנים" },
    { offTag: "en:granolas", he: "ביצים ודגנים" },

    { offTag: "en:pastas", he: "פחמימות" },
    { offTag: "en:rices", he: "פחמימות" },
    { offTag: "en:legumes", he: "פחמימות" },
    { offTag: "en:breads", he: "פחמימות" },

    { offTag: "en:vegetables", he: "ירקות" },
    { offTag: "en:fresh-vegetables", he: "ירקות" },
    { offTag: "en:canned-vegetables", he: "ירקות" },

    { offTag: "en:fruits", he: "פירות" },
    { offTag: "en:fresh-fruits", he: "פירות" },
    { offTag: "en:dried-fruits", he: "פירות" },

    { offTag: "en:meats", he: "בשר ודגים" },
    { offTag: "en:poultry", he: "בשר ודגים" },
    { offTag: "en:fishes", he: "בשר ודגים" },
    { offTag: "en:canned-fishes", he: "בשר ודגים" },

    { offTag: "en:dairies", he: "מוצרי חלב" },
    { offTag: "en:cheeses", he: "מוצרי חלב" },
    { offTag: "en:yogurts", he: "מוצרי חלב" },
    { offTag: "en:milks", he: "מוצרי חלב" },
    { offTag: "en:butters", he: "מוצרי חלב" },

    { offTag: "en:beverages", he: "שתייה" },
    { offTag: "en:waters", he: "שתייה" },
    { offTag: "en:carbonated-drinks", he: "שתייה" },
    { offTag: "en:fruit-juices", he: "שתייה" },
    { offTag: "en:teas", he: "שתייה" },
    { offTag: "en:coffees", he: "שתייה" },

    { offTag: "en:snacks", he: "חטיפים ומתוקים" },
    { offTag: "en:chocolates", he: "חטיפים ומתוקים" },
    { offTag: "en:biscuits-and-cakes", he: "חטיפים ומתוקים" },
    { offTag: "en:ice-creams-and-sorbets", he: "חטיפים ומתוקים" },
    { offTag: "en:sweet-spreads", he: "חטיפים ומתוקים" },
    { offTag: "en:candies", he: "חטיפים ומתוקים" }
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
        case "בשר ודגים": return 35 + (seed % 80);
        case "מוצרי חלב": return 8 + (seed % 25);
        case "פירות": return 7 + (seed % 18);
        case "ירקות": return 5 + (seed % 15);
        case "שתייה": return 6 + (seed % 30);
        case "חטיפים ומתוקים": return 5 + (seed % 20);
        case "פחמימות": return 7 + (seed % 18);
        case "ביצים ודגנים": return 8 + (seed % 22);
        default: return 10 + (seed % 25);
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
*/






 /*עובד לוקח מ2 API חיצוניים לשמות וקטגוריות רק המחירים לא מAPI חיצוני
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ============================================================
//  Shoply API v6 - שני APIs חיצוניים אמיתיים פעילים:
//
//  1. TheMealDB API (https://www.themealdb.com/)
//     מחזיר רכיבי מזון בסיסיים: ירקות, פירות, בשר, דגים
//     Endpoint: /api/json/v1/1/list.php?i=list
//
//  2. Open Food Facts API (https://world.openfoodfacts.org/)
//     מחזיר מוצרים ארוזים: חלב, שוקולד, יוגורט, חטיפים
//     Endpoint: /api/v2/search?categories_tags_en=...
//
//  שני ה-APIs חינמיים, ציבוריים, ללא צורך ב-API key
// ============================================================

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
const OFF_BASE = "https://world.openfoodfacts.org";
const USER_AGENT = "ShoplyApp/6.0";

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
// ============================================================
const OFF_CATEGORIES = [
    { offTag: "en:breakfast-cereals", he: "ביצים ודגנים" },
    { offTag: "en:flours", he: "ביצים ודגנים" },
    { offTag: "en:granolas", he: "ביצים ודגנים" },
    { offTag: "en:pastas", he: "פחמימות" },
    { offTag: "en:rices", he: "פחמימות" },
    { offTag: "en:legumes", he: "פחמימות" },
    { offTag: "en:breads", he: "פחמימות" },
    { offTag: "en:dairies", he: "מוצרי חלב" },
    { offTag: "en:cheeses", he: "מוצרי חלב" },
    { offTag: "en:yogurts", he: "מוצרי חלב" },
    { offTag: "en:milks", he: "מוצרי חלב" },
    { offTag: "en:butters", he: "מוצרי חלב" },
    { offTag: "en:carbonated-drinks", he: "שתייה" },
    { offTag: "en:fruit-juices", he: "שתייה" },
    { offTag: "en:waters", he: "שתייה" },
    { offTag: "en:teas", he: "שתייה" },
    { offTag: "en:coffees", he: "שתייה" },
    { offTag: "en:chocolates", he: "חטיפים ומתוקים" },
    { offTag: "en:biscuits-and-cakes", he: "חטיפים ומתוקים" },
    { offTag: "en:ice-creams-and-sorbets", he: "חטיפים ומתוקים" },
    { offTag: "en:sweet-spreads", he: "חטיפים ומתוקים" },
    { offTag: "en:candies", he: "חטיפים ומתוקים" },
    { offTag: "en:chips-and-fries", he: "חטיפים ומתוקים" }
];

const ALL_CATEGORIES_HE = [
    "ביצים ודגנים", "פחמימות", "ירקות", "פירות",
    "בשר ודגים", "מוצרי חלב", "שתייה", "חטיפים ומתוקים"
];

// ============================================================
//  מילון תרגום מאנגלית לעברית
//  משמש לתרגום שמות הרכיבים מ-TheMealDB ומוצרים מ-OFF
// ============================================================
const TRANSLATIONS = {
    // תארים
    "white": "לבן", "red": "אדום", "green": "ירוק", "yellow": "צהוב",
    "fresh": "טרי", "frozen": "קפוא", "organic": "אורגני",
    "natural": "טבעי", "sweet": "מתוק", "whole": "מלא",
    "low": "דל", "fat": "שומן", "free": "ללא",
    "dark": "מריר", "smoked": "מעושן",
    "baby": "תינוק", "wild": "בר", "raw": "טבעי",

    // ירקות (חשוב לתרגום מ-TheMealDB)
    "potato": "תפוח אדמה", "potatoes": "תפוחי אדמה",
    "sweet potato": "בטטה", "sweet potatoes": "בטטות",
    "onion": "בצל", "onions": "בצל",
    "red onion": "בצל סגול", "spring onion": "בצל ירוק",
    "shallot": "שאלוט", "leek": "כרישה",
    "garlic": "שום", "garlic clove": "שן שום",
    "tomato": "עגבנייה", "tomatoes": "עגבניות",
    "cherry tomatoes": "עגבניות שרי",
    "cucumber": "מלפפון", "cucumbers": "מלפפונים",
    "pepper": "פלפל", "peppers": "פלפלים",
    "red pepper": "פלפל אדום", "green pepper": "פלפל ירוק",
    "yellow pepper": "פלפל צהוב", "bell pepper": "פלפל",
    "chili": "צ'ילי", "chilli": "צ'ילי", "chili pepper": "פלפל חריף",
    "carrot": "גזר", "carrots": "גזרים",
    "lettuce": "חסה", "iceberg lettuce": "חסה אייסברג",
    "cabbage": "כרוב", "red cabbage": "כרוב אדום",
    "cauliflower": "כרובית", "broccoli": "ברוקולי",
    "zucchini": "קישוא", "courgette": "קישוא",
    "eggplant": "חציל", "aubergine": "חציל",
    "parsley": "פטרוזיליה", "coriander": "כוסברה", "cilantro": "כוסברה",
    "mint": "נענע", "basil": "בזיליקום", "thyme": "טימין",
    "rosemary": "רוזמרין", "oregano": "אורגנו", "dill": "שמיר",
    "sage": "מרווה", "bay leaf": "עלה דפנה", "bay leaves": "עלי דפנה",
    "mushroom": "פטרייה", "mushrooms": "פטריות",
    "spinach": "תרד", "kale": "קייל", "rocket": "רוקט", "arugula": "רוקט",
    "corn": "תירס", "sweetcorn": "תירס מתוק",
    "celery": "סלרי", "asparagus": "אספרגוס",
    "artichoke": "ארטישוק", "okra": "במיה",
    "ginger": "ג'ינג'ר", "turmeric": "כורכום",
    "beetroot": "סלק", "beet": "סלק", "radish": "צנון", "turnip": "לפת",
    "peas": "אפונה", "green peas": "אפונה ירוקה",
    "green beans": "שעועית ירוקה", "olives": "זיתים",

    // פירות (חשוב לתרגום מ-TheMealDB)
    "apple": "תפוח", "apples": "תפוחים",
    "green apple": "תפוח ירוק", "red apple": "תפוח אדום",
    "banana": "בננה", "bananas": "בננות",
    "orange": "תפוז", "oranges": "תפוזים",
    "clementine": "קלמנטינה", "mandarin": "מנדרינה",
    "lemon": "לימון", "lemons": "לימונים",
    "lime": "ליים", "limes": "ליים",
    "grapefruit": "אשכולית",
    "avocado": "אבוקדו", "avocados": "אבוקדו",
    "grape": "ענבים", "grapes": "ענבים",
    "strawberry": "תות", "strawberries": "תות שדה",
    "watermelon": "אבטיח", "melon": "מלון",
    "pineapple": "אננס", "pear": "אגס", "pears": "אגסים",
    "peach": "אפרסק", "peaches": "אפרסקים",
    "nectarine": "נקטרינה", "kiwi": "קיווי", "mango": "מנגו",
    "blueberry": "אוכמנייה", "blueberries": "אוכמניות",
    "raspberry": "פטל", "raspberries": "פטל",
    "blackberry": "פטל שחור", "blackberries": "פטל שחור",
    "date": "תמר", "dates": "תמרים",
    "cherry": "דובדבן", "cherries": "דובדבנים",
    "fig": "תאנה", "figs": "תאנים",
    "pomegranate": "רימון", "papaya": "פפאיה",
    "apricot": "משמש", "apricots": "משמשים",
    "plum": "שזיף", "plums": "שזיפים",
    "coconut": "קוקוס", "passion fruit": "פסיפלורה",
    "raisins": "צימוקים", "cranberries": "חמוציות",
    "currant": "דומדמנית", "currants": "דומדמניות",

    // בשר ודגים
    "chicken": "עוף", "chicken breast": "חזה עוף",
    "chicken thighs": "שוקיים עוף", "chicken wings": "כנפיים עוף",
    "whole chicken": "עוף שלם", "chicken legs": "ירכיים עוף",
    "chicken stock": "מרק עוף", "chicken broth": "ציר עוף",
    "duck": "ברווז", "turkey": "הודו",
    "beef": "בקר", "beef mince": "בקר טחון", "ground beef": "בקר טחון",
    "minced beef": "בקר טחון", "beef brisket": "חזה בקר",
    "beef stock": "ציר בקר", "beef ribs": "צלעות בקר",
    "steak": "סטייק", "rib eye": "אנטריקוט", "ribeye": "אנטריקוט",
    "fillet steak": "פילה בקר", "sirloin": "סינטה",
    "lamb": "כבש", "lamb shoulder": "כתף כבש",
    "lamb mince": "כבש טחון", "lamb chops": "צלעות כבש",
    "pork": "חזיר", "pork belly": "בטן חזיר", "bacon": "בייקון",
    "ham": "נקניק", "salami": "סלמי",
    "burger": "המבורגר", "hamburger": "המבורגר",
    "sausage": "נקניק", "sausages": "נקניקיות",
    "salmon": "סלמון", "salmon fillet": "פילה סלמון",
    "smoked salmon": "סלמון מעושן",
    "tuna": "טונה", "tilapia": "אמנון", "fish": "דג",
    "cod": "קוד", "haddock": "חמור הים", "trout": "פורל",
    "sea bass": "לברק", "shrimp": "חסילון", "prawns": "חסילונים",
    "lobster": "לובסטר", "crab": "סרטן", "calamari": "קלמרי",
    "anchovy": "אנשובי", "anchovies": "אנשובי",
    "mussels": "מולים", "scallops": "סקאלופ",

    // ביצים ודגנים
    "egg": "ביצים", "eggs": "ביצים", "egg yolk": "חלמון",
    "egg white": "חלבון", "free range eggs": "ביצי חופש",
    "flour": "קמח", "wheat flour": "קמח חיטה",
    "plain flour": "קמח לבן", "self raising flour": "קמח תופח",
    "bread flour": "קמח לחם", "wheat": "חיטה",
    "oats": "שיבולת שועל", "oat": "שיבולת שועל",
    "porridge oats": "שיבולת שועל", "rolled oats": "שיבולת שועל",
    "cereal": "דגני בוקר", "cereals": "דגני בוקר",
    "cornflakes": "קורנפלקס", "granola": "גרנולה", "muesli": "מוזלי",
    "cornmeal": "קמח תירס", "cornstarch": "קורנפלור", "cornflour": "קורנפלור",
    "bran": "סובין",

    // פחמימות
    "rice": "אורז", "white rice": "אורז לבן", "brown rice": "אורז מלא",
    "basmati rice": "אורז בסמטי", "jasmine rice": "אורז יסמין",
    "long grain rice": "אורז גרגיר ארוך", "wild rice": "אורז בר",
    "pasta": "פסטה", "spaghetti": "ספגטי", "penne": "פנה",
    "fusilli": "פוסילי", "rigatoni": "ריגטוני", "linguine": "לינגוויני",
    "fettuccine": "פטוצ'יני", "tagliatelle": "טליאטלה",
    "lasagna": "לזניה", "lasagne": "לזניה", "ravioli": "רביולי",
    "macaroni": "מקרוני", "noodles": "אטריות",
    "couscous": "קוסקוס", "bulgur": "בורגול", "quinoa": "קינואה",
    "barley": "שעורה", "polenta": "פולנטה", "semolina": "סולת",
    "lentils": "עדשים", "red lentils": "עדשים אדומות",
    "chickpeas": "חומוס", "beans": "שעועית",
    "black beans": "שעועית שחורה", "kidney beans": "שעועית אדומה",
    "white beans": "שעועית לבנה", "butter beans": "שעועית חמאה",
    "bread": "לחם", "white bread": "לחם לבן", "brown bread": "לחם מלא",
    "sourdough": "מחמצת", "ciabatta": "צ'יאבטה",
    "pita": "פיתה", "pita bread": "פיתה",
    "tortilla": "טורטייה", "wrap": "ראפ",
    "buns": "לחמניות", "bread rolls": "לחמניות", "baguette": "באגט",

    // חלב
    "milk": "חלב", "whole milk": "חלב מלא", "skimmed milk": "חלב דל שומן",
    "soya milk": "חלב סויה", "soy milk": "חלב סויה",
    "almond milk": "חלב שקדים", "coconut milk": "חלב קוקוס",
    "oat milk": "חלב שיבולת שועל", "evaporated milk": "חלב מרוכז",
    "condensed milk": "חלב מתוק מרוכז", "buttermilk": "חמאת חלב",
    "cheese": "גבינה", "cheddar": "צ'דר", "cheddar cheese": "גבינת צ'דר",
    "cottage cheese": "קוטג'", "feta": "פטה", "feta cheese": "פטה",
    "mozzarella": "מוצרלה", "parmesan": "פרמזן",
    "gruyere": "גרוייר", "ricotta": "ריקוטה", "blue cheese": "גבינה כחולה",
    "cream cheese": "גבינת שמנת", "goats cheese": "גבינת עיזים",
    "yogurt": "יוגורט", "greek yogurt": "יוגורט יווני",
    "natural yogurt": "יוגורט טבעי",
    "butter": "חמאה", "unsalted butter": "חמאה לא מלוחה",
    "margarine": "מרגרינה",
    "cream": "שמנת", "double cream": "שמנת מתוקה",
    "single cream": "שמנת מתוקה", "whipping cream": "שמנת להקצפה",
    "sour cream": "שמנת חמוצה", "creme fraiche": "שמנת חמוצה",

    // שתייה
    "water": "מים", "mineral water": "מים מינרליים",
    "sparkling water": "סודה", "tap water": "מים מהברז",
    "coke": "קוקה קולה", "cola": "קולה", "coca cola": "קוקה קולה",
    "sprite": "ספרייט", "fanta": "פאנטה", "pepsi": "פפסי",
    "lemonade": "לימונדה",
    "juice": "מיץ", "orange juice": "מיץ תפוזים",
    "apple juice": "מיץ תפוחים", "tomato juice": "מיץ עגבניות",
    "tea": "תה", "green tea": "תה ירוק", "black tea": "תה שחור",
    "coffee": "קפה", "instant coffee": "קפה נמס",
    "espresso": "אספרסו", "cappuccino": "קפוצ'ינו",
    "beer": "בירה", "wine": "יין",
    "red wine": "יין אדום", "white wine": "יין לבן",

    // חטיפים ומתוקים
    "chips": "צ'יפס", "crisps": "צ'יפס",
    "popcorn": "פופקורן", "pretzels": "בייגלה",
    "chocolate": "שוקולד", "milk chocolate": "שוקולד חלב",
    "dark chocolate": "שוקולד מריר", "white chocolate": "שוקולד לבן",
    "candy": "סוכריות", "candies": "סוכריות",
    "cookies": "עוגיות", "biscuits": "עוגיות",
    "wafer": "ופלים", "wafers": "ופלים",
    "ice cream": "גלידה", "vanilla ice cream": "גלידת וניל",
    "vanilla": "וניל",
    "nutella": "נוטלה", "spread": "ממרח",
    "cake": "עוגה", "cakes": "עוגות",
    "muffin": "מאפין", "muffins": "מאפינים",
    "donut": "דונאט", "donuts": "דונאטס", "doughnut": "דונאט",

    // תבלינים ועוד (לא מציגים אבל עוזר לתרגום)
    "salt": "מלח", "pepper": "פלפל", "black pepper": "פלפל שחור",
    "sugar": "סוכר", "brown sugar": "סוכר חום",
    "honey": "דבש", "olive oil": "שמן זית", "oil": "שמן",
    "vinegar": "חומץ", "soy sauce": "סויה",
    "tomato sauce": "רוטב עגבניות", "tomato paste": "רסק עגבניות",
    "ketchup": "קטשופ", "mustard": "חרדל", "mayonnaise": "מיונז"
};

// ============================================================
//  מיפוי קטגוריות של רכיבים לעברית
//  עוזר לסווג רכיבים מ-TheMealDB לקטגוריות שלנו
// ============================================================
const INGREDIENT_TO_CATEGORY = {
    // ירקות - לפי תרגום בעברית
    "תפוח אדמה": "ירקות", "תפוחי אדמה": "ירקות",
    "בטטה": "ירקות", "בטטות": "ירקות",
    "בצל": "ירקות", "בצל סגול": "ירקות", "בצל ירוק": "ירקות",
    "שאלוט": "ירקות", "כרישה": "ירקות",
    "שום": "ירקות", "שן שום": "ירקות",
    "עגבנייה": "ירקות", "עגבניות": "ירקות", "עגבניות שרי": "ירקות",
    "מלפפון": "ירקות", "מלפפונים": "ירקות",
    "פלפל": "ירקות", "פלפלים": "ירקות",
    "פלפל אדום": "ירקות", "פלפל ירוק": "ירקות", "פלפל צהוב": "ירקות",
    "צ'ילי": "ירקות", "פלפל חריף": "ירקות",
    "גזר": "ירקות", "גזרים": "ירקות",
    "חסה": "ירקות", "חסה אייסברג": "ירקות",
    "כרוב": "ירקות", "כרוב אדום": "ירקות",
    "כרובית": "ירקות", "ברוקולי": "ירקות",
    "קישוא": "ירקות", "חציל": "ירקות",
    "פטרוזיליה": "ירקות", "כוסברה": "ירקות", "נענע": "ירקות",
    "בזיליקום": "ירקות", "טימין": "ירקות", "רוזמרין": "ירקות",
    "אורגנו": "ירקות", "שמיר": "ירקות", "מרווה": "ירקות",
    "פטרייה": "ירקות", "פטריות": "ירקות",
    "תרד": "ירקות", "קייל": "ירקות", "רוקט": "ירקות",
    "תירס": "ירקות", "תירס מתוק": "ירקות",
    "סלרי": "ירקות", "אספרגוס": "ירקות",
    "ארטישוק": "ירקות", "במיה": "ירקות",
    "ג'ינג'ר": "ירקות", "כורכום": "ירקות",
    "סלק": "ירקות", "צנון": "ירקות", "לפת": "ירקות",
    "אפונה": "ירקות", "אפונה ירוקה": "ירקות",
    "שעועית ירוקה": "ירקות", "זיתים": "ירקות",

    // פירות
    "תפוח": "פירות", "תפוחים": "פירות",
    "תפוח ירוק": "פירות", "תפוח אדום": "פירות",
    "בננה": "פירות", "בננות": "פירות",
    "תפוז": "פירות", "תפוזים": "פירות",
    "קלמנטינה": "פירות", "מנדרינה": "פירות",
    "לימון": "פירות", "לימונים": "פירות",
    "ליים": "פירות", "אשכולית": "פירות",
    "אבוקדו": "פירות", "ענבים": "פירות",
    "תות": "פירות", "תות שדה": "פירות",
    "אבטיח": "פירות", "מלון": "פירות", "אננס": "פירות",
    "אגס": "פירות", "אגסים": "פירות",
    "אפרסק": "פירות", "אפרסקים": "פירות",
    "נקטרינה": "פירות", "קיווי": "פירות", "מנגו": "פירות",
    "אוכמנייה": "פירות", "אוכמניות": "פירות",
    "פטל": "פירות", "פטל שחור": "פירות",
    "תמר": "פירות", "תמרים": "פירות",
    "דובדבן": "פירות", "דובדבנים": "פירות",
    "תאנה": "פירות", "תאנים": "פירות",
    "רימון": "פירות", "פפאיה": "פירות",
    "משמש": "פירות", "משמשים": "פירות",
    "שזיף": "פירות", "שזיפים": "פירות",
    "קוקוס": "פירות", "פסיפלורה": "פירות",
    "צימוקים": "פירות", "חמוציות": "פירות",

    // בשר ודגים
    "עוף": "בשר ודגים", "חזה עוף": "בשר ודגים",
    "שוקיים עוף": "בשר ודגים", "כנפיים עוף": "בשר ודגים",
    "עוף שלם": "בשר ודגים", "ירכיים עוף": "בשר ודגים",
    "ברווז": "בשר ודגים", "הודו": "בשר ודגים",
    "בקר": "בשר ודגים", "בקר טחון": "בשר ודגים",
    "חזה בקר": "בשר ודגים", "צלעות בקר": "בשר ודגים",
    "סטייק": "בשר ודגים", "אנטריקוט": "בשר ודגים",
    "פילה בקר": "בשר ודגים", "סינטה": "בשר ודגים",
    "כבש": "בשר ודגים", "כתף כבש": "בשר ודגים",
    "כבש טחון": "בשר ודגים", "צלעות כבש": "בשר ודגים",
    "המבורגר": "בשר ודגים", "נקניק": "בשר ודגים", "נקניקיות": "בשר ודגים",
    "סלמון": "בשר ודגים", "פילה סלמון": "בשר ודגים",
    "סלמון מעושן": "בשר ודגים",
    "טונה": "בשר ודגים", "אמנון": "בשר ודגים", "דג": "בשר ודגים",
    "קוד": "בשר ודגים", "חמור הים": "בשר ודגים", "פורל": "בשר ודגים",
    "לברק": "בשר ודגים", "חסילון": "בשר ודגים", "חסילונים": "בשר ודגים",
    "לובסטר": "בשר ודגים", "סרטן": "בשר ודגים", "קלמרי": "בשר ודגים",
    "אנשובי": "בשר ודגים",

    // ביצים ודגנים
    "ביצים": "ביצים ודגנים", "ביצי חופש": "ביצים ודגנים",
    "קמח": "ביצים ודגנים", "קמח חיטה": "ביצים ודגנים",
    "קמח לבן": "ביצים ודגנים", "קמח תופח": "ביצים ודגנים",
    "קמח לחם": "ביצים ודגנים",
    "שיבולת שועל": "ביצים ודגנים",
    "דגני בוקר": "ביצים ודגנים", "קורנפלקס": "ביצים ודגנים",
    "גרנולה": "ביצים ודגנים", "מוזלי": "ביצים ודגנים",
    "סובין": "ביצים ודגנים"
};

// ============================================================
//  כמויות ברירת מחדל לפי קטגוריה
// ============================================================
function defaultQuantity(categoryHe) {
    switch (categoryHe) {
        case "ירקות": return "1 ק\"ג";
        case "פירות": return "1 ק\"ג";
        case "בשר ודגים": return "1 ק\"ג";
        case "ביצים ודגנים": return "12 יח'";
        default: return "יחידה";
    }
}

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

function detectHebrewCategory(offProduct) {
    const tags = (offProduct.categories_tags || []).map(t => t.toLowerCase());
    for (const cat of OFF_CATEGORIES) {
        if (tags.includes(cat.offTag)) {
            return cat.he;
        }
    }
    return null;
}

// ============================================================
//  קריאה ל-API חיצוני
// ============================================================
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
        case "בשר ודגים": return 35 + (seed % 80);
        case "מוצרי חלב": return 8 + (seed % 25);
        case "פירות": return 7 + (seed % 18);
        case "ירקות": return 5 + (seed % 15);
        case "שתייה": return 6 + (seed % 30);
        case "חטיפים ומתוקים": return 5 + (seed % 20);
        case "פחמימות": return 7 + (seed % 18);
        case "ביצים ודגנים": return 8 + (seed % 22);
        default: return 10 + (seed % 25);
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
//  📡 API חיצוני 1: TheMealDB
//  קריאה אמיתית ל-https://www.themealdb.com/api/json/v1/1/list.php?i=list
//  מחזיר מאות רכיבים אמיתיים שמיובאים עם תרגום לעברית
// ============================================================
async function fetchFromMealDB() {
    const url = `${MEALDB_BASE}/list.php?i=list`;
    console.log("📡 Fetching from TheMealDB:", url);

    try {
        const data = await fetchJson(url);
        const ingredients = data.meals || [];
        console.log(`✓ Got ${ingredients.length} ingredients from TheMealDB`);

        const products = [];

        for (const ing of ingredients) {
            const englishName = ing.strIngredient;
            if (!englishName || !isEnglishOnly(englishName)) continue;

            // תרגום לעברית
            const hebrewName = translateToHebrew(englishName).trim();
            if (!hebrewName) continue;

            // סיווג לקטגוריה - לפי המילה בעברית
            const category = INGREDIENT_TO_CATEGORY[hebrewName];
            if (!category) continue; // אם לא הצלחנו לסווג - מדלגים

            const id = `mdb_${ing.idIngredient || hashCode(englishName)}`;
            const quantity = defaultQuantity(category);
            const prices = buildPrices(id, category);

            products.push({
                id,
                title: hebrewName,
                category,
                quantity,
                prices
            });
        }

        return products;
    } catch (err) {
        console.error("MealDB fetch failed:", err.message);
        return [];
    }
}

// ============================================================
//  📡 API חיצוני 2: Open Food Facts
//  מוצרים ארוזים: חלב, שוקולד, יוגורט, חטיפים, שתייה
// ============================================================
function offToProduct(offProduct, fallbackCategory) {
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

    const detectedCategory = detectHebrewCategory(offProduct);
    const category = detectedCategory || fallbackCategory;
    if (!category) return null;

    const quantity = translateQuantity(offProduct.quantity);
    const id = String(offProduct.code || hashCode(englishName));
    const prices = buildPrices(id, category);

    return { id, title: translatedTitle, category, quantity, prices };
}

async function fetchByOFFCategory(offTag, fallbackHe, pageSize = 30) {
    const fields = "code,product_name,product_name_en,generic_name,quantity,categories_tags";
    const tagOnly = offTag.replace("en:", "");
    const url = `${OFF_BASE}/api/v2/search?categories_tags_en=${encodeURIComponent(tagOnly)}` +
        `&fields=${fields}&page_size=${pageSize}&sort_by=popularity_key`;

    try {
        const data = await fetchJson(url);
        return (data.products || [])
            .map(p => offToProduct(p, fallbackHe))
            .filter(p => p !== null);
    } catch (err) {
        console.error(`Failed [${offTag}]:`, err.message);
        return [];
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
//  שילוב כל המוצרים מ-2 ה-APIs
// ============================================================
async function fetchAllProducts() {
    const cached = getCached("ALL");
    if (cached) return cached;

    const all = [];
    const seenIds = new Set();
    const seenTitles = new Set();

    // 📡 שלב 1: TheMealDB - רכיבי מזון בסיסיים
    console.log("→ Loading from TheMealDB...");
    const mealdbProducts = await fetchFromMealDB();
    for (const p of mealdbProducts) {
        const titleKey = p.title.toLowerCase().trim();
        if (!seenIds.has(p.id) && !seenTitles.has(titleKey)) {
            seenIds.add(p.id);
            seenTitles.add(titleKey);
            all.push(p);
        }
    }
    console.log(`✓ Added ${mealdbProducts.length} products from TheMealDB`);

    // 📡 שלב 2: Open Food Facts - מוצרים ארוזים
    console.log("→ Loading from Open Food Facts...");
    const uniqueByHe = new Map();
    for (const cat of OFF_CATEGORIES) {
        if (!uniqueByHe.has(cat.he)) {
            uniqueByHe.set(cat.he, []);
        }
        uniqueByHe.get(cat.he).push(cat);
    }

    let offCount = 0;
    for (const [heCategory, offTags] of uniqueByHe) {
        let categoryProductCount = 0;
        for (const offTag of offTags) {
            if (categoryProductCount >= 25) break;

            const products = await fetchByOFFCategory(offTag.offTag, heCategory, 30);

            for (const p of products) {
                if (categoryProductCount >= 25) break;
                const titleKey = p.title.toLowerCase().trim();
                if (!seenIds.has(p.id) && !seenTitles.has(titleKey)) {
                    seenIds.add(p.id);
                    seenTitles.add(titleKey);
                    all.push(p);
                    categoryProductCount++;
                    offCount++;
                }
            }

            await sleep(7000);
        }
    }

    console.log(`✓ Added ${offCount} products from Open Food Facts`);
    console.log(`✓ TOTAL: ${all.length} products`);

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
        version: "6.0.0",
        description: "Powered by 2 external APIs: TheMealDB + Open Food Facts",
        sources: {
            ingredients: "https://www.themealdb.com/api/json/v1/1/list.php?i=list",
            packaged: "https://world.openfoodfacts.org/api/v2/search"
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

        // חיפוש בעברית
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
    console.log(`✓ Shoply API v6 running on port ${PORT}`);
    console.log(`✓ External APIs: TheMealDB + Open Food Facts`);
    startInitialLoad();
})*/




const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ============================================================
//  Shoply API v7
//
//  APIs חיצוניים אמיתיים:
//
//  1. TheMealDB API (https://www.themealdb.com/)
//     מחזיר רכיבי מזון בסיסיים: ירקות, פירות, בשר, דגים
//     Endpoint: /api/json/v1/1/list.php?i=list
//
//  2. Open Food Facts API (https://world.openfoodfacts.org/)
//     מחזיר מוצרים ארוזים: חלב, שוקולד, יוגורט, חטיפים
//     Endpoint: /api/v2/search?categories_tags_en=...
//
//  3. Open Food Facts Prices API (https://prices.openfoodfacts.org/)
//     מחזיר מחירים אמיתיים שדווחו על ידי משתמשים מכל העולם
//     Endpoint: /api/v1/prices?product_code=...
//
//  כל ה-APIs חינמיים, ציבוריים, ללא צורך ב-API key
// ============================================================

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
const OFF_BASE = "https://world.openfoodfacts.org";
const PRICES_BASE = "https://prices.openfoodfacts.org";
const USER_AGENT = "ShoplyApp/7.0 (academic project)";

// ============================================================
//  שמות החנויות בעברית
// ============================================================
const STORE_NAMES = {
    shufersal: "שופרסל",
    ramiLevy: "רמי לוי",
    victory: "ויקטורי",
    yohananof: "יוחננוף",
    carrefour: "קרפור",
    tivTaam: "טיב טעם",
};

// ============================================================
//  מחירי בסיס הגיוניים לפי קטגוריה (₪)
//  משמשים כ-fallback כשאין מחיר אמיתי מה-API
// ============================================================
const CATEGORY_BASE_PRICES = {
    "בשר ודגים": { min: 35, max: 120 },
    "מוצרי חלב": { min: 8, max: 35 },
    "פירות": { min: 5, max: 25 },
    "ירקות": { min: 4, max: 20 },
    "שתייה": { min: 5, max: 30 },
    "חטיפים ומתוקים": { min: 5, max: 22 },
    "פחמימות": { min: 6, max: 20 },
    "ביצים ודגנים": { min: 8, max: 28 },
};

// ============================================================
//  קטגוריות Open Food Facts -> עברית
// ============================================================
const OFF_CATEGORIES = [
    { offTag: "en:breakfast-cereals", he: "ביצים ודגנים" },
    { offTag: "en:flours", he: "ביצים ודגנים" },
    { offTag: "en:granolas", he: "ביצים ודגנים" },
    { offTag: "en:pastas", he: "פחמימות" },
    { offTag: "en:rices", he: "פחמימות" },
    { offTag: "en:legumes", he: "פחמימות" },
    { offTag: "en:breads", he: "פחמימות" },
    { offTag: "en:dairies", he: "מוצרי חלב" },
    { offTag: "en:cheeses", he: "מוצרי חלב" },
    { offTag: "en:yogurts", he: "מוצרי חלב" },
    { offTag: "en:milks", he: "מוצרי חלב" },
    { offTag: "en:butters", he: "מוצרי חלב" },
    { offTag: "en:carbonated-drinks", he: "שתייה" },
    { offTag: "en:fruit-juices", he: "שתייה" },
    { offTag: "en:waters", he: "שתייה" },
    { offTag: "en:teas", he: "שתייה" },
    { offTag: "en:coffees", he: "שתייה" },
    { offTag: "en:chocolates", he: "חטיפים ומתוקים" },
    { offTag: "en:biscuits-and-cakes", he: "חטיפים ומתוקים" },
    { offTag: "en:ice-creams-and-sorbets", he: "חטיפים ומתוקים" },
    { offTag: "en:sweet-spreads", he: "חטיפים ומתוקים" },
    { offTag: "en:candies", he: "חטיפים ומתוקים" },
    { offTag: "en:chips-and-fries", he: "חטיפים ומתוקים" },
];

const ALL_CATEGORIES_HE = [
    "ביצים ודגנים", "פחמימות", "ירקות", "פירות",
    "בשר ודגים", "מוצרי חלב", "שתייה", "חטיפים ומתוקים",
];

// ============================================================
//  מילון תרגום אנגלית -> עברית
// ============================================================
const TRANSLATIONS = {
    // תארים
    "white": "לבן", "red": "אדום", "green": "ירוק", "yellow": "צהוב",
    "fresh": "טרי", "frozen": "קפוא", "organic": "אורגני",
    "natural": "טבעי", "sweet": "מתוק", "whole": "מלא",
    "low": "דל", "fat": "שומן", "free": "ללא",
    "dark": "מריר", "smoked": "מעושן",
    "baby": "תינוק", "wild": "בר", "raw": "טבעי",

    // ירקות
    "potato": "תפוח אדמה", "potatoes": "תפוחי אדמה",
    "sweet potato": "בטטה", "sweet potatoes": "בטטות",
    "onion": "בצל", "onions": "בצל",
    "red onion": "בצל סגול", "spring onion": "בצל ירוק",
    "shallot": "שאלוט", "leek": "כרישה",
    "garlic": "שום", "garlic clove": "שן שום",
    "tomato": "עגבנייה", "tomatoes": "עגבניות",
    "cherry tomatoes": "עגבניות שרי",
    "cucumber": "מלפפון", "cucumbers": "מלפפונים",
    "pepper": "פלפל", "peppers": "פלפלים",
    "red pepper": "פלפל אדום", "green pepper": "פלפל ירוק",
    "yellow pepper": "פלפל צהוב", "bell pepper": "פלפל",
    "chili": "צ'ילי", "chilli": "צ'ילי", "chili pepper": "פלפל חריף",
    "carrot": "גזר", "carrots": "גזרים",
    "lettuce": "חסה", "iceberg lettuce": "חסה אייסברג",
    "cabbage": "כרוב", "red cabbage": "כרוב אדום",
    "cauliflower": "כרובית", "broccoli": "ברוקולי",
    "zucchini": "קישוא", "courgette": "קישוא",
    "eggplant": "חציל", "aubergine": "חציל",
    "parsley": "פטרוזיליה", "coriander": "כוסברה", "cilantro": "כוסברה",
    "mint": "נענע", "basil": "בזיליקום", "thyme": "טימין",
    "rosemary": "רוזמרין", "oregano": "אורגנו", "dill": "שמיר",
    "sage": "מרווה", "bay leaf": "עלה דפנה", "bay leaves": "עלי דפנה",
    "mushroom": "פטרייה", "mushrooms": "פטריות",
    "spinach": "תרד", "kale": "קייל", "rocket": "רוקט", "arugula": "רוקט",
    "corn": "תירס", "sweetcorn": "תירס מתוק",
    "celery": "סלרי", "asparagus": "אספרגוס",
    "artichoke": "ארטישוק", "okra": "במיה",
    "ginger": "ג'ינג'ר", "turmeric": "כורכום",
    "beetroot": "סלק", "beet": "סלק", "radish": "צנון", "turnip": "לפת",
    "peas": "אפונה", "green peas": "אפונה ירוקה",
    "green beans": "שעועית ירוקה", "olives": "זיתים",

    // פירות
    "apple": "תפוח", "apples": "תפוחים",
    "green apple": "תפוח ירוק", "red apple": "תפוח אדום",
    "banana": "בננה", "bananas": "בננות",
    "orange": "תפוז", "oranges": "תפוזים",
    "clementine": "קלמנטינה", "mandarin": "מנדרינה",
    "lemon": "לימון", "lemons": "לימונים",
    "lime": "ליים", "limes": "ליים",
    "grapefruit": "אשכולית",
    "avocado": "אבוקדו", "avocados": "אבוקדו",
    "grape": "ענבים", "grapes": "ענבים",
    "strawberry": "תות", "strawberries": "תות שדה",
    "watermelon": "אבטיח", "melon": "מלון",
    "pineapple": "אננס", "pear": "אגס", "pears": "אגסים",
    "peach": "אפרסק", "peaches": "אפרסקים",
    "nectarine": "נקטרינה", "kiwi": "קיווי", "mango": "מנגו",
    "blueberry": "אוכמנייה", "blueberries": "אוכמניות",
    "raspberry": "פטל", "raspberries": "פטל",
    "blackberry": "פטל שחור", "blackberries": "פטל שחור",
    "date": "תמר", "dates": "תמרים",
    "cherry": "דובדבן", "cherries": "דובדבנים",
    "fig": "תאנה", "figs": "תאנים",
    "pomegranate": "רימון", "papaya": "פפאיה",
    "apricot": "משמש", "apricots": "משמשים",
    "plum": "שזיף", "plums": "שזיפים",
    "coconut": "קוקוס", "passion fruit": "פסיפלורה",
    "raisins": "צימוקים", "cranberries": "חמוציות",
    "currant": "דומדמנית", "currants": "דומדמניות",

    // בשר ודגים
    "chicken": "עוף", "chicken breast": "חזה עוף",
    "chicken thighs": "שוקיים עוף", "chicken wings": "כנפיים עוף",
    "whole chicken": "עוף שלם", "chicken legs": "ירכיים עוף",
    "chicken stock": "מרק עוף", "chicken broth": "ציר עוף",
    "duck": "ברווז", "turkey": "הודו",
    "beef": "בקר", "beef mince": "בקר טחון", "ground beef": "בקר טחון",
    "minced beef": "בקר טחון", "beef brisket": "חזה בקר",
    "beef stock": "ציר בקר", "beef ribs": "צלעות בקר",
    "steak": "סטייק", "rib eye": "אנטריקוט", "ribeye": "אנטריקוט",
    "fillet steak": "פילה בקר", "sirloin": "סינטה",
    "lamb": "כבש", "lamb shoulder": "כתף כבש",
    "lamb mince": "כבש טחון", "lamb chops": "צלעות כבש",
    "pork": "חזיר", "pork belly": "בטן חזיר", "bacon": "בייקון",
    "ham": "נקניק", "salami": "סלמי",
    "burger": "המבורגר", "hamburger": "המבורגר",
    "sausage": "נקניק", "sausages": "נקניקיות",
    "salmon": "סלמון", "salmon fillet": "פילה סלמון",
    "smoked salmon": "סלמון מעושן",
    "tuna": "טונה", "tilapia": "אמנון", "fish": "דג",
    "cod": "קוד", "haddock": "חמור הים", "trout": "פורל",
    "sea bass": "לברק", "shrimp": "חסילון", "prawns": "חסילונים",
    "lobster": "לובסטר", "crab": "סרטן", "calamari": "קלמרי",
    "anchovy": "אנשובי", "anchovies": "אנשובי",
    "mussels": "מולים", "scallops": "סקאלופ",

    // ביצים ודגנים
    "egg": "ביצים", "eggs": "ביצים", "egg yolk": "חלמון",
    "egg white": "חלבון", "free range eggs": "ביצי חופש",
    "flour": "קמח", "wheat flour": "קמח חיטה",
    "plain flour": "קמח לבן", "self raising flour": "קמח תופח",
    "bread flour": "קמח לחם", "wheat": "חיטה",
    "oats": "שיבולת שועל", "oat": "שיבולת שועל",
    "porridge oats": "שיבולת שועל", "rolled oats": "שיבולת שועל",
    "cereal": "דגני בוקר", "cereals": "דגני בוקר",
    "cornflakes": "קורנפלקס", "granola": "גרנולה", "muesli": "מוזלי",
    "cornmeal": "קמח תירס", "cornstarch": "קורנפלור", "cornflour": "קורנפלור",
    "bran": "סובין",

    // פחמימות
    "rice": "אורז", "white rice": "אורז לבן", "brown rice": "אורז מלא",
    "basmati rice": "אורז בסמטי", "jasmine rice": "אורז יסמין",
    "long grain rice": "אורז גרגיר ארוך", "wild rice": "אורז בר",
    "pasta": "פסטה", "spaghetti": "ספגטי", "penne": "פנה",
    "fusilli": "פוסילי", "rigatoni": "ריגטוני", "linguine": "לינגוויני",
    "fettuccine": "פטוצ'יני", "tagliatelle": "טליאטלה",
    "lasagna": "לזניה", "lasagne": "לזניה", "ravioli": "רביולי",
    "macaroni": "מקרוני", "noodles": "אטריות",
    "couscous": "קוסקוס", "bulgur": "בורגול", "quinoa": "קינואה",
    "barley": "שעורה", "polenta": "פולנטה", "semolina": "סולת",
    "lentils": "עדשים", "red lentils": "עדשים אדומות",
    "chickpeas": "חומוס", "beans": "שעועית",
    "black beans": "שעועית שחורה", "kidney beans": "שעועית אדומה",
    "white beans": "שעועית לבנה", "butter beans": "שעועית חמאה",
    "bread": "לחם", "white bread": "לחם לבן", "brown bread": "לחם מלא",
    "sourdough": "מחמצת", "ciabatta": "צ'יאבטה",
    "pita": "פיתה", "pita bread": "פיתה",
    "tortilla": "טורטייה", "wrap": "ראפ",
    "buns": "לחמניות", "bread rolls": "לחמניות", "baguette": "באגט",

    // מוצרי חלב
    "milk": "חלב", "whole milk": "חלב מלא", "skimmed milk": "חלב דל שומן",
    "soya milk": "חלב סויה", "soy milk": "חלב סויה",
    "almond milk": "חלב שקדים", "coconut milk": "חלב קוקוס",
    "oat milk": "חלב שיבולת שועל", "evaporated milk": "חלב מרוכז",
    "condensed milk": "חלב מתוק מרוכז", "buttermilk": "חמאת חלב",
    "cheese": "גבינה", "cheddar": "צ'דר", "cheddar cheese": "גבינת צ'דר",
    "cottage cheese": "קוטג'", "feta": "פטה", "feta cheese": "פטה",
    "mozzarella": "מוצרלה", "parmesan": "פרמזן",
    "gruyere": "גרוייר", "ricotta": "ריקוטה", "blue cheese": "גבינה כחולה",
    "cream cheese": "גבינת שמנת", "goats cheese": "גבינת עיזים",
    "yogurt": "יוגורט", "greek yogurt": "יוגורט יווני",
    "natural yogurt": "יוגורט טבעי",
    "butter": "חמאה", "unsalted butter": "חמאה לא מלוחה",
    "margarine": "מרגרינה",
    "cream": "שמנת", "double cream": "שמנת מתוקה",
    "single cream": "שמנת מתוקה", "whipping cream": "שמנת להקצפה",
    "sour cream": "שמנת חמוצה", "creme fraiche": "שמנת חמוצה",

    // שתייה
    "water": "מים", "mineral water": "מים מינרליים",
    "sparkling water": "סודה", "tap water": "מים מהברז",
    "coke": "קוקה קולה", "cola": "קולה", "coca cola": "קוקה קולה",
    "sprite": "ספרייט", "fanta": "פאנטה", "pepsi": "פפסי",
    "lemonade": "לימונדה",
    "juice": "מיץ", "orange juice": "מיץ תפוזים",
    "apple juice": "מיץ תפוחים", "tomato juice": "מיץ עגבניות",
    "tea": "תה", "green tea": "תה ירוק", "black tea": "תה שחור",
    "coffee": "קפה", "instant coffee": "קפה נמס",
    "espresso": "אספרסו", "cappuccino": "קפוצ'ינו",
    "beer": "בירה", "wine": "יין",
    "red wine": "יין אדום", "white wine": "יין לבן",

    // חטיפים ומתוקים
    "chips": "צ'יפס", "crisps": "צ'יפס",
    "popcorn": "פופקורן", "pretzels": "בייגלה",
    "chocolate": "שוקולד", "milk chocolate": "שוקולד חלב",
    "dark chocolate": "שוקולד מריר", "white chocolate": "שוקולד לבן",
    "candy": "סוכריות", "candies": "סוכריות",
    "cookies": "עוגיות", "biscuits": "עוגיות",
    "wafer": "ופלים", "wafers": "ופלים",
    "ice cream": "גלידה", "vanilla ice cream": "גלידת וניל",
    "vanilla": "וניל",
    "nutella": "נוטלה", "spread": "ממרח",
    "cake": "עוגה", "cakes": "עוגות",
    "muffin": "מאפין", "muffins": "מאפינים",
    "donut": "דונאט", "donuts": "דונאטס", "doughnut": "דונאט",

    // תבלינים
    "salt": "מלח", "black pepper": "פלפל שחור",
    "sugar": "סוכר", "brown sugar": "סוכר חום",
    "honey": "דבש", "olive oil": "שמן זית", "oil": "שמן",
    "vinegar": "חומץ", "soy sauce": "סויה",
    "tomato sauce": "רוטב עגבניות", "tomato paste": "רסק עגבניות",
    "ketchup": "קטשופ", "mustard": "חרדל", "mayonnaise": "מיונז",
};

// ============================================================
//  מיפוי שם עברי -> קטגוריה
// ============================================================
const INGREDIENT_TO_CATEGORY = {
    "תפוח אדמה": "ירקות", "תפוחי אדמה": "ירקות",
    "בטטה": "ירקות", "בטטות": "ירקות",
    "בצל": "ירקות", "בצל סגול": "ירקות", "בצל ירוק": "ירקות",
    "שאלוט": "ירקות", "כרישה": "ירקות",
    "שום": "ירקות", "שן שום": "ירקות",
    "עגבנייה": "ירקות", "עגבניות": "ירקות", "עגבניות שרי": "ירקות",
    "מלפפון": "ירקות", "מלפפונים": "ירקות",
    "פלפל": "ירקות", "פלפלים": "ירקות",
    "פלפל אדום": "ירקות", "פלפל ירוק": "ירקות", "פלפל צהוב": "ירקות",
    "צ'ילי": "ירקות", "פלפל חריף": "ירקות",
    "גזר": "ירקות", "גזרים": "ירקות",
    "חסה": "ירקות", "חסה אייסברג": "ירקות",
    "כרוב": "ירקות", "כרוב אדום": "ירקות",
    "כרובית": "ירקות", "ברוקולי": "ירקות",
    "קישוא": "ירקות", "חציל": "ירקות",
    "פטרוזיליה": "ירקות", "כוסברה": "ירקות", "נענע": "ירקות",
    "בזיליקום": "ירקות", "טימין": "ירקות", "רוזמרין": "ירקות",
    "אורגנו": "ירקות", "שמיר": "ירקות", "מרווה": "ירקות",
    "פטרייה": "ירקות", "פטריות": "ירקות",
    "תרד": "ירקות", "קייל": "ירקות", "רוקט": "ירקות",
    "תירס": "ירקות", "תירס מתוק": "ירקות",
    "סלרי": "ירקות", "אספרגוס": "ירקות",
    "ארטישוק": "ירקות", "במיה": "ירקות",
    "ג'ינג'ר": "ירקות", "כורכום": "ירקות",
    "סלק": "ירקות", "צנון": "ירקות", "לפת": "ירקות",
    "אפונה": "ירקות", "אפונה ירוקה": "ירקות",
    "שעועית ירוקה": "ירקות", "זיתים": "ירקות",

    "תפוח": "פירות", "תפוחים": "פירות",
    "תפוח ירוק": "פירות", "תפוח אדום": "פירות",
    "בננה": "פירות", "בננות": "פירות",
    "תפוז": "פירות", "תפוזים": "פירות",
    "קלמנטינה": "פירות", "מנדרינה": "פירות",
    "לימון": "פירות", "לימונים": "פירות",
    "ליים": "פירות", "אשכולית": "פירות",
    "אבוקדו": "פירות", "ענבים": "פירות",
    "תות": "פירות", "תות שדה": "פירות",
    "אבטיח": "פירות", "מלון": "פירות", "אננס": "פירות",
    "אגס": "פירות", "אגסים": "פירות",
    "אפרסק": "פירות", "אפרסקים": "פירות",
    "נקטרינה": "פירות", "קיווי": "פירות", "מנגו": "פירות",
    "אוכמנייה": "פירות", "אוכמניות": "פירות",
    "פטל": "פירות", "פטל שחור": "פירות",
    "תמר": "פירות", "תמרים": "פירות",
    "דובדבן": "פירות", "דובדבנים": "פירות",
    "תאנה": "פירות", "תאנים": "פירות",
    "רימון": "פירות", "פפאיה": "פירות",
    "משמש": "פירות", "משמשים": "פירות",
    "שזיף": "פירות", "שזיפים": "פירות",
    "קוקוס": "פירות", "פסיפלורה": "פירות",
    "צימוקים": "פירות", "חמוציות": "פירות",

    "עוף": "בשר ודגים", "חזה עוף": "בשר ודגים",
    "שוקיים עוף": "בשר ודגים", "כנפיים עוף": "בשר ודגים",
    "עוף שלם": "בשר ודגים", "ירכיים עוף": "בשר ודגים",
    "ברווז": "בשר ודגים", "הודו": "בשר ודגים",
    "בקר": "בשר ודגים", "בקר טחון": "בשר ודגים",
    "חזה בקר": "בשר ודגים", "צלעות בקר": "בשר ודגים",
    "סטייק": "בשר ודגים", "אנטריקוט": "בשר ודגים",
    "פילה בקר": "בשר ודגים", "סינטה": "בשר ודגים",
    "כבש": "בשר ודגים", "כתף כבש": "בשר ודגים",
    "כבש טחון": "בשר ודגים", "צלעות כבש": "בשר ודגים",
    "המבורגר": "בשר ודגים", "נקניק": "בשר ודגים", "נקניקיות": "בשר ודגים",
    "סלמון": "בשר ודגים", "פילה סלמון": "בשר ודגים",
    "סלמון מעושן": "בשר ודגים",
    "טונה": "בשר ודגים", "אמנון": "בשר ודגים", "דג": "בשר ודגים",
    "קוד": "בשר ודגים", "חמור הים": "בשר ודגים", "פורל": "בשר ודגים",
    "לברק": "בשר ודגים", "חסילון": "בשר ודגים", "חסילונים": "בשר ודגים",
    "לובסטר": "בשר ודגים", "סרטן": "בשר ודגים", "קלמרי": "בשר ודגים",
    "אנשובי": "בשר ודגים",

    "ביצים": "ביצים ודגנים", "ביצי חופש": "ביצים ודגנים",
    "קמח": "ביצים ודגנים", "קמח חיטה": "ביצים ודגנים",
    "קמח לבן": "ביצים ודגנים", "קמח תופח": "ביצים ודגנים",
    "קמח לחם": "ביצים ודגנים",
    "שיבולת שועל": "ביצים ודגנים",
    "דגני בוקר": "ביצים ודגנים", "קורנפלקס": "ביצים ודגנים",
    "גרנולה": "ביצים ודגנים", "מוזלי": "ביצים ודגנים",
    "סובין": "ביצים ודגנים",
};

// ============================================================
//  כמויות ברירת מחדל לפי קטגוריה
// ============================================================
function defaultQuantity(categoryHe) {
    switch (categoryHe) {
        case "ירקות": return "1 ק\"ג";
        case "פירות": return "1 ק\"ג";
        case "בשר ודגים": return "1 ק\"ג";
        case "ביצים ודגנים": return "12 יח'";
        default: return "יחידה";
    }
}

// ============================================================
//  תרגום יחידות מידה לעברית
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

// ============================================================
//  Cache פשוט בזיכרון
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
//  פונקציות עזר
// ============================================================
function isEnglishOnly(text) {
    if (!text || text.length < 2) return false;
    const nonLatin = /[\u4e00-\u9fff\u3040-\u30ff\u0590-\u05ff\u0600-\u06ff\u0400-\u04ff\u0e00-\u0e7f]/;
    if (nonLatin.test(text)) return false;
    return /[a-zA-Z]/.test(text);
}

function translateToHebrew(text) {
    if (!text) return "";
    const lower = text.toLowerCase().trim();
    if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];

    const words = lower.split(/[\s,.\-_/()]+/).filter(Boolean);

    for (let len = Math.min(3, words.length); len >= 2; len--) {
        for (let i = 0; i <= words.length - len; i++) {
            const phrase = words.slice(i, i + len).join(" ");
            if (TRANSLATIONS[phrase]) {
                const after = words.slice(i + len).map(w => TRANSLATIONS[w] || "").filter(Boolean);
                return [TRANSLATIONS[phrase], ...after].join(" ").trim();
            }
        }
    }

    const translated = words.map(w => TRANSLATIONS[w] || "").filter(Boolean);
    if (translated.length === 0) return "";
    if (translated.length === 1) return translated[0];
    return [translated[translated.length - 1], ...translated.slice(0, -1)].join(" ");
}

function detectHebrewCategory(offProduct) {
    const tags = (offProduct.categories_tags || []).map(t => t.toLowerCase());
    for (const cat of OFF_CATEGORIES) {
        if (tags.includes(cat.offTag)) return cat.he;
    }
    return null;
}

function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
//  קריאה ל-API חיצוני עם cache
// ============================================================
async function fetchJson(url) {
    const cached = getCached(url);
    if (cached) return cached;

    const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

    const data = await response.json();
    setCached(url, data);
    return data;
}

// ============================================================
//  📡 API חיצוני 3: Open Food Facts Prices
//
//  שולף מחירים אמיתיים לפי ברקוד מוצר.
//  ממוצע המחירים משמש כבסיס, ולכל חנות מוסיף/גורע עד 15%.
//
//  תיעוד: https://prices.openfoodfacts.org/api/docs
// ============================================================
async function fetchRealPricesForProduct(productCode) {
    const cacheKey = `prices_${productCode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const url = `${PRICES_BASE}/api/v1/prices?product_code=${productCode}&size=20`;
        console.log(`  💰 Fetching prices for ${productCode}`);
        const data = await fetchJson(url);

        const items = data.items || [];
        if (items.length === 0) return null;

        // סנן מחירים הגיוניים בלבד (בין 0.5 ל-500 שקל)
        const validPrices = items
            .map(item => parseFloat(item.price))
            .filter(p => !isNaN(p) && p > 0.5 && p < 500);

        if (validPrices.length === 0) return null;

        // חשב ממוצע
        const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

        // בנה מחירים שונים לכל חנות (±15% מהממוצע)
        const storeKeys = Object.keys(STORE_NAMES);
        const seed = hashCode(productCode);
        const storePrices = {};

        storeKeys.forEach((key, idx) => {
            const variation = ((seed + idx * 37) % 30) - 15; // -15% עד +15%
            const storePrice = avg * (1 + variation / 100);
            storePrices[key] = Math.round(storePrice * 10) / 10;
        });

        setCached(cacheKey, storePrices, 3 * 60 * 60 * 1000); // cache 3 שעות
        return storePrices;

    } catch (err) {
        console.warn(`  ⚠ Prices API failed for ${productCode}: ${err.message}`);
        return null;
    }
}

// ============================================================
//  בניית מחירים: קודם API אמיתי, אחר-כך fallback הגיוני
// ============================================================
async function buildPrices(productCode, categoryHe) {
    // נסה לשלוף מחירים אמיתיים מ-API
    const realPrices = await fetchRealPricesForProduct(productCode);
    if (realPrices) {
        console.log(`  ✅ Got REAL prices for ${productCode}`);
        return { prices: realPrices, source: "api" };
    }

    // Fallback: מחירים הגיוניים לפי קטגוריה
    const range = CATEGORY_BASE_PRICES[categoryHe] || { min: 10, max: 30 };
    const seed = hashCode(productCode);
    const base = range.min + (seed % (range.max - range.min));
    const prices = {};

    Object.keys(STORE_NAMES).forEach((key, idx) => {
        const variation = ((seed + idx * 31) % 25) - 12; // -12% עד +12%
        prices[key] = Math.round(base * (1 + variation / 100) * 10) / 10;
    });

    return { prices, source: "estimated" };
}

// ============================================================
//  📡 API חיצוני 1: TheMealDB
//  שולף רכיבי מזון בסיסיים (ירקות, פירות, בשר, דגים)
//  https://www.themealdb.com/api/json/v1/1/list.php?i=list
// ============================================================
async function fetchFromMealDB() {
    const url = `${MEALDB_BASE}/list.php?i=list`;
    console.log("📡 [TheMealDB] Fetching ingredients from:", url);

    try {
        const data = await fetchJson(url);
        const ingredients = data.meals || [];
        console.log(`✓ [TheMealDB] Got ${ingredients.length} raw ingredients`);

        const products = [];

        for (const ing of ingredients) {
            const englishName = ing.strIngredient;
            if (!englishName || !isEnglishOnly(englishName)) continue;

            const hebrewName = translateToHebrew(englishName).trim();
            if (!hebrewName) continue;

            const category = INGREDIENT_TO_CATEGORY[hebrewName];
            if (!category) continue;

            const id = `mdb_${ing.idIngredient || hashCode(englishName)}`;
            const quantity = defaultQuantity(category);

            // TheMealDB לא מספק ברקוד — נשתמש ב-ID כ-fallback לחיפוש מחירים
            const { prices, source } = await buildPrices(id, category);

            products.push({ id, title: hebrewName, category, quantity, prices, priceSource: source });
        }

        console.log(`✓ [TheMealDB] Processed ${products.length} products`);
        return products;

    } catch (err) {
        console.error("✗ [TheMealDB] Failed:", err.message);
        return [];
    }
}

// ============================================================
//  📡 API חיצוני 2: Open Food Facts
//  שולף מוצרים ארוזים לפי קטגוריות
//  https://world.openfoodfacts.org/api/v2/search
// ============================================================
async function offToProduct(offProduct, fallbackCategory) {
    // חפש שם אנגלי
    let englishName = "";
    const candidates = [
        offProduct.product_name_en,
        offProduct.product_name,
        offProduct.generic_name_en,
        offProduct.generic_name,
    ];
    for (const name of candidates) {
        if (name && isEnglishOnly(name)) { englishName = name; break; }
    }
    if (!englishName) return null;

    const hebrewTitle = translateToHebrew(englishName).trim().slice(0, 60);
    if (!hebrewTitle) return null;

    const category = detectHebrewCategory(offProduct) || fallbackCategory;
    if (!category) return null;

    const quantity = translateQuantity(offProduct.quantity);
    const productCode = String(offProduct.code || hashCode(englishName));

    // 📡 API 3: שלוף מחירים אמיתיים לפי ברקוד (code הוא ה-barcode)
    const { prices, source } = await buildPrices(productCode, category);

    return {
        id: productCode,
        title: hebrewTitle,
        category,
        quantity,
        prices,
        priceSource: source,
    };
}

async function fetchByOFFCategory(offTag, fallbackHe, pageSize = 20) {
    const fields = "code,product_name,product_name_en,generic_name,quantity,categories_tags";
    const tagOnly = offTag.replace("en:", "");
    const url = `${OFF_BASE}/api/v2/search?categories_tags_en=${encodeURIComponent(tagOnly)}`
        + `&fields=${fields}&page_size=${pageSize}&sort_by=popularity_key`;

    console.log(`  📡 [OFF] Fetching: ${offTag}`);

    try {
        const data = await fetchJson(url);
        const results = [];

        for (const p of (data.products || [])) {
            const product = await offToProduct(p, fallbackHe);
            if (product) results.push(product);
        }

        return results;
    } catch (err) {
        console.error(`  ✗ [OFF] Failed [${offTag}]:`, err.message);
        return [];
    }
}

// ============================================================
//  איסוף כל המוצרים מ-3 ה-APIs
// ============================================================
async function fetchAllProducts() {
    const cached = getCached("ALL_PRODUCTS");
    if (cached) {
        console.log("✓ Returning cached products");
        return cached;
    }

    console.log("\n========================================");
    console.log("  🛒 Shoply: Loading all products...");
    console.log("========================================\n");

    const all = [];
    const seenIds = new Set();
    const seenTitles = new Set();
    let apiPriceCount = 0;

    // ── שלב 1: TheMealDB ─────────────────────────────────────
    console.log("→ Step 1: TheMealDB (basic ingredients)");
    const mealdbProducts = await fetchFromMealDB();

    for (const p of mealdbProducts) {
        const titleKey = p.title.toLowerCase().trim();
        if (!seenIds.has(p.id) && !seenTitles.has(titleKey)) {
            seenIds.add(p.id);
            seenTitles.add(titleKey);
            all.push(p);
            if (p.priceSource === "api") apiPriceCount++;
        }
    }
    console.log(`✓ Step 1 done: ${mealdbProducts.length} products from TheMealDB\n`);

    // ── שלב 2: Open Food Facts ───────────────────────────────
    console.log("→ Step 2: Open Food Facts (packaged products)");

    // קבץ קטגוריות ייחודיות
    const uniqueByHe = new Map();
    for (const cat of OFF_CATEGORIES) {
        if (!uniqueByHe.has(cat.he)) uniqueByHe.set(cat.he, []);
        uniqueByHe.get(cat.he).push(cat);
    }

    let offCount = 0;
    for (const [heCategory, offTags] of uniqueByHe) {
        let categoryCount = 0;

        for (const offTag of offTags) {
            if (categoryCount >= 20) break;

            const products = await fetchByOFFCategory(offTag.offTag, heCategory, 20);

            for (const p of products) {
                if (categoryCount >= 20) break;
                const titleKey = p.title.toLowerCase().trim();
                if (!seenIds.has(p.id) && !seenTitles.has(titleKey)) {
                    seenIds.add(p.id);
                    seenTitles.add(titleKey);
                    all.push(p);
                    categoryCount++;
                    offCount++;
                    if (p.priceSource === "api") apiPriceCount++;
                }
            }

            await sleep(5000); // המתן בין קריאות כדי לא לחסום את ה-API
        }
    }

    console.log(`\n✓ Step 2 done: ${offCount} products from Open Food Facts`);
    console.log(`\n========================================`);
    console.log(`  ✅ TOTAL: ${all.length} products loaded`);
    console.log(`  💰 Real API prices: ${apiPriceCount} products`);
    console.log(`  📊 Estimated prices: ${all.length - apiPriceCount} products`);
    console.log(`========================================\n`);

    setCached("ALL_PRODUCTS", all);
    return all;
}

// ============================================================
//  המרה לפורמט ה-API הסופי
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
        priceSource: product.priceSource || "estimated", // שקיפות: api / estimated
        storePrices: Object.entries(product.prices).map(([key, price]) => ({
            storeName: STORE_NAMES[key],
            price: price,
        })),
    };
}

// ============================================================
//  טעינה ראשונית ברקע בעת הפעלת השרת
// ============================================================
let isLoading = false;

function startBackgroundLoad() {
    if (isLoading) return;
    isLoading = true;
    console.log("→ Starting background data load...");
    fetchAllProducts()
        .then(() => { isLoading = false; })
        .catch(err => {
            console.error("✗ Background load failed:", err.message);
            isLoading = false;
        });
}

// ============================================================
//  Endpoints
// ============================================================

// GET / — מידע כללי על ה-API
app.get("/", (req, res) => {
    res.json({
        name: "Shoply API",
        version: "7.0.0",
        description: "Shopping list & price comparison API",
        dataSources: {
            ingredients: {
                name: "TheMealDB",
                url: "https://www.themealdb.com/api/json/v1/1/list.php?i=list",
                provides: "Basic food ingredients (vegetables, fruits, meat, fish)",
            },
            packaged: {
                name: "Open Food Facts",
                url: "https://world.openfoodfacts.org/api/v2/search",
                provides: "Packaged products (dairy, drinks, snacks, cereals)",
            },
            prices: {
                name: "Open Food Facts Prices",
                url: "https://prices.openfoodfacts.org/api/v1/prices",
                provides: "Real crowdsourced product prices from around the world",
            },
        },
        endpoints: [
            "GET /products",
            "GET /products?category=<category>",
            "GET /products?search=<term>",
            "GET /products/:id",
            "GET /categories",
            "GET /status",
        ],
    });
});

// GET /status — מצב הטעינה
app.get("/status", (req, res) => {
    const cached = getCached("ALL_PRODUCTS");
    res.json({
        ready: !!cached,
        loading: isLoading,
        productCount: cached ? cached.length : 0,
        cacheSize: cache.size,
    });
});

// GET /products — כל המוצרים, עם אפשרות סינון
app.get("/products", async (req, res) => {
    try {
        let products = await fetchAllProducts();

        // סינון לפי קטגוריה
        if (req.query.category) {
            products = products.filter(p => p.category === req.query.category);
        }

        // חיפוש חופשי
        if (req.query.search) {
            const terms = req.query.search.toLowerCase().trim().split(/\s+/).filter(Boolean);
            products = products.filter(p => {
                const haystack = `${p.title} ${p.category}`.toLowerCase();
                return terms.every(t => haystack.includes(t));
            });
        }

        res.json(products.map(toApiFormat));
    } catch (err) {
        console.error("Error in GET /products:", err);
        res.status(500).json({ error: "שגיאה בקבלת המוצרים" });
    }
});

// GET /products/:id — מוצר בודד לפי ID
app.get("/products/:id", async (req, res) => {
    try {
        const all = await fetchAllProducts();
        const found = all.find(p => p.id === req.params.id);
        if (!found) {
            return res.status(404).json({ error: "מוצר לא נמצא" });
        }
        res.json(toApiFormat(found));
    } catch (err) {
        console.error("Error in GET /products/:id:", err);
        res.status(500).json({ error: "שגיאה בקבלת המוצר" });
    }
});

// GET /categories — רשימת קטגוריות
app.get("/categories", (req, res) => {
    res.json(ALL_CATEGORIES_HE);
});

// ============================================================
//  הפעלת השרת
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n✅ Shoply API v7 running on port ${PORT}`);
    console.log(`\nData sources:`);
    console.log(`  1. TheMealDB      → https://www.themealdb.com`);
    console.log(`  2. Open Food Facts → https://world.openfoodfacts.org`);
    console.log(`  3. OFF Prices API  → https://prices.openfoodfacts.org`);
    console.log(`\nEndpoints: / | /products | /products/:id | /categories | /status\n`);
    startBackgroundLoad();
});
