const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ============================================================
//  Product List 
// ============================================================
const products = [
  { id: "1", title: "ביצים L 12 יחידות", category: "ביצים ודגנים", quantity: "12 יח'", prices: { shufersal: 24.5, ramiLevy: 22.9, victory: 21.5, yohananof: 23.9, carrefour: 27.5, tivTaam: 22.9 } },
  { id: "2", title: "ביצים XL 12 יחידות", category: "ביצים ודגנים", quantity: "12 יח'", prices: { shufersal: 28.9, ramiLevy: 23.9, victory: 26.9, yohananof: 27.9, carrefour: 31.5, tivTaam: 26.9 } },
  { id: "3", title: "קמח חיטה מלא", category: "ביצים ודגנים", quantity: "1 ק\"ג", prices: { shufersal: 8.5, ramiLevy: 9.5, victory: 7.9, yohananof: 8.9, carrefour: 9.9, tivTaam: 8.9 } },
  { id: "4", title: "קמח לבן", category: "ביצים ודגנים", quantity: "1 ק\"ג", prices: { shufersal: 5.9, ramiLevy: 7.9, victory: 7.5, yohananof: 6.9, carrefour: 6.9, tivTaam: 6.9 } },
  { id: "5", title: "קוואקר שיבולת שועל", category: "ביצים ודגנים", quantity: "500 גרם", prices: { shufersal: 12.9, ramiLevy: 16.9, victory: 14.5, yohananof: 14.9, carrefour: 15.5, tivTaam: 14.5 } },
  { id: "6", title: "קורנפלקס", category: "ביצים ודגנים", quantity: "750 גרם", prices: { shufersal: 22.9, ramiLevy: 23.9, victory: 23.9, yohananof: 24.9, carrefour: 19.9, tivTaam: 22.5 } },
  { id: "7", title: "גרנולה", category: "ביצים ודגנים", quantity: "500 גרם", prices: { shufersal: 32.9, ramiLevy: 26.5, victory: 29.9, yohananof: 28.5, carrefour: 27.9, tivTaam: 29.9 } },
  { id: "8", title: "פתיתי שוקולד", category: "ביצים ודגנים", quantity: "375 גרם", prices: { shufersal: 19.5, ramiLevy: 16.9, victory: 19.9, yohananof: 18.9, carrefour: 20.5, tivTaam: 19.5 } },
  { id: "9", title: "אורז בסמטי", category: "פחמימות", quantity: "1 ק\"ג", prices: { shufersal: 17.5, ramiLevy: 20.5, victory: 20.9, yohananof: 18.9, carrefour: 18.9, tivTaam: 21.9 } },
  { id: "10", title: "אורז לבן", category: "פחמימות", quantity: "1 ק\"ג", prices: { shufersal: 12.9, ramiLevy: 12.9, victory: 12.9, yohananof: 11.9, carrefour: 13.9, tivTaam: 12.9 } },
  { id: "11", title: "אורז מלא", category: "פחמימות", quantity: "1 ק\"ג", prices: { shufersal: 16.5, ramiLevy: 18.9, victory: 17.5, yohananof: 17.5, carrefour: 16.5, tivTaam: 14.9 } },
  { id: "12", title: "פסטה ספגטי", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 7.9, ramiLevy: 9.9, victory: 8.9, yohananof: 8.9, carrefour: 8.9, tivTaam: 8.9 } },
  { id: "13", title: "פסטה פנה", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 9.9, ramiLevy: 8.9, victory: 7.5, yohananof: 8.5, carrefour: 9.5, tivTaam: 9.5 } },
  { id: "14", title: "פסטה פוסילי", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 9.9, ramiLevy: 9.5, victory: 8.9, yohananof: 8.5, carrefour: 8.5, tivTaam: 7.9 } },
  { id: "15", title: "קוסקוס", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 13.9, ramiLevy: 12.5, victory: 10.9, yohananof: 12.5, carrefour: 11.5, tivTaam: 11.5 } },
  { id: "16", title: "בורגול", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 8.5, ramiLevy: 11.5, victory: 10.5, yohananof: 9.9, carrefour: 9.9, tivTaam: 9.5 } },
  { id: "17", title: "קינואה", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 24.9, ramiLevy: 30.9, victory: 27.9, yohananof: 27.9, carrefour: 27.9, tivTaam: 25.9 } },
  { id: "18", title: "עדשים אדומות", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 13.5, ramiLevy: 14.5, victory: 13.5, yohananof: 13.5, carrefour: 11.9, tivTaam: 13.5 } },
  { id: "19", title: "חומוס יבש", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 9.9, ramiLevy: 9.9, victory: 9.5, yohananof: 8.9, carrefour: 11.5, tivTaam: 9.9 } },
  { id: "20", title: "שעועית לבנה", category: "פחמימות", quantity: "500 גרם", prices: { shufersal: 11.9, ramiLevy: 13.9, victory: 11.5, yohananof: 12.9, carrefour: 11.5, tivTaam: 10.9 } },
  { id: "21", title: "לחם אחיד פרוס", category: "פחמימות", quantity: "750 גרם", prices: { shufersal: 7.9, ramiLevy: 7.9, victory: 6.9, yohananof: 8.9, carrefour: 8.5, tivTaam: 7.5 } },
  { id: "22", title: "לחם מלא פרוס", category: "פחמימות", quantity: "750 גרם", prices: { shufersal: 9.5, ramiLevy: 10.5, victory: 9.9, yohananof: 11.5, carrefour: 9.5, tivTaam: 8.9 } },
  { id: "23", title: "פיתות", category: "פחמימות", quantity: "6 יח'", prices: { shufersal: 7.5, ramiLevy: 7.5, victory: 7.5, yohananof: 6.5, carrefour: 7.5, tivTaam: 6.5 } },
  { id: "24", title: "לחמניות המבורגר", category: "פחמימות", quantity: "6 יח'", prices: { shufersal: 13.5, ramiLevy: 13.5, victory: 13.5, yohananof: 13.9, carrefour: 14.5, tivTaam: 11.9 } },
  { id: "25", title: "תפוח אדמה", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 5.5, ramiLevy: 5.5, victory: 4.5, yohananof: 4.9, carrefour: 4.9, tivTaam: 5.5 } },
  { id: "26", title: "בטטה", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 8.9, ramiLevy: 8.5, victory: 7.5, yohananof: 8.5, carrefour: 7.5, tivTaam: 7.5 } },
  { id: "27", title: "בצל לבן", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 4.5, ramiLevy: 5.5, victory: 4.5, yohananof: 4.5, carrefour: 4.5, tivTaam: 4.5 } },
  { id: "28", title: "בצל סגול", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 6.9, ramiLevy: 7.5, victory: 6.5, yohananof: 7.5, carrefour: 8.5, tivTaam: 6.5 } },
  { id: "29", title: "שום", category: "ירקות", quantity: "100 גרם", prices: { shufersal: 4.5, ramiLevy: 4.5, victory: 3.5, yohananof: 3.5, carrefour: 4.5, tivTaam: 4.5 } },
  { id: "30", title: "עגבנייה", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 7.5, ramiLevy: 6.9, victory: 8.9, yohananof: 7.5, carrefour: 7.9, tivTaam: 7.9 } },
  { id: "31", title: "עגבניות שרי", category: "ירקות", quantity: "500 גרם", prices: { shufersal: 9.5, ramiLevy: 9.9, victory: 8.9, yohananof: 9.9, carrefour: 11.5, tivTaam: 8.9 } },
  { id: "32", title: "מלפפון", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 5.9, ramiLevy: 6.9, victory: 5.5, yohananof: 6.5, carrefour: 5.9, tivTaam: 5.9 } },
  { id: "33", title: "פלפל אדום", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 12.9, ramiLevy: 11.9, victory: 12.5, yohananof: 11.5, carrefour: 14.5, tivTaam: 13.5 } },
  { id: "34", title: "פלפל ירוק", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 10.5, ramiLevy: 10.5, victory: 10.9, yohananof: 11.5, carrefour: 10.5, tivTaam: 8.9 } },
  { id: "35", title: "פלפל צהוב", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 13.5, ramiLevy: 13.5, victory: 11.5, yohananof: 11.9, carrefour: 12.9, tivTaam: 13.5 } },
  { id: "36", title: "גזר", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 4.9, ramiLevy: 4.5, victory: 5.5, yohananof: 4.9, carrefour: 4.5, tivTaam: 4.5 } },
  { id: "37", title: "חסה ערבית", category: "ירקות", quantity: "יחידה", prices: { shufersal: 4.5, ramiLevy: 4.5, victory: 4.9, yohananof: 5.5, carrefour: 4.5, tivTaam: 5.5 } },
  { id: "38", title: "כרוב לבן", category: "ירקות", quantity: "יחידה", prices: { shufersal: 6.5, ramiLevy: 5.5, victory: 6.5, yohananof: 6.5, carrefour: 6.5, tivTaam: 5.5 } },
  { id: "39", title: "כרובית", category: "ירקות", quantity: "יחידה", prices: { shufersal: 8.5, ramiLevy: 9.5, victory: 8.9, yohananof: 8.5, carrefour: 7.9, tivTaam: 8.5 } },
  { id: "40", title: "ברוקולי", category: "ירקות", quantity: "יחידה", prices: { shufersal: 9.5, ramiLevy: 11.5, victory: 9.9, yohananof: 10.5, carrefour: 8.9, tivTaam: 9.9 } },
  { id: "41", title: "קישוא", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 7.5, ramiLevy: 6.5, victory: 6.9, yohananof: 6.5, carrefour: 6.9, tivTaam: 7.5 } },
  { id: "42", title: "חציל", category: "ירקות", quantity: "1 ק\"ג", prices: { shufersal: 7.5, ramiLevy: 8.5, victory: 6.9, yohananof: 8.5, carrefour: 7.9, tivTaam: 8.5 } },
  { id: "43", title: "פטרוזיליה", category: "ירקות", quantity: "אגודה", prices: { shufersal: 2.5, ramiLevy: 3.5, victory: 2.5, yohananof: 2.5, carrefour: 2.5, tivTaam: 2.5 } },
  { id: "44", title: "כוסברה", category: "ירקות", quantity: "אגודה", prices: { shufersal: 3.5, ramiLevy: 2.5, victory: 3.5, yohananof: 2.5, carrefour: 2.5, tivTaam: 2.5 } },
  { id: "45", title: "נענע", category: "ירקות", quantity: "אגודה", prices: { shufersal: 2.5, ramiLevy: 3.5, victory: 2.5, yohananof: 2.5, carrefour: 3.5, tivTaam: 2.5 } },
  { id: "46", title: "פטריות", category: "ירקות", quantity: "250 גרם", prices: { shufersal: 13.5, ramiLevy: 13.5, victory: 13.5, yohananof: 13.5, carrefour: 11.5, tivTaam: 14.5 } },
  { id: "47", title: "תירס קלחים", category: "ירקות", quantity: "יחידה", prices: { shufersal: 5.5, ramiLevy: 5.5, victory: 5.5, yohananof: 4.5, carrefour: 5.5, tivTaam: 4.5 } },
  { id: "48", title: "תפוח עץ אדום", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 9.5, ramiLevy: 10.5, victory: 9.9, yohananof: 8.9, carrefour: 10.5, tivTaam: 10.5 } },
  { id: "49", title: "תפוח עץ ירוק", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 10.9, ramiLevy: 10.5, victory: 12.5, yohananof: 11.5, carrefour: 9.5, tivTaam: 11.5 } },
  { id: "50", title: "בננה", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 8.5, ramiLevy: 7.5, victory: 8.5, yohananof: 7.9, carrefour: 7.5, tivTaam: 6.9 } },
  { id: "51", title: "תפוז", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 6.9, ramiLevy: 7.5, victory: 7.5, yohananof: 7.5, carrefour: 7.5, tivTaam: 6.5 } },
  { id: "52", title: "קלמנטינה", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 9.9, ramiLevy: 9.5, victory: 9.9, yohananof: 9.5, carrefour: 8.5, tivTaam: 9.5 } },
  { id: "53", title: "לימון", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 8.5, ramiLevy: 7.9, victory: 8.5, yohananof: 7.9, carrefour: 6.9, tivTaam: 8.5 } },
  { id: "54", title: "אבוקדו", category: "פירות", quantity: "יחידה", prices: { shufersal: 5.9, ramiLevy: 6.9, victory: 5.9, yohananof: 6.5, carrefour: 6.5, tivTaam: 5.9 } },
  { id: "55", title: "ענבים", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 13.5, ramiLevy: 14.9, victory: 14.5, yohananof: 14.9, carrefour: 16.9, tivTaam: 14.5 } },
  { id: "56", title: "תות שדה", category: "פירות", quantity: "500 גרם", prices: { shufersal: 18.9, ramiLevy: 18.9, victory: 18.9, yohananof: 18.5, carrefour: 19.5, tivTaam: 16.9 } },
  { id: "57", title: "אבטיח", category: "פירות", quantity: "יחידה", prices: { shufersal: 19.9, ramiLevy: 21.9, victory: 19.9, yohananof: 19.9, carrefour: 21.9, tivTaam: 17.9 } },
  { id: "58", title: "מלון", category: "פירות", quantity: "יחידה", prices: { shufersal: 14.9, ramiLevy: 14.9, victory: 16.9, yohananof: 13.9, carrefour: 14.9, tivTaam: 14.5 } },
  { id: "59", title: "אננס", category: "פירות", quantity: "יחידה", prices: { shufersal: 15.9, ramiLevy: 18.9, victory: 17.5, yohananof: 18.9, carrefour: 16.9, tivTaam: 16.5 } },
  { id: "60", title: "אגס", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 12.5, ramiLevy: 11.5, victory: 11.5, yohananof: 12.9, carrefour: 11.5, tivTaam: 13.9 } },
  { id: "61", title: "אפרסק", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 11.9, ramiLevy: 13.5, victory: 13.5, yohananof: 12.5, carrefour: 13.9, tivTaam: 12.5 } },
  { id: "62", title: "נקטרינה", category: "פירות", quantity: "1 ק\"ג", prices: { shufersal: 13.5, ramiLevy: 13.9, victory: 13.5, yohananof: 13.5, carrefour: 11.5, tivTaam: 13.5 } },
  { id: "63", title: "קיווי", category: "פירות", quantity: "יחידה", prices: { shufersal: 2.5, ramiLevy: 3.5, victory: 2.5, yohananof: 2.5, carrefour: 2.5, tivTaam: 3.5 } },
  { id: "64", title: "מנגו", category: "פירות", quantity: "יחידה", prices: { shufersal: 8.9, ramiLevy: 9.5, victory: 9.5, yohananof: 9.5, carrefour: 11.5, tivTaam: 9.5 } },
  { id: "65", title: "אוכמניות", category: "פירות", quantity: "125 גרם", prices: { shufersal: 14.9, ramiLevy: 17.5, victory: 16.5, yohananof: 17.5, carrefour: 15.5, tivTaam: 18.5 } },
  { id: "66", title: "תמרים מג'הול", category: "פירות", quantity: "500 גרם", prices: { shufersal: 31.9, ramiLevy: 35.9, victory: 30.9, yohananof: 31.9, carrefour: 32.9, tivTaam: 32.9 } },
  { id: "67", title: "חזה עוף טרי", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 49.9, ramiLevy: 49.9, victory: 47.9, yohananof: 50.9, carrefour: 53.9, tivTaam: 49.9 } },
  { id: "68", title: "שוקיים עוף", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 31.9, ramiLevy: 33.9, victory: 32.9, yohananof: 32.9, carrefour: 35.9, tivTaam: 32.9 } },
  { id: "69", title: "כנפיים עוף", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 26.9, ramiLevy: 23.9, victory: 24.9, yohananof: 24.9, carrefour: 26.9, tivTaam: 23.9 } },
  { id: "70", title: "עוף שלם", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 28.9, ramiLevy: 30.9, victory: 28.9, yohananof: 26.9, carrefour: 28.9, tivTaam: 27.9 } },
  { id: "71", title: "בקר טחון", category: "בשר ודגים", quantity: "500 גרם", prices: { shufersal: 39.9, ramiLevy: 41.9, victory: 39.9, yohananof: 36.9, carrefour: 40.9, tivTaam: 38.9 } },
  { id: "72", title: "אנטריקוט בקר", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 199.9, ramiLevy: 189.9, victory: 199.9, yohananof: 199.9, carrefour: 199.9, tivTaam: 169.9 } },
  { id: "73", title: "פילה בקר", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 249.9, ramiLevy: 269.9, victory: 269.9, yohananof: 249.9, carrefour: 219.9, tivTaam: 259.9 } },
  { id: "74", title: "כתף כבש", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 119.9, ramiLevy: 109.9, victory: 119.9, yohananof: 109.9, carrefour: 109.9, tivTaam: 129.9 } },
  { id: "75", title: "המבורגר בקר", category: "בשר ודגים", quantity: "4 יח'", prices: { shufersal: 41.9, ramiLevy: 39.9, victory: 35.9, yohananof: 38.9, carrefour: 41.9, tivTaam: 41.9 } },
  { id: "76", title: "נקניקיות עוף", category: "בשר ודגים", quantity: "500 גרם", prices: { shufersal: 24.9, ramiLevy: 23.9, victory: 22.9, yohananof: 24.9, carrefour: 26.9, tivTaam: 25.9 } },
  { id: "77", title: "סלמון טרי", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 119.9, ramiLevy: 109.9, victory: 119.9, yohananof: 119.9, carrefour: 109.9, tivTaam: 129.9 } },
  { id: "78", title: "סלמון מעושן", category: "בשר ודגים", quantity: "100 גרם", prices: { shufersal: 25.9, ramiLevy: 26.9, victory: 22.9, yohananof: 24.9, carrefour: 25.9, tivTaam: 25.9 } },
  { id: "79", title: "טונה בשמן", category: "בשר ודגים", quantity: "160 גרם", prices: { shufersal: 9.5, ramiLevy: 11.5, victory: 9.5, yohananof: 9.9, carrefour: 8.9, tivTaam: 10.5 } },
  { id: "80", title: "טונה במים", category: "בשר ודגים", quantity: "160 גרם", prices: { shufersal: 9.5, ramiLevy: 9.9, victory: 11.5, yohananof: 8.9, carrefour: 9.9, tivTaam: 9.9 } },
  { id: "81", title: "דניס", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 79.9, ramiLevy: 89.9, victory: 79.9, yohananof: 79.9, carrefour: 79.9, tivTaam: 89.9 } },
  { id: "82", title: "אמנון", category: "בשר ודגים", quantity: "1 ק\"ג", prices: { shufersal: 59.9, ramiLevy: 59.9, victory: 59.9, yohananof: 59.9, carrefour: 49.9, tivTaam: 59.9 } },
  { id: "83", title: "חלב 3%", category: "מוצרי חלב", quantity: "1 ליטר", prices: { shufersal: 6.5, ramiLevy: 6.9, victory: 7.5, yohananof: 6.5, carrefour: 7.5, tivTaam: 6.5 } },
  { id: "84", title: "חלב 1%", category: "מוצרי חלב", quantity: "1 ליטר", prices: { shufersal: 6.5, ramiLevy: 6.9, victory: 6.9, yohananof: 7.5, carrefour: 7.5, tivTaam: 6.5 } },
  { id: "85", title: "חלב סויה", category: "מוצרי חלב", quantity: "1 ליטר", prices: { shufersal: 14.5, ramiLevy: 14.5, victory: 14.5, yohananof: 13.5, carrefour: 16.5, tivTaam: 14.9 } },
  { id: "86", title: "חלב שקדים", category: "מוצרי חלב", quantity: "1 ליטר", prices: { shufersal: 16.5, ramiLevy: 17.5, victory: 14.9, yohananof: 16.5, carrefour: 16.5, tivTaam: 18.5 } },
  { id: "87", title: "גבינה צהובה אמנטל", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 17.9, ramiLevy: 19.5, victory: 19.9, yohananof: 19.9, carrefour: 21.9, tivTaam: 18.9 } },
  { id: "88", title: "גבינה צהובה גאודה", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 16.9, ramiLevy: 18.9, victory: 16.9, yohananof: 17.9, carrefour: 19.9, tivTaam: 19.9 } },
  { id: "89", title: "גבינה לבנה 5%", category: "מוצרי חלב", quantity: "250 גרם", prices: { shufersal: 7.5, ramiLevy: 8.5, victory: 7.5, yohananof: 6.9, carrefour: 8.5, tivTaam: 8.5 } },
  { id: "90", title: "גבינה לבנה 9%", category: "מוצרי חלב", quantity: "250 גרם", prices: { shufersal: 8.9, ramiLevy: 9.5, victory: 9.5, yohananof: 8.9, carrefour: 9.5, tivTaam: 7.9 } },
  { id: "91", title: "קוטג' 5%", category: "מוצרי חלב", quantity: "250 גרם", prices: { shufersal: 7.5, ramiLevy: 8.5, victory: 7.9, yohananof: 8.5, carrefour: 7.5, tivTaam: 7.9 } },
  { id: "92", title: "קוטג' 9%", category: "מוצרי חלב", quantity: "250 גרם", prices: { shufersal: 9.5, ramiLevy: 7.9, victory: 8.9, yohananof: 9.5, carrefour: 8.9, tivTaam: 8.5 } },
  { id: "93", title: "יוגורט טבעי", category: "מוצרי חלב", quantity: "150 גרם", prices: { shufersal: 4.9, ramiLevy: 4.5, victory: 4.5, yohananof: 4.9, carrefour: 5.5, tivTaam: 5.5 } },
  { id: "94", title: "יוגורט תות", category: "מוצרי חלב", quantity: "150 גרם", prices: { shufersal: 5.5, ramiLevy: 4.5, victory: 5.5, yohananof: 4.9, carrefour: 4.5, tivTaam: 5.5 } },
  { id: "95", title: "יוגורט יווני", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 9.9, ramiLevy: 8.5, victory: 9.5, yohananof: 9.5, carrefour: 7.9, tivTaam: 9.5 } },
  { id: "96", title: "שמנת מתוקה 38%", category: "מוצרי חלב", quantity: "250 מ\"ל", prices: { shufersal: 11.9, ramiLevy: 13.5, victory: 11.5, yohananof: 11.9, carrefour: 12.5, tivTaam: 12.5 } },
  { id: "97", title: "שמנת חמוצה 15%", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 6.5, ramiLevy: 6.5, victory: 6.5, yohananof: 6.5, carrefour: 7.9, tivTaam: 6.9 } },
  { id: "98", title: "חמאה", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 11.5, ramiLevy: 12.9, victory: 13.9, yohananof: 14.5, carrefour: 11.9, tivTaam: 12.5 } },
  { id: "99", title: "מרגרינה", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 7.9, ramiLevy: 7.5, victory: 7.5, yohananof: 8.5, carrefour: 6.9, tivTaam: 7.5 } },
  { id: "100", title: "גבינת פטה", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 14.9, ramiLevy: 14.5, victory: 13.5, yohananof: 14.5, carrefour: 14.5, tivTaam: 16.9 } },
  { id: "101", title: "גבינת מוצרלה", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 12.5, ramiLevy: 13.5, victory: 16.5, yohananof: 13.5, carrefour: 13.5, tivTaam: 15.5 } },
  { id: "102", title: "גבינת בולגרית", category: "מוצרי חלב", quantity: "200 גרם", prices: { shufersal: 12.9, ramiLevy: 14.5, victory: 13.5, yohananof: 13.5, carrefour: 13.5, tivTaam: 11.9 } },
  { id: "103", title: "מים מינרלים", category: "שתייה", quantity: "1.5 ליטר", prices: { shufersal: 5.5, ramiLevy: 4.9, victory: 4.5, yohananof: 5.5, carrefour: 4.5, tivTaam: 5.5 } },
  { id: "104", title: "מים מינרלים מארז", category: "שתייה", quantity: "6x1.5 ליטר", prices: { shufersal: 18.9, ramiLevy: 21.9, victory: 18.9, yohananof: 18.9, carrefour: 22.9, tivTaam: 19.9 } },
  { id: "105", title: "קוקה קולה", category: "שתייה", quantity: "1.5 ליטר", prices: { shufersal: 9.9, ramiLevy: 9.5, victory: 9.5, yohananof: 11.5, carrefour: 10.5, tivTaam: 9.9 } },
  { id: "106", title: "קוקה קולה זירו", category: "שתייה", quantity: "1.5 ליטר", prices: { shufersal: 10.5, ramiLevy: 11.5, victory: 9.5, yohananof: 10.5, carrefour: 9.9, tivTaam: 9.9 } },
  { id: "107", title: "ספרייט", category: "שתייה", quantity: "1.5 ליטר", prices: { shufersal: 9.5, ramiLevy: 10.5, victory: 9.5, yohananof: 8.9, carrefour: 9.5, tivTaam: 8.9 } },
  { id: "108", title: "פאנטה", category: "שתייה", quantity: "1.5 ליטר", prices: { shufersal: 9.9, ramiLevy: 8.9, victory: 8.5, yohananof: 9.5, carrefour: 9.9, tivTaam: 7.9 } },
  { id: "109", title: "מיץ תפוזים טבעי", category: "שתייה", quantity: "1 ליטר", prices: { shufersal: 16.5, ramiLevy: 15.5, victory: 15.5, yohananof: 14.9, carrefour: 14.9, tivTaam: 14.5 } },
  { id: "110", title: "מיץ תפוחים", category: "שתייה", quantity: "1 ליטר", prices: { shufersal: 13.5, ramiLevy: 12.5, victory: 12.5, yohananof: 11.5, carrefour: 12.5, tivTaam: 11.9 } },
  { id: "111", title: "מיץ ענבים", category: "שתייה", quantity: "1 ליטר", prices: { shufersal: 13.5, ramiLevy: 13.5, victory: 13.5, yohananof: 12.5, carrefour: 13.5, tivTaam: 14.5 } },
  { id: "112", title: "תה ירוק", category: "שתייה", quantity: "25 שקיות", prices: { shufersal: 14.5, ramiLevy: 13.9, victory: 13.5, yohananof: 14.5, carrefour: 17.5, tivTaam: 15.5 } },
  { id: "113", title: "תה שחור", category: "שתייה", quantity: "25 שקיות", prices: { shufersal: 11.5, ramiLevy: 12.5, victory: 11.5, yohananof: 12.5, carrefour: 11.5, tivTaam: 11.5 } },
  { id: "114", title: "קפה נמס עלית", category: "שתייה", quantity: "200 גרם", prices: { shufersal: 31.9, ramiLevy: 33.9, victory: 28.9, yohananof: 31.9, carrefour: 32.9, tivTaam: 32.9 } },
  { id: "115", title: "קפה טורקי", category: "שתייה", quantity: "200 גרם", prices: { shufersal: 17.9, ramiLevy: 18.5, victory: 17.5, yohananof: 16.9, carrefour: 19.5, tivTaam: 18.5 } },
  { id: "116", title: "בירה גולדסטאר", category: "שתייה", quantity: "500 מ\"ל", prices: { shufersal: 9.9, ramiLevy: 9.5, victory: 8.5, yohananof: 8.9, carrefour: 9.5, tivTaam: 8.9 } },
  { id: "117", title: "בירה היינקן", category: "שתייה", quantity: "500 מ\"ל", prices: { shufersal: 11.9, ramiLevy: 12.5, victory: 11.5, yohananof: 11.9, carrefour: 11.9, tivTaam: 13.9 } },
  { id: "118", title: "יין אדום", category: "שתייה", quantity: "750 מ\"ל", prices: { shufersal: 39.9, ramiLevy: 39.9, victory: 39.9, yohananof: 35.9, carrefour: 39.9, tivTaam: 35.9 } },
  { id: "119", title: "יין לבן", category: "שתייה", quantity: "750 מ\"ל", prices: { shufersal: 39.9, ramiLevy: 39.9, victory: 41.9, yohananof: 39.9, carrefour: 35.9, tivTaam: 39.9 } },
  { id: "120", title: "נייר טואלט", category: "מוצרי ניקיון", quantity: "32 גלילים", prices: { shufersal: 49.9, ramiLevy: 49.9, victory: 49.9, yohananof: 49.9, carrefour: 49.9, tivTaam: 43.9 } },
  { id: "121", title: "מגבונים לחים", category: "מוצרי ניקיון", quantity: "80 יח'", prices: { shufersal: 14.9, ramiLevy: 14.5, victory: 14.5, yohananof: 14.5, carrefour: 17.5, tivTaam: 13.5 } },
  { id: "122", title: "נייר מטבח", category: "מוצרי ניקיון", quantity: "4 גלילים", prices: { shufersal: 19.9, ramiLevy: 21.9, victory: 19.9, yohananof: 18.9, carrefour: 19.9, tivTaam: 17.9 } },
  { id: "123", title: "שמפו לשיער", category: "מוצרי ניקיון", quantity: "700 מ\"ל", prices: { shufersal: 22.9, ramiLevy: 28.9, victory: 24.9, yohananof: 25.9, carrefour: 24.9, tivTaam: 24.9 } },
  { id: "124", title: "מרכך לשיער", category: "מוצרי ניקיון", quantity: "700 מ\"ל", prices: { shufersal: 26.9, ramiLevy: 24.9, victory: 24.9, yohananof: 22.9, carrefour: 25.9, tivTaam: 23.9 } },
  { id: "125", title: "סבון נוזלי", category: "מוצרי ניקיון", quantity: "500 מ\"ל", prices: { shufersal: 13.9, ramiLevy: 14.5, victory: 17.5, yohananof: 14.9, carrefour: 13.9, tivTaam: 14.5 } },
  { id: "126", title: "סבון כלים", category: "מוצרי ניקיון", quantity: "750 מ\"ל", prices: { shufersal: 16.9, ramiLevy: 16.5, victory: 19.5, yohananof: 16.5, carrefour: 14.9, tivTaam: 16.9 } },
  { id: "127", title: "אבקת כביסה", category: "מוצרי ניקיון", quantity: "3 ק\"ג", prices: { shufersal: 49.9, ramiLevy: 49.9, victory: 56.9, yohananof: 49.9, carrefour: 43.9, tivTaam: 49.9 } },
  { id: "128", title: "מרכך כביסה", category: "מוצרי ניקיון", quantity: "1 ליטר", prices: { shufersal: 23.9, ramiLevy: 23.9, victory: 19.9, yohananof: 22.9, carrefour: 22.9, tivTaam: 23.9 } },
  { id: "129", title: "אקונומיקה", category: "מוצרי ניקיון", quantity: "2 ליטר", prices: { shufersal: 14.9, ramiLevy: 14.9, victory: 14.5, yohananof: 14.5, carrefour: 16.5, tivTaam: 13.5 } },
  { id: "130", title: "מטהר אסלות", category: "מוצרי ניקיון", quantity: "750 מ\"ל", prices: { shufersal: 17.5, ramiLevy: 14.9, victory: 18.5, yohananof: 16.9, carrefour: 16.9, tivTaam: 16.5 } },
  { id: "131", title: "ספריי ניקוי כללי", category: "מוצרי ניקיון", quantity: "750 מ\"ל", prices: { shufersal: 16.9, ramiLevy: 19.9, victory: 18.9, yohananof: 19.5, carrefour: 18.9, tivTaam: 21.9 } },
  { id: "132", title: "שקיות אשפה", category: "מוצרי ניקיון", quantity: "30 יח'", prices: { shufersal: 19.9, ramiLevy: 20.9, victory: 17.9, yohananof: 18.9, carrefour: 22.9, tivTaam: 19.9 } },
  { id: "133", title: "משחת שיניים", category: "מוצרי ניקיון", quantity: "100 מ\"ל", prices: { shufersal: 14.9, ramiLevy: 13.9, victory: 14.5, yohananof: 14.5, carrefour: 13.5, tivTaam: 16.5 } },
  { id: "134", title: "מברשת שיניים", category: "מוצרי ניקיון", quantity: "יחידה", prices: { shufersal: 9.5, ramiLevy: 9.9, victory: 11.5, yohananof: 9.5, carrefour: 9.9, tivTaam: 10.5 } },
  { id: "135", title: "דאודורנט", category: "מוצרי ניקיון", quantity: "150 מ\"ל", prices: { shufersal: 17.9, ramiLevy: 19.9, victory: 19.9, yohananof: 19.9, carrefour: 22.9, tivTaam: 19.5 } },
  { id: "136", title: "במבה", category: "חטיפים ומתוקים", quantity: "80 גרם", prices: { shufersal: 5.5, ramiLevy: 4.5, victory: 4.5, yohananof: 4.5, carrefour: 5.5, tivTaam: 4.5 } },
  { id: "137", title: "ביסלי גריל", category: "חטיפים ומתוקים", quantity: "70 גרם", prices: { shufersal: 4.5, ramiLevy: 5.5, victory: 4.5, yohananof: 4.5, carrefour: 4.5, tivTaam: 5.5 } },
  { id: "138", title: "ביסלי בצל", category: "חטיפים ומתוקים", quantity: "70 גרם", prices: { shufersal: 4.5, ramiLevy: 5.5, victory: 4.5, yohananof: 5.5, carrefour: 5.5, tivTaam: 4.5 } },
  { id: "139", title: "ביסלי פיצה", category: "חטיפים ומתוקים", quantity: "70 גרם", prices: { shufersal: 5.5, ramiLevy: 5.5, victory: 4.5, yohananof: 4.5, carrefour: 5.5, tivTaam: 4.5 } },
  { id: "140", title: "צ'יפס תפוצ'יפס", category: "חטיפים ומתוקים", quantity: "85 גרם", prices: { shufersal: 7.5, ramiLevy: 9.5, victory: 8.5, yohananof: 7.5, carrefour: 7.5, tivTaam: 7.5 } },
  { id: "141", title: "דוריטוס", category: "חטיפים ומתוקים", quantity: "90 גרם", prices: { shufersal: 8.9, ramiLevy: 9.5, victory: 8.5, yohananof: 8.5, carrefour: 9.5, tivTaam: 7.9 } },
  { id: "142", title: "צ'יטוס", category: "חטיפים ומתוקים", quantity: "85 גרם", prices: { shufersal: 7.9, ramiLevy: 8.9, victory: 7.9, yohananof: 6.9, carrefour: 7.5, tivTaam: 7.5 } },
  { id: "143", title: "שוקולד חלב פרה", category: "חטיפים ומתוקים", quantity: "100 גרם", prices: { shufersal: 9.5, ramiLevy: 9.9, victory: 11.5, yohananof: 9.9, carrefour: 9.5, tivTaam: 10.5 } },
  { id: "144", title: "שוקולד מריר", category: "חטיפים ומתוקים", quantity: "100 גרם", prices: { shufersal: 11.5, ramiLevy: 12.5, victory: 12.5, yohananof: 12.5, carrefour: 13.5, tivTaam: 10.9 } },
  { id: "145", title: "שוקולד למבורנה", category: "חטיפים ומתוקים", quantity: "100 גרם", prices: { shufersal: 13.9, ramiLevy: 13.5, victory: 13.5, yohananof: 11.5, carrefour: 13.5, tivTaam: 12.5 } },
  { id: "146", title: "קליק", category: "חטיפים ומתוקים", quantity: "33 גרם", prices: { shufersal: 4.5, ramiLevy: 4.5, victory: 5.5, yohananof: 4.5, carrefour: 4.5, tivTaam: 4.5 } },
  { id: "147", title: "פסק זמן", category: "חטיפים ומתוקים", quantity: "45 גרם", prices: { shufersal: 6.5, ramiLevy: 5.5, victory: 6.5, yohananof: 6.5, carrefour: 6.5, tivTaam: 5.5 } },
  { id: "148", title: "מקופלת", category: "חטיפים ומתוקים", quantity: "45 גרם", prices: { shufersal: 5.5, ramiLevy: 6.5, victory: 5.5, yohananof: 5.5, carrefour: 6.5, tivTaam: 5.5 } },
  { id: "149", title: "עוגיות אוראו", category: "חטיפים ומתוקים", quantity: "176 גרם", prices: { shufersal: 16.9, ramiLevy: 14.9, victory: 13.5, yohananof: 14.5, carrefour: 14.9, tivTaam: 14.5 } },
  { id: "150", title: "עוגיות פתי בר", category: "חטיפים ומתוקים", quantity: "200 גרם", prices: { shufersal: 8.9, ramiLevy: 9.9, victory: 9.9, yohananof: 7.9, carrefour: 8.9, tivTaam: 8.9 } },
  { id: "151", title: "ופלים", category: "חטיפים ומתוקים", quantity: "200 גרם", prices: { shufersal: 12.5, ramiLevy: 13.5, victory: 13.5, yohananof: 12.5, carrefour: 11.5, tivTaam: 11.9 } },
  { id: "152", title: "מסטיק", category: "חטיפים ומתוקים", quantity: "10 יח'", prices: { shufersal: 5.5, ramiLevy: 4.5, victory: 5.5, yohananof: 5.5, carrefour: 4.5, tivTaam: 5.5 } },
  { id: "153", title: "סוכריות גומי", category: "חטיפים ומתוקים", quantity: "100 גרם", prices: { shufersal: 7.9, ramiLevy: 8.5, victory: 7.5, yohananof: 6.9, carrefour: 7.5, tivTaam: 7.9 } },
  { id: "154", title: "גלידה וניל", category: "חטיפים ומתוקים", quantity: "1 ליטר", prices: { shufersal: 21.9, ramiLevy: 19.9, victory: 18.9, yohananof: 19.9, carrefour: 18.9, tivTaam: 22.9 } },
  { id: "155", title: "גלידה שוקולד", category: "חטיפים ומתוקים", quantity: "1 ליטר", prices: { shufersal: 19.9, ramiLevy: 19.9, victory: 18.9, yohananof: 18.9, carrefour: 22.9, tivTaam: 18.9 } }
];

//    tore Name Mapping to Hebrew
const STORE_NAMES = {
  shufersal: "שופרסל",
  ramiLevy: "רמי לוי",
  victory: "ויקטורי",
  yohananof: "יוחננוף",
  carrefour: "קרפור",
  tivTaam: "טיב טעם"
};

// Transforming Product Data into an App-Compatible Format
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

// Home route - returns API info
app.get("/", (req, res) => {
  res.json({
    name: "Shoply API",
    version: "1.1.0",
    totalProducts: products.length,
    endpoints: [
      "GET /products",
      "GET /products?category=<קטגוריה>",
      "GET /products?search=<חיפוש>",
      "GET /products/:id",
      "GET /categories"
    ]
  });
});

 // All products - with filtering and search
  app.get("/products", (req, res) => {
  let result = products.map(toApiFormat);

  //  Filter by category
  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }

  // Search by name
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(p => p.title.toLowerCase().includes(search));
  }

  res.json(result);
});

// Product by ID
app.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "מוצר לא נמצא" });
  }
  res.json(toApiFormat(product));
});

// Category list
app.get("/categories", (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// ============================================================
//   Start the server
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Shoply API running on port ${PORT}`);
  console.log(`✓ Total products: ${products.length}`);
});
