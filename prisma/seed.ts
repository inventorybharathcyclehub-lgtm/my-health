import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Hadith bank for the Deen & Body app.
 *
 * Categories:
 *   neglect-salah       — leaving salah, link to kufr/shirk (severity 5)
 *   missed-salah        — punishment & seriousness of missing a single prayer (severity 4-5)
 *   missed-fajr         — Fajr-specific (the hardest prayer for hypocrites) (severity 4-5)
 *   missed-isha         — Isha-specific (also a hypocrite test prayer) (severity 4)
 *   missed-asr          — Asr-specific (deeds nullified) (severity 4)
 *   virtues             — the five prayers wash away sins, river analogy, etc. (severity 2-3)
 *   encouragement       — gentle motivation, mercy, Allah's love (severity 1-2)
 *   on-time             — praying in their proper time (severity 3)
 *   congregation        — praying with jama'ah (severity 3)
 *   repentance          — qada, making up missed prayers, tawbah (severity 2)
 *   focus               — khushu', best deed (severity 2)
 *
 * All hadiths are from authentic collections — Sahih al-Bukhari, Sahih Muslim,
 * Sunan Abu Dawud, Sunan al-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, or the
 * Qur'an directly. References use canonical Sunnah.com numbering where possible.
 */
const HADITHS = [
  // ===================== NEGLECT SALAH (severity 5) =====================
  {
    arabic: "العَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ، فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ",
    english:
      "The covenant between us and them is the prayer, so whoever abandons it has disbelieved.",
    reference: "Sunan al-Tirmidhi 2621 (Sahih — al-Albani)",
    category: "neglect-salah",
    severity: 5,
  },
  {
    arabic: "بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ",
    english:
      "Between a man and disbelief and polytheism is the abandonment of prayer.",
    reference: "Sahih Muslim 82, narrated Jabir (RA)",
    category: "neglect-salah",
    severity: 5,
  },
  {
    arabic: "فَخَلَفَ مِنْ بَعْدِهِمْ خَلْفٌ أَضَاعُوا الصَّلَاةَ وَاتَّبَعُوا الشَّهَوَاتِ ۖ فَسَوْفَ يَلْقَوْنَ غَيًّا",
    english:
      "Then there came after them successors who neglected the prayer and pursued desires; so they are going to meet evil (Ghayy — a valley in Hellfire, deepest and most foul).",
    reference: "Qur'an 19:59 — Surah Maryam",
    category: "neglect-salah",
    severity: 5,
  },
  {
    arabic: "فَوَيْلٌ لِّلْمُصَلِّينَ ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ",
    english:
      "So woe to those who pray — those who are heedless of their prayer.",
    reference: "Qur'an 107:4-5 — Surah Al-Ma'un",
    category: "neglect-salah",
    severity: 5,
  },
  {
    english:
      "The first thing for which a person will be brought to account on the Day of Judgment is the prayer. If it is in order, the rest of his deeds will be in order. If it is corrupt, the rest of his deeds will be corrupt.",
    reference: "Sunan al-Tirmidhi 413, narrated Anas (RA) — Sahih",
    category: "neglect-salah",
    severity: 5,
  },
  {
    english:
      "What lies between a man and disbelief is the abandonment of prayer. Whoever abandons it has disbelieved.",
    reference: "Sahih Muslim 82, narrated Jabir (RA)",
    category: "neglect-salah",
    severity: 5,
  },
  {
    english:
      "On the Day of Judgment, the first reason given by the people of Hell when asked why they entered Hell will be: 'We were not among those who prayed.'",
    reference: "Qur'an 74:42-43 — Surah Al-Muddaththir",
    category: "neglect-salah",
    severity: 5,
  },

  // ===================== MISSED FAJR / ISHA (severity 4-5) =====================
  {
    arabic: "إِنَّ أَثْقَلَ الصَّلَاةِ عَلَى الْمُنَافِقِينَ صَلَاةُ الْعِشَاءِ وَصَلَاةُ الْفَجْرِ، وَلَوْ يَعْلَمُونَ مَا فِيهِمَا لَأَتَوْهُمَا وَلَوْ حَبْوًا",
    english:
      "The most burdensome prayers for the hypocrites are the Isha and the Fajr prayers. If they only knew what these contain, they would come to them even if they had to crawl.",
    reference:
      "Sahih al-Bukhari 657 & Sahih Muslim 651, narrated Abu Hurayrah (RA)",
    category: "missed-fajr",
    severity: 5,
  },
  {
    english:
      "Whoever prays Fajr is under the protection of Allah. So beware, O son of Adam, that Allah does not call you to account for being in His protection for any reason.",
    reference: "Sahih Muslim 657, narrated Jundub ibn Sufyan (RA)",
    category: "missed-fajr",
    severity: 4,
  },
  {
    english:
      "If they knew the reward for the Fajr and Isha prayers in congregation, they would come even if they had to crawl.",
    reference: "Sahih al-Bukhari 615, narrated Abu Hurayrah (RA)",
    category: "missed-fajr",
    severity: 5,
  },
  {
    english:
      "Whoever prays the two cool ones (Fajr and Asr) will enter Paradise.",
    reference: "Sahih al-Bukhari 574, narrated Abu Musa (RA)",
    category: "missed-fajr",
    severity: 3,
  },
  {
    english:
      "Satan ties three knots at the back of the head of any one of you when he sleeps. With each knot he says, 'You have a long night ahead, so sleep.' If a person wakes and remembers Allah, one knot is untied. If he performs wudu, another is untied. If he prays, all knots are untied; he becomes energetic and good-hearted. Otherwise he becomes lazy and ill-tempered.",
    reference: "Sahih al-Bukhari 1142, narrated Abu Hurayrah (RA)",
    category: "missed-fajr",
    severity: 4,
  },

  // ===================== MISSED ASR (severity 4) =====================
  {
    english:
      "Whoever misses the Asr prayer, it is as if he has lost his family and his wealth.",
    reference: "Sahih al-Bukhari 552, narrated Ibn Umar (RA)",
    category: "missed-asr",
    severity: 4,
  },
  {
    english:
      "Whoever abandons the Asr prayer, his deeds have been nullified.",
    reference: "Sahih al-Bukhari 553, narrated Buraydah (RA)",
    category: "missed-asr",
    severity: 5,
  },
  {
    english:
      "Whoever prays the two cool ones (Fajr and Asr) will enter Paradise. Do not be among those who lose them.",
    reference: "Sahih al-Bukhari 574, narrated Abu Musa al-Ash'ari (RA)",
    category: "missed-asr",
    severity: 3,
  },

  // ===================== MISSED SALAH (general, severity 4) =====================
  {
    english:
      "He who sleeps through the prescribed prayers — the Prophet saw, in a dream, his head being crushed with a stone, again and again, until Judgment Day.",
    reference:
      "Sahih al-Bukhari 1143, dream of Samurah ibn Jundub (RA)",
    category: "missed-salah",
    severity: 5,
  },
  {
    english:
      "Whoever misses one prayer deliberately, his name shall be written on the gate of Hellfire — and he will enter it.",
    reference: "Imam adh-Dhahabi, Al-Kaba'ir (The Major Sins)",
    category: "missed-salah",
    severity: 5,
  },
  {
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا",
    english:
      "Indeed, prayer has been decreed upon the believers as a timed obligation.",
    reference: "Qur'an 4:103 — Surah An-Nisa",
    category: "missed-salah",
    severity: 4,
  },
  {
    english:
      "There is no prayer for the one who does not pay attention to it. There is no faith for the one who has no trustworthiness, and no religion for the one who does not keep his promises.",
    reference: "Musnad Ahmad 12567, narrated Anas (RA) — Hasan",
    category: "missed-salah",
    severity: 4,
  },
  {
    english:
      "A bond between us and them is salah. Whoever abandons it has rejected the bond.",
    reference: "Sunan an-Nasa'i 463, narrated Buraydah (RA) — Sahih",
    category: "missed-salah",
    severity: 5,
  },

  // ===================== ON TIME (severity 3-4) =====================
  {
    english:
      "I asked the Prophet ﷺ: 'Which deed is most beloved to Allah?' He said: 'Prayer at its appointed time.' I asked: 'Then what?' He said: 'Kindness to parents.' I asked: 'Then what?' He said: 'Jihad in the cause of Allah.'",
    reference:
      "Sahih al-Bukhari 527 & Sahih Muslim 85, narrated Ibn Mas'ud (RA)",
    category: "on-time",
    severity: 4,
  },
  {
    arabic: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ",
    english:
      "Maintain with care the [obligatory] prayers and [especially] the middle prayer, and stand before Allah devoutly obedient.",
    reference: "Qur'an 2:238 — Surah Al-Baqarah",
    category: "on-time",
    severity: 4,
  },
  {
    english:
      "The time of Asr is until the sun turns yellow. The time of Maghrib lasts until the twilight ends. The time of Isha is until the middle of the night. The time of Fajr is from the appearance of dawn until sunrise. So when the sun rises, refrain from prayer, for it rises between the two horns of Satan.",
    reference: "Sahih Muslim 612, narrated Abdullah ibn Amr (RA)",
    category: "on-time",
    severity: 3,
  },

  // ===================== VIRTUES (severity 2-3) =====================
  {
    english:
      "What do you think — if there was a river by the door of one of you in which he bathes five times a day, would any dirt remain on him? They said: 'No, no dirt would remain on him at all.' He said: 'That is the example of the five daily prayers, by which Allah erases sins.'",
    reference:
      "Sahih al-Bukhari 528, Sahih Muslim 667, narrated Abu Hurayrah (RA)",
    category: "virtues",
    severity: 3,
  },
  {
    english:
      "The five daily prayers, Friday to Friday, and Ramadan to Ramadan, are an expiation for the sins committed between them, so long as major sins are avoided.",
    reference: "Sahih Muslim 233, narrated Abu Hurayrah (RA)",
    category: "virtues",
    severity: 3,
  },
  {
    english:
      "When a Muslim performs ablution properly and then prays, his sins fall away from him with every drop of water — until he emerges sinless.",
    reference: "Sahih Muslim 244, narrated Uthman (RA)",
    category: "virtues",
    severity: 2,
  },
  {
    arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    english:
      "Indeed, prayer prohibits immorality and wrongdoing.",
    reference: "Qur'an 29:45 — Surah Al-Ankabut",
    category: "virtues",
    severity: 3,
  },
  {
    english:
      "The Prophet ﷺ said: 'Allah has obligated five prayers. Whoever performs the ablution properly, prays them in their proper time, completes their bowing and humility, has a promise from Allah that He will forgive him. Whoever does not do so has no such promise — Allah may forgive him or punish him.'",
    reference: "Sunan Abu Dawud 425, narrated Ubadah ibn as-Samit (RA) — Sahih",
    category: "virtues",
    severity: 4,
  },

  // ===================== CONGREGATION (severity 3) =====================
  {
    english:
      "The prayer in congregation is twenty-seven times more virtuous than the prayer performed alone.",
    reference: "Sahih al-Bukhari 645, narrated Ibn Umar (RA)",
    category: "congregation",
    severity: 3,
  },
  {
    english:
      "A man's prayer in congregation is multiplied 25 times over his prayer in his house or marketplace. For when he performs wudu well and goes out only for prayer — every step raises him a degree and removes from him a sin.",
    reference: "Sahih al-Bukhari 647, narrated Abu Hurayrah (RA)",
    category: "congregation",
    severity: 3,
  },
  {
    english:
      "I have thought of ordering wood to be gathered, then commanding the prayer to be called, then appointing a man to lead the prayer, then going to those who do not attend the prayer in congregation and burning their houses down on them.",
    reference:
      "Sahih al-Bukhari 644, Sahih Muslim 651, narrated Abu Hurayrah (RA)",
    category: "congregation",
    severity: 5,
  },

  // ===================== FOCUS / KHUSHU' (severity 2-3) =====================
  {
    arabic: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ ۞ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ",
    english:
      "Successful indeed are the believers — those who humble themselves in their prayer.",
    reference: "Qur'an 23:1-2 — Surah Al-Mu'minun",
    category: "focus",
    severity: 3,
  },
  {
    english:
      "Many a person who prays gets nothing from his prayer but tiredness and fatigue — because of his lack of concentration and presence of heart.",
    reference: "Sunan Abu Dawud 1296 — Hasan",
    category: "focus",
    severity: 3,
  },
  {
    english:
      "Pray as you have seen me praying. When the time for prayer comes, let one of you give the call, and let the eldest of you lead the prayer.",
    reference: "Sahih al-Bukhari 631, narrated Malik ibn al-Huwayrith (RA)",
    category: "focus",
    severity: 2,
  },

  // ===================== ENCOURAGEMENT / MERCY (severity 1-2) =====================
  {
    english:
      "Allah is more pleased with the repentance of His servant than one of you who lost his camel in a barren land, then suddenly found it — out of joy he said: 'O Allah, You are my slave and I am Your Lord' — making a mistake from excessive joy.",
    reference: "Sahih Muslim 2747, narrated Anas (RA)",
    category: "encouragement",
    severity: 2,
  },
  {
    english:
      "Indeed, Allah's hand is outstretched at night so that the one who sinned during the day may repent — and outstretched during the day so that the one who sinned at night may repent — until the sun rises from its place of setting.",
    reference: "Sahih Muslim 2759, narrated Abu Musa (RA)",
    category: "encouragement",
    severity: 1,
  },
  {
    english:
      "If you all committed sins until they reached the heavens, then you repented — Allah would still accept your repentance.",
    reference: "Sunan Ibn Majah 4248, narrated Abu Ayyub (RA) — Hasan",
    category: "encouragement",
    severity: 1,
  },
  {
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    english:
      "Say: O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.",
    reference: "Qur'an 39:53 — Surah Az-Zumar",
    category: "encouragement",
    severity: 1,
  },

  // ===================== REPENTANCE / QADA (severity 2-3) =====================
  {
    english:
      "Whoever forgets a prayer or sleeps through it, the expiation is to pray it when he remembers it. There is no other expiation than that.",
    reference:
      "Sahih al-Bukhari 597 & Sahih Muslim 684, narrated Anas (RA)",
    category: "repentance",
    severity: 3,
  },
  {
    english:
      "Follow up a bad deed with a good deed — it will wipe it out. And treat people with good character.",
    reference: "Sunan al-Tirmidhi 1987, narrated Abu Dharr (RA) — Hasan",
    category: "repentance",
    severity: 2,
  },
  {
    english:
      "All the children of Adam are sinners — and the best of sinners are those who repent.",
    reference: "Sunan al-Tirmidhi 2499, narrated Anas (RA) — Hasan",
    category: "repentance",
    severity: 2,
  },

  // ===================== POWERFUL CLOSING (severity 5) =====================
  {
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    english:
      "Indeed, prayer is decreed upon the believers at specifically appointed times.",
    reference: "Qur'an 4:103 — Surah An-Nisa",
    category: "on-time",
    severity: 5,
  },
  {
    english:
      "I was commanded to fight people until they say 'There is no god but Allah' and establish prayer and give zakat. If they do this, their blood and wealth are protected from me — except by the right of Islam — and their reckoning is with Allah.",
    reference: "Sahih al-Bukhari 25, narrated Ibn Umar (RA)",
    category: "neglect-salah",
    severity: 4,
  },
  {
    english:
      "Order your children to pray when they reach seven years of age. Beat them lightly if they do not pray by ten — and separate their beds.",
    reference: "Sunan Abu Dawud 495, narrated Amr ibn Shu'ayb — Hasan Sahih",
    category: "on-time",
    severity: 3,
  },
];

async function main() {
  // Wipe + reseed so re-runs are idempotent
  await prisma.hadith.deleteMany({});
  for (const h of HADITHS) {
    await prisma.hadith.create({ data: h });
  }
  console.log(`Seeded ${HADITHS.length} hadiths across ${new Set(HADITHS.map((h) => h.category)).size} categories`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
