import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    const originalTitle = document.title;
    const baseTitle = 'InscribCórdoba';
    
    // Si hay un título, lo mostramos con el formato "Sección - InscribCórdoba"
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;

    // Cleanup: Restaura el título original si se desmonta el componente
    // o cambia el título, para que el título no quede "pegado"
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
