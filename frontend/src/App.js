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

import OpcionesEvento from './components/OpcionesEvento';



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
<<<<<<< HEAD
        <Route path='/OpcionesEvento' element={<OpcionesEvento />} />
=======
        <Route path='/diccionario' element={<DiccionarioChat />} />


>>>>>>> 53f706b972b54d350e971a77329c89a135902176


      </Routes>
    </BrowserRouter>
  );
}

export default App;
