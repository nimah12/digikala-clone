// تبدیل اسم فارسی به slug انگلیسی (حروف، اعداد و خط تیره)
const FA_TO_EN: Record<string, string> = {
  ا: "a",
  آ: "a",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "gh",
  ک: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "v",
  ه: "h",
  ی: "y",
  ئ: "y",
  ء: "",
  " ": "-",
};

const FA_DIGITS: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

export function slugify(input: string): string {
  const normalized = input.replace(/[ي]/g, "ی").replace(/[ك]/g, "ک");
  let out = "";
  for (const ch of normalized.trim().toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
    } else if (FA_DIGITS[ch]) {
      out += FA_DIGITS[ch];
    } else if (FA_TO_EN[ch] !== undefined) {
      out += FA_TO_EN[ch];
    } else {
      out += "-";
    }
  }
  return out
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
