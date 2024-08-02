import './App.scss';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { DataProviderTutores } from "./components/context/Formulario.context.jsx";
import Login from './components/Login';
import Principal from './components/Principal';
import Cohortes from "./components/Cohortes.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="/cohorte" element={<Cohortes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
