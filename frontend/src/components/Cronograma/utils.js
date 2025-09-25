import dayjs from 'dayjs';
import { DATE_FORMATS_TO_TRY } from './constants';

export const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') return null;
  const trimmedDateStr = dateString.trim();
  for (const format of DATE_FORMATS_TO_TRY) {
    const d = dayjs(trimmedDateStr, format, true);
    if (d.isValid()) return d;
  }
  return null;
};

export const formatBooleanToSiNo = (value) => {
    if (value === true || value === 1) return 'Sí';
    if (value === false || value === 0) return 'No';
    return 'N/A';
};

export const formatValue = (value) => (value == null ? '' : String(value).trim());
