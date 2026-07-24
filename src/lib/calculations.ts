export function calculateShiftValue(
  shiftType: string, 
  startTimeIso: string, 
  endTimeIso: string | null, 
  settings: Record<string, string>,
  sectors?: { name: string; weekday_value: number; weekend_value: number }[]
): number {
  if (!startTimeIso) return 0;
  
  const start = new Date(startTimeIso);
  const dayOfWeek = start.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hour = start.getHours();

  // Define if it falls into "SEXTA(NOTURNO)- SAB E DOM"
  // Friday (5) after 19:00, Saturday (6), or Sunday (0)
  const isWeekendOrFridayNight = 
    dayOfWeek === 0 || 
    dayOfWeek === 6 || 
    (dayOfWeek === 5 && hour >= 19);

  let fullShiftValue = 0;

  if (sectors && sectors.length > 0) {
    // Find the sector
    // For fallback of old 'UTI' records, map them to 'UTI I'
    const searchType = shiftType === 'UTI' ? 'UTI I' : shiftType;
    const sector = sectors.find(s => s.name === searchType) || sectors[0]; // fallback to first sector if not found
    fullShiftValue = isWeekendOrFridayNight ? sector.weekend_value : sector.weekday_value;
  } else {
    // Legacy fallback using settings table
    const prontoWeekday = parseFloat(settings.pronto_weekday || '1350');
    const prontoWeekend = parseFloat(settings.pronto_weekend || '1400');
    const utiIWeekday = parseFloat(settings.uti_i_weekday || '1419');
    const utiIWeekend = parseFloat(settings.uti_i_weekend || '1471');
    const utiIiWeekday = parseFloat(settings.uti_ii_weekday || '1419');
    const utiIiWeekend = parseFloat(settings.uti_ii_weekend || '1471');

    if (shiftType === 'UTI_I') {
      fullShiftValue = isWeekendOrFridayNight ? utiIWeekend : utiIWeekday;
    } else if (shiftType === 'UTI_II') {
      fullShiftValue = isWeekendOrFridayNight ? utiIiWeekend : utiIiWeekday;
    } else if (shiftType === 'UTI') { // Fallback for old records
      fullShiftValue = isWeekendOrFridayNight ? utiIWeekend : utiIWeekday;
    } else {
      // PRONTOCLINICA (or default)
      fullShiftValue = isWeekendOrFridayNight ? prontoWeekend : prontoWeekday;
    }
  }

  // Calculate proportional value
  const shiftDuration = parseFloat(settings.shift_duration || '12');
  const hourlyRate = fullShiftValue / (shiftDuration > 0 ? shiftDuration : 12);
  
  const end = endTimeIso ? new Date(endTimeIso) : new Date(); // Use current time if shift is still active
  const hoursWorked = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

  return hourlyRate * hoursWorked;
}

