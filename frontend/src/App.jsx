import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import IndicadoresHeadcount from "./pages/IndicadoresHeadcount.jsx";
import IndicadoresHorasExtras from "./pages/IndicadoresHorasExtras.jsx";
import IndicadoresSelecao from "./pages/IndicadoresSelecao.jsx";
import IndicadoresAbsenteismo from "./pages/IndicadoresAbsenteismo.jsx";
import IndicadoresTurnover from "./pages/IndicadoresTurnover.jsx";
import IndicadoresTreinamento from "./pages/IndicadoresTreinamento.jsx";
import IndicadoresAfastamentos from "./pages/IndicadoresAfastamentos.jsx";
import IndicadoresDemografia from "./pages/IndicadoresDemografia.jsx";
import IndicadoresFolha from "./pages/IndicadoresFolha.jsx";
import RelatoriosAutomaticos from "./pages/RelatoriosAutomaticos.jsx";
import ChatbotRH from "./pages/ChatbotRH.jsx";
import { isLoggedIn } from "./api.js";

function PrivateLayout({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (location.pathname === "/") {
    return <div className="module-entry-shell">{children}</div>;
  }
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
      <Route path="/indicadores/headcount" element={<PrivateLayout><IndicadoresHeadcount /></PrivateLayout>} />
      <Route path="/indicadores/horas-extras" element={<PrivateLayout><IndicadoresHorasExtras /></PrivateLayout>} />
      <Route path="/indicadores/selecao" element={<PrivateLayout><IndicadoresSelecao /></PrivateLayout>} />
      <Route path="/indicadores/absenteismo" element={<PrivateLayout><IndicadoresAbsenteismo /></PrivateLayout>} />
      <Route path="/indicadores/turnover" element={<PrivateLayout><IndicadoresTurnover /></PrivateLayout>} />
      <Route path="/indicadores/treinamento" element={<PrivateLayout><IndicadoresTreinamento /></PrivateLayout>} />
      <Route path="/indicadores/afastamentos" element={<PrivateLayout><IndicadoresAfastamentos /></PrivateLayout>} />
      <Route path="/indicadores/demografia" element={<PrivateLayout><IndicadoresDemografia /></PrivateLayout>} />
      <Route path="/indicadores/folha" element={<PrivateLayout><IndicadoresFolha /></PrivateLayout>} />
      <Route path="/automaticos" element={<PrivateLayout><RelatoriosAutomaticos /></PrivateLayout>} />
      <Route path="/chatbot-rh" element={<Navigate to="/chatbot-rh/assuntos" replace />} />
      <Route path="/chatbot-rh/:secao" element={<PrivateLayout><ChatbotRH /></PrivateLayout>} />
    </Routes>
  );
}

