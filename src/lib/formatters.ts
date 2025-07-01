/**
 * Utility functions for formatting values
 */

/**
 * Formats a number to have at most one decimal place.
 * If the number is a whole number, it will not show any decimal places.
 * 
 * @param value - The number to format
 * @returns A string representation of the number with at most one decimal place
 */
export const formatNumber = (value: number): string => {
  // Handle potential NaN or invalid numbers
  if (isNaN(value) || !isFinite(value)) {
    return "0";
  }
  
  // Round to one decimal place
  const rounded = Math.round(value * 10) / 10;
  
  // Check if it's a whole number
  if (rounded === Math.floor(rounded)) {
    return Math.floor(rounded).toString();
  }
  
  // Return the number with one decimal place
  return rounded.toString();
};

/**
 * Formats a distance value (miles, kilometers, etc.) with one decimal place
 * 
 * @param value - The distance value to format
 * @param unit - Optional unit to append (e.g., 'mi', 'km')
 * @returns Formatted distance string
 */
export const formatDistance = (value: number, unit?: string): string => {
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * Formats a time value in minutes to a readable format
 * 
 * @param minutes - Time in minutes
 * @returns Formatted time string (e.g., "1.5 min" or "90 min")
 */
export const formatTime = (minutes: number): string => {
  return `${formatNumber(minutes)} min`;
};

/**
 * Formats a weight value with one decimal place
 * 
 * @param value - The weight value to format
 * @param unit - Optional unit to append (e.g., 'lbs', 'kg')
 * @returns Formatted weight string
 */
export const formatWeight = (value: number, unit?: string): string => {
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * Converts a Google Drive sharing URL to a direct image URL with CORS proxy
 * ONLY converts Google Drive URLs, and leaves all other URLs completely unchanged
 * 
 * @param url - The URL to check and potentially convert
 * @returns The proxied direct image URL if it's a Google Drive URL, or the original URL otherwise
 */
export const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  
  // If it's not a Google Drive URL, return it completely unchanged
  if (!url.includes('drive.google.com')) {
    return url;
  }
  
  // Only process Google Drive URLs below this point
  console.log("Converting Google Drive URL:", url);
  
  // Extract the file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format: /file/d/FILE_ID/view
  const filePathMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (filePathMatch && filePathMatch[1]) {
    fileId = filePathMatch[1];
  }
  
  // Format: id=FILE_ID
  if (!fileId) {
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }
  }
  
  // If we found a file ID, convert to direct URL
  if (fileId) {
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Proxy the URL to bypass CORS issues
    const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;
    console.log("Proxied Google Drive URL:", proxiedUrl);
    
    return proxiedUrl;
  }
  
  // If we couldn't extract a file ID, return the original URL
  return url;
};

/**
 * Formats a 24-hour time string (HH:mm) to a 12-hour format with AM/PM.
 * 
 * @param timeString - The time string to format (e.g., "14:30", "09:00")
 * @returns Formatted time string (e.g., "2:30 PM", "9:00 AM")
 */
export const formatTimeString = (timeString: string): string => {
  console.log('formatTimeString input:', timeString); // for debugging
  if (!timeString || !timeString.includes(':')) {
    return timeString; // Return as is if invalid or empty
  }

  const [hours, minutes] = timeString.split(':');
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  
  if (isNaN(h) || isNaN(m)) {
    return timeString; // Return original if parsing fails
  }
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  
  const formattedMinutes = m < 10 ? '0' + m : m;

  return `${h}:${formattedMinutes} ${ampm}`;
};

/**
 * Calculates calories burned during a workout using MET values
 * @param durationMinutes - Duration of the workout in minutes
 * @param weightKg - Weight of the person in kilograms
 * @param isCardio - Whether the exercise is cardio (true) or weightlifting (false)
 * @returns Calories burned during the workout
 */
export const calculateCalories = (durationMinutes: number, weightKg: number, isCardio: boolean): number => {
  // Convert duration to hours
  const durationHours = durationMinutes / 60;
  
  // MET values: weightlifting = 3.5, cardio = 6.0
  const met = isCardio ? 6.0 : 3.5;
  
  // Formula: Calories = MET × weight(kg) × duration(hours)
  return Math.round(met * weightKg * durationHours);
};

/**
 * Formats calories value with the 🔥 emoji
 * @param calories - The number of calories to format
 * @returns Formatted calories string with emoji
 */
export const formatCalories = (calories: number | null): string => {
  if (calories === null || isNaN(calories)) {
    return "🔥 --";
  }
  return `🔥 ${Math.round(calories)} cal`;
};
