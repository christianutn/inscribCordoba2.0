import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from './components/Login';
import Principal from './components/Principal';
import CambioContrasenia from './components/CambioContrasenia';
import PingTest from "./components/PingTest";
import DetalleFechas from './components/DetalleFechas';
import NuevoEvento from "./components/NuevoEvento"
import ReporteCursosCC from './components/ReporteCursosCC';
import CrearAviso from './components/CrearAviso';
import MostrarAvisos from "./components/MostrarAvisos"
import CardAvisos from "./components/Avisos";
import VersionReducidaGA from './components/VersionReducidaGA';
import AsistenciasMain from './components/AsistenciaQR/AsistenciasMain';
import Layout from './components/layout/Layout';
import Confirmaciones from './components/NotaDeAutorizacion/Confirmacion';
import RegistroAsistencia from './components/AsistenciaQR/RegistroAsistencia';
import VisualizacionMisNotasRefentes from './components/NotaDeAutorizacion/VisualizacionMisNotasRefentes';
import useDocumentTitle from './hooks/useDocumentTitle';

const TitleWrapper = ({ title, children }) => {
  useDocumentTitle(title);
  return children;
};

function App() {

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/principal" element={<Layout><Principal /></Layout>} />
          <Route path="/cambiarContrasenia" element={<Layout><CambioContrasenia /></Layout>} />
          <Route path='/PingTest' element={<Layout><TitleWrapper title="Ping Test"><PingTest /></TitleWrapper></Layout>} />
          <Route path='/detalleFechas' element={<Layout><TitleWrapper title="Detalle de Fechas"><DetalleFechas /></TitleWrapper></Layout>} />
          <Route path='/nuevoEvento' element={<Layout><TitleWrapper title="Nuevo Evento"><NuevoEvento /></TitleWrapper></Layout>} />
          <Route path='/reportecursoscc' element={<Layout><TitleWrapper title="Reporte de Cursos"><ReporteCursosCC /></TitleWrapper></Layout>} />
          <Route path='/crearAvisos' element={<Layout><TitleWrapper title="Crear Aviso"><CrearAviso /></TitleWrapper></Layout>} />
          <Route path='/mostrarAvisos' element={<Layout><TitleWrapper title="Mostrar Avisos"><MostrarAvisos /></TitleWrapper></Layout>} />
          <Route path='/cardAvisos' element={<Layout><TitleWrapper title="Avisos"><CardAvisos /></TitleWrapper></Layout>} />
          <Route path='/version-reducida-ga' element={<Layout><TitleWrapper title="Versión Reducida GA"><VersionReducidaGA /></TitleWrapper></Layout>} />
          <Route path='/asistencias' element={<Layout><TitleWrapper title="Registro de Asistencias"><AsistenciasMain /></TitleWrapper></Layout>} />
          <Route path='/confirmaciones' element={<Layout><TitleWrapper title="Confirmaciones"><Confirmaciones /></TitleWrapper></Layout>} />
          <Route path='/asistencia/registrar/:courseId' element={<Layout><TitleWrapper title="Registrar Asistencia"><RegistroAsistencia /></TitleWrapper></Layout>} />
          <Route path='/mis-notas-autorizacion' element={<Layout><TitleWrapper title="Mis Notas"><VisualizacionMisNotasRefentes /></TitleWrapper></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
