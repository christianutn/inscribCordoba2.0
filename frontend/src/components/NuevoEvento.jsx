// NuevoEventoForm.js

import React, { useState, useEffect } from "react";
import { Container, Grid, Box, Button as MuiButton } from "@mui/material"; // Using MUI for layout
import CustomInput from "@mui/material/TextField";
import { useTheme } from '@mui/material/styles';

// Import custom components
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
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
  const theme = useTheme();

  // State for form fields
  const [perfil, setPerfil] = useState("");
  const [perfiles, setPerfiles] = useState([]);
  const [areaTematica, setAreaTematica] = useState("");
  const [areasTematicasOptions, setAreasTematicasOptions] = useState([]);
  const [certificaCordoba, setCertificaCordoba] = useState("Si");
  const [tipoCertificacion, setTipoCertificacion] = useState("Certificado de Asistencia (sin evaluación)");
  const [tiposCertificacionesOptions, setTiposCertificacionesOptions] = useState([]);
  const [imagenPortal, setImagenPortal] = useState("Si");
  const [presentacion, setPresentacion] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [ejesTematicos, setEjesTematicos] = useState("");
  const [requisitosAprobacion, setRequisitosAprobacion] = useState("");
  const [curso, setCurso] = useState("");
  const [cursosOptions, setCursosOptions] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const perfilesData = await getPerfiles();
        setPerfiles(perfilesData);

        const areasTematicasData = await getAreasTematicas();
        setAreasTematicasOptions(areasTematicasData);

        const tiposCertificacionesData = await getTiposCertificaciones();
        setTiposCertificacionesOptions(tiposCertificacionesData);

        const cursosData = await getCursos();
        setCursosOptions(cursosData.filter(curso => curso.estado == 'CON'));

        if (selectCurso) {
          const cursoSeleccionado = cursosData.find((curso) => curso.nombre === selectCurso);
          if (cursoSeleccionado) {
            setCurso(cursoSeleccionado.nombre);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [selectCurso]);

  const handleEnviarFormulario = async () => {
    setCargando(true);

    try {
      const cursoSeleccionado = cursosOptions.find((c) => c.nombre === curso);
      const perfilesSeleccionado = perfiles.find((p) => p.descripcion === perfil);
      const areaTematicaSeleccionado = areasTematicasOptions.find((a) => a.descripcion === areaTematica);
      const tiposCertificacionSeleccionado = tiposCertificacionesOptions.find((t) => t.descripcion === tipoCertificacion);

      const formData = {
        curso: cursoSeleccionado ? cursoSeleccionado.cod : null,
        perfil: perfilesSeleccionado ? perfilesSeleccionado.cod : null,
        area_tematica: areaTematicaSeleccionado ? areaTematicaSeleccionado.cod : null,
        tipo_certificacion: tiposCertificacionSeleccionado ? tiposCertificacionSeleccionado.cod : null,
        presentacion,
        objetivos,
        requisitos_aprobacion: requisitosAprobacion,
        ejes_tematicos: ejesTematicos,
        certifica_en_cc: certificaCordoba === "Si" ? 1 : 0,
        disenio_a_cargo_cc: imagenPortal === "Si" ? 1 : 0,
      };

      await postEvento(formData);

      if (cursoSeleccionado && typeof onEventoCreado === 'function') {
        onEventoCreado(cursoSeleccionado.cod);
      }

      setSuccess(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      typeof setNuevoEvento === 'function' && setNuevoEvento(false);
      typeof setOpenAlertDialog === 'function' && setOpenAlertDialog(true);
      typeof setTituloAlerta === 'function' && setTituloAlerta("Evento creado exitosamente");
      typeof setMensajeAlerta === 'function' && setMensajeAlerta("El evento se ha creado exitosamente. Ahora puedes continuar cargando las nuevas cohortes.");

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
      setCargando(false);
    }
  };

  const tooltipProps = {
    componentsProps: {
      tooltip: {
        sx: {
          backgroundColor: theme.palette.grey[800],
          color: theme.palette.common.white,
          fontSize: '16px',
          maxWidth: '400px',
          padding: '12px',
          borderRadius: '8px',
        },
      },
    },
  };

  const inputStyles = {
    '& .MuiInputBase-input': { fontSize: '16px' },
    '& .MuiInputLabel-root': { fontSize: '16px' }
  };

  return (
    <>
      {error && (
        <Alert sx={{ '& .MuiAlert-message': { fontSize: '16px' } }} variant="filled" severity="error">
          {error}
        </Alert>
      )}
      {success && (
        <Alert sx={{ '& .MuiAlert-message': { fontSize: '16px' } }} variant="filled" severity="success">
          Nuevo evento cargado con éxito
        </Alert>
      )}
      {cargando && (
        <Backdrop
          sx={{ color: theme.palette.primary.main, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={cargando}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 5 } }}>
        <Box sx={{ mb: 2 }}>
          <Titulo texto="Crear Evento" />
        </Box>
        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'common.black' }} />
        <Box component="form" noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* --- Row 1: Perfil, Area Temática, Certifica Córdoba --- */}
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Seleccione perfil"}
                options={perfiles.map((perfil) => perfil.descripcion)}
                value={perfil}
                getValue={(value) => setPerfil(value || "")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Seleccione area temática"}
                options={areasTematicasOptions.map((area) => area.descripcion)}
                value={areaTematica}
                getValue={(value) => setAreaTematica(value || "")}
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
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Tipo de certificación"}
                options={tiposCertificacionesOptions.map((tipo) => tipo.descripcion)}
                value={tipoCertificacion}
                getValue={(value) => setTipoCertificacion(value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Diseño de imagen en portal a cargo de repartición"}
                options={["Si", "No"]}
                value={imagenPortal}
                getValue={(value) => setImagenPortal(value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                label={"Curso"}
                options={cursosOptions.map((curso) => curso.nombre)}
                value={curso}
                getValue={(value) => setCurso(value)}
              />
            </Grid>
            {/* --- Row 3: Presentación/Fundamentación --- */}
            <Grid item xs={12}>
              <Tooltip
                title="Explica, de manera breve, cuál o cuáles son las razones por las que se desarrolla e implementa el evento de capacitación. Puede estar fundada en un marco teórico en el cual se basan los contenidos del curso, en un programa de gobierno y/o en una necesidad coyuntural."
                placement="top"
                {...tooltipProps}
              >
                <CustomInput
                  id="outlined-multiline-static-1"
                  label="Presentación/Fundamentación"
                  multiline
                  rows={4}
                  fullWidth
                  value={presentacion}
                  onChange={(event) => setPresentacion(event.target.value)}
                  sx={inputStyles}
                />
              </Tooltip>
            </Grid>
            {/* --- Row 4: Objetivos --- */}
            <Grid item xs={12}>
              <Tooltip
                title="Es lo que se espera que los participantes al evento de capacitación aprendan o incorporen a sus saberes previos. Puede ser un objetivo general y dos o tres objetivos particulares o sólo una de las opciones."
                placement="top"
                {...tooltipProps}
              >
                <CustomInput
                  id="outlined-multiline-static-2"
                  label="Objetivos"
                  multiline
                  rows={4}
                  fullWidth
                  value={objetivos}
                  onChange={(event) => setObjetivos(event.target.value)}
                  sx={inputStyles}
                />
              </Tooltip>
            </Grid>
            {/* --- Row 5: Ejes Temáticos / Temarios --- */}
            <Grid item xs={12}>
              <Tooltip
                title="Contenidos teóricos separado por módulos."
                placement="top"
                {...tooltipProps}
              >
                <CustomInput
                  id="outlined-multiline-static-3"
                  label="Ejes temáticos / temarios"
                  multiline
                  rows={4}
                  fullWidth
                  value={ejesTematicos}
                  onChange={(event) => setEjesTematicos(event.target.value)}
                  sx={inputStyles}
                />
              </Tooltip>
            </Grid>
            {/* --- Row 6: Requisitos de Aprobación --- */}
            <Grid item xs={12}>
              <Tooltip
                title="Especificar cuales serán los requisitos que deben cumplir los alumnos para aprobar (asistencia, calificaciones, presentación de actividades, etc.)"
                placement="top"
                {...tooltipProps}
              >
                <CustomInput
                  id="outlined-multiline-static-4"
                  label="Requisitos de aprobación"
                  multiline
                  rows={4}
                  fullWidth
                  value={requisitosAprobacion}
                  onChange={(event) => setRequisitosAprobacion(event.target.value)}
                  sx={inputStyles}
                />
              </Tooltip>
            </Grid>
            {/* --- Row 7: Submit Button --- */}
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
            >
              <MuiButton
                variant="contained"
                color="primary"
                onClick={handleEnviarFormulario}
                sx={{
                  ml: 'auto',
                  borderRadius: '8px',
                  px: 4,
                  py: 1,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: 'fit-content'
                }}
              >
                REGISTRAR
              </MuiButton>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default NuevoEventoForm;