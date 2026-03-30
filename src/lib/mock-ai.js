import { personaMap } from "../data/personas";

const selfIdentityPatterns = [
  "tum kaun ho",
  "tum kon ho",
  "aap kaun ho",
  "aap kon ho",
  "ap kaun ho",
  "ap kon ho",
  "who are you",
  "what are you",
];

const creatorPatterns = [
  "kisne banaya",
  "banaya kisne",
  "who made you",
  "who built you",
  "who created you",
  "kisne create kiya",
];

const anshulPatterns = [
  "anshul kaun hai",
  "anshul kon hai",
  "anshul raturi kaun hai",
  "anshul raturi kon hai",
  "anshul ratrui kaun hai",
  "anshul ratrui kon hai",
  "who is anshul",
  "who is anshul raturi",
  "who is anshul ratrui",
  "anshul raturi kaun",
  "anshul raturi kon",
  "anshul ratrui kaun",
  "anshul ratrui kon",
];

const intentMap = [
  {
    id: "build",
    match:
      /(build|app|website|ui|ux|design|react|tailwind|feature|product|code|bug|frontend|backend|api)/i,
    insight:
      "This sounds like a build-or-fix problem, so the smartest move is to convert the idea into a clean action path.",
    actions: [
      "Define the exact output you want before touching implementation.",
      "Break the flow into UI, state, and backend-ready integration points.",
      "Ship the smallest polished version first, then expand.",
    ],
  },
  {
    id: "career",
    match: /(career|job|resume|interview|growth|skill|freelance|startup)/i,
    insight:
      "This sounds like a career-growth question, so clarity and positioning matter more than random hustle.",
    actions: [
      "Choose one goal that changes your next 30 days, not ten goals at once.",
      "Build visible proof of skill, not just theory.",
      "Turn the next step into something measurable and deadline-based.",
    ],
  },
  {
    id: "study",
    match: /(study|learn|exam|revision|notes|concept|practice|topic)/i,
    insight:
      "This looks like a learning challenge, so we should make the information easier to understand and easier to repeat.",
    actions: [
      "Reduce the topic into a few core ideas.",
      "Use examples or practice questions immediately.",
      "Review it in short loops instead of one heavy session.",
    ],
  },
  {
    id: "life",
    match:
      /(stress|anxious|anxiety|confused|sad|motivation|discipline|routine|focus|relationship)/i,
    insight:
      "This feels personal, so a useful answer should combine emotional clarity with one grounded next step.",
    actions: [
      "Pause the spiral and name the real issue in one sentence.",
      "Choose one action that lowers pressure today.",
      "Avoid trying to solve your whole life in one sitting.",
    ],
  },
  {
    id: "creative",
    match:
      /(content|instagram|youtube|caption|name|brand|creative|idea|story|script|marketing)/i,
    insight:
      "This is a creative problem, so strong direction beats generic brainstorming.",
    actions: [
      "Pick one vibe and stay consistent with it.",
      "Make the output memorable in the first line.",
      "Keep the execution sharp enough that it can actually be posted or built today.",
    ],
  },
];

const fallbackIntent = {
  id: "general",
  insight:
    "Share the exact context or outcome you want, and I will answer more directly.",
  actions: [
    "Tell me the exact task, problem, or decision.",
    "Add any important context or constraint.",
    "I will turn it into a direct next step or usable answer.",
  ],
};

const personaStyles = {
  bhai: {
    openers: [
      "Bhai, scene simple hai.",
      "Sun bhai, isko smart tareeke se tackle karte hain.",
      "Bhai, tension chhod. Ye handle ho jayega.",
    ],
    bridges: [
      "Main isko direct roadmap me tod deta hoon.",
      "Seedha kaam ki baat ye hai.",
      "Best move yaha ye rahega.",
    ],
    closers: [
      "Agar chaahe to next step bhi saath me nikaal dete hain.",
      "Bol to isko aur tighter plan me convert kar deta hoon.",
      "Ye line pakad lo, momentum khud ban jayega.",
    ],
  },
  friend: {
    openers: [
      "Yaar, isko easy rakhte hain.",
      "Haan, ye manageable hai.",
      "Chal simple language me dekhte hain.",
    ],
    bridges: [
      "Best part ye hai ki isko complicated banane ki zarurat nahi hai.",
      "Ek clean approach ye ho sakti hai.",
      "Main tumhe short and useful version deta hoon.",
    ],
    closers: [
      "Chahe to isko aur practical example ke saath bhi break kar sakte hain.",
      "Agar tum bolo to next version aur concise bana deta hoon.",
      "Ab ye kaafi easy feel hona chahiye.",
    ],
  },
  supportive: {
    openers: [
      "You are not behind. Let's take this one step at a time.",
      "It's okay if this feels heavy right now. We can make it clearer.",
      "Let's slow it down and make it manageable.",
    ],
    bridges: [
      "The goal is not to do everything at once, just the right next move.",
      "A calm, structured response usually helps more than a rushed one here.",
      "We can reduce the noise and focus on what actually matters first.",
    ],
    closers: [
      "If you want, I can stay with you and turn this into a small step-by-step plan.",
      "You're allowed to do this in a simpler way than your stress is telling you.",
      "One clear action from here is already real progress.",
    ],
  },
  formal: {
    openers: [
      "Certainly. Here's the most effective way to approach this.",
      "Understood. A structured response would be:",
      "Here is a clean and practical way to handle it.",
    ],
    bridges: [
      "The key priority is to align the answer with the desired outcome.",
      "A strong response should be actionable, not merely descriptive.",
      "The most useful method is to separate the problem into clear parts.",
    ],
    closers: [
      "I can refine this into a more detailed execution plan if needed.",
      "If you share the exact context, I can tailor the response further.",
      "This approach should provide clarity while remaining practical.",
    ],
  },
  funny: {
    openers: [
      "Alright, let's make this smarter than your browser history.",
      "This is fixable, and thankfully no dramatic background music is required.",
      "Good news: this is an AI problem, not an apocalypse.",
    ],
    bridges: [
      "The trick is to stay useful without turning this into a TED Talk.",
      "Let's keep the answer sharp, not unnecessarily spicy.",
      "A clean move here beats ten chaotic genius ideas.",
    ],
    closers: [
      "If you want, I can also turn this into an even more dangerously useful version.",
      "That should help without summoning extra confusion from the void.",
      "We're aiming for smart and smooth, not 'worked at 3 a.m. once.'",
    ],
  },
  mentor: {
    openers: [
      "This is a strong question because the next move matters more than perfect certainty.",
      "You're probably closer than you think; you just need a sharper lens.",
      "Let's approach this with clarity and long-term leverage in mind.",
    ],
    bridges: [
      "The winning move is not just solving today's question, but creating momentum.",
      "Think of this as direction plus execution, not motivation alone.",
      "A grounded next step often beats waiting for a perfect plan.",
    ],
    closers: [
      "If you want, I'll help you turn this into a focused execution path.",
      "Clarity compounds. One decisive step here can change the pace of everything after it.",
      "Keep the standard high, but keep the next step small enough to act on today.",
    ],
  },
  other: {
    openers: [
      "Let's keep this simple and useful.",
      "Here is the direct version.",
      "I can turn this into a clearer next step.",
    ],
    bridges: [
      "The most useful answer here is the one you can act on immediately.",
      "Let's focus on the exact result you want.",
      "A direct answer will help more than generic advice here.",
    ],
    closers: [
      "If you want, I can make it shorter, sharper, or more detailed.",
      "If you share one more detail, I can make this more exact.",
      "That should be enough to move to the next step.",
    ],
  },
};

