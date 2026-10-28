import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ESTIMACION_EDITORIAL, type ByRoleItem } from "../api/client";

const FONT = "Inter, system-ui, sans-serif";

export function RoleDistributionChart({ data }: { data: ByRoleItem[] }) {
  const chartData = [...data].sort((a, b) => b.porcentaje_estimado - a.porcentaje_estimado);

  const hasEstimates = chartData.some((r) => r.tipo_dato === ESTIMACION_EDITORIAL);

  return (
    <>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
          <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#d0d7de" />
          <XAxis type="number" unit="%" tick={{ fontFamily: FONT, fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="nombre"
            width={220}
            tick={{ fontFamily: FONT, fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Participación estimada"]}
            contentStyle={{ borderRadius: 8, border: "1px solid #d0d7de", fontFamily: FONT }}
          />
          <Bar dataKey="porcentaje_estimado" radius={[0, 0, 0, 0]}>
            {chartData.map((r) => (
              <Cell
                key={r.role_family_id}
                fill={r.tipo_dato === ESTIMACION_EDITORIAL ? "var(--estimate)" : "var(--community)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {hasEstimates && (
        <div className="chart-legend">
          <span>
            <i style={{ background: "var(--community)" }} /> Encuesta comunitaria (Sysarmy)
          </span>
          <span>
            <i style={{ background: "var(--estimate)" }} /> Estimación por tecnologías (reparto
            interno del bloque Developer)
          </span>
        </div>
      )}
    </>
  );
}
