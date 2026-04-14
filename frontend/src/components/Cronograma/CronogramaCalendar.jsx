import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Stack
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventNoteIcon from '@mui/icons-material/EventNote';

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

// Tipos de marcas de fecha
const DATE_TYPES = {
  INSCRIPTION: 'inscription', // Fecha inicio de inscripción
  COURSE: 'course',           // Fecha inicio del curso
  BOTH: 'both'                // Ambas en el mismo día
};

const CronogramaCalendar = ({ 
  filteredData = [], 
  parseDate,
  yearFilter,
  monthFilter,
  setYearFilter,
  setMonthFilter
}) => {
  // Por defecto, trae el mes y día actual
  const [currentDate, setCurrentDate] = useState(() => dayjs());
  const [selectedDate, setSelectedDate] = useState(() => dayjs());

  // Sincronizar currentDate con yearFilter y monthFilter SOLO cuando cambien desde el padre
  useEffect(() => {
    // Si se limpian los filtros (monthFilter vuelve a "all"), volver a mes/día actual
    if (monthFilter === "all") {
      setCurrentDate(dayjs());
      setSelectedDate(dayjs());
    } else {
      // Si el usuario seleccionó un mes específico en los filtros, moverse a ese mes
      const month = parseInt(monthFilter, 10);
      setCurrentDate(dayjs(`${yearFilter}-${String(month + 1).padStart(2, '0')}-01`));
      setSelectedDate(null); // Resetear selección cuando cambia el filtro
    }
  }, [yearFilter, monthFilter]);

  // Actualizar yearFilter y monthFilter cuando el usuario navega el calendario
  const handlePrevMonth = () => {
    const newDate = currentDate.subtract(1, 'month');
    setCurrentDate(newDate);
    setYearFilter(newDate.year());
    setMonthFilter(newDate.month().toString());
  };

  const handleNextMonth = () => {
    const newDate = currentDate.add(1, 'month');
    setCurrentDate(newDate);
    setYearFilter(newDate.year());
    setMonthFilter(newDate.month().toString());
  };

  // Procesa los datos para extraer fechas y sus tipos
  const dateMap = useMemo(() => {
    const map = new Map();

    filteredData.forEach(item => {
      const inscriptionDate = parseDate(item["Fecha inicio de inscripción"]);
      const courseDate = parseDate(item["Fecha inicio del curso"]);

      // Marcar fecha de inscripción
      if (inscriptionDate && inscriptionDate.isValid()) {
        const key = inscriptionDate.format('YYYY-MM-DD');
        const current = map.get(key) || { types: new Set(), cursos: [] };
        current.types.add(DATE_TYPES.INSCRIPTION);
        current.cursos.push(item);
        map.set(key, current);
      }

      // Marcar fecha de inicio del curso
      if (courseDate && courseDate.isValid()) {
        const key = courseDate.format('YYYY-MM-DD');
        const current = map.get(key) || { types: new Set(), cursos: [] };
        current.types.add(DATE_TYPES.COURSE);
        current.cursos.push(item);
        map.set(key, current);
      }
    });

    // Convertir a BOTH cuando está en ambas categorías
    map.forEach((value) => {
      if (value.types.has(DATE_TYPES.INSCRIPTION) && value.types.has(DATE_TYPES.COURSE)) {
        value.types.delete(DATE_TYPES.INSCRIPTION);
        value.types.delete(DATE_TYPES.COURSE);
        value.types.add(DATE_TYPES.BOTH);
      }
    });

    return map;
  }, [filteredData, parseDate]);

  // Obtiene los cursos para un día específico
  const getCoursesForDate = useCallback((date) => {
    const key = date.format('YYYY-MM-DD');
    const entry = dateMap.get(key);
    if (!entry) return [];

    // Deduplicar cursos por nombre y fecha
    const seen = new Set();
    return entry.cursos.filter(curso => {
      const id = `${curso["Nombre del curso"]}-${curso["Código del curso"]}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [dateMap]);

  // Obtiene el tipo de marca para un día
  const getDateType = useCallback((date) => {
    const key = date.format('YYYY-MM-DD');
    const entry = dateMap.get(key);
    if (!entry || entry.types.size === 0) return null;
    return Array.from(entry.types)[0];
  }, [dateMap]);

  // Obtiene el tipo de cada curso dentro del día
  const getCourseType = useCallback((date, curso) => {
    const inscriptionDate = parseDate(curso["Fecha inicio de inscripción"]);
    const courseDate = parseDate(curso["Fecha inicio del curso"]);
    const dateKey = date.format('YYYY-MM-DD');
    
    const inscriptionKey = inscriptionDate ? inscriptionDate.format('YYYY-MM-DD') : null;
    const courseKey = courseDate ? courseDate.format('YYYY-MM-DD') : null;

    // Si ambas fechas son iguales y coinciden con el día seleccionado
    if (inscriptionKey && courseKey && inscriptionKey === courseKey && inscriptionKey === dateKey) {
      return DATE_TYPES.BOTH;
    }
    
    // Si solo la fecha de inscripción coincide
    if (inscriptionKey === dateKey) {
      return DATE_TYPES.INSCRIPTION;
    }
    
    // Si solo la fecha de cursado coincide
    if (courseKey === dateKey) {
      return DATE_TYPES.COURSE;
    }
    
    return null;
  }, [parseDate]);

  // Genera los días del calendario
  const calendarDays = useMemo(() => {
    const year = currentDate.year();
    const month = currentDate.month();
    const firstDay = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`);
    const lastDay = firstDay.endOf('month');
    const startDate = firstDay.startOf('week');
    const endDate = lastDay.endOf('week');

    const days = [];
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return days;
  }, [currentDate]);

  const getTypeColor = (type) => {
    switch (type) {
      case DATE_TYPES.INSCRIPTION:
        return { bg: '#E3F2FD', dot: '#2196F3' };
      case DATE_TYPES.COURSE:
        return { bg: '#E8F5E9', dot: '#4CAF50' };
      case DATE_TYPES.BOTH:
        return { bg: '#F3E5F5', dot: '#9C27B0' };
      default:
        return { bg: 'transparent', dot: 'transparent' };
    }
  };

  const selectedDateCourses = selectedDate ? getCoursesForDate(selectedDate) : [];
  const isCurrentMonth = (date) => date.month() === currentDate.month();
  const isToday = (date) => date.isSame(dayjs(), 'day');
  const hasEvents = (date) => dateMap.has(date.format('YYYY-MM-DD'));
  const hasAnyData = filteredData.length > 0;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Grid container spacing={2}>
          {/* Calendario */}
          <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, background: 'linear-gradient(135deg, #F5F9FC 0%, #EEF4F9 100%)', borderRadius: 10 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton 
                onClick={handlePrevMonth} 
                sx={{ 
                  color: '#1976D2',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  minWidth: 200, 
                  textAlign: 'center',
                  color: '#1565C0',
                  textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {MONTH_NAMES[currentDate.month()]} {currentDate.year()}
              </Typography>
              <IconButton 
                onClick={handleNextMonth}
                sx={{ 
                  color: '#1976D2',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Leyenda */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3, 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              p: 2,
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2196F3' }} />
                <Typography variant="caption" sx={{ color: '#0D47A1', fontSize: '0.75rem', fontWeight: 600 }}>Inscripción</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                <Typography variant="caption" sx={{ color: '#0D47A1', fontSize: '0.75rem', fontWeight: 600 }}>Cursado</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#9C27B0' }} />
                <Typography variant="caption" sx={{ color: '#0D47A1', fontSize: '0.75rem', fontWeight: 600 }}>Inscripción y Cursado</Typography>
              </Box>
            </Box>

            {/* Nombres de días */}
            <Grid container spacing={0.5} sx={{ mb: 1 }}>
              {DAYS.map(day => (
                <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#0D47A1',
                      opacity: 1
                    }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Días del calendario */}
            <Grid container spacing={0.5}>
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate && day.isSame(selectedDate, 'day');
                const isCurrent = isCurrentMonth(day);
                const hasEvent = hasEvents(day);
                const _isToday = isToday(day);

                return (
                  <Grid item xs={12 / 7} key={idx}>
                    <Box
                      onClick={() => isCurrent && setSelectedDate(day)}
                      sx={{
                        aspectRatio: '1/1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#1976D2' : isCurrent ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.05)',
                        border: isSelected ? '2px solid #1976D2' : _isToday ? '2px solid #53aae0' : '1px solid rgba(25, 118, 210, 0.12)',
                        borderRadius: '10px',
                        cursor: isCurrent ? 'pointer' : 'default',
                        position: 'relative',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isCurrent ? 1 : 0.5,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isSelected ? '0 4px 12px rgba(25, 118, 210, 0.2)' : _isToday ? '0 4px 12px rgba(229, 57, 53, 0.15)' : 'none',
                        '&:hover': isCurrent ? {
                          backgroundColor: isCurrent && !isSelected ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.12)',
                          transform: 'scale(1.02)',
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)'
                        } : {}
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: _isToday || isSelected ? 700 : 500,
                          color: isSelected ? '#fff' : '#0D47A1',
                          fontSize: '0.95rem'
                        }}
                      >
                        {day.date()}
                      </Typography>
                      {hasEvent && isCurrent && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 6,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#899dac'
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
          {/* Panel de cursos */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                background: '#FAFBFC',
                border: '1px solid #E0E7FF',
                borderRadius: 10,
                overflow: 'hidden'
              }}
            >
              {selectedDate ? (
                <>
                  <Box sx={{ 
                    p: 2.5, 
                    background:'linear-gradient(135deg, #F5F9FC 0%, #EEF4F9 100%)',
                    color: '#0D47A1'
                  }}>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Seleccionado
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {selectedDate.format('D MMMM')}
                    </Typography>
                  </Box>

                  {selectedDateCourses.length > 0 ? (
                    <Box sx={{ 
                      flexGrow: 1, 
                      overflowY: 'auto',
                      p: 2,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#CBD5E1',
                        borderRadius: '3px',
                        '&:hover': {
                          background: '#94A3B8',
                        },
                      },
                    }}>
                      <Stack spacing={1.5}>
                        {selectedDateCourses.map((curso, idx) => {
                          const courseType = getCourseType(selectedDate, curso);
                          const typeColor = getTypeColor(courseType);

                          return (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                p: 2,
                                backgroundColor: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                                  transform: 'translateY(-2px)',
                                  borderColor: typeColor.dot,
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: typeColor.dot,
                                  flexShrink: 0,
                                  mt: 1,
                                  boxShadow: `0 0 8px ${typeColor.dot}33`
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: '#1F2937',
                                    mb: 0.5,
                                    lineHeight: 1.3
                                  }}
                                >
                                  {curso["Nombre del curso"]}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#6B7280',
                                    display: 'block'
                                  }}
                                >
                                  {curso["Código del curso"]}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        p: 3,
                        minHeight: 300
                      }}
                    >
                      <EventNoteIcon sx={{ fontSize: 64, mb: 3, opacity: 0.3, color: '#9CA3AF' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.95rem', color: '#0D47A1' }}>
                        No hay cursos para esta fecha
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Box sx={{ 
                    p: 2.5, 
                    background:'linear-gradient(135deg, #F5F9FC 0%, #EEF4F9 100%)',
                    color: '#0D47A1'
                  }}>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Seleccionado
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: '#CBD5E1' }}>
                      Ninguno
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      p: 3,
                      minHeight: 300
                    }}
                  >
                    <EventNoteIcon sx={{ fontSize: 64, mb: 3, opacity: 0.2 }} />
                    <Typography variant="body2" sx={{ textAlign: 'center' , color: '#0D47A1', fontWeight: 500 }}>
                      Selecciona un día del calendario para ver los cursos
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
  );
};

export default CronogramaCalendar;
