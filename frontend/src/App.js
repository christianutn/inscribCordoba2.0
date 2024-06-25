
import './App.scss';
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import Login from './components/Login';
import Principal from './components/Principal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
      
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Principal />} index />
     


      </Routes>
    </BrowserRouter>
  );
}

export default App;
