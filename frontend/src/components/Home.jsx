import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Imagen from './imagenes/imagen_principal.jpg';
import LinkInteres from './LinkDeInteres.jsx';
import CampusCba from './imagenes/campus_cordoba.png';
import Capacitacion4 from './imagenes/capacitacion_4pasos.png';
import PortalCC from './imagenes/portal_cc.png';
import Victorius from './imagenes/victorius.png';
import LogoFooter from './imagenes/logo_footer.png';


const Home = () => {
    return (
        <div className="main-content">
            <div className="home-container">
                <div className="welcome-section">
                    <Box className="text-content">
                        <Typography variant="h4" className="title">
                            ¡Bienvenido/a a InscribCórdoba!
                        </Typography>
                        <Typography variant="body1" className="description">
                            InscribCórdoba es la plataforma centralizada para gestionar y planificar todas las capacitaciones que se ofrecen en Campus Córdoba.
                        </Typography>
                        <Typography variant="body1" className="description">
                            En esta plataforma, podrá:
                        </Typography>
                        <ul className="list">
                            <li><Typography variant="body1" className="list-item"><strong>Planificar las fechas de sus capacitaciones:</strong> Organice y ajuste el calendario de sus cursos.</Typography></li>
                            <li><Typography variant="body1" className="list-item"><strong>Consultar los cursos cargados:</strong> Verifique en todo momento qué cursos ha registrado.</Typography></li>
                        </ul>
                        <Typography variant="body1" className="contact">
                            Para consultas, puede comunicarse a través del correo:
                            <a href="mailto:soportecampuscordoba@cba.gov.ar" className="email-link"> soportecampuscordoba@cba.gov.ar</a>
                        </Typography>
                    </Box>
                    <Box className="image-content">
                        <img src={Imagen} alt="InscribCórdoba" className="main-image" />
                    </Box>
                </div>

                <div className="links-section">
                    <Typography variant="h5" className="link-title">
                        Links de interés
                    </Typography>
                    <div className="links-container">
                        <LinkInteres
                            imagenSrc={Capacitacion4}
                            titulo="Capacitación en 4 pasos"
                            onClick={() => window.open('https://drive.google.com/drive/folders/19NDcgExBrCNOF2HdK2fyPf0IllY0zgKz?usp=drive_link', '_blank', 'noopener,noreferrer')}
                        />
                        <LinkInteres
                            imagenSrc={Victorius}
                            titulo="Victorius - Sistema de Gestión Académica"
                            onClick={() => window.open('https://campuscordoba.cba.gov.ar/gestordeplataforma/public/', '_blank', 'noopener,noreferrer')}
                        />
                        <LinkInteres
                            imagenSrc={PortalCC}
                            titulo="Portal de Capacitación Integral de la Provincia"
                            onClick={() => window.open('https://campuscordoba.cba.gov.ar/#page-event-list', '_blank', 'noopener,noreferrer')}
                        />
                        <LinkInteres
                            imagenSrc={CampusCba}
                            titulo="Campus Córdoba"
                            onClick={() => window.open('https://campuscordoba.cba.gov.ar/plataforma/my/', '_blank', 'noopener,noreferrer')}
                        />
                    </div>
                </div>

                <footer className="footer">
                    <div className="footer-content">
                        <img src={LogoFooter} alt="Campus Córdoba" className="footer-logo" />
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
