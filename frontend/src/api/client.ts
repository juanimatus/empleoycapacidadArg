// Sin VITE_API_URL el sitio lee los JSON estáticos de public/api/ (generados con
// `python -m app.export_static`). Con VITE_API_URL consulta el backend FastAPI en vivo.
const API_BASE: string | undefined = import.meta.env.VITE_API_URL;

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

export interface SalaryStats {
  n: number;
  p25: number;
  mediana: number;
  p75: number;
}

export type Seniority = "Junior" | "Semi-Senior" | "Senior";

export interface ShareItem {
  nombre: string;
  porcentaje: number;
}

export interface RoleProfile {
  respuestas: number;
  salario_bruto_mensual_ars: Record<Seniority, SalaryStats | null>;
  seniority: Record<Seniority, number>;
  modalidad: { remoto: number; hibrido: number; presencial: number };
  genero: { hombres_cis: number; mujeres_cis: number; otras_identidades_o_sin_respuesta: number };
  sueldo_dolarizado: number;
  anios_experiencia_mediana: number | null;
  uso_ia_promedio_0a5: number | null;
  provincias: ShareItem[];
  tecnologias: ShareItem[];
  frameworks: ShareItem[];
  plataformas: ShareItem[];
}

export interface CoitOcupacion {
  codigo: string;
  nombre: string;
  categorias_sysarmy: string[];
  ciuo08: string;
}

export interface CoitGrupo {
  codigo: string;
  nombre: string;
}

export interface RoleFamily {
  id: string;
  nombre: string;
  descripcion: string;
  aliases: string[];
  codigo: string | null;
  grupo: CoitGrupo | null;
  ocupaciones: CoitOcupacion[];
  distribucion: RoleDistribution | null;
  perfil: RoleProfile | null;
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

export const ESTIMACION_EDITORIAL = "ESTIMACION_EDITORIAL";

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

/** COIT-AR: clasificador propio de ocupaciones IT (gran grupo > familia > ocupación). */
export interface Clasificador {
  nombre: string;
  version: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  estructura: { nivel: string; digitos: number; ejemplo: string }[];
  notas: string[];
  grupos: (CoitGrupo & {
    descripcion: string;
    familias: { codigo: string; role_family_id: string; ocupaciones: CoitOcupacion[] }[];
  })[];
}

export interface EphUniverso {
  nombre: string;
  definicion: string;
  muestra: number;
  personas: number;
  porcentaje_de_ocupados: number;
  informalidad: ShareItem[];
  informalidad_por_categoria: Record<string, number>;
  fuera_del_sipa_privado: number;
  categoria: ShareItem[];
  estatal: number;
  calificacion: ShareItem[];
  sexo: ShareItem[];
  region: ShareItem[];
  rama: ShareItem[];
  rama_it: number;
  ingreso_mensual_ocupacion_principal: Record<string, { mediana: number; n: number }>;
}

/** Empleo IT formal e informal según la EPH (INDEC). */
export interface EmploymentTotal {
  fuente: { nombre: string; url: string; tipo: string };
  periodo: string;
  cobertura: string;
  metodo: string;
  ocupados_aglomerados: number;
  ingreso_periodo: string;
  universos: { software: EphUniverso; sector_it: EphUniverso };
  limites: string[];
}

async function getJson<T>(path: string): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : `${import.meta.env.BASE_URL}${path.slice(1)}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} consultando ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  roles: () => getJson<RoleFamily[]>("/api/roles"),
  role: (id: string) => getJson<RoleFamily>(`/api/roles/${id}`),
  employmentTotal: () => getJson<EmploymentTotal>("/api/employment/total"),
  clasificador: () => getJson<Clasificador>("/api/clasificador"),
  employmentSummary: () => getJson<EmploymentSummary>("/api/employment/summary"),
  employmentTimeseries: () => getJson<EmploymentSnapshot[]>("/api/employment/timeseries"),
  employmentByRole: () => getJson<ByRoleResponse>("/api/employment/by-role"),
  employmentByProvince: () => getJson<ProvinceEmployment[]>("/api/employment/by-province"),
  sources: () => getJson<DataSource[]>("/api/sources"),
};
