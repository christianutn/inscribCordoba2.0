import Titulo from './fonts/TituloPrincipal';
import Autocomplete from './UIElements/Autocomplete';
import TextField from './UIElements/TextField';
import { useState, useEffect } from 'react';
import Button from "./UIElements/Button";
import { getMinisterios } from "../services/ministerios.service.js";
import { getMediosInscripcion } from "../services/mediosInscripcion.service.js";
import { getPlataformasDictado } from "../services/plataformasDictado.service.js";
import { getTiposCapacitacion } from "../services/tiposCapacitacion.service.js";
import { getMyUser } from "../services/usuarios.service.js";
import Alert from '@mui/material/Alert';
import Cohortes from "./Cohortes.jsx";
import validarFecha from '../services/validarFechas.js';
import { postInstancias } from "../services/instancias.service.js";
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
import { Autocomplete as MuiAutocomplete, TextField as MuiTextField, MenuItem, Card, Avatar, Typography, Box, Container } from '@mui/material';
import { getHistoricoTutoresVigentesPorCurso } from "../services/historicoTutoresEnCurso.service.js";

export default function Formulario() {

  const navigate = useNavigate();

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

  const [opciones, setOpciones] = useState({
    autogestionado: false,
    edad: false,
    departamento: false,
    publicaPCC: false,
    correlatividad: false
  });

  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [tituloAlerta, setTituloAlerta] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const [resetCohortesKey, setResetCohortesKey] = useState(0);
  const [nuevoEvento, setNuevoEvento] = useState(false);

  const manejarCambioOpciones = (nuevaOpciones) => {
    setOpciones(nuevaOpciones);
    if (!nuevaOpciones.edad) { setEdadDesde(16); setEdadHasta("Sin Restricción"); }
    if (!nuevaOpciones.departamento) { setDepartamentosSeleccionados([]); }
    if (!nuevaOpciones.correlatividad) { setCursosCorrelativosSeleccionados([]); }
  };

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
    setCursosCorrelativosSeleccionados([]); setRowSelectionModel([]); setTutores([]);
    setOpciones({ autogestionado: false, edad: false, departamento: false, publicaPCC: false, correlatividad: false });
    setAreas([]); setCursos([]);
    setResetCohortesKey(prevKey => prevKey + 1);

  };

  const tiene_el_curso_evento_creado = (codCurso) => {
    const curso = cursos.find((curso) => curso.cod === codCurso);
    return curso ? Boolean(curso.tiene_evento_creado) : false;
  };

  const handleEventoCreado = (codCurso) => {
    // Actualizar el estado de los cursos para reflejar que el curso ahora tiene un evento creado
    setCursos(prevCursos => prevCursos.map(curso =>
      curso.cod === codCurso ? { ...curso, tiene_evento_creado: 1 } : curso
    ));
    setNuevoEvento(false);
    // Opcional: Cerrar la alerta si se desea, o dejarla para que el usuario vea el éxito
    // setOpenAlertDialog(false); 
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

      if (!tiene_el_curso_evento_creado(codCurso)) {
        setTituloAlerta("El curso no tiene un evento creado");
        setMensajeAlerta(`Notamos que no completó el formulario de nuevo evento para el curso de '${selectCurso}'. Por favor, complete primero este formulario.`);
        setOpenAlertDialog(true);
        setNuevoEvento(true);
        throw new Error("El curso no tiene un evento creado.");
      }

      // CAMBIO AQUÍ: RESTAURAMOS LA LÓGICA DE CONSTRUCCIÓN DE DATOS
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

      await postInstancias(datosParaEnviar); // Enviamos el objeto construido correctamente

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

  return (
    <>
      {error && <Alert className='alert' variant="filled" severity="error">{error}</Alert>}
      {success && <Alert className='alert' variant="filled" severity="success">Formulario enviado exitosamente</Alert>}
      {cargando && <Backdrop sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={cargando}><CircularProgress color="inherit" /></Backdrop>}

      {nuevoEvento ? <NuevoEvento setNuevoEvento={setNuevoEvento} setOpenAlertDialog={setOpenAlertDialog} setTituloAlerta={setTituloAlerta} setMensajeAlerta={setMensajeAlerta} selectCurso={selectCurso} onEventoCreado={handleEventoCreado} /> :
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Titulo texto='Crear Cohorte' />
          <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />
          <form id="form-crear-instancia"> {/* Añadido el ID para consistencia */}
            <div className='grid-container-formulario'>
              {/* <div className='titulo'><Titulo texto='Crear Cohorte' /></div> */}
              {/* <div className='divider'><Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} /></div> */}
              <div className='info-curso'>
                <div className='select-ministerio'><Autocomplete options={ministerios.filter(m => m.esVigente === 1).map(m => m.nombre)} label={"Seleccione un ministerio"} value={selectMinisterio} getValue={(value) => { setSelectMinisterio(value); setSelectArea(""); setSelectCurso(""); const ministerioSeleccionado = ministerios.find(m => m.nombre === value); if (ministerioSeleccionado) { setAreas(ministerioSeleccionado.detalle_areas); setCursos([]); } else { setAreas([]); setCursos([]); } }} /></div>
                <div className='select-area'><Autocomplete options={areas.filter(a => a.esVigente === 1).map(a => a.nombre)} label={"Seleccione un área"} value={selectArea} getValue={(value) => { setSelectArea(value); setSelectCurso(""); const areaSeleccionada = areas.find(a => a.nombre === value); if (areaSeleccionada) { setCursos(areaSeleccionada.detalle_cursos); } else { setCursos([]); } }} /></div>
                <div className='select-curso'><Autocomplete options={cursos.filter(c => c.esVigente === 1 && c.esta_autorizado === 1).map(c => c.nombre)} label={"Seleccione un curso"} value={selectCurso} getValue={async (value) => { setSelectCurso(value); const codCurso = cursos.find(c => c.nombre === value)?.cod; if (codCurso) { try { const tutoresData = await getHistoricoTutoresVigentesPorCurso(codCurso); setTutores(tutoresData); } catch (e) { console.error(e); setTutores([]); } if (!tiene_el_curso_evento_creado(codCurso)) { setTituloAlerta("El curso no tiene un evento creado"); setMensajeAlerta(`Notamos que no completó el formulario de nuevo evento para el curso de '${value}'. Por favor, complete este formulario.`); setOpenAlertDialog(true); setNuevoEvento(true); } } else { setTutores([]); } }} /></div>
                <div className='select-medio-inscripcion'><Autocomplete options={mediosInscripcion.filter(m => m.esVigente === 1).map(m => m.nombre)} label={"Seleccione medio de inscripción"} value={selectMedioInscripcion} getValue={(value) => setSelectMedioInscripcion(value)} /></div>
                <div className='select-plataforma-dictado'><Autocomplete options={plataformasDictado.filter(p => p.esVigente === 1).map(p => p.nombre)} label={"Seleccione plataforma de dictado"} value={selectPlataformaDictado} getValue={(value) => setSelectPlataformaDictado(value)} /></div>
                <div className='select-tipo-capacitacion'><Autocomplete options={tiposCapacitaciones.filter(t => t.esVigente === 1).map(t => t.nombre)} label={"Seleccione tipo de capacitación"} value={selectTipoCapacitacion} getValue={(value) => setSelectTipoCapacitacion(value)} /></div>
                <div className='input'>
                  <TextField label={"Cupo"} getValue={(value) => setCupo(value)} value={cupo} />
                  <TextField label={"Cantidad de horas"} getValue={(value) => setHoras(value)} value={horas} />
                </div>
              </div>
              <div className='opciones-evento'><OpcionesEvento opciones={opciones} onOpcionesChange={manejarCambioOpciones} /></div>
              <div className='restricciones'>
                {opciones.edad && (<div className='restriccion-edad'><TextField label="Edad desde" type="number" value={edadDesde} getValue={(value) => { if (value >= 16) setEdadDesde(value); }} /><MuiTextField select label="Edad hasta" value={edadHasta} onChange={(e) => { const value = e.target.value; if (value === "Sin Restricción" || value >= edadDesde) setEdadHasta(value); }} fullWidth><MenuItem value="Sin Restricción">Sin Restricción</MenuItem>{Array.from({ length: 83 }, (_, i) => i + 18).map((edad) => (<MenuItem key={edad} value={edad} disabled={edad < edadDesde}>{edad}</MenuItem>))}</MuiTextField></div>)}
                {opciones.departamento && (<div className='restriccion-departamento'><MuiAutocomplete multiple options={departamentos} getOptionLabel={(option) => option.nombre} value={departamentosSeleccionados} onChange={(event, newValue) => setDepartamentosSeleccionados(newValue)} renderInput={(params) => (<MuiTextField {...params} variant="standard" label="Seleccione departamentos" placeholder="Departamentos" />)} /></div>)}
                {opciones.correlatividad && (<div className='restriccion-correlatividad'><MuiAutocomplete multiple options={cursos} getOptionLabel={(option) => option.nombre} value={cursosCorrelativosSeleccionados} onChange={(event, newValue) => setCursosCorrelativosSeleccionados(newValue)} renderInput={(params) => (<MuiTextField {...params} variant="standard" label="Seleccione cursos correlativos" placeholder="Cursos" />)} /></div>)}
              </div>
              <div className='tutores'>
                <SubtituloPrincipal texto='Tutores' />
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                  {/* Profesores con permiso de edición */}
                  {tutores.some(t => t.rol_tutor_cod === 'CPE') && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#004582' }}>
                        Profesores con permiso de edición
                      </Typography>
                      {tutores.filter(t => t.rol_tutor_cod === 'CPE').map((tutor) => (
                        <Card key={tutor.id} sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 1, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                          <Avatar sx={{ bgcolor: '#009ada', mr: 2 }}>
                            {tutor.detalle_persona.nombre.charAt(0)}{tutor.detalle_persona.apellido.charAt(0)}
                          </Avatar>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1">
                              {tutor.detalle_persona.nombre} {tutor.detalle_persona.apellido}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {tutor.detalle_rol_tutor.nombre}
                            </Typography>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  )}

                  {/* Profesores sin permiso de edición */}
                  {tutores.some(t => t.rol_tutor_cod === 'SPE') && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#004582' }}>
                        Profesores sin permiso de edición
                      </Typography>
                      {tutores.filter(t => t.rol_tutor_cod === 'SPE').map((tutor) => (
                        <Card key={tutor.id} sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 1, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                          <Avatar sx={{ bgcolor: '#899dac', mr: 2 }}>
                            {tutor.detalle_persona.nombre.charAt(0)}{tutor.detalle_persona.apellido.charAt(0)}
                          </Avatar>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1">
                              {tutor.detalle_persona.nombre} {tutor.detalle_persona.apellido}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {tutor.detalle_rol_tutor.nombre}
                            </Typography>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  )}
                </div>
              </div>
              <div className='cohortes'>
                <Cohortes getCohortes={handleCohortes} key={resetCohortesKey} />
              </div>
              <div className='submit'>
                <Button mensaje={"Registrar"} type="button" hanldeOnClick={handleEnviarFormulario} />
              </div>
            </div>
          </form>
        </Container>
      }
      {<Alerta openAlertDialog={openAlertDialog} setOpenAlertDialog={setOpenAlertDialog} titulo={tituloAlerta} mensaje={mensajeAlerta} />}
    </>
  );
}