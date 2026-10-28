import { Link, NavLink, Route, HashRouter as Router, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "./pages/Home";
import { Market } from "./pages/Market";
import { Methodology } from "./pages/Methodology";
import { Provinces } from "./pages/Provinces";
import { RoleList } from "./pages/RoleList";
import { RoleProfile } from "./pages/RoleProfile";

const REPO = "https://github.com/juanimatus/empleoycapacidadArg";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-shell">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <header className="topbar">
          <Link to="/" className="brand">
            Observatorio IT <span>Argentina</span>
          </Link>
          <nav aria-label="Principal">
            <NavLink to="/roles">Roles</NavLink>
            <NavLink to="/mercado">Panorama</NavLink>
            <NavLink to="/provincias">Provincias</NavLink>
            <NavLink to="/metodologia">Metodología</NavLink>
          </nav>
        </header>
        <main id="contenido">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roles" element={<RoleList />} />
            <Route path="/roles/:id" element={<RoleProfile />} />
            <Route path="/mercado" element={<Market />} />
            <Route path="/provincias" element={<Provinces />} />
            <Route path="/metodologia" element={<Methodology />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="footer-cols">
            <div>
              <strong>Observatorio IT Argentina</strong>
              <p>
                Proyecto independiente, sin afiliación con el Ministerio de Trabajo, CESSI/OPSSI ni
                Sysarmy. Todos los datos citan su fuente original.
              </p>
            </div>
            <ul>
              <li>
                <Link to="/metodologia">Fuentes y metodología</Link>
              </li>
              <li>
                <a href={`${REPO}/issues/new`} target="_blank" rel="noreferrer">
                  Ayudanos a mejorar
                </a>
              </li>
              <li>
                <a href={REPO} target="_blank" rel="noreferrer">
                  Código y datos abiertos
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
