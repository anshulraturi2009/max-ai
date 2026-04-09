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
      "Yaar, aaram se dekhte hain.",
      "Haan bhai, samajh gaya main.",
      "Chal, isko simple aur human tareeke se dekhte hain.",
    ],
    bridges: [
      "Isme panic karne ki zarurat nahi hai, seedha scene samajhte hain.",
      "Ek clean aur practical way ye ho sakta hai.",
      "Main tumhe short, real aur useful version deta hoon.",
    ],
    closers: [
      "Chahe to main isko aur real example ke saath bhi tod deta hoon.",
      "Tu bole to next step bhi saath me nikaal dete hain.",
      "Ab ye thoda zyada clear feel hona chahiye.",
    ],
  },
  supportive: {
    openers: [
      "Tu behind nahi hai, bas thoda overload feel ho raha hai.",
      "Agar ye heavy lag raha hai to wo valid hai, aaram se clear karte hain.",
      "Chal isko dheere se manageable banate hain.",
    ],
    bridges: [
      "Goal sab kuch ek saath solve karna nahi, bas sahi next move pakadna hai.",
      "Yaha calm aur clear answer jaldi wale answer se zyada kaam aata hai.",
      "Noise hata ke pehle wahi dekhte hain jo abhi actually matter karta hai.",
    ],
    closers: [
      "Tu chahe to main isko chhote step-by-step plan me bhi tod dunga.",
      "Stress jitna bol raha hai usse simple tareeke se bhi ye ho sakta hai.",
      "Yaha se ek clear step lena bhi real progress hai.",
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
      "Theek hai, isko simple rakhte hain.",
      "Haan, direct version batata hoon.",
      "Chal, isko clear next step me turn karte hain.",
    ],
    bridges: [
      "Sabse useful answer wahi hoga jo tu abhi use kar sake.",
      "Chal exact result par focus karte hain jo tu chahta hai.",
      "Yaha direct answer generic gyaan se zyada help karega.",
    ],
    closers: [
      "Tu chahe to main isko aur short, sharp ya detailed kar dunga.",
      "Ek aur detail dega to main isko aur exact bana dunga.",
      "Ab isse next step lena easy hona chahiye.",
    ],
  },
};

const personaEmojiMap = {
  bhai: ["🔥", "⚡", "😎"],
  friend: ["🙂", "✨", "🙌"],
  supportive: ["💙", "🌱", "🤍"],
  formal: [],
  funny: ["😄", "😂", "🎯"],
  mentor: ["🚀", "💡", "📈"],
  other: ["✨", "💡", "🤝"],
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

function getOptionalEmoji(personaId, seed, intentId) {
  if (personaId === "formal") {
    return "";
  }

  if (intentId === "life" && personaId !== "supportive") {
    return "";
  }

  if (seed % 3 !== 0) {
    return "";
  }

  const emojiPool = personaEmojiMap[personaId] ?? personaEmojiMap.other;
  return emojiPool.length ? pickVariant(emojiPool, seed, 5) : "";
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

export function createMockReply({ message, personaId = "friend", history = [] }) {
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
  const emoji = getOptionalEmoji(persona.id, seed, intent.id);
  const openerLine = emoji ? `${opener} ${emoji}` : opener;

  if (persona.id === "bhai") {
    return `${openerLine}

${bridge} ${intent.insight}

Abhi ke liye ye teen cheezein pakad:
${actionBlock}

${closer}`;
  }

  if (persona.id === "friend") {
    return `${openerLine}

${bridge} ${intent.insight}

Try this:
${actionBlock}

${closer}`;
  }

  if (persona.id === "supportive") {
    return `${openerLine}

${bridge} ${intent.insight}

Start here:
${actionBlock}

${closer}`;
  }

  if (persona.id === "formal") {
    return `${openerLine}

${bridge} ${intent.insight}

Recommended next steps:
${actionBlock}

${closer}`;
  }

  if (persona.id === "funny") {
    return `${openerLine}

${bridge} ${intent.insight}

Let's keep it elegant:
${actionBlock}

${closer}`;
  }

  if (persona.id === "mentor") {
    return `${openerLine}

${bridge} ${intent.insight}

Focus your next move here:
${actionBlock}

${closer}`;
  }

  return `${openerLine}

${bridge} ${intent.insight}

Useful direction:
${actionBlock}

${closer}`;
}
