const API_BASE = "http://127.0.0.1:8000";

export interface DataSource {
  id: string;
  nombre: string;
  tipo: "oficial" | "comunitario" | "estimacion";
  descripcion: string;
  url: string | null;
  fecha: string | null;
}

export interface RoleDistribution {
  porcentaje_estimado: number;
  tipo: string;
  nota: string | null;
  fuente: DataSource;
}

export interface ProvinceEmployment {
  provincia: string;
  empleos_registrados: number;
  porcentaje: number;
  periodo: string;
}

export interface RoleFamily {
  id: string;
  nombre: string;
  descripcion: string;
  aliases: string[];
  distribucion: RoleDistribution | null;
}

export interface EmploymentSnapshot {
  anio: number;
  empleos_registrados: number;
  variacion_interanual_pct: number | null;
  cobertura: string;
}

export interface SectorKPI {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  periodo: string;
  nota: string | null;
  fuente: DataSource;
}

export interface EmploymentSummary {
  ultimo_anio: number;
  empleos_registrados_ultimo_anio: number;
  variacion_interanual_pct: number | null;
  cantidad_familias_rol: number;
  periodo_datos: string;
  kpis: SectorKPI[];
}

export interface ByRoleItem {
  role_family_id: string;
  nombre: string;
  porcentaje_estimado: number;
  empleos_estimados: number;
  tipo_dato: string;
}

export interface ByRoleResponse {
  anio_base: number;
  empleos_registrados_totales: number;
  aviso: string;
  distribucion: ByRoleItem[];
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} consultando ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  roles: () => getJson<RoleFamily[]>("/api/roles"),
  role: (id: string) => getJson<RoleFamily>(`/api/roles/${id}`),
  employmentSummary: () => getJson<EmploymentSummary>("/api/employment/summary"),
  employmentTimeseries: () => getJson<EmploymentSnapshot[]>("/api/employment/timeseries"),
  employmentByRole: () => getJson<ByRoleResponse>("/api/employment/by-role"),
  employmentByProvince: () => getJson<ProvinceEmployment[]>("/api/employment/by-province"),
  sources: () => getJson<DataSource[]>("/api/sources"),
};
