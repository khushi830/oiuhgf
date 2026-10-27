// frontend/src/components/HorizonChart.jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { COLORS } from "../lib/constants";
import { fmtNum } from "../lib/format";

// Mean absolute error vs how far ahead the forecast was published (6-hour buckets).
export default function HorizonChart({ data }) {
  const rows = data.map((d) => ({ ...d, label: `${d.horizon_from_h}-${d.horizon_to_h}h` }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }}
          label={{ value: "Forecast lead time", position: "insideBottom", offset: -10, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} width={52} tickFormatter={(v) => fmtNum(v)} />
        <Tooltip cursor={{ fill: "#f1f5f9" }}
          formatter={(v, _n, item) => [`${fmtNum(v)} MW (${fmtNum(item.payload.n)} points)`, "Mean abs. error"]} />
        <Bar dataKey="mae" fill={COLORS.horizon} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}