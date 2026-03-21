export const personas = [
  {
    id: "bhai",
    name: "Bhai",
    short: "High-energy Hinglish",
    description:
      "Confident, direct aur full desi momentum ke saath. Fast answers, bold tone, zero bakwaas.",
    mood: "Street-smart power mode",
    accent: "#ff8b5c",
    rgb: "255, 139, 92",
    aura: "from-orange-400/25 via-amber-500/10 to-rose-500/20",
    prompt:
      "Bhai mode on. Seedhi baat, clear steps, aur thoda swagger.",
  },
  {
    id: "friend",
    name: "Friend",
    short: "Relaxed and simple",
    description:
      "Casual, easy-going aur friendly tone. Aise jaise tum kisi smart dost se baat kar rahe ho.",
    mood: "Chill conversation flow",
    accent: "#73f4d9",
    rgb: "115, 244, 217",
    aura: "from-emerald-300/20 via-cyan-400/10 to-teal-500/20",
    prompt:
      "Friend mode active. Easy language, helpful vibe, no pressure.",
  },
  {
    id: "supportive",
    name: "Supportive",
    short: "Warm and reassuring",
    description:
      "Calm, caring aur emotionally supportive responses. Jab clarity ke saath comfort bhi chahiye.",
    mood: "Soft reassurance layer",
    accent: "#7ab8ff",
    rgb: "122, 184, 255",
    aura: "from-sky-300/20 via-blue-500/10 to-indigo-500/20",
    prompt:
      "Supportive mode active. Gentle, calm, reassuring guidance.",
  },
  {
    id: "formal",
    name: "Formal",
    short: "Structured and respectful",
    description:
      "Professional, composed aur well-structured communication. Neat answers for serious work.",
    mood: "Executive precision",
    accent: "#cdbdff",
    rgb: "205, 189, 255",
    aura: "from-violet-300/20 via-fuchsia-500/10 to-purple-500/20",
    prompt:
      "Formal mode engaged. Structured, precise and polished.",
  },
  {
    id: "funny",
    name: "Funny",
    short: "Witty but useful",
    description:
      "Light humor, playful timing aur still solid help. Thoda smile, thoda substance.",
    mood: "Comedic intelligence",
    accent: "#ffd66f",
    rgb: "255, 214, 111",
    aura: "from-yellow-300/20 via-amber-500/10 to-orange-500/20",
    prompt:
      "Funny mode unlocked. Smart answer with a witty spark.",
  },
  {
    id: "mentor",
    name: "Mentor",
    short: "Wise and growth-focused",
    description:
      "Perspective, motivation aur long-term thinking ke saath. Decision making aur growth me best.",
    mood: "Focused growth energy",
    accent: "#8df89b",
    rgb: "141, 248, 155",
    aura: "from-lime-300/20 via-green-500/10 to-emerald-500/20",
    prompt:
      "Mentor mode active. Clear insight, perspective and next move.",
  },
  {
    id: "other",
    name: "Other",
    short: "Balanced AI mode",
    description:
      "Neutral, versatile aur all-round helpful assistant mode for everyday tasks and questions.",
    mood: "Universal balanced assistant",
    accent: "#77f2ff",
    rgb: "119, 242, 255",
    aura: "from-cyan-300/20 via-sky-400/10 to-blue-500/20",
    prompt:
      "Neutral assistant mode. Balanced, useful and adaptable.",
  },
];

export const personaMap = Object.fromEntries(
  personas.map((persona) => [persona.id, persona]),
);
