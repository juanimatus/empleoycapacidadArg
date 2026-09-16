import { NavLink, Route, HashRouter as Router, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Methodology } from "./pages/Methodology";
import { RoleExplorer } from "./pages/RoleExplorer";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <header className="topbar">
          <span className="brand">Observatorio IT AR</span>
          <nav>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/roles">Explorador de Roles</NavLink>
            <NavLink to="/metodologia">Fuentes y Metodología</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roles" element={<RoleExplorer />} />
            <Route path="/metodologia" element={<Methodology />} />
          </Routes>
        </main>
        <footer className="footer">
          MVP independiente — no afiliado al Ministerio de Trabajo ni a CESSI/OPSSI. Todos los
          datos citan su fuente original.
        </footer>
      </div>
    </Router>
  );
}

export default App;
