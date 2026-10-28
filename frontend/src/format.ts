/** Pesos en millones con dos decimales: 3273000 -> "$3,27 M". */
export function millones(valor: number): string {
  return `$${(valor / 1_000_000).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} M`;
}

export function porcentaje(valor: number): string {
  return `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
}

/** Minúsculas y sin tildes, para buscar "diseñador" escribiendo "disenador". */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
