
import './App.scss';
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import { DataProviderTutores } from "./components/context/Formulario.context.jsx"
import Login from './components/Login';
import Principal from './components/Principal'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Principal /> } index />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
