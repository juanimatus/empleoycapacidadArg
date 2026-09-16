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

export function ProvinceDistributionChart({ data }: { data: ProvinceEmployment[] }) {
  const top = [...data].sort((a, b) => b.empleos_registrados - a.empleos_registrados).slice(0, 12);

  return (
    <ResponsiveContainer width="100%" height={440}>
      <BarChart data={top} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="provincia" width={190} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString("es-AR"), "Empleos registrados"]}
        />
        <Bar dataKey="empleos_registrados" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
