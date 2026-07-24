export function calculateShiftValue(shiftType: string, startTimeIso: string, endTimeIso: string | null, settings: Record<string, string>): number {
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

  const prontoWeekday = parseFloat(settings.pronto_weekday || '1350');
  const prontoWeekend = parseFloat(settings.pronto_weekend || '1400');
  const utiWeekday = parseFloat(settings.uti_weekday || '1419');
  const utiWeekend = parseFloat(settings.uti_weekend || '1471');

  let fullShiftValue = 0;
  if (shiftType === 'UTI') {
    fullShiftValue = isWeekendOrFridayNight ? utiWeekend : utiWeekday;
  } else {
    // PRONTOCLINICA (or default)
    fullShiftValue = isWeekendOrFridayNight ? prontoWeekend : prontoWeekday;
  }

  // Calculate proportional value
  const shiftDuration = parseFloat(settings.shift_duration || '12');
  const hourlyRate = fullShiftValue / (shiftDuration > 0 ? shiftDuration : 12);
  
  const end = endTimeIso ? new Date(endTimeIso) : new Date(); // Use current time if shift is still active
  const hoursWorked = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

  return hourlyRate * hoursWorked;
}
