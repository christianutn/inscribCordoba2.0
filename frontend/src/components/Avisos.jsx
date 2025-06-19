import MostrarAvisos from './MostrarAvisos.jsx';

const estiloAvisos = {
  avisosContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px auto',
    width: '80%',
  },
  titulo: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
};

const CardAvisos = () => (
  <div style={estiloAvisos.avisosContainer}>
    <h1 style={estiloAvisos.titulo}>Avisos</h1>
    <MostrarAvisos />
  </div>
);

export default CardAvisos;
