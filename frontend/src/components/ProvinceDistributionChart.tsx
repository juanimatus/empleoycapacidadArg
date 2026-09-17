import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProvinceEmployment } from "../api/client";

const MONO = "JetBrains Mono, monospace";

export function ProvinceDistributionChart({ data }: { data: ProvinceEmployment[] }) {
  const top = [...data].sort((a, b) => b.empleos_registrados - a.empleos_registrados).slice(0, 12);

  return (
    <ResponsiveContainer width="100%" height={440}>
      <BarChart data={top} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#0a0a0a" opacity={0.15} />
        <XAxis type="number" tick={{ fontFamily: MONO, fontSize: 11 }} />
        <YAxis type="category" dataKey="provincia" width={190} tick={{ fontFamily: MONO, fontSize: 11 }} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString("es-AR"), "Empleos registrados"]}
          contentStyle={{ borderRadius: 0, border: "1px solid #0a0a0a", fontFamily: MONO }}
        />
        <Bar dataKey="empleos_registrados" fill="var(--accent)" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
