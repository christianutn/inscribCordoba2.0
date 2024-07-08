import React, { createContext, useState } from 'react';

export const DataContextTutores = createContext();

export const DataProviderTutores = ({ children }) => {
  const [tutores, setTutores] = useState([]);
  const [mostrar, setMostrar] = useState("Formulario");
  

  return (
    <DataContextTutores.Provider value={{ tutores, setTutores, mostrar, setMostrar }}>
      { children}
    </DataContextTutores.Provider>
  );
};
