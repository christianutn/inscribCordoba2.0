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
import AsistenciasMain from './components/AsistenciasMain';
import Layout from './components/layout/Layout';
import Confirmaciones from './components/NotaDeAutorizacion/Confirmacion';
import RegistroAsistencia from './components/RegistroAsistencia';
function App() {

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/principal" element={<Layout><Principal /></Layout>} />
          <Route path="/cambiarContrasenia" element={<Layout><CambioContrasenia /></Layout>} />
          <Route path='/PingTest' element={<Layout><PingTest /></Layout>} />
          <Route path='/detalleFechas' element={<Layout><DetalleFechas /></Layout>} />
          <Route path='/nuevoEvento' element={<Layout><NuevoEvento /></Layout>} />
          <Route path='/reportecursoscc' element={<Layout><ReporteCursosCC /></Layout>} />
          <Route path='/crearAvisos' element={<Layout><CrearAviso /></Layout>} />
          <Route path='/mostrarAvisos' element={<Layout><MostrarAvisos /></Layout>} />
          <Route path='/cardAvisos' element={<Layout><CardAvisos /></Layout>} />
          <Route path='/version-reducida-ga' element={<Layout><VersionReducidaGA /></Layout>} />
          <Route path='/asistencias' element={<Layout><AsistenciasMain /></Layout>} />
          <Route path='/asistencia/registrar/:courseId' element={<Layout><RegistroAsistencia /></Layout>} />
          <Route path='/confirmaciones' element={<Layout><Confirmaciones /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
