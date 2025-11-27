import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from './components/Login';
import Principal from './components/Principal';
import AltaCurso from "./components/FormulariosAlta/AltaCurso";
import AltaMinisterio from "./components/FormulariosAlta/AltaMinisterio";
import AltaPlataformaDictado from "./components/FormulariosAlta/AltaPlataformaDictado";
import AltaTiposCapacitacion from './components/FormulariosAlta/AltaTiposCapacitacion';
import AltaMediosInscripcion from "./components/FormulariosAlta/AltaMedioInscripcion";
import AltaArea from "./components/FormulariosAlta/AltaArea";
import AltaPersona from "./components/FormulariosAlta/AltaPersonas";
import AltaTutores from "./components/FormulariosAlta/AltaTutores";
import RegistrosTutores from "./components/RegistrosTutores";
import CambioContrasenia from './components/CambioContrasenia';
import PingTest from "./components/PingTest";
import AltaAsignacionesAreasUsuario from './components/FormulariosAlta/AltaAsignacionesAreasUsuario';
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

function App() {

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/principal" element={<Layout><Principal /></Layout>} />
          <Route path="/cursos/alta" element={<Layout><AltaCurso /></Layout>} />
          <Route path="/ministerios/alta" element={<Layout><AltaMinisterio /></Layout>} />
          <Route path="/plataformasDictados/alta" element={<Layout><AltaPlataformaDictado /></Layout>} />
          <Route path="/tiposCapacitaciones/alta" element={<Layout><AltaTiposCapacitacion /></Layout>} />
          <Route path="/mediosInscripciones/alta" element={<Layout><AltaMediosInscripcion /></Layout>} />
          <Route path="/areas/alta" element={<Layout><AltaArea /></Layout>} />
          <Route path="/personas/alta" element={<Layout><AltaPersona /></Layout>} />
          <Route path="/tutores/alta" element={<Layout><AltaTutores /></Layout>} />
          <Route path="/usuarios/alta" element={<Layout><RegistrosTutores /></Layout>} />
          <Route path="/cambiarContrasenia" element={<Layout><CambioContrasenia /></Layout>} />
          <Route path='/PingTest' element={<Layout><PingTest /></Layout>} />
          <Route path='/areasAsignadasUsuario/alta' element={<Layout><AltaAsignacionesAreasUsuario /></Layout>} />
          <Route path='/detalleFechas' element={<Layout><DetalleFechas /></Layout>} />
          <Route path='/nuevoEvento' element={<Layout><NuevoEvento /></Layout>} />
          <Route path='/reportecursoscc' element={<Layout><ReporteCursosCC /></Layout>} />
          <Route path='/crearAvisos' element={<Layout><CrearAviso /></Layout>} />
          <Route path='/mostrarAvisos' element={<Layout><MostrarAvisos /></Layout>} />
          <Route path='/cardAvisos' element={<Layout><CardAvisos /></Layout>} />
          <Route path='/version-reducida-ga' element={<Layout><VersionReducidaGA /></Layout>} />
          <Route path='/asistencias' element={<Layout><AsistenciasMain /></Layout>} />
          <Route path='/confirmaciones' element={<Layout><Confirmaciones /></Layout>} />


        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
