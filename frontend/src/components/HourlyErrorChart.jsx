// frontend/src/components/HourlyErrorChart.jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { COLORS } from "../lib/constants";
import { fmtNum } from "../lib/format";

// Mean absolute error for each hour of the delivery day (UTC).
export default function HourlyErrorChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(h) => String(h).padStart(2, "0")}
          label={{ value: "Hour of day (UTC)", position: "insideBottom", offset: -10, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} width={52} tickFormatter={(v) => fmtNum(v)} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} labelFormatter={(h) => `${String(h).padStart(2, "0")}:00 UTC`}
          formatter={(v) => [`${fmtNum(v)} MW`, "Mean abs. error"]} />
        <Bar dataKey="mae" fill={COLORS.hourly} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}