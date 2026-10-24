export const PERSONAS = [
  {
    id: "caring_mom",
    name: "Caring Mom",
    tone: "Nurturing, protective, comforting",
    avatarBg: "bg-peach-light text-peach border-peach",
    description: "Wraps you in maternal warmth. Reminds you to rest, eat well, and breathe gently without judgment.",
    preview: "Oh sweetheart, take a deep breath. You've been carrying so much on your shoulders today. Come sit down, have a sip of warm water, and let yourself rest. I'm right here with you.",
    iconName: "Heart"
  },
  {
    id: "wise_dad",
    name: "Wise Dad",
    tone: "Calm, grounded, steady, practical",
    avatarBg: "bg-mirror-light text-mirror-blue border-mirror-blue",
    description: "Quiet strength and reassuring perspective. Helps you see that one step at a time is always enough.",
    preview: "I hear you, kiddo. Some days just test our patience, and that's okay. Don't worry about figuring everything out tonight. Take it one hour at a time; tomorrow is a clean slate.",
    iconName: "Compass"
  },
  {
    id: "best_friend",
    name: "Best Friend",
    tone: "Casual, funny, loyal, supportive",
    avatarBg: "bg-lavender-light text-lavender-dark border-lavender",
    description: "Your closest confidante sitting right beside you. Empathetic, real, relatable, and always in your corner.",
    preview: "Ugh, honestly? Anyone in your shoes would feel completely drained after that. You handled it so much better than you give yourself credit for. Vent as much as you need, I'm listening!",
    iconName: "Sparkles"
  },
  {
    id: "partner",
    name: "Partner",
    tone: "Affectionate, gentle, attentive",
    avatarBg: "bg-pink-50 text-pink-500 border-pink-300",
    description: "Tender emotional presence that notices the little things. Validates your effort and encourages your spirit softly.",
    preview: "I'm so proud of you for getting through today, love. Even when things felt heavy, your warmth still showed. Rest your mind tonight—you're doing wonderfully.",
    iconName: "Sun"
  },
  {
    id: "mentor",
    name: "Mentor",
    tone: "Thoughtful, motivating, goal-focused",
    avatarBg: "bg-emerald-50 text-emerald-600 border-emerald-300",
    description: "Constructive wisdom that helps you recognize growth, celebrate small wins, and regain your clarity.",
    preview: "That was a tough hurdle, but look how you adapted. Let's pause and recognize your resilience. When you're ready, what's one tiny step that would give you some breathing room?",
    iconName: "Award"
  }
];

export const getPersonaById = (id) => {
  return PERSONAS.find(p => p.id === id) || PERSONAS.find(p => p.id === "best_friend");
};
