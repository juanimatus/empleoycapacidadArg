import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProvinceEmployment } from "../api/client";

const FONT = "Inter, system-ui, sans-serif";

export function ProvinceDistributionChart({ data }: { data: ProvinceEmployment[] }) {
  const top = [...data].sort((a, b) => b.empleos_registrados - a.empleos_registrados).slice(0, 12);

  return (
    <ResponsiveContainer width="100%" height={440}>
      <BarChart data={top} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#d0d7de" />
        <XAxis type="number" tick={{ fontFamily: FONT, fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="provincia"
          width={190}
          tick={{ fontFamily: FONT, fontSize: 11 }}
        />
        <Tooltip
          formatter={(value) => [Number(value).toLocaleString("es-AR"), "Empleos registrados"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #d0d7de", fontFamily: FONT }}
        />
        <Bar dataKey="empleos_registrados" fill="var(--accent)" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
