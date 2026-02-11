// NuevoEventoForm.js

import React, { useState } from "react";
import { Container, Grid, Box } from "@mui/material"; // Using MUI for layout
import CustomInput from "@mui/material/TextField";

// Import custom components
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import Button from "./UIElements/Button";
import { useEffect } from "react";
import Divider from '@mui/material/Divider';

//import carga inicial
import { getPerfiles } from "../services/perfiles.service";
import { getAreasTematicas } from "../services/areasTematicas.service";
import { getTiposCertificaciones } from "../services/tiposCertificaciones.service.js";
import { getCursos } from "../services/cursos.service.js";
import { postEvento } from "../services/evento.service.js";

//import de usabilidad

import Tooltip from '@mui/material/Tooltip';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';






function NuevoEventoForm({ setNuevoEvento, setOpenAlertDialog, setTituloAlerta, setMensajeAlerta, selectCurso, onEventoCreado }) {
  // State for form fields
  const [perfil, setPerfil] = useState(""); // Start empty or with 'Perfil/s' if Autocomplete handles it
  const [perfiles, setPerfiles] = useState([]); // State to hold fetched perfiles
  const [areaTematica, setAreaTematica] = useState(""); // Start empty or with 'Área/s temática'
  const [areasTematicasOptions, setAreasTematicasOptions] = useState([]); // State to hold fetched areas temáticas
  const [certificaCordoba, setCertificaCordoba] = useState("Si"); // Default as shown
  const [tipoCertificacion, setTipoCertificacion] = useState(
    "Certificado de Asistencia (sin evaluación)"
  ); // Default as shown
  const [tiposCertificacionesOptions, setTiposCertificacionesOptions] = useState([]);
  const [imagenPortal, setImagenPortal] = useState(
    "Si"
  ); // Default as shown
  const [presentacion, setPresentacion] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [ejesTematicos, setEjesTematicos] = useState("");
  const [requisitosAprobacion, setRequisitosAprobacion] = useState("");
  const [curso, setCurso] = useState("");
  const [cursosOptions, setCursosOptions] = useState([]); // State to hold fetched cursos

  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(false); // State for success messages
  const [cargando, setCargando] = useState(false); // State for loading spinner
  useEffect(() => {
    (async () => {
      try {

        const perfiles = await getPerfiles();

        setPerfiles(perfiles); // Set the fetched perfiles to state

        const areasTematicas = await getAreasTematicas();
        setAreasTematicasOptions(areasTematicas); // Set the fetched areas temáticas to state

        const tiposCertificaciones = await getTiposCertificaciones();
        setTiposCertificacionesOptions(tiposCertificaciones); // Set the fetched tipos certificaciones to state

        const cursos = await getCursos();
        setCursosOptions(cursos); // Set the fetched cursos to state

        // Si selectCurso (que es el cod) seleccionarlo en cursosOptions
        if (selectCurso) {
          const cursoSeleccionado = cursos.find((curso) => curso.nombre === selectCurso);
          if (cursoSeleccionado) {
            setCurso(cursoSeleccionado.nombre); // Set the selected course name to state
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);


  // Handler for form submission (placeholder)
  const handleEnviarFormulario = async () => {

    setCargando(true); // Set loading state to true


    try {
      // Desde la propiedad curso necesito el cod de curso sacado desde la lista cursosOptions
      const cursoSeleccionado = cursosOptions.find((c) => c.nombre === curso);
      const perfilesSeleccionado = perfiles.find((p) => p.descripcion === perfil);
      const areaTematicaSeleccionado = areasTematicasOptions.find((a) => a.descripcion === areaTematica);
      const tiposCertificacionSeleccionado = tiposCertificacionesOptions.find((t) => t.descripcion === tipoCertificacion);
      const formData = {
        curso: cursoSeleccionado ? cursoSeleccionado.cod : null, // Use the cod from the selected course
        perfil: perfilesSeleccionado ? perfilesSeleccionado.cod : null, // Use the cod from the selected perfil
        area_tematica: areaTematicaSeleccionado ? areaTematicaSeleccionado.cod : null, // Use the cod from the selected area temática
        tipo_certificacion: tiposCertificacionSeleccionado ? tiposCertificacionSeleccionado.cod : null, // Use the cod from the selected tipo certificación
        presentacion,
        objetivos,
        requisitos_aprobacion: requisitosAprobacion,
        ejes_tematicos: ejesTematicos,
        certifica_en_cc: certificaCordoba === "Si" ? 1 : 0,
        disenio_a_cargo_cc: imagenPortal === "Si" ? 1 : 0,

      };
      await postEvento(formData); // Call the service to post the dat

      if (cursoSeleccionado && typeof onEventoCreado === 'function') {
        onEventoCreado(cursoSeleccionado.cod);
      }

      setSuccess(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // En caso de validar antes desde el componente Nueva Cohorte este actúa como hijo
      typeof setNuevoEvento === 'function' && setNuevoEvento(false);
      typeof setOpenAlertDialog === 'function' && setOpenAlertDialog(true);
      typeof setTituloAlerta === 'function' && setTituloAlerta("Evento creado exitosamente");
      typeof setMensajeAlerta === 'function' && setMensajeAlerta("El evento se ha creado exitosamente. Ahora puedes continuar cargando las nuevas cohortes.");


      //Limpiar los campos del formulario
      setPresentacion("");
      setObjetivos("");
      setEjesTematicos("");
      setRequisitosAprobacion("");

    } catch (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccess(false);

      setError(error.message);
    }
    finally {
      setCargando(false); // Set loading state to false
    }

  };

  return (
    <>
      {
        error &&

        <Alert className='alert' variant="filled" severity="error">
          {error}
        </Alert>

      }
      {
        success &&
        <Alert className='alert' variant="filled" severity="success"  >
          Nuevo evento cargado con éxito
        </Alert>
      }
      {
        cargando && <Backdrop
          sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={cargando}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {" "}
        {/* Added some margin top/bottom */}
        <Titulo texto="Crear Evento" />
        <div className='divider'><Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} /></div>
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
                options={perfiles.map((perfil) => perfil.descripcion)} // Assuming 'nombre' is the field you want to display
                value={perfil}
                getValue={(value) => setPerfil(value || "")} // Ensure value isn't null/undefined
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Seleccione area temática"}
                options={areasTematicasOptions.map((area) => area.descripcion)} // Assuming 'nombre' is the field you want to display
                value={areaTematica}
                getValue={(value) => setAreaTematica(value || "")} // Ensure value isn't null/undefined
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Seleccione si certifica en Campus Córdoba"}
                options={["Si", "No"]}
                value={certificaCordoba}
                getValue={(value) => setCertificaCordoba(value)}
              />
            </Grid>
            {/* --- Row 2: Tipo Certificación, Imagen Portal --- */}
            <Grid item xs={4} md={4}>
              <Autocomplete
                label={"Tipo de certificación"}
                options={tiposCertificacionesOptions.map((tipo) => tipo.descripcion)}
                value={tipoCertificacion}
                getValue={(value) => setTipoCertificacion(value)}
              />
            </Grid>
            <Grid item xs={4} md={4}>
              <Autocomplete
                label={"Diseño de imagen en portal a cargo de repartición"}
                options={["Si", "No"]}
                value={imagenPortal}
                getValue={(value) => setImagenPortal(value)}
              />
            </Grid>
            <Grid item xs={4} md={4}>
              <Autocomplete
                label={"Curso"}
                options={cursosOptions.map((curso) => curso.nombre)}
                value={curso}
                getValue={(value) => setCurso(value)}
              />
            </Grid>
            {/* --- Row 3: Presentación/Fundamentación --- */}
            <Grid item xs={12}>
              <Tooltip title="Explica, de manera breve, cuál o cuáles son las razones por las que se desarrolla e implementa el evento de capacitación. Puede estar fundada en un marco teórico en el cual se basan los contenidos del curso, en un programa de gobierno y/o en una necesidad coyuntural."
                placement="top"

                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#333', // Fondo oscuro
                      color: '#fff', // Texto blanco
                      fontSize: '16px', // Tamaño de letra más grande
                      maxWidth: '400px', // Ancho máximo del tooltip
                      padding: '12px', // Espaciado interno
                      borderRadius: '8px', // Bordes redondeados
                    },
                  },
                }}
              >
                <CustomInput
                  id="outlined-multiline-static"
                  label="Presentación/Fundamentación"
                  multiline
                  rows={4}
                  fullWidth
                  value={presentacion}
                  onChange={(event) => setPresentacion(event.target.value)}

                />

              </Tooltip>

            </Grid>
            {/* --- Row 4: Objetivos --- */}
            <Grid item xs={12}>
              <Tooltip title="Es lo que se espera que los participantes al evento de capacitación aprendan o incorporen a sus saberes previos. Puede ser un objetivo general y dos o tres objetivos particulares o sólo una de las opciones."
                placement="top"

                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#333', // Fondo oscuro
                      color: '#fff', // Texto blanco
                      fontSize: '16px', // Tamaño de letra más grande
                      maxWidth: '400px', // Ancho máximo del tooltip
                      padding: '12px', // Espaciado interno
                      borderRadius: '8px', // Bordes redondeados
                    },
                  },
                }}
              >
                <CustomInput
                  id="outlined-multiline-static"
                  label="Objetivos"
                  multiline
                  rows={4}
                  fullWidth
                  value={objetivos}
                  onChange={(event) => setObjetivos(event.target.value)}

                />
              </Tooltip>
            </Grid>
            {/* --- Row 5: Ejes Temáticos / Temarios --- */}
            <Grid item xs={12}>
              <Tooltip title="Contenidos teóricos separado por módulos."
                placement="top"

                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#333', // Fondo oscuro
                      color: '#fff', // Texto blanco
                      fontSize: '16px', // Tamaño de letra más grande
                      maxWidth: '400px', // Ancho máximo del tooltip
                      padding: '12px', // Espaciado interno
                      borderRadius: '8px', // Bordes redondeados
                    },
                  },
                }}
              >
                <CustomInput
                  id="outlined-multiline-static"
                  label="Ejes temáticos / temarios"
                  multiline
                  rows={4}
                  fullWidth
                  value={ejesTematicos}
                  onChange={(event) => setEjesTematicos(event.target.value)}

                />
              </Tooltip>
            </Grid>
            {/* --- Row 6: Requisitos de Aprobación --- */}
            <Grid item xs={12}>
              <Tooltip title="Especificar cuales serán los requisitos que deben cumplir los alumnos para aprobar (asistencia, calificaciones, presentación de actividades, etc.)"
                placement="top"

                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#333', // Fondo oscuro
                      color: '#fff', // Texto blanco
                      fontSize: '16px', // Tamaño de letra más grande
                      maxWidth: '400px', // Ancho máximo del tooltip
                      padding: '12px', // Espaciado interno
                      borderRadius: '8px', // Bordes redondeados
                    },
                  },
                }}
              >
                <CustomInput
                  id="outlined-multiline-static"
                  label="Requisitos de aprobación"
                  multiline
                  rows={4}
                  fullWidth
                  value={requisitosAprobacion}
                  onChange={(event) => setRequisitosAprobacion(event.target.value)}

                />
              </Tooltip>
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

    </>
  );
}

export default NuevoEventoForm;