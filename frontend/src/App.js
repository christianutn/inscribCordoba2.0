import './App.scss';
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
import PingTest from "./components/PingTest"; // Sólo a  modo de desarrollo, luego podrá eliminarse no influye con ninguna funcionalidad
import ChatBoot from './components/ChatBot';
import DiccionarioChat from './components/Diccionario';
import AltaAsignacionesAreasUsuario from './components/FormulariosAlta/AltaAsignacionesAreasUsuario';
import DetalleFechas from './components/DetalleFechas';
import NuevoEvento from "./components/NuevoEvento"
import ReporteCursosCC from './components/ReporteCursosCC';
import CrearAviso from './components/CrearAviso';
import MostrarAvisos from "./components/MostrarAvisos"
import CardAvisos from "./components/Avisos";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="/cursos/alta" element={<AltaCurso />} />
        <Route path="/ministerios/alta" element={<AltaMinisterio />} />
        <Route path="/plataformasDictados/alta" element={<AltaPlataformaDictado />} />
        <Route path="/tiposCapacitaciones/alta" element={<AltaTiposCapacitacion />} />
        <Route path="/mediosInscripciones/alta" element={<AltaMediosInscripcion />} />
        <Route path="/areas/alta" element={<AltaArea />} />
        <Route path="/personas/alta" element={<AltaPersona />} />
        <Route path="/tutores/alta" element={<AltaTutores />} />
        <Route path="/usuarios/alta" element={<RegistrosTutores />} />
        <Route path="/cambiarContrasenia" element={<CambioContrasenia />} />
        <Route path='/PingTest' element={<PingTest />} />
        <Route path='/chatbot' element={<ChatBoot />} />
        <Route path='/diccionario' element={<DiccionarioChat />} />
        <Route path='/areasAsignadasUsuario/alta' element={<AltaAsignacionesAreasUsuario />} />
        <Route path='/detalleFechas' element={<DetalleFechas />} />
        <Route path='/nuevoEvento' element={<NuevoEvento />} />
        <Route path='/reportecursoscc' element={<ReporteCursosCC />} />
        <Route path='/crearAvisos' element={<CrearAviso />} />
        <Route path='/mostrarAvisos' element={<MostrarAvisos />} />
        <Route path='/cardAvisos' element={<CardAvisos />} />
       







      </Routes>
    </BrowserRouter>
  );
}

export default App;
