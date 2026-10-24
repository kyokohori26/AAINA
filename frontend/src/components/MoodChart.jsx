import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { getMoodById } from "../utils/moods";

export default function MoodChart({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-ink-muted">
        No mood data recorded yet.
      </div>
    );
  }

  const chartData = timeline.map((item) => ({
    date: item.day_name,
    fullDate: item.date,
    mood: item.mood_label,
    score: item.mood_score,
    count: item.count
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const moodObj = getMoodById(data.mood);
      return (
        <div className="bg-white p-3 rounded-card shadow-mirror border border-cream-300 text-xs">
          <p className="font-bold text-ink mb-1">{data.fullDate}</p>
          {data.score > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-base">{moodObj.emoji}</span>
              <span className="font-semibold capitalize" style={{ color: moodObj.color }}>
                {moodObj.label} (Intensity {data.score}/5)
              </span>
            </div>
          ) : (
            <p className="text-ink-muted">No entry written</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-56 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid stroke="#ECE6DC" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: "#ECE6DC" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: "#6B7280", fontSize: 11 }}
            axisLine={{ stroke: "#ECE6DC" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#5B8DEF"
            strokeWidth={3}
            dot={{ r: 5, fill: "#5B8DEF", stroke: "#FFFFFF", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#B8A9F0", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