function hashString(input) {
  return Array.from(input).reduce(
    (accumulator, character, index) =>
      accumulator + character.charCodeAt(0) * (index + 17),
    0,
  );
}

function pickVariant(items, seed, salt = 0) {
  return items[(seed + salt) % items.length];
}

function detectIntent(message) {
  return intentMap.find((intent) => intent.match.test(message)) ?? fallbackIntent;
}

function matchesAnyPattern(message, patterns) {
  const normalized = message.trim().toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

function buildIdentityReply(message) {
  if (matchesAnyPattern(message, anshulPatterns)) {
    return (
      "Anshul Raturi ek young Indian founder hain aur Uttarakhand se belong karte hain. " +
      "Unhone MAX AI banaya hai."
    );
  }

  if (matchesAnyPattern(message, selfIdentityPatterns)) {
    return (
      "Mai MAX AI hu. Mujhe Anshul Raturi ne banaya hai. " +
      "Wo Uttarakhand se belong karne wale ek young Indian founder hain."
    );
  }

  return (
    "Mujhe Anshul Raturi ne banaya hai. " +
    "Wo Uttarakhand se belong karne wale ek young Indian founder hain."
  );
}

function buildActionList(actions, personaId) {
  if (personaId === "formal") {
    return actions
      .map((action, index) => `${index + 1}. ${action}`)
      .join("\n");
  }

  return actions.map((action) => `- ${action}`).join("\n");
}

export function getThinkingDelay(message) {
  return Math.min(2200, Math.max(900, 700 + message.trim().length * 18));
}

export function createMockReply({ message, personaId = "other", history = [] }) {
  if (
    matchesAnyPattern(message, selfIdentityPatterns) ||
    matchesAnyPattern(message, creatorPatterns) ||
    matchesAnyPattern(message, anshulPatterns)
  ) {
    return buildIdentityReply(message);
  }

  const persona = personaMap[personaId] ?? personaMap.other;
  const style = personaStyles[persona.id] ?? personaStyles.other;
  const intent = detectIntent(message);
  const seed = hashString(`${message}-${persona.id}-${history.length}`);

  const opener = pickVariant(style.openers, seed, 1);
  const bridge = pickVariant(style.bridges, seed, 2);
  const closer = pickVariant(style.closers, seed, 3);
  const actionBlock = buildActionList(intent.actions, persona.id);

  if (persona.id === "bhai") {
    return `${opener}

${bridge} ${intent.insight}

Abhi ke liye ye teen cheezein pakad:
${actionBlock}

${closer}`;
  }

  if (persona.id === "friend") {
    return `${opener}

${bridge} ${intent.insight}

Try this:
${actionBlock}

${closer}`;
  }

  if (persona.id === "supportive") {
    return `${opener}

${bridge} ${intent.insight}

Start here:
${actionBlock}

${closer}`;
  }

  if (persona.id === "formal") {
    return `${opener}

${bridge} ${intent.insight}

Recommended next steps:
${actionBlock}

${closer}`;
  }

  if (persona.id === "funny") {
    return `${opener}

${bridge} ${intent.insight}

Let's keep it elegant:
${actionBlock}

${closer}`;
  }

  if (persona.id === "mentor") {
    return `${opener}

${bridge} ${intent.insight}

Focus your next move here:
${actionBlock}

${closer}`;
  }

  return `${opener}

${bridge} ${intent.insight}

Useful direction:
${actionBlock}

${closer}`;
}
