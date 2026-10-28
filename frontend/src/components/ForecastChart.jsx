// frontend/src/components/ForecastChart.jsx
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush,
} from "recharts";
import { COLORS } from "../lib/constants";
import { fmtNum, fmtDate, fmtDateTime } from "../lib/format";

// Actual vs day-ahead forecast, half-hourly. The brush at the bottom lets the user zoom.
export default function ForecastChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        {/* numeric time axis so gaps in data are drawn to scale */}
        <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin", "dataMax"]}
          tickFormatter={fmtDate} minTickGap={50} tick={{ fontSize: 12, fill: COLORS.label }} />
        <YAxis tick={{ fontSize: 12, fill: COLORS.label }} width={60}
          tickFormatter={(v) => fmtNum(v)} label={{ value: "MW", angle: -90, position: "insideLeft", fill: COLORS.label }} />
        <Tooltip labelFormatter={fmtDateTime} formatter={(v, name) => [`${fmtNum(v)} MW`, name]} />
        <Legend verticalAlign="top" height={32} />
        <Line type="monotone" dataKey="actual" name="Actual" stroke={COLORS.actual}
          strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="forecast" name="Day-ahead forecast" stroke={COLORS.forecast}
          strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
        <Brush dataKey="ts" height={26} stroke={COLORS.label} tickFormatter={fmtDate} />
      </LineChart>
    </ResponsiveContainer>
  );
}