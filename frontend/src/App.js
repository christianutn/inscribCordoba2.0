
import './App.css';
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import Login from './components/Login';
import Formulario from './components/Formulario';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
          <Route path="/login" element={<Login />} />
          <Route path="/formulario" element={<Formulario />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
