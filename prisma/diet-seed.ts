import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Indian-halal meal options engineered for ~1900 kcal/day, high-protein.
 * Targets at 101 kg starting weight cutting to 80 kg:
 *   Daily target: ~1900 kcal (≈800 kcal deficit from ~2700 TDEE)
 *   Protein: 150-180 g (prevents muscle loss while cutting)
 *   Carbs: 180-220 g (moderate — supports cycling)
 *   Fat: 55-65 g
 *
 * Suggested daily structure:
 *   Breakfast 500 · Lunch 600 · Dinner 550 · Snack 250 = 1900 kcal
 */
const MEALS = [
  // ===================== BREAKFAST (~500 kcal) =====================
  {
    name: "Egg bhurji (4 eggs) + 1 chapati",
    mealType: "breakfast",
    calories: 480, proteinG: 32, carbsG: 22, fatG: 28, fiberG: 3,
    description: "Scrambled eggs with onion, tomato, coriander. 1 medium wheat chapati.",
    tags: ["high-protein", "quick"], sortOrder: 1,
  },
  {
    name: "Greek yogurt 200g + 30g almonds + 1 banana",
    mealType: "breakfast",
    calories: 510, proteinG: 28, carbsG: 50, fatG: 22, fiberG: 7,
    description: "Plain unsweetened greek yogurt, raw almonds, ripe banana.",
    tags: ["high-protein", "no-cook", "high-fiber"], sortOrder: 2,
  },
  {
    name: "Oats 60g + whey scoop + skim milk 250ml + banana",
    mealType: "breakfast",
    calories: 520, proteinG: 38, carbsG: 65, fatG: 8, fiberG: 8,
    description: "Steel-cut or rolled oats cooked with skim milk, 1 scoop whey protein, sliced banana on top.",
    tags: ["high-protein", "high-carb", "pre-workout"], sortOrder: 3,
  },
  {
    name: "3-egg omelet + 1 slice multigrain toast",
    mealType: "breakfast",
    calories: 420, proteinG: 28, carbsG: 18, fatG: 24, fiberG: 4,
    description: "Eggs with capsicum, onion, paneer cubes. 1 slice multigrain bread.",
    tags: ["high-protein", "low-carb"], sortOrder: 4,
  },
  {
    name: "Paneer paratha (1) + curd 100g",
    mealType: "breakfast",
    calories: 510, proteinG: 24, carbsG: 42, fatG: 26, fiberG: 4,
    description: "Stuffed paratha with paneer, minimal ghee. Plain curd on side.",
    tags: ["vegetarian", "high-protein"], sortOrder: 5,
  },

  // ===================== LUNCH (~600 kcal) =====================
  {
    name: "Grilled chicken 200g + 1 chapati + salad",
    mealType: "lunch",
    calories: 580, proteinG: 50, carbsG: 32, fatG: 22, fiberG: 6,
    description: "Tandoori or grilled chicken breast, 1 wheat chapati, cucumber-onion-tomato salad with lemon.",
    tags: ["high-protein", "lean"], sortOrder: 1,
  },
  {
    name: "Chicken biryani 1 plate (~250g) + raita 100g",
    mealType: "lunch",
    calories: 680, proteinG: 35, carbsG: 75, fatG: 22, fiberG: 4,
    description: "Moderate portion biryani, plain curd raita. Skip the fried onion topping.",
    tags: ["high-protein", "occasional"], sortOrder: 2,
  },
  {
    name: "Mutton curry 150g + 1 chapati + dal 100ml",
    mealType: "lunch",
    calories: 620, proteinG: 38, carbsG: 38, fatG: 28, fiberG: 5,
    description: "Lean mutton curry (trim fat), 1 chapati, thin moong dal.",
    tags: ["high-protein"], sortOrder: 3,
  },
  {
    name: "Fish curry 200g + 100g brown rice + salad",
    mealType: "lunch",
    calories: 560, proteinG: 42, carbsG: 45, fatG: 18, fiberG: 6,
    description: "Pomfret/rohu in light curry, brown rice (cooked 100g), green salad.",
    tags: ["high-protein", "omega-3"], sortOrder: 4,
  },
  {
    name: "Rajma + 1 chapati + curd",
    mealType: "lunch",
    calories: 540, proteinG: 22, carbsG: 70, fatG: 12, fiberG: 12,
    description: "Rajma curry (1 cup cooked), 1 chapati, 100g plain curd.",
    tags: ["vegetarian", "high-fiber"], sortOrder: 5,
  },

  // ===================== DINNER (~550 kcal) =====================
  {
    name: "Grilled chicken 200g + sautéed vegetables",
    mealType: "dinner",
    calories: 460, proteinG: 48, carbsG: 18, fatG: 20, fiberG: 7,
    description: "Chicken breast grilled with herbs, mixed vegetables sautéed in 1 tsp olive oil.",
    tags: ["high-protein", "low-carb", "cutting"], sortOrder: 1,
  },
  {
    name: "Chicken shorba + 1 chapati + salad",
    mealType: "dinner",
    calories: 510, proteinG: 38, carbsG: 35, fatG: 18, fiberG: 5,
    description: "Light chicken soup-curry, 1 chapati, big bowl salad.",
    tags: ["high-protein", "comforting"], sortOrder: 2,
  },
  {
    name: "3-egg omelet + 1 chapati + cucumber",
    mealType: "dinner",
    calories: 440, proteinG: 26, carbsG: 22, fatG: 26, fiberG: 3,
    description: "Veggie omelet, 1 chapati. Easy on the stomach late.",
    tags: ["quick", "high-protein"], sortOrder: 3,
  },
  {
    name: "Paneer bhurji 150g + 1 chapati",
    mealType: "dinner",
    calories: 530, proteinG: 30, carbsG: 28, fatG: 32, fiberG: 4,
    description: "Crumbled paneer with onion-tomato masala, 1 wheat chapati.",
    tags: ["vegetarian", "high-protein"], sortOrder: 4,
  },

  // ===================== SNACK (~250 kcal) =====================
  {
    name: "Whey protein shake + 1 apple",
    mealType: "snack",
    calories: 230, proteinG: 25, carbsG: 28, fatG: 3, fiberG: 4,
    description: "1 scoop whey with water, medium apple.",
    tags: ["high-protein", "no-cook"], sortOrder: 1,
  },
  {
    name: "Boiled eggs (3) + black coffee",
    mealType: "snack",
    calories: 220, proteinG: 18, carbsG: 2, fatG: 15, fiberG: 0,
    description: "3 boiled eggs, black coffee no sugar.",
    tags: ["high-protein", "low-carb"], sortOrder: 2,
  },
  {
    name: "Roasted chana 40g + green tea",
    mealType: "snack",
    calories: 180, proteinG: 11, carbsG: 28, fatG: 3, fiberG: 6,
    description: "Roasted black chickpeas, unsweetened green tea.",
    tags: ["vegetarian", "high-fiber"], sortOrder: 3,
  },
  {
    name: "Mixed nuts 30g + green tea",
    mealType: "snack",
    calories: 200, proteinG: 6, carbsG: 8, fatG: 17, fiberG: 3,
    description: "Almonds, walnuts, pistachios — raw, unsalted.",
    tags: ["vegetarian", "healthy-fats"], sortOrder: 4,
  },
];

async function main() {
  await prisma.dietPlan.deleteMany({});
  for (const m of MEALS) {
    await prisma.dietPlan.create({ data: m });
  }
  console.log(`Seeded ${MEALS.length} diet plan items across ${new Set(MEALS.map((m) => m.mealType)).size} meal types`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
