import { ThemeProvider, CssBaseline } from '@mui/material';
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
import CcAsistenciasMain from './components/CcAsistenciaQR/CcAsistenciasMain';
import RegistroCcAsistencia from './components/CcAsistenciaQR/RegistroCcAsistencia';
import useDocumentTitle from './hooks/useDocumentTitle';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const TitleWrapper = ({ title, children }) => {
  useDocumentTitle(title);
  return children;
};

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/" element={<Navigate to="/principal" />} />
            
            {/* Private Routes */}
            <Route path="/principal" element={<ProtectedRoute><Layout><Principal /></Layout></ProtectedRoute>} />
            <Route path="/cambiarContrasenia" element={<Layout><CambioContrasenia /></Layout>} />
            <Route path='/PingTest' element={<ProtectedRoute><Layout><TitleWrapper title="Ping Test"><PingTest /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/detalleFechas' element={<ProtectedRoute><Layout><TitleWrapper title="Detalle de Fechas"><DetalleFechas /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/nuevoEvento' element={<ProtectedRoute><Layout><TitleWrapper title="Nuevo Evento"><NuevoEvento /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/reportecursoscc' element={<ProtectedRoute><Layout><TitleWrapper title="Reporte de Cursos"><ReporteCursosCC /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/crearAvisos' element={<ProtectedRoute><Layout><TitleWrapper title="Crear Aviso"><CrearAviso /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/mostrarAvisos' element={<ProtectedRoute><Layout><TitleWrapper title="Mostrar Avisos"><MostrarAvisos /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/cardAvisos' element={<ProtectedRoute><Layout><TitleWrapper title="Avisos"><CardAvisos /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/version-reducida-ga' element={<ProtectedRoute><Layout><TitleWrapper title="Versión Reducida GA"><VersionReducidaGA /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/asistencias' element={<ProtectedRoute><Layout><TitleWrapper title="Registro de Asistencias"><AsistenciasMain /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/confirmaciones' element={<ProtectedRoute><Layout><TitleWrapper title="Confirmaciones"><Confirmaciones /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/asistencia/registrar/:courseId' element={<ProtectedRoute><Layout><TitleWrapper title="Registrar Asistencia"><RegistroAsistencia /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/mis-notas-autorizacion' element={<ProtectedRoute><Layout><TitleWrapper title="Mis Notas"><VisualizacionMisNotasRefentes /></TitleWrapper></Layout></ProtectedRoute>} />
            {/* Rutas para CC Asistencia */}
            <Route path='/cc-asistencias' element={<ProtectedRoute><Layout><TitleWrapper title="Registro Asistencia CC"><CcAsistenciasMain /></TitleWrapper></Layout></ProtectedRoute>} />
            <Route path='/cc-asistencias/registrar/:eventoId' element={<Layout><TitleWrapper title="Registrar Asistencia CC"><RegistroCcAsistencia /></TitleWrapper></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
