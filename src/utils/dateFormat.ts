/**
 * Format a date to a human-readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Format a date to show relative time (e.g. "2 days ago")
 * @param date The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  
  if (diffInSec < 60) {
    return 'just now';
  } else if (diffInMin < 60) {
    return `${diffInMin} ${diffInMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHour < 24) {
    return `${diffInHour} ${diffInHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDay < 7) {
    return `${diffInDay} ${diffInDay === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date);
  }
}

/**
 * Format a Unix timestamp to a date string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return formatDate(new Date(timestamp * 1000));
}

/**
 * Format a duration in seconds to a readable string (e.g. "2h 30m")
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}