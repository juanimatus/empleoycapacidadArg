import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ByRoleItem } from "../api/client";

export function RoleDistributionChart({ data }: { data: ByRoleItem[] }) {
  const chartData = [...data].sort((a, b) => b.porcentaje_estimado - a.porcentaje_estimado);

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" unit="%" />
        <YAxis type="category" dataKey="nombre" width={220} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, key: string) =>
            key === "porcentaje_estimado" ? [`${value}%`, "Participación estimada"] : [value, key]
          }
        />
        <Bar dataKey="porcentaje_estimado" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
