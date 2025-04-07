// NuevoEventoForm.js

import React, { useState } from "react";
import { Container, Grid, Box } from "@mui/material"; // Using MUI for layout
import CustomInput from "@mui/material/TextField";

// Import custom components
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import TextField from "./UIElements/TextField";
import Button from "./UIElements/Button";

// Placeholder data for Autocompletes
const perfilesOptions = [
  "Perfil/s",
  "Docente",
  "Estudiante",
  "Administrativo",
  "Público General",
];
const areasTematicasOptions = [
  "Área/s temática",
  "Tecnología",
  "Educación",
  "Salud",
  "Arte y Cultura",
  "Ciencias Sociales",
  "Otro",
];
const certificaOptions = ["Si", "No"];
const tipoCertificacionOptions = [
  "Certificado de Asistencia (sin evaluación)",
  "Certificado de Aprobación (con evaluación)",
  "No certifica",
];
const imagenPortalOptions = [
  "Diseño a cargo del equipo de Campus Córdoba",
  "Usar imagen genérica",
  "Solicitar diseño específico",
  "Proveer diseño propio",
];

function NuevoEventoForm() {
  // State for form fields
  const [perfil, setPerfil] = useState(""); // Start empty or with 'Perfil/s' if Autocomplete handles it
  const [areaTematica, setAreaTematica] = useState(""); // Start empty or with 'Área/s temática'
  const [certificaCordoba, setCertificaCordoba] = useState("Si"); // Default as shown
  const [tipoCertificacion, setTipoCertificacion] = useState(
    "Certificado de Asistencia (sin evaluación)"
  ); // Default as shown
  const [imagenPortal, setImagenPortal] = useState(
    "Diseño a cargo del equipo de Campus Córdoba"
  ); // Default as shown
  const [presentacion, setPresentacion] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [ejesTematicos, setEjesTematicos] = useState("");
  const [requisitosAprobacion, setRequisitosAprobacion] = useState("");

  // Handler for form submission (placeholder)
  const handleEnviarFormulario = () => {
    const formData = {
      perfil,
      areaTematica,
      certificaCordoba,
      tipoCertificacion,
      imagenPortal,
      presentacion,
      objetivos,
      ejesTematicos,
      requisitosAprobacion,
    };
    console.log("Datos del formulario:", formData);
    // TODO: Add logic here to send data to the backend API
    alert("Formulario enviado (revisar consola)");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {" "}
      {/* Added some margin top/bottom */}
      <Titulo texto="Formulario: Nuevo Evento" />
      <Box component="form" noValidate sx={{ mt: 3 }}>
        {" "}
        {/* Using Box as a form container */}
        <Grid container spacing={3}>
          {" "}
          {/* Added spacing between grid items */}
          {/* --- Row 1: Perfil, Area Temática, Certifica Córdoba --- */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              label={"Seleccione perfil"}
              options={perfilesOptions}
              value={perfil}
              getValue={(value) => setPerfil(value || "")} // Ensure value isn't null/undefined
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              label={"Seleccione area temática"}
              options={areasTematicasOptions}
              value={areaTematica}
              getValue={(value) => setAreaTematica(value || "")} // Ensure value isn't null/undefined
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              label={"Seleccione si certifica en Campus Córdoba"}
              options={certificaOptions}
              value={certificaCordoba}
              getValue={(value) => setCertificaCordoba(value)}
            />
          </Grid>
          {/* --- Row 2: Tipo Certificación, Imagen Portal --- */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              label={"Tipo de certificación"}
              options={tipoCertificacionOptions}
              value={tipoCertificacion}
              getValue={(value) => setTipoCertificacion(value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              label={"Imagen para el portal de inscripciones"}
              options={imagenPortalOptions}
              value={imagenPortal}
              getValue={(value) => setImagenPortal(value)}
            />
          </Grid>
          {/* --- Row 3: Presentación/Fundamentación --- */}
          <Grid item xs={12}>
            
            <CustomInput
              id="outlined-multiline-static"
              label="Presentación/Fundamentación"
              multiline
              rows={4}
              fullWidth
              value={presentacion}
              onChange={(event) => setPresentacion(event.target.value)}
              
            />
          </Grid>
          {/* --- Row 4: Objetivos --- */}
          <Grid item xs={12}>
            <CustomInput
              id="outlined-multiline-static"
              label="Objetivos"
              multiline
              rows={4}
              fullWidth
              value={objetivos}
              onChange={(event) => setObjetivos(event.target.value)}
              
            />
          </Grid>
          {/* --- Row 5: Ejes Temáticos / Temarios --- */}
          <Grid item xs={12}>
          
            <CustomInput
              id="outlined-multiline-static"
              label="Ejes temáticos / temarios"
              multiline
              rows={4}
              fullWidth
              value={ejesTematicos}
              onChange={(event) => setEjesTematicos(event.target.value)}
              
            />
          </Grid>
          {/* --- Row 6: Requisitos de Aprobación --- */}
          <Grid item xs={12}>
            
            <CustomInput
              id="outlined-multiline-static"
              label="Requisitos de aprobación"
              multiline
              rows={4}
              fullWidth
              value={requisitosAprobacion}
              onChange={(event) => setRequisitosAprobacion(event.target.value)}
              
            />
          </Grid>
          {/* --- Row 7: Submit Button --- */}
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "center", mt: 2 }}
          >
            <Button
              mensaje={"ENVIAR"}
              type="button" // Use "submit" if Box is changed to <form> and you want native submit
              hanldeOnClick={handleEnviarFormulario} // Make sure the prop name matches your component definition
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default NuevoEventoForm;
