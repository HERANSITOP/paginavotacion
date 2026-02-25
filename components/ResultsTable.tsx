export interface OptionResult {
  id: number;
  name: string;
  count: number;
}

const META: Record<
  string,
  { desc: string; clases: string; avance: string; eval: string; obs: string }
> = {
  "Anormalidad Académica": {
    desc: "Mecanismo que implica la continuidad de las clases, pero los y las docentes no pueden tomar asistencia ni realizar actividades evaluativas",
    clases: "Sí",
    avance: "Sí",
    eval: "No",
    obs: "",
  },
  "Asamblea Escalonada": {
    desc: "Mecanismo por el cual se desarrollan alternadamente actividades académicas y sesiones de asamblea para analizar la evolución de las problemáticas. Mientras haya asamblea o actividades asamblearias no se dicta clase",
    clases: "Sí*",
    avance: "Sí",
    eval: "Sí",
    obs: "* Se pueden dictar clases siempre y cuando no haya asamblea o actividades asamblearias en el horario del curso",
  },
  "Asamblea Permanente": {
    desc: "Mecanismo que implica la suspensión de clases y evaluación para desarrollar actividades de movilización y discusión",
    clases: "No",
    avance: "No",
    eval: "No",
    obs: "Estudiantes y docentes se pueden reunir en los espacios de clase voluntariamente para abordar la problemática y otros temas no impliquen avanzar con el curso ni evaluar",
  },
  "Paro": {
    desc: "Mecanismo por el cual se suspenden todas las actividades institucionales (académicas y/o administrativas) del estamento que se acoge a esta figura.",
    clases: "No",
    avance: "No",
    eval: "No",
    obs: "Cuando es un paro de empleados administrativos no se afectan las clases",
  },
  "Normalidad": {
    desc: "Se siguen las fechas establecidas.",
    clases: "Sí",
    avance: "Sí",
    eval: "Sí",
    obs: "",
  },
};

function Tag({ value }: { value: string }) {
  const isNo = value === "No";
  return (
    <span className={`tag ${isNo ? "tag-no" : "tag-yes"}`}>{value}</span>
  );
}

export default function ResultsTable({ results }: { results: OptionResult[] }) {
  const total = results.reduce((s, r) => s + r.count, 0);

  if (results.length === 0) {
    return <p className="muted">Aún no hay votos.</p>;
  }

  return (
    <div className="results-table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th>Mecanismo</th>
            <th>Descripción</th>
            <th>Votos</th>
            <th>¿Clases?</th>
            <th>¿Avance?</th>
            <th>¿Evaluación?</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const pct = total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0";
            const info = META[r.name] ?? { desc: "-", clases: "-", avance: "-", eval: "-", obs: "" };
            return (
              <tr key={r.id}>
                <td className="mechanism">{r.name}</td>
                <td className="desc">{info.desc}</td>
                <td className="votes-cell">
                  <div className="vote-count-row">
                    <span className="vote-count-num">{r.count}</span>
                    <span className="pct-badge">{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td>
                  <Tag value={info.clases} />
                </td>
                <td>
                  <Tag value={info.avance} />
                </td>
                <td>
                  <Tag value={info.eval} />
                </td>
                <td className="obs">{info.obs}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
