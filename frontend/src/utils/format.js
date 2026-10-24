export const getTimeGreeting = (name) => {
  const hour = new Date().getHours();
  let timeStr = "evening";
  if (hour >= 5 && hour < 12) {
    timeStr = "morning";
  } else if (hour >= 12 && hour < 17) {
    timeStr = "afternoon";
  } else if (hour >= 17 && hour < 22) {
    timeStr = "evening";
  } else {
    timeStr = "night";
  }

  const safeName = name ? `, ${name}` : "";
  return `Good ${timeStr}${safeName}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
};
