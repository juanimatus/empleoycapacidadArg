import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EmploymentSnapshot } from "../api/client";

export function EmploymentTimeseries({ data }: { data: EmploymentSnapshot[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ left: 8, right: 24, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="anio" />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
          width={50}
        />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString("es-AR"), "Empleos registrados"]}
          labelFormatter={(label) => `Año ${label}`}
        />
        <Line
          type="monotone"
          dataKey="empleos_registrados"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
