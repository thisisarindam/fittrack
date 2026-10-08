// Static workout program (no server-only imports so it can be used on the client too).

export type DayKey = "MON" | "WED" | "SAT";
export type ExerciseKind = "strength" | "hold" | "cardio";

export type CatalogExercise = {
  name: string;
  kind: ExerciseKind;
  image: string;
  muscles: string;
  cue: string;
};

const exerciseImage = (slug: string, extension = "jpg") =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/exercises/${slug}.${extension}`;

export const CATALOG: Record<string, CatalogExercise> = {
  elliptical: {
    name: "Elliptical",
    kind: "cardio",
    image: exerciseImage("elliptical"),
    muscles: "Warm-up · full body",
    cue: "Easy to moderate pace. Smooth, relaxed strides — you should be able to talk comfortably.",
  },
  "goblet-dumbbell-squat": {
    name: "Goblet Dumbbell Squat",
    kind: "strength",
    image: exerciseImage("goblet-dumbbell-squat"),
    muscles: "Quads · glutes · core",
    cue: "Hold one dumbbell vertically at your chest. Keep your chest tall, sit your hips down between your knees, and drive through your whole foot to stand.",
  },
  "db-squat": {
    name: "Dumbbell Squat",
    kind: "strength",
    image: exerciseImage("db-squat"),
    muscles: "Quads · glutes · core",
    cue: "Dumbbells at your sides. Sit hips back and down, keep chest up and knees tracking over toes. Stand tall through the whole foot.",
  },
  "chest-press": {
    name: "Chest Press",
    kind: "strength",
    image: exerciseImage("chest-press"),
    muscles: "Chest · triceps · front delts",
    cue: "Seat so the handles line up with mid-chest. Press forward smoothly, stop short of locking elbows, and control the return.",
  },
  "incline-push-up": {
    name: "Incline Push-up",
    kind: "strength",
    image: exerciseImage("incline-push-up"),
    muscles: "Chest · triceps · shoulders · core",
    cue: "Use the same elevated surface you have been using. Keep your body straight, bring your chest toward the surface, and don't let your hips sag.",
  },
  "lat-pulldown": {
    name: "Lat Pulldown",
    kind: "strength",
    image: exerciseImage("lat-pulldown", "webp"),
    muscles: "Lats · biceps · upper back",
    cue: "Grip slightly wider than shoulders. Pull the bar to upper chest, lead with the elbows, keep your torso mostly upright.",
  },
  "seated-row": {
    name: "Seated Row",
    kind: "strength",
    image: exerciseImage("seated-row"),
    muscles: "Mid back · rear delts · biceps",
    cue: "Sit tall with a slight lean. Pull the handle to your lower ribs, squeeze shoulder blades together, then let the arms stretch fully.",
  },
  "hamstring-curl": {
    name: "Seated Hamstring Curl",
    kind: "strength",
    image: exerciseImage("hamstring-curl"),
    muscles: "Hamstrings",
    cue: "Pad sits just above your heels. Curl down smoothly, pause briefly, and return slowly — no swinging.",
  },
  "leg-extension": {
    name: "Leg Extension",
    kind: "strength",
    image: exerciseImage("leg-extension"),
    muscles: "Quadriceps",
    cue: "Line your knee up with the machine pivot. Extend fully, pause a beat at the top, and lower under control.",
  },
  "reverse-lunge": {
    name: "Dumbbell Reverse Lunge",
    kind: "strength",
    image: exerciseImage("reverse-lunge"),
    muscles: "Quads · glutes · hamstrings · core",
    cue: "Hold onto something for balance initially. Step backward, keep the front foot planted, lower under control, then push through the front foot to return.",
  },
  "db-shoulder-press": {
    name: "Dumbbell Shoulder Press",
    kind: "strength",
    image: exerciseImage("db-shoulder-press"),
    muscles: "Shoulders · triceps",
    cue: "Sit upright with your back supported. Press the dumbbells overhead without arching your lower back; lower to about ear level.",
  },
  plank: {
    name: "Plank",
    kind: "hold",
    image: exerciseImage("plank"),
    muscles: "Core · abs · glutes",
    cue: "Forearms under shoulders, body in one straight line from head to heels. Squeeze glutes, breathe steadily, no sagging hips.",
  },
  cardio: {
    name: "Cardio Finisher",
    kind: "cardio",
    image: exerciseImage("cardio"),
    muscles: "Conditioning · fat burn",
    cue: "Treadmill, elliptical or cycle at a steady, conversational pace.",
  },
};

export type PlanItem = {
  slug: string;
  sets: number;
  prescription: string;
  rest: string;
  restSeconds: number;
  note?: string;
};

export type DayPlan = {
  key: DayKey;
  weekday: string;
  title: string;
  duration: string;
  gradient: string;
  badge: string;
  items: PlanItem[];
};

const FULL_BODY_A_ITEMS: PlanItem[] = [
  { slug: "elliptical", sets: 1, prescription: "5–7 min", rest: "Warm-up", restSeconds: 0, note: "Easy/moderate warm-up." },
  { slug: "goblet-dumbbell-squat", sets: 3, prescription: "3 × 10–12", rest: "90–120 sec", restSeconds: 105 },
  {
    slug: "incline-push-up",
    sets: 3,
    prescription: "3 × 8–15",
    rest: "90 sec",
    restSeconds: 90,
    note: "When you can do 15 + 15 + 15 comfortably, lower the incline to make the exercise harder.",
  },
  { slug: "lat-pulldown", sets: 3, prescription: "3 × 8–12", rest: "90 sec", restSeconds: 90 },
  { slug: "seated-row", sets: 3, prescription: "3 × 10–12", rest: "90 sec", restSeconds: 90 },
  { slug: "hamstring-curl", sets: 3, prescription: "3 × 10–15", rest: "60–90 sec", restSeconds: 75 },
  { slug: "plank", sets: 2, prescription: "2 × 20–40 sec", rest: "60 sec", restSeconds: 60 },
  { slug: "cardio", sets: 1, prescription: "10–15 min", rest: "Finisher", restSeconds: 0, note: "Treadmill / elliptical / cycle. Done after weights." },
];

const FULL_BODY_B_ITEMS: PlanItem[] = [
  { slug: "elliptical", sets: 1, prescription: "5–7 min", rest: "Warm-up", restSeconds: 0, note: "Warm-up." },
  {
    slug: "db-squat",
    sets: 3,
    prescription: "3 × 10–12",
    rest: "60–120 sec",
    restSeconds: 90,
    note: "Start around your current 10 kg if form is good. Don't automatically increase weight.",
  },
  {
    slug: "incline-push-up",
    sets: 3,
    prescription: "3 × 8–15",
    rest: "90 sec",
    restSeconds: 90,
    note: "When you can do 15 + 15 + 15 comfortably, lower the incline to make the exercise harder.",
  },
  { slug: "lat-pulldown", sets: 3, prescription: "3 × 8–12", rest: "90 sec", restSeconds: 90 },
  { slug: "seated-row", sets: 3, prescription: "3 × 10–12", rest: "90 sec", restSeconds: 90 },
  {
    slug: "reverse-lunge",
    sets: 2,
    prescription: "2 × 8–10 each leg",
    rest: "90 sec",
    restSeconds: 90,
    note: "Use dumbbells only when you feel steady; hold onto something for balance while learning the movement.",
  },
  { slug: "db-shoulder-press", sets: 2, prescription: "2 × 8–12", rest: "90 sec", restSeconds: 90 },
  { slug: "cardio", sets: 1, prescription: "10–15 min", rest: "Finisher", restSeconds: 0, note: "Treadmill / elliptical / cycle. Done after weights." },
];

export const DAYS: Record<DayKey, DayPlan> = {
  MON: {
    key: "MON",
    weekday: "Monday",
    title: "Full Body A",
    duration: "55–65 min",
    gradient: "from-sky-500 to-blue-700",
    badge: "bg-sky-500/15 text-sky-300 ring-sky-500/40",
    items: FULL_BODY_A_ITEMS,
  },
  WED: {
    key: "WED",
    weekday: "Wednesday",
    title: "Full Body B",
    duration: "55–65 min",
    gradient: "from-emerald-500 to-teal-700",
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
    items: FULL_BODY_B_ITEMS,
  },
  SAT: {
    key: "SAT",
    weekday: "Saturday",
    title: "Full Body A",
    duration: "55–65 min",
    gradient: "from-violet-500 to-purple-700",
    badge: "bg-violet-500/15 text-violet-300 ring-violet-500/40",
    items: FULL_BODY_A_ITEMS,
  },
};

export const DAY_ORDER: DayKey[] = ["MON", "WED", "SAT"];

export const RULES: string[] = [
  "3 sets unless stated otherwise",
  "8–12 reps for most strength exercises",
  "Rest 60–120 sec between sets",
  "Choose a weight where you could still do ~2 more clean reps",
  "Do not train to failure",
  "Cardio comes after weights",
];

export function isDayKey(value: string): value is DayKey {
  return (DAY_ORDER as string[]).includes(value);
}

const KEY_BY_WEEKDAY: Partial<Record<number, DayKey>> = { 1: "MON", 3: "WED", 6: "SAT" };

export function getNextScheduledDay(now: Date = new Date()): { day: DayPlan; isToday: boolean } {
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    const key = KEY_BY_WEEKDAY[d.getDay()];
    if (key) return { day: DAYS[key], isToday: offset === 0 };
  }
  return { day: DAYS.MON, isToday: false };
}
