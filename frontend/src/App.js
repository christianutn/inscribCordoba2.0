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

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
