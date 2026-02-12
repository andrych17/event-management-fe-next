/**
 * Format datetime string to date only
 * @param datetime - ISO datetime string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDateTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format datetime string to time only (HH:MM)
 * @param datetime - ISO datetime string
 * @returns Formatted time string (e.g., "14:30")
 */
export const formatDateTimeToTime = (datetime: string) => {
  const date = new Date(datetime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format datetime string to full date and time
 * @param datetime - ISO datetime string
 * @returns Formatted date and time string (e.g., "Jan 15, 2024 14:30")
 */
export const formatFullDateTime = (datetime: string) => {
  const date = new Date(datetime);
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
};
