import Titulo from './fonts/TituloPrincipal';
import Autocomplete from './UIElements/Autocomplete';
import TextField from './UIElements/TextField';
import { useState, useEffect } from 'react';
import { getMinisterios } from "../services/ministerios.service.js";
import { getMediosInscripcion } from "../services/mediosInscripcion.service.js";
import { getPlataformasDictado } from "../services/plataformasDictado.service.js";
import { getTiposCapacitacion } from "../services/tiposCapacitacion.service.js";
import { getMyUser } from "../services/usuarios.service.js";
import Alert from '@mui/material/Alert';
import Cohortes from "./Cohortes.jsx";
import validarFecha from '../services/validarFechas.js';
import { postInstancias, getInstanciasByCurso } from "../services/instancias.service.js";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import SubtituloPrincipal from './fonts/SubtituloPrincipal.jsx';
import { validarOrdenFechas } from "../services/validarOrdenFechas.js";
import { useNavigate } from 'react-router-dom';
import OpcionesEvento from './OpcionesEvento.jsx';
import NuevoEvento from './NuevoEvento.jsx';
import Alerta from "./UIElements/Dialog.jsx";
import { getDepartamentos } from "../services/departamentos.service.js";
import { Autocomplete as MuiAutocomplete, TextField as MuiTextField, MenuItem, Card, Avatar, Typography, Box, Container, Button as MuiButton, Stack, Grid } from '@mui/material';
import { getHistoricoTutoresVigentesPorCurso } from "../services/historicoTutoresEnCurso.service.js";
import { useTheme } from '@mui/material/styles';

const TutorCard = ({ tutor, bgColor }) => {
  const theme = useTheme();
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 1, boxShadow: 'none', border: '1px solid', borderColor: theme.palette.grey[300] }}>
      <Avatar sx={{ bgcolor: bgColor, mr: 2, color: theme.palette.common.white }}>
        {tutor.detalle_persona.nombre.charAt(0)}{tutor.detalle_persona.apellido.charAt(0)}
      </Avatar>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1" sx={{ fontSize: '16px' }}>
          {tutor.detalle_persona.nombre} {tutor.detalle_persona.apellido}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {tutor.detalle_rol_tutor.nombre}
        </Typography>
      </Box>
    </Card>
  );
};

