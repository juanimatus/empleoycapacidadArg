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

const MONO = "JetBrains Mono, monospace";

export function RoleDistributionChart({ data }: { data: ByRoleItem[] }) {
  const chartData = [...data].sort((a, b) => b.porcentaje_estimado - a.porcentaje_estimado);

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#0a0a0a" opacity={0.15} />
        <XAxis type="number" unit="%" tick={{ fontFamily: MONO, fontSize: 11 }} />
        <YAxis type="category" dataKey="nombre" width={220} tick={{ fontFamily: MONO, fontSize: 11 }} />
        <Tooltip
          formatter={(value: number, key: string) =>
            key === "porcentaje_estimado" ? [`${value}%`, "Participación estimada"] : [value, key]
          }
          contentStyle={{ borderRadius: 0, border: "1px solid #0a0a0a", fontFamily: MONO }}
        />
        <Bar dataKey="porcentaje_estimado" fill="var(--accent)" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
