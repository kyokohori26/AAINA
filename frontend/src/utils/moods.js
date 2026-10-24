export const MOODS = [
  {
    id: "calm",
    label: "Calm",
    emoji: "🌿",
    color: "#8EC5F2",
    bgClass: "bg-[#8EC5F2]",
    textClass: "text-[#2B6CB0]",
    description: "Peaceful, balanced, grounded"
  },
  {
    id: "happy",
    label: "Happy",
    emoji: "✨",
    color: "#FFD36E",
    bgClass: "bg-[#FFD36E]",
    textClass: "text-[#B7791F]",
    description: "Joyful, excited, grateful"
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "🌊",
    color: "#FFB38A",
    bgClass: "bg-[#FFB38A]",
    textClass: "text-[#C05621]",
    description: "Worried, overwhelmed, restless"
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "🌧️",
    color: "#A9A6D6",
    bgClass: "bg-[#A9A6D6]",
    textClass: "text-[#4A4480]",
    description: "Down, lonely, tender"
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "🔥",
    color: "#F28B8B",
    bgClass: "bg-[#F28B8B]",
    textClass: "text-[#9B2C2C]",
    description: "Frustrated, irritated, unfair"
  },
  {
    id: "tired",
    label: "Tired",
    emoji: "🌙",
    color: "#B7C4CF",
    bgClass: "bg-[#B7C4CF]",
    textClass: "text-[#4A5568]",
    description: "Exhausted, low energy, heavy"
  },
  {
    id: "neutral",
    label: "Neutral",
    emoji: "☁️",
    color: "#D9D9D9",
    bgClass: "bg-[#D9D9D9]",
    textClass: "text-[#4B5563]",
    description: "Ordinary, quiet, observant"
  }
];

export const getMoodById = (id) => {
  return MOODS.find(m => m.id === id) || MOODS.find(m => m.id === "neutral");
};
