import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HADITHS = [
  {
    arabic: "العَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ، فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ",
    english: "The covenant between us and them is the prayer, so whoever abandons it has disbelieved.",
    reference: "Tirmidhi 2621 — Sahih (al-Albani)",
    category: "neglect-salah",
    severity: 5,
  },
  {
    english: "The first thing a person will be questioned about on the Day of Judgment is the prayer. If it is sound, the rest of his deeds will be sound. If it is corrupt, the rest of his deeds will be corrupt.",
    reference: "Tirmidhi 413",
    category: "missed-salah",
    severity: 5,
  },
  {
    english: "Between a man and disbelief and paganism is the abandonment of salah.",
    reference: "Sahih Muslim 82",
    category: "neglect-salah",
    severity: 5,
  },
  {
    arabic: "فَوَيْلٌ لِّلْمُصَلِّينَ ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ",
    english: "So woe to those who pray — those who are heedless of their prayer.",
    reference: "Qur'an 107:4-5 (Surah Al-Ma'un)",
    category: "missed-salah",
    severity: 5,
  },
  {
    english: "Whoever misses the Asr prayer, it is as if he has lost his family and his wealth.",
    reference: "Sahih al-Bukhari 552",
    category: "missed-salah",
    severity: 4,
  },
  {
    english: "Whoever prays Fajr in congregation is under the protection of Allah.",
    reference: "Sahih Muslim 657",
    category: "encouragement",
    severity: 2,
  },
  {
    english: "The five daily prayers are like a river flowing at the door of one of you in which he bathes five times a day. Do you think any dirt would remain on him?",
    reference: "Sahih al-Bukhari 528",
    category: "encouragement",
    severity: 2,
  },
  {
    english: "The hypocrites' heaviest prayers are Isha and Fajr. If they knew what is in them, they would come even crawling.",
    reference: "Sahih al-Bukhari 657",
    category: "missed-salah",
    severity: 4,
  },
];

async function main() {
  for (const h of HADITHS) {
    await prisma.hadith.create({ data: h });
  }
  console.log(`Seeded ${HADITHS.length} hadiths`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