export default function Formulario() {

  const navigate = useNavigate();
  const theme = useTheme();

  const [ministerios, setMinisterios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [mediosInscripcion, setMediosInscripciones] = useState([]);
  const [plataformasDictado, setPlataformasDictado] = useState([]);
  const [tiposCapacitaciones, setTiposCapacitaciones] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [selectMinisterio, setSelectMinisterio] = useState("");
  const [selectArea, setSelectArea] = useState("");
  const [selectCurso, setSelectCurso] = useState("");
  const [selectMedioInscripcion, setSelectMedioInscripcion] = useState("");
  const [selectPlataformaDictado, setSelectPlataformaDictado] = useState("");
  const [selectTipoCapacitacion, setSelectTipoCapacitacion] = useState("");
  const [cupo, setCupo] = useState("");
  const [horas, setHoras] = useState("");
  const [cohortes, setCohortes] = useState([]);
  const [edadDesde, setEdadDesde] = useState(16);
  const [edadHasta, setEdadHasta] = useState("Sin Restricción");
  const [departamentosSeleccionados, setDepartamentosSeleccionados] = useState([]);
  const [cursosCorrelativosSeleccionados, setCursosCorrelativosSeleccionados] = useState([]);

  const [instanciasExistentes, setInstanciasExistentes] = useState([]);

  const [opciones, setOpciones] = useState({
    autogestionado: false,
    edad: false,
    departamento: false,
    publicaPCC: false,
    correlatividad: false
  });

  const [esCampusCordoba, setEsCampusCordoba] = useState(false);

  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [tituloAlerta, setTituloAlerta] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  const [resetCohortesKey, setResetCohortesKey] = useState(0);
  const [nuevoEvento, setNuevoEvento] = useState(false);

  const manejarCambioOpciones = (nuevaOpciones) => {
    setOpciones(nuevaOpciones);
    if (!nuevaOpciones.edad) { setEdadDesde(16); setEdadHasta("Sin Restricción"); }
    if (!nuevaOpciones.departamento) { setDepartamentosSeleccionados([]); }
    if (!nuevaOpciones.correlatividad) { setCursosCorrelativosSeleccionados([]); }
  };

  useEffect(() => {
    const cursoObj = cursos.find(c => c.nombre === selectCurso);
    const plataformaObj = plataformasDictado.find(p => p.nombre === selectPlataformaDictado);
    const esCC = (cursoObj?.cod?.startsWith('C-')) || (plataformaObj?.cod === 'CC');
    setEsCampusCordoba(esCC);
  }, [selectCurso, selectPlataformaDictado, cursos, plataformasDictado]);

  useEffect(() => {
    (async () => {
      try {
        const user = await getMyUser(); if (!user.cuil) { navigate("/login"); return; }
        if (nuevoEvento) return;
        const listaMinisterios = await getMinisterios(); setMinisterios(listaMinisterios);
        const listaMediosInscripciones = await getMediosInscripcion(); setMediosInscripciones(listaMediosInscripciones);
        const listaPlataformasDictados = await getPlataformasDictado(); setPlataformasDictado(listaPlataformasDictados);
        const listaTiposCapacitacion = await getTiposCapacitacion(); setTiposCapacitaciones(listaTiposCapacitacion);
        const listaDepartamentos = await getDepartamentos(); setDepartamentos(listaDepartamentos);
      } catch (error) { setError(error.message || "Error al cargar los datos"); }
    })();
  }, [nuevoEvento, navigate]);

  const limpiarFormularioCompleto = () => {
    setSelectMinisterio(""); setSelectArea(""); setSelectCurso(""); setSelectMedioInscripcion("");
    setSelectPlataformaDictado(""); setSelectTipoCapacitacion(""); setCupo(""); setHoras("");
    setCohortes([]); setEdadDesde(16); setEdadHasta("Sin Restricción"); setDepartamentosSeleccionados([]);
    setCursosCorrelativosSeleccionados([]); setTutores([]); setInstanciasExistentes([]);
    setOpciones({ autogestionado: false, edad: false, departamento: false, publicaPCC: false, correlatividad: false });
    setAreas([]); setCursos([]);
    setResetCohortesKey(prevKey => prevKey + 1);

  };



  const handleEventoCreado = (codCurso) => {
    setCursos(prevCursos => prevCursos.map(curso =>
      curso.cod === codCurso ? { ...curso, tiene_evento_creado: 1 } : curso
    ));
    setNuevoEvento(false);
  };

  const handleCohortes = (cohortes) => { setCohortes(cohortes); };

  const handleEnviarFormulario = async () => {
    setCargando(true);
    try {
      if (!selectMinisterio) throw new Error("Debe seleccionar un ministerio");
      if (!selectArea) throw new Error("Debe seleccionar un área");
      if (!selectCurso) throw new Error("Debe seleccionar un curso");
      if (!selectTipoCapacitacion) throw new Error("Debe seleccionar un tipo de capacitación");
      if (!selectPlataformaDictado) throw new Error("Debe seleccionar una plataforma de dictado");
      if (!selectMedioInscripcion) throw new Error("Debe seleccionar un medio de inscripción");
      if (!cupo || cupo <= 0) throw new Error("Debe ingresar un cupo válido");
      if (!horas || horas <= 0) throw new Error("Debe ingresar una cantidad de horas válida");
      if (cohortes.length === 0) throw new Error("Debe agregar al menos una cohorte");

      cohortes.forEach((cohorte) => {
        if (!validarFecha(cohorte.fechaInscripcionDesde) || !validarFecha(cohorte.fechaInscripcionHasta) || !validarFecha(cohorte.fechaCursadaDesde) || !validarFecha(cohorte.fechaCursadaHasta)) {
          throw new Error("Todos los campos de fecha de las cohortes deben estar completos");
        }
        validarOrdenFechas([cohorte.fechaInscripcionDesde, cohorte.fechaInscripcionHasta, cohorte.fechaCursadaDesde, cohorte.fechaCursadaHasta], opciones.autogestionado);
      });

      const codCurso = cursos.find((curso) => curso.nombre === selectCurso)?.cod;
      if (!codCurso) throw new Error("El curso seleccionado no es válido");


      const datosParaEnviar = {
        curso: codCurso,
        tipo_capacitacion: tiposCapacitaciones.find(tipo => tipo.nombre === selectTipoCapacitacion)?.cod,
        plataforma_dictado: plataformasDictado.find(plataforma => plataforma.nombre === selectPlataformaDictado)?.cod,
        medio_inscripcion: mediosInscripcion.find(medio => medio.nombre === selectMedioInscripcion)?.cod,
        cupo: parseInt(cupo),
        cantidad_horas: parseInt(horas),
        tutores: tutores,
        cohortes: cohortes,
        es_autogestionado: opciones.autogestionado ? 1 : 0,
        es_publicada_portal_cc: opciones.publicaPCC ? 1 : 0,
        restriccion_edad_desde: opciones.edad ? parseInt(edadDesde) : 16,
        restriccion_edad_hasta: opciones.edad && edadHasta !== "Sin Restricción" ? parseInt(edadHasta) : 0,
        departamentos: opciones.departamento ? departamentosSeleccionados.map(d => d.id) : [],
        cursos_correlativos: opciones.correlatividad ? cursosCorrelativosSeleccionados.map(c => c.cod) : []
      };

      await postInstancias(datosParaEnviar);

      limpiarFormularioCompleto();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setError(null);
      setSuccess(true);

    } catch (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccess(false);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const inputStyles = {
    '& .MuiInputBase-input': { fontSize: '16px' },
    '& .MuiInputLabel-root': { fontSize: '16px' }
  };

  return (
    <>
      {error && <Alert sx={{ '& .MuiAlert-message': { fontSize: '16px' } }} variant="filled" severity="error">{error}</Alert>}
      {success && <Alert sx={{ '& .MuiAlert-message': { fontSize: '16px' } }} variant="filled" severity="success">Formulario enviado exitosamente</Alert>}
      {cargando && <Backdrop sx={{ color: theme.palette.primary.main, zIndex: (theme) => theme.zIndex.drawer + 1 }} open={cargando}><CircularProgress color="inherit" /></Backdrop>}

      {nuevoEvento ? <NuevoEvento setNuevoEvento={setNuevoEvento} setOpenAlertDialog={setOpenAlertDialog} setTituloAlerta={setTituloAlerta} setMensajeAlerta={setMensajeAlerta} selectCurso={selectCurso} onEventoCreado={handleEventoCreado} /> :
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 5 } }}>
          <Box sx={{ mb: 2 }}>
            <Titulo texto='Crear Cohorte' />
          </Box>
          <Divider sx={{ marginBottom: 3, borderBottomWidth: 2, borderColor: 'common.black' }} />
          <Box component="form" id="form-crear-instancia" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Info Curso */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete options={ministerios.filter(m => m.esVigente === 1).map(m => m.nombre)} label={"Seleccione un ministerio"} value={selectMinisterio} getValue={(value) => { setSelectMinisterio(value); setSelectArea(""); setSelectCurso(""); const ministerioSeleccionado = ministerios.find(m => m.nombre === value); if (ministerioSeleccionado) { setAreas(ministerioSeleccionado.detalle_areas); setCursos([]); } else { setAreas([]); setCursos([]); } }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete options={areas.filter(a => a.esVigente === 1).map(a => a.nombre)} label={"Seleccione un área"} value={selectArea} getValue={(value) => { setSelectArea(value); setSelectCurso(""); const areaSeleccionada = areas.find(a => a.nombre === value); if (areaSeleccionada) { setCursos(areaSeleccionada.detalle_cursos); } else { setCursos([]); } }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete options={cursos.filter(c => ['PVICT', 'EC'].includes(c.estado)).map(c => c.nombre)} label={"Seleccione un curso"} value={selectCurso} getValue={async (value) => {
                  setSelectCurso(value);
                  const codCurso = cursos.find(c => c.nombre === value)?.cod;
                  if (codCurso) {
                    try {
                      const tutoresData = await getHistoricoTutoresVigentesPorCurso(codCurso);
                      setTutores(tutoresData);
                      const instanciasData = await getInstanciasByCurso(codCurso);
                      setInstanciasExistentes(instanciasData.filter(i => i.estado_instancia !== 'CANC'));
                    } catch (e) {
                      console.error(e);
                      setTutores([]);
                      setInstanciasExistentes([]);
                    }
                  } else {
                    setTutores([]);
                    setInstanciasExistentes([]);
                  }
                }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete options={mediosInscripcion.filter(m => m.esVigente === 1).map(m => m.nombre)} label={"Seleccione medio de inscripción"} value={selectMedioInscripcion} getValue={(value) => setSelectMedioInscripcion(value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete options={plataformasDictado.filter(p => p.esVigente === 1).map(p => p.nombre)} label={"Seleccione plataforma de dictado"} value={selectPlataformaDictado} getValue={(value) => setSelectPlataformaDictado(value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete options={tiposCapacitaciones.filter(t => t.esVigente === 1).map(t => t.nombre)} label={"Seleccione tipo de capacitación"} value={selectTipoCapacitacion} getValue={(value) => setSelectTipoCapacitacion(value)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label={"Cupo"} getValue={(value) => setCupo(value)} value={cupo} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  label={"Cantidad de horas"}
                  getValue={(value) => setHoras(value)}
                  value={horas}
                />
              </Grid>
            </Grid>

            {/* Opciones Evento */}
            <Box>
              <OpcionesEvento opciones={opciones} onOpcionesChange={manejarCambioOpciones} />
            </Box>

            {/* Restricciones */}
            <Stack spacing={2}>
              {opciones.edad && (
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <TextField label="Edad desde" type="number" value={edadDesde} getValue={(value) => { if (value >= 16) setEdadDesde(value); }} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <MuiTextField select label="Edad hasta" value={edadHasta} onChange={(e) => { const value = e.target.value; if (value === "Sin Restricción" || value >= edadDesde) setEdadHasta(value); }} fullWidth sx={inputStyles}>
                      <MenuItem value="Sin Restricción" sx={{ fontSize: '16px' }}>Sin Restricción</MenuItem>
                      {Array.from({ length: 83 }, (_, i) => i + 18).map((edad) => (<MenuItem key={edad} value={edad} disabled={edad < edadDesde} sx={{ fontSize: '16px' }}>{edad}</MenuItem>))}
                    </MuiTextField>
                  </Grid>
                </Grid>
              )}
              {opciones.departamento && (
                <Box>
                  <MuiAutocomplete multiple options={departamentos} getOptionLabel={(option) => option.nombre} value={departamentosSeleccionados} onChange={(event, newValue) => setDepartamentosSeleccionados(newValue)} renderInput={(params) => (<MuiTextField {...params} variant="standard" label="Seleccione departamentos" placeholder="Departamentos" sx={inputStyles} />)} />
                </Box>
              )}
              {opciones.correlatividad && (
                <Box>
                  <MuiAutocomplete multiple options={cursos} getOptionLabel={(option) => option.nombre} value={cursosCorrelativosSeleccionados} onChange={(event, newValue) => setCursosCorrelativosSeleccionados(newValue)} renderInput={(params) => (<MuiTextField {...params} variant="standard" label="Seleccione cursos correlativos" placeholder="Cursos" sx={inputStyles} />)} />
                </Box>
              )}
            </Stack>

            {/* Tutores */}
            <Box>
              <SubtituloPrincipal texto='Tutores' />
              <Stack spacing={3} mt={2}>
                {/* Profesores con permiso de edición */}
                {tutores.some(t => t.rol_tutor_cod === 'CPE') && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main, fontSize: '16px' }}>
                      Profesores con permiso de edición
                    </Typography>
                    {tutores.filter(t => t.rol_tutor_cod === 'CPE').map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} bgColor={theme.palette.primary.main} />
                    ))}
                  </Box>
                )}

                {/* Profesores sin permiso de edición */}
                {tutores.some(t => t.rol_tutor_cod === 'SPE') && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main, fontSize: '16px' }}>
                      Profesores sin permiso de edición
                    </Typography>
                    {tutores.filter(t => t.rol_tutor_cod === 'SPE').map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} bgColor={theme.palette.secondary.main} />
                    ))}
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Cohortes */}
            <Box>
              <Cohortes getCohortes={handleCohortes} key={resetCohortesKey} esCampusCordoba={esCampusCordoba} instanciasExistentes={instanciasExistentes} />
            </Box>

            {/* Submit */}
            <Box sx={{ display: 'flex', mt: 3 }}>
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
            </Box>
          </Box>
        </Container>
      }
      {<Alerta openAlertDialog={openAlertDialog} setOpenAlertDialog={setOpenAlertDialog} titulo={tituloAlerta} mensaje={mensajeAlerta} />}
    </>
  );
}