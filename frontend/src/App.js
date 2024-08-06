import './App.scss';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from './components/Login';
import Principal from './components/Principal';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/principal" element={<Principal />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
