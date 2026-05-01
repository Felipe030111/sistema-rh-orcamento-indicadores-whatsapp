import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Sidebar from "./layout/Sidebar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Versoes from "./pages/Versoes.jsx";
import Headcount from "./pages/Headcount.jsx";
import Grupos from "./pages/Grupos.jsx";
import Verbas from "./pages/Verbas.jsx";
import Premissas from "./pages/Premissas.jsx";
import Calculo from "./pages/Calculo.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Cadastros from "./pages/Cadastros.jsx";
import { isLoggedIn } from "./api.js";

function PrivateLayout({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header />
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
      <Route path="/cadastros/empresas" element={<PrivateLayout><Cadastros tipo="empresas" /></PrivateLayout>} />
      <Route path="/cadastros/departamentos" element={<PrivateLayout><Cadastros tipo="departamentos" /></PrivateLayout>} />
      <Route path="/cadastros/cargos" element={<PrivateLayout><Cadastros tipo="cargos" /></PrivateLayout>} />
      <Route path="/versoes" element={<PrivateLayout><Versoes /></PrivateLayout>} />
      <Route path="/headcount" element={<PrivateLayout><Headcount /></PrivateLayout>} />
      <Route path="/importar" element={<Navigate to="/headcount" replace />} />
      <Route path="/grupos" element={<PrivateLayout><Grupos /></PrivateLayout>} />
      <Route path="/verbas" element={<PrivateLayout><Verbas /></PrivateLayout>} />
      <Route path="/premissas" element={<PrivateLayout><Premissas /></PrivateLayout>} />
      <Route path="/calculo" element={<PrivateLayout><Calculo /></PrivateLayout>} />
      <Route path="/relatorios" element={<PrivateLayout><Relatorios /></PrivateLayout>} />
      <Route path="/demonstrativo" element={<Navigate to="/relatorios" replace />} />
      <Route path="/comparacao" element={<Navigate to="/relatorios" replace />} />
      <Route path="/teste" element={<Navigate to="/calculo" replace />} />
    </Routes>
  );
}

