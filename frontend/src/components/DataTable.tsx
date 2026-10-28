/** Alternativa en texto de un gráfico, plegada para no sumar ruido en pantalla. */
export function DataTable({
  summary,
  caption,
  headers,
  rows,
}: {
  summary: string;
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <details className="disclosure">
      <summary>{summary}</summary>
      <div className="disclosure-body table-scroll">
        <table className="province-table">
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
